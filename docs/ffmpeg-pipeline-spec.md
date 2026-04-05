# FFmpeg Pipeline Spec — ImobCreator Video Engine v2

## Overview

O backend FFmpeg recebe um `FFmpegJobSpec` via POST e executa um pipeline
de 2 passes para gerar video imobiliario a partir de fotos.

**REGRA ABSOLUTA**: as fotos originais sao intocaveis. Nenhum pixel e
modificado, reconstruido ou "melhorado" por IA. Apenas camadas sao aplicadas.

**Backend**: `db8-engine` (Railway) — endpoint `/generate-video/v2`
**Dependencias**: FFmpeg 6+, fontconfig, Liberation TTF fonts

---

## Payload de Entrada (POST /generate-video/v2)

```json
{
  "job_id": "uuid",
  "user_id": "uuid",
  "workspace_id": "uuid",
  "clips": [
    {
      "photo_url": "https://...supabase.co/.../photo1.jpg",
      "sequence_index": 0,
      "ken_burns": {
        "motion": "zoom_in",
        "zoom_factor": 1.15,
        "duration_seconds": 5
      }
    }
  ],
  "transition": {
    "type": "fade",
    "duration_seconds": 0.8
  },
  "overlays": [
    {
      "text": "R$ 450.000",
      "position": "center",
      "font_size": 56,
      "color": "#FFFFFF",
      "background": "black@0.5",
      "start_time": 15.4,
      "end_time": 20.4
    }
  ],
  "audio": {
    "mood": "modern",
    "volume": 0.3,
    "fade_out_seconds": 2
  },
  "output": {
    "resolution": "1080p",
    "aspect_ratio": "9:16",
    "width": 1080,
    "height": 1920,
    "fps": 30,
    "codec": "h264",
    "format": "mp4"
  },
  "callback_url": "https://...supabase.co/functions/v1/generation-callback"
}
```

---

## Pipeline — Passo 1: Clips Individuais (zoompan + scale)

Para cada clip:

### 1.1 Pre-scale da imagem

Redimensionar a foto para uma base grande (6000px no maior eixo)
para que o zoompan tenha pixels suficientes para o movimento.

```bash
ffmpeg -i input.jpg -vf "scale=6000:-1" -q:v 2 prescaled.jpg
```

### 1.2 Gerar clip com zoompan (Ken Burns)

O filtro `zoompan` aplica zoom/pan progressivo sobre a imagem.

**zoom_in:**
```bash
ffmpeg -loop 1 -i prescaled.jpg -vf "
  zoompan=z='min(zoom+0.001,1.15)':
         x='iw/2-(iw/zoom/2)':
         y='ih/2-(ih/zoom/2)':
         d=150:s=1080x1920:fps=30,
  format=yuv420p
" -t 5 -c:v libx264 -preset fast -crf 18 clip_00.mp4
```

**zoom_out:**
```bash
ffmpeg -loop 1 -i prescaled.jpg -vf "
  zoompan=z='if(eq(on,1),1.15,max(zoom-0.001,1.0))':
         x='iw/2-(iw/zoom/2)':
         y='ih/2-(ih/zoom/2)':
         d=150:s=1080x1920:fps=30,
  format=yuv420p
" -t 5 -c:v libx264 -preset fast -crf 18 clip_00.mp4
```

**pan_right:**
```bash
ffmpeg -loop 1 -i prescaled.jpg -vf "
  zoompan=z='1.15':
         x='if(eq(on,1),0,min(x+2,iw-iw/zoom))':
         y='ih/2-(ih/zoom/2)':
         d=150:s=1080x1920:fps=30,
  format=yuv420p
" -t 5 -c:v libx264 -preset fast -crf 18 clip_00.mp4
```

**pan_left:**
```bash
ffmpeg -loop 1 -i prescaled.jpg -vf "
  zoompan=z='1.15':
         x='if(eq(on,1),iw-iw/zoom,max(x-2,0))':
         y='ih/2-(ih/zoom/2)':
         d=150:s=1080x1920:fps=30,
  format=yuv420p
" -t 5 -c:v libx264 -preset fast -crf 18 clip_00.mp4
```

**pan_up:**
```bash
ffmpeg -loop 1 -i prescaled.jpg -vf "
  zoompan=z='1.15':
         x='iw/2-(iw/zoom/2)':
         y='if(eq(on,1),ih-ih/zoom,max(y-2,0))':
         d=150:s=1080x1920:fps=30,
  format=yuv420p
" -t 5 -c:v libx264 -preset fast -crf 18 clip_00.mp4
```

**pan_down:**
```bash
ffmpeg -loop 1 -i prescaled.jpg -vf "
  zoompan=z='1.15':
         x='iw/2-(iw/zoom/2)':
         y='if(eq(on,1),0,min(y+2,ih-ih/zoom))':
         d=150:s=1080x1920:fps=30,
  format=yuv420p
" -t 5 -c:v libx264 -preset fast -crf 18 clip_00.mp4
```

### Parametros ajustaveis

| Param | Default | Luxury | Fast Sales |
|---|---|---|---|
| `d` (frames) | 150 (5s@30fps) | 180 (6s@30fps) | 120 (4s@30fps) |
| zoom increment | 0.001 | 0.0007 | 0.002 |
| zoom_factor max | 1.15 | 1.10 | 1.25 |
| pan speed (px/frame) | 2 | 1.5 | 3 |

---

## Pipeline — Passo 1b: Encadear com xfade

Concatenar os clips usando `xfade` para transicoes suaves:

```bash
ffmpeg \
  -i clip_00.mp4 \
  -i clip_01.mp4 \
  -i clip_02.mp4 \
  -filter_complex "
    [0:v][1:v]xfade=transition=fade:duration=0.8:offset=4.2[v01];
    [v01][2:v]xfade=transition=fade:duration=0.8:offset=8.4[vout]
  " \
  -map "[vout]" \
  -c:v libx264 -preset fast -crf 18 \
  intermediate.mp4
```

**Calculo do offset:**
- Clip 0->1: `clip_duration - transition_duration` = 4.2
- Clip 1->2: `offset_anterior + clip_duration - transition_duration` = 8.4
- Generalizado: `offset[i] = offset[i-1] + clip_duration - transition_duration`

---

## Pipeline — Passo 2: Overlays + Audio + Output Final

### 2.1 Drawtext (dados do imovel)

```bash
ffmpeg -i intermediate.mp4 -vf "
  drawtext=text='R\\$ 450.000':
    fontfile=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf:
    fontsize=56:
    fontcolor=white:
    box=1:boxcolor=black@0.5:boxborderw=15:
    x=(w-text_w)/2:
    y=(h-text_h)/2:
    enable='between(t,15.4,20.4)',
  drawtext=text='Rua das Palmeiras, 123':
    fontfile=/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf:
    fontsize=42:
    fontcolor=white:
    box=1:boxcolor=black@0.6:boxborderw=12:
    x=(w-text_w)/2:
    y=h-text_h-60:
    enable='between(t,15.4,20.4)'
" -c:v libx264 -preset fast -crf 18 with_text.mp4
```

### 2.2 Fade in/out global

```bash
-vf "fade=t=in:st=0:d=0.5, fade=t=out:st=TOTAL_DUR-0.5:d=0.5"
```

(Combinar com drawtext no mesmo -vf)

### 2.3 Mixar audio

```bash
ffmpeg -i with_text.mp4 -i music_modern.mp3 \
  -filter_complex "
    [1:a]volume=0.3,afade=t=out:st=TOTAL_DUR-2:d=2[aout]
  " \
  -map 0:v -map "[aout]" \
  -c:v copy -c:a aac -b:a 192k \
  -shortest \
  final.mp4
```

### 2.4 Output validation

O video final DEVE ter:
- Resolucao: conforme `output.width` x `output.height`
- FPS: 30
- Codec: H.264 (libx264)
- Container: MP4
- Audio: AAC 192kbps
- Compativel com Instagram Reels upload

---

## Callback

Ao terminar (sucesso ou erro), o backend faz POST para `callback_url`:

```json
{
  "job_id": "uuid",
  "status": "done",
  "urls": ["https://...storage.../final.mp4"],
  "generation_type": "video_compose_v2",
  "metadata": {
    "render_time_ms": 45200,
    "clips_rendered": 5,
    "duration_seconds": 20.4,
    "resolution": "1080x1920",
    "file_size_bytes": 12500000
  }
}
```

Em caso de erro:
```json
{
  "job_id": "uuid",
  "status": "error",
  "error_message": "ffmpeg exited with code 1: ..."
}
```

O header `x-service-key` deve conter o `SUPABASE_SERVICE_ROLE_KEY` para autenticar no callback.

---

## Trilhas de Audio

O backend deve ter um diretorio de trilhas pre-selecionadas por mood:

| Mood | Descricao | BPM |
|---|---|---|
| luxury | Piano suave, elegante | 60-80 |
| modern | Lofi chill, contemporaneo | 80-100 |
| warm | Violao acustico, acolhedor | 70-90 |
| energetic | Beat moderno, dinamico | 100-120 |
| calm | Ambient, minimalista | 50-70 |

Todas as trilhas devem ser livres de royalties (royalty-free).

---

## Dependencias do Backend (db8-engine)

```
# nixpacks.toml
[phases.setup]
nixPkgs = ["ffmpeg", "fontconfig", "liberation_ttf"]
```

```
# requirements.txt (adicionar)
# Nenhuma dependencia Python extra — FFmpeg e executado via subprocess
```

---

## Endpoint Python (referencia para db8-engine)

O endpoint `/generate-video/v2` no db8-engine deve:

1. Receber o JSON `FFmpegJobSpec`
2. Baixar as fotos para `/tmp/`
3. Executar Passo 1 (zoompan + xfade) via `subprocess.run(["ffmpeg", ...])`
4. Executar Passo 2 (drawtext + audio) via `subprocess.run(["ffmpeg", ...])`
5. Upload do video final para Supabase Storage
6. POST callback com resultado

**IMPORTANTE**: Este documento e apenas referencia.
A implementacao do endpoint fica no repositorio `db8-engine`, NAO aqui.
