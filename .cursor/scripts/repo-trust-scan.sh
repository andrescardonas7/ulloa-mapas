#!/usr/bin/env bash
# Thin wrapper — logic lives in repo-trust-scan.mjs
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec node "$SCRIPT_DIR/repo-trust-scan.mjs" "$@"
