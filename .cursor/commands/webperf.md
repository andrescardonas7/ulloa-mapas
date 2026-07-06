---
description: Run a web performance audit (Core Web Vitals) via the web-performance-auditor persona.
---

# Webperf Command

Use `/webperf` for **browser-facing** web apps only — not CLIs, libraries, or server-only code with no UI.

## Mode

**Deep mode** when any of these exist:

- Lighthouse JSON (`npx lighthouse <url> --output json --output-path ./report.json`)
- PageSpeed Insights JSON (lab + CrUX)
- CrUX API response (`CRUX_API_KEY` or `GOOGLE_API_KEY`)
- DevTools performance trace
- Live URL + `cursor-ide-browser` MCP or Chrome DevTools MCP (`lighthouse_audit`, `performance_*`)

**Quick mode** (default): scan source for structural anti-patterns; label findings as `potential impact`, not measurements.

## Workflow

1. Confirm scope: files, components, URL, or diff under review.
2. Load `.cursor/agents/web-performance-auditor.md` (or spawn a subagent with that persona).
3. Pass artifact paths or pasted JSON when available.
4. Return the full scorecard and ranked findings — no extra synthesis step.

## Related

- Skill: `performance-optimization`
- Skill: `browser-testing-with-devtools`
- Upstream: [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) `/webperf`
