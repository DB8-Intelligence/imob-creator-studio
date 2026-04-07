/**
 * agents.ts — Rotas de gerenciamento de agentes
 */
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { assimilateAgentPrompt } from '../services/prompt-assimilation.service.js';

const createAgentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(''),
  prompt_master: z.string().min(10),
});

export async function agentsRoutes(app: FastifyInstance) {
  // POST /api/agents/create
  app.post('/api/agents/create', async (request, reply) => {
    const body = createAgentSchema.parse(request.body);

    // 1. Assimilar prompt → classificação automática
    const classification = await assimilateAgentPrompt(body);

    // 2. Criar agent_registry
    const { data: agent, error: agentErr } = await supabase
      .from('agent_registry')
      .insert({
        slug: classification.slug,
        name: body.name,
        description: body.description,
        prompt_master: body.prompt_master,
        category: classification.category,
        input_schema: classification.input_schema,
        output_schema: classification.output_schema,
        pipeline_stage: classification.pipeline_stage,
        trigger_mode: classification.trigger_mode,
        active: true,
        version: 1,
      })
      .select()
      .single();

    if (agentErr) return reply.status(500).send({ error: agentErr.message });

    // 3. Criar primeira versão
    await supabase.from('agent_versions').insert({
      agent_id: agent.id,
      version: 1,
      prompt_master: body.prompt_master,
      config_json: { classification },
    });

    // 4. Criar binding padrão
    await supabase.from('agent_bindings').insert({
      agent_id: agent.id,
      flow_type: 'both',
      stage_name: classification.pipeline_stage,
      execution_order: 0,
      active: true,
    });

    return reply.status(201).send({
      agent,
      classification,
    });
  });
}
