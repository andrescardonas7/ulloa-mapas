#!/usr/bin/env bash
# Shared stdin/stdout helpers for Cursor hook scripts.
# Prefer jq; fall back to python or sed when jq is not on PATH (common on Windows Git Bash).

hook_json_field() {
  local input="$1"
  local key="$2"
  local default="${3:-}"

  if command -v jq >/dev/null 2>&1; then
    echo "$input" | jq -r --arg k "$key" --arg d "$default" '.[$k] // $d'
    return 0
  fi

  if command -v python >/dev/null 2>&1; then
    printf '%s' "$input" | python -c '
import json, sys
key = sys.argv[1]
default = sys.argv[2]
try:
    data = json.load(sys.stdin)
    value = data.get(key, default)
    if value is None:
        value = default
    print(value, end="")
except (json.JSONDecodeError, ValueError):
    print(default, end="")
' "$key" "$default"
    return 0
  fi

  local value
  value=$(printf '%s' "$input" | sed -n "s/.*\"${key}\"[[:space:]]*:[[:space:]]*\"\\([^\"]*\\)\".*/\\1/p" | head -1)
  if [ -n "$value" ]; then
    printf '%s' "$value"
  else
    printf '%s' "$default"
  fi
}

hook_permission_json() {
  local permission="$1"
  local user_message="$2"
  local agent_message="$3"

  if command -v jq >/dev/null 2>&1; then
    jq -nc \
      --arg p "$permission" \
      --arg u "$user_message" \
      --arg a "$agent_message" \
      '{"permission":$p,"user_message":$u,"agent_message":$a}'
    return 0
  fi

  if command -v python >/dev/null 2>&1; then
    python -c 'import json,sys; print(json.dumps({"permission":sys.argv[1],"user_message":sys.argv[2],"agent_message":sys.argv[3]}))' \
      "$permission" "$user_message" "$agent_message"
    return 0
  fi

  user_message=${user_message//\\/\\\\}
  user_message=${user_message//\"/\\\"}
  agent_message=${agent_message//\\/\\\\}
  agent_message=${agent_message//\"/\\\"}
  printf '{"permission":"%s","user_message":"%s","agent_message":"%s"}\n' \
    "$permission" "$user_message" "$agent_message"
}
