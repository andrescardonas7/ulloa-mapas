# Coexistence with hub rules and skills

This skill is the **canonical** Clean Code (Martin) checklist for this hub. Cursor loads it from `.cursor/skills/clean-code-martin/`.

## Precedence when topics overlap

| Priority | Topic | Authority |
|----------|--------|-----------|
| 1 | Safety, secrets, auth, OWASP | `security-review`, `security-core`, `security-audit` |
| 2 | Verification before claiming done | `verification-before-completion`, `check.mdc`, project test/lint scripts |
| 3 | Surgical scope / minimal diff | `karpathy-coding-guidelines.mdc`, skill `coding-guidelines` |
| 4 | **This skill** — readability, naming, structure, smells | `clean-code-martin` (when review/clarity is the goal) |
| 5 | SOLID, DI, module layers | `04_code-architecture.mdc`, `language-agnostic-patterns.mdc` |
| 6 | Complexity metrics, CodeScene smells | `05_code-complexity.mdc`, `/codescene-review` |
| 7 | Dead code / unused exports | `/refactor-clean`, agent `refactor-cleaner` — **not** this skill |
| 8 | Full-stack test strategy | `10_full-stack-testing.mdc`, skill `test-driven-development` |

**Conflict resolution:** If Clean Code boy-scout cleanup conflicts with Karpathy surgical scope, improve only **lines you already changed** for the user's task — mention other debt, do not delete or refactor it unless asked.

## Topic-specific reconciliation

| Clean Code (this skill) | Hub rule | Resolution |
|-------------------------|----------|------------|
| Boy scout: leave cleaner | Karpathy: don't touch unrelated code | Micro-cleanup **inside your edit footprint** only |
| One assert per test (gist) | One **behavior** per test | Prefer one behavior; multiple asserts on same outcome OK |
| Prefer non-static methods | Pure functions / static utils | Static/pure for stateless helpers; instance methods on stateful types |
| Polymorphism over switch | `typescript-exhaustive-switch` | Discriminated unions: exhaustive `switch` + `never` default is fine |
| Small functions (no number) | `01_code-standards.mdc` | **Under 50 lines** per function, **under 300** per file |
| Refactor for clarity | `/refactor-clean` | This skill = readability; `/refactor-clean` = proven dead code with tests |

## Activation evals (routing)

**Positive (should load this skill):**

- "Review for Clean Code" / "Uncle Bob" / "wojteklu gist"
- PR or diff review focused on readability and maintainability
- "Refactor for clarity" (not "remove dead code")
- Code smell diagnosis (rigidity, fragility, opacity)

**Negative (should NOT load):**

- Security-only audit → `security-review`, `/security-audit`
- Dead code / unused dependency cleanup → `/refactor-clean`
- Explain-only questions with no review intent
- Docs-only or config-only changes

**Boundary:**

- Large architecture change → `04_code-architecture.mdc` + `architect` agent first; then this skill for local clarity
- `/clean-code-review` command explicitly loads this checklist

## Related skills and commands (handoffs)

| After / during | Use |
|----------------|-----|
| Security findings | `security-review`, `/security-audit` |
| Metrics / auto-refactor | `/codescene-review`, `05_code-complexity.mdc` |
| Dead code | `/refactor-clean`, `refactor-cleaner` agent |
| General PR review | `code-reviewer` agent, `/code-review` |
| Dedicated Clean Code pass | `/clean-code-review` |
| Implementation style | `coding-guidelines` (Karpathy) |
| Before merge | `verification-before-completion` |
