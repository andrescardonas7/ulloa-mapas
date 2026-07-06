---
name: using-pm-skills
description: >-
  Load for product management workflows — discovery, strategy, PRDs, OKRs, GTM, positioning,
  market research, cohort/A/B analysis, and shipping AI-built apps. Routes to synced pmSkills
  from phuryn/pm-skills and chained slash commands (/discover, /strategy, /write-prd, /plan-launch,
  /north-star, /ship-check). Triggers: product discovery, assumption mapping, Teresa Torres OST,
  lean canvas, pricing, battlecards, user personas, North Star metric, vibe-coded ship audit.
  Do NOT load for pure engineering implementation (use using-agent-skills) or app security code
  review only (use security-review/differential-review unless documenting AI-shipped intent).
---

# Using PM Skills (hub router)

## Overview

The RULES hub layers **engineering** skills (`using-agent-skills`, `/spec`, `/plan`, `/build`) with **product management** skills synced from [phuryn/pm-skills](https://github.com/phuryn/pm-skills).

| Layer | Entry | Best for |
| --- | --- | --- |
| **Engineering workflow** | `using-agent-skills` | Spec, TDD, code review, CI, ship to production |
| **PM marketplace (`pmSkills`)** | This skill + slash commands | Discovery, strategy, PRD, GTM, metrics, PM analytics |
| **AI shipping kit** | `/ship-check`, `shipping-artifacts` | Document intent of vibe-coded apps; static security/perf audits |

Catalog traceability: `.cursor/skills/.sync-manifest.json` → **`pmSkills`**. Update path: `.cursor/SYNC-PM-SKILLS.md`.

## Start here (commands)

| User intent | Command |
| --- | --- |
| New idea, validate assumptions | `/discover` |
| Strategic clarity | `/strategy` |
| Feature spec for eng | `/write-prd` |
| Launch plan | `/plan-launch` |
| Metrics framework | `/north-star` |
| AI-built repo ready for review | `/ship-check` |

Commands chain skills step-by-step; follow checkpoints in each command file under `.cursor/commands/`.

## Decision tree

```
PM task
│
├─ Don't know what to build yet?
│  └─ /discover  (or skills: brainstorm-ideas-*, identify-assumptions-*)
│
├─ Strategy / business model / pricing?
│  └─ /strategy | /business-model | /pricing | /market-scan
│
├─ Execution artifacts (PRD, OKR, roadmap, stories)?
│  └─ /write-prd | /plan-okrs | /transform-roadmap | /write-stories
│
├─ Users / market / competitors?
│  └─ /research-users | /competitive-analysis | /analyze-feedback
│
├─ Data (SQL, cohorts, A/B)?
│  └─ /write-query | /analyze-cohorts | /analyze-test
│
├─ GTM / growth / positioning?
│  └─ /plan-launch | /growth-strategy | /market-product | /battlecard
│
├─ Handoff to engineering?
│  └─ using-agent-skills → spec-driven-development → incremental-implementation
│
└─ AI-generated codebase needs reviewability?
   └─ /ship-check → document-app → security-audit-static → derive-tests
```

## Plugin map (9 upstream plugins)

Consult `pmSkills.plugins` in the manifest for counts. Domains:

1. **pm-product-discovery** — OST, interviews, assumption tests
2. **pm-product-strategy** — vision, canvas, SWOT, Porter, Ansoff
3. **pm-execution** — PRD, OKR, sprint, stories, prioritization frameworks
4. **pm-market-research** — personas, journey, TAM/SAM/SOM, competitors
5. **pm-data-analytics** — SQL, cohorts, A/B analysis
6. **pm-go-to-market** — beachhead, ICP, growth loops, battlecards
7. **pm-marketing-growth** — positioning, naming, North Star
8. **pm-toolkit** — resume, NDA, proofread (non-core PM)
9. **pm-ai-shipping** — document vibe-coded apps; intended vs implemented audits

## How to use a PM skill

1. Prefer a **slash command** when the workflow is multi-step (`/discover`, `/write-prd`, …).
2. For reference frameworks (e.g. `prioritization-frameworks`, `opportunity-solution-tree`), open the skill when the user asks a focused question.
3. Load `references/` only when the skill body points there.
4. After PM artifacts exist, route implementation to **`using-agent-skills`** — do not re-implement eng process inside PM skills.

## Updating the catalog

```powershell
git -C vendor/phuryn-pm-skills pull --ff-only origin main
node .cursor/scripts/sync-pm-skills.mjs
node .cursor/scripts/audit-skills-trust.mjs --pm-skills
```

## Gotchas

- PM skills encode **frameworks** (Torres, Cagan, Savoia, etc.) — surface assumptions; do not treat output as validated research without user data.
- `/security-audit-static` (PM) ≠ `/security-audit` (hub SecOps) — different scope; PM version cross-checks documented intent vs code.
- Legal skills (`draft-nda`, `privacy-policy`) are templates — not legal advice; flag jurisdiction review.
- Synced skills are **copies** from vendor; edit upstream or maintain hub-local wrappers instead of editing synced folders in place (they are overwritten on sync).
