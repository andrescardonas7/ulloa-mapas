---
name: using-obsidian
description: >-
  Router for Obsidian / Personal Knowledge Management workflows. Load when the user
  mentions Obsidian, their vault, wikilinks, callouts, .base files, .canvas files,
  daily notes, PKM, second brain, or wants to create/edit notes in Obsidian Flavored
  Markdown. Also use for extracting clean web content into a vault (Defuddle) or
  interacting with a running Obsidian instance via CLI. Do NOT load for general
  Markdown in code repositories, GitHub docs, or technical writing outside a personal
  vault (use standard markdown knowledge or markdown-mermaid-writing instead).
---

# Using Obsidian Skills (hub router)

## Overview

The RULES hub now has first-class support for **Obsidian** as a Personal Knowledge Management (PKM) environment.

We expose five granular skills (maximum trigger precision) plus this router:

| Skill                  | Best for |
|------------------------|----------|
| `obsidian-markdown`    | Writing or editing notes with `[[wikilinks]]`, `![[embeds]]`, `> [!callout]`, properties, tags, block references, etc. |
| `obsidian-bases`       | Creating powerful `.base` database views (tables, cards, filtered lists, formulas, summaries) over your notes. |
| `json-canvas`          | Building `.canvas` files — infinite visual boards, mind maps, research canvases, project boards, flowcharts. |
| `obsidian-cli`         | Talking directly to a running Obsidian app (create notes, search vault, reload plugins, take screenshots, dev commands). Requires Obsidian open. |
| `defuddle`             | Cleaning messy web pages into high-quality Markdown ready to drop into your vault (removes nav, ads, clutter). Preferred over WebFetch for research intake. |

## When to use this router

Use `using-obsidian` (this skill) first when:
- User explicitly says "Obsidian", "my vault", "in my notes", "PKM", "second brain".
- Task involves creating or editing content that will live in an Obsidian vault.
- User wants to output research, meeting notes, literature summaries, decision records, etc. in Obsidian-native format.
- User asks to "make a canvas", "create a base for...", "add this to my daily notes".
- User wants to pull external content cleanly into their vault.

## Decision tree (load only what you need)

```
User mentions Obsidian / vault / PKM / notes
│
├─ Writing or editing a note with wikilinks, callouts, embeds, properties?
│  └─ obsidian-markdown
│
├─ Need a database view, filtered list, or formula-driven table over notes?
│  └─ obsidian-bases
│
├─ Building a visual board, mind map, research canvas, or project canvas?
│  └─ json-canvas
│
├─ Need to talk to a running Obsidian instance (create, search, plugin dev, screenshots)?
│  └─ obsidian-cli   (Obsidian must be open)
│
├─ Pulling research from the web and want it clean for the vault?
│  └─ defuddle   (strongly preferred over raw WebFetch for most articles/docs)
│
└─ Just general Markdown help outside a vault?
   └─ Do NOT load any of the above. Use built-in knowledge or markdown-mermaid-writing.
```

## Granular skills — quick reference

**Load the specific skill directly** (do not re-read this router) once you know the exact need.

- `obsidian-markdown` → syntax reference + complete examples for real Obsidian notes.
- `obsidian-bases` → full YAML schema, formulas, views (table/cards/list/map), filter syntax, summaries.
- `json-canvas` → node/edge/group creation, ID generation, layout rules, validation checklist.
- `obsidian-cli` → every useful CLI command with examples (including dev:reload, dev:screenshot, eval, etc.).
- `defuddle` → one-command clean Markdown extraction from any URL.

## Gotchas (important)

- **Trigger discipline**: These skills are intentionally narrow. General Markdown tasks (READMEs, code comments, technical docs) should **not** trigger them.
- **Vault context**: The skills assume the user has (or is building) a real Obsidian vault. They do not try to invent a vault for you.
- **CLI requirement**: `obsidian-cli` only works when Obsidian desktop app is running and the CLI is installed.
- **Defuddle vs WebFetch**: Prefer `defuddle` for noisy web pages you intend to save into Obsidian. Use WebFetch only for raw API responses, GitHub raw files, or when you explicitly need the full DOM.

## Related hub skills

- `markdown-mermaid-writing` — for high-quality Mermaid + Markdown outside Obsidian vaults.
- `literature-review`, `research-lookup`, `citation-management` — excellent companions when doing research that will later land in the vault.
- `pdf`, `docx` — when the final artifact needs to leave the vault as a formal document.

## Future extensions (roadmap note)

If you later want skills for:
- Dataview queries
- Templater / Templater scripts
- Advanced plugin development patterns
- Specific community plugins (Excalidraw, Kanban, etc.)

They can be added cleanly under the same `obsidian-pkm` pack in the manifest.

---

**This router exists to give you precision and low token cost.**
Load it early in a session when the context is "my Obsidian vault / PKM work". Then jump straight to the one granular skill you actually need.
