---
description: Simplify code for clarity and maintainability without changing behavior.
---

# Code Simplify Command

Use `/code-simplify` when code **works** but is harder to read or maintain than it should be. Not for bug fixes or new features.

## Workflow

1. Read `AGENTS.md` and project conventions.
2. Scope: recent changes unless the user named a broader area.
3. Before editing: purpose, callers, edge cases, test coverage.
4. Look for: deep nesting → guards/helpers; long functions → split; nested ternaries → if/switch; vague names; duplication; dead code.
5. Apply **one** simplification at a time; run tests after each.
6. Verify: tests pass, build succeeds, diff stays focused.

If a simplification breaks tests, revert that change and reconsider.

## Skills

- Primary: `code-simplification`
- Follow-up review: `code-review-and-quality`

## Hub note

Do not use this command for drive-by refactors during unrelated tasks. Hub `coding-guidelines` defines surgical scope; simplify only when asked or clearly warranted.
