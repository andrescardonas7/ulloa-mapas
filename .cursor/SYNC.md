# Skill sync mechanisms (`.cursor`)

Index of every script that populates `.cursor/skills/`. All skills must end up in
the **flat** layout `.cursor/skills/<name>/SKILL.md` (Cursor only discovers one
level). Two scripts **copy** from vendored upstreams; two **link** (Windows
junction / symlink) to local clones so there is a single source of truth.

| Mechanism | Source → Destination | Mode | Command |
| --- | --- | --- | --- |
| **Trail of Bits** | `vendor/trailofbits-skills/plugins/*/skills/*/` → `.cursor/skills/<name>/` | copy | `node .cursor/scripts/sync-trailofbits-skills.mjs` · `npm run sync:trailofbits` |
| **Anthropic Cyber** | `vendor/anthropic-cybersecurity-skills/skills/<name>/` (allowlist) → `.cursor/skills/<name>/` | copy | `node .cursor/scripts/sync-cyber-skills.mjs` · `npm run sync:cyber` |
| **Hub local** | `<repo>/skills/<name>/` (OpenClaw hub skills) → `.cursor/skills/<name>/` | junction/symlink | `node .cursor/scripts/sync-hub-skills.mjs` · `npm run sync:hub-skills` |
| **Agent skills** | `<AGENT_SKILLS_ROOT>/skills/<name>/` (clone of `addyosmani/agent-skills`) → `.cursor/skills/<name>/` | junction/symlink | `node .cursor/scripts/sync-agent-skills.mjs` · `npm run sync:agent-skills` |
| **Taste skills** | `~/.agents/skills/<name>/` ([Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill)) → `.cursor/skills/<name>/` | junction/symlink | `node .cursor/scripts/sync-taste-skills.mjs` · `npm run sync:taste-skills` |
| **Engineering workflow (committed)** | Same clone → `.cursor/skills/<name>/` for `pack: engineering-workflow` in manifest | copy | `node .cursor/scripts/sync-engineering-workflow-skills.mjs` · `npm run sync:engineering-workflow` |

Linking helpers live in `.cursor/scripts/fs-link.mjs` (`ensureLinkedDirectory`,
prefers a junction on Windows, backs up any existing target). Callers decide
whether to clobber: `sync-agent-skills.mjs` refuses to replace committed real
folders (see below).

## Two distinct skill roots (do not confuse them)

| Root | Git repo? | Used by | Notes |
| --- | --- | --- | --- |
| `<AGENT_SKILLS_ROOT>` (default `C:/Users/zelda/agent-skills`) | Yes (`addyosmani/agent-skills`) | `sync-agent-skills.mjs` | Source clone this script links from. Most of its skills are also committed in the hub, so the script now links few or none (protected). |
| `~/.agents/skills` | No (local collection) | Taste-skill junctions (`design-taste-frontend`, `gpt-taste`, `imagegen-*`, `baoyu-*`, `fixing-*`, etc.) | Refreshed with `sync-taste-skills.mjs` after `npx skills add` + copy into this root. |

## Details

### Trail of Bits (copy)

- Reads every `plugins/*/skills/*/` from the **`vendor/trailofbits-skills`** Git
  submodule and copies each skill folder flat into `.cursor/skills/`.
- Overwrites only the skill folders it copies; deletes the obsolete nested packs
  (`building-secure-contracts/`, `testing-handbook-skills/`, `culture-index/`).
- Writes the `trailOfBits` section of `.cursor/skills/.sync-manifest.json`.
- Preview: `node .cursor/scripts/sync-trailofbits-skills.mjs --dry-run`
  (`npm run sync:trailofbits:dry`). Full guide: [`SYNC-TRAILOFBITS.md`](SYNC-TRAILOFBITS.md).

### Anthropic Cyber (copy)

- Copies only the curated allowlist in
  `.cursor/scripts/cyber-skills-allowlist.json` from the
  **`vendor/anthropic-cybersecurity-skills`** submodule.
- Never overwrites `hubLocal`, Trail of Bits, or SecOps playbook names
  (protected). Writes the `anthropicCyber` manifest section.
- Flags: `--dry-run` (`npm run sync:cyber:dry`), `--prune` (remove folders no
  longer in the allowlist). Full guide: [`SYNC-ANTHROPIC-CYBER.md`](SYNC-ANTHROPIC-CYBER.md).

### Hub local (link)

- Links hub-maintained OpenClaw skills from `<repo>/skills/<name>/` into
  `.cursor/skills/<name>/` as junctions (single source of truth, no copy drift).
- Currently links: `coding-guidelines`.

### Agent skills (link)

- Refreshes a local clone of `addyosmani/agent-skills` (default
  `C:/Users/zelda/agent-skills`, override with the `AGENT_SKILLS_ROOT` env var),
  then links each `skills/<name>/` into `.cursor/skills/` as junctions.
- OpenClaw reads the same clone via `openclaw.json → skills.load.extraDirs`.
- Links **only** the source clone above (`agent-skills`), **not** `~/.agents/skills`.
- **Protection (does not clobber committed hub skills):**
  1. Never replaces a **real directory** (committed, non-symlink) with a junction;
     only links when the destination is absent or already a junction. This guard
     is manifest-independent, so it also protects skills missing from the manifest.
  2. Skips names declared in `.sync-manifest.json` (`hubLocal` + `trailOfBits`),
     mirroring `sync-cyber-skills.mjs`.
- Excludes `test-driven-development` (the workspace already has an equivalent).
- Flags: `--dry-run` (`-n`) previews skip/link decisions without changes;
  `--no-pull` skips the `git pull --ff-only` and only re-links.

### Engineering workflow (copy)

- Refreshes **committed** hub copies of `addyosmani/agent-skills` skills listed in
  `.sync-manifest.json` with `"pack": "engineering-workflow"` (22 skills as of v0.6.2).
- Pulls the clone first unless `--no-pull`. Excludes `test-driven-development`
  (Superpowers TDD) and `context-engineering` (hub-behavior fork).
- Appends hub override block to `using-agent-skills/SKILL.md` after each sync.
- Typical flow: `sync-agent-skills.mjs` then `sync-engineering-workflow-skills.mjs`.
- Flags: `--dry-run`, `--no-pull`.

## Root-path convention (for maintainers)

Sync scripts resolve their roots from `__dirname` (`.cursor/scripts`). To avoid
the previous ambiguity where `HUB_ROOT` meant different things in different
files, the convention is:

- **`REPO_ROOT`** = repository root (`RULES`) — used by the two copy scripts
  (`sync-trailofbits-skills.mjs`, `sync-cyber-skills.mjs`) and `sync-hub-skills.mjs`.
- **`CURSOR_ROOT`** = the `.cursor` folder — used by `sync-agent-skills.mjs`.

`audit-skills-trust.mjs` keeps its own `hubRoot` parameter (meaning `.cursor`)
because it exposes an exported API; its default resolves to `.cursor` as before.
