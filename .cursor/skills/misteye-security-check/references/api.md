# Local Security Reference

This file is kept for compatibility with the original folder layout, but the
active profile is local-only and does not use remote detection services.

## Active decision model

- Inspect target locally (url/domain/dependency entry)
- Assign risk level from local evidence
- Decision:
  - high: block
  - medium: ask confirmation
  - low: continue with warning

## Required output

```text
[Local Pre-check]
Target: <target>
Mode: offline-local-only
Risk: <high|medium|low>
Evidence: <local evidence>
Decision: <blocked|ask-confirmation|continue-with-warning>
```
