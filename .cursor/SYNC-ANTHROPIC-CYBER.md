# Actualizar skills Anthropic Cybersecurity (Cursor)

Catálogo upstream: [mukul975/Anthropic-Cybersecurity-Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills) (Apache-2.0, comunidad — no afiliado a Anthropic PBC).

El hub **no importa las 754 skills**. Solo copia la **allowlist curada** en `.cursor/scripts/cyber-skills-allowlist.json` (~56 skills en dominios prioritarios: threat intel, DFIR, SOC, containers, AI/ATLAS, IR, secops, endpoint).

Complementa el **SecOps pack** del hub (`web-pentest`, `threat-hunting`, etc.) con playbooks **granulares**; **no los sobrescribe**.

## Cuando quieras traer la última versión

En PowerShell, desde la raíz del repo **`RULES`**:

```powershell
cd "C:\Users\zelda\Documents\ESTUDIO PROGRAMACION\RULES"

# 1) Actualizar el submódulo (código upstream)
git submodule update --init vendor/anthropic-cybersecurity-skills
git -C vendor/anthropic-cybersecurity-skills pull origin main

# 2) Sincronizar allowlist -> .cursor/skills/
node .cursor/scripts/sync-cyber-skills.mjs
# Vista previa:
#   node .cursor/scripts/sync-cyber-skills.mjs --dry-run

# 3) Trust audit solo del lote importado
node .cursor/scripts/audit-skills-trust.mjs --anthropic-cyber
# o: pnpm --dir .cursor audit:skills:anthropic-cyber
```

Primera vez sin submódulo inicializado:

```powershell
git submodule update --init --recursive
# o clone manual:
git clone --depth 1 https://github.com/mukul975/Anthropic-Cybersecurity-Skills.git vendor/anthropic-cybersecurity-skills
```

## Qué hace el script

- Lee `vendor/anthropic-cybersecurity-skills/skills/<name>/`.
- Copia solo entradas de `cyber-skills-allowlist.json`.
- **No sobrescribe** skills en `hubLocal`, Trail of Bits, ni playbooks SecOps del hub.
- Escribe **`anthropicCyber`** en `.cursor/skills/.sync-manifest.json` (dominios + trazabilidad).
- **`--prune`**: borra carpetas que estaban en `anthropicCyber` pero ya no están en la allowlist.

## Ampliar la allowlist

1. Edita `.cursor/scripts/cyber-skills-allowlist.json` (añade `{ "name": "...", "subdomain": "..." }`).
2. Comprueba que el nombre **no** colisione con skills hub/ToB (`sync` avisa si está protegido).
3. `node .cursor/scripts/sync-cyber-skills.mjs --dry-run` → sync real → `audit-skills-trust.mjs --anthropic-cyber`.

Buscar nombres upstream: carpeta bajo `vendor/anthropic-cybersecurity-skills/skills/` o `index.json` en la raíz del vendor.

## Archivos

| Ruta | Rol |
|------|-----|
| `vendor/anthropic-cybersecurity-skills/` | Submódulo Git; aquí haces `git pull` |
| `.cursor/scripts/cyber-skills-allowlist.json` | Lista curada (editable) |
| `.cursor/scripts/sync-cyber-skills.mjs` | Sincroniza hacia `.cursor/skills/` |
| `.cursor/skills/using-cyber-skills/` | Meta-skill: cuándo usar pack hub vs skills granulares |
| `.cursor/skills/.sync-manifest.json` | Sección `anthropicCyber` |

## Para agentes en Cursor

- **Playbooks amplios (autorizados):** `web-pentest`, `red-team-ops`, `threat-hunting`, `incident-response`, …
- **Procedimientos granulares (SOC/DFIR/GRC):** skills `anthropicCyber` en manifest — p. ej. `performing-memory-forensics-with-volatility3`, `processing-stix-taxii-feeds`.
- **Entrada recomendada:** abrir `using-cyber-skills/SKILL.md` cuando la tarea sea blue team, DFIR, threat intel o SOC y no encaje solo en un playbook ancho.

## Relación con Trail of Bits

| Origen | Sync | Rol |
|--------|------|-----|
| Trail of Bits | `sync-trailofbits-skills.mjs` | Auditoría de código, fuzzing, Semgrep/CodeQL |
| Anthropic Cyber | `sync-cyber-skills.mjs` | Operaciones SOC/DFIR/threat intel granulares |
| Hub local | manual | Workflow de ingeniería, supply chain guards, meta-skills |

Los dos sync scripts **preservan** las secciones del manifest que no gestionan.
