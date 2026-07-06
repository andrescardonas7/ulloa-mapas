# Supply Chain Security Policy

Use this policy when creating repository rules, reviewing dependency changes, or hardening CI/CD.

## Mandatory Gates

- Lockfile required for every package-managed project.
- CI must install from the lockfile with frozen or clean-install commands.
- Dependency lifecycle scripts must be disabled by default in CI or explicitly reviewed.
- New production dependencies require human review.
- CI permissions must default to least privilege.
- Secrets must not be exposed to untrusted pull requests.
- Release and publish credentials must be short-lived where possible.
- Dependency and secret scans must run when tooling is available.

## Review Checklist

- Does the change add a new package or package registry?
- Does the lockfile introduce unexpected transitive dependencies?
- Did any package add lifecycle scripts?
- Did any package maintainer, repository, tarball URL, or integrity hash change unexpectedly?
- Does the package execute code during install or download binaries?
- Are CI workflows using broad permissions, static credentials, or unpinned actions?
- Can untrusted PR code access secrets?
- Are generated artifacts built from clean, reproducible environments?

## Recommended Tooling

- Dependency vulnerability scanning: `npm audit`, `osv-scanner`, `pip-audit`, `cargo audit`, `govulncheck`.
- Malware and package behavior: Socket.dev, Snyk, Aikido, Endor Labs, GitHub Advanced Security.
- SBOM: `syft`.
- Container and artifact scanning: `grype`, Trivy.
- Secret scanning: Gitleaks, TruffleHog, GitHub secret scanning.
- Dependency automation: Renovate or Dependabot with review-required PRs.

## npm Baseline

```bash
npm ci --ignore-scripts
npm audit
```

Use `npm install` only for intentional dependency changes. Commit the manifest and lockfile together.

## GitHub Actions Baseline

```yaml
permissions:
  contents: read
```

Grant additional permissions only at the job level that needs them. Avoid `pull_request_target` unless the workflow never checks out or executes untrusted code.

## Incident Response Trigger

Trigger incident response if any of these are true:

- A malicious package version was installed.
- A package lifecycle script ran from an untrusted or newly released package.
- CI exposed secrets to code from a fork or untrusted PR.
- A package update changed publish, build, install, or postinstall behavior unexpectedly.
- A dependency package was pulled during a known compromise window.
