# Harness audit

Run a deterministic scorecard for this repo's **Cursor hub** (hooks, skills, commands, rules). Adapted from [ECC](https://github.com/affaan-m/ECC) `harness-audit.js` (MIT).

**Scope:** Cursor IDE only — does not change OpenClaw/Alfred.

## Usage

`/harness-audit [repo|hooks|skills|commands|agents] [--format text|json]`

## Run

From workspace root:

```bash
node .cursor/scripts/ecc/harness-audit.cjs repo --format text
```

For automation:

```bash
node .cursor/scripts/ecc/harness-audit.cjs repo --format json
```

## Output

Return the script output unchanged. Summarize for the user:

1. Overall score and applicable categories
2. Failed checks with file paths
3. Top 3 actions from `top_actions`
4. Whether to run `/ecc-consult` for missing ECC components

Do not invent scores — the script is the source of truth.
