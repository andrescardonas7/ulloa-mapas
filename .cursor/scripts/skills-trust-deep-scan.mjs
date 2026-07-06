#!/usr/bin/env node
/**
 * Deep skill scan via NVIDIA SkillSpector (static only, --no-llm).
 * Complements audit-skills-trust.mjs — run in CI on changed skill folders only.
 *
 * Usage:
 *   node .cursor/scripts/skills-trust-deep-scan.mjs --changed-only
 *   node .cursor/scripts/skills-trust-deep-scan.mjs --skill api-key-security
 *   node .cursor/scripts/skills-trust-deep-scan.mjs --skip-if-missing   # local dev
 *   node .cursor/scripts/skills-trust-deep-scan.mjs --sarif-dir .cursor/artifacts/skillspector-sarif
 *
 * Requires: Python 3.12+ and `skillspector` on PATH (CI installs pinned spec from skillspector-pin.mjs).
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
    DEFAULT_HUB_ROOT,
    parseSkillFilters,
    resolveSkillDirsToScan,
    skillsRootFromHub,
} from './skills-trust-shared.mjs';
import {
    SKILLSPECTOR_GIT_SHA,
    SKILLSPECTOR_PIP_SPEC,
    SKILLSPECTOR_VERSION,
} from './skillspector-pin.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_FAIL_SCORE = 51;
const TOP_FINDINGS_LIMIT = 3;

function parseArgs(argv) {
  const changedOnly = argv.includes('--changed-only');
  const skipIfMissing = argv.includes('--skip-if-missing');
  const requireTool = argv.includes('--require-skillspector');
  const skillFilter = parseSkillFilters(argv);

  let failScore = DEFAULT_FAIL_SCORE;
  let sarifDir = process.env.SKILLSPECTOR_SARIF_DIR ?? '';

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--fail-score' && argv[i + 1]) {
      failScore = Number(argv[++i]);
    }
    if (argv[i] === '--sarif-dir' && argv[i + 1]) {
      sarifDir = argv[++i];
    }
  }

  return { changedOnly, skipIfMissing, requireTool, skillFilter, failScore, sarifDir };
}

function skillspectorAvailable() {
  const which = process.platform === 'win32' ? 'where' : 'which';
  const result = spawnSync(which, ['skillspector'], { encoding: 'utf8' });
  return result.status === 0;
}

function getSkillspectorVersion() {
  const cli = spawnSync('skillspector', ['--version'], { encoding: 'utf8' });
  if (cli.status === 0) {
    return (cli.stdout || cli.stderr || '').trim().split('\n')[0] || 'unknown';
  }

  const pip = spawnSync('pip', ['show', 'skillspector'], { encoding: 'utf8' });
  if (pip.status === 0) {
    const match = pip.stdout.match(/^Version:\s*(.+)$/m);
    if (match) return match[1].trim();
  }

  return 'unknown';
}

/**
 * @param {string} skillDir
 * @param {string} reportPath
 * @param {'json' | 'sarif'} format
 */
function runSkillspectorScan(skillDir, reportPath, format) {
  const result = spawnSync(
    'skillspector',
    ['scan', skillDir, '--no-llm', '--format', format, '--output', reportPath],
    { encoding: 'utf8', timeout: 300_000 },
  );
  return { result, reportPath };
}

/**
 * @param {unknown} payload
 */
function readReport(reportPath, payload) {
  if (payload && typeof payload === 'object') {
    return payload;
  }
  if (!fs.existsSync(reportPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * @param {Record<string, unknown>} report
 */
function extractRisk(report) {
  const assessment =
    report.risk_assessment && typeof report.risk_assessment === 'object'
      ? /** @type {Record<string, unknown>} */ (report.risk_assessment)
      : report;

  const score =
    typeof assessment.score === 'number'
      ? assessment.score
      : typeof report.risk_score === 'number'
        ? report.risk_score
        : null;
  const severity =
    typeof assessment.severity === 'string'
      ? assessment.severity
      : typeof report.risk_severity === 'string'
        ? report.risk_severity
        : '';
  const recommendation =
    typeof assessment.recommendation === 'string'
      ? assessment.recommendation
      : typeof report.risk_recommendation === 'string'
        ? report.risk_recommendation
        : typeof report.recommendation === 'string'
          ? report.recommendation
          : '';
  return { score, severity, recommendation };
}

/**
 * @param {Record<string, unknown>} report
 * @param {number} limit
 * @returns {string[]}
 */
function extractTopFindings(report, limit = TOP_FINDINGS_LIMIT) {
  const raw = report.filtered_findings ?? report.issues ?? report.findings;
  if (!Array.isArray(raw)) return [];

  /** @type {string[]} */
  const lines = [];
  for (const item of raw.slice(0, limit)) {
    if (!item || typeof item !== 'object') continue;
    const f = /** @type {Record<string, unknown>} */ (item);
    const severity = typeof f.severity === 'string' ? f.severity : '?';
    const ruleId =
      typeof f.rule_id === 'string'
        ? f.rule_id
        : typeof f.id === 'string'
          ? f.id
          : '?';
    const message = String(f.message ?? f.explanation ?? f.finding ?? '').slice(0, 120);
    let location = '';
    if (typeof f.location === 'string') {
      location = f.location;
    } else if (f.location && typeof f.location === 'object') {
      const loc = /** @type {Record<string, unknown>} */ (f.location);
      const file = typeof loc.file === 'string' ? loc.file : '';
      const line =
        typeof loc.start_line === 'number' ? String(loc.start_line) : '';
      location = file && line ? `${file}:${line}` : file;
    } else if (typeof f.file === 'string') {
      location = f.file;
    }
    const suffix = location ? ` @ ${location}` : '';
    lines.push(`[${severity}] ${ruleId}: ${message}${suffix}`);
  }
  return lines;
}

/**
 * @param {string} sarifDir
 * @param {string} rel
 * @param {string} skillDir
 */
function writeSarifReport(sarifDir, rel, skillDir) {
  fs.mkdirSync(sarifDir, { recursive: true });
  const safeName = rel.replace(/\//g, '_');
  const sarifPath = path.join(sarifDir, `${safeName}.sarif`);
  const { result } = runSkillspectorScan(skillDir, sarifPath, 'sarif');
  if (result.status !== 0 || !fs.existsSync(sarifPath)) {
    console.warn(
      `Deep scan: SARIF not written for ${rel} (exit ${result.status ?? 'unknown'})`,
    );
  }
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const hubRoot = DEFAULT_HUB_ROOT;
  const skillsRoot = skillsRootFromHub(hubRoot);

  if (!skillspectorAvailable()) {
    const msg = `SkillSpector CLI not found. Install: pip install "${SKILLSPECTOR_PIP_SPEC}"`;
    if (opts.skipIfMissing && !opts.requireTool) {
      console.warn(`Deep scan skipped: ${msg}`);
      process.exit(0);
    }
    console.error(`Deep scan failed: ${msg}`);
    process.exit(1);
  }

  const installedVersion = getSkillspectorVersion();
  console.log(
    `SkillSpector deep scan (installed: ${installedVersion}; hub pin: v${SKILLSPECTOR_VERSION} @ ${SKILLSPECTOR_GIT_SHA.slice(0, 7)})`,
  );

  const dirs = resolveSkillDirsToScan(skillsRoot, {
    changedOnly: opts.changedOnly,
    skillFilter: opts.skillFilter,
    repoRoot: process.cwd(),
  });

  if (dirs.length === 0) {
    console.log('Deep scan: no skill folders to scan.');
    process.exit(0);
  }

  /** @type {string[]} */
  const failures = [];
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skillspector-'));

  for (const dir of dirs) {
    const rel = path.relative(skillsRoot, dir).replace(/\\/g, '/');
    const reportPath = path.join(tmpDir, `${rel.replace(/\//g, '_')}.json`);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });

    const { result } = runSkillspectorScan(dir, reportPath, 'json');
    const report = readReport(reportPath, null);

    if (opts.sarifDir) {
      writeSarifReport(opts.sarifDir, rel, dir);
    }

    if (result.status !== 0 && !report) {
      failures.push(
        `${rel}: skillspector exited ${result.status ?? 'unknown'} — ${(result.stderr || result.stdout || '').trim().slice(0, 200)}`,
      );
      continue;
    }

    if (!report) {
      failures.push(`${rel}: no JSON report produced`);
      continue;
    }

    const { score, severity, recommendation } = extractRisk(report);
    const highSeverity = /^(HIGH|CRITICAL)$/i.test(severity);
    const doNotInstall = /DO\s+NOT\s+INSTALL/i.test(recommendation);
    const overThreshold = typeof score === 'number' && score >= opts.failScore;

    if (highSeverity || doNotInstall || overThreshold) {
      const topFindings = extractTopFindings(report);
      const findingsBlock =
        topFindings.length > 0
          ? `\n      ${topFindings.join('\n      ')}`
          : '';
      failures.push(
        `${rel}: score=${score ?? '?'} severity=${severity || '?'} recommendation=${recommendation || '?'}${findingsBlock}`,
      );
    } else {
      console.log(
        `Deep scan OK: ${rel} (score=${score ?? '?'}, ${severity || 'n/a'})`,
      );
    }
  }

  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch {
    /* ignore */
  }

  if (failures.length > 0) {
    console.error('SkillSpector deep scan failed:\n');
    for (const f of failures) console.error(`- ${f}`);
    if (opts.sarifDir) {
      console.error(`\nSARIF reports: ${path.resolve(opts.sarifDir)}`);
    }
    process.exit(1);
  }

  console.log(`SkillSpector deep scan passed (${dirs.length} folder(s)).`);
  if (opts.sarifDir) {
    console.log(`SARIF reports: ${path.resolve(opts.sarifDir)}`);
  }
}

const isMain =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main();
}
