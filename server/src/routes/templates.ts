/**
 * templates.ts — Rota de listagem de templates
 */
import { FastifyInstance } from 'fastify';
import { supabase } from '../lib/supabase.js';

export async function templatesRoutes(app: FastifyInstance) {
  // GET /api/templates
  app.get('/api/templates', async (request, reply) => {
    const { categoria, ativo } = request.query as { categoria?: string; ativo?: string };

    let query = supabase
      .from('creative_templates')
      .select('*')
      .order('ordem_exibicao', { ascending: true });

    if (categoria) query = query.eq('categoria', categoria);
    if (ativo !== undefined) query = query.eq('ativo', ativo === 'true');

    const { data, error } = await query;
    if (error) return reply.status(500).send({ error: error.message });
    return reply.send({ templates: data ?? [] });
  });
}
