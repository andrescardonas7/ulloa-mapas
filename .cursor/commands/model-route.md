# Model route

Recommend a model tier for the current task (heuristic only — no API calls). Pattern from [ECC](https://github.com/affaan-m/ECC).

**Scope:** Cursor IDE only. Alfred model routing stays in `openclaw.json`.

## Usage

`/model-route [task description] [--budget low|med|high]`

## Heuristic

| Tier | Use when |
| ---- | -------- |
| Fast / smaller | Mechanical edits, typos, single-file lint fixes, doc typos |
| Default | Most implementation, refactors, tests |
| Strongest / reasoning | Architecture, security review, ambiguous requirements, multi-file design |

Map to the models the user actually has enabled in Cursor (Composer, Claude, GPT, MiniMax, etc.) — do not invent model IDs.

## Required output

- Recommended tier and example model family
- Confidence (high / medium / low)
- Why it fits
- Fallback if the first attempt fails

## Budget flag

- `low`: prefer fastest acceptable tier
- `med`: default balance
- `high`: prefer strongest tier for hard tasks
