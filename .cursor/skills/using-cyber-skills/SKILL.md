---
name: using-cyber-skills
description: >-
  Load for blue-team, DFIR, SOC, threat intelligence, container security, or endpoint
  detection tasks that need granular practitioner playbooks. Routes between hub SecOps
  playbooks (web-pentest, threat-hunting, incident-response) and synced anthropicCyber
  skills from mukul975/Anthropic-Cybersecurity-Skills. Triggers: STIX/TAXII, MISP, Volatility,
  Sigma rules, Splunk triage, K8s/Falco, memory forensics, IR timeline, MITRE ATT&CK mapping
  at procedure level. Do NOT load for app code review (use differential-review/codeql) or
  broad authorized red team only (use red-team-ops/web-pentest first).
---

# Using Cyber Skills (hub router)

## Overview

The RULES hub has **two complementary security layers**:

| Layer | Examples | Best for |
| --- | --- | --- |
| **SecOps playbooks (hub)** | `threat-hunting`, `incident-response`, `web-pentest`, `malware-analysis` | End-to-end workflows, authorized assessments, quick orientation |
| **Granular SOC/DFIR skills (`anthropicCyber`)** | `performing-memory-forensics-with-volatility3`, `processing-stix-taxii-feeds`, `building-detection-rules-with-sigma` | One procedure, one tool, framework-mapped steps |

Granular skills are synced from [mukul975/Anthropic-Cybersecurity-Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills) via allowlist — see `.cursor/SYNC-ANTHROPIC-CYBER.md`. They appear in `.cursor/skills/.sync-manifest.json` under **`anthropicCyber`**.

## Decision tree

```
User task (authorized scope only for offensive steps)
│
├─ Building/fixing application code securely?
│  └─ security-and-hardening → code-review-and-quality → differential-review / codeql
│
├─ Broad red team / web pentest / AD attack?
│  └─ web-pentest | red-team-ops | active-directory-attack (+ agent redteam-planner if long)
│
├─ Broad IR / hunt / malware triage?
│  └─ incident-response | threat-hunting | malware-analysis
│     └─ Then open granular skill for the specific tool/step below
│
└─ Specific SOC/DFIR/GRC procedure?
   └─ Match subdomain → open anthropicCyber skill (see table)
```

## Subdomain → starter skills

Consult `anthropicCyber.skills` in `.sync-manifest.json` for the full synced list. Common entry points:

| Subdomain | Open when… | Starter skills |
| --- | --- | --- |
| **threat-intelligence** | STIX/TAXII, MISP, IOC enrichment, actor profiling | `processing-stix-taxii-feeds`, `performing-threat-intelligence-sharing-with-misp`, `analyzing-indicators-of-compromise` |
| **digital-forensics** | RAM/disk/email/browser artifacts | `performing-memory-forensics-with-volatility3`, `analyzing-disk-image-with-autopsy`, `building-incident-timeline-with-timesketch` |
| **soc-operations** | Detection engineering, Splunk/Sigma, SOC metrics | `building-detection-rules-with-sigma`, `triaging-security-alerts-in-splunk`, `building-soc-escalation-matrix` |
| **container-security** | K8s/Docker hardening, Falco, escape detection | `detecting-container-escape-with-falco-rules`, `analyzing-kubernetes-audit-logs` |
| **ai-security** | LLM guardrails, prompt injection, ATLAS-aligned threats | `detecting-ai-model-prompt-injection-attacks`, `implementing-llm-guardrails-for-security` |
| **incident-response** | Playbooks, triage, comms templates | `building-incident-response-playbook`, `triaging-security-incident-with-ir-playbook` |
| **security-operations** | Log sources (Azure, API GW, TLS CT) | `analyzing-azure-activity-logs-for-threats`, `analyzing-web-server-logs-for-intrusion` |
| **endpoint-security** | EDR, Windows logging, HIDS | `configuring-windows-event-logging-for-detection`, `deploying-edr-agent-with-crowdstrike` |

## How to use a granular skill

1. Read **`description`** in frontmatter (routing).
2. Follow **When to Use** → **Prerequisites** → **Workflow** → **Verification** in `SKILL.md`.
3. Load **`references/`** only when the workflow points there (standards, deep procedures).
4. Map findings to ATT&CK / NIST using fields in frontmatter or `references/standards.md` when present.

## Updating the catalog

From repo root `RULES`:

```powershell
git submodule update --init vendor/anthropic-cybersecurity-skills
git -C vendor/anthropic-cybersecurity-skills pull origin main
node .cursor/scripts/sync-cyber-skills.mjs
node .cursor/scripts/audit-skills-trust.mjs --anthropic-cyber
```

To add skills: edit `.cursor/scripts/cyber-skills-allowlist.json`, dry-run sync, then audit.

## Gotchas

- **Authorization:** Offensive techniques belong only in scoped engagements. Prefer defensive/DFIR skills for production incidents.
- **No overwrite:** Sync never replaces hub SecOps playbooks or Trail of Bits skills.
- **Name collisions:** If an allowlist name matches a protected hub skill, sync skips it — pick a different upstream skill or extend the hub playbook instead.
- **Trust:** After allowlist changes, run `audit-skills-trust.mjs --anthropic-cyber`.

## Related

- Hub SecOps index: `.cursor/skills/README.md` (section **SecOps**)
- Sync guide: `.cursor/SYNC-ANTHROPIC-CYBER.md`
- Agents: `.cursor/agents/redteam-planner.md`, `network-analyst.md`, `ai-researcher.md`
