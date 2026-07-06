# AI rules constitution (hub)

This file is the **short contract** for assistants working in repos that use this `.cursor` hub. Detailed behavior lives in `.mdc` rules under `rules/` and in `cursor-config.json`.

## Non-negotiables

- Do not commit or print secrets; load sensitive config from the environment.
- Validate external input; avoid unsafe shell composition with user-controlled strings.
- Match the **project’s** package manager and stack when they differ from hub defaults. Always-on `01_code-standards` and `supply-chain-security` include a **Stack scope** section: pnpm/TypeScript apply only when `package.json` (or hub Node tooling) is in play; for Python, R, QGIS, Go, Rust, use that ecosystem’s manifests and `03-languages/*` rules.

## Defaults this hub assumes (override per project)

- Prefer small modules: roughly **under 300 lines** per file, **under 50 lines** per function where practical — applies to **product code**, not necessarily to large hub `.mdc` reference guides (those load on demand).
- TypeScript/JavaScript: strict typing; avoid `any` without justification.

## Where to look next

| Topic | Location |
| --- | --- |
| Which rules are always on vs on-demand | [`README.md`](README.md) in this folder |
| Workflow defaults for agents (human/agent reference — **not** read by Cursor natively) | [`cursor-config.json`](cursor-config.json) |
| Skills (workflows, audits) | `../skills/` |

If requirements are ambiguous, ask targeted questions before large refactors.
