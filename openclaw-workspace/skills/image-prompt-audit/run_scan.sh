#!/usr/bin/env bash
# run_scan.sh — wrapper para image_prompt_audit.py (openclaw workspace)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOOLS_DIR="$(cd "${SCRIPT_DIR}/../../.." && pwd)/tools"

python3 "${TOOLS_DIR}/image_prompt_audit.py" "$@"
