# Loop start

Managed autonomous loop **runbook** (operator pattern from ECC). Does not start background daemons in this hub.

**Scope:** Cursor sessions only.

## Usage

`/loop-start [sequential|continuous-pr|rfc-dag] [--mode safe|fast]`

## Before starting

1. `git status` clean or user-approved WIP
2. Run `/quality-gate` or `pnpm run check` when available
3. Set `ECC_HOOK_PROFILE=standard` (or `strict` for safe mode)
4. Define explicit **stop condition** (issue closed, PR merged, N iterations, time box)

## Safe mode (default)

- Checkpoint after each iteration
- Run quality gate between iterations
- No `--no-verify` on git

## Fast mode

- Fewer checkpoints; user accepts higher risk

## Optional CLI (upstream)

From another terminal if using ECC npm package:

```bash
npx ecc-universal loop-status --json
```

## Output

Write a short loop plan under `docs/` or `.cursor/plans/` (create if needed): goal, branch, stop condition, commands per iteration.
