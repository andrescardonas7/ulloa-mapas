---
name: debugging-framework
description: Dispatch to systematic debugging sub-skills — root cause tracing, defense-in-depth, verification before completion. Use when choosing which debugging skill applies.
when_to_use: when encountering bugs and unsure which debugging methodology to load first
version: 1.1.0
languages: all
---

# Debugging Skills (dispatch)

Cursor discovers each sub-skill at `.cursor/skills/<name>/SKILL.md` (flat layout). Open the linked skill for full instructions.

## Sub-skills

| Symptom | Skill path |
|---------|------------|
| Test failure, unexpected behavior | `.cursor/skills/systematic-debugging/` |
| Error deep in stack / wrong location | `.cursor/skills/root-cause-tracing/` |
| Same bug keeps recurring | `.cursor/skills/defense-in-depth/` |
| About to claim "done" | `.cursor/skills/verification-before-completion/` |

## Core philosophy

> Systematic debugging is faster than guess-and-check thrashing.
