#!/usr/bin/env bash
# Cursor hook: afterFileEdit — reminders when dependency or CI manifests change.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/hook-io.sh
source "$SCRIPT_DIR/lib/hook-io.sh"

input=$(cat)
file_path=$(hook_json_field "$input" file_path)

normalized=${file_path//\\//}

if ! echo "$normalized" | grep -qiE '(package\.json|pnpm-lock\.yaml|package-lock\.json|yarn\.lock)$|requirements.*\.txt$|pyproject\.toml$|Cargo\.lock$|go\.sum$|\.github/workflows/[^/]+\.ya?ml$'; then
  exit 0
fi

cat >&2 <<'TXT'
SUPPLY_CHAIN_EDIT checklist ( antes de cerrar PR )
- ¿Paquete o versión nueva necesaria para la tarea?
- ¿Hay lifecycle scripts (pre/install/post) en paquetes nuevos?
- ¿Cambiaron maintainer, registry, tarball, integridad sin explicación?
- ¿Versión publicada muy reciente (<72h)?
- ¿Workflow expone secretos a forks o usa pull_request_target sin aislar?
TXT

exit 0
