---
name: obsidian-markdown
description: >-
  Create and edit real Obsidian notes using Obsidian Flavored Markdown: wikilinks [[ ]],
  embeds ![[ ]], callouts > [!type], properties/frontmatter, block references ^id,
  tags, aliases, and native Obsidian syntax. Use ONLY when the output will live inside
  an Obsidian vault or the user explicitly asks for Obsidian-native note format.
  Do NOT use for general Markdown in code repos, GitHub, docs, or technical writing.
---

# Obsidian Markdown (granular skill)

**Router entry point:** `using-obsidian` (load this skill only after the router has pointed here).

This skill gives you precise, up-to-date knowledge of Obsidian's extended Markdown syntax so you can produce notes that render beautifully and connect properly inside a real vault.

## When to use this skill

- User is working inside (or building) an Obsidian vault.
- Task is to create or edit `.md` notes with internal linking, embeds, callouts, properties, etc.
- User says "write this as an Obsidian note", "use wikilinks", "add callouts", "make it work in my vault".
- Producing research summaries, meeting notes, literature notes, decision records, project pages that belong in PKM.

## When NOT to use this skill

- General Markdown editing (READMEs, code comments, API docs, GitHub issues).
- Technical writing that will never live in Obsidian.
- You only need standard CommonMark + GFM + Mermaid (use built-in knowledge or `markdown-mermaid-writing`).

## Core syntax (the parts that matter in real vaults)

### Wikilinks & block references
```markdown
[[Note Name]]
[[Note Name|Display text]]
[[Note Name#Heading]]
[[Note Name#^block-id]]
^block-id          (place after paragraph or on its own line for lists/quotes)
```

### Embeds
```markdown
![[Note Name]]
![[Note Name#Heading|300]]
![[image.png]]
![[document.pdf#page=3]]
```

### Callouts (very high signal in vaults)
```markdown
> [!note] Title
> Content here. Can nest.

> [!warning]- Collapsible
> Starts collapsed.
```

Common types: `note`, `tip`, `warning`, `info`, `example`, `quote`, `bug`, `danger`, `success`, `failure`, `question`, `abstract`, `todo`, `important`.

### Properties (frontmatter)
```yaml
---
title: My Note
date: 2026-05-29
tags: [project, active, research]
aliases: ["Alternative Name"]
status: in-progress
---
```

### Tags (inline or in frontmatter)
```markdown
#project/research
#nested/tag
```

### Highlights, comments, math, Mermaid
```markdown
==highlighted==
%% hidden comment %%
$ E = mc^2 $
```mermaid ... ```
```

## Recommended workflow (senior PKM practice)

1. Start with clear frontmatter (title, date, tags, status, aliases).
2. Write in small, linkable atomic notes when possible.
3. Use wikilinks liberally for connections (this is where Obsidian's power lives).
4. Use callouts for attention, decisions, open questions, warnings.
5. Embed images/PDFs/excerpts instead of duplicating content.
6. Add block IDs (`^id`) on key paragraphs you will reference from other notes.

## Complete realistic example

```markdown
---
title: "Q2 Research Synthesis"
date: 2026-05-29
tags: [research, q2, synthesis]
status: in-progress
aliases: ["Research Q2"]
---

# Q2 Research Synthesis

Core finding from [[Paper - Attention Is All You Need]].

> [!important] Key Implication
> The architecture change enables ==parallel training== at scale.

## Open Questions
- How does this interact with [[Our Current Pipeline#Limitations]]? ^open-q-1

See also ![[Architecture Diagram.png|600]] and the discussion in [[2026-05-20 Meeting Notes]].
```

## Related skills

- `using-obsidian` — always consult the router first for context.
- `obsidian-bases` — when you need to query many notes with this syntax.
- `json-canvas` — when the thinking is better done visually.
- `defuddle` — when bringing external content into the vault.
- `literature-review` + `citation-management` — excellent upstream research companions.

## References (full upstream detail)

Full syntax, properties reference, embed types, and advanced callout nesting live in the vendored copy:

`vendor/obsidian-skills/skills/obsidian-markdown/SKILL.md`

(We keep a minimal, high-signal version here for fast loading. The vendor copy is the complete reference for edge cases.)

---

**Granular by design.** Load this skill only when you have already decided the task belongs in an Obsidian vault and involves note authoring/editing.
