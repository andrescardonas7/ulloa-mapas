# Contrato de hooks (Cursor Agent)

Referencia rápida para **Cursor**, **Cloud Agents** y **LLMs** que editan este repo. Fuente normativa: [Cursor Hooks](https://cursor.com/docs/agent/hooks).

## Ubicación y CWD

| Archivo | Rol |
|---------|-----|
| `.cursor/hooks.json` | Registro único de eventos → comandos (relativos a la **raíz del proyecto**). |
| `.cursor/hooks/bash/*.sh` | Scripts ejecutados; el proceso hijo tiene CWD = raíz del repo (proyecto). |

Los paths en `command` deben ser del estilo `.cursor/hooks/bash/...`, no `./hooks/...`.

## Opciones por entrada (schema v1)

Campos que Cursor reconoce en cada definición:

- `type`: `"command"` (por defecto) o `"prompt"`.
- `command`: ruta o comando.
- `timeout`: segundos.
- `matcher`: filtro en formato **regex estilo JavaScript** (no POSIX). Depende del evento qué texto se compara.
- `failClosed`: si `true`, fallo del script/timeouts bloquea la acción (por defecto fail-open).

## Eventos activos y stdin (resumen)

### `afterFileEdit`

- **stdin:** `{ "file_path": "<abs>", "edits": [...] }`
- **Script:** `bash/after-file-edit.sh` — Prettier/ESLint si hay config; aviso `stderr` si hay `console.log` en `.ts`/`.tsx`/`.js`/`.jsx`.
- **Script (matcher):** `bash/after-lockfile-edit.sh` — si el `matcher` casa con `package.json`, lockfiles (`pnpm-lock.yaml`, etc.), `requirements*.txt`, `pyproject.toml`, `Cargo.lock`, `go.sum`, o workflows `.github/workflows/*.yml`, escribe en **stderr** un checklist mínimo de supply chain (lifecycle scripts, transitive inesperados, permisos CI). No bloquea.
- **Salida:** no se requiere JSON en stdout para este evento.

### `beforeShellExecution`

- **stdin:** incluye `command` (línea completa).
- **stdout:** JSON con `permission`: `allow` | `deny` | `ask`, opcional `user_message`, `agent_message`.
- **Exit 2:** equivale a denegar.
- **Script:** `bash/before-shell-guard.sh` — solo se ejecuta si el `matcher` del hook coincide con el comando (comandos destructivos / `--no-verify` / etc.).
- **Script (matcher):** `bash/before-pkg-install.sh` — supply chain: niega `curl … | sh/bash`, `iwr … | iex`, `--legacy-peer-deps`, y `--force` en contexto `npm|pnpm|yarn|npx`; pide confirmación en `npm install` / `pnpm update|upgrade` / `yarn`.

### `afterShellExecution`

- **stdin:** `{ "command", "output", "duration", "sandbox" }`.
- **Script:** `bash/after-shell-pr.sh` — el `matcher` limita a `gh pr create` para no ejecutar el hook en cada shell.

### `stop`

- **stdin:** `{ "status": "completed"|"aborted"|"error", "loop_count": number }`.
- **Script:** `bash/stop-console-audit.sh` — auditoría final de `console.log` en cambios git respecto al árbol de trabajo.

## Dependencias del entorno

- `bash`, `jq` (opcional; respaldo con `python`/`sed` en `bash/lib/hook-io.sh`), y `git` en el PATH del hook.
- `npx` cuando el proyecto define Prettier/ESLint.

## Pila opcional Node

`.cursor/hooks/ecc-node/` contiene adaptadores estilo ECC; requieren `scripts/hooks/` en la raíz del repo. Ver `ecc-node/README.md`. No están registrados en `hooks.json` por defecto.
