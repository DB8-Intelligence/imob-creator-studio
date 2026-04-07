/**
 * webhooks.ts — Webhook handlers (Shotstack callback)
 */
import { FastifyInstance } from 'fastify';
import { supabase } from '../lib/supabase.js';

export async function webhooksRoutes(app: FastifyInstance) {
  // POST /api/webhooks/shotstack
  app.post('/api/webhooks/shotstack', async (request, reply) => {
    const { jobId, formato } = request.query as { jobId?: string; formato?: string };
    const body = request.body as Record<string, unknown>;
    const response = body.response as Record<string, unknown> | undefined;

    if (!response || !jobId) {
      return reply.status(400).send({ error: 'Missing response or jobId' });
    }

    const renderId = response.id as string;
    const status = response.status as string;
    const url = response.url as string | undefined;

    if (status === 'done' && url) {
      // Atualizar generated_creative
      await supabase
        .from('generated_creatives')
        .update({ output_url: url, status: 'completed' })
        .eq('shotstack_render_id', renderId);

      // Verificar se todos os formatos do job completaram
      const { data: creatives } = await supabase
        .from('generated_creatives')
        .select('status')
        .eq('job_id', jobId);

      const allDone = (creatives ?? []).every((c) => c.status === 'completed');

      if (allDone) {
        await supabase
          .from('creative_jobs')
          .update({ status: 'done', progress: 100, updated_at: new Date().toISOString() })
          .eq('id', jobId);
      }
    } else if (status === 'failed') {
      await supabase
        .from('generated_creatives')
        .update({ status: 'failed' })
        .eq('shotstack_render_id', renderId);

      await supabase
        .from('creative_jobs')
        .update({ status: 'error', error_message: `Render failed: ${renderId}`, updated_at: new Date().toISOString() })
        .eq('id', jobId);
    }

    return reply.send({ received: true });
  });
}
