---
description: Run release readiness checks, document evidence, and prepare a safe handoff or PR.
---

# Ship Command

Use `/ship` when implementation is complete and the user wants to prepare the work for review, merge, or release.

## What This Command Does

1. Confirms the PBI/task is complete.
2. Reviews the diff for accidental changes, secrets, debug code, and scope creep.
3. Runs the agreed verification checks.
4. Documents release notes, rollback notes, and residual risks.
5. Prepares the handoff, commit, or PR only when the user explicitly asks.

## Workflow

1. Identify the task or PBI being shipped.
2. Check repository status and review the diff.
3. Verify:
   - tests named in the task test plan,
   - typecheck/lint/format when available,
   - docs and command indexes for discoverability,
   - security-sensitive changes for secrets or unsafe defaults.
4. Summarize release impact:
   - user-visible behavior,
   - operational impact,
   - rollback path,
   - known limitations.
5. Ask before committing, pushing, merging, or creating a PR unless the user already requested that action.

## Ship Checklist

- [ ] Scope matches the approved PBI/task.
- [ ] Tests and quality checks pass or failures are documented.
- [ ] No secrets or local-only paths were introduced.
- [ ] Docs and indexes are updated.
- [ ] Rollback or revert path is clear.
- [ ] User has approved any git or GitHub action.

## Output

End with:

```text
Ship status: ready | blocked | needs review
Evidence: <checks run>
Next action: <commit/PR/release/manual review>
```
