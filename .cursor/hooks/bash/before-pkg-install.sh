#!/usr/bin/env bash
# Cursor hook: beforeShellExecution — risky package installers and flags.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/hook-io.sh
source "$SCRIPT_DIR/lib/hook-io.sh"

input=$(cat)
cmd=$(hook_json_field "$input" command)

deny_json() {
  local um="$1"
  local am="$2"
  hook_permission_json deny "$um" "$am"
  exit 2
}

ask_json() {
  local um="$1"
  local am="$2"
  hook_permission_json ask "$um" "$am"
  exit 0
}

prefix='(^|[;&|[:space:]])'

# Pipe remote payloads into a shell — common supply-chain staging pattern.
if echo "$cmd" | grep -qiE 'curl([^|]*)\|[[:space:]]*(sh|bash)\b'; then
  deny_json \
    'Blocked: piping curl output into a shell is unsafe.' \
    'Reject curl|bash installers. Prefer an official installer with pinned version and checksums.'
fi

if echo "$cmd" | grep -qiE 'iwr([^|]*)\|[[:space:]]*iex\b'; then
  deny_json \
    'Blocked: piping Invoke-WebRequest into Invoke-Expression is unsafe.' \
    'Reject PowerShell one-liners that pipe remote scripts to iex.'
fi

if echo "$cmd" | grep -qiE '(^|[[:space:]])--legacy-peer-deps([[:space:]]|$)'; then
  deny_json \
    'Blocked: --legacy-peer-deps bypasses dependency resolution safeguards.' \
    'This workspace forbids legacy-peer-deps bypasses.'
fi

if echo "$cmd" | grep -qiE '(\bpnpm\b|\bnpm\b|\byarn\b|\bnpx\b)[^|]*--force([[:space:]]|$|,)' \
  || echo "$cmd" | grep -qiE -- '--force([[:space:]]|$|,)[^|]*\b(pnpm|npm|yarn|npx)\b'; then
  deny_json \
    'Blocked: forcing package installs is not allowed in this workspace.' \
    'Do not pass --force to npm/yarn/pnpm/npx here.'
fi

if echo "$cmd" | grep -qiE "${prefix}npm[[:space:]]+install\b"; then
  ask_json \
    'This runs npm install. Prefer intentional pnpm with exact deps (pnpm add PKG --save-exact). Proceed?' \
    'User policy: prefer pnpm —save-exact. Confirm npm install is intentional.'
fi

if echo "$cmd" | grep -qiE "${prefix}npm[[:space:]]+i\b"; then
  ask_json \
    'This runs npm i. Prefer intentional pnpm with exact deps. Proceed?' \
    'User policy: prefer pnpm for installs. Confirm npm i is intentional.'
fi

if echo "$cmd" | grep -qiE "${prefix}pnpm[[:space:]]+(update|upgrade)\b"; then
  ask_json \
    'pnpm update/upgrade can pull many transitive bumps. Explicit user approval?' \
    'Broad lockfile changes need review; confirm intent.'
fi

if echo "$cmd" | grep -qiE "${prefix}yarn\b"; then
  ask_json \
    'yarn command detected. Workspace standard is usually pnpm. Proceed?' \
    'Confirm Yarn is intentional for this repo.'
fi

exit 0
