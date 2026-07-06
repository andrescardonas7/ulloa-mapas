# misteye-security-check (offline local profile)

Vendored in this hub as normal files (not a git submodule). Upstream reference: [slowmist/misteye-skills](https://github.com/slowmist/misteye-skills); this copy is the **offline-local** fork (`metadata.mode: offline-local-only` in `SKILL.md`).

This local installation was customized to remove all API coupling.

## What this profile does

- Runs a local security pre-check before risky link/dependency actions
- Uses deterministic local heuristics only
- Blocks high-risk actions and asks confirmation for medium risk

## What this profile does not do

- No calls to cloud detection endpoints
- No API-key workflow
- No dependency on external threat-intel responses

See `SKILL.md` for the active policy.
