---
name: misteye-security-check
description: Local offline security gate for dependency installs and external links. This profile intentionally removes all API and key coupling.
metadata:
  version: "1.4.21-offline-local.2"
  mode: "offline-local-only"
  upstream_repo: "https://github.com/slowmist/misteye-skills"
---

# MistEye Security Gate (Offline Local Mode)

This local profile keeps a detect-first workflow without any cloud or API calls.

## Hard Rules

1. Do not call external security APIs.
2. Do not require or request any external service credential.
3. Do not rely on cloud "safe/matches" outputs.
4. Use only local evidence and deterministic heuristics.

## Trigger Conditions

Run pre-check before:

- opening URLs or domains
- downloading external files
- installing dependencies
- installing local/remote Skill/MCP packages

## Local Risk Policy

### URL/Domain checks

- High risk -> block:
  - punycode lookalikes (`xn--`)
  - executable payload links from unknown hosts
  - suspicious brand-typo domains
- Medium risk -> ask confirmation:
  - unknown domains without project context
  - binary download links from unofficial mirrors
- Low risk -> continue with warning:
  - official docs/repos relevant to current task

### Dependency checks

Inspect item-by-item, not only file-level:

- Python: `requirements*.txt`, `pyproject.toml`, `Pipfile`, `poetry.lock`
- JS/TS: `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`
- Go/Rust/Java/Ruby/PHP/.NET equivalents

Block on:

- unparseable dependency items in active install flow
- floating VCS refs without commit pin
- suspicious raw URL installs without checksum/pin
- obvious typosquatting names

## Output Contract

Use this format:

```text
[Local Pre-check]
Target: <url/domain/dependency>
Mode: offline-local-only
Risk: <high|medium|low>
Evidence: <local evidence>
Decision: <blocked|ask-confirmation|continue-with-warning>
```

Never claim absolute safety. Use "no critical local signal found".

## Disabled by Design

- endpoint-based detection
- API key credential workflows
- cloud-dependent daily patrol logic
