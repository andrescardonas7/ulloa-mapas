---
description: Trust audit for one new or changed agent skill folder (injection, exfil, supply-chain patterns). Scoped scan only — never the full hub catalog.
---

# Audit Skill Security

## Overview

Run the hub **skill trust gate** on a **single** skill or on **git-staged** skill changes. Does not scan the entire `.cursor/skills/` tree unless you explicitly request a full hub audit.

**Use when:** You added a third-party skill, symlinked a new folder, or want to know if a skill looks malicious before trusting it.

**Not for:** Whole-repo dependency scans → `/security-scan`. Cloned unknown repos → `/repo-trust-scan`.

## Quick (one skill by name)

```bash
node .cursor/scripts/audit-skills-trust.mjs --skill "<skill-folder-name>"
```

Example:

```bash
node .cursor/scripts/audit-skills-trust.mjs --skill "npm-supply-chain-security"
```

## Before commit (what pre-commit runs)

Only folders with staged files under `.cursor/skills/`:

```bash
node .cursor/scripts/audit-skills-trust.mjs --staged-only
```

Install the hook once:

```bash
pnpm --dir .cursor hooks:install
```

## Deeper second pass (optional, needs Python + SkillSpector)

Install pinned version (see `.cursor/scripts/skillspector-pin.mjs`):

```bash
pip install "git+https://github.com/NVIDIA/skillspector.git@1a7bf026a3cf0ecfd957b6c173244d51b3141baf"
```

```bash
pnpm --dir .cursor audit:skills:deep
# or force fail if CLI missing:
pnpm --dir .cursor audit:skills:deep:require
# with SARIF output (same as CI):
node .cursor/scripts/skills-trust-deep-scan.mjs --skill "<name>" --require-skillspector --sarif-dir .cursor/artifacts/skillspector-sarif
```

## Agent instructions

1. Run the appropriate command above (prefer `--skill` when the user named one folder).
2. Summarize in **≤8 lines**: OK | Revisar | Bloquear; worst finding if any.
3. On **Bloquear** / errors in `SKILL.md`: stop and ask the user before “installing” or syncing the skill elsewhere.
4. Do **not** re-run on unrelated skills in the same chat.
