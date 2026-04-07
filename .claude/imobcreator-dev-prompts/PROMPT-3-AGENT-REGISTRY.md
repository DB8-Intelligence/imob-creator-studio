# PROMPT 3 — AGENT REGISTRY + PROMPT ASSIMILATION ENGINE
# Implementar APÓS Prompt 1 e 2 estarem funcionando

---

Você está implementando o Agent Registry dinâmico do ImobCreator.
O banco já tem as tabelas agent_registry, agent_versions, agent_bindings, agent_execution_logs.
Os serviços base já existem em src/services/.
Leia o CLAUDE.md antes de começar.

## OBJETIVO

Criar um sistema onde qualquer novo comportamento de IA pode ser adicionado ao pipeline
apenas colando um prompt. O sistema interpreta, classifica, registra e ativa automaticamente.

## FASE 1 — Serviço de assimilação de prompt

Atualizar `src/services/prompt-assimilation.service.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CLASSIFICATION_PROMPT = `Você é um classificador de agentes de IA para um sistema de geração de criativos imobiliários.

Receberá um prompt de agente e deve extrair e retornar APENAS este JSON, sem texto adicional:

{
  "slug": "string (snake_case, único, descritivo — ex: dark_premium_analyzer)",
  "name": "string (nome amigável)",
  "category": "copy|visual|branding|composicao|validacao|publicacao|analytics|roteamento|template_decision",
  "pipeline_stage": "input_collection|image_analysis|branding_analysis|template_decision|copy_generation|image_restyling|composition|rendering|validation|publication|analytics",
  "trigger_mode": "always|conditional|manual",
  "input_schema": {
    "required": ["campo1", "campo2"],
    "optional": ["campo3"],
    "types": { "campo1": "string", "campo2": "object" }
  },
  "output_schema": {
    "fields": ["resultado1", "resultado2"],
    "types": { "resultado1": "string", "resultado2": "object" }
  },
  "is_async": false,
  "applies_to_flows": ["form", "assistant", "both"],
  "execution_order": 10,
  "reasoning": "string (1 frase explicando a classificação)"
}

REGRAS DE CLASSIFICAÇÃO:
- "analisa foto" / "detecta tipo de imóvel" / "avalia qualidade" → image_analysis
- "extrai cores" / "analisa logo" / "detecta paleta" → branding_analysis
- "escolhe template" / "decide estilo" / "recomenda visual" → template_decision
- "gera título" / "cria copy" / "escreve legenda" → copy_generation
- "reestiliza" / "muda estilo da foto" / "dark premium" / "transforma imagem" → image_restyling
- "monta composição" / "aplica overlay" / "posiciona elementos" → composition
- "renderiza" / "gera PNG" / "exporta" → rendering
- "valida" / "verifica" / "checa" → validation
- Execution order: image_analysis=10, branding_analysis=20, template_decision=30,
  copy_generation=40, image_restyling=50, composition=60, rendering=70, validation=80`;

export async function assimilateAgentPrompt(params: {
  name: string;
  description: string;
  prompt_master: string;
}): Promise<AssimilationResult> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: `Nome: ${params.name}\nDescrição: ${params.description}\nPrompt: ${params.prompt_master}`
    }],
    system: CLASSIFICATION_PROMPT
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
  
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    // fallback seguro se parse falhar
    return {
      slug: params.name.toLowerCase().replace(/\s+/g, '_'),
      category: 'visual',
      pipeline_stage: 'image_analysis',
      trigger_mode: 'manual',
      input_schema: { required: [], optional: [], types: {} },
      output_schema: { fields: [], types: {} },
      is_async: false,
      applies_to_flows: 'both',
      execution_order: 99,
      reasoning: 'Classificação automática falhou — revisão manual necessária'
    };
  }
}
```

## FASE 2 — Service de criação de agente completo

Criar `src/services/agent-registry.service.ts`:

```typescript
export async function createAgent(params: {
  name: string;
  description: string;
  prompt_master: string;
}): Promise<AgentRegistryRecord> {

  // 1. Assimilar prompt → obter classificação
  const classification = await assimilateAgentPrompt(params);

  // 2. Criar registro em agent_registry
  const { data: agent } = await supabase
    .from('agent_registry')
    .insert({
      slug: classification.slug,
      name: params.name,
      description: params.description,
      prompt_master: params.prompt_master,
      category: classification.category,
      input_schema: classification.input_schema,
      output_schema: classification.output_schema,
      pipeline_stage: classification.pipeline_stage,
      trigger_mode: classification.trigger_mode,
      active: true,
      version: 1
    })
    .select()
    .single();

  // 3. Criar primeira versão em agent_versions
  await supabase
    .from('agent_versions')
    .insert({
      agent_id: agent.id,
      version: 1,
      prompt_master: params.prompt_master,
      config_json: classification
    });

  // 4. Criar binding padrão em agent_bindings
  const flow_type = classification.applies_to_flows === 'both' ? 'both'
    : classification.applies_to_flows.includes('form') ? 'form' : 'assistant';

  await supabase
    .from('agent_bindings')
    .insert({
      agent_id: agent.id,
      flow_type,
      stage_name: classification.pipeline_stage,
      execution_order: classification.execution_order,
      condition_json: {},
      active: true
    });

  return agent;
}

export async function getActiveAgentsForStage(
  stage: string,
  flow_type: 'form' | 'assistant'
): Promise<AgentWithBinding[]> {
  const { data } = await supabase
    .from('agent_bindings')
    .select(`
      execution_order,
      condition_json,
      agent_registry (
        id, slug, name, prompt_master, category, input_schema, output_schema, active
      )
    `)
    .eq('stage_name', stage)
    .in('flow_type', [flow_type, 'both'])
    .eq('active', true)
    .order('execution_order', { ascending: true });

  return data ?? [];
}

export async function logAgentExecution(params: {
  agent_id: string;
  job_id: string;
  stage_name: string;
  input_payload: object;
  output_payload: object;
  status: 'success' | 'error' | 'skipped';
  duration_ms: number;
  error?: string;
}): Promise<void> {
  await supabase.from('agent_execution_logs').insert(params);
}
```

## FASE 3 — Integrar agentes no pipeline

Atualizar `src/services/pipeline-orchestrator.service.ts` para consultar agentes ativos:

```typescript
// Em cada etapa do pipeline, verificar agentes registrados:

async function runStage(
  stage: string,
  job: CreativeJob,
  context: PipelineContext,
  flow_type: 'form' | 'assistant'
): Promise<PipelineContext> {

  const agents = await getActiveAgentsForStage(stage, flow_type);

  for (const binding of agents) {
    const agent = binding.agent_registry;
    const start = Date.now();

    try {
      // Verificar condição se existir
      if (binding.condition_json && !evaluateCondition(binding.condition_json, context)) {
        await logAgentExecution({
          agent_id: agent.id,
          job_id: job.id,
          stage_name: stage,
          input_payload: context,
          output_payload: {},
          status: 'skipped',
          duration_ms: 0
        });
        continue;
      }

      // Executar agente via Claude
      const output = await executeAgent(agent, context);

      // Mesclar output no context
      context = { ...context, ...output };

      await logAgentExecution({
        agent_id: agent.id,
        job_id: job.id,
        stage_name: stage,
        input_payload: context,
        output_payload: output,
        status: 'success',
        duration_ms: Date.now() - start
      });

    } catch (error) {
      await logAgentExecution({
        agent_id: agent.id,
        job_id: job.id,
        stage_name: stage,
        input_payload: context,
        output_payload: {},
        status: 'error',
        duration_ms: Date.now() - start,
        error: String(error)
      });
      // Não quebrar pipeline por agente com erro — logar e continuar
    }
  }

  return context;
}

async function executeAgent(
  agent: AgentRegistryRecord,
  context: PipelineContext
): Promise<Record<string, unknown>> {
  // Agentes de análise visual precisam de imagem → usar claude-sonnet-4-6
  // Outros agentes → claude-haiku-4-5

  const needsVision = ['image_analysis', 'branding_analysis'].includes(agent.pipeline_stage);
  const model = needsVision ? 'claude-sonnet-4-6' : 'claude-haiku-4-5';

  const messages: Anthropic.MessageParam[] = [];

  if (needsVision && context.imagem_url) {
    messages.push({
      role: 'user',
      content: [
        { type: 'image', source: { type: 'url', url: context.imagem_url } },
        { type: 'text', text: buildAgentInput(agent, context) }
      ]
    });
  } else {
    messages.push({
      role: 'user',
      content: buildAgentInput(agent, context)
    });
  }

  const response = await client.messages.create({
    model,
    max_tokens: 1500,
    system: agent.prompt_master,
    messages
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

function buildAgentInput(agent: AgentRegistryRecord, context: PipelineContext): string {
  // Extrair apenas os campos que o agente precisa conforme input_schema
  const required = agent.input_schema?.required ?? [];
  const relevant = Object.fromEntries(
    required.map(key => [key, (context as any)[key]])
  );
  return `Contexto do job:\n${JSON.stringify(relevant, null, 2)}\n\nRetorne APENAS JSON, sem texto adicional.`;
}
```

## FASE 4 — Motor de templates automático

Atualizar `src/services/template-decision.service.ts` com classificador completo:

```typescript
export async function classifyInput(params: {
  image_analysis: ImageAnalysis;
  user_description: string;
  formats: string[];
  user_profile: UserBrandProfile;
}): Promise<TemplateDecision> {

  const { image_analysis: ia, user_description, user_profile } = params;

  // REGRAS DE DECISÃO (ordem de prioridade):

  // 1. Tem pessoa + exterior → autoridade_expert ou ia_imobiliario
  if (ia.imovel.tem_pessoa && ia.imovel.ambiente === 'externo') {
    return buildDecision('ia_imobiliario', 'autoridade', 'Foto de corretor detectada — campanha de autoridade recomendada');
  }

  // 2. Texto com urgência → ia_express
  const urgencyWords = ['urgente','últimas','oportunidade','últimas unidades','imperdível','só hoje','prazo'];
  if (urgencyWords.some(w => user_description.toLowerCase().includes(w))) {
    return buildDecision('ia_express', 'urgencia', 'Urgência detectada no texto — template de alta conversão');
  }

  // 3. Nicho luxo + luminosidade escura → dark_premium
  if (user_profile.nicho === 'luxo' || ia.imovel.luminosidade === 'escura') {
    return buildDecision('dark_premium', 'exclusividade', 'Imóvel de luxo ou foto escura — Dark Premium ideal');
  }

  // 4. Qualidade alta + ambiente interno + contraste alto → expert_photoshop (glass)
  if (ia.imovel.qualidade_foto === 'alta' && ia.imovel.ambiente === 'interno' && ia.imovel.contraste === 'alto') {
    return buildDecision('expert_photoshop', 'aspiracional', 'Foto de alta qualidade — Glass Morphism Premium');
  }

  // 5. Texto educativo → ia_imobiliario
  const educationalWords = ['dicas','erros','como','guia','aprenda','descubra','saiba'];
  if (educationalWords.some(w => user_description.toLowerCase().includes(w))) {
    return buildDecision('ia_imobiliario', 'educativo', 'Conteúdo educativo detectado — campanha conceitual');
  }

  // 6. Nicho lançamentos → imobiliario_top
  if (user_profile.nicho === 'lancamentos') {
    return buildDecision('imobiliario_top', 'aspiracional', 'Lançamento — design vibrante e dinâmico');
  }

  // DEFAULT
  return buildDecision('dark_premium', 'exclusividade', 'Template padrão de alto desempenho');
}

function buildDecision(
  template_id: string,
  mood: string,
  reason: string
): TemplateDecision {
  return {
    recommended_templates: [template_id],
    recommended_style: template_id,
    recommended_copy_mode: 'ia',
    recommended_pipeline: { analise_claude: true, reestilizacao_flux: false, composicao_shotstack: true },
    decision_reason: reason,
    campaign_goal: mood,
    luxury_level: template_id === 'dark_premium' || template_id === 'luxo_dourado' ? 'ultra' : 'premium',
    image_type: 'imovel',
    composition_type: 'background_photo'
  };
}
```

## FASE 5 — Rotas de admin para agentes

Adicionar em `src/routes/agents.ts`:

```typescript
// POST /api/agents/create → criar novo agente via prompt
// GET  /api/agents → listar todos os agentes com bindings
// PUT  /api/agents/:id/toggle → ativar/desativar agente
// PUT  /api/agents/:id/prompt → atualizar prompt (cria nova versão)
// GET  /api/agents/:id/logs → logs de execução do agente
// GET  /api/agents/:id/versions → histórico de versões
```

## FASE 6 — Seed de agentes iniciais hardcoded

Criar `supabase/seed/agents.sql` com os 5 agentes base que o sistema já usa:

```sql
-- Agente 1: Analisador de Imagem
INSERT INTO agent_registry (slug, name, description, prompt_master, category, pipeline_stage, trigger_mode, active, version)
VALUES (
  'image_analyzer',
  'Analisador de Imagem',
  'Analisa foto de imóvel: tipo, ambiente, luminosidade, cores, zona de texto',
  '[PROMPT COMPLETO DO image-analyzer.service.ts]',
  'visual', 'image_analysis', 'always', true, 1
);

-- Agente 2: Gerador de Copy
INSERT INTO agent_registry (slug, name, description, prompt_master, category, pipeline_stage, trigger_mode, active, version)
VALUES (
  'copy_generator',
  'Gerador de Copy',
  'Gera título, subtítulo, CTA, badge e legenda Instagram a partir do texto do usuário',
  '[PROMPT COMPLETO DO copy section do unified-prompt]',
  'copy', 'copy_generation', 'always', true, 1
);

-- Agente 3: Extrator de Cores de Logo
INSERT INTO agent_registry (slug, name, description, prompt_master, category, pipeline_stage, trigger_mode, active, version)
VALUES (
  'logo_color_extractor',
  'Extrator de Cores de Logo',
  'Analisa logomarca e extrai paleta primária, secundária, neutra e fundo harmonioso',
  '[PROMPT DO logo-analyzer.service.ts]',
  'branding', 'branding_analysis', 'conditional', true, 1
);

-- Agente 4: Seletor de Template
INSERT INTO agent_registry (slug, name, description, prompt_master, category, pipeline_stage, trigger_mode, active, version)
VALUES (
  'template_selector',
  'Seletor de Template',
  'Decide automaticamente o melhor template baseado na imagem e texto do usuário',
  '[PROMPT DO template-decision.service.ts]',
  'template_decision', 'template_decision', 'conditional', true, 1
);

-- Agente 5: Builder de Composição
INSERT INTO agent_registry (slug, name, description, prompt_master, category, pipeline_stage, trigger_mode, active, version)
VALUES (
  'composition_builder',
  'Builder de Composição',
  'Monta o JSON final do Shotstack com todas as variáveis resolvidas',
  '[PROMPT DO shotstack-builder.service.ts]',
  'composicao', 'composition', 'always', true, 1
);

-- Bindings para cada agente
INSERT INTO agent_bindings (agent_id, flow_type, stage_name, execution_order, active)
SELECT id, 'both', 'image_analysis', 10, true FROM agent_registry WHERE slug = 'image_analyzer';

INSERT INTO agent_bindings (agent_id, flow_type, stage_name, execution_order, active)
SELECT id, 'both', 'copy_generation', 40, true FROM agent_registry WHERE slug = 'copy_generator';

INSERT INTO agent_bindings (agent_id, flow_type, stage_name, execution_order, condition_json, active)
SELECT id, 'both', 'branding_analysis', 20, '{"requires": "logo_url"}', true FROM agent_registry WHERE slug = 'logo_color_extractor';

INSERT INTO agent_bindings (agent_id, flow_type, stage_name, execution_order, condition_json, active)
SELECT id, 'both', 'template_decision', 30, '{"requires": "auto_select"}', true FROM agent_registry WHERE slug = 'template_selector';

INSERT INTO agent_bindings (agent_id, flow_type, stage_name, execution_order, active)
SELECT id, 'both', 'composition', 60, true FROM agent_registry WHERE slug = 'composition_builder';
```

---

## Exemplo de uso: cadastrar novo agente via prompt

Quando você (Douglas) quiser adicionar um novo comportamento:

```
POST /api/agents/create
{
  "name": "Analisador de Estilo Premium",
  "description": "Decide se a foto precisa de reestilização dark premium, clean premium ou autoridade visual",
  "prompt_master": "Você é um agente especialista em analisar a foto enviada pelo corretor e decidir se ela precisa de reestilização dark premium, clean premium ou autoridade visual. Analise: luminosidade, contraste, ambiente, presença de pessoa, qualidade. Retorne JSON: { 'style_decision': string, 'needs_restyling': boolean, 'restyling_prompt': string, 'reason': string }"
}
```

O sistema vai:
1. Classificar como `visual` / `image_restyling`
2. Criar registro com versão 1
3. Criar binding para os dois fluxos
4. Ativar para próximos jobs automaticamente
