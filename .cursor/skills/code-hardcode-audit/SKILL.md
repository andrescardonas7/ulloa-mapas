---
name: code-hardcode-audit
description: Audit code for hardcoded secrets, magic numbers, environment-specific paths, and credentials embedded in source. Use when reviewing PRs or configs for hardcoding policy violations.
---

# Code hardcode audit

Scan changed files for values that should come from environment or configuration, not literals in code.

## Check for

- API keys, tokens, passwords, connection strings
- Absolute paths and machine-specific URLs
- Magic numbers without named constants (when repeated or security-relevant)

## Output

List findings by file with severity; suggest env var or config module replacements. Never paste secret values in the report.
