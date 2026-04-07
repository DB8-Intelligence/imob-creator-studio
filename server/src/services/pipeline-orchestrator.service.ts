/**
 * pipeline-orchestrator.service.ts — Orquestra o fluxo completo de um job
 *
 * Chamado assincronamente após criar o job. Atualiza status no Supabase a cada etapa.
 * Fluxo: validate → analyze → resolve colors → build vars → render (paralelo por formato)
 */
import { supabase } from '../lib/supabase.js';
import { analyzeCreative } from './image-analyzer.service.js';
import { resolveColors } from './color-resolver.service.js';
import { decideTemplate } from './template-decision.service.js';
import { buildVars } from './variable-resolver.service.js';
import { buildShotstackJson, renderWithWebhook, renderCreative, pollRender } from './shotstack.service.js';
import type { JobStatus, UserBrandProfile, ImageAnalysis, PipelineVars } from './types.js';

const USE_WEBHOOK = !!process.env.API_BASE_URL && process.env.NODE_ENV === 'production';

export async function runPipeline(jobId: string): Promise<void> {
  try {
    // 1. Buscar job
    const { data: job, error: jobErr } = await supabase
      .from('creative_jobs')
      .select('*')
      .eq('id', jobId)
      .single();
    if (jobErr || !job) throw new Error(`Job not found: ${jobId}`);

    // 2. Buscar user_brand_profile
    const { data: profile } = await supabase
      .from('user_brand_profiles')
      .select('*')
      .eq('user_id', job.user_id)
      .single();

    const userProfile: UserBrandProfile = profile ?? {
      id: '', user_id: job.user_id,
      nome_corretor: 'Corretor', whatsapp: '', cidade_atuacao: '',
      nicho: 'residencial', publico_alvo: 'geral', tom_comunicacao: 'amigavel',
      onboarding_completo: false, created_at: '', updated_at: '',
    };

    // 3. Validating
    await updateJobStatus(jobId, 'validating', 10);
    const inputImages = (job.input_images as string[]) ?? [];
    if (inputImages.length === 0) throw new Error('Nenhuma imagem fornecida');

    // 4. Analyze image
    await updateJobStatus(jobId, 'processing_image', 25);
    const analysis: ImageAnalysis = await analyzeCreative({
      image_url: inputImages[0],
      texto_bruto: job.user_description ?? '',
      user_profile: userProfile,
    });

    // Salvar análise
    await supabase
      .from('creative_jobs')
      .update({ analise_resultado: analysis as unknown as Record<string, unknown> })
      .eq('id', jobId);

    // 5. Template decision (se auto-select)
    if (!job.template_id) {
      const decision = decideTemplate(analysis, job.user_description ?? '');
      await supabase
        .from('creative_jobs')
        .update({
          auto_selected_template_id: decision.recommended_templates[0],
          auto_selected_style_id: decision.recommended_style,
          auto_selected_pipeline: decision.recommended_pipeline,
          decision_reason: decision.decision_reason,
          template_id: decision.recommended_templates[0],
        })
        .eq('id', jobId);
    }

    // 6. Resolve colors
    await updateJobStatus(jobId, 'generating_copy', 45);
    const palette = resolveColors(userProfile, analysis);

    // 7. Load template
    const templateId = job.template_id ?? 'dark_premium';
    const { data: templateRow } = await supabase
      .from('creative_templates')
      .select('shotstack_template')
      .eq('id', templateId)
      .single();

    const shotstackTemplate = (templateRow?.shotstack_template ?? {}) as Record<string, unknown>;

    // 8. Build vars + render for each format
    await updateJobStatus(jobId, 'composing', 60);
    const formats = (job.formats as string[]) ?? ['post', 'story', 'reels'];

    // Salvar vars resolvidas (usando primeiro formato como referência)
    const refVars = buildVars(analysis, palette, userProfile, inputImages[0], formats[0]);
    await supabase
      .from('creative_jobs')
      .update({ vars_resolvidas: refVars as unknown as Record<string, unknown> })
      .eq('id', jobId);

    // 9. Render
    await updateJobStatus(jobId, 'rendering', 75);

    const renderPromises = formats.map(async (formato) => {
      const vars: PipelineVars = buildVars(analysis, palette, userProfile, inputImages[0], formato);
      const json = buildShotstackJson(shotstackTemplate, vars);

      let renderId: string;
      let outputUrl: string | undefined;

      if (USE_WEBHOOK) {
        renderId = await renderWithWebhook(json, jobId, formato);
      } else {
        renderId = await renderCreative(json);
        outputUrl = await pollRender(renderId);
      }

      // Insert generated_creative
      await supabase.from('generated_creatives').insert({
        job_id: jobId,
        user_id: job.user_id,
        formato,
        shotstack_render_id: renderId,
        output_url: outputUrl ?? null,
        copy_instagram: analysis.copy.copy_instagram,
        copy_story: analysis.copy.copy_story,
        copy_whatsapp: analysis.copy.copy_whatsapp,
        template_id: templateId,
        status: outputUrl ? 'completed' : 'rendering',
      });

      return { formato, renderId, outputUrl };
    });

    const results = await Promise.allSettled(renderPromises);
    const allDone = results.every(
      (r) => r.status === 'fulfilled' && r.value.outputUrl
    );

    // 10. Finalize
    if (allDone || USE_WEBHOOK) {
      // When using webhooks, shotstack callback will set done
      if (!USE_WEBHOOK) {
        await updateJobStatus(jobId, 'done', 100);
      }
    } else {
      const failedFormats = results
        .filter((r) => r.status === 'rejected')
        .map((r) => (r as PromiseRejectedResult).reason?.message ?? 'unknown');
      throw new Error(`Render failed for: ${failedFormats.join(', ')}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Pipeline error';
    console.error(`[pipeline] Job ${jobId} failed:`, message);
    await updateJobStatus(jobId, 'error', 0, message);
  }
}

async function updateJobStatus(
  jobId: string,
  status: JobStatus,
  progress: number,
  error?: string
): Promise<void> {
  await supabase
    .from('creative_jobs')
    .update({
      status,
      progress,
      error_message: error ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);
}
