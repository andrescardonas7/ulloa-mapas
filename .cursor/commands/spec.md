---
description: Turn a rough idea into an agreed PBI or mini-PRD before planning or coding.
---

# Spec Command

Use `/spec` when the request is still an idea, a feature concept, or a broad change that needs scope before implementation.

## What This Command Does

1. Restates the goal and separates facts from assumptions.
2. Asks only the clarifying questions needed to remove blocking ambiguity.
3. Drafts or updates a PBI under `docs/delivery/`.
4. Defines acceptance criteria, out-of-scope items, risks, and a test plan.
5. Stops before implementation until the user agrees.

## Workflow

1. Check whether `docs/delivery/backlog.md` exists.
2. If no PBI exists for the request, propose the next PBI ID.
3. Create or update:
   - `docs/delivery/backlog.md`
   - `docs/delivery/<PBI-ID>/prd.md`
   - `docs/delivery/<PBI-ID>/tasks.md`
4. Keep status as `Proposed` unless the user explicitly agrees to the scope.
5. After agreement, recommend `/plan` or `/build` depending on task size.

## PBI Draft Template

```markdown
# <PBI-ID>: <title>

Status: Proposed

## Problem
<What problem are we solving?>

## Objective
<What outcome should exist when this is done?>

## Scope
- <Included item>

## Out of Scope
- <Explicit non-goal>

## Acceptance Criteria
- <Observable condition>

## Risks
- <Risk and mitigation>

## Test Plan
- <How the work will be verified>
```

## Stop Conditions

Stop and ask the user when:

- The business goal is unclear.
- Acceptance criteria would be invented.
- The change affects security, billing, data loss, auth, or production release behavior.
- The request conflicts with existing PBIs or project rules.

## Output

End with:

```text
Spec drafted for <PBI-ID>. Waiting for approval, edits, or rejection.
```
