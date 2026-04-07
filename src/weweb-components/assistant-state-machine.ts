/**
 * assistant-state-machine.ts — State machine do Assistente IA
 *
 * Importado como script global no WeWeb.
 * Controla o fluxo de conversa guiada para criação de criativos.
 *
 * Uso no WeWeb:
 *   const { transition, createInitialState, ASSISTANT_FLOWS } = window.AssistantStateMachine;
 *   let state = createInitialState();
 *   state = transition(state, 'image_uploaded');
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type AssistantStep =
  | 'welcome'
  | 'upload_image'
  | 'template_choice'
  | 'description'
  | 'copy_preview'
  | 'copy_confirm'
  | 'generating'
  | 'done';

export interface AssistantMessage {
  role: 'ia' | 'user';
  type: 'text' | 'template-chips' | 'copy-preview' | 'image-upload' | 'confirmation';
  content: string;
  templates?: Array<{ id: string; nome: string; badge?: string }>;
  copy?: { titulo: string; subtitulo: string; cta: string };
  timestamp: string;
}

export interface AssistantState {
  step: AssistantStep;
  messages: AssistantMessage[];
  selected_template?: string;
  uploaded_image?: string;
  user_description?: string;
  generated_copy?: { titulo: string; subtitulo: string; cta: string };
  job_id?: string;
}

// ─── Flow definitions ────────────────────────────────────────────────────────

export const ASSISTANT_FLOWS: Record<AssistantStep, {
  ia_message: string;
  next_on: Record<string, AssistantStep>;
}> = {
  welcome: {
    ia_message: 'Olá! Vamos criar um criativo incrível para o seu imóvel. Primeiro, envie a foto principal.',
    next_on: { image_uploaded: 'template_choice' },
  },
  upload_image: {
    ia_message: 'Pode enviar a foto do imóvel agora. JPG ou PNG, até 10MB.',
    next_on: { image_uploaded: 'template_choice' },
  },
  template_choice: {
    ia_message: 'Ótima foto! Qual estilo você prefere para esse criativo?',
    next_on: { template_selected: 'description' },
  },
  description: {
    ia_message: 'Agora me conta: o que você está vendendo ou qual mensagem quer transmitir?',
    next_on: { description_sent: 'copy_preview' },
  },
  copy_preview: {
    ia_message: 'Baseado no que você me contou, criei estes textos para o criativo:',
    next_on: {
      copy_confirmed: 'generating',
      copy_edit: 'copy_confirm',
      copy_regenerate: 'copy_preview',
    },
  },
  copy_confirm: {
    ia_message: 'Edite os textos abaixo como preferir:',
    next_on: { confirmed: 'generating' },
  },
  generating: {
    ia_message: 'Perfeito! Estou criando seu criativo agora. Isso leva cerca de 30 segundos.',
    next_on: { job_done: 'done' },
  },
  done: {
    ia_message: 'Pronto! Seu criativo está disponível em Minhas Criações. 🎉',
    next_on: {},
  },
};

// ─── Functions ───────────────────────────────────────────────────────────────

export function createInitialState(): AssistantState {
  const firstFlow = ASSISTANT_FLOWS.welcome;
  return {
    step: 'welcome',
    messages: [
      {
        role: 'ia',
        type: 'text',
        content: firstFlow.ia_message,
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

export function transition(
  state: AssistantState,
  event: string,
  payload?: Record<string, unknown>
): AssistantState {
  const flow = ASSISTANT_FLOWS[state.step];
  const nextStep = flow.next_on[event];
  if (!nextStep) return state;

  const newState = { ...state, step: nextStep };
  const nextFlow = ASSISTANT_FLOWS[nextStep];

  // Add IA message for the new step
  const iaMessage: AssistantMessage = {
    role: 'ia',
    type: 'text',
    content: nextFlow.ia_message,
    timestamp: new Date().toISOString(),
  };

  // Enrich message based on step
  if (nextStep === 'template_choice' && payload?.templates) {
    iaMessage.type = 'template-chips';
    iaMessage.templates = payload.templates as AssistantMessage['templates'];
  }

  if (nextStep === 'copy_preview' && payload?.copy) {
    iaMessage.type = 'copy-preview';
    iaMessage.copy = payload.copy as AssistantMessage['copy'];
    newState.generated_copy = payload.copy as AssistantState['generated_copy'];
  }

  // Store payload data in state
  if (event === 'image_uploaded' && payload?.image_url) {
    newState.uploaded_image = payload.image_url as string;
  }
  if (event === 'template_selected' && payload?.template_id) {
    newState.selected_template = payload.template_id as string;
  }
  if (event === 'description_sent' && payload?.description) {
    newState.user_description = payload.description as string;
  }
  if (event === 'job_done' && payload?.job_id) {
    newState.job_id = payload.job_id as string;
  }

  newState.messages = [...state.messages, iaMessage];
  return newState;
}

export function addUserMessage(state: AssistantState, content: string, type: AssistantMessage['type'] = 'text'): AssistantState {
  return {
    ...state,
    messages: [
      ...state.messages,
      {
        role: 'user',
        type,
        content,
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

// ─── Export for WeWeb global script ──────────────────────────────────────────

if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).AssistantStateMachine = {
    ASSISTANT_FLOWS,
    createInitialState,
    transition,
    addUserMessage,
  };
}
