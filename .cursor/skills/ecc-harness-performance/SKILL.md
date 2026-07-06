---
name: ecc-harness-performance
description: >-
  ECC-inspired harness tuning for Cursor only — ECC_HOOK_PROFILE, disabled hooks,
  session context limits, instincts path. Load when optimizing agent hooks, token use,
  or session memory in Cursor. Do NOT load for OpenClaw/Alfred (openclaw.json).
---

# ECC harness performance (Cursor)

Upstream: [affaan-m/ECC](https://github.com/affaan-m/ECC). Integrated in this hub without a full ECC install.

## Cursor vs OpenClaw

| System | Config |
| ------ | ------ |
| **Cursor** | `.cursor/hooks.json`, env vars below, `.cursor/integrations/ecc/` |
| **Alfred** | `openclaw.json`, `workspace/AGENTS.md` — **not** governed by this skill |

## Environment variables

| Variable | Values | Effect |
| -------- | ------ | ------ |
| `ECC_HOOK_PROFILE` | `minimal`, `standard`, `strict` | Gates ECC hooks under `.cursor/hooks/ecc/` |
| `ECC_DISABLED_HOOKS` | comma ids | Skip specific hooks |
| `ECC_SESSION_START_CONTEXT` | `on` / `off` | Instinct summary + `active-session-context.md` |
| `ECC_SESSION_START_MAX_CHARS` | number | Cap injected context (default 4000) |
| `ECC_CONTEXT_MONITOR_COST_WARNINGS` | `on` / `off` | Cost hints (if upstream tools enabled) |

`sessionStart` also sets `ECC_HUB_ROOT` to the `.cursor` directory path.

## Instincts (lightweight)

- Store YAML under `.cursor/hooks/state/instincts/personal/` or `inherited/`
- Frontmatter: `id`, `confidence` (0–1); body: `## Action` with one-line behavior
- Session hook writes `.cursor/hooks/state/active-session-context.md` for the agent to read if `additional_context` injection is flaky in Cursor

See **ecc-continuous-learning** for the full instinct workflow (ECC v2.1 concepts).

## Commands

| Command | Purpose |
| ------- | ------- |
| `/harness-audit` | Deterministic hub scorecard |
| `/quality-gate` | Repo check pipeline (no duplicate format hooks) |
| `/model-route` | Model tier heuristic |
| `/ecc-consult` | Search upstream ECC catalog |
| `/loop-start`, `/loop-status` | Operator loop runbooks |

## Do not

- Run `install.ps1 --profile full` on this repo
- Duplicate `afterFileEdit` format/tsc hooks (already in `hooks.json`)
- Point Alfred at 246 ECC skills without vetting each skill
