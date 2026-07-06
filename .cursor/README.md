# Cursor Hub (`.cursor`)

This folder is the **single source of truth** for your **Cursor** agent setup: rules, skills, hooks, agents, and slash commands. The installer (`cursor-hub`) can optionally export to other editors, but **this repository (`cursor-workspace`) tracks and documents the Cursor hub first**. Copilot/OpenCode exports (`.github/`, `.opencode/`) are **not committed** — see root `.gitignore`.

**Agent expectation:** Always review relevant **skills** before responding. Agents should actively consult skills to improve answer quality, search accuracy, and implementation decisions.

---

## For the agent: where to look

| Need | Location | Notes |
|------|----------|-------|
| **Behavior rules** (code quality, security, workflows, lang-specific) | [`rules/`](rules/README.md) | Path: `.cursor/rules/` · `.mdc` files; `RULE.md` is the constitution |
| **Skills** (domain workflows, audits, tooling) | [`skills/`](skills/README.md) | Path: `.cursor/skills/` · Each skill is a folder with `SKILL.md` |
| **Hooks** (before/after shell, file edit, stop) | [`.cursor/hooks.json`](hooks.json) · [`.cursor/HOOKS.md`](HOOKS.md) · [`hooks/`](hooks/README.md) | Scripts: `.cursor/hooks/bash/` · Opcional: `.cursor/hooks/ecc-node/` · Agentes: [`AGENTS.md`](../AGENTS.md) |
| **Agent personas** (architect, reviewer, planner, etc.) | [`agents/`](agents/README.md) | Path: `.cursor/agents/` · One `.md` per role |
| **Slash commands** (`/plan`, `/tdd`, `/code-review`, etc.) | [`commands/`](commands/README.md) | Path: `.cursor/commands/` · One `.md` per command |
| **Build/export/install scripts** | [`scripts/`](scripts/README.md) | Path: `.cursor/scripts/` · `cursor-hub.mjs`, `installer.mjs`, etc. |
| **Tests** (skills, plugins, triggers) | [`tests/`](tests/README.md) | Path: `.cursor/tests/` · Harnesses for Claude Code, OpenCode, skill-triggering |

---

## Folder map (with paths)

```
.cursor/
├── hooks.json           # Path: .cursor/hooks.json (Cursor hooks config)
├── agents/              # Path: .cursor/agents/ (role personas)
├── commands/            # Path: .cursor/commands/ (slash commands)
├── hooks/               # Path: .cursor/hooks/ (bash/ = active; ecc-node/ = optional ECC-style)
├── rules/               # Path: .cursor/rules/ (Cursor .mdc rules + RULE.md)
├── scripts/             # Path: .cursor/scripts/ (installer + export scripts)
├── skills/              # Path: .cursor/skills/ (skills; each has SKILL.md)
└── tests/               # Path: .cursor/tests/ (test harnesses)
```

---

## Installation and sync

- **Full guide (Spanish):** [GUIA-INSTALACION.md](GUIA-INSTALACION.md) — when to use `setup.sh` vs `cursor-hub`, `node` vs `npx`, and all scenarios.
- **Quick (from hub root):**

  ```bash
  node scripts/cursor-hub.mjs export
  node scripts/cursor-hub.mjs install --project "C:\path\to\your\app" --targets cursor
  ```

- **With npx (from any folder):**

  ```bash
  npx "C:\...\cursor-workspace\.cursor" export
  npx "C:\...\cursor-workspace\.cursor" install --project "C:\path\to\your\app" --targets cursor
  ```

**Targets (optional):** `cursor` (default), `vscode`, `opencode`, `antigravity`, `claude`. Exports to `.github/` or `.opencode/` stay **local** on your machine and are listed in the repo root `.gitignore` so they are not pushed to GitHub. The tracked exception is `/.github/workflows/` (CI like `hub-skills-audit.yml`), which is committed.

**Activate the Git pre-commit hook (per clone):** the skill trust audit only runs automatically on commit if the local activator exists. Run once after cloning:

```bash
node scripts/install-git-hooks.mjs   # or: pnpm --dir .cursor hooks:install
```

This writes `.git/hooks/pre-commit` delegating to the versioned `.githooks/pre-commit` (no `core.hooksPath` change). CI enforces the same audit via [`.github/workflows/hub-skills-audit.yml`](../.github/workflows/hub-skills-audit.yml).

---

## Prerequisites

The hooks system requires **bash** and **jq**. On Windows:

- **Bash**: Install [Git for Windows](https://git-scm.com/download/win) (includes Git Bash) or use WSL
- **jq**: `scoop install jq` or `choco install jq`
- **Trivy** (security scanning): `scoop install trivy` or `choco install trivy`

On macOS: `brew install jq trivy`

On Linux: `sudo apt install jq` and [Trivy installation](https://aquasecurity.github.io/trivy/latest/getting-started/installation/)

---

## Multi-project standard (reuse)

Using this hub across many repos is a **solid workflow** if you treat it as one maintained baseline:

- **Install, do not fork per app:** run `cursor-hub install --project …` (or `setup.sh`) so each project points at the same rules/skills; fix once in the hub, re-run `export` + `install` where needed.
- **Verify after changes:** `node scripts/cursor-hub.mjs doctor --project "…"` checks links, exports, and **skills trust** (layout plano + patrones maliciosos en `SKILL.md`).
- **Cloned or untrusted repo:** `node scripts/repo-trust-scan.mjs --target "…"` (read-only, before first install) — [`commands/repo-trust-scan.md`](commands/repo-trust-scan.md).
- **Override locally when the stack differs:** add project-specific `.mdc` files under that repo’s `.cursor/rules/`, or relax `alwaysApply` in the hub for stacks that are not Node/TypeScript (see [`rules/RULE.md`](rules/RULE.md)).
- **Refresh upstream skills:** after updating `vendor/trailofbits-skills`, run `npm run sync:trailofbits` from this folder (see [`SYNC-TRAILOFBITS.md`](SYNC-TRAILOFBITS.md)). For curated SOC/DFIR skills, update `vendor/anthropic-cybersecurity-skills` and run `npm run sync:cyber` (see [`SYNC-ANTHROPIC-CYBER.md`](SYNC-ANTHROPIC-CYBER.md)). For PM skills, update `vendor/phuryn-pm-skills` and run `npm run sync:pm-skills` (see [`SYNC-PM-SKILLS.md`](SYNC-PM-SKILLS.md)).
- **Agents and skills:** when you add personas under [`agents/`](agents/README.md) or skills under [`skills/`](skills/README.md), update [`rules/00-agent-behavior/agents.mdc`](rules/00-agent-behavior/agents.mdc) and run the checklist in [`tests/README.md`](tests/README.md) (discovery scripts + optional manual SecOps smoke). Recent additions include five **SecOps personas** (red team, RE, exploit research, network, AI security) and a **SecOps skill pack** (offensive/defensive `metadata.type` plus local supply-chain guards: `supply-chain-guard`, `npm-supply-chain-guard`, `misteye-security-check`).
- **Skills catalog (may 2026):** [`skills/README.md`](skills/README.md) documents 262 discoverable skill folders (each with a `SKILL.md`; verify with `node scripts/verify-skill-counts.mjs`). **Hub-local** entries are listed in [`skills/.sync-manifest.json`](skills/.sync-manifest.json) under `hubLocal` (31). **Anthropic Cyber** curated sync: `anthropicCyber` (58) — see [`SYNC-ANTHROPIC-CYBER.md`](SYNC-ANTHROPIC-CYBER.md).
  - **Engineering workflow pack** — start with `using-agent-skills/` (phases: `interview-me`, `spec-driven-development`, `incremental-implementation`, `code-review-and-quality`, `shipping-and-launch`, etc.).
  - **Hub security & behavior** — `coding-guidelines`, `api-key-security`, `npm-supply-chain-security`, `code-hardcode-audit`, `skill-design-philosophy`.
  - **Tooling** — `update-changelog`, `remote-repo-cache`, `find-skills`.
  - **SOC/DFIR granular** — `using-cyber-skills/` (router) + 58 skills `anthropicCyber` (STIX, Volatility, Sigma, Falco, …).
  - After any skill change: `node scripts/audit-skills-trust.mjs --changed-only` (layout sigue siendo global; para una skill: `--skill <nombre>`). Hub local: `pnpm --dir .cursor audit:skills:hub-local`. Lote cyber: `pnpm --dir .cursor audit:skills:anthropic-cyber`. Full hub: `node scripts/audit-skills-trust.mjs` or `cursor-hub doctor`.

---

## How syncing works

- **Cursor / project:** `project/.cursor` is linked (junction or symlink) to this hub. Rules, skills, agents, commands, and `hooks.json` are used from here.
- **Exports (optional):** `.mdc` rules can be exported to `dist/exports/rules-md/` for tools that do not support `.mdc`. Only needed if you install with non-Cursor targets.

After adding or changing `.mdc` rules, run `export` (or `install`, which runs export) when you use those optional targets.

---

## setup.sh vs cursor-hub

| Goal | Use |
|------|-----|
| One command: export + install with good defaults (Cursor) | `./setup.sh` or `./setup.sh --project "path"` |
| Control targets, `--all`, `--global`, `--inactive-non-cursor`, or only `export` | `node scripts/cursor-hub.mjs` or `npx "path/to/.cursor"` |

`setup.sh` requires bash (Linux, macOS, Git Bash on Windows). On Windows without bash, use `cursor-hub` directly with `node` or `npx` (cross-platform, no bash needed):

```powershell
node scripts/cursor-hub.mjs export
node scripts/cursor-hub.mjs install --project "RUTA_PROYECTO" --targets cursor
```
