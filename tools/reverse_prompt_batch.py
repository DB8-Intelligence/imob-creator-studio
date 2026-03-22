"""
reverse_prompt_batch.py
-----------------------
Processa pares de imagem (inicial + final) em lote,
gera prompt reverso provável, negative prompt, estilo inferido
e estimativa da família de modelo.

Uso:
  python reverse_prompt_batch.py --pairs pairs.csv
  python reverse_prompt_batch.py --pairs pairs.csv --json-out out.json --csv-out out.csv

Formato do CSV (pairs.csv):
  id,initial_image,final_image,hint_text,selected_option,claimed_model
  001,images/001_before.jpg,images/001_after.jpg,"portrait woman","cinematic","sdxl"
"""

from __future__ import annotations

import argparse
import csv
import json
import statistics
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageFilter, ImageStat


# ---------------------------------------------------------------------------
# Constantes
# ---------------------------------------------------------------------------

STYLE_KEYWORDS: dict[str, list[str]] = {
    "anime": [
        "anime style", "clean lineart", "cel shading", "vibrant colors",
        "manga aesthetics",
    ],
    "cinematografico": [
        "cinematic lighting", "dramatic atmosphere", "depth of field",
        "high contrast", "film look",
    ],
    "realista": [
        "photorealistic", "realistic textures", "natural lighting",
        "sharp focus", "high detail",
    ],
    "luxo": [
        "luxury aesthetic", "premium details", "elegant composition",
        "refined lighting",
    ],
    "arquitetura": [
        "architectural visualization", "premium interior design",
        "balanced composition", "real estate marketing image",
    ],
    "digital_art": [
        "digital painting", "concept art", "detailed rendering",
    ],
    "3d_render": [
        "3d render", "cgi lighting", "global illumination",
        "studio render", "high quality render",
    ],
    "cyberpunk": [
        "cyberpunk style", "neon accents", "futuristic atmosphere",
        "glowing elements",
    ],
    "fantasy": [
        "fantasy art", "epic atmosphere", "ornate details",
        "magical scene",
    ],
    "vintage": [
        "retro aesthetic", "film grain", "vintage tones", "muted palette",
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
# Estruturas de dados
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class PairInput:
    pair_id: str
    initial_image: Path
    final_image: Path
    hint_text: str
    selected_option: str
    claimed_model: str


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
class ReversePromptResult:
    pair_id: str
    initial_image: str
    final_image: str
    selected_option: str
    claimed_model: str
    inferred_style: str
    likely_model_family: str
    confidence: str
    reverse_prompt: str
    negative_prompt: str
    reasoning_summary: str


# ---------------------------------------------------------------------------
# Análise de imagem
# ---------------------------------------------------------------------------

def load_image(path: Path) -> Image.Image:
    with Image.open(path) as img:
        return img.convert("RGB")


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
    return round(sum(1 for px in pixels if px >= 24) / len(pixels), 4)


def infer_dominant_tone(img: Image.Image) -> str:
    small = img.resize((64, 64))
    pixels = list(small.getdata())
    if not pixels:
        return "neutro"
    reds = statistics.mean(px[0] for px in pixels)
    greens = statistics.mean(px[1] for px in pixels)
    blues = statistics.mean(px[2] for px in pixels)
    spread = max(reds, greens, blues) - min(reds, greens, blues)
    if spread < 10:
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


def metric_delta(before: float, after: float) -> float:
    return round(after - before, 2)


# ---------------------------------------------------------------------------
# Inferência de estilo e modelo
# ---------------------------------------------------------------------------

def choose_style(
    before: ImageMetrics,
    after: ImageMetrics,
    selected_option: str,
    hint_text: str,
) -> str:
    combined = f"{selected_option} {hint_text}".lower()

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
    if any(w in combined for w in ("luxo", "premium", "elegante")):
        return "luxo"
    if any(w in combined for w in ("arquitetura", "imóvel", "interior", "fachada")):
        return "arquitetura"
    if any(w in combined for w in ("realista", "realistic", "foto")):
        return "realista"

    if after.saturation < 80 and after.contrast > 40:
        return "cinematografico"
    if after.edge_density > 0.18 and after.saturation > 100:
        return "anime"
    if after.sharpness > 18 and after.contrast > 35:
        return "realista"
    if after.saturation > 110 and after.contrast > 45 and after.dominant_tone == "frio":
        return "cyberpunk"

    return "digital_art"


def estimate_model_family(
    style: str,
    selected_option: str,
    claimed_model: str,
) -> tuple[str, str]:
    if claimed_model.strip():
        return claimed_model.strip(), "média"
    option = selected_option.lower().strip()
    if "midjourney" in option:
        return "Midjourney-like", "média"
    if "sdxl" in option or "stable diffusion" in option:
        return "SDXL-like", "média"
    if "flux" in option:
        return "Flux-like", "média"
    if "dall" in option:
        return "DALL·E-like", "média"
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
    if metric_delta(before.brightness, after.brightness) > 12:
        clauses.append("brighter scene")
    elif metric_delta(before.brightness, after.brightness) < -12:
        clauses.append("darker mood")
    if metric_delta(before.contrast, after.contrast) > 10:
        clauses.append("higher contrast")
    elif metric_delta(before.contrast, after.contrast) < -10:
        clauses.append("softer contrast")
    if metric_delta(before.saturation, after.saturation) > 15:
        clauses.append("more vivid colors")
    elif metric_delta(before.saturation, after.saturation) < -15:
        clauses.append("muted color palette")
    if metric_delta(before.sharpness, after.sharpness) > 4:
        clauses.append("sharper fine details")
    elif metric_delta(before.sharpness, after.sharpness) < -4:
        clauses.append("soft painterly details")
    if after.dominant_tone == "frio":
        clauses.append("cool color grading")
    elif after.dominant_tone == "quente":
        clauses.append("warm color grading")
    return clauses


def build_reverse_prompt(
    hint_text: str,
    selected_option: str,
    style: str,
    before: ImageMetrics,
    after: ImageMetrics,
) -> str:
    base = hint_text.strip() or "subject preserved from the original image"
    style_terms = STYLE_KEYWORDS.get(style, [])
    visual_changes = build_visual_change_clauses(before, after)
    parts = [base, *style_terms, *visual_changes, "high detail"]
    if selected_option.strip():
        parts.append(f"{selected_option.strip()} style")
    return ", ".join(dedupe_preserve_order(parts))


def build_negative_prompt(style: str) -> str:
    parts = [
        "low quality", "blurry", "artifacts", "deformed anatomy",
        "extra fingers", "bad hands", "cropped", "duplicate elements",
        "text watermark", "logo",
    ]
    if style == "realista":
        parts.extend(["plastic skin", "oversmoothing", "uncanny face"])
    if style == "anime":
        parts.extend(["messy lineart", "off-model face"])
    if style == "3d_render":
        parts.extend(["low poly", "bad reflections"])
    if style == "cinematografico":
        parts.extend(["flat lighting"])
    if style == "cyberpunk":
        parts.extend(["washed colors"])
    if style == "vintage":
        parts.extend(["modern clean digital look"])
    if style == "arquitetura":
        parts.extend(["distorted walls", "bad perspective", "bent lines"])
    return ", ".join(dedupe_preserve_order(parts))


def summarize_reasoning(
    before: ImageMetrics,
    after: ImageMetrics,
    style: str,
    model_family: str,
    confidence: str,
) -> str:
    return (
        f"style={style}; model_family={model_family}; confidence={confidence}; "
        f"brightness_delta={metric_delta(before.brightness, after.brightness)}; "
        f"contrast_delta={metric_delta(before.contrast, after.contrast)}; "
        f"saturation_delta={metric_delta(before.saturation, after.saturation)}; "
        f"sharpness_delta={metric_delta(before.sharpness, after.sharpness)}; "
        f"tone={after.dominant_tone}"
    )


# ---------------------------------------------------------------------------
# Pipeline principal
# ---------------------------------------------------------------------------

def process_pair(item: PairInput) -> ReversePromptResult:
    before = analyze_image(load_image(item.initial_image))
    after = analyze_image(load_image(item.final_image))

    style = choose_style(before, after, item.selected_option, item.hint_text)
    model_family, confidence = estimate_model_family(style, item.selected_option, item.claimed_model)
    reverse_prompt = build_reverse_prompt(item.hint_text, item.selected_option, style, before, after)
    negative_prompt = build_negative_prompt(style)
    reasoning = summarize_reasoning(before, after, style, model_family, confidence)

    return ReversePromptResult(
        pair_id=item.pair_id,
        initial_image=str(item.initial_image),
        final_image=str(item.final_image),
        selected_option=item.selected_option,
        claimed_model=item.claimed_model,
        inferred_style=style,
        likely_model_family=model_family,
        confidence=confidence,
        reverse_prompt=reverse_prompt,
        negative_prompt=negative_prompt,
        reasoning_summary=reasoning,
    )


# ---------------------------------------------------------------------------
# I/O
# ---------------------------------------------------------------------------

def read_pairs(csv_path: Path) -> list[PairInput]:
    items: list[PairInput] = []
    with csv_path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        required = {"id", "initial_image", "final_image"}
        missing = required - set(reader.fieldnames or [])
        if missing:
            raise ValueError(f"CSV sem colunas obrigatórias: {', '.join(sorted(missing))}")
        for row in reader:
            items.append(
                PairInput(
                    pair_id=(row.get("id") or "").strip(),
                    initial_image=Path((row.get("initial_image") or "").strip()),
                    final_image=Path((row.get("final_image") or "").strip()),
                    hint_text=(row.get("hint_text") or "").strip(),
                    selected_option=(row.get("selected_option") or "").strip(),
                    claimed_model=(row.get("claimed_model") or "").strip(),
                )
            )
    return items


def write_json(results: list[ReversePromptResult], output_path: Path) -> None:
    output_path.write_text(
        json.dumps([asdict(r) for r in results], ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def write_csv(results: list[ReversePromptResult], output_path: Path) -> None:
    fieldnames = [
        "pair_id", "initial_image", "final_image", "selected_option", "claimed_model",
        "inferred_style", "likely_model_family", "confidence",
        "reverse_prompt", "negative_prompt", "reasoning_summary",
    ]
    with output_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for item in results:
            writer.writerow(asdict(item))


def print_results(results: list[ReversePromptResult]) -> None:
    for item in results:
        print(f"[{item.pair_id}]")
        print(f"  Estilo inferido  : {item.inferred_style}")
        print(f"  Família provável : {item.likely_model_family} ({item.confidence})")
        print(f"  Prompt reverso   : {item.reverse_prompt}")
        print(f"  Negative prompt  : {item.negative_prompt}")
        print(f"  Resumo           : {item.reasoning_summary}")
        print()


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Gera prompt reverso em lote a partir de imagem inicial + imagem final."
    )
    parser.add_argument("--pairs", type=Path, required=True, help="CSV com pares de imagens")
    parser.add_argument("--json-out", type=Path, default=Path("reverse_prompts.json"))
    parser.add_argument("--csv-out", type=Path, default=Path("reverse_prompts.csv"))
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    pairs = read_pairs(args.pairs)
    results: list[ReversePromptResult] = []
    for item in pairs:
        if not item.initial_image.exists():
            raise FileNotFoundError(f"Imagem inicial não encontrada: {item.initial_image}")
        if not item.final_image.exists():
            raise FileNotFoundError(f"Imagem final não encontrada: {item.final_image}")
        results.append(process_pair(item))
    write_json(results, args.json_out)
    write_csv(results, args.csv_out)
    print_results(results)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
