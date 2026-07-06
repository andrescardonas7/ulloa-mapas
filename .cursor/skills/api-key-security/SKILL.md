---
name: api-key-security
description: >-
  Load when auditing, configuring, or hardening API keys, tokens, OAuth/webhook
  secrets, private keys, connection strings, environment variables, Claude/Cursor
  settings (settings.json, settings.local.json), MCP configs, .env / .env.* files,
  CI/CD secret stores, or agent permission allowlists. Triggers: "is this API
  configured securely", credential leak, key rotation, redact secret, exfiltration
  risk, broad bash allowlist, secrets in repo, credenciales expuestas, fugas de
  tokens, revisar configuración segura. Do NOT load for generic API design,
  rate-limiting, REST/GraphQL schema work, or non-credential config questions.
---

# API Key Security

## When NOT to load

- General API design, REST/GraphQL contracts, rate limiting, retries, or business logic.
- Pure dependency upgrades or refactors that do not touch secrets or permission allowlists.
- Documentation-only edits where no real credential is present (use placeholders in examples without invoking this skill).

## Non-Negotiable Rules

1. Treat every API key, token, webhook secret, OAuth credential, private key, session cookie, and connection string as sensitive.
2. Never place secrets in committed or shared files. Keep them in environment variables, secret managers, CI secret stores, or local-only files ignored by git.
3. If a secret appears in chat, logs, terminal output, code review, git history, screenshots, or a shared file, assume it is compromised and recommend rotation.
4. Never print, echo, summarize, transform, validate, or partially reveal a secret value. Refer to it as `[REDACTED]`.
5. Do not run commands that dump the full environment (`set`, `env`, `printenv`, `Get-ChildItem Env:`) unless the user explicitly requests it and accepts the risk.

## Where Secrets Belong

Preferred order:

1. OS/user environment variables or a secret manager.
2. CI/CD secret storage for automation.
3. Local-only config such as `settings.local.json`, `.env.local`, or `.env.development.local`, only when ignored by git.

Avoid:

1. `settings.json`, project config, source files, docs, examples, tests, fixtures, notebooks, screenshots, transcripts, shell history, or generated reports.
2. Public package metadata, Dockerfiles, compose files, lockfiles, or build artifacts.
3. "Temporary" files that are not covered by `.gitignore`.

## Review Workflow

When asked to review API configuration or API key security:

1. Identify all config files involved (`settings.json`, local overrides, `.env*`, MCP configs, CI files, deployment config).
2. Check whether secrets are present in shared or versionable files.
3. Verify local secret files are ignored by git before recommending they store secrets.
4. Confirm API endpoints use HTTPS and point to the intended provider.
5. Review agent permissions for commands that can leak secrets or exfiltrate data.
6. Recommend key rotation if any credential was exposed.
7. Apply minimal, reversible changes only after the user authorizes edits.

## Claude And Cursor Agent Configs

For Claude/Cursor settings:

1. Keep provider URLs and model names in shared config when they are not sensitive.
2. Keep `ANTHROPIC_API_KEY`, provider API keys, MCP tokens, OAuth secrets, database URLs, and webhook secrets out of `settings.json`.
3. Store local Claude overrides in `settings.local.json` only if that file is ignored.
4. Prefer OS environment variables for credentials whenever practical.
5. Add deny rules for reading `.env` files and commands commonly used for exfiltration (`curl`, `wget`) unless the project explicitly needs them.
6. Avoid broad command allowlists such as `Bash(set:*)`, `Bash(env:*)`, `Bash(printenv:*)`, `Bash(powershell *Env*)`, and destructive commands.
7. Require confirmation for publishing, pushing, merging, deployment, package release, or force operations.
8. Disable bypass-permissions modes when supported by the tool.

## Safe Patterns

Use placeholders in shared files:

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.example.com/anthropic"
  }
}
```

Keep secrets local or in the OS environment:

```json
{
  "env": {
    "ANTHROPIC_API_KEY": "[REDACTED]"
  }
}
```

Ensure the local file is ignored:

```gitignore
settings.local.json
.env
.env.*
!.env.example
```

## Unsafe Patterns

Do not create or approve:

```json
{
  "env": {
    "ANTHROPIC_API_KEY": "[REDACTED_API_KEY]"
  }
}
```

Do not suggest:

```shell
set
env
printenv
curl "https://example.com?token=$API_KEY"
```

## Gotchas (errores frecuentes del agente)

- Confundir **URL/base endpoint** con secreto: `ANTHROPIC_BASE_URL` es config no sensible; `ANTHROPIC_API_KEY` sí lo es. No mover URLs a `settings.local.json` por defecto.
- Sugerir `cat .env`, `Get-Content .env`, `type .env` o `printenv` para “verificar” valores: filtran el secreto al transcript y a logs. Verificar **presencia** (longitud, prefijo redactado) sin imprimir el valor.
- Generar `.env.example` copiando un `.env` real: arrastra valores. Construirlo desde cero con placeholders.
- Añadir un secreto a `git` y luego “quitarlo” en el siguiente commit: queda en el historial. Tratar como **comprometido** y **rotar**.
- Usar `--no-verify` para saltarse hooks que detectan secretos, o aceptar advertencias de `gitleaks`/`trufflehog` sin acción.
- Allowlists demasiado amplias en agentes: `Bash(*)`, `Bash(curl:*)`, `Bash(env:*)` o equivalentes habilitan exfiltración trivial.
- Dejar tokens en URLs (`?token=...`) o en cabeceras volcadas a logs/HAR/screenshots.
- Tratar `webhook secret`, `signing key`, `JWT secret`, `database URL` con credenciales o `service account JSON` como “configuración”: son secretos.
- En MCP, pegar tokens directos en el `args` o `env` de un servidor compartido en vez de usar variables del sistema o un secret store.
- Borrar el secreto de la pantalla pero no del scrollback del terminal, del historial de shell, ni del transcript: recordar limpieza completa o asumir compromiso.

## Response Standard

When reporting findings:

1. Lead with critical exposures and required rotations.
2. Name files and config keys, but redact values.
3. Separate configuration correctness from security risk.
4. Say exactly what was changed and what still requires user action.
5. If a key was exposed, include: "Rotate this key before relying on the configuration."

