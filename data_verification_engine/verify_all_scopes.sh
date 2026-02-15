#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

python3 "$ROOT_DIR/run_trust_pack.py"

echo "Trust pack passed for all configured scopes (vc1, vc2, in)."
