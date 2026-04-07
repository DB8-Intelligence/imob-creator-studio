/**
 * onboarding.ts — Rotas de onboarding de marca
 */
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const brandSchema = z.object({
  user_id: z.string().uuid(),
  nome_corretor: z.string().min(1),
  nome_imobiliaria: z.string().optional(),
  creci: z.string().optional(),
  whatsapp: z.string(),
  instagram: z.string().optional(),
  cidade_atuacao: z.string(),
  nicho: z.enum(['residencial', 'comercial', 'luxo', 'lancamentos', 'rural']),
  publico_alvo: z.enum(['jovens', 'familias', 'investidores', 'alto_padrao', 'geral']),
  tom_comunicacao: z.enum(['formal', 'sofisticado', 'amigavel', 'urgente', 'aspiracional']),
  estilo_marca: z.string().optional(),
});

export async function onboardingRoutes(app: FastifyInstance) {
  // POST /api/onboarding/brand
  app.post('/api/onboarding/brand', async (request, reply) => {
    const body = brandSchema.parse(request.body);

    const { data, error } = await supabase
      .from('user_brand_profiles')
      .upsert({
        ...body,
        onboarding_completo: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) return reply.status(500).send({ error: error.message });
    return reply.send({ profile: data });
  });

  // POST /api/onboarding/logo-analyze
  app.post('/api/onboarding/logo-analyze', async (request, reply) => {
    const parts = request.parts();
    let logoBuffer: Buffer | null = null;
    let mimeType = 'image/png';
    let userId = '';

    for await (const part of parts) {
      if (part.type === 'file' && part.fieldname === 'logo') {
        logoBuffer = await part.toBuffer();
        mimeType = part.mimetype;
      }
      if (part.type === 'field' && part.fieldname === 'user_id') {
        userId = part.value as string;
      }
    }

    if (!logoBuffer || !userId) {
      return reply.status(400).send({ error: 'Missing logo file or user_id' });
    }

    // Upload to Supabase Storage
    const fileName = `logos/${userId}/${Date.now()}.png`;
    const { error: uploadErr } = await supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET ?? 'imobcreator-creatives')
      .upload(fileName, logoBuffer, { contentType: mimeType, upsert: true });

    if (uploadErr) {
      return reply.status(500).send({ error: `Upload failed: ${uploadErr.message}` });
    }

    const { data: urlData } = supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET ?? 'imobcreator-creatives')
      .getPublicUrl(fileName);

    const logoUrl = urlData.publicUrl;

    // Analyze colors via Claude Vision
    const base64 = logoBuffer.toString('base64');

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6-20250514',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType as 'image/png', data: base64 },
            },
            {
              type: 'text',
              text: `Analise esta logomarca e extraia as cores principais.
Retorne APENAS o JSON:
{
  "primaria": "#hex (cor dominante da logo)",
  "secundaria": "#hex (cor secundária ou complementar)",
  "neutra": "#hex (cor neutra: branco, preto ou cinza presente)",
  "fundo_preferido": "#hex (cor escura sugerida para fundo)",
  "estilo_detectado": "moderno|classico|minimalista|bold|elegante"
}`,
            },
          ],
        }],
      });

      const textBlock = response.content.find((b) => b.type === 'text');
      let jsonStr = textBlock?.type === 'text' ? textBlock.text.trim() : '{}';
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
      }
      const cores = JSON.parse(jsonStr);

      // Update profile
      await supabase
        .from('user_brand_profiles')
        .update({ logo_url: logoUrl, cores_marca: cores, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      return reply.send({ logo_url: logoUrl, cores });
    } catch (err) {
      // Logo uploaded but color extraction failed — still useful
      await supabase
        .from('user_brand_profiles')
        .update({ logo_url: logoUrl, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      return reply.send({ logo_url: logoUrl, cores: null, warning: 'Color extraction failed' });
    }
  });
}
