---
name: remote-repo-cache
description: >-
  Load when the user points to an external GitHub/GitLab/Bitbucket repo as reference
  (URL, git@, or owner/repo) and you need a local read-only checkout without cloning
  into the project tree. Triggers: revisar repo externo, clonar referencia, owner/repo
  en GitHub, comparar con upstream open source. Do NOT load for repos already in the
  workspace, normal git clone into the project, or when web_fetch/docs suffice.
---

# Remote repo cache

Maintain a reusable read-only checkout under `~/.cache/checkouts/<host>/<org>/<repo>` with throttled fetch and shallow-friendly clone. Adapted from [mitsuhiko/agent-stuff](https://github.com/mitsuhiko/agent-stuff) `librarian` skill (Apache-2.0).

## When to use

- User shares a **remote** repo link for comparison, API patterns, or reading upstream source
- You need stable paths across sessions without polluting the project directory
- Investigating third-party code cited in issues or docs

## When NOT to use

- Target repo is **already** the open workspace or a submodule
- A one-off `web_fetch` on a single file URL is enough
- User asked to **fork or contribute** inside the project — clone into the project instead

## Security and safety

- Cache is for **reference reading** — do not store secrets, tokens, or `.env` from cached repos in memory files
- Prefer **HTTPS** public repos; private repos require the user's git credentials already configured
- **Do not commit** from the cache path; **do not edit** files in the cache for task work
- For changes: copy or worktree elsewhere; treat cache as read-only upstream mirror

## Prerequisites

- `git` on PATH
- On Windows: run the script with **Git Bash** or any `bash` that ships with Git for Windows

## Script

From this skill directory:

```bash
bash scripts/checkout.sh <repo> --path-only
```

Examples:

```bash
bash scripts/checkout.sh vercel/next.js --path-only
bash scripts/checkout.sh https://github.com/mitsuhiko/agent-stuff --path-only
bash scripts/checkout.sh git@github.com:org/repo.git --path-only
```

Options:

- `--force-update` — fetch immediately (ignore 5-minute throttle)
- `--update-interval <secs>` — override throttle (default 300)
- `--path-only` — print checkout path only (recommended for agents)

Environment (optional):

- `LIBRARIAN_CACHE_ROOT` — override cache root (default `~/.cache/checkouts`)
- `LIBRARIAN_DEFAULT_HOST` — host for `owner/repo` shorthand (default `github.com`)

## Workflow

1. Run `checkout.sh … --path-only` and capture the printed path
2. Read/search under that path only for the user's question
3. On later requests for the same repo, run again; script reuses and refreshes when stale

## Windows note

PowerShell alone may not run `bash` scripts. Use:

```powershell
& "C:\Program Files\Git\bin\bash.exe" -lc "bash scripts/checkout.sh owner/repo --path-only"
```

Adjust Git install path if different. WSL bash also works.

## Evals (routing)

| Case | Should activate |
|------|-----------------|
| "Compare our auth with github.com/org/app" | Yes |
| "Read src/foo.ts in this repo" (workspace) | No |
| "Clone this into our monorepo" | No (project clone) |

## Related skills

- `gh-cli` / user git rules — for PRs and issues on GitHub
- `security-review` — if analyzing untrusted third-party code for integration

## Provenance

- `scripts/checkout.sh` from [agent-stuff/skills/librarian](https://github.com/mitsuhiko/agent-stuff/tree/main/skills/librarian) (Apache-2.0), unchanged behavior.
