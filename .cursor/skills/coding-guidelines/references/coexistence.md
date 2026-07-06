# Coexistence with hub rules and skills

This skill is the **canonical** Karpathy-style coding behavior for this workspace. Cursor loads it via junction; OpenClaw (Alfred) loads it from `skills/coding-guidelines/`.

## Precedence when topics overlap

| Priority | Topic | Authority |
|----------|--------|-----------|
| 1 | Safety, secrets, auth, OWASP | `security-review`, `security-core`, Alfred `security-guard` |
| 2 | Verification before claiming done | `verification-before-completion`, project `pnpm run check` / `check.mdc` |
| 3 | Surgical scope / minimal diff | This skill (§3) |
| 4 | Clarification depth | `clarify-first-prompting`, `interview-me`, `ask-questions-if-underspecified` — **extend** §1, do not replace |
| 5 | Test methodology | Workspace `.cursor/skills/test-driven-development` — **not** `agent-skills/.../test-driven-development` |
| 6 | Delivery structure (EPICs, subagents) | `cursor-agent-orchestration` — structure only; diffs stay surgical |

**Conflict resolution:** If orchestration asks for a large refactor but the user asked for a small fix, follow the **user request** and §3.

## Section 5 (Progress Updates)

§5 applies to **OpenClaw / Alfred** on channels where multi-turn status is expected (WhatsApp, Telegram, long agent runs). **Cursor IDE agent:** follow the rule `karpathy-coding-guidelines.mdc` (no milestone spam; normal concise replies).

## Activation evals (routing)

**Positive (should load this skill):**

- "Implement/fix/refactor this code"
- "Review this PR/diff"
- "Don't overcomplicate"
- Karpathy / surgical / minimal change wording

**Negative (should NOT load):**

- Pure security audit only → `security-review`
- "Explain how X works" with no code change
- Docs-only / changelog-only tasks
- UI-only design with no code

**Boundary:**

- Large feature + vague spec → `interview-me` or `spec-driven-development` first, then this skill for implementation

## Related skills (functional handoffs)

| After / during | Skill |
|----------------|--------|
| Vague requirements | `interview-me`, `ask-questions-if-underspecified` |
| Large multi-file feature | `incremental-implementation`, `planning-and-task-breakdown` |
| Post-implementation simplify | `code-simplification` (only when asked or clearly bloated) |
| Pre-merge | `code-review-and-quality`, `verification-before-completion` |
