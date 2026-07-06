---
name: anysearch
description: >-
  Load for real-time web search, vertical domain queries (finance, CVE, academic,
  travel, etc.), parallel batch search, and URL content extraction via AnySearch CLI.
  Preferred hub search skill when current facts, fact-checking, or structured domain
  lookups are needed. For Obsidian vault intake from a known URL use defuddle instead.
  Requires optional ANYSEARCH_API_KEY (see api-key-security). Do NOT use for secrets
  or PII in queries. Fall back to WebSearch only if AnySearch fails and user approves.
license: Apache-2.0
metadata:
  skill-author: anysearch-ai (hub-adapted)
  hub-path: .cursor/skills/anysearch/
  upstream: https://github.com/anysearch-ai/anysearch-skill
  upstream-version: "2.1.0"
credentials:
  - name: ANYSEARCH_API_KEY
    required: false
    description: "Optional API key for higher rate limits. Anonymous access available."
    storage: ".cursor/skills/anysearch/.env (gitignored) or OS environment variable"
---

# AnySearch (hub)

Unified real-time search for agents: general web, vertical domains, parallel batch, and page extraction. No MCP install — bundled CLIs talk to `https://api.anysearch.com`.

**Skill directory:** `.cursor/skills/anysearch/` (use absolute path on this machine when invoking CLI).

**Full upstream reference:** `references/full-guide.md` (refreshed by `sync-anysearch-skill.mjs`).

## Hub routing (read first)

| Need | Use |
| --- | --- |
| Facts, news, docs, current data, fact-check | **anysearch** (`search` / `batch_search`) |
| Finance, CVE, DOI, patents, travel codes, etc. | **anysearch** vertical path (`get_sub_domains` → `search`) |
| Extract page content from search results | **anysearch** `extract` |
| Save a known article URL cleanly into Obsidian | **`defuddle`** (not anysearch) |
| Deep synthesized research report (Parallel API) | `parallel-web` in `~/.agents/skills/` if installed |
| Academic paper databases (PubMed, Scholar) | `research-lookup` / `citation-management` in `~/.agents/skills/` |
| AnySearch down / quota / network error | Inform user; may fall back to **WebSearch** with approval |

**Default vertical rule:** For queries overlapping supported domains, call `get_sub_domains` first. When unsure, use hybrid `batch_search` (1 general + N vertical). See `references/full-guide.md`.

## Security (hub policy)

Load **`api-key-security`** when configuring or auditing keys.

- Never commit `.env` or paste API keys in chat, commits, or PRs.
- Copy `.env.example` → `.env` locally; file is gitignored.
- Key priority: `--api_key` flag > `.env` > OS env > anonymous.
- Auto-registered keys from API responses: **ask user before writing** to `.env`.
- Queries and extracted URLs are sent to AnySearch's API — **no passwords, tokens, or personal data** in search strings.
- Before trusting scripts after upstream sync, run `node .cursor/scripts/audit-skills-trust.mjs --skill anysearch`.

## Runtime

Read `<skill_dir>/runtime.conf` if present (fast path). This hub clone ships with a detected runtime on install.

| Field | Meaning |
| --- | --- |
| `Runtime` | Python, Node.js, PowerShell, or Bash |
| `Command` | Full prefix for all subcommands |

If missing or broken, detect: Python (`python`/`python3` + `requests`) → Node.js → Shell (PS1 on Windows, sh elsewhere). Regenerate with steps in `.cursor/SYNC-ANYSEARCH.md`.

## Command cheat sheet

Replace `<cmd>` with the `Command` from `runtime.conf` (without subcommand). Example on this hub: `python .cursor/skills/anysearch/scripts/anysearch_cli.py`.

```bash
# General search
<cmd> search "query" --max_results 5

# Vertical (discover params first)
<cmd> get_sub_domains --domain finance
<cmd> search "AAPL" --domain finance --sub_domain finance.us_stock --sdp ticker=AAPL

# Parallel batch
<cmd> batch_search --query "AAPL" --query "MSFT" --domain finance --sub_domain finance.us_stock --sdp ticker=AAPL

# Extract (Markdown output; no --format flags)
<cmd> extract "https://example.com/page"
```

Run `<cmd> doc` only when CLI shape is unknown or a subcommand fails with schema errors — not on every activation.

**Invalid:** `extract --format markdown`, `extract --markdown`.

## Gotchas

- Omitting **required** `--sdp` params from `get_sub_domains` causes backend validation errors; pass empty string if unknown.
- `extract` accepts only URL positional or `--url` / `-u`.
- Do not run `doc` before every search when `runtime.conf` exists — wastes tokens.
- Upstream sync overwrites `scripts/` and `references/full-guide.md`, never hub `SKILL.md` or local `.env` / `runtime.conf`.

## Related skills

- `api-key-security` — credential handling
- `defuddle` — vault-oriented URL → Markdown
- `skill-trust-audit` — post-import trust scan
- `using-obsidian` — PKM router when destination is a vault

## Maintenance

```bash
git -C vendor/anysearch-skill pull origin main
node .cursor/scripts/sync-anysearch-skill.mjs
node .cursor/scripts/audit-skills-trust.mjs --skill anysearch
```

See `.cursor/SYNC-ANYSEARCH.md`.
