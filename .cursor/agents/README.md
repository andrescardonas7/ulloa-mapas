# Agents (`.cursor/agents`)

This folder holds **agent personas** (system prompts) for different roles. Each file is one persona and is referenced by slash commands or used when a role-based behavior is needed.

---

## What lives here

- One Markdown file per agent (e.g. `architect.md`, `planner.md`).
- Frontmatter field order: `name`, `description`, `tools`, `model`, then optional `readonly` and `is_background`.
- Use `model: inherit` to use the parent session model; explicit slugs include `gpt-5.5-medium`, `composer-2.5`, `composer-2.5-fast`.
- Review-only personas set `readonly: true` and omit `Write`/`Edit` from `tools`.
- Body: role, process, principles, and examples.

---

## Agent index

| File                      | Role               | Purpose                                                        |
| ------------------------- | ------------------ | -------------------------------------------------------------- |
| `architect.md`            | Software architect | System design, scalability, technical decisions, trade-offs    |
| `build-error-resolver.md` | Build fixer        | Resolve TypeScript and build errors incrementally              |
| `code-reviewer.md`        | Code reviewer      | Review code for quality, patterns, and best practices          |
| `codescene-standards.md`  | CodeScene          | Apply CodeScene quality and hotspot standards                  |
| `doc-updater.md`          | Doc updater        | Update and structure documentation                             |
| `e2e-runner.md`           | E2E runner         | Run and fix end-to-end tests                                   |
| `mcp-manager.md`          | MCP integrator     | Discover/execute MCP tools; keep main context light (pairs with `mcp-management` skill) |
| `planner.md`              | Planner            | Break down features, create implementation plans, assess risks |
| `refactor-cleaner.md`     | Refactor/cleaner   | Refactor and clean up code                                     |
| `security-reviewer.md`    | Security reviewer  | Security-focused code and config review                        |
| `web-performance-auditor.md` | Web perf auditor | Core Web Vitals audits via `/webperf` (addyosmani/agent-skills) |
| `tdd-guide.md`            | TDD guide          | Enforce test-driven development (red–green–refactor)           |
| `testing.md`              | Testing            | General testing strategy and execution                         |
| `vercel-engineering.md`   | Vercel             | React/Next.js performance optimization reference               |
| `redteam-planner.md`      | Red team planner   | Attack paths, C2/OPSEC, MITRE ATT&CK sequencing (authorized assessments only) |
| `reverse-engineer.md`     | Reverse engineer   | Binary/firmware/protocol RE, static and dynamic analysis       |
| `exploit-researcher.md`   | Exploit researcher | Vuln research, PoC design, exploit primitives (authorized scope) |
| `network-analyst.md`      | Network analyst    | Traffic analysis, lateral movement, protocol abuse detection   |
| `ai-researcher.md`        | AI security researcher | LLM/agent threats, alignment, red-teaming AI systems      |

---

## When to use

- **Slash commands** (e.g. `/plan`, `/tdd`, `/code-review`) reference these agents by name.
- Use when you want **consistent role-based behavior** across tools or sessions.
- They also document what “good” looks like for each role for humans.

---

## Most efficient way for Cursor to load a persona (preferred order)

Cursor does not auto-dispatch to these files; something must **pull the prompt** into the chat. Use the lowest-token, clearest path first.

1. **Slash command (best when available)** — The command’s Markdown is the entry point: the model gets a full recipe without you pasting the agent file. Examples:
   - `/plan` → `planner.md` · `/tdd` → `tdd-guide.md` · `/e2e` → `e2e-runner.md` · `/code-review` → `code-reviewer.md` · `/use-mcp` → follow `mcp-manager` persona and MCP-only workflow (`commands/use-mcp.md` references this agent by name).
2. **`@` mention the agent file** — e.g. `@.cursor/agents/architect.md` (or the path after `cursor-hub` install: `.cursor/agents/…`). Use when there is no dedicated slash command or you want a short task with that role.
3. **One-line pointer in the prompt** — e.g. “Act per `.cursor/agents/build-error-resolver.md` for the next turn.” Smaller than pasting the whole file; best when the model already has repo access to read it.
4. **Rule-based orchestration** — `rules/00-agent-behavior/agents.mdc` tells the *primary* agent *when* to think in terms of planner / reviewer / etc.; it does not replace (1)–(3) for loading the long persona text.

**Token discipline:** For MCP-heavy work, prefer delegating to `mcp-manager` (via `/use-mcp` or by `@` the file) so discovery and tool execution stay out of the main thread’s context when possible.

---

## Paths

- In Cursor (hub): `.cursor/agents/<name>.md`.
- Commands reference agents under `.cursor/agents/`.
