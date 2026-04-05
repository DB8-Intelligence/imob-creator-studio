# Video Backend Activation Checklist

## Status: PENDENTE

O backend FFmpeg precisa ser implementado no servico que responde em
`https://api.db8intelligence.com.br` (atualmente db8-agent v0.4.0 no Railway).

Endpoints existentes: `/`, `/health`, `/agent`, `/generate-caption`,
`/generate-video` (v1), `/properties`, `/webhook/whatsapp`.

O endpoint `/generate-video/v2` NAO existe. Retorna 404.

---

## Opcao A — Implementar no db8-agent existente (RECOMENDADO)

O db8-agent ja roda no Railway, ja tem `/generate-video` (v1) e
ja tem FFmpeg configurado via `nixpacks.toml`:

```toml
[phases.setup]
nixPkgs = ["ffmpeg", "fontconfig", "liberation_ttf"]
```

### Arquivos a criar

```
db8-agent/
  db8-agent/
    video/
      __init__.py
      generator.py      # RealEstateVideoGenerator
      tracks/
        luxury.mp3      # Piano suave, 60-80 BPM
        modern.mp3      # Lofi chill, 80-100 BPM
        warm.mp3        # Violao acustico, 70-90 BPM
        energetic.mp3   # Beat inspiracional, 90-110 BPM
        calm.mp3        # Ambient suave, 60-80 BPM
    routes/
      video_v2.py       # POST /generate-video/v2
```

### Arquivo: video/generator.py

```python
"""
RealEstateVideoGenerator — Motor FFmpeg para videos imobiliarios.

FILOSOFIA: Fotos intocaveis. Apenas camadas de composicao:
movimento (Ken Burns), transicao, texto, musica.
"""
import os
import subprocess
import tempfile
import time
from pathlib import Path
from typing import Optional
import httpx

TRACKS_DIR = Path(__file__).parent / "tracks"

ZOOMPAN_TEMPLATES = {
    "zoom_in": (
        "zoompan=z='min(zoom+{zinc},{zmax})':"
        "x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
        "d={frames}:s={w}x{h}:fps={fps}"
    ),
    "zoom_out": (
        "zoompan=z='if(eq(on,1),{zmax},max(zoom-{zinc},1.0))':"
        "x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
        "d={frames}:s={w}x{h}:fps={fps}"
    ),
    "pan_right": (
        "zoompan=z='{zmax}':"
        "x='if(eq(on,1),0,min(x+{pspeed},iw-iw/zoom))':"
        "y='ih/2-(ih/zoom/2)':"
        "d={frames}:s={w}x{h}:fps={fps}"
    ),
    "pan_left": (
        "zoompan=z='{zmax}':"
        "x='if(eq(on,1),iw-iw/zoom,max(x-{pspeed},0))':"
        "y='ih/2-(ih/zoom/2)':"
        "d={frames}:s={w}x{h}:fps={fps}"
    ),
    "pan_up": (
        "zoompan=z='{zmax}':"
        "x='iw/2-(iw/zoom/2)':"
        "y='if(eq(on,1),ih-ih/zoom,max(y-{pspeed},0))':"
        "d={frames}:s={w}x{h}:fps={fps}"
    ),
    "pan_down": (
        "zoompan=z='{zmax}':"
        "x='iw/2-(iw/zoom/2)':"
        "y='if(eq(on,1),0,min(y+{pspeed},ih-ih/zoom))':"
        "d={frames}:s={w}x{h}:fps={fps}"
    ),
}

POSITION_Y = {
    "top": "60",
    "center": "(h-text_h)/2",
    "bottom_safe": "h-text_h-{margin}",
}


class RealEstateVideoGenerator:
    """Gera videos imobiliarios a partir de fotos usando FFmpeg."""

    def __init__(self, spec: dict):
        self.spec = spec
        self.clips = spec["clips"]
        self.transition = spec["transition"]
        self.overlays = spec.get("overlays", [])
        self.audio = spec.get("audio", {})
        self.output = spec["output"]
        self.w = self.output.get("width", 1080)
        self.h = self.output.get("height", 1920)
        self.fps = self.output.get("fps", 30)
        self.tmpdir = tempfile.mkdtemp(prefix="imob_video_")

    def generate(self) -> str:
        """Executa pipeline completo. Retorna caminho do MP4 final."""
        start = time.time()

        # Passo 1: Baixar fotos + gerar clips individuais
        clip_paths = []
        for clip in self.clips:
            path = self._download_photo(clip["photo_url"], clip["sequence_index"])
            prescaled = self._prescale(path, clip["sequence_index"])
            kb = clip["ken_burns"]
            clip_mp4 = self._zoompan(prescaled, clip["sequence_index"], kb)
            clip_paths.append(clip_mp4)

        # Passo 1b: Encadear com xfade
        intermediate = self._xfade_chain(clip_paths)

        # Passo 2: Overlays de texto
        with_text = self._apply_overlays(intermediate)

        # Passo 2b: Fade in/out
        with_fade = self._apply_fades(with_text)

        # Passo 2c: Mixar audio
        final = self._mix_audio(with_fade)

        elapsed = time.time() - start
        print(f"[VideoGenerator] Render complete: {elapsed:.1f}s")
        return final

    def _download_photo(self, url: str, idx: int) -> str:
        out = os.path.join(self.tmpdir, f"input_{idx:02d}.jpg")
        r = httpx.get(url, timeout=30)
        r.raise_for_status()
        with open(out, "wb") as f:
            f.write(r.content)
        return out

    def _prescale(self, path: str, idx: int) -> str:
        out = os.path.join(self.tmpdir, f"prescaled_{idx:02d}.jpg")
        subprocess.run([
            "ffmpeg", "-y", "-i", path,
            "-vf", "scale=6000:-1",
            "-q:v", "2", out
        ], check=True, capture_output=True)
        return out

    def _zoompan(self, path: str, idx: int, kb: dict) -> str:
        out = os.path.join(self.tmpdir, f"clip_{idx:02d}.mp4")
        motion = kb.get("motion", "zoom_in")
        zmax = kb.get("zoom_factor", 1.15)
        duration = kb.get("duration_seconds", 5)
        frames = duration * self.fps

        # Calcula incremento de zoom baseado na duracao
        zinc = round((zmax - 1.0) / frames, 6) if motion in ("zoom_in", "zoom_out") else 0
        pspeed = 2  # px/frame, ajustar por preset se necessario

        template = ZOOMPAN_TEMPLATES.get(motion, ZOOMPAN_TEMPLATES["zoom_in"])
        vf = template.format(
            zinc=zinc, zmax=zmax, frames=int(frames),
            w=self.w, h=self.h, fps=self.fps, pspeed=pspeed
        )

        subprocess.run([
            "ffmpeg", "-y", "-loop", "1", "-i", path,
            "-vf", f"{vf},format=yuv420p",
            "-t", str(duration),
            "-c:v", "libx264", "-preset", "fast", "-crf", "18",
            out
        ], check=True, capture_output=True)
        return out

    def _xfade_chain(self, clips: list[str]) -> str:
        if len(clips) == 1:
            return clips[0]

        trans_type = self.transition.get("type", "fade")
        trans_dur = self.transition.get("duration_seconds", 0.8)

        # Encadeia clips usando xfade
        current = clips[0]
        offset = self.clips[0]["ken_burns"]["duration_seconds"] - trans_dur

        for i in range(1, len(clips)):
            out = os.path.join(self.tmpdir, f"chain_{i:02d}.mp4")
            subprocess.run([
                "ffmpeg", "-y", "-i", current, "-i", clips[i],
                "-filter_complex",
                f"[0:v][1:v]xfade=transition={trans_type}:"
                f"duration={trans_dur}:offset={offset:.2f}[vout]",
                "-map", "[vout]",
                "-c:v", "libx264", "-preset", "fast", "-crf", "18",
                out
            ], check=True, capture_output=True)
            current = out
            offset += self.clips[i]["ken_burns"]["duration_seconds"] - trans_dur

        return current

    def _apply_overlays(self, input_path: str) -> str:
        if not self.overlays:
            return input_path

        out = os.path.join(self.tmpdir, "with_text.mp4")
        font_bold = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
        font_reg = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"

        drawtext_filters = []
        for ov in self.overlays:
            pos = ov.get("position", "center")
            margin = ov.get("margin_bottom", 120)
            y_expr = POSITION_Y.get(pos, "(h-text_h)/2").format(margin=margin)
            font = font_bold if ov.get("font_size", 32) >= 48 else font_reg
            bg = ov.get("background", "black@0.5")

            escaped_text = ov["text"].replace("'", "\\'").replace(":", "\\:")
            dt = (
                f"drawtext=text='{escaped_text}':"
                f"fontfile={font}:"
                f"fontsize={ov.get('font_size', 32)}:"
                f"fontcolor={ov.get('color', 'white')}:"
                f"box=1:boxcolor={bg}:boxborderw=12:"
                f"x=(w-text_w)/2:y={y_expr}:"
                f"enable='between(t,{ov['start_time']},{ov['end_time']})'"
            )
            drawtext_filters.append(dt)

        vf = ",".join(drawtext_filters)
        subprocess.run([
            "ffmpeg", "-y", "-i", input_path,
            "-vf", vf,
            "-c:v", "libx264", "-preset", "fast", "-crf", "18",
            out
        ], check=True, capture_output=True)
        return out

    def _apply_fades(self, input_path: str) -> str:
        # Obtem duracao do video
        result = subprocess.run([
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            input_path
        ], capture_output=True, text=True)
        total_dur = float(result.stdout.strip())

        out = os.path.join(self.tmpdir, "with_fade.mp4")
        fade_out_start = max(total_dur - 0.5, 0)
        subprocess.run([
            "ffmpeg", "-y", "-i", input_path,
            "-vf", f"fade=t=in:st=0:d=0.5,fade=t=out:st={fade_out_start:.2f}:d=0.5",
            "-c:v", "libx264", "-preset", "fast", "-crf", "18",
            out
        ], check=True, capture_output=True)
        return out

    def _mix_audio(self, input_path: str) -> str:
        mood = self.audio.get("mood", "modern")
        if mood == "none":
            return input_path

        track_file = TRACKS_DIR / f"{mood}.mp3"
        if not track_file.exists():
            print(f"[VideoGenerator] Track not found: {track_file}, skipping audio")
            return input_path

        volume = self.audio.get("volume", 0.3)
        fade_out = self.audio.get("fade_out_seconds", 2)

        # Obtem duracao do video
        result = subprocess.run([
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            input_path
        ], capture_output=True, text=True)
        total_dur = float(result.stdout.strip())
        fade_start = max(total_dur - fade_out, 0)

        out = os.path.join(self.tmpdir, "final.mp4")
        subprocess.run([
            "ffmpeg", "-y", "-i", input_path, "-i", str(track_file),
            "-filter_complex",
            f"[1:a]volume={volume},afade=t=out:st={fade_start:.2f}:d={fade_out}[aout]",
            "-map", "0:v", "-map", "[aout]",
            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
            "-shortest",
            out
        ], check=True, capture_output=True)
        return out
```

### Arquivo: routes/video_v2.py

```python
import os
import httpx
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from typing import Any
from video.generator import RealEstateVideoGenerator

router = APIRouter(tags=["Video"])

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")


class FFmpegJobSpec(BaseModel):
    job_id: str
    user_id: str
    workspace_id: str
    clips: list[dict[str, Any]]
    transition: dict[str, Any]
    overlays: list[dict[str, Any]] = []
    audio: dict[str, Any] = {}
    output: dict[str, Any]
    callback_url: str


@router.post("/generate-video/v2")
async def generate_video_v2(spec: FFmpegJobSpec, bg: BackgroundTasks):
    """Aceita FFmpegJobSpec, renderiza em background, chama callback."""
    bg.add_task(_render_and_callback, spec.model_dump())
    return {"status": "accepted", "job_id": spec.job_id}


async def _render_and_callback(spec: dict):
    try:
        gen = RealEstateVideoGenerator(spec)
        final_path = gen.generate()

        # Upload para Supabase Storage
        video_url = await _upload_to_storage(
            final_path,
            spec["workspace_id"],
            spec["job_id"],
        )

        # Callback de sucesso
        await _send_callback(spec["callback_url"], {
            "job_id": spec["job_id"],
            "status": "done",
            "urls": [video_url],
            "generation_type": "video_compose_v2",
            "metadata": {
                "clips_rendered": len(spec["clips"]),
                "resolution": f"{spec['output'].get('width')}x{spec['output'].get('height')}",
            },
        })
    except Exception as e:
        await _send_callback(spec["callback_url"], {
            "job_id": spec["job_id"],
            "status": "error",
            "error_message": str(e),
        })


async def _upload_to_storage(path: str, workspace_id: str, job_id: str) -> str:
    storage_path = f"{workspace_id}/{job_id}/output/final.mp4"
    with open(path, "rb") as f:
        resp = httpx.post(
            f"{SUPABASE_URL}/storage/v1/object/video-outputs/{storage_path}",
            headers={
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                "Content-Type": "video/mp4",
            },
            content=f.read(),
            timeout=120,
        )
        resp.raise_for_status()

    return f"{SUPABASE_URL}/storage/v1/object/public/video-outputs/{storage_path}"


async def _send_callback(url: str, payload: dict):
    async with httpx.AsyncClient() as client:
        await client.post(
            url,
            json=payload,
            headers={"x-service-key": SUPABASE_SERVICE_KEY},
            timeout=30,
        )
```

### Registro em main.py

```python
from routes.video_v2 import router as video_v2_router
app.include_router(video_v2_router)
```

---

## Opcao B — Novo servico dedicado no Railway

Se preferir nao tocar no db8-agent:

1. Criar servico `imob-video-engine` no Railway
2. Python + FFmpeg + FastAPI
3. Mesmo codigo acima
4. Apontar `FFMPEG_BACKEND_URL` na edge function para o novo dominio

---

## Checklist de ativacao (qualquer opcao)

- [ ] Criar `video/generator.py` com `RealEstateVideoGenerator`
- [ ] Criar `video/tracks/` com 5 arquivos MP3 (royalty-free)
- [ ] Criar `routes/video_v2.py` com `POST /generate-video/v2`
- [ ] Registrar router em `main.py`
- [ ] Configurar env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Confirmar `nixpacks.toml` tem `ffmpeg`, `fontconfig`, `liberation_ttf`
- [ ] Deploy no Railway
- [ ] Testar: `curl -X POST .../generate-video/v2 -d '{...}'`
- [ ] Confirmar callback chega em `generation-callback`
- [ ] Confirmar `generation_jobs` atualiza para `done`
- [ ] Confirmar `generated_assets` recebe `video_url`

---

## Trilhas de audio necessarias

| Arquivo | Mood | Descricao | BPM | Duracao |
|---|---|---|---|---|
| `luxury.mp3` | Luxo | Piano + cordas | 60-80 | 90-120s |
| `modern.mp3` | Moderno | Lofi chill | 80-100 | 90-120s |
| `warm.mp3` | Praia | Violao acustico | 70-90 | 90-120s |
| `energetic.mp3` | Corporativo | Beat inspiracional | 90-110 | 90-120s |
| `calm.mp3` | Familiar | Ambient suave | 60-80 | 90-120s |

Fontes recomendadas (royalty-free):
- Pixabay Music (pixabay.com/music)
- Uppbeat (uppbeat.io)
- Mixkit (mixkit.co/free-stock-music)

Todas as trilhas devem ter no minimo 120 segundos para cobrir
o video mais longo possivel (premium = 90s + margem).
