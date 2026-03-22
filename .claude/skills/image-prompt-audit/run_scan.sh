#!/usr/bin/env bash
# run_scan.sh — wrapper para image_prompt_audit.py
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOOLS_DIR="$(cd "${SCRIPT_DIR}/../../../tools" && pwd)"

python3 "${TOOLS_DIR}/image_prompt_audit.py" "$@"
