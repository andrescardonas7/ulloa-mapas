---
name: obsidian-bases
description: >-
  Create and edit Obsidian .base files (database views) with filters, formulas,
  summaries, and multiple view types (table, cards, list, map). Use when the user
  wants a dynamic, queryable view over their notes, a reading list, task dashboard,
  project tracker, or any filtered/aggregated view inside an Obsidian vault.
  Do NOT use outside real Obsidian vaults or for static Markdown tables.
---

# Obsidian Bases (granular skill)

**Router:** `using-obsidian`

Powerful, live database views over your vault. A `.base` file is pure YAML that Obsidian renders as interactive tables, cards, etc. This skill encodes the full schema, formula language, filter syntax, and best practices.

## When to use

- User wants "a database of my projects", "reading list with status", "tasks due this week", "literature by topic".
- Need computed columns (days until due, reading time estimate, priority icons).
- Want multiple synchronized views (table + cards) with different filters on the same data.
- User mentions ".base file" or "Bases" in Obsidian.

## When NOT to use

- One-off static table in a single note (just use Markdown table).
- Anything outside an Obsidian vault.

## Core structure (memorize this)

```yaml
filters: ...          # global (and/or/not, recursive)
formulas:
  days_until: 'if(due, (date(due) - today()).days, "")'
properties:
  status: { displayName: "Status" }
  formula.days_until: { displayName: "Days Left" }
summaries:
  price: Sum
views:
  - type: table | cards | list | map
    name: "Active"
    order: [file.name, status, formula.days_until]
    groupBy: { property: status }
    summaries: { price: Average }
```

## Most useful formulas (daily driver set)

```yaml
days_until_due: 'if(due, (date(due) - today()).days, "")'
is_overdue: 'if(due, date(due) < today() && status != "done", false)'
reading_time: 'if(pages, (pages * 2).toString() + " min", "")'
status_icon: 'if(status == "done", "✅", if(status == "reading", "📖", "📚"))'
word_count_estimate: '(file.size / 5).round(0)'
```

**Critical:** Duration math requires `.days`, `.hours` etc. Never call `.round()` directly on a duration.

## Filter patterns you will use constantly

```yaml
filters:
  and:
    - 'status != "done"'
    - file.hasTag("project")
    - 'priority > 2'

filters:
  or:
    - file.hasTag("book")
    - file.hasTag("article")

filters:
  not:
    - 'file.inFolder("Archive")'
```

## View types quick map

- `table` — default, best for many columns + summaries.
- `cards` — gallery / visual browsing (cover images, short descriptions).
- `list` — minimal, high density.
- `map` — requires lat/lng properties + Maps plugin.

## Senior workflow

1. Define the **entity** clearly (what does one row represent?).
2. Write global filters first (narrow the universe).
3. Add the 3–5 formulas you actually need.
4. Create 2 views minimum (one for "working set", one for "done / archive").
5. Use `groupBy` and summaries aggressively — they are free power.

## Full reference

Complete schema, every function, quoting rules, and troubleshooting live in the vendored original:

`vendor/obsidian-skills/skills/obsidian-bases/SKILL.md`

(Plus the official Obsidian help pages linked inside it.)

## Related

- `using-obsidian` (router)
- `obsidian-markdown` (the notes this base will query)
- `json-canvas` (sometimes a canvas is a better "dashboard" than a base)

Use Bases when you need **live, filterable, formula-driven aggregation** over many notes. Use everything else when you need something lighter.
