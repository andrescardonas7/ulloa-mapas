# PM Skills (phuryn/pm-skills) en el hub Cursor

Catálogo upstream: [phuryn/pm-skills](https://github.com/phuryn/pm-skills) (MIT) — 68 skills y 42 comandos encadenados en 9 plugins de product management (discovery → strategy → execution → GTM → shipping de código AI).

El hub **no** tenía este pack (jun 2026). Se integra con el mismo patrón que Anthropic Cyber: **vendor + sync script + manifest + router**.

## Qué aporta (vs workflow de ingeniería del hub)

| Capa hub existente | PM Skills |
| --- | --- |
| `using-agent-skills` + `/spec`, `/plan`, `/build` | Ciclo **producto**: `/discover`, `/strategy`, `/write-prd`, `/plan-launch`, `/north-star` |
| `security-review`, `differential-review` | `pm-ai-shipping`: `/ship-check`, `/document-app`, `/security-audit-static` (intención documentada vs código) |
| Sin overlap de nombres | 0 colisiones de skills/comandos con el catálogo actual |

**Entrada recomendada para agentes:** `using-pm-skills/SKILL.md`.

## Primera vez / actualizar upstream

En PowerShell, desde la raíz del repo **`RULES`**:

```powershell
cd "C:\Users\zelda\Documents\ESTUDIO PROGRAMACION\RULES"

# 1) Vendor (shallow clone o pull)
if (-not (Test-Path vendor/phuryn-pm-skills)) {
  git clone --depth 1 https://github.com/phuryn/pm-skills.git vendor/phuryn-pm-skills
} else {
  git -C vendor/phuryn-pm-skills pull --ff-only origin main
}

# 2) Sincronizar skills (planas) + comandos Cursor
node .cursor/scripts/sync-pm-skills.mjs
# Vista previa:
#   node .cursor/scripts/sync-pm-skills.mjs --dry-run

# 3) Trust audit solo del lote PM
node .cursor/scripts/audit-skills-trust.mjs --pm-skills
# o: pnpm --dir .cursor audit:skills:pm
```

Opcional: `--prune` elimina skills/comandos que ya no existan en upstream (solo comandos gestionados por PM).

## Qué hace el script

- Lee `vendor/phuryn-pm-skills/pm-*/skills/<name>/` y copia a `.cursor/skills/<name>/` (layout **plano** requerido por Cursor).
- Lee `vendor/phuryn-pm-skills/pm-*/commands/<name>.md` y copia a `.cursor/commands/<name>.md`.
- **No sobrescribe** skills en `hubLocal`, Trail of Bits ni `anthropicCyber`.
- **No sobrescribe** comandos del hub que ya existían y no son del lote PM.
- Escribe **`pmSkills`** en `.cursor/skills/.sync-manifest.json`.

## Comandos de inicio rápido (tras sync)

| Comando | Cuándo |
| --- | --- |
| `/discover` | Idea nueva → supuestos → experimentos |
| `/strategy` | Claridad estratégica (Product Strategy Canvas) |
| `/write-prd` | PRD de feature |
| `/plan-launch` | Go-to-market |
| `/north-star` | Métrica norte + inputs |
| `/ship-check` | Repo vibe-coded → paquete listo para revisión |

Lista completa en el README upstream o en `pmSkills.commands` del manifest.

## Archivos

| Ruta | Rol |
| --- | --- |
| `vendor/phuryn-pm-skills/` | Clone upstream; `git pull` aquí |
| `.cursor/scripts/sync-pm-skills.mjs` | Sync skills + commands |
| `.cursor/skills/using-pm-skills/` | Meta-skill router (hub-local) |
| `.cursor/skills/.sync-manifest.json` | Sección `pmSkills` |

## Licencia y atribución

Upstream MIT — ver `vendor/phuryn-pm-skills/LICENSE`. Curado por Paweł Huryn / [The Product Compass](https://www.productcompass.pm/).

Tras importar skills de terceros: `node .cursor/scripts/audit-skills-trust.mjs --pm-skills` (política en `skills-audit-policy.mdc`).
