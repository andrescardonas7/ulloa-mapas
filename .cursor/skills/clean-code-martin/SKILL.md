---
name: clean-code-martin
description: >-
  Clean Code checklist (Martin / Uncle Bob) for readability reviews and
  maintainability refactors. Load when reviewing PRs, assessing code quality,
  refactoring for clarity, or when the user mentions Clean Code, Uncle Bob,
  code smells, or the wojteklu gist. Complements code-reviewer and karpathy
  surgical scope; does not replace security-review or /refactor-clean.
---

# Clean Code (Martin) — Hub Checklist

Curated principles inspired by Robert C. Martin's *Clean Code* and the community summary by [wojteklu](https://gist.github.com/wojteklu/73c6914cc446146b8b533c0988cf8d29). This skill is the **canonical** checklist for the hub; do not duplicate it in always-on rules.

**Scope:** readability, naming, structure, smells, and local maintainability. For SOLID, DI, and module boundaries, use `04_code-architecture.mdc`. For dead-code removal, use `/refactor-clean`.

**Coexistence:** [references/coexistence.md](references/coexistence.md).

---

## When to apply

- Code review or PR feedback focused on clarity and maintainability
- Refactor for readability (not dead-code purge)
- User asks for Clean Code / Uncle Bob / gist review
- Smell diagnosis (rigidity, fragility, opacity, etc.)

**Do not load for:** security-only audits, docs-only edits, or pure dead-code cleanup.

---

## General

1. Follow project and language conventions consistently.
2. Prefer the simplest solution that meets the requirement (KISS).
3. **Boy scout rule:** in files you touch, leave them slightly cleaner — without widening scope (see coexistence).
4. Find root cause before patching symptoms.

---

## Design (tactical — not SOLID)

5. Keep configurable data at high levels; avoid scattering magic config in low-level modules.
6. Prefer polymorphism or strategy objects over growing `if/else` or `switch` chains — unless the hub's exhaustive `switch` with `never` is the right fit for a discriminated union.
7. Separate multi-threading / concurrency code from business logic.
8. Prevent over-configurability nobody asked for.
9. **Law of Demeter:** a unit should talk to its direct collaborators only — avoid long chains like `a.getB().getC().doD()`.

---

## Understandability

10. Be consistent: similar problems, similar patterns and names.
11. Use explanatory variables for non-obvious expressions.
12. Encapsulate boundary conditions (min/max, empty, off-by-one) in one place.
13. Prefer dedicated value objects over bare primitives for domain concepts (email, money, date range).
14. Avoid logical dependency — methods must not rely on implicit class state set elsewhere.
15. Avoid negative conditionals; prefer positive names (`isEnabled` not `!isDisabled`).

---

## Names

16. Choose descriptive, unambiguous names.
17. Make meaningful distinctions (`orderDate` vs `shipmentDate`, not `date1` / `date2`).
18. Use pronounceable names.
19. Use searchable names for constants and domain terms.
20. Replace magic numbers with named constants.
21. Avoid encodings and type prefixes (`strName`, `m_count`) — types belong in the type system.

---

## Functions

22. Keep functions small; hub target is **under 50 lines** per function.
23. Each function does one thing at one level of abstraction.
24. Use descriptive verb names.
25. Prefer fewer parameters (0–3); use a parameter object when needed.
26. Avoid hidden side effects; document mutations clearly.
27. Do not use flag arguments — split into separate methods instead of `process(order, isPremium: true)`.

---

## Comments

28. Prefer self-explanatory code over comments.
29. Do not restate what the code already says.
30. Do not add noise comments.
31. Do not use closing-brace comments (`} // end if`).
32. Do not comment out code — delete it (version control keeps history).
33. Use comments for **intent** (why this approach).
34. Use comments to clarify non-obvious code.
35. Use comments to warn about consequences (irreversible ops, performance traps).

---

## Source code structure

36. Separate concepts vertically (group by feature, not by technical layer only).
37. Related code should appear vertically dense.
38. Declare variables close to first use.
39. Dependent functions should sit near their callers.
40. Similar functions should sit near each other.
41. Order functions top-down: callers above callees.
42. Keep lines short; break long expressions.
43. Do not use horizontal alignment for cosmetic columns.
44. Use whitespace to group related lines and separate weakly related blocks.
45. Do not break indentation structure.

---

## Objects and data structures

46. Hide internal structure; expose behavior, not raw mutable state.
47. Prefer plain data structures where behavior is not needed; prefer objects where invariants matter.
48. Avoid hybrids — half data bag, half behavior with leaked internals.
49. Keep types small and focused.
50. Each type should have one reason to change (see architecture rule for examples).
51. Keep instance variable count low; split when a type accumulates unrelated state.
52. Base types should not know implementation details of subtypes.
53. Prefer many small functions over passing behavior-selecting flags or callbacks when it aids clarity.
54. Prefer instance methods on stateful types; use static/pure functions for stateless utilities (see coexistence).

---

## Tests

55. Each test verifies **one behavior** (multiple asserts OK if they assert the same outcome).
56. Tests must be readable — arrange/act/assert, descriptive names.
57. Tests must be fast.
58. Tests must be independent — no order or shared mutable state.
59. Tests must be repeatable — no flaky timing or environment luck.

---

## Code smells (diagnostic)

60. **Rigidity** — small change forces cascading edits.
61. **Fragility** — one change breaks unrelated areas.
62. **Immobility** — code cannot be reused without high risk or effort.
63. **Needless complexity** — abstraction or machinery beyond the problem.
64. **Needless repetition** — copy-paste or duplicate logic.
65. **Opacity** — hard to understand at a glance.

When smells appear in changed files, cite the smell, the location, and a minimal fix — do not rewrite unrelated modules.

---

## Review output (when used as review skill)

```markdown
## Clean Code findings

- Critical: ...
- High: ...
- Medium: ...
- Low: ...

## Smells observed

- [Rigidity|Fragility|...]: file:line — brief note

## Hub gaps

- Security / verification items not covered here: ...
```

If no issues, say so and note which checklist sections were checked.

---

## Attribution

- Book: Robert C. Martin, *Clean Code: A Handbook of Agile Software Craftsmanship* (Prentice Hall).
- Community summary: [wojteklu/clean_code.md gist](https://gist.github.com/wojteklu/73c6914cc446146b8b533c0988cf8d29).
- Language fixes reference: [wojciesh fork](https://gist.github.com/wojciesh/39cd8ae881895d8a32c44e1f1bf6d605).
