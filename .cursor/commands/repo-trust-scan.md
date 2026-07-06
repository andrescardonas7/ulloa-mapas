---
description: Read-only trust scan for cloned or third-party repos (patterns, manifests, optional gitleaks/trivy). Run before first install.
---

# Repo Trust Scan

## Overview

Opt-in, **read-only** scan for repositories you just cloned or do not fully trust. Does **not** modify files, install dependencies, or block the agent by default.

**When to use:** After `git clone`, before the first `pnpm install` / `npm install`, or when onboarding an unfamiliar codebase.

**Not a substitute for:** `/security-scan` (deep tool scan on known projects) or `/security-audit` (manual review).

## Quick scan (default, ~seconds)

```bash
node .cursor/scripts/repo-trust-scan.mjs --target "<project-root>"
```

Or from the hub:

```bash
node .cursor/scripts/cursor-hub.mjs trust-scan --project "<project-root>"
```

Checks:

- Suspicious patterns (`curl` piped to shell, `eval`, network cradles, etc.)
- **Obfuscated payloads** (`eval`/`exec` combined with `atob`, `Buffer.from(... base64)`, `String.fromCharCode`, `b64decode` on the same line)
- **Credential exfiltration** (reading `process.env`, `.npmrc`, `.aws/credentials`, `.ssh/`, `id_rsa`, `os.environ` and sending it via `fetch`/`axios`/`requests`/`curl`/`wget` on the same line)
- `package.json` lifecycle scripts (`postinstall`, …)
- GitHub Actions risk signals (`pull_request_target`, broad `write` permissions)

> These are single-line heuristics: payloads split across multiple lines or heavily obfuscated can still evade them. Use the **full** scan (`osv-scanner`, `trivy`) plus human review for deeper assurance.

## Full scan (optional, minutes)

Requires tools in PATH (each skipped gracefully if missing):

- `gitleaks` (secrets; use `--no-history` for HEAD-only)
- `osv-scanner`
- `trivy fs`
- `pnpm audit` or `npm audit`

```bash
node .cursor/scripts/repo-trust-scan.mjs --target "<project-root>" --mode full
```

## Strict mode (CI / gate)

Exit code `1` when **high** severity findings exist:

```bash
node .cursor/scripts/repo-trust-scan.mjs --target "<project-root>" --mode full --strict
```

## Windows

```powershell
.\.cursor\scripts\repo-trust-scan.ps1 --target "C:\path\to\repo"
```

## Agent instructions

1. Run **quick** scan first; summarize counts and top findings (never paste secret values).
2. If HIGH findings or lifecycle scripts exist, **do not** run package install until the user confirms.
3. Offer **full** scan only when the user wants deeper checks and accepts longer runtime.
4. State which optional tools were skipped.
5. Do not claim the repo is "safe" — report `decision` and residual risk.

## Notes

- Scanning the **RULES hub** itself may report HIGH items inside SecOps/education skills (`privesc-linux`, `libafl`, etc.). That is expected; use the target app repo for onboarding checks.
- Exit code stays `0` unless `--strict` and HIGH findings exist.

## Related

- Skills: `supply-chain-guard`, `misteye-security-check`
- Hooks: `before-pkg-install`, `after-lockfile-edit` (active during install/edit, not at clone time)
- Hub doctor: `/doctor` (link integrity, not malware)
