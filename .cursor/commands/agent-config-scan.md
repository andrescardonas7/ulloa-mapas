# Agent config scan (AgentShield)

Scan **Cursor agent configuration** only: `.cursor/rules`, `.cursor/skills`, `.cursor/hooks.json`, MCP, agents. Does not replace app-code review (`security-review`) or dependency scans (Trivy).

**Scope:** Cursor hub. Alfred/OpenClaw uses `security-guard` separately.

## Usage

`/agent-config-scan [path] [--format text|json|markdown] [--min-severity medium|high] [--fix]`

Default path: `.cursor`

## Run

```bash
npx ecc-agentshield scan --path .cursor --min-severity medium
```

With report file:

```bash
npx ecc-agentshield scan --path .cursor --format markdown > .cursor/hooks/state/agentshield-last.md
```

## Output contract

1. Grade and score from AgentShield (source of truth)
2. Critical/high findings with **file paths** under `.cursor/`
3. Remediation order; note if `--fix` is safe per finding
4. Re-scan after fixes if changes were applied

## Do not

- Treat findings in `skills/security-review` examples as live secrets without verifying
- Run `--fix` without showing the user the diff first
- Confuse with `/security-audit` (manual app checklist)

See skill `agent-harness-security`.
