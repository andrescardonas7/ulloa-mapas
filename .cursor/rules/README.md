# Rules (`.cursor/rules`)

This folder contains **behavior rules** for AI agents: code quality, security, workflows, and language- or domain-specific guidance. Cursor loads `.mdc` files from here recursively.

---

## Folder layout

| Folder                      | Contents                                                                                                          | Default mode                               |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `00-agent-behavior/`        | Agent orchestration, cursor tools, prompting, humanizer, skills audit                                              | 1 always-on (`skills-audit`); rest intelligent / requestable |
| `01-domain/`                | Backend API, mobile, web, cross-platform, DevOps/infra                                                            | Apply intelligently (`description` + `globs`) |
| `02-front-end/`             | React/Next.js patterns, UI components, i18n                                                                       | Apply intelligently                        |
| `03-languages/`             | Flutter, Go, Python, Rust, Swift                                                                                  | Apply intelligently                        |
| `04-code-quality/`          | Standards, linting, error handling, architecture, complexity, performance, testing, spelling, CodeScene, patterns, full-stack testing | 1 always-on (`01_code-standards`); rest intelligent |
| `05-development-workflows/` | Commits, PRs, git workflow, hooks                                                                                 | Apply intelligently                        |
| `06-documentation/`         | ADRs, doc creation, Mermaid diagrams                                                                              | Apply intelligently                        |
| `07-processes/`             | Check/verify, Codacy, pre-commit setup, screenshots, doc updates                                                  | Apply intelligently                        |
| `08-problem-solving/`       | Issue analysis, bug fixes, Five Whys                                                                              | Apply intelligently                        |
| `09-monitoring/`            | Logging, performance profiling, agent performance                                                                 | Apply intelligently                        |
| `10-security/`              | Security standards, env protection, hardcoding policy, API-key/secret protection, cybersecurity, supply chain     | 3 always-on (`security-core`, `api-key-security`, `supply-chain-security`); `security-env` and `hardcoding-policy` are **intelligent** (request when editing `.env` or literals) |
| `11-guidelines/`            | Karpathy pointer (canonical rule in `00-agent-behavior/`); Clean Code Martin pointer | Apply intelligently                        |

### Root files

| File                 | Purpose                                          |
| -------------------- | ------------------------------------------------ |
| `README.md`          | This file                                        |
| `RULE.md`            | Short constitution for assistants (non-negotiables + pointers) |
| `cursor-config.json` | Hub convention (workflows, file limits, testing) — **not** read natively by Cursor; toggles are documentation for agents |

---

## Rule activation modes

Cursor uses frontmatter on each `.mdc` file:

| Mode | Frontmatter | When it loads |
| ---- | ----------- | ------------- |
| **Always apply** | `alwaysApply: true` | Every conversation (highest context cost) |
| **Apply intelligently** | `alwaysApply: false` + `description` | When the task matches the description (recommended for large rules) |
| **Glob / requestable** | `alwaysApply: false` + `globs` and/or `description` | When matching files or agent requests the rule |

Repo root [`AGENTS.md`](../../AGENTS.md) is separate hub guidance (hooks, supply chain); it is not an `.mdc` file but may still be injected by Cursor project settings.

---

## Always apply (`alwaysApply: true`)

These **five** rules are injected into **every** conversation:

| File | Purpose |
| ---- | ------- |
| `00-agent-behavior/skills-audit-policy.mdc` | Lightweight trust scan when adding/changing skills |
| `04-code-quality/01_code-standards.mdc` | Core code standards (stack-aware; pnpm/TS only when Node manifests present) |
| `10-security/security-core.mdc` | Security principles summary (validation, secrets, HTTPS, OWASP) |
| `10-security/api-key-security.mdc` | Secrets, tokens, env files, agent permissions |
| `10-security/supply-chain-security.mdc` | Supply-chain guardrails (pnpm when Node; universal bullets always) |

**Not always-on** (apply intelligently when the task matches):

| File | When to expect it |
| ---- | ----------------- |
| `10-security/security-env.mdc` | Editing `.env` / credential files |
| `10-security/hardcoding-policy.mdc` | Reviewing literals, paths, env-specific values |

Stack-specific behavior is spelled out in **`01_code-standards.mdc`** and **`supply-chain-security.mdc`** (sections *Stack scope*). Hub default for Node is still pnpm; Python/R/QGIS/Go repos should not get `pnpm` advice when manifests say otherwise.

---

## Context budget (measured)

Re-run after changing frontmatter:

```bash
node .cursor/scripts/audit-rules-context.mjs
```

Snapshot (hub RULES repo; run the script for current numbers):

| Layer | Lines | Chars (approx.) |
| ----- | ----: | --------------: |
| 5× always-on `.mdc` | ~255 | ~12k |
| `AGENTS.md` (repo root) | ~72 | ~5k |
| **Hub rules baseline** | **~327** | **~17k** |
| Not every chat: `cursor-agent-orchestration` + `human` | ~937 | ~31k |

Rough token estimate: **chars ÷ 4** (e.g. ~4k tokens hub baseline; large rules attach only when the task matches — avoid broad `**/*.ts` / `**/*.md` globs on reference guides).

**Not measured here:** Cursor **User Rules** (global), **Project Rules** outside this hub, MCP/plugin rules, and the system prompt.

---

## User Rules (global layer)

Configured in **Cursor → Settings → Rules → User Rules** (not in this git repo). They apply to **every** project alongside hub `.mdc` files.

Typical contents (audit yours in the UI):

| Block | Role | Suggestion |
| ----- | ---- | ---------- |
| Long governance doc (PBI, TDD mandatory, DoD) | Process for product repos | Move to **project** `AGENTS.md` or requestable rule; keep in User Rules only a one-line pointer |
| `committing-changes-with-git` / `creating-pull-requests` | Git/gh workflows | Keep; already scoped to explicit user requests |
| Communication / code principles | Tone and diff discipline | Keep short always-on bullets |
| Duplicate of hub security/orchestration | Noise | Remove duplicates already in hub always-on |

**Rule of thumb:** User Rules = personal defaults &lt;2–3k chars; hub = shared policy; project = repo-specific.

**Delivery governance (full doc, not User Rules):** [`docs/templates/ai-delivery-governance.md`](../../docs/templates/ai-delivery-governance.md) → copy to `docs/delivery/GOVERNANCE.md` in product repos; active copy in this hub: [`docs/delivery/GOVERNANCE.md`](../../docs/delivery/GOVERNANCE.md).

---

## Apply intelligently (selected)

`alwaysApply: false` with a **`description`** — Cursor attaches the rule when the task fits (saves context vs always-on).

Notable hub choices (large rules kept off always-on):

| File | `description` (summary) |
| ---- | ------------------------ |
| `00-agent-behavior/cursor-agent-orchestration.mdc` | Sub-agents, parallel work, EPIC todos, date-aware search, hooks |
| `00-agent-behavior/human.mdc` | Humanize AI-sounding docs, commits, PR copy, user-facing text |

All other `.mdc` files with `alwaysApply: false` and a `description` (and optional `globs`) follow the same **apply intelligently** pattern unless you change them in the editor.

---

## Conventions

- Prefer **small, focused** rule files over large monoliths.
- Rules should be **actionable** and **testable**.
- Use **`description`**, **`alwaysApply`**, and **`globs`** in frontmatter so Cursor can decide when to apply them.
- Keep `alwaysApply: true` to a minimum -- every always-on rule consumes context window in every conversation.

---

## Trade-offs to watch

Nothing here is “wrong,” but these are the usual pressure points:

1. **Growing the always-on set again**
   The hub intentionally keeps **five** `alwaysApply: true` rules (skills audit + core standards + three security summaries). Each extra always-on rule is injected into **every** chat. Prefer **apply intelligently** (`description` + `alwaysApply: false`) for large guides such as orchestration, humanizer, and `web-development.mdc`.

2. **Broad globs on large rules**
   Reference guides (web dev, logging, cybersecurity, workflows) should **not** use `**/*.ts` or `**/*.md` globs — that attaches thousands of lines when editing a single file. Reserve globs for narrow targets (test files, `docs/**`, bundler configs).

3. **Overlap across always-on blocks**
   Agent behavior, code quality, and security often ship together by default. That can be **intentional policy**. If you notice the same idea repeated across several `.mdc` files, prefer **one canonical section** and link or trim duplicates instead of copying paragraphs.

4. **Mixed file naming**
   Examples like `01_code-standards.mdc` vs `server-cache-react.mdc` follow different styles; within a folder there is usually a reason (numeric ordering vs topic slug). It does not break anything—it mainly affects **sort order when listing** and how easy names are to **remember**. If it bothers you, document a convention per folder (or a gradual rename plan) in this README.

5. **Large reference rules (>300 lines)**
   Guides such as `devops-infrastructure.mdc`, `flutter-development.mdc`, or `web-development.mdc` intentionally exceed the **code** file-size limit. They are **apply intelligently** (or narrow globs only) so they do not inflate every chat. Split only if a section becomes independently reusable.
