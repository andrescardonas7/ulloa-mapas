---
name: update-changelog
description: >-
  Load when updating CHANGELOG.md or CHANGELOG for a release, unreleased section,
  or "what changed since last tag". Triggers: actualizar changelog, release notes
  desde git, cambios desde último tag, sección Unreleased. Do NOT load for generic
  git commits (use commit workflow), PR descriptions only, or repos without a changelog file.
---

# Update changelog

Update the repository changelog with user-facing changes between the last release tag and the current branch. Adapted from [mitsuhiko/agent-stuff](https://github.com/mitsuhiko/agent-stuff) (Apache-2.0), aligned with this workspace's git rules.

## When to use

- User asks to update `CHANGELOG.md` / `CHANGELOG` or fill **Unreleased**
- Preparing release notes from commits since the last tag
- Summarizing shipped work for users (not internal refactors only)

## When NOT to use

- User only wants a **git commit** or **PR body** without touching the changelog file
- No changelog file exists and user did not ask to create one
- Repo has no tags and user did not define a baseline (ask first)

## Rules (workspace)

- **Edit the changelog only** — do not `git commit` or `git push` unless the user explicitly asks
- Prefer `CHANGELOG.md`; if missing, use `CHANGELOG`
- Add entries only under **Unreleased** (create that section at the top if absent, matching existing heading style)
- Never overwrite unrelated sections or rewrite released version history

## Process

### 1. Baseline version

If the user gave a tag or version, use it. Otherwise:

```bash
git describe --tags --abbrev=0
```

If there is no tag, ask what baseline to use (or use a commit/date the user specifies).

### 2. Gather changes

```bash
git log <baseline>..HEAD --oneline
git log <baseline>..HEAD
```

Use the default branch name from the repo (`main`, `master`, etc.) when describing "current" — do not assume `main` if `git symbolic-ref` shows otherwise.

### 3. Update the file

- Read the existing changelog and **append** to Unreleased (do not replace existing Unreleased bullets unless the user asked to refresh the whole section)
- Match existing formatting: heading style (`## Unreleased` vs `## [Unreleased]`), bullet marker, tone

## Content guidelines

**Include**

- Features, fixes, and breaking changes that affect users or operators
- PR references (`#123`) when known; avoid raw commit hashes in user-facing text

**Exclude**

- Typos, comment-only edits, pure refactors, dependency bumps (unless security-relevant)
- Vague lines ("fixed bug", "misc updates")

**Order** (when grouping): breaking → features → fixes

## Style

- Past tense or imperative short phrases
- Backticks for code identifiers (e.g. `` `openclaw.json` ``)
- Concise bullets; one change per bullet when possible

## Examples

Good:

- `Fixed Alfred webhook validation when Content-Type is missing.`
- `Added optional `security-guard` skill toggle in openclaw.json. #42`

Bad:

- `Fixed bug`
- `Internal cleanup`
- `Updated deps`

## Evals (routing)

| Case | Should activate |
|------|-----------------|
| "Update CHANGELOG for unreleased work since v1.2.0" | Yes |
| "What commits since last tag?" only | No (answer from git; no file edit) |
| "Commit these changes" | No |

## Related skills

- Git commits: user rules / `ce-commit` — not this skill
- Shipping checklist: `shipping-and-launch` if preparing a full release
