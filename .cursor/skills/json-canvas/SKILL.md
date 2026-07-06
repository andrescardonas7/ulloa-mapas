---
name: json-canvas
description: >-
  Create, edit, and validate JSON Canvas (.canvas) files — infinite visual boards
  with nodes (text, file, link, group), edges, colors, and layout. Use when the
  user wants a mind map, research canvas, project board, architecture diagram,
  decision tree, or any free-form visual thinking surface that will live in an
  Obsidian vault. Do NOT use for Mermaid diagrams or static images.
---

# JSON Canvas (granular skill)

**Router:** `using-obsidian`

JSON Canvas is Obsidian's open format for infinite 2D canvases (nodes + edges + groups). It is the native way to do visual thinking that stays inside your vault and can embed real notes, images, and external links.

## When to use

- User asks for a "canvas", "mind map", "research board", "project overview on canvas".
- Visual reasoning, relationship mapping, or free-form layout is the right medium.
- They want something that can embed actual vault files and stay version-controllable as JSON.

## When NOT to use

- The diagram is better expressed as Mermaid (sequence, flowchart, ERD, etc.) → use `markdown-mermaid-writing` or built-in knowledge.
- They just want a pretty static image.

## Node types (the four that matter)

| Type   | Purpose                          | Required fields                  |
|--------|----------------------------------|----------------------------------|
| text   | Markdown content, notes, lists   | `id`, `type`, `x`, `y`, `width`, `height`, `text` |
| file   | Embed real vault file or image   | `id`, `type`, `x`, `y`, ..., `file` |
| link   | External URL preview             | `id`, `type`, ..., `url` |
| group  | Visual container / swimlane      | `id`, `type`, `x`, `y`, ..., `label`? |

## Edge essentials

```json
{
  "id": "unique16hex",
  "fromNode": "sourceId",
  "toNode": "targetId",
  "fromSide": "right",
  "toSide": "left",
  "toEnd": "arrow",
  "label": "optional label"
}
```

## ID generation (always do this correctly)

16 lowercase hex characters (64-bit random). Never reuse. Never sequential.

Good: `"a3f9c2d8e7b14f20"`

## Layout discipline (senior practice)

- Space nodes 60–120 px apart.
- Use negative coordinates freely (canvas is infinite).
- Groups should have 30–60 px padding around children.
- Align to 10 or 20 px grid when possible.
- Put the most important node near (0,0) or center of current view.
- Color groups and important edges for visual hierarchy.

## Validation checklist (run mentally every time)

1. All `id` values unique across nodes + edges.
2. Every `fromNode` / `toNode` exists in the nodes array.
3. Every node has required fields for its type.
4. Sides are one of: top, right, bottom, left.
5. Ends are "none" or "arrow".
6. JSON is valid (especially newlines inside text nodes — use `\n`).

## Complete minimal example

```json
{
  "nodes": [
    {
      "id": "a1b2c3d4e5f67890",
      "type": "text",
      "x": 0, "y": 0, "width": 400, "height": 200,
      "text": "# Research Question\n\nHow does X affect Y?"
    },
    {
      "id": "b2c3d4e5f6789012",
      "type": "file",
      "x": 500, "y": 50, "width": 300, "height": 180,
      "file": "Papers/Attention Is All You Need.pdf"
    }
  ],
  "edges": [
    {
      "id": "c3d4e5f678901234",
      "fromNode": "a1b2c3d4e5f67890",
      "toNode": "b2c3d4e5f6789012",
      "fromSide": "right",
      "toSide": "left",
      "label": "cites"
    }
  ]
}
```

## Full reference + advanced patterns

The complete spec, more examples (research canvases, project boards, architecture), and color palette details are in the vendored copy:

`vendor/obsidian-skills/skills/json-canvas/SKILL.md`

(Also see the official JSON Canvas spec at jsoncanvas.org.)

## Related skills

- `using-obsidian`
- `obsidian-markdown` (many canvas nodes will contain or link to real notes)
- `obsidian-bases` (sometimes a filtered base view is better than a free canvas)

Use Canvas when **spatial relationships and visual grouping** are part of the thinking. Use Bases when you need **queryable, filterable, aggregated data**.

---

**Precision tool.** Load only when the user has explicitly chosen a visual canvas medium inside their vault.
