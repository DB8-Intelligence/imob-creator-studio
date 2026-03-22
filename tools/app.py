"""
app.py — iMobCreatorAI Reverse Prompt Lab
------------------------------------------
App local em Streamlit para:
  1. Upload de imagem inicial e final
  2. Entrada de contexto do concorrente
  3. Análise visual comparativa
  4. Geração de prompt reverso provável
  5. Negative prompt, CTA e prompt final para o iMobCreatorAI

Rodar:
  streamlit run app.py
"""

from __future__ import annotations

import io
import statistics
from dataclasses import dataclass
from typing import Iterable

import streamlit as st
from PIL import Image, ImageFilter, ImageStat

# ---------------------------------------------------------------------------
# Configuração da página
# ---------------------------------------------------------------------------

st.set_page_config(
    page_title="iMobCreatorAI — Reverse Prompt Lab",
    page_icon="🧠",
    layout="wide",
)

# ---------------------------------------------------------------------------
# Constantes
# ---------------------------------------------------------------------------

STYLE_KEYWORDS: dict[str, list[str]] = {
    "realista": [
        "photorealistic",
        "realistic textures",
        "natural lighting",
        "sharp focus",
        "high detail",
    ],
    "cinematografico": [
        "cinematic lighting",
        "dramatic atmosphere",
        "depth of field",
        "high contrast",
        "film look",
    ],
    "anime": [
        "anime style",
        "clean lineart",
        "cel shading",
        "vibrant colors",
    ],
    "luxo": [
        "luxury aesthetic",
        "premium details",
        "elegant composition",
        "refined lighting",
    ],
    "arquitetura": [
        "architectural visualization",
        "premium interior design",
        "balanced composition",
        "real estate marketing image",
    ],
    "digital_art": [
        "digital painting",
        "concept art",
        "detailed rendering",
    ],
    "3d_render": [
        "3d render",
        "cgi lighting",
        "global illumination",
        "studio render",
    ],
    "cyberpunk": [
        "cyberpunk style",
        "neon accents",
        "futuristic atmosphere",
        "glowing elements",
    ],
    "fantasy": [
        "fantasy art",
        "epic atmosphere",
        "ornate details",
        "magical scene",
    ],
    "vintage": [
        "retro aesthetic",
        "film grain",
        "vintage tones",
        "muted palette",
    ],
}

MODEL_FAMILY_HINTS: dict[str, str] = {
    "anime": "Anime checkpoint / SDXL fine-tune",
    "realista": "SDXL / Flux / Realistic Vision-like",
    "cinematografico": "SDXL / Flux / Midjourney-like",
    "digital_art": "Midjourney-like / SDXL art checkpoint",
    "3d_render": "SDXL / Midjourney-like / CGI-tuned model",
    "cyberpunk": "Midjourney-like / SDXL fine-tune",
    "fantasy": "Midjourney-like / SDXL art checkpoint",
    "vintage": "Midjourney-like / SDXL fine-tune",
    "luxo": "Midjourney-like / SDXL-like",
    "arquitetura": "SDXL / Flux / Architectural checkpoint",
}


# ---------------------------------------------------------------------------
# Estruturas
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class ImageMetrics:
    width: int
    height: int
    aspect_ratio: float
    brightness: float
    contrast: float
    saturation: float
    sharpness: float
    edge_density: float
    dominant_tone: str


@dataclass(frozen=True)
class ReversePromptOutput:
    analysis_summary: str
    prompt_likely_used: str
    negative_prompt: str
    cta_suggestion: str
    final_imobcreator_prompt: str
    model_family_guess: str
    confidence: str
    inferred_style: str


# ---------------------------------------------------------------------------
# Análise de imagem
# ---------------------------------------------------------------------------

def load_uploaded_image(file_bytes: bytes) -> Image.Image:
    return Image.open(io.BytesIO(file_bytes)).convert("RGB")


def compute_brightness(img: Image.Image) -> float:
    return round(ImageStat.Stat(img.convert("L")).mean[0], 2)


def compute_contrast(img: Image.Image) -> float:
    return round(ImageStat.Stat(img.convert("L")).stddev[0], 2)


def compute_saturation(img: Image.Image) -> float:
    _, s, _ = img.convert("HSV").split()
    return round(ImageStat.Stat(s).mean[0], 2)


def compute_sharpness(img: Image.Image) -> float:
    edges = img.convert("L").filter(ImageFilter.FIND_EDGES)
    return round(ImageStat.Stat(edges).mean[0], 2)


def compute_edge_density(img: Image.Image) -> float:
    edges = img.convert("L").filter(ImageFilter.FIND_EDGES)
    pixels = list(edges.getdata())
    if not pixels:
        return 0.0
    return round(sum(1 for v in pixels if v >= 24) / len(pixels), 4)


def infer_dominant_tone(img: Image.Image) -> str:
    small = img.resize((64, 64))
    pixels = list(small.getdata())
    if not pixels:
        return "neutro"
    reds = statistics.mean(px[0] for px in pixels)
    greens = statistics.mean(px[1] for px in pixels)
    blues = statistics.mean(px[2] for px in pixels)
    if max(reds, greens, blues) - min(reds, greens, blues) < 10:
        return "neutro"
    if blues > reds and blues > greens:
        return "frio"
    if reds > blues and reds >= greens:
        return "quente"
    if greens > reds and greens > blues:
        return "esverdeado"
    return "neutro"


def analyze_image(img: Image.Image) -> ImageMetrics:
    width, height = img.size
    return ImageMetrics(
        width=width,
        height=height,
        aspect_ratio=round(width / height, 4) if height else 0.0,
        brightness=compute_brightness(img),
        contrast=compute_contrast(img),
        saturation=compute_saturation(img),
        sharpness=compute_sharpness(img),
        edge_density=compute_edge_density(img),
        dominant_tone=infer_dominant_tone(img),
    )


def metric_delta(a: float, b: float) -> float:
    return round(b - a, 2)


# ---------------------------------------------------------------------------
# Inferência de estilo e modelo
# ---------------------------------------------------------------------------

def infer_style(
    original_text: str,
    generated_text: str,
    selected_option: str,
    before: ImageMetrics,
    after: ImageMetrics,
) -> str:
    combined = f"{original_text} {generated_text} {selected_option}".lower()

    if any(w in combined for w in ("anime", "manga", "cel shading")):
        return "anime"
    if any(w in combined for w in ("cinematic", "cinematográfico", "filme")):
        return "cinematografico"
    if any(w in combined for w in ("3d", "cgi", "render")):
        return "3d_render"
    if any(w in combined for w in ("cyberpunk", "neon")):
        return "cyberpunk"
    if any(w in combined for w in ("fantasy", "fantasia")):
        return "fantasy"
    if any(w in combined for w in ("vintage", "retro")):
        return "vintage"
    if any(w in combined for w in ("luxo", "premium", "sofisticado", "elegante")):
        return "luxo"
    if any(w in combined for w in ("arquitetura", "imóvel", "interior", "fachada", "sala")):
        return "arquitetura"
    if any(w in combined for w in ("realista", "realistic", "foto", "photorealistic")):
        return "realista"

    if after.sharpness > 18 and after.contrast > 35:
        return "realista"
    if after.contrast > 40 and after.saturation < 100:
        return "cinematografico"
    if after.edge_density > 0.18 and after.saturation > 105:
        return "anime"
    if after.saturation > 110 and after.contrast > 45 and after.dominant_tone == "frio":
        return "cyberpunk"

    return "digital_art"


def infer_model_family(
    model_name: str,
    selected_option: str,
    style: str,
) -> tuple[str, str]:
    model_lower = model_name.strip().lower()
    option_lower = selected_option.strip().lower()

    if model_lower:
        if "sdxl" in model_lower or "stable diffusion" in model_lower:
            return "SDXL-like", "média"
        if "flux" in model_lower:
            return "Flux-like", "média"
        if "midjourney" in model_lower:
            return "Midjourney-like", "média"
        if "dall" in model_lower:
            return "DALL·E-like", "média"
        return model_name.strip(), "média"

    if "midjourney" in option_lower:
        return "Midjourney-like", "média"
    if "sdxl" in option_lower:
        return "SDXL-like", "média"
    if "flux" in option_lower:
        return "Flux-like", "média"

    return MODEL_FAMILY_HINTS.get(style, "Modelo misto / indeterminado"), "baixa"


# ---------------------------------------------------------------------------
# Construção de prompts
# ---------------------------------------------------------------------------

def dedupe_preserve_order(items: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for item in items:
        key = item.strip().lower()
        if not key or key in seen:
            continue
        seen.add(key)
        result.append(item.strip())
    return result


def build_visual_change_clauses(before: ImageMetrics, after: ImageMetrics) -> list[str]:
    clauses: list[str] = []
    if metric_delta(before.brightness, after.brightness) > 10:
        clauses.append("brighter scene")
    elif metric_delta(before.brightness, after.brightness) < -10:
        clauses.append("darker mood")
    if metric_delta(before.contrast, after.contrast) > 8:
        clauses.append("higher contrast")
    elif metric_delta(before.contrast, after.contrast) < -8:
        clauses.append("softer contrast")
    if metric_delta(before.saturation, after.saturation) > 12:
        clauses.append("more vivid colors")
    elif metric_delta(before.saturation, after.saturation) < -12:
        clauses.append("muted palette")
    if metric_delta(before.sharpness, after.sharpness) > 3:
        clauses.append("enhanced fine details")
    elif metric_delta(before.sharpness, after.sharpness) < -3:
        clauses.append("soft painterly detail")
    if after.dominant_tone == "frio":
        clauses.append("cool color grading")
    elif after.dominant_tone == "quente":
        clauses.append("warm color grading")
    return clauses


def build_probable_prompt(
    original_text: str,
    generated_text: str,
    selected_option: str,
    model_name: str,
    style: str,
    before: ImageMetrics,
    after: ImageMetrics,
) -> str:
    base = original_text.strip() or "subject preserved from original image"
    style_terms = STYLE_KEYWORDS.get(style, [])
    visual_changes = build_visual_change_clauses(before, after)
    generated_fragment = generated_text.strip()

    parts = [base, generated_fragment, *style_terms, *visual_changes, "high detail", "professional composition"]
    if selected_option.strip():
        parts.append(f"{selected_option.strip()} style")
    if model_name.strip():
        parts.append(f"optimized for {model_name.strip()}")

    return ", ".join(dedupe_preserve_order(p for p in parts if p))


def build_negative_prompt(style: str) -> str:
    parts = [
        "low quality", "blurry", "bad anatomy", "deformed objects",
        "extra elements", "cropped subject", "text watermark", "logo",
        "duplicate details", "artifacts",
    ]
    if style == "realista":
        parts.extend(["plastic skin", "oversharpened face", "uncanny result"])
    elif style == "anime":
        parts.extend(["messy lineart", "off-model face"])
    elif style == "cinematografico":
        parts.extend(["flat lighting", "lifeless shadows"])
    elif style == "arquitetura":
        parts.extend(["distorted walls", "bent lines", "bad perspective"])
    elif style == "luxo":
        parts.extend(["cheap look", "flat textures"])
    return ", ".join(dedupe_preserve_order(parts))


def build_cta(app_name: str, cta_goal: str, style: str, model_name: str) -> str:
    goal = cta_goal.strip() or "gerar imagens com aparência profissional"
    model_fragment = (
        f" com linguagem otimizada para {model_name.strip()}"
        if model_name.strip()
        else ""
    )
    return (
        f"Use o {app_name} para {goal}, com prompt guiado, análise visual antes/depois, "
        f"reconstrução de prompt provável e refinamento automático de estilo {style}{model_fragment}."
    )


def build_analysis_summary(
    before: ImageMetrics,
    after: ImageMetrics,
    style: str,
    model_guess: str,
    confidence: str,
) -> str:
    return (
        f"A imagem final indica transformação para estilo '{style}'. "
        f"Variações detectadas — Brilho: {metric_delta(before.brightness, after.brightness)}, "
        f"Contraste: {metric_delta(before.contrast, after.contrast)}, "
        f"Saturação: {metric_delta(before.saturation, after.saturation)}, "
        f"Nitidez: {metric_delta(before.sharpness, after.sharpness)}. "
        f"Tom dominante final: '{after.dominant_tone}'. "
        f"Família de modelo provável: '{model_guess}' (confiança: {confidence}). "
        f"Resolução final: {after.width}×{after.height}px."
    )


def build_final_imobcreator_prompt(
    app_name: str,
    original_text: str,
    generated_text: str,
    selected_option: str,
    model_name: str,
    probable_prompt: str,
    negative_prompt: str,
    cta: str,
    analysis_summary: str,
) -> str:
    app = app_name.strip() or "iMobCreatorAI"
    return f"""Você é o motor de geração de prompts do {app}.

Objetivo:
Transformar a intenção do usuário em um prompt final de alto impacto visual usando análise
comparativa entre imagem inicial e final, contexto competitivo e refinamento automático.

Contexto informado pelo usuário:
- Texto original digitado no concorrente: {original_text.strip() or "não informado"}
- Texto gerado/convertido pela IA concorrente: {generated_text.strip() or "não informado"}
- Opção/estilo selecionado no concorrente: {selected_option.strip() or "não informado"}
- Nome do modelo usado no concorrente: {model_name.strip() or "não informado"}

Análise visual inferida:
{analysis_summary}

Prompt provável usado pelo concorrente:
{probable_prompt}

Negative prompt sugerido:
{negative_prompt}

CTA sugerido:
{cta}

Sua tarefa:
1. Entender a intenção principal do usuário.
2. Preservar os elementos essenciais do assunto original.
3. Aplicar o estilo visual inferido com maior apelo comercial imobiliário.
4. Entregar um prompt final claro, forte, detalhado e pronto para copiar e colar.
5. Entregar uma versão curta para CTA/comercial.

Formato de saída esperado:

PROMPT_FINAL:
<gerar aqui>

NEGATIVE_PROMPT:
<gerar aqui>

CTA_FINAL:
<gerar aqui>"""


# ---------------------------------------------------------------------------
# Pipeline
# ---------------------------------------------------------------------------

def run_pipeline(
    initial_image: Image.Image,
    final_image: Image.Image,
    original_text: str,
    generated_text: str,
    selected_option: str,
    model_name: str,
    cta_goal: str,
    app_name: str,
) -> ReversePromptOutput:
    before = analyze_image(initial_image)
    after = analyze_image(final_image)

    style = infer_style(original_text, generated_text, selected_option, before, after)
    model_guess, confidence = infer_model_family(model_name, selected_option, style)

    probable_prompt = build_probable_prompt(
        original_text, generated_text, selected_option, model_name, style, before, after
    )
    negative_prompt = build_negative_prompt(style)
    cta = build_cta(app_name, cta_goal, style, model_name)
    analysis_summary = build_analysis_summary(before, after, style, model_guess, confidence)
    final_prompt = build_final_imobcreator_prompt(
        app_name, original_text, generated_text, selected_option,
        model_name, probable_prompt, negative_prompt, cta, analysis_summary,
    )

    return ReversePromptOutput(
        analysis_summary=analysis_summary,
        prompt_likely_used=probable_prompt,
        negative_prompt=negative_prompt,
        cta_suggestion=cta,
        final_imobcreator_prompt=final_prompt,
        model_family_guess=model_guess,
        confidence=confidence,
        inferred_style=style,
    )


# ---------------------------------------------------------------------------
# UI Streamlit
# ---------------------------------------------------------------------------

def render_header() -> None:
    st.title("🧠 iMobCreatorAI — Reverse Prompt Lab")
    st.caption(
        "Compare imagem inicial e final, infira o prompt provável do concorrente "
        "e gere um prompt final integrado ao iMobCreatorAI."
    )
    st.divider()


def render_image_uploads() -> tuple[bytes | None, bytes | None]:
    st.subheader("📸 Imagens")
    col1, col2 = st.columns(2)
    with col1:
        initial_file = st.file_uploader(
            "Imagem inicial (antes)",
            type=["png", "jpg", "jpeg", "webp"],
            key="initial_file",
        )
    with col2:
        final_file = st.file_uploader(
            "Imagem final (depois)",
            type=["png", "jpg", "jpeg", "webp"],
            key="final_file",
        )
    return (
        initial_file.getvalue() if initial_file else None,
        final_file.getvalue() if final_file else None,
    )


def render_context_form() -> tuple[str, str, str, str, str, str]:
    st.subheader("📋 Contexto do concorrente")

    original_text = st.text_area(
        "Texto original digitado no site concorrente",
        placeholder="Ex.: apartamento moderno com varanda gourmet e iluminação natural...",
        height=100,
    )

    generated_text = st.text_area(
        "Texto gerado/convertido pela IA do concorrente",
        placeholder="Ex.: luxury modern apartment, warm lighting, premium decor, photorealistic...",
        height=100,
    )

    col_a, col_b = st.columns(2)
    with col_a:
        selected_option = st.text_input(
            "Opção/estilo selecionado no concorrente",
            placeholder="Ex.: cinematic, luxury, realistic, enhance...",
        )
    with col_b:
        model_name = st.text_input(
            "Nome do modelo usado no concorrente",
            placeholder="Ex.: SDXL, Flux, Midjourney...",
        )

    col_c, col_d = st.columns(2)
    with col_c:
        cta_goal = st.text_input(
            "Objetivo do CTA",
            value="gerar imagens de imóveis com alto impacto visual e apelo comercial",
        )
    with col_d:
        app_name = st.text_input(
            "Nome do aplicativo",
            value="iMobCreatorAI",
        )

    return original_text, generated_text, selected_option, model_name, cta_goal, app_name


def render_image_preview(initial_bytes: bytes | None, final_bytes: bytes | None) -> None:
    if not initial_bytes and not final_bytes:
        return
    st.subheader("🖼️ Pré-visualização")
    col1, col2 = st.columns(2)
    if initial_bytes:
        with col1:
            st.image(initial_bytes, caption="Imagem inicial", use_container_width=True)
    if final_bytes:
        with col2:
            st.image(final_bytes, caption="Imagem final", use_container_width=True)
    st.divider()


def render_results(result: ReversePromptOutput) -> None:
    st.subheader("📊 Resultados da análise")

    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Estilo inferido", result.inferred_style)
    with col2:
        st.metric("Família provável do modelo", result.model_family_guess)
    with col3:
        st.metric("Confiança", result.confidence)

    st.divider()

    st.markdown("**Análise visual do antes e depois**")
    st.text_area("", value=result.analysis_summary, height=130, key="analysis_out")

    st.markdown("**Prompt provável usado pelo concorrente para gerar a imagem final**")
    st.text_area("", value=result.prompt_likely_used, height=160, key="prompt_out")

    st.markdown("**Negative prompt sugerido**")
    st.text_area("", value=result.negative_prompt, height=100, key="negative_out")

    st.markdown("**CTA sugerido**")
    st.text_area("", value=result.cta_suggestion, height=100, key="cta_out")

    st.divider()
    st.markdown("**✅ Prompt final consolidado para o iMobCreatorAI**")
    st.text_area(
        "",
        value=result.final_imobcreator_prompt,
        height=400,
        key="final_prompt_out",
    )


def main() -> None:
    render_header()

    initial_bytes, final_bytes = render_image_uploads()
    render_image_preview(initial_bytes, final_bytes)

    original_text, generated_text, selected_option, model_name, cta_goal, app_name = (
        render_context_form()
    )

    st.divider()
    generate_clicked = st.button(
        "🚀 Gerar análise e prompt final",
        type="primary",
        use_container_width=True,
    )

    if not generate_clicked:
        return

    errors: list[str] = []
    if not initial_bytes:
        errors.append("Envie a imagem inicial.")
    if not final_bytes:
        errors.append("Envie a imagem final.")

    if errors:
        for error in errors:
            st.error(error)
        return

    with st.spinner("Analisando imagens e gerando prompt..."):
        try:
            initial_image = load_uploaded_image(initial_bytes or b"")
            final_image = load_uploaded_image(final_bytes or b"")
            result = run_pipeline(
                initial_image=initial_image,
                final_image=final_image,
                original_text=original_text,
                generated_text=generated_text,
                selected_option=selected_option,
                model_name=model_name,
                cta_goal=cta_goal,
                app_name=app_name,
            )
        except Exception as exc:
            st.exception(exc)
            return

    st.divider()
    render_results(result)


if __name__ == "__main__":
    main()
