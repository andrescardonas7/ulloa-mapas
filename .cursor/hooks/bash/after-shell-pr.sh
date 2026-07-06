#!/usr/bin/env bash
# Cursor hook: afterShellExecution
# Logs the PR URL and review command after gh pr create.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/hook-io.sh
source "$SCRIPT_DIR/lib/hook-io.sh"

input=$(cat)
cmd=$(hook_json_field "$input" command)
output=$(hook_json_field "$input" output)
if echo "$cmd" | grep -qE 'gh\s+pr\s+create'; then
  pr_url=$(echo "$output" | grep -oE 'https://github.com/[^/]+/[^/]+/pull/[0-9]+' || true)
  if [ -n "$pr_url" ]; then
    pr_num=$(echo "$pr_url" | grep -oE '[0-9]+$')
    echo "[Hook] PR created: $pr_url" >&2
    echo "[Hook] Review: gh pr view $pr_num" >&2
  fi
fi

exit 0
