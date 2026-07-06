---
name: npm-supply-chain-guard
description: Guards JavaScript and TypeScript projects against npm supply-chain compromise. Use before installing, updating, auditing, or approving dependency changes; when editing package.json, pnpm-lock.yaml, npmrc files, GitHub Actions, CI package publishing workflows, or package manager configuration.
metadata:
  author: Alfred and Andres
---

# npm Supply Chain Guard

## Mission

Act as a conservative dependency gatekeeper. Prevent compromised packages, malicious lifecycle scripts, unsafe update ranges, poisoned CI workflows, and credential-exposing publish setups from entering the project.

Default stance: dependency changes are untrusted until reviewed.

Shared copy-paste policy and checklist (all ecosystems): [../supply-chain-guard/references/supply-chain-policy.md](../supply-chain-guard/references/supply-chain-policy.md).

## Trigger This Skill

Use this skill when:

- Installing, removing, or updating npm packages.
- Editing `package.json`, `pnpm-lock.yaml`, `.npmrc`, `.pnpmfile.cjs`, `npm-shrinkwrap.json`, or package manager config.
- Reviewing PRs that change dependencies, lockfiles, build scripts, GitHub Actions, Dockerfiles, or release workflows.
- Investigating suspicious install behavior, unexpected network access, postinstall scripts, or compromised package advisories.
- Preparing CI/CD workflows that publish packages or consume registry credentials.

## Non-Negotiable Rules

1. Use `pnpm` only. Never use `npm install`, `npm update`, `yarn`, or force flags.
2. Add direct dependencies with exact versions: `pnpm add <package> --save-exact`.
3. Do not run broad updates (`pnpm update`, wildcard upgrades, lockfile refreshes) unless the user explicitly approved that task.
4. Treat lifecycle scripts as executable code from the internet. Review `preinstall`, `install`, `postinstall`, `prepare`, and `prepublishOnly` before allowing install execution.
5. Never accept package changes that introduce credential access, environment dumping, shell profile edits, browser data access, hidden binaries, obfuscated payloads, or outbound exfiltration behavior.
6. Never place `NPM_TOKEN`, cloud credentials, GitHub tokens, or registry tokens in shared config or workflow logs.
7. Prefer frozen installs in CI: `pnpm install --frozen-lockfile`.
8. If a package compromise is suspected, stop normal work and switch to incident response.

## Dependency Change Gate

Before approving any dependency or lockfile change:

1. Identify every direct and transitive package added, removed, or version-changed.
2. Inspect the changed package metadata:
   - lifecycle scripts;
   - `bin` entries;
   - new dependencies;
   - repository URL;
   - publish time;
   - maintainer or ownership changes;
   - provenance or signed release signals when available.
3. Compare registry release with source repository:
   - matching Git tag or release;
   - changelog entry;
   - expected package contents;
   - no unexpected tarball-only files.
4. Flag any high-risk package for manual approval:
   - newly published in the last 72 hours;
   - no repository, no security policy, or no changelog;
   - new maintainer, ownership transfer, or sudden release burst;
   - install-time scripts;
   - obfuscated/minified install code;
   - CLI, build tool, plugin, loader, transpiler, bundler, or test runner;
   - package that touches filesystem, shell, network, credentials, browsers, Docker, Kubernetes, CI, or registries.
5. Reject dependency changes that cannot be explained by the task.

## Safe Command Policy

Prefer commands that inspect without executing package code:

```bash
pnpm audit
pnpm list --depth 0
pnpm why <package>
pnpm view <package>@<version> scripts repository time maintainers dist-tags
pnpm view <package>@<version> dist.integrity dist.tarball
```

Do not run install commands with scripts enabled until the package review is complete. If install is necessary for inspection, prefer a disposable environment and `--ignore-scripts`.

```bash
pnpm install --ignore-scripts --frozen-lockfile
```

## CI and Publishing Review

Block or request changes when workflows:

- use `pull_request_target` with attacker-controlled checkout, scripts, or package installs;
- expose secrets to PR code, logs, artifacts, caches, or shell output;
- use floating GitHub Actions refs, unpinned Docker images, or `latest` tags in privileged jobs;
- publish packages from local machines instead of hardened CI;
- keep long-lived npm publish tokens where OIDC trusted publishing is available;
- combine OIDC publishing with fallback `NPM_TOKEN` unless there is a documented reason;
- grant `id-token: write`, `contents: write`, `packages: write`, or `actions: write` without a narrow release need.

Require least privilege and explicit release conditions for publish workflows.

## Verdict Format

Return one of:

- `APPROVED`: no meaningful supply-chain risk found; include the exact packages reviewed.
- `NEEDS_REVIEW`: risk exists but may be justified; list the blocking questions.
- `BLOCKED`: evidence of malicious, unexplained, or unsafe behavior; do not install or merge.
- `INCIDENT`: package may already have executed; move to incident response.

Keep the report short:

```markdown
Verdict: NEEDS_REVIEW

Reviewed:
- package-a@1.2.3
- package-b@4.5.6

Findings:
- package-b adds a postinstall script and was published less than 72 hours ago.

Required action:
- Review tarball contents in a disposable environment before install scripts run.
```

## Incident Response

If a compromised package may have been installed:

1. Stop using the machine or CI runner for trusted builds.
2. Identify affected package versions and install window from lockfiles, build logs, images, caches, and artifacts.
3. Remove the package version and purge package manager caches in affected environments.
4. Rotate exposed credentials: npm, GitHub, cloud, CI/CD, registry, database, SSH, LLM provider, and deployment secrets.
5. Rebuild and redeploy artifacts created during the exposure window.
6. Check workflows for unexpected files, new publish jobs, strange artifacts, or secret-dumping steps.
7. Document findings without printing secret values.

## Escalation Rules

Ask the user before proceeding when:

- a dependency update is not tied to an approved task;
- a package has install scripts or privileged behavior;
- the lockfile changes more packages than expected;
- the package was published very recently;
- provenance, tags, changelog, or package contents do not line up;
- the only safe next step requires running untrusted code.

When in doubt, block and explain the specific evidence.
