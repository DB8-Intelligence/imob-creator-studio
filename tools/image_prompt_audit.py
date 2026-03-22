"""
image_prompt_audit.py
---------------------
CLI unificado para auditar páginas de um site e detectar
prompts e metadados de geração de imagem.

Modos:
  --mode html     : apenas HTML estático
  --mode browser  : Playwright + captura de JSON/API
  --mode auto     : tenta HTML primeiro, usa browser se não achar nada

Uso:
  python image_prompt_audit.py <url> [--mode auto] [--max-pages 20]
  python image_prompt_audit.py https://exemplo.com --mode browser --csv-out results.csv
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from collections import deque
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import urldefrag, urljoin, urlparse

import requests
from bs4 import BeautifulSoup

try:
    from playwright.sync_api import BrowserContext, Page, Response, sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    sync_playwright = None
    PLAYWRIGHT_AVAILABLE = False

# ---------------------------------------------------------------------------
# Constantes
# ---------------------------------------------------------------------------

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/123.0.0.0 Safari/537.36"
    )
}

FIELD_ALIASES: dict[str, tuple[str, ...]] = {
    "prompt": (
        "prompt",
        "text_prompt",
        "image_prompt",
        "generation_prompt",
        "positive_prompt",
    ),
    "negative_prompt": ("negative_prompt", "negative prompt"),
    "model": ("model", "model_name", "checkpoint", "ckpt"),
    "seed": ("seed",),
    "steps": ("steps", "num_steps", "sampling_steps"),
    "cfg": ("cfg", "cfg_scale", "guidance_scale"),
    "sampler": ("sampler", "sampler_name", "scheduler"),
    "width": ("width",),
    "height": ("height",),
}

TEXT_PATTERNS: dict[str, list[re.Pattern[str]]] = {
    "prompt": [
        re.compile(r'\bprompt\b\s*[:=]\s*["\']?(.+?)(?:["\'\n\r<]|$)', re.IGNORECASE),
        re.compile(r'\bpositive\s+prompt\b\s*[:=]\s*["\']?(.+?)(?:["\'\n\r<]|$)', re.IGNORECASE),
        re.compile(r'\btext\s+prompt\b\s*[:=]\s*["\']?(.+?)(?:["\'\n\r<]|$)', re.IGNORECASE),
    ],
    "negative_prompt": [
        re.compile(r'\bnegative\s+prompt\b\s*[:=]\s*["\']?(.+?)(?:["\'\n\r<]|$)', re.IGNORECASE),
    ],
    "model": [
        re.compile(r'\bmodel\b\s*[:=]\s*["\']?(.+?)(?:["\'\n\r<]|$)', re.IGNORECASE),
        re.compile(r'\bcheckpoint\b\s*[:=]\s*["\']?(.+?)(?:["\'\n\r<]|$)', re.IGNORECASE),
    ],
    "seed": [
        re.compile(r'\bseed\b\s*[:=]\s*(\d+)', re.IGNORECASE),
    ],
    "steps": [
        re.compile(r'\bsteps\b\s*[:=]\s*(\d+)', re.IGNORECASE),
    ],
    "cfg": [
        re.compile(r'\bcfg(?:_scale)?\b\s*[:=]\s*([0-9]+(?:\.[0-9]+)?)', re.IGNORECASE),
        re.compile(r'\bguidance(?:_scale)?\b\s*[:=]\s*([0-9]+(?:\.[0-9]+)?)', re.IGNORECASE),
    ],
    "sampler": [
        re.compile(r'\bsampler(?:_name)?\b\s*[:=]\s*["\']?(.+?)(?:["\'\n\r<]|$)', re.IGNORECASE),
        re.compile(r'\bscheduler\b\s*[:=]\s*["\']?(.+?)(?:["\'\n\r<]|$)', re.IGNORECASE),
    ],
    "width": [
        re.compile(r'\bwidth\b\s*[:=]\s*(\d+)', re.IGNORECASE),
    ],
    "height": [
        re.compile(r'\bheight\b\s*[:=]\s*(\d+)', re.IGNORECASE),
    ],
}

DEFAULT_FIELDS = tuple(FIELD_ALIASES.keys())


# ---------------------------------------------------------------------------
# Estruturas de dados
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class Finding:
    page_url: str
    source: str
    field: str
    value: str

    def as_row(self) -> dict[str, str]:
        return {
            "page_url": self.page_url,
            "source": self.source,
            "field": self.field,
            "value": self.value,
        }


# ---------------------------------------------------------------------------
# Helpers de URL
# ---------------------------------------------------------------------------

def normalize_url(base_url: str, href: str) -> str | None:
    if not href:
        return None
    absolute = urljoin(base_url, href)
    absolute, _ = urldefrag(absolute)
    parsed = urlparse(absolute)
    if parsed.scheme not in {"http", "https"}:
        return None
    return absolute.rstrip("/")


def is_same_domain(root_url: str, candidate_url: str) -> bool:
    return urlparse(root_url).netloc == urlparse(candidate_url).netloc


def url_allowed(url: str, include_patterns: list[str]) -> bool:
    if not include_patterns:
        return True
    lowered = url.lower()
    return any(p.lower() in lowered for p in include_patterns)


# ---------------------------------------------------------------------------
# Helpers de texto
# ---------------------------------------------------------------------------

def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def add_finding(
    results: set[Finding],
    page_url: str,
    source: str,
    field: str,
    value: str,
) -> None:
    cleaned = normalize_text(value)
    if len(cleaned) >= 2:
        results.add(Finding(page_url=page_url, source=source, field=field, value=cleaned))


def match_field_name(key: str) -> str | None:
    lowered = normalize_text(key).lower().replace("-", "_")
    for field, aliases in FIELD_ALIASES.items():
        for alias in aliases:
            if lowered == alias.replace("-", "_"):
                return field
    return None


def search_text_patterns(
    text: str,
    page_url: str,
    source: str,
    results: set[Finding],
    fields: tuple[str, ...],
) -> None:
    for field in fields:
        for pattern in TEXT_PATTERNS.get(field, []):
            for match in pattern.finditer(text):
                candidate = match.group(1)
                if candidate:
                    add_finding(results, page_url, source, field, candidate)


def search_json(
    data: Any,
    page_url: str,
    path: str,
    results: set[Finding],
    fields: tuple[str, ...],
    source_prefix: str,
) -> None:
    if isinstance(data, dict):
        for key, value in data.items():
            key_text = str(key)
            matched_field = match_field_name(key_text)
            next_path = f"{path}.{key_text}" if path else key_text
            if matched_field in fields and isinstance(value, (str, int, float)):
                add_finding(results, page_url, f"{source_prefix}:{next_path}", matched_field, str(value))
            search_json(value, page_url, next_path, results, fields, source_prefix)
    elif isinstance(data, list):
        for index, item in enumerate(data):
            search_json(item, page_url, f"{path}[{index}]", results, fields, source_prefix)
    elif isinstance(data, str):
        search_text_patterns(data, page_url, f"{source_prefix}:{path}", results, fields)


# ---------------------------------------------------------------------------
# Extração HTML
# ---------------------------------------------------------------------------

def extract_links_from_soup(page_url: str, soup: BeautifulSoup) -> list[str]:
    links: list[str] = []
    for tag in soup.find_all("a", href=True):
        normalized = normalize_url(page_url, tag["href"])
        if normalized:
            links.append(normalized)
    return links


def extract_findings_from_html(
    page_url: str,
    html: str,
    fields: tuple[str, ...],
) -> tuple[set[Finding], list[str]]:
    soup = BeautifulSoup(html, "html.parser")
    results: set[Finding] = set()

    # meta tags
    for tag in soup.find_all("meta"):
        for attr in ("name", "property", "content"):
            value = tag.get(attr)
            if value:
                matched_field = match_field_name(value)
                if matched_field in fields:
                    add_finding(results, page_url, f"meta:{attr}", matched_field, value)
        content = tag.get("content")
        if content:
            search_text_patterns(content, page_url, "meta:content", results, fields)

    # atributos HTML
    for tag in soup.find_all(True):
        for attr_name, attr_value in tag.attrs.items():
            name = str(attr_name)
            value = (
                " ".join(map(str, attr_value))
                if isinstance(attr_value, list)
                else str(attr_value)
            )
            matched_field = match_field_name(name)
            if matched_field in fields:
                add_finding(results, page_url, f"attr:{name}", matched_field, value)
            if name.lower().startswith("data-") or "prompt" in name.lower():
                search_text_patterns(value, page_url, f"attr:{name}", results, fields)

    # texto visível
    visible_text = soup.get_text(separator=" ", strip=True)
    search_text_patterns(visible_text, page_url, "visible_text", results, fields)

    # scripts
    for script in soup.find_all("script"):
        script_text = script.string or script.get_text(strip=False) or ""
        script_text = script_text.strip()
        if not script_text:
            continue
        search_text_patterns(script_text, page_url, "script:text", results, fields)
        if (script.get("type") or "").lower() == "application/ld+json":
            try:
                data = json.loads(script_text)
                search_json(data, page_url, "ld_json", results, fields, "json")
            except json.JSONDecodeError:
                pass

    return results, extract_links_from_soup(page_url, soup)


def fetch_html(url: str, timeout: int = 20) -> str:
    response = requests.get(url, headers=HEADERS, timeout=timeout)
    response.raise_for_status()
    return response.text


def crawl_html(
    start_url: str,
    max_pages: int,
    include_patterns: list[str],
    fields: tuple[str, ...],
) -> list[Finding]:
    visited: set[str] = set()
    queue: deque[str] = deque([start_url.rstrip("/")])
    findings: set[Finding] = set()

    while queue and len(visited) < max_pages:
        current_url = queue.popleft()
        if current_url in visited:
            continue
        visited.add(current_url)
        try:
            html = fetch_html(current_url)
        except requests.RequestException as exc:
            print(f"[html erro] {current_url}: {exc}", file=sys.stderr)
            continue
        page_findings, links = extract_findings_from_html(current_url, html, fields)
        findings.update(page_findings)
        for link in links:
            if (
                is_same_domain(start_url, link)
                and link not in visited
                and url_allowed(link, include_patterns)
            ):
                queue.append(link)

    return sorted(findings, key=lambda f: (f.page_url, f.field, f.source, f.value))


# ---------------------------------------------------------------------------
# Extração via Playwright (browser)
# ---------------------------------------------------------------------------

def extract_links_from_dom(page: "Page", current_url: str) -> list[str]:  # type: ignore[type-arg]
    hrefs = page.eval_on_selector_all(
        "a[href]",
        "elements => elements.map(el => el.getAttribute('href'))",
    )
    links: list[str] = []
    for href in hrefs:
        if not href:
            continue
        normalized = normalize_url(current_url, str(href))
        if normalized:
            links.append(normalized)
    return links


def extract_findings_from_dom(
    page: "Page",  # type: ignore[type-arg]
    current_url: str,
    fields: tuple[str, ...],
) -> set[Finding]:
    results: set[Finding] = set()
    content = page.content()
    search_text_patterns(content, current_url, "dom:content", results, fields)
    return results


def attach_response_listener(
    context: "BrowserContext",  # type: ignore[type-arg]
    results: set[Finding],
    current_page_ref: dict[str, str],
    fields: tuple[str, ...],
) -> None:
    def handle_response(response: "Response") -> None:  # type: ignore[type-arg]
        try:
            content_type = (response.headers.get("content-type") or "").lower()
            response_url = response.url
            page_url = current_page_ref.get("url", response_url)

            if "application/json" in content_type or response_url.endswith(".json"):
                data = response.json()
                search_json(data, page_url, "", results, fields, f"api:{response_url}")
                return

            if "text/" in content_type or "javascript" in content_type:
                text = response.text()
                search_text_patterns(text, page_url, f"response:{response_url}", results, fields)
        except Exception:
            return

    context.on("response", handle_response)


def crawl_browser(
    start_url: str,
    max_pages: int,
    include_patterns: list[str],
    fields: tuple[str, ...],
    timeout_ms: int,
) -> list[Finding]:
    if not PLAYWRIGHT_AVAILABLE:
        raise RuntimeError(
            "Playwright não está instalado. Execute: pip install playwright && playwright install"
        )

    visited: set[str] = set()
    queue: deque[str] = deque([start_url.rstrip("/")])
    findings: set[Finding] = set()

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context()
        current_page_ref: dict[str, str] = {"url": start_url}
        attach_response_listener(context, findings, current_page_ref, fields)
        page = context.new_page()

        while queue and len(visited) < max_pages:
            current_url = queue.popleft()
            if current_url in visited:
                continue
            visited.add(current_url)
            current_page_ref["url"] = current_url
            try:
                page.goto(current_url, wait_until="networkidle", timeout=timeout_ms)
            except Exception as exc:
                print(f"[browser erro] {current_url}: {exc}", file=sys.stderr)
                continue
            findings.update(extract_findings_from_dom(page, current_url, fields))
            for link in extract_links_from_dom(page, current_url):
                if (
                    is_same_domain(start_url, link)
                    and link not in visited
                    and url_allowed(link, include_patterns)
                ):
                    queue.append(link)

        browser.close()

    return sorted(findings, key=lambda f: (f.page_url, f.field, f.source, f.value))


# ---------------------------------------------------------------------------
# Modo auto
# ---------------------------------------------------------------------------

def run_auto_mode(
    start_url: str,
    max_pages: int,
    include_patterns: list[str],
    fields: tuple[str, ...],
    timeout_ms: int,
) -> list[Finding]:
    html_results = crawl_html(start_url, max_pages, include_patterns, fields)
    if html_results:
        return html_results
    try:
        return crawl_browser(start_url, max_pages, include_patterns, fields, timeout_ms)
    except RuntimeError as exc:
        print(str(exc), file=sys.stderr)
        return []


# ---------------------------------------------------------------------------
# Saída
# ---------------------------------------------------------------------------

def dedupe_findings(items: Iterable[Finding]) -> list[Finding]:
    return sorted(set(items), key=lambda f: (f.page_url, f.field, f.source, f.value))


def write_json(path: Path, items: list[Finding]) -> None:
    path.write_text(
        json.dumps([asdict(f) for f in items], ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def write_csv(path: Path, items: list[Finding]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["page_url", "source", "field", "value"])
        writer.writeheader()
        for item in items:
            writer.writerow(item.as_row())


def print_stdout(items: list[Finding]) -> None:
    if not items:
        print("Nenhum achado.")
        return
    for item in items:
        print(f"URL: {item.page_url}")
        print(f"CAMPO: {item.field}")
        print(f"ORIGEM: {item.source}")
        print(f"VALOR: {item.value}")
        print("-" * 80)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Audita páginas de um site para encontrar prompts e metadados de geração de imagem."
    )
    parser.add_argument("url", help="URL inicial")
    parser.add_argument("--mode", choices=("auto", "html", "browser"), default="auto")
    parser.add_argument("--max-pages", type=int, default=20)
    parser.add_argument(
        "--include",
        nargs="*",
        default=["image", "gallery", "art", "post", "generate"],
        help="Substrings para priorizar/restringir URLs internas",
    )
    parser.add_argument(
        "--fields",
        nargs="*",
        choices=DEFAULT_FIELDS,
        default=list(DEFAULT_FIELDS),
    )
    parser.add_argument("--timeout-ms", type=int, default=30000)
    parser.add_argument("--json-out", type=Path)
    parser.add_argument("--csv-out", type=Path)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    fields = tuple(args.fields)

    if args.mode == "html":
        results = crawl_html(args.url, args.max_pages, args.include, fields)
    elif args.mode == "browser":
        results = crawl_browser(args.url, args.max_pages, args.include, fields, args.timeout_ms)
    else:
        results = run_auto_mode(args.url, args.max_pages, args.include, fields, args.timeout_ms)

    results = dedupe_findings(results)
    print_stdout(results)

    if args.json_out:
        write_json(args.json_out, results)
    if args.csv_out:
        write_csv(args.csv_out, results)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
