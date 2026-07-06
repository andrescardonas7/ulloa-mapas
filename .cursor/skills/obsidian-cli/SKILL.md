---
name: obsidian-cli
description: >-
  Interact with a running Obsidian desktop app via the official Obsidian CLI.
  Create, read, search, append to notes, manage properties, run daily note commands,
  reload plugins, take screenshots, inspect DOM, run JS in app context.
  Use only when Obsidian is open on the user's machine and they want direct
  vault manipulation or plugin development workflows. Requires the CLI to be installed.
---

# Obsidian CLI (granular skill)

**Router:** `using-obsidian`

This skill teaches you the practical, high-ROI commands of the official `obsidian` CLI. It only works when the Obsidian desktop application is actually running.

## Prerequisites (never skip)

1. Obsidian desktop app is open.
2. The CLI is installed (`npm install -g obsidian` or equivalent).
3. You are on the same machine (local only).

If any of these are false → tell the user and do not attempt commands.

## Most useful commands (daily driver)

```bash
# Reading & writing
obsidian read file="My Note"
obsidian create name="New Note" content="# Hello\n\nBody here"
obsidian append file="My Note" content="New paragraph"

# Search & navigation
obsidian search query="machine learning" limit=20
obsidian backlinks file="My Note"

# Properties
obsidian property:set name="status" value="done" file="My Note"
obsidian property:get name="tags" file="My Note"

# Daily notes (extremely common)
obsidian daily:read
obsidian daily:append content="- [ ] Follow up on X"

# Tags & tasks
obsidian tags sort=count counts
obsidian tasks daily todo
```

## Plugin & theme development workflow (the real power)

```bash
# After you edit plugin code
obsidian plugin:reload id=my-plugin

# Check for errors
obsidian dev:errors

# Visual proof
obsidian dev:screenshot path=before.png
obsidian dev:dom selector=".workspace-leaf" text

# Console
obsidian dev:console level=error

# Quick JS eval in app context
obsidian eval code="app.vault.getMarkdownFiles().length"
```

## Vault targeting

```bash
obsidian vault="My Research Vault" search query="attention"
```

## Flags you will use often

- `silent` — do not open the file in Obsidian after the operation.
- `--copy` — copy command output to clipboard.
- `overwrite` — when creating.

## When to reach for the CLI vs other skills

- You need to **create or modify many notes** programmatically from the agent.
- User is actively developing a plugin or theme and wants the fast dev loop (reload + screenshot + errors).
- User wants to inspect or manipulate the live app state.

For pure note **content authoring**, prefer `obsidian-markdown` + `using-obsidian`.

## Full command reference

Run `obsidian help` in a real environment for the absolute latest list. The vendored reference also contains the original documentation:

`vendor/obsidian-skills/skills/obsidian-cli/SKILL.md`

## Related

- `using-obsidian`
- All the content skills (`obsidian-markdown`, `json-canvas`, etc.) — the CLI is the **execution** layer on top of them.

---

**Tool, not content.** Load this when the user needs the live app to do something, not when they are thinking on paper (or in the vault).
