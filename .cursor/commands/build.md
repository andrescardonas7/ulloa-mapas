---
description: Implement an approved task incrementally with tests, verification, and small reviewable slices.
---

# Build Command

Use `/build` after a PBI or task is agreed and the implementation scope is clear.

## What This Command Does

1. Confirms the approved PBI/task and success criteria.
2. Breaks the work into the smallest useful vertical slice.
3. Writes or updates tests before behavior changes when code behavior is involved.
4. Implements one slice at a time.
5. Verifies each slice before moving on.
6. Reports what changed, how it was tested, and what remains.

## Preconditions

- A task exists under `docs/delivery/<PBI-ID>/` or the user explicitly authorizes the work.
- The task has acceptance criteria and a test plan.
- Required dependencies and environment variables are known.

If these are missing, stop and recommend `/spec` or `/plan`.

## Workflow

1. Read the relevant PBI/task.
2. Create a short TodoWrite list for the current slice.
3. For behavior changes, follow TDD:
   - write the failing test,
   - verify the failure,
   - implement the minimal code,
   - verify the pass.
4. For docs, commands, rules, or skills, update only the files named by the task and verify formatting/discovery.
5. After each file or tight group of files, run the narrowest useful verification.
6. If build errors appear, switch to `/build-fix` behavior: one error at a time, with evidence.

## Slice Rules

- Prefer changes that can be reviewed in one screen or one small diff.
- Do not mix unrelated cleanup into implementation.
- Do not silently expand scope. If scope changes, update the task or ask the user.
- Do not mark a task done without verification evidence.

## Output

End with:

```text
Implemented: <slice summary>
Verified: <commands or checks>
Remaining: <next slice or none>
```
