# PROMPT 2 — FRONTEND: WeWeb Components + Flows
# ATENÇÃO: Este frontend é WeWeb (no-code visual), NÃO React/Next.js
# Todos os componentes são Vue 3 compilados ou WeWeb workflows

---

Você está implementando o frontend do ImobCreator no WeWeb.
O backend já está rodando no Railway (Prompt 1 concluído).
Leia o CLAUDE.md antes de começar.

## O que o WeWeb precisa

O WeWeb não tem acesso ao filesystem — os "componentes" são:
1. Custom Elements (Vue 3 SFCs compilados via WeWeb plugin)
2. Workflows WeWeb (lógica visual de chamada de API)
3. Variáveis globais WeWeb (store de estado)
4. Fórmulas WeWeb (computed values)

Para este projeto: criar os Custom Elements como arquivos Vue 3 separados
que serão importados no WeWeb via plugin de componentes customizados.

---

## FASE 1 — Variáveis globais WeWeb

Documentar as variáveis globais que o WeWeb precisa ter configuradas:

```
user_profile       → objeto UserBrandProfile completo
current_job        → { id, status, progress, formats_done[] }
selected_template  → { id, nome, badge_tipo }
creator_mode       → 'form' | 'assistant'
creator_step       → 1 | 2 (etapa atual no formulário)
upload_images      → string[] (URLs após upload para Supabase)
upload_logo        → string (URL da logo após upload)
selected_formats   → string[] (ex: ['post','story'])
variation_count    → 1 | 5
image_count        → 1 | 2 | 3
user_description   → string (texto do campo "O que você vende?")
assistant_messages → array de mensagens do chat assistente
assistant_step     → string (etapa atual do assistente)
polling_interval   → referência do interval de status polling
```

---

## FASE 2 — Custom Elements Vue 3

Criar `src/weweb-components/` com os seguintes arquivos.
Cada arquivo é um Vue 3 SFC completo e independente.

### FormatSelectorCard.vue

Card clicável para seleção de formato.
Props: `format` (quadrado/feed/stories/paisagem), `ratio` (1:1/4:5/9:16/16:9),
       `selected` (boolean), `disabled` (boolean)
Emit: `select` com o formato
Visual: ícone SVG do formato, nome, ratio, borda roxa quando selecionado, checkmark

```vue
<template>
  <div
    class="format-card"
    :class="{ selected, disabled }"
    @click="!disabled && $emit('select', format)"
  >
    <div class="format-icon">
      <!-- SVG inline do formato -->
    </div>
    <span class="format-name">{{ formatLabel }}</span>
    <span class="format-ratio">{{ ratio }}</span>
    <div v-if="selected" class="check-badge">
      <svg><!-- checkmark --></svg>
    </div>
  </div>
</template>
```

### TemplateCard.vue

Card de template com nome, descrição, badge e coração.
Props: `template` (objeto), `selected` (boolean)
Emit: `select`
Visual: ícone colorido, nome bold, descrição 2 linhas, badge (Recomendado/Novo/Popular),
        coração de favorito, borda + check verde quando selecionado

### ProgressOverlay.vue

Overlay de processamento mostrado durante geração.
Props: `visible` (boolean), `progress` (0-100), `current_step` (string),
       `current_step_desc` (string), `steps_completed` (number)
Visual: fundo escuro blur, preview animado do criativo, 5 círculos de step
        (check verde = concluído, spinner = atual, cinza = pendente),
        label do step atual, barra de progresso com percentual e tempo estimado,
        dica rotativa a cada 4 segundos

```typescript
// Dicas rotativas:
const TIPS = [
  'Teste diferentes variações para melhores resultados',
  'Criativos com foto de qualidade convertem até 3x mais',
  'Adicione sua logo para reforçar o branding',
  'Story e Feed juntos aumentam o alcance',
  'Use o tema IA Express para campanhas de urgência',
];
```

### AssistantChat.vue

Componente de chat guiado para o modo Assistente IA.
Props: `messages` (array), `step` (string), `loading` (boolean)
Emit: `send-message`, `select-template`, `confirm-copy`, `edit-copy`, `regenerate`

Messages tem o formato:
```typescript
interface AssistantMessage {
  role: 'ia' | 'user';
  type: 'text' | 'template-chips' | 'copy-preview' | 'image-upload' | 'confirmation';
  content: string;
  templates?: Array<{ id: string; nome: string; badge?: string }>;
  copy?: { titulo: string; subtitulo: string; cta: string };
  timestamp: Date;
}
```

Visual: balões de chat, chips clicáveis de template quando type='template-chips',
        card de preview de copy quando type='copy-preview',
        botões "Gostei, continuar" / "Editar" / "Criar outra versão"

### LogoUploader.vue

Upload de logo com preview, posição e opacidade.
Props: `logo_url` (string), `saved_logos` (array)
Emit: `upload`, `select-saved`, `remove`
Visual: área de drop, logos salvas com thumbnail + posição + opacidade,
        botão "Adicionar outro logo"

### ImageUploader.vue

Upload de imagem do imóvel/corretor.
Props: `images` (string[]), `max_images` (1|2|3)
Emit: `upload`, `remove`, `swap`
Visual: área de drop pontilhada, preview com checkmark verde + botão X vermelho,
        ícone de swap (⟳) no canto inferior direito

---

## FASE 3 — State Machine do Assistente IA

Implementar como módulo TypeScript separado que o WeWeb usa via script global.
Criar `src/weweb-components/assistant-state-machine.ts`:

```typescript
export type AssistantStep =
  | 'welcome'
  | 'upload_image'
  | 'template_choice'
  | 'description'
  | 'copy_preview'
  | 'copy_confirm'
  | 'generating'
  | 'done';

export interface AssistantState {
  step: AssistantStep;
  messages: AssistantMessage[];
  selected_template?: string;
  uploaded_image?: string;
  user_description?: string;
  generated_copy?: object;
  job_id?: string;
}

export const ASSISTANT_FLOWS: Record<AssistantStep, {
  ia_message: string;
  next_on: Record<string, AssistantStep>;
}> = {
  welcome: {
    ia_message: 'Olá! Vamos criar um criativo incrível para o seu imóvel. Primeiro, envie a foto principal.',
    next_on: { image_uploaded: 'template_choice' }
  },
  upload_image: {
    ia_message: 'Pode enviar a foto do imóvel agora. JPG ou PNG, até 10MB.',
    next_on: { image_uploaded: 'template_choice' }
  },
  template_choice: {
    ia_message: 'Ótima foto! Qual estilo você prefere para esse criativo?',
    next_on: { template_selected: 'description' }
  },
  description: {
    ia_message: 'Agora me conta: o que você está vendendo ou qual mensagem quer transmitir?',
    next_on: { description_sent: 'copy_preview' }
  },
  copy_preview: {
    ia_message: 'Baseado no que você me contou, criei estes textos para o criativo:',
    next_on: {
      copy_confirmed: 'generating',
      copy_edit: 'copy_confirm',
      copy_regenerate: 'copy_preview'
    }
  },
  copy_confirm: {
    ia_message: 'Edite os textos abaixo como preferir:',
    next_on: { confirmed: 'generating' }
  },
  generating: {
    ia_message: 'Perfeito! Estou criando seu criativo agora. Isso leva cerca de 30 segundos.',
    next_on: { job_done: 'done' }
  },
  done: {
    ia_message: 'Pronto! Seu criativo está disponível em Minhas Criações.',
    next_on: {}
  }
};

export function transition(state: AssistantState, event: string): AssistantState {
  const flow = ASSISTANT_FLOWS[state.step];
  const next_step = flow.next_on[event];
  if (!next_step) return state;
  return { ...state, step: next_step };
}
```

---

## FASE 4 — Workflows WeWeb (documentação para configurar no WeWeb visual)

Documentar os seguintes workflows que precisam ser criados no WeWeb:

### workflow: onSubmitForm
Trigger: botão "Gerar criativo" no formulário
Steps:
1. Validar campos obrigatórios (image, template)
2. Chamar POST /api/creative-jobs/create com payload
3. Salvar job_id em variável global `current_job.id`
4. Navegar para tela de progresso
5. Iniciar polling de status (setInterval a cada 2s)

### workflow: pollJobStatus
Trigger: interval de 2 segundos
Steps:
1. GET /api/creative-jobs/{{current_job.id}}/status
2. Atualizar `current_job.status` e `current_job.progress`
3. Atualizar `ProgressOverlay` props
4. Se status === 'done': clearInterval, navegar para resultado
5. Se status === 'error': clearInterval, mostrar mensagem de erro

### workflow: onLogoUpload
Trigger: upload no LogoUploader
Steps:
1. Upload do arquivo para Supabase Storage via REST API
2. Chamar POST /api/onboarding/logo-analyze com base64
3. Salvar URL e cores retornadas em `user_profile.logo_url` e `user_profile.cores_marca`
4. Atualizar preview da logo

### workflow: onImageUpload
Trigger: upload no ImageUploader
Steps:
1. Upload para Supabase Storage (pasta uploads/)
2. Adicionar URL ao array `upload_images`
3. Atualizar preview

### workflow: assistantTransition
Trigger: eventos do AssistantChat
Steps:
1. Receber evento e payload
2. Chamar `transition()` da state machine
3. Atualizar `assistant_step` e `assistant_messages`
4. Se step === 'copy_preview': chamar API para gerar copy preview
5. Se step === 'generating': chamar workflow onSubmitForm adaptado

---

## FASE 5 — Páginas WeWeb (estrutura das páginas)

Documentar estrutura para criar no WeWeb visual:

### /criar (Criar Criativo)
```
Header:
  Tabs: [Assistente IA] [Formulário] ← toggle creator_mode

Se creator_mode === 'form':
  Stepper: [1 Foto] ──── [2 Textos]
  
  Etapa 1 (creator_step === 1):
    Seção "Formatos do criativo" (máx 3)
      Grid 4 cols: FormatSelectorCard × 4
      Texto: "X formatos selecionados (1 crédito)"
    
    Seção "Quantos criativos gerar?"
      Grid 2 cols:
        Card "1 Criativo — 1 crédito" com radio
        Card "5 Criativos — 5 créditos" com badge "5 variações"
    
    Seção "Quantas imagens usar?"
      Grid 3 cols: Card "1 Imagem" / "2 Imagens" / "3 Imagens"
    
    Seção "Sua Imagem *"
      ImageUploader (dinâmico com base em image_count)
    
    Seção "Logo" (collapsible)
      LogoUploader
      Toggle "Usar identidade visual personalizada"
    
    Seção "Escolha o tema"
      Filter tabs: TOP Temas | Novos | Todos | Favoritos | Imobiliário | Vendas | Mais ˅
      Grid 3 cols: TemplateCard × templates
      Botão "Ver mais X temas" se > 6
    
    Footer fixo:
      Botão "Avançar para o texto →" (ativo se image + template selecionados)
  
  Etapa 2 (creator_step === 2):
    Card "O que você está vendendo?" com badge "IA"
      Textarea com placeholder
      Botão "Deixar a IA escrever"
      Texto "A IA cria textos prontos para vender seu produto"
    
    Divisor "ou preencha manualmente"
    
    Campos manuais:
      Título principal * (obrigatório)
      Subtítulo
      CTA
      Badge de urgência
    
    Footer fixo:
      Botão "← Voltar" + Botão "Gerar criativo ✦"

Se creator_mode === 'assistant':
  AssistantChat (full height)
  Footer com input de texto do usuário

ProgressOverlay (visible quando current_job.status !== idle)
```

### /minhas-criacoes (Biblioteca)
```
Header: "Minhas Criações (N)"
Grid de cards: thumbnail + template_nome + data + botões (download, compartilhar, refazer)
```

### /admin/agentes (Admin — Agentes)
```
Botão "Novo Agente"
Modal de cadastro:
  Nome, Descrição, Prompt Master (textarea grande), Tipo de função
  Botão "Assimilar e cadastrar"
  Preview da classificação automática
Lista de agentes com status ativo/inativo, categoria, stage
```

---

## Regras específicas WeWeb

1. Toda chamada de API usa o plugin "REST API" do WeWeb ou fetch em custom actions
2. Upload de arquivo usa Supabase Storage REST API diretamente (não SDK)
3. Polling usa setInterval em script global, não setTimeout recursivo
4. O ProgressOverlay NUNCA bloqueia a navegação — é um overlay transparente a cliques
5. Resultado NÃO aparece na tela do formulário — redireciona para /minhas-criacoes
6. O assistente NÃO deve expor a lógica de template — a escolha é apresentada como
   "sugestão natural", não como decisão técnica visível
7. Usar Supabase Realtime como alternativa ao polling para status do job
   (subscribe na tabela creative_jobs filtrado por job_id)
