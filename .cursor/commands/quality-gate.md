# Quality gate

On-demand quality pipeline for a path. Uses **this hub's** checks — not a second ECC formatter stack (avoids conflicting with existing `afterFileEdit` hooks).

**Scope:** Cursor IDE only.

## Usage

`/quality-gate [path|.] [--strict]`

## Pipeline (priority order)

Follow `.cursor/rules/07-processes/check.mdc`:

1. If `package.json` exists: `pnpm run check` when defined; else `tsc --noEmit`, `pnpm lint`, `pnpm test` as available
2. Security: `trivy fs --scanners secret,vuln --severity HIGH,CRITICAL .` (from repo root or target path)
3. If the path is a single TS file: `read_lints` on that file

## Rules

- Do **not** add duplicate Prettier/tsc hooks — `.cursor/hooks.json` already runs format/lint on edit
- `--strict`: treat warnings as failures
- Report a short remediation list with exact commands

## When to use

Before merge, after large refactors, or when `/harness-audit` flags Quality Gates below threshold.
