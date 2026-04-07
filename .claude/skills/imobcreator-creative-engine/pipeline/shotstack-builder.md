# Shotstack Builder — Montagem e Render

## Como funciona o Shotstack no pipeline

O Shotstack é o engine de composição final. Ele recebe um JSON de timeline
com as camadas (foto, overlays, textos, logo, botões) e renderiza o PNG final.

## Service de render

```typescript
// src/services/render/shotstack.service.ts

import axios from 'axios';

const SHOTSTACK_API = 'https://api.shotstack.io/edit/v1';
const API_KEY = process.env.SHOTSTACK_API_KEY;

export async function renderCreative(
  templateJson: object,
  formato: 'post' | 'story' | 'reels'
): Promise<string> { // retorna render ID

  const response = await axios.post(
    `${SHOTSTACK_API}/render`,
    templateJson,
    {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.response.id;
}

export async function pollRender(renderId: string): Promise<string> { // retorna URL
  const maxAttempts = 30;
  const intervalMs = 3000;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, intervalMs));

    const response = await axios.get(
      `${SHOTSTACK_API}/render/${renderId}`,
      { headers: { 'x-api-key': API_KEY } }
    );

    const status = response.data.response.status;

    if (status === 'done') {
      return response.data.response.url;
    }

    if (status === 'failed') {
      throw new Error(`Shotstack render failed: ${renderId}`);
    }
    // status: 'queued' | 'fetching' | 'rendering' | 'saving' → continua polling
  }

  throw new Error(`Render timeout: ${renderId}`);
}

// Para webhook (preferido em produção — evita polling)
export async function renderWithWebhook(
  templateJson: object,
  jobId: string
): Promise<string> {
  const webhookUrl = `${process.env.API_BASE_URL}/api/webhooks/shotstack?jobId=${jobId}`;

  const payload = {
    ...templateJson,
    callback: webhookUrl
  };

  const response = await axios.post(
    `${SHOTSTACK_API}/render`,
    payload,
    { headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' } }
  );

  return response.data.response.id;
}
```

## Builder — monta o JSON da timeline a partir do template + vars

```typescript
// src/services/render/shotstack-builder.service.ts

export function buildShotstackJson(
  template: TemplateConfig,
  vars: PipelineVars
): object {

  // 1. Interpolar todas as variáveis no template Shotstack
  const interpolated = interpolateDeep(template.shotstack_template, vars);

  // 2. Definir tamanho correto para o formato
  const sizes = {
    post:  { width: 1080, height: 1350 },
    story: { width: 1080, height: 1920 },
    reels: { width: 1080, height: 1920 },
  };

  // 3. Montar output
  interpolated.output = {
    format: 'jpg',
    quality: 'high',
    size: sizes[vars.formato],
    fps: 1, // imagem estática
    scaleTo: 'preview' // ou 'none' para resolução full
  };

  return interpolated;
}
```

## Estrutura base de timeline (todos os templates seguem este padrão)

```json
{
  "timeline": {
    "background": "#000000",
    "tracks": [
      {
        "clips": [{
          "asset": { "type": "image", "src": "{{imagem_url}}" },
          "start": 0,
          "length": 5,
          "fit": "cover",
          "position": "{{posicao_foto_background}}"
        }]
      },
      {
        "clips": [{
          "asset": {
            "type": "html",
            "html": "<div style='width:100%;height:100%;background:{{overlay_css_lateral}}'></div>",
            "width": "{{largura}}",
            "height": "{{altura}}"
          },
          "start": 0,
          "length": 5
        }]
      },
      {
        "clips": [{
          "asset": {
            "type": "html",
            "html": "<div style='width:100%;height:100%;background:{{overlay_css_inferior}}'></div>",
            "width": "{{largura}}",
            "height": "{{altura}}"
          },
          "start": 0,
          "length": 5
        }]
      },
      {
        "clips": [{
          "asset": {
            "type": "html",
            "html": "<div style='font-size:10px;font-weight:600;background:{{cor_accent_12}};border:1px solid {{cor_accent_40}};border-radius:3px;padding:3px 9px;color:{{cor_accent}};letter-spacing:2px;text-transform:uppercase;font-family:Inter,sans-serif;display:inline-block'>{{badge_texto}}</div>",
            "width": 200,
            "height": 30
          },
          "start": 0,
          "length": 5,
          "position": "topRight",
          "offset": { "x": -0.05, "y": -0.44 }
        }]
      },
      {
        "clips": [{
          "asset": {
            "type": "title",
            "text": "{{titulo_linha1}}\n{{titulo_linha2}}",
            "style": "minimal",
            "color": "{{cor_primaria}}",
            "size": "xx-large",
            "font": "Playfair Display"
          },
          "start": 0,
          "length": 5,
          "position": "topLeft",
          "offset": { "x": 0.07, "y": -0.35 }
        }]
      },
      {
        "clips": [{
          "asset": {
            "type": "title",
            "text": "{{subtitulo}}",
            "style": "minimal",
            "color": "#E8DCCA",
            "size": "small"
          },
          "start": 0,
          "length": 5,
          "position": "topLeft",
          "offset": { "x": 0.07, "y": -0.12 }
        }]
      },
      {
        "clips": [{
          "asset": {
            "type": "html",
            "html": "<div style='background:linear-gradient(135deg,{{cor_secundaria}},{{cor_primaria}});border-radius:50px;padding:11px 28px;color:#fff;font-family:Inter,sans-serif;font-weight:500;font-size:15px;text-align:center'>{{cta_texto}}</div>",
            "width": 320,
            "height": 48
          },
          "start": 0,
          "length": 5,
          "position": "bottom",
          "offset": { "x": 0, "y": 0.12 }
        }]
      },
      {
        "clips": [{
          "asset": { "type": "image", "src": "{{logo_url}}" },
          "start": 0,
          "length": 5,
          "position": "bottomRight",
          "offset": { "x": -0.05, "y": 0.04 },
          "scale": 0.15
        }]
      }
    ]
  }
}
```

## Webhook handler

```typescript
// src/routes/webhooks/shotstack.ts

export async function shotstackWebhookHandler(req, res) {
  const { jobId } = req.query;
  const { id: renderId, status, url } = req.body.response;

  if (status === 'done') {
    await supabase
      .from('generated_creatives')
      .update({ output_url: url, status: 'completed' })
      .eq('shotstack_render_id', renderId);

    // Verificar se todos os formatos do job completaram
    const { data: creatives } = await supabase
      .from('generated_creatives')
      .select('status')
      .eq('job_id', jobId);

    const allDone = creatives.every(c => c.status === 'completed');

    if (allDone) {
      await supabase
        .from('creative_jobs')
        .update({ status: 'completed' })
        .eq('id', jobId);

      // Notificar usuário via WhatsApp (Evolution API) se configurado
      await notifyUserWhatsApp(jobId);
    }
  }

  return res.json({ received: true });
}
```
