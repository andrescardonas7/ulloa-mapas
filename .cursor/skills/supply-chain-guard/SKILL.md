---
name: supply-chain-guard
description: Harden software projects against dependency, package registry, and CI/CD supply-chain attacks. Use when reviewing package changes, adding dependencies, configuring npm/pnpm/yarn/Python/Rust/Go dependencies, editing lockfiles, changing GitHub Actions or other CI workflows, handling secrets, responding to suspected package compromise, or designing agent rules that prevent malicious dependency installation.
---

# Supply Chain Guard

## Core Rule

Treat every new dependency, dependency update, lockfile change, install script, package-manager change, and CI/CD workflow edit as security-sensitive. Prefer reproducibility, minimum privileges, delayed adoption of new releases, and human-reviewable changes over speed.

## Default Workflow

1. Identify the ecosystem and package manager.
2. Inspect manifest, lockfile, install scripts, and CI workflows before changing dependencies.
3. Prefer existing dependencies over adding new packages.
4. Pin or lock all direct and transitive dependencies through the ecosystem's lock mechanism.
5. Run dependency and secret checks when tooling is available.
6. Summarize risk and residual uncertainty before claiming the project is protected.

## Dependency Policy

- Do not add a dependency for trivial code.
- Prefer well-maintained packages with known maintainers, active releases, security policy, broad usage, and minimal install-time behavior.
- Avoid packages with recent ownership transfer, anonymous maintainers, low usage, stale maintenance, typosquatting risk, obfuscated code, network activity during install, or unexplained binary blobs.
- Treat `preinstall`, `install`, `postinstall`, `prepare`, `prepack`, and `postpack` scripts as high risk.
- Avoid broad version ranges for production dependencies in sensitive projects.
- Do not remove or regenerate lockfiles casually.
- Do not auto-merge dependency PRs that change production dependencies or CI/CD behavior.

## npm and JavaScript Controls

- Prefer `npm ci`, `pnpm install --frozen-lockfile`, or `yarn install --immutable` in CI.
- Use `--ignore-scripts` in CI unless a specific package has been reviewed and approved to run lifecycle scripts.
- Review lockfile diffs for new transitive packages, changed tarball URLs, integrity changes, and new lifecycle scripts.
- Use `npm audit`, `osv-scanner`, Socket.dev, Snyk, Aikido, Endor Labs, or equivalent tooling when available.
- Consider `npm config set ignore-scripts true` for developer machines that do not need native build scripts by default.
- For npm publishing, prefer trusted publishing/OIDC over long-lived npm tokens.

## CI/CD Controls

- Set default workflow permissions to read-only unless write access is required.
- Pin third-party GitHub Actions by full commit SHA for sensitive workflows.
- Do not expose secrets to untrusted pull requests or forks.
- Treat `pull_request_target` as dangerous; use it only with explicit justification and no checkout/execution of untrusted code.
- Use short-lived cloud credentials through OIDC instead of static secrets.
- Separate build, test, release, and publish credentials.
- Restrict publish jobs to protected branches, protected environments, and reviewed releases.

## Secret Protection

- Run secret scanning before and after dependency or CI changes when tools are available.
- Never place package registry tokens, cloud keys, SSH keys, or production API keys in manifests, lockfiles, scripts, logs, or CI output.
- If a malicious package may have executed, assume secrets reachable from that host or CI job are compromised.
- Rotate affected npm, GitHub, cloud, database, SSH, Vault, Kubernetes, and deployment credentials after suspected execution.

## Incident Response

If a known or suspected malicious package was installed:

1. Stop affected CI jobs and developer machines from publishing artifacts.
2. Preserve package manager logs, lockfiles, CI logs, and network logs if available.
3. Identify exact package names, versions, install times, hosts, and CI jobs.
4. Remove or pin away from malicious versions.
5. Rebuild from clean machines or clean CI runners.
6. Rotate reachable secrets.
7. Search for persistence, unknown outbound traffic, modified startup scripts, unexpected SSH keys, and new GitHub tokens.
8. Document affected projects and release artifacts.

## Agent Behavior

- Before adding or updating dependencies, explain why the dependency is necessary and what alternatives were considered.
- Before editing CI workflows, check secret exposure and workflow permissions.
- When a user asks for speed, keep the security gates unless they explicitly accept the risk.
- If tooling cannot run because it is unavailable, say exactly which check was skipped.
- Do not claim "secure" or "safe"; state the controls applied and remaining risk.

## References

Read `references/supply-chain-policy.md` when you need a copyable policy, checklist, or agent-rule language.
