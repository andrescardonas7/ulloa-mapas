---
description: >-
  Clean Code (Martin) review pass on changed code — readability, naming,
  structure, and smells. Loads skill clean-code-martin; not for security-only
  or dead-code cleanup.
---

# Clean Code Review

Readability and maintainability review using the hub **Clean Code (Martin)** checklist.

**Load first:** `.cursor/skills/clean-code-martin/SKILL.md` and `references/coexistence.md`.

**Not this command:** `/refactor-clean` (dead code), `/security-audit` (security-only), `/codescene-review` (metrics/auto-refactor).

## Workflow

1. Identify scope:
   - Uncommitted changes: `git diff --name-only HEAD`
   - PR or branch: diff against base branch
   - Single file: user-provided path

2. For each changed file, apply the skill checklist:
   - General, design (tactical), understandability, names, functions
   - Comments, source structure, objects/data shapes
   - Tests (if test files changed)
   - Code smells (rigidity, fragility, immobility, complexity, repetition, opacity)

3. Cross-check hub limits (do not duplicate SOLID deep-dive):
   - Functions > 50 lines → flag
   - Files > 300 lines → flag
   - Security/secrets → defer to `/security-audit` if found

4. Respect coexistence:
   - Boy scout only within the user's requested scope
   - Do not recommend broad refactors unless asked
   - Prefer minimal, actionable fixes

5. Produce report using the skill output format:

```markdown
## Clean Code findings

- Critical: ...
- High: ...
- Medium: ...
- Low: ...

## Smells observed

- [Smell]: path:line — note

## Hub gaps

- Items better handled elsewhere: ...
```

6. If no issues: state what was checked and any checks not run.

## When to escalate

| Finding | Escalate to |
| ------- | ----------- |
| Auth, secrets, injection | `/security-audit` |
| Dead code, unused exports | `/refactor-clean` |
| Architecture / layer violations | `@.cursor/agents/architect.md` |
| Complexity metrics | `/codescene-review` |

## Attribution

Checklist adapted from Robert C. Martin, *Clean Code*, via [wojteklu gist](https://gist.github.com/wojteklu/73c6914cc446146b8b533c0988cf8d29).
