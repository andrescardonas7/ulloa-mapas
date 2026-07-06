# ECC consult

Discover ECC components to install **selectively** without copying 246 skills into this hub.

**Scope:** Cursor catalog lookup. Does not modify OpenClaw.

## Usage

`/ecc-consult <topic>`

Example: `/ecc-consult nestjs security hooks memory`

## Run

```bash
npx ecc consult "<topic>" --target cursor
```

If `npx ecc` fails, use the cached clone:

```bash
cd "%USERPROFILE%\.cache\checkouts\github.com\affaan-m\ECC"
node scripts/ecc.js consult "<topic>" --target cursor
```

## After consult

1. Show matching components and suggested install commands
2. **Do not** run full `install.ps1 --profile full` on `.openclaw`
3. Prefer copying one skill folder into `.cursor/skills/<distinct-name>/` or a documented module from `.cursor/integrations/ecc/README.md`
4. Confirm no overlap with existing `.cursor/skills` (security-review, semgrep, tdd-workflow, etc.)
