---
name: agent-harness-security
description: >-
  Security map for this hub — app code (security-review, Trivy, Semgrep), Cursor agent
  surface (AgentShield, hooks), Alfred (security-guard). Load for security audits,
  after changing hooks/MCP/rules, or comparing ECC vs existing stack. Cursor-focused;
  Alfred section is reference only.
origin: ECC patterns + existing hub (MIT where noted)
---

# Agent harness security

Organizes **what you already have** plus **ECC-derived guards** in `.cursor/hooks/ecc/`. Do not duplicate full ECC `security-review` (hub copy is canonical).

## Three layers (do not mix)

| Layer | What | Tools / skills |
| ----- | ---- | -------------- |
| **1. Application code** | APIs, auth, SQL, uploads | `security-review`, `semgrep`, `codeql`, Trail of Bits pack, `/security-audit` |
| **2. Cursor agent config** | `.cursor/` rules, skills, hooks, MCP, agents | **AgentShield**, hooks in `hooks.json`, this skill, `/security-scan` phase B |
| **3. Alfred / OpenClaw bot** | Messages, channels, `openclaw.json` | `security-guard` skill in OpenClaw — **not** AgentShield |

## Cursor hooks (ECC-derived, opt-in via profile)

| Hook | Profile | Behavior |
| ---- | ------- | -------- |
| `beforeSubmitPrompt` | minimal+ | Warn if prompt looks like a secret |
| `beforeTabFileRead` | standard+ | **Block** Tab reading `.env`/`.key`/`.pem` |
| `beforeReadFile` | minimal+ | **Deny** agent reads of `.env`/keys/credentials paths (fast stdin head parse) |
| `beforeMCPExecution` / `afterMCPExecution` | standard+ | Audit log → `.cursor/hooks/state/mcp-audit.log` |
| `config-protection` | standard+ | **Block** edits to eslint/prettier/biome configs |
| `beforeShellExecution` | standard | `npx block-no-verify` on `--no-verify` (ECC) |

Env: `ECC_HOOK_PROFILE=minimal|standard|strict`, `ECC_DISABLED_HOOKS=hook-id`

## AgentShield (ECC security-scan)

Scans **agent configuration**, not business logic.

```bash
npx ecc-agentshield scan --path .cursor --min-severity medium
```

| Severity | Examples |
| -------- | -------- |
| Critical | Hardcoded keys in rules/skills, `Bash(*)` allowlists, hook command injection |
| High | Auto-run instructions in rules, missing deny lists, over-broad MCP |
| Medium | `2>/dev/null` in hooks, `npx -y` MCP installs |

Outputs: `--format json|markdown|html`, safe auto-fix `--fix` (review diff first).

CI: `affaan-m/agentshield@v1` on `.cursor` path.

## Commands

| Command | Scope |
| ------- | ----- |
| `/security-scan` | Trivy (app) + optional AgentShield (`.cursor`) |
| `/security-audit` | Manual OWASP checklist (app) |
| `/agent-config-scan` | AgentShield only on `.cursor` |

## Related skills

| Skill | Use when |
| ----- | -------- |
| `agents-best-practices` | Designing or auditing a **product** agent harness (loop, tools, compaction, evals) — not Cursor config |
| `security-review` | Writing or reviewing app code |
| `production-audit` | Ship readiness, prod risk (local evidence) |
| `ecc-workspace-surface-audit` | Inventory MCP/plugins/env **names** (no secret values) |
| `npm-supply-chain-security` | Lockfiles, `.npmrc`, install scripts |

## What we intentionally did **not** import

- Duplicate `security-review` from ECC (same as hub)
- `skill-comply` (heavy Python lab; optional later)
- Full ECC hook stack on `afterFileEdit` (would fight format/tsc hooks)
- Bulk AgentShield on entire repo root without scoping (noisy)

## Alfred note

To harden Alfred, edit `openclaw.json` / `security-guard` — do not run AgentShield against WhatsApp message content. Cross-link only in docs.
