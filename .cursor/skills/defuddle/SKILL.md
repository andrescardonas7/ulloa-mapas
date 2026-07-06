---
name: defuddle
description: >-
  Extract clean, readable Markdown from noisy web pages using Defuddle.
  Removes navigation, ads, sidebars, cookie banners, and clutter while preserving
  the actual article content. Use when the user gives you a URL for research,
  documentation, blog posts, or papers they intend to save into an Obsidian vault.
  Strongly preferred over raw WebFetch for most human-facing web pages.
  Do NOT use on raw .md files, API endpoints, or when full DOM/HTML is required.
---

# Defuddle (granular skill)

**Router:** `using-obsidian`

Defuddle is the best-in-class tool (maintained by the same person as these skills) for turning messy web pages into high-signal Markdown ready for your vault.

## When to use (very high ROI)

- User pastes a URL and says "save this to my notes", "summarize this article for my vault", "research this topic".
- The page is a normal article, blog post, documentation page, academic write-up.
- You want to minimize tokens and noise before feeding content to the agent or saving it.

## When NOT to use

- The URL ends in `.md` or `.markdown` → just use `WebFetch` (it's already clean).
- You need the raw HTML, full DOM structure, or JavaScript-rendered app (use browser tools or WebFetch).
- API endpoints, JSON responses, GitHub raw files.
- You need **live web search** or vertical lookups (CVE, finance, etc.) → use hub skill **`anysearch`** instead.

## Primary command

```bash
defuddle parse <url> --md
```

Save directly:

```bash
defuddle parse <url> --md -o research/my-topic.md
```

Extract only metadata (cheap):

```bash
defuddle parse <url> -p title
defuddle parse <url> -p description
defuddle parse <url> -p domain
```

## Output formats

| Flag     | Use case |
|----------|----------|
| `--md`   | Almost always what you want for vault intake |
| `--json` | When you need both cleaned HTML + Markdown + metadata |
| (none)   | Raw HTML (rarely useful here) |

## Senior research intake pattern (with router)

1. User gives URL → load `using-obsidian`.
2. Router recommends `defuddle`.
3. Run `defuddle parse <url> --md`.
4. Take the clean Markdown → load `obsidian-markdown` → turn it into a proper vault note with frontmatter, tags, wikilinks to existing notes, callouts for key points, and block IDs on important paragraphs.
5. Optionally create or update a `json-canvas` or `obsidian-bases` view that includes this new note.

This combination (`defuddle` → `obsidian-markdown` → vault connections) is one of the highest-leverage research workflows you can offer.

## Full upstream reference

`vendor/obsidian-skills/skills/defuddle/SKILL.md`

(Also see the Defuddle GitHub repo for installation and advanced flags.)

## Related skills

- `using-obsidian` (the decision layer)
- `obsidian-markdown` (what you do with the clean content next)
- `literature-review`, `research-lookup`, `citation-management` — pair extremely well for serious research pipelines that ultimately land in Obsidian.

---

**Intake tool.** One of the best "research → vault" bridges currently available in the agent skills ecosystem. Use it liberally when the destination is Obsidian.
