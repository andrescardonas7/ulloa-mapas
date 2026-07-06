# Instincts (ECC-style, Cursor only)

Optional learned behaviors injected at session start (see `.cursor/hooks/ecc/session-start.js`).

## Layout

- `personal/` — project-specific instincts (YAML or Markdown with YAML frontmatter)
- `inherited/` — shared / promoted instincts

## Minimal example

`personal/prefer-pnpm.yaml`:

```yaml
---
id: prefer-pnpm
confidence: 0.75
domain: tooling
---

# Prefer pnpm

## Action
Use pnpm only when package.json declares packageManager pnpm; never npm install.
```

## Confidence

Only instincts with `confidence >= 0.55` are injected. Tune per ECC continuous-learning v2.1 docs in skill `ecc-continuous-learning`.

## OpenClaw

Alfred does not read this folder unless you explicitly add a bridge — use `workspace/memory/` for bot continuity instead.
