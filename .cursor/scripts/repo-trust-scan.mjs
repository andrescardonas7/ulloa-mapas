#!/usr/bin/env node
/**
 * Read-only trust scan for cloned or third-party repositories.
 * Opt-in, fail-open by default; use --strict for CI-style gating.
 *
 * Usage:
 *   node .cursor/scripts/repo-trust-scan.mjs [--target <path>] [--mode quick|full] [--strict] [--json]
 *   node .cursor/scripts/cursor-hub.mjs trust-scan --project <path> [--mode full] [--strict]
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
    CONTENT_PATTERNS,
    LIFECYCLE_SCRIPT_KEYS,
    MAX_SCAN_FILE_BYTES,
    SKIP_DIR_NAMES,
    SKIP_EXTENSIONS,
    WORKFLOW_PATTERNS,
} from './repo-trust-patterns.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SEVERITY_RANK = { high: 3, medium: 2, low: 1, info: 0 };

/**
 * @typedef {{ id: string, severity: 'high' | 'medium' | 'low' | 'info', phase: string, file?: string, line?: number, message: string, tool?: string }} Finding
 */

function parseArgs(argv) {
  const args = argv.slice(2);
  /** @type {Record<string, string | boolean>} */
  const flags = { mode: 'quick', strict: false, json: false, 'no-history': false };
  let target = process.cwd();

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--help' || a === '-h') {
      flags.help = true;
      continue;
    }
    if (a === '--strict') {
      flags.strict = true;
      continue;
    }
    if (a === '--json') {
      flags.json = true;
      continue;
    }
    if (a === '--no-history') {
      flags['no-history'] = true;
      continue;
    }
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
      continue;
    }
    if (!String(flags.target ?? '').length || flags.target === process.cwd()) {
      target = path.resolve(a);
    }
  }

  if (typeof flags.target === 'string' && flags.target.trim()) {
    target = path.resolve(flags.target);
  }

  const mode = flags.mode === 'full' ? 'full' : 'quick';
  return {
    target,
    mode,
    strict: flags.strict === true,
    json: flags.json === true,
    noHistory: flags['no-history'] === true,
    help: flags.help === true,
  };
}

function printHelp() {
  console.log(
    [
      'repo-trust-scan — read-only trust scan (opt-in, fail-open)',
      '',
      'Usage:',
      '  node scripts/repo-trust-scan.mjs [--target <path>] [--mode quick|full] [--strict] [--json]',
      '  node scripts/cursor-hub.mjs trust-scan --project <path> [--mode full] [--strict]',
      '',
      'Modes:',
      '  quick  Pattern grep + manifests/CI (seconds, no install)',
      '  full   quick + optional gitleaks, osv-scanner/trivy, pnpm audit (minutes)',
      '',
      'Exit codes:',
      '  0  OK or warnings only (default)',
      '  1  --strict and high-severity findings present',
      '  2  Invalid target or arguments',
      '',
      'Optional tools (skipped gracefully if missing):',
      '  gitleaks, osv-scanner, trivy, pnpm, npm',
      '',
      'Never logs secret values. Run before the first package install on unknown repos.',
    ].join('\n'),
  );
}

function commandExists(name) {
  const checker =
    process.platform === 'win32'
      ? spawnSync('where', [name], { encoding: 'utf8', shell: true })
      : spawnSync('which', [name], { encoding: 'utf8' });
  return checker.status === 0;
}

function runCommand(label, args, { cwd, timeoutMs = 120_000 } = {}) {
  const result = spawnSync(args[0], args.slice(1), {
    cwd,
    encoding: 'utf8',
    timeout: timeoutMs,
    shell: process.platform === 'win32',
    maxBuffer: 10 * 1024 * 1024,
  });
  return {
    label,
    command: args.join(' '),
    ok: result.status === 0,
    status: result.status,
    stdout: (result.stdout ?? '').trim(),
    stderr: (result.stderr ?? '').trim(),
    error: result.error?.message,
    timedOut: result.error?.code === 'ETIMEDOUT',
  };
}

function relativeFromRoot(root, filePath) {
  return path.relative(root, filePath).split(path.sep).join('/');
}

function shouldSkipDir(name) {
  return SKIP_DIR_NAMES.has(name);
}

function shouldScanFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (SKIP_EXTENSIONS.has(ext)) return false;
  if (filePath.includes(`${path.sep}.git${path.sep}`)) return false;
  return true;
}

function walkFiles(rootDir, { maxFiles = 8_000 } = {}) {
  /** @type {string[]} */
  const files = [];

  function walk(current) {
    if (files.length >= maxFiles) return;
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (files.length >= maxFiles) break;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (shouldSkipDir(entry.name)) continue;
        walk(full);
        continue;
      }
      if (!entry.isFile() || !shouldScanFile(full)) continue;
      try {
        const stat = fs.statSync(full);
        if (stat.size > MAX_SCAN_FILE_BYTES) continue;
        files.push(full);
      } catch {
        // skip unreadable
      }
    }
  }

  walk(rootDir);
  return files;
}

/**
 * @param {string} root
 * @param {import('./repo-trust-patterns.mjs').TrustPattern[]} patterns
 * @param {string} phase
 */
function scanPatterns(root, patterns, phase) {
  /** @type {Finding[]} */
  const findings = [];
  const files = walkFiles(root);

  for (const filePath of files) {
    const rel = relativeFromRoot(root, filePath);
    let content;
    try {
      content = fs.readFileSync(filePath, 'utf8');
    } catch {
      continue;
    }

    const lines = content.split(/\r?\n/);
    for (const pattern of patterns) {
      if (pattern.fileFilter && !pattern.fileFilter.test(rel)) continue;

      lines.forEach((line, index) => {
        if (!pattern.regex.test(line)) return;
        if (pattern.lineFilter && !pattern.lineFilter(line)) return;
        findings.push({
          id: pattern.id,
          severity: pattern.severity,
          phase,
          file: rel,
          line: index + 1,
          message: pattern.message,
        });
      });
    }
  }

  return findings;
}

function scanManifests(root) {
  /** @type {Finding[]} */
  const findings = [];
  const pkgPath = path.join(root, 'package.json');

  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const scripts = pkg.scripts ?? {};
      for (const [name, script] of Object.entries(scripts)) {
        if (!LIFECYCLE_SCRIPT_KEYS.has(name)) continue;
        findings.push({
          id: 'npm-lifecycle-script',
          severity: 'high',
          phase: 'manifests',
          file: 'package.json',
          message: `Lifecycle script "${name}" present — review before install`,
        });
        if (typeof script === 'string' && /\b(curl|wget)\b/i.test(script)) {
          findings.push({
            id: 'lifecycle-network-fetch',
            severity: 'high',
            phase: 'manifests',
            file: 'package.json',
            message: `Script "${name}" fetches over the network`,
          });
        }
      }
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      for (const [dep, version] of Object.entries(deps)) {
        if (typeof version === 'string' && /^https?:\/\//i.test(version)) {
          findings.push({
            id: 'dep-url-version',
            severity: 'medium',
            phase: 'manifests',
            file: 'package.json',
            message: `Dependency "${dep}" uses direct URL: ${version.split('/')[2] ?? 'url'}`,
          });
        }
      }
    } catch {
      findings.push({
        id: 'package-json-parse',
        severity: 'medium',
        phase: 'manifests',
        file: 'package.json',
        message: 'package.json could not be parsed',
      });
    }
  }

  const workflowsDir = path.join(root, '.github', 'workflows');
  if (fs.existsSync(workflowsDir)) {
    findings.push(...scanPatterns(root, WORKFLOW_PATTERNS, 'workflows'));
  }

  return findings;
}

function hasLockfile(root) {
  return ['pnpm-lock.yaml', 'package-lock.json', 'yarn.lock', 'poetry.lock', 'Cargo.lock', 'go.sum'].some(
    (name) => fs.existsSync(path.join(root, name)),
  );
}

function runOptionalTools(root, { mode, noHistory }) {
  /** @type {Finding[]} */
  const findings = [];
  /** @type {{ tool: string, status: 'ran' | 'skipped' | 'failed', detail: string }[]} */
  const tools = [];

  if (mode !== 'full') {
    return { findings, tools };
  }

  if (commandExists('gitleaks')) {
    const args = ['gitleaks', 'detect', '--source', root, '--redact', '--no-banner'];
    if (noHistory) {
      args.push('--log-opts=HEAD');
    }
    const run = runCommand('gitleaks', args, { cwd: root, timeoutMs: 180_000 });
    if (run.timedOut) {
      tools.push({ tool: 'gitleaks', status: 'failed', detail: 'timed out' });
    } else if (run.status === 0) {
      tools.push({ tool: 'gitleaks', status: 'ran', detail: 'no leaks reported' });
    } else if (run.status === 1) {
      tools.push({ tool: 'gitleaks', status: 'ran', detail: 'findings (values redacted in tool output)' });
      findings.push({
        id: 'gitleaks-findings',
        severity: 'high',
        phase: 'secrets',
        message: 'gitleaks reported potential secrets — inspect with gitleaks locally (do not paste values in chat)',
        tool: 'gitleaks',
      });
    } else {
      tools.push({ tool: 'gitleaks', status: 'failed', detail: run.stderr || run.error || `exit ${run.status}` });
    }
  } else {
    tools.push({ tool: 'gitleaks', status: 'skipped', detail: 'not in PATH' });
  }

  if (commandExists('osv-scanner')) {
    const run = runCommand('osv-scanner', ['--recursive', root], { cwd: root, timeoutMs: 180_000 });
    if (run.ok) {
      tools.push({ tool: 'osv-scanner', status: 'ran', detail: 'completed (see local output for CVE IDs)' });
    } else if (run.status === 1) {
      tools.push({ tool: 'osv-scanner', status: 'ran', detail: 'vulnerabilities reported' });
      findings.push({
        id: 'osv-vulnerabilities',
        severity: 'medium',
        phase: 'dependencies',
        message: 'osv-scanner reported vulnerabilities — review before install',
        tool: 'osv-scanner',
      });
    } else {
      tools.push({
        tool: 'osv-scanner',
        status: run.timedOut ? 'failed' : 'skipped',
        detail: run.stderr || run.error || 'not run',
      });
    }
  } else {
    tools.push({ tool: 'osv-scanner', status: 'skipped', detail: 'not in PATH' });
  }

  if (commandExists('trivy')) {
    const run = runCommand(
      'trivy',
      ['fs', '--scanners', 'secret,vuln', '--severity', 'HIGH,CRITICAL', '--exit-code', '1', root],
      { cwd: root, timeoutMs: 300_000 },
    );
    if (run.ok) {
      tools.push({ tool: 'trivy', status: 'ran', detail: 'no HIGH/CRITICAL in filesystem scan' });
    } else if (run.status === 1) {
      tools.push({ tool: 'trivy', status: 'ran', detail: 'HIGH/CRITICAL findings (see local trivy output)' });
      findings.push({
        id: 'trivy-high-critical',
        severity: 'high',
        phase: 'filesystem',
        message: 'trivy reported HIGH/CRITICAL issues — review local report',
        tool: 'trivy',
      });
    } else {
      tools.push({
        tool: 'trivy',
        status: run.timedOut ? 'failed' : 'skipped',
        detail: run.stderr?.split('\n')[0] || run.error || 'not run',
      });
    }
  } else {
    tools.push({ tool: 'trivy', status: 'skipped', detail: 'not in PATH' });
  }

  if (fs.existsSync(path.join(root, 'package.json'))) {
    if (commandExists('pnpm')) {
      const run = runCommand('pnpm', ['audit', '--audit-level=high'], { cwd: root, timeoutMs: 120_000 });
      if (run.status === 0) {
        tools.push({ tool: 'pnpm audit', status: 'ran', detail: 'no high+ advisories (or audit unavailable)' });
      } else if (run.status !== null && run.status > 0) {
        tools.push({ tool: 'pnpm audit', status: 'ran', detail: 'high+ advisories reported' });
        findings.push({
          id: 'pnpm-audit-high',
          severity: 'medium',
          phase: 'dependencies',
          message: 'pnpm audit reported high+ severity — review lockfile',
          tool: 'pnpm',
        });
      } else {
        tools.push({ tool: 'pnpm audit', status: 'failed', detail: run.stderr || run.error || 'failed' });
      }
    } else if (commandExists('npm')) {
      const run = runCommand('npm', ['audit', '--audit-level=high'], { cwd: root, timeoutMs: 120_000 });
      if (run.status !== 0 && run.status !== null) {
        findings.push({
          id: 'npm-audit-high',
          severity: 'medium',
          phase: 'dependencies',
          message: 'npm audit reported high+ severity',
          tool: 'npm',
        });
        tools.push({ tool: 'npm audit', status: 'ran', detail: 'high+ advisories or audit error' });
      } else {
        tools.push({ tool: 'npm audit', status: 'ran', detail: 'completed' });
      }
    } else {
      tools.push({ tool: 'pnpm/npm audit', status: 'skipped', detail: 'pnpm and npm not in PATH' });
    }
  }

  if (!hasLockfile(root) && mode === 'full') {
    findings.push({
      id: 'no-lockfile',
      severity: 'low',
      phase: 'dependencies',
      message: 'No known lockfile — dependency audit may be incomplete until lockfile exists',
    });
  }

  return { findings, tools };
}

function dedupeFindings(findings) {
  const seen = new Set();
  return findings.filter((f) => {
    const key = `${f.id}|${f.file ?? ''}|${f.line ?? ''}|${f.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function summarize(findings) {
  const counts = { high: 0, medium: 0, low: 0, info: 0 };
  for (const f of findings) {
    counts[f.severity] = (counts[f.severity] ?? 0) + 1;
  }
  const decision =
    counts.high > 0 ? 'review-required' : counts.medium > 0 ? 'continue-with-warning' : 'no-critical-local-signal';
  return { counts, decision };
}

/**
 * @param {{ target: string, mode?: string, strict?: boolean, json?: boolean, noHistory?: boolean }} options
 */
export function runRepoTrustScan(options) {
  const target = path.resolve(options.target);
  const mode = options.mode === 'full' ? 'full' : 'quick';
  const strict = options.strict === true;
  const json = options.json === true;
  const noHistory = options.noHistory === true;

  if (!fs.existsSync(target)) {
    return { ok: false, exitCode: 2, error: `Target does not exist: ${target}` };
  }

  const stat = fs.statSync(target);
  if (!stat.isDirectory()) {
    return { ok: false, exitCode: 2, error: `Target is not a directory: ${target}` };
  }

  const started = Date.now();
  /** @type {Finding[]} */
  let findings = [];

  findings.push(...scanPatterns(target, CONTENT_PATTERNS, 'patterns'));
  findings.push(...scanManifests(target));
  const toolsResult = runOptionalTools(target, { mode, noHistory });
  findings.push(...toolsResult.findings);

  findings = dedupeFindings(findings).sort(
    (a, b) => (SEVERITY_RANK[b.severity] ?? 0) - (SEVERITY_RANK[a.severity] ?? 0),
  );

  const { counts, decision } = summarize(findings);
  const durationMs = Date.now() - started;
  const exitCode = strict && counts.high > 0 ? 1 : 0;

  const report = {
    ok: exitCode === 0,
    mode,
    strict,
    target,
    durationMs,
    decision,
    counts,
    findings: findings.slice(0, 100),
    findingsTruncated: findings.length > 100,
    tools: toolsResult.tools,
    guidance: [
      'Do not run pnpm/npm install until lifecycle scripts and HIGH findings are reviewed.',
      'Re-run with --mode full after installing optional tools (gitleaks, osv-scanner, trivy).',
      'This scan does not prove safety — only surfaces local signals.',
    ],
  };

  return { ok: report.ok, exitCode, report };
}

function printTextReport(report) {
  console.log(`[repo-trust-scan] mode=${report.mode} target=${report.target}`);
  console.log(`[repo-trust-scan] decision=${report.decision} (${report.durationMs}ms)`);
  console.log(
    `[repo-trust-scan] counts high=${report.counts.high} medium=${report.counts.medium} low=${report.counts.low}`,
  );

  if (report.tools?.length) {
    console.log('[repo-trust-scan] tools:');
    for (const t of report.tools) {
      console.log(`  - ${t.tool}: ${t.status} (${t.detail})`);
    }
  }

  if (report.findings.length === 0) {
    console.log('[repo-trust-scan] no pattern/manifest findings in quick scope');
  } else {
    console.log('[repo-trust-scan] findings (max 100):');
    for (const f of report.findings) {
      const loc = f.file ? `${f.file}${f.line ? `:${f.line}` : ''}` : '-';
      console.log(`  [${f.severity}] ${f.phase}/${f.id} @ ${loc} — ${f.message}`);
    }
    if (report.findingsTruncated) {
      console.log(`  … truncated (${report.findings.length} shown)`);
    }
  }

  console.log('[repo-trust-scan] next steps:');
  for (const line of report.guidance) {
    console.log(`  - ${line}`);
  }
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  const result = runRepoTrustScan({
    target: args.target,
    mode: args.mode,
    strict: args.strict,
    json: args.json,
    noHistory: args.noHistory,
  });

  if (result.error) {
    console.error(`[repo-trust-scan] ${result.error}`);
    process.exitCode = result.exitCode ?? 2;
    return;
  }

  if (args.json) {
    console.log(JSON.stringify(result.report, null, 2));
  } else {
    printTextReport(result.report);
  }

  process.exitCode = result.exitCode;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  main().catch((err) => {
    console.error(`[repo-trust-scan] ${err instanceof Error ? err.message : String(err)}`);
    process.exitCode = 1;
  });
}
