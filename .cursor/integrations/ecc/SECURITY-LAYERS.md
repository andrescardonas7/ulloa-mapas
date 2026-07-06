# ECC security — qué teníamos, qué faltaba, qué se añadió

Fuente: [affaan-m/ECC](https://github.com/affaan-m/ECC) (MIT). **Solo Cursor** salvo nota Alfred.

## Matriz de cobertura

| Capacidad ECC | Ya en el hub | Acción |
| ------------- | ------------ | ------ |
| `security-review` (código) | Sí — `.cursor/skills/security-review` | **Mantener** (no duplicar ECC) |
| Trail of Bits / Semgrep / CodeQL | Sí | **Mantener** |
| `security-scan` + AgentShield | Parcial — comando + `ecc-agentshield-cursor` | **Unificar** → skill `agent-harness-security`, `/security-scan` en 2 fases |
| Hooks: secretos en prompt | Parcial | **Ampliar** patrones en `before-submit-prompt.js` |
| Hooks: Tab / read `.env` | Tab block sí | **Añadir** `before-read-file.cjs` (deny en paths sensibles; lectura temprana de stdin) |
| Hooks: MCP audit | No | **Añadir** `before/after-mcp-execution.js` + log local |
| Hooks: config-protection | No | **Añadir** `config-protection.cjs` en `afterFileEdit` |
| `production-audit` | No | **Copiar** skill |
| `workspace-surface-audit` | No | **Copiar** como `ecc-workspace-surface-audit` |
| `skill-comply` | No | **Omitir** (coste alto; pedir explícito si lo quieren) |
| `security-guard` (bot) | Alfred vía OpenClaw | **Sin cambio** — capa 3 separada |

## Orden recomendado de escaneo

1. **Código**: `security-review` + Trivy (`/security-scan` fase A)
2. **Config agente**: `npx ecc-agentshield scan --path .cursor` (`/agent-config-scan`)
3. **Pre-ship**: `production-audit` skill
4. **Inventario MCP/env**: `ecc-workspace-surface-audit` (solo nombres de claves, nunca valores)

## Archivos nuevos / tocados

```
.cursor/hooks/ecc/config-protection.cjs
.cursor/hooks/ecc/before-read-file.cjs
.cursor/hooks/ecc/read-stdin-head.cjs       # no esperar content completo en stdin
.cursor/hooks/ecc/before-mcp-execution.cjs
.cursor/hooks/ecc/after-mcp-execution.cjs
.cursor/hooks.json                          # eventos MCP + read + config-protection
.cursor/skills/agent-harness-security/
.cursor/skills/production-audit/
.cursor/skills/ecc-workspace-surface-audit/
.cursor/commands/agent-config-scan.md
.cursor/commands/security-scan.md           # 2 fases
```

## Perfiles de hook

- `ECC_HOOK_PROFILE=minimal` — secretos en prompt + warn read sensibles
- `standard` (default) — + MCP log, config-protection, Tab block
- `strict` — igual que standard (reservado para endurecer más adelante)

Desactivar uno: `ECC_DISABLED_HOOKS=config-protection,before-mcp-execution`

**Nota:** Tras cambiar hooks, recarga la ventana de Cursor (`Developer: Reload Window`) para que `beforeReadFile` deje de devolver JSON inválido por timeout de stdin.
