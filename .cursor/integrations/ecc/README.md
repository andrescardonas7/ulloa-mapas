# ECC integration (Cursor only)

Selective patterns from [affaan-m/ECC](https://github.com/affaan-m/ECC) (MIT). **This folder does not replace the Cursor hub** — it documents what was ported and how to extend without a full ECC install.

## Cursor vs OpenClaw

| Layer | Location | ECC integration |
| ----- | -------- | ----------------- |
| **Cursor agent** (IDE) | `.cursor/` | Yes — commands, hooks, skills, `scripts/ecc/` |
| **Alfred / OpenClaw bot** | `openclaw.json`, `workspace/AGENTS.md` | **No** — Alfred uses `security-guard`, `coding-guidelines`, and `skills.load.extraDirs`. Do not point Alfred at all 246 ECC skills unless you vet each one. |

## Security (organized)

See **[SECURITY-LAYERS.md](SECURITY-LAYERS.md)**.

## Interpreting `/harness-audit` scores

The upstream rubric expects `.claude/` and root `AGENTS.md`. This OpenClaw workspace uses `.cursor/` as the hub, so scores look low until you map checks manually (hooks → `.cursor/hooks.json`, skills → `.cursor/skills/`). Use the audit for **regression tracking**, not as a pass/fail gate.

## What was added

- **Harness audit**: `node .cursor/scripts/ecc/harness-audit.cjs` — `/harness-audit`
- **Quality gate**: `/quality-gate` — runs this repo's `check.mdc` pipeline (Trivy, lint), not a second formatter stack
- **Model routing**: `/model-route` — heuristic doc (no API calls)
- **ECC consult**: `/ecc-consult` — `npx ecc consult` against upstream catalog
- **Loops**: `/loop-start`, `/loop-status` — operator runbooks (optional `npx ecc-universal` CLI)
- **Hooks** (`.cursor/hooks/ecc/`): secret-in-prompt warning, Tab block on `.env`/keys, session env defaults. **Does not** duplicate existing `afterFileEdit` / `beforeShellExecution` hooks.
- **Instincts** (optional): YAML under `.cursor/hooks/state/instincts/` — see skill `ecc-continuous-learning`
- **Agent harness security**: skill `agent-harness-security` — AgentShield on `.cursor/`, hook map, `/security-scan` phase B; complements Trail of Bits + Trivy, does not replace `security-review`

## Environment (harness performance)

Set in Windows user env or a project `.env` (never commit secrets):

```text
ECC_HOOK_PROFILE=standard          # minimal | standard | strict
ECC_DISABLED_HOOKS=                # comma-separated hook ids to skip
ECC_SESSION_START_CONTEXT=on       # off to skip instinct file generation
ECC_SESSION_START_MAX_CHARS=4000
ECC_CONTEXT_MONITOR_COST_WARNINGS=off
```

## Extending without breaking the hub

1. Preview: `npx ecc consult "your topic" --target cursor`
2. Install one skill only (from a clone of ECC):
   `node scripts/install-apply.js --skills <skill-id> --target cursor`
   Run from an ECC clone; prefer copying into `.cursor/skills/<name>/` with a distinct folder name.
3. Never run `install.ps1 --profile full` on this repo — duplicates hooks/skills.

## Upstream cache

Read-only clone: `%USERPROFILE%\.cache\checkouts\github.com\affaan-m\ECC` (via `remote-repo-cache` skill).

