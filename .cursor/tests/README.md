# Tests (`.cursor/tests`)

This folder contains **verification scripts and harnesses** for the hub: skills loading, plugin loading, skill-triggering behavior, and subagent-driven workflows.

Canonical inventories live in [`.cursor/agents/README.md`](../agents/README.md) and [`.cursor/skills/README.md`](../skills/README.md). Update those files first when adding personas or skills; then extend the tables below if behavior or triggers change.

---

## What lives here

| Folder / file                  | Purpose                                                                                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`claude-code/`**             | Tests for Claude Code: skill loading, subagent-driven-development (fast and integration). Uses `claude -p` and `test-helpers.sh`.                               |
| **`opencode/`**                | OpenCode-oriented tests: plugin loading, skill discovery, priority, tools. `run-tests.sh`, `setup.sh`, `test-*.sh`.                                             |
| **`skill-triggering/`**        | Check that skills fire for the right prompts. Prompts in `prompts/` (e.g. `dispatching-parallel-agents.txt`, `writing-plans.txt`). `run-all.sh`, `run-test.sh`. |
| **`explicit-skill-requests/`** | Multi-turn tests for explicit “use skill X” requests. Prompts in `prompts/`; `run-all.sh`, `run-test.sh`, `run-multiturn-test.sh`, etc.                         |
| **`subagent-driven-dev/`**     | Subagent-driven development flows: `go-fractals/`, `svelte-todo/` with `design.md`, `plan.md`, `scaffold.sh`. `run-test.sh`.                                    |

---

## Hub assets covered by tests (inventory)

### Agent personas (`.cursor/agents/`)

| Group | Files | Slash command | Automated harness today |
| ----- | ----- | ------------- | ------------------------ |
| **Core dev** | `planner`, `architect`, `tdd-guide`, `code-reviewer`, `build-error-resolver`, `e2e-runner`, `refactor-cleaner`, `doc-updater`, `testing`, `vercel-engineering`, `mcp-manager`, `codescene-standards`, `security-reviewer` | `/plan`, `/tdd`, `/code-review`, `/build-fix`, `/e2e`, `/security-audit`, etc. | Indirectly via `skill-triggering` / `subagent-driven-dev` when prompts reference those workflows |
| **SecOps (new)** | `redteam-planner`, `reverse-engineer`, `exploit-researcher`, `network-analyst`, `ai-researcher` | None — use `@.cursor/agents/<name>.md` or `Task` + persona pointer | **Manual** smoke only (see checklist below) |

Orchestration table: [`rules/00-agent-behavior/agents.mdc`](../rules/00-agent-behavior/agents.mdc).

### Skills (`.cursor/skills/`)

| Group | Examples | Typical trigger test |
| ----- | -------- | -------------------- |
| **Workflow / superpowers** | `writing-plans`, `dispatching-parallel-agents`, `subagent-driven-development`, `brainstorming` | `skill-triggering/prompts/*.txt` |
| **Debugging / problem-solving (flat)** | `systematic-debugging`, `root-cause-tracing`, `when-stuck`, `debugging-framework` | Discovery via `claude-code` / `opencode`; paths must be `skills/<name>/SKILL.md` |
| **Supply chain (new)** | `supply-chain-guard`, `npm-supply-chain-guard`, `misteye-security-check` | Manual prompt + lockfile edit → hook `after-lockfile-edit` (see [HOOKS.md](../HOOKS.md)) |
| **Repo trust scan** | `repo-trust-scan` (script + `/repo-trust-scan`) | `node .cursor/scripts/repo-trust-scan.mjs --target <repo>` after clone, **before** first install |
| **SecOps offensive** | `red-team-ops`, `web-pentest`, `exploit-development`, `reverse-engineering`, … (`metadata.type: offensive`) | Manual — no committed prompt fixtures yet |
| **SecOps defensive** | `incident-response`, `threat-hunting`, `malware-analysis` (`metadata.type: defensive`) | Manual |
| **Trail of Bits / audits** | `differential-review`, `semgrep`, `codeql`, chain scanners | Partially via explicit skill requests |

Full list and symlink notes: [`skills/README.md`](../skills/README.md) (sections **Skills nuevas** and **SecOps**).

---

## Maintenance workflow (agents + skills)

Run this after adding or renaming agents, skills, or slash commands:

1. **Inventario** — Update `.cursor/agents/README.md`, `.cursor/skills/README.md`, and `rules/00-agent-behavior/agents.mdc` in the same change.
2. **Confianza (skills)** — `node .cursor/scripts/audit-skills-trust.mjs --changed-only` (o `pnpm --dir .cursor audit:skills` si hay cambios). CI: workflow `.github/workflows/hub-skills-audit.yml`.
3. **Descubrimiento** — `./claude-code/run-skill-tests.sh` or `./opencode/run-tests.sh` to confirm flat `skills/<name>/SKILL.md` layout still loads.
4. **Triggers** — If the skill has a stable natural-language trigger, add or extend a prompt under `skill-triggering/prompts/` and run `./skill-triggering/run-all.sh`.
5. **Personas SecOps** — Manual smoke (checklist below); optional future: `skill-triggering/prompts/red-team-ops-authorized.txt` with scoped wording.
6. **Hub install** — `node scripts/cursor-hub.mjs doctor --project "<app>"` after `export` + `install` (incluye **skills trust audit** completo del hub, no solo `--changed-only`).

Multi-project reuse steps: [`.cursor/README.md`](../README.md) → **Multi-project standard**.

---

## When to run

- After changing **installer logic**, **exports**, or **skill layout** — run the relevant target (e.g. `claude-code`, `opencode`) to ensure discovery and loading still work.
- After changing **skill text** or **triggers** — run `skill-triggering` and/or `explicit-skill-requests` to avoid regressions.
- After adding **SecOps or supply-chain skills** — run manual checklist below; confirm hooks still fire on lockfile/workflow edits.
- After adding **agent personas** — verify frontmatter (`name`, `description`) and cross-links in `agents.mdc` / `agents/README.md`.
- **Requirements:** bash (Linux/macOS or WSL/Git Bash on Windows; scripts use Unix tools like `mktemp`, `timeout`, `find`), and for `claude-code`: Claude Code CLI in PATH; for `opencode`: OpenCode environment as in `opencode/setup.sh`.

---

## Manual smoke: SecOps agents + skills

Use only on **authorized** targets. In Cursor:

1. `@.cursor/agents/redteam-planner.md` — ask for a high-level MITRE-aligned plan; confirm output cites phases/constraints from the persona file.
2. `@.cursor/skills/supply-chain-guard/SKILL.md` — ask to review a dummy `package.json` diff; confirm checklist (lifecycle scripts, lockfile, CI) appears.
3. `@.cursor/skills/misteye-security-check/SKILL.md` — confirm the agent states **offline / no API keys** before “scanning” a URL or dependency.
4. Optional: `@.cursor/skills/incident-response/SKILL.md` — IR playbook structure (evidence, timeline, containment) without offensive steps.
5. `node .cursor/scripts/repo-trust-scan.mjs --target . --mode quick` — exits 0, prints `decision=` and does not modify files; with `--strict`, document expected behavior if HIGH patterns exist in fixtures.

Record pass/fail in the PR or task notes until automated prompts exist.

### Repo trust scan (cloned / third-party repos)

| Step | Command | Pass criteria |
| ---- | ------- | ------------- |
| Quick (hub self-scan) | `node .cursor/scripts/repo-trust-scan.mjs --target "<hub-parent-or-sample>" --mode quick` | Exit 0 (non-strict); lists `decision=`; no file writes |
| Full (optional tools) | Same with `--mode full` | Tools show `skipped` or `ran`; no secret values in stdout |
| CLI via hub | `node .cursor/scripts/cursor-hub.mjs trust-scan --project "<path>" --json` | Valid JSON with `report.counts` |
| Slash command | `/repo-trust-scan` on a test clone | Agent runs quick scan before suggesting `pnpm install` |

**Not in scope:** automatic hook on `git clone` (Cursor has no post-clone event). Install-time risk stays in `before-pkg-install` / `after-lockfile-edit`.

---

## Running (examples)

```bash
# Claude Code – fast skill tests
./claude-code/run-skill-tests.sh

# Claude Code – integration (slow)
./claude-code/run-skill-tests.sh --integration

# OpenCode
./opencode/run-tests.sh

# Skill triggering
./skill-triggering/run-all.sh

# Explicit skill requests
./explicit-skill-requests/run-all.sh

# Subagent-driven dev
./subagent-driven-dev/run-test.sh
```

Exact flags and deps are in each folder’s scripts and, for `claude-code`, in `claude-code/README.md`.
