---
name: ecc-catalog-consult
description: >-
  Find and selectively import skills from affaan-m/ECC via npx ecc consult or cached
  clone. Use when you need a domain skill (NestJS, ML, media) not in .cursor/skills.
  Cursor only — not for wiring Alfred/OpenClaw without explicit user approval.
---

# ECC catalog (selective import)

## Consult

```bash
npx ecc consult "<topic>" --target cursor
```

Fallback cache: `%USERPROFILE%\.cache\checkouts\github.com\affaan-m\ECC` (see `remote-repo-cache` skill).

## Import rules

1. List overlaps with existing hub skills (`security-review`, `semgrep`, `tdd-workflow`, Trail of Bits pack, etc.)
2. Copy **one** skill directory to `.cursor/skills/<unique-name>/` — rename if collision (e.g. `ecc-nestjs-patterns`)
3. Trim `description` frontmatter so routing stays precise
4. Do not bulk-copy `skills/` from ECC

## Install from ECC clone (advanced)

From ECC repo root, preview only:

```bash
node scripts/install-plan.js --skills <skill-id> --target cursor --json
```

Apply only after user confirms paths. Never `--profile full` on `.openclaw`.

## OpenClaw

Alfred loads `openclaw.json` → `skills.load.extraDirs`. An ECC skill is **not** automatically available to Alfred. To expose one bot skill, copy a vetted `SKILL.md` into a path Alfred already loads and register in `openclaw.json` — separate task, user approval required.
