# Video Backend Dependency — generate-video/v2

## Status: NOT YET DEPLOYED

O endpoint `https://api.db8intelligence.com.br/generate-video/v2` ainda NAO existe
no db8-engine (Railway). O servidor responde 200 em `/health` mas 404 em `/generate-video/v2`.

## Fallback implementado

A edge function `generate-video-v2` tenta despachar para o backend FFmpeg.
Se receber 404 ou erro de rede, faz fallback para o webhook n8n:

```
POST https://automacao.db8intelligence.com.br/webhook/imobcreator-generate
```

Com `generation_type: "video_compose_v2"` e `engine_id: "ffmpeg_kenburns"`.

Isso permite que o n8n receba o job e faca roteamento quando o sub-workflow
de video estiver configurado.

## O que precisa ser implementado no db8-engine

1. Criar `app/video/__init__.py`
2. Criar `app/video/generator.py` com classe `RealEstateVideoGenerator`
3. Criar rota `POST /generate-video/v2` em `app/routes/video.py`
4. Registrar router em `app/main.py`
5. Adicionar trilhas de audio em `app/video/tracks/`
6. Callback: POST para `callback_url` com resultado

Spec completa: `docs/ffmpeg-pipeline-spec.md`

## Quando o backend estiver pronto

1. Deploy no Railway (db8-engine)
2. A edge function automaticamente passa a despachar para o backend direto
3. Nenhuma alteracao necessaria no frontend ou na edge function

## Timeline

- Frontend: PRONTO (VideoCreatorPage.tsx usa FFmpeg como default)
- Edge function: PRONTA (generate-video-v2 com fallback)
- Backend: PENDENTE (db8-engine /generate-video/v2)
- n8n: PENDENTE (sub-workflow wf-video-generation)
