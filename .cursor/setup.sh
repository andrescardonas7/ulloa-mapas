#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HUB_ROOT="${SCRIPT_DIR}"
PROJECT_ROOT="${PROJECT_ROOT:-$(cd "${SCRIPT_DIR}/.." && pwd)}"
TARGETS="cursor,vscode"
RUN_GLOBAL=0
CREATE_PLACEHOLDERS=1
INACTIVE_NON_CURSOR=0
ACTIVE_NON_CURSOR=0

print_help() {
  cat <<'EOF'
Usage:
  ./setup.sh [--project <path>] [--targets cursor,vscode,...] [--all]
             [--global] [--no-placeholders]
             [--inactive-non-cursor|--active-non-cursor]

Defaults:
  --targets cursor,vscode
  --project = parent of this .cursor folder
  --placeholders enabled (creates .opencode/.agent/.claude folders without linking)
  --all implies inactive non-cursor unless --active-non-cursor is used

Examples:
  ./setup.sh
  ./setup.sh --project "/path/to/repo" --targets cursor,vscode
  ./setup.sh --all --global
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project)
      PROJECT_ROOT="$2"
      shift 2
      ;;
    --targets|--target|--only)
      TARGETS="$2"
      shift 2
      ;;
    --all)
      TARGETS="all"
      shift
      ;;
    --global)
      RUN_GLOBAL=1
      shift
      ;;
    --inactive-non-cursor)
      INACTIVE_NON_CURSOR=1
      shift
      ;;
    --active-non-cursor)
      ACTIVE_NON_CURSOR=1
      shift
      ;;
    --no-placeholders)
      CREATE_PLACEHOLDERS=0
      shift
      ;;
    -h|--help)
      print_help
      exit 0
      ;;
    *)
      echo "Unknown argument: $1"
      print_help
      exit 1
      ;;
  esac
done

node "${HUB_ROOT}/scripts/cursor-hub.mjs" export

EXTRA_FLAGS=()
if [[ "${INACTIVE_NON_CURSOR}" -eq 1 ]]; then
  EXTRA_FLAGS+=("--inactive-non-cursor")
fi
if [[ "${ACTIVE_NON_CURSOR}" -eq 1 ]]; then
  EXTRA_FLAGS+=("--active-non-cursor")
fi

if [[ "${TARGETS}" == "all" ]]; then
  node "${HUB_ROOT}/scripts/cursor-hub.mjs" install --project "${PROJECT_ROOT}" --all "${EXTRA_FLAGS[@]}"
else
  node "${HUB_ROOT}/scripts/cursor-hub.mjs" install --project "${PROJECT_ROOT}" --targets "${TARGETS}" "${EXTRA_FLAGS[@]}"
fi

if [[ "${RUN_GLOBAL}" -eq 1 ]]; then
  if [[ "${TARGETS}" == "all" ]]; then
    node "${HUB_ROOT}/scripts/cursor-hub.mjs" install --global --all
  else
    node "${HUB_ROOT}/scripts/cursor-hub.mjs" install --global --targets "${TARGETS}"
  fi
fi

if [[ "${CREATE_PLACEHOLDERS}" -eq 1 ]]; then
  mkdir -p "${PROJECT_ROOT}/.opencode" "${PROJECT_ROOT}/.agent" "${PROJECT_ROOT}/.claude"
fi
