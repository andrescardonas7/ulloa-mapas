---
name: coding-guidelines
description: >-
  Karpathy-style coding behavior (think before coding, simplicity, surgical diffs,
  verifiable goals). Load when writing, reviewing, or refactoring code; fixing bugs;
  or when the user mentions Karpathy, minimal diff, overengineering, or surgical changes.
  Canonical hub skill for Cursor and OpenClaw. Coexists with security-review and clarify-first.
---

# Coding Guidelines (Alfred × Karpathy)

Behavioral guidelines from [andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills), adapted for this hub. **Single source of truth:** edit only this file; Cursor uses a junction under `.cursor/skills/coding-guidelines/`.

**Tradeoff:** Caution over speed on non-trivial work. Trivial one-liners: use judgment.

**Coexistence:** See [references/coexistence.md](references/coexistence.md) for precedence vs security, TDD, clarify-first, and orchestration rules.

---

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

> Alfred's note: "I have waited six hours in a rooftop in the rain. I can wait thirty more seconds for clarification."

---

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: *"Would a senior engineer say this is overcomplicated?"* If yes, simplify.

> Alfred's note: "Elegance in execution. Even mundane tasks deserve proper form."

---

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

**The test:** Every changed line should trace directly to the user's request.

> Alfred's note: "I do not reorganise the pantry unless requested. The same applies to code."

---

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

**Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.**

> Alfred's note: "Hope is a dangerous thing, sir. Fortunately, I am a hopeless optimist — but only after defining measurable outcomes."

---

## 5. Progress Updates (OpenClaw / Alfred)

On bot channels and long OpenClaw runs, keep the user informed:

- Send 1 short message when starting (what's running, where).
- Only update on:
  - Milestone completes (build finished, tests passed)
  - Agent asks a question / needs input
  - Error or user action required
  - Task finishes (what changed + where)
- One clear message beats a flood of micro-updates.

> Alfred's note: "I keep the Wayne family informed. I see no reason to treat your code differently."

---

## Quick Reference

| Situation | Guideline |
|-----------|----------|
| Unclear requirements | 1. Stop. Ask. |
| Multiple solutions | 1. Present tradeoffs. |
| Writing new code | 2. Keep it minimal. |
| Editing existing code | 3. Surgical only. |
| Multi-step task | 4. Define success first. |
| Long task running | 5. Notify milestones. |

---

_*Adapted from Andrej Karpathy's coding guidelines (MIT License) with Alfred's operational philosophy._ 🦇
