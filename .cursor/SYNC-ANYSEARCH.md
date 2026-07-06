# Actualizar AnySearch skill (Cursor hub)

Upstream: [anysearch-ai/anysearch-skill](https://github.com/anysearch-ai/anysearch-skill) (Apache-2.0).

Hub copy: `.cursor/skills/anysearch/` — **flat layout** for Cursor discovery (`skills/<name>/SKILL.md`).

Vendor mirror: `vendor/anysearch-skill/` — pull upstream here, then sync into the hub skill folder.

## Primera instalación (ya hecha en el hub)

```powershell
cd "C:\Users\zelda\Documents\ESTUDIO PROGRAMACION\RULES"

git clone --depth 1 https://github.com/anysearch-ai/anysearch-skill.git vendor/anysearch-skill
node .cursor/scripts/sync-anysearch-skill.mjs
node .cursor/scripts/audit-skills-trust.mjs --skill anysearch
```

## Actualizar desde upstream

```powershell
cd "C:\Users\zelda\Documents\ESTUDIO PROGRAMACION\RULES"

git -C vendor/anysearch-skill pull origin main
node .cursor/scripts/sync-anysearch-skill.mjs
# Vista previa:
#   node .cursor/scripts/sync-anysearch-skill.mjs --dry-run

node .cursor/scripts/audit-skills-trust.mjs --skill anysearch
```

## Qué copia el script

| Origen (vendor) | Destino (hub) | Sobrescribe |
| --- | --- | --- |
| `scripts/**` | `.cursor/skills/anysearch/scripts/` | Sí |
| `.env.example`, `runtime.conf.example` | skill root | Sí |
| `SKILL.md` | `references/full-guide.md` | Sí |
| — | `SKILL.md` (router hub) | **No** |
| — | `.env`, `runtime.conf` | **No** |

## Configurar API key (opcional)

```powershell
copy .cursor\skills\anysearch\.env.example .cursor\skills\anysearch\.env
# Editar .env: ANYSEARCH_API_KEY=<placeholder>
```

O variable de entorno del sistema. Ver `api-key-security` y `anysearch/SKILL.md`.

## Regenerar runtime.conf

Tras clonar en otra máquina, detectar runtime y escribir `runtime.conf`:

```powershell
$dst = ".cursor/skills/anysearch"
$sd = (Resolve-Path $dst).Path.Replace('\','/')
if (Get-Command python -ErrorAction SilentlyContinue) {
  "Runtime: Python`nCommand: python $sd/scripts/anysearch_cli.py" | Set-Content "$dst/runtime.conf"
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
  "Runtime: Python`nCommand: python3 $sd/scripts/anysearch_cli.py" | Set-Content "$dst/runtime.conf"
} elseif (Get-Command node -ErrorAction SilentlyContinue) {
  "Runtime: Node.js`nCommand: node $sd/scripts/anysearch_cli.js" | Set-Content "$dst/runtime.conf"
} else {
  "Runtime: PowerShell`nCommand: powershell -ExecutionPolicy Bypass -File $sd/scripts/anysearch_cli.ps1" | Set-Content "$dst/runtime.conf"
}
```

Verificación rápida:

```powershell
python .cursor/skills/anysearch/scripts/anysearch_cli.py search "hello" --max_results 1
```

## Archivos

| Ruta | Rol |
| --- | --- |
| `vendor/anysearch-skill/` | Upstream; `git pull` aquí |
| `.cursor/scripts/sync-anysearch-skill.mjs` | Sync vendor → hub skill |
| `.cursor/skills/anysearch/SKILL.md` | Router + seguridad hub (manual) |
| `.cursor/skills/anysearch/references/full-guide.md` | Copia operativa upstream |
| `.cursor/skills/.sync-manifest.json` | Entrada `hubLocal` → `anysearch` |

## Manifest

Entrada en `hubLocal` con `"pack": "hub-research"`. El sync actualiza `syncedAt` / `upstreamVersion` en esa fila cuando corre.
