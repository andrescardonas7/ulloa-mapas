# Loop status

Inspect loop progress and failure signals (operator pattern from ECC).

**Scope:** Cursor / local transcripts — not Alfred channels.

## Usage

`/loop-status [--watch]`

## In-session

Report:

- Active loop pattern (from last `/loop-start` plan if any)
- Last checkpoint / quality gate result
- Failing checks
- Recommendation: continue, pause, or stop

## Cross-session (optional)

If the user uses Claude Code with ECC elsewhere:

```bash
npx ecc-universal loop-status --json
```

## This repo

Check for plans under `.cursor/plans/` or `docs/` and recent `git log` on the feature branch.
