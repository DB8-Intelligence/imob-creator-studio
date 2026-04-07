/**
 * creative-jobs.ts — Rotas para criação e consulta de jobs
 */
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { runPipeline } from '../services/pipeline-orchestrator.service.js';

const createSchema = z.object({
  mode: z.enum(['form', 'assistant']),
  template_id: z.string().optional(),
  formats: z.array(z.string()).default(['post', 'story', 'reels']),
  variation_count: z.union([z.literal(1), z.literal(5)]).default(1),
  image_count: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(1),
  input_images: z.array(z.string()),
  logo_url: z.string().optional(),
  use_brand_identity: z.boolean().default(false),
  style_id: z.string().optional(),
  user_description: z.string(),
  generated_copy: z.record(z.unknown()).optional(),
  manual_copy: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function creativeJobsRoutes(app: FastifyInstance) {
  // POST /api/creative-jobs/create
  app.post('/api/creative-jobs/create', async (request, reply) => {
    const body = createSchema.parse(request.body);

    // TODO: extract user_id from auth header in production
    const userId = (request.headers['x-user-id'] as string) ?? '00000000-0000-0000-0000-000000000000';

    const { data: job, error } = await supabase
      .from('creative_jobs')
      .insert({
        user_id: userId,
        mode: body.mode,
        template_id: body.template_id ?? null,
        style_id: body.style_id ?? null,
        status: 'pending',
        progress: 0,
        formats: body.formats,
        variation_count: body.variation_count,
        image_count: body.image_count,
        input_images: body.input_images,
        logo_url: body.logo_url ?? null,
        use_brand_identity: body.use_brand_identity,
        user_description: body.user_description,
        generated_copy: body.generated_copy ?? {},
        manual_copy: body.manual_copy ?? {},
        metadata: body.metadata ?? {},
      })
      .select('id')
      .single();

    if (error) {
      return reply.status(500).send({ error: error.message });
    }

    // Disparar pipeline assíncrono (não aguardar)
    runPipeline(job.id).catch((err) => {
      console.error(`[pipeline] Background error for job ${job.id}:`, err);
    });

    return reply.status(201).send({ job_id: job.id, status: 'pending' });
  });

  // GET /api/creative-jobs/:id/status
  app.get('/api/creative-jobs/:id/status', async (request, reply) => {
    const { id } = request.params as { id: string };

    const { data: job, error } = await supabase
      .from('creative_jobs')
      .select('status, progress, error_message')
      .eq('id', id)
      .single();

    if (error || !job) {
      return reply.status(404).send({ error: 'Job not found' });
    }

    // Buscar formatos concluídos
    const { data: creatives } = await supabase
      .from('generated_creatives')
      .select('formato, status')
      .eq('job_id', id);

    const formatsDone = (creatives ?? [])
      .filter((c) => c.status === 'completed')
      .map((c) => c.formato);

    return reply.send({
      status: job.status,
      progress: job.progress,
      error_message: job.error_message,
      formats_done: formatsDone,
    });
  });

  // GET /api/creative-jobs/:id/result
  app.get('/api/creative-jobs/:id/result', async (request, reply) => {
    const { id } = request.params as { id: string };

    const { data: job } = await supabase
      .from('creative_jobs')
      .select('status')
      .eq('id', id)
      .single();

    if (!job || job.status !== 'done') {
      return reply.status(404).send({ error: 'Job not done yet' });
    }

    const { data: creatives } = await supabase
      .from('generated_creatives')
      .select('*')
      .eq('job_id', id)
      .order('created_at', { ascending: true });

    return reply.send({ creatives: creatives ?? [] });
  });
}
