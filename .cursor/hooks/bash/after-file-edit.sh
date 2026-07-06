#!/usr/bin/env bash
# Cursor hook: afterFileEdit
# stdin: JSON con file_path (ruta absoluta) y edits (ver docs Cursor).
# Comportamiento: Prettier/ESLint condicionales + aviso stderr si hay console.log.
# Salida: sin JSON obligatorio; exit 0. Avisos solo por stderr.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/hook-io.sh
source "$SCRIPT_DIR/lib/hook-io.sh"

input=$(cat)
file_path=$(hook_json_field "$input" file_path)

if [ -z "$file_path" ] || [ ! -f "$file_path" ]; then
  exit 0
fi

project_root="${CURSOR_PROJECT_DIR:-.}"

# --- Formato (Prettier + ESLint) si hay config en la raíz del proyecto ---
if command -v npx >/dev/null 2>&1; then
  has_prettier=false
  for cfg in .prettierrc .prettierrc.json .prettierrc.js .prettierrc.cjs .prettierrc.yml prettier.config.js prettier.config.cjs prettier.config.mjs; do
    if [ -f "$project_root/$cfg" ]; then
      has_prettier=true
      break
    fi
  done

  has_eslint=false
  for cfg in .eslintrc.json .eslintrc.js .eslintrc.cjs .eslintrc.yml eslint.config.js eslint.config.mjs eslint.config.ts; do
    if [ -f "$project_root/$cfg" ]; then
      has_eslint=true
      break
    fi
  done

  case "$file_path" in
    *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.scss|*.md)
      if [ "$has_prettier" = true ]; then
        npx --yes prettier --write "$file_path" >/dev/null 2>&1 || true
      fi
      ;;
  esac

  case "$file_path" in
    *.ts|*.tsx|*.js|*.jsx)
      if [ "$has_eslint" = true ]; then
        lint_output=$(npx --yes eslint --fix "$file_path" 2>&1) || true
        if [ -n "$lint_output" ]; then
          echo "$lint_output" | head -5 >&2
        fi
      fi
      ;;
  esac
fi

# --- Aviso console.log (JS/TS) ---
case "$file_path" in
  *.ts|*.tsx|*.js|*.jsx)
    matches=$(grep -n 'console\.log' "$file_path" 2>/dev/null || true)
    if [ -n "$matches" ]; then
      echo "[Hook] console.log found in $(basename "$file_path"):" >&2
      echo "$matches" | head -5 >&2
      echo "[Hook] Prefer logger or remove before committing." >&2
    fi
    ;;
esac

exit 0
