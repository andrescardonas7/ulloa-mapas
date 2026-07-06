#!/usr/bin/env node
/**
 * Sync addyosmani/agent-skills into Cursor (junctions) and refresh the git clone.
 * OpenClaw reads the same clone via openclaw.json → skills.load.extraDirs (no extra step).
 *
 * Safety model (so it never clobbers committed hub skills):
 *   1. Never replace a REAL directory (committed folder) with a junction. Only
 *      link when the destination is absent or already a junction/symlink to the
 *      same target. This guard is independent of the manifest, so it protects
 *      even skills missing from .sync-manifest.json.
 *   2. Skip names declared as hub-maintained in .sync-manifest.json (hubLocal,
 *      trailOfBits) plus the static EXCLUDE set. Mirrors sync-cyber-skills.mjs.
 *
 * Note: this script does NOT manage the design/taste junctions (those point at
 * ~/.agents/skills, a different clone) — see .cursor/skills/README.md.
 *
 * Usage (from repo root or anywhere):
 *   node .cursor/scripts/sync-agent-skills.mjs
 *   node .cursor/scripts/sync-agent-skills.mjs --dry-run
 *   node .cursor/scripts/sync-agent-skills.mjs --no-pull
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureLinkedDirectory } from './fs-link.mjs';
import { SKILLSPECTOR_PIP_SPEC } from './skillspector-pin.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CURSOR_ROOT = path.resolve(__dirname, '..');
const DEFAULT_CLONE = 'C:/Users/zelda/agent-skills';
const CURSOR_SKILLS = path.join(CURSOR_ROOT, 'skills');
const MANIFEST_PATH = path.join(CURSOR_SKILLS, '.sync-manifest.json');

/** Skills we intentionally do not link (workspace already has an equivalent). */
const EXCLUDE = new Set(['test-driven-development']);

function parseArgs(argv) {
  return {
    pull: !argv.includes('--no-pull'),
    dryRun: argv.includes('--dry-run') || argv.includes('-n'),
  };
}

/**
 * Build the protected name set from the sync manifest: any skill the hub keeps
 * as a committed copy (hubLocal) or vendors via Trail of Bits must never be
 * replaced by a junction to the addyosmani clone.
 */
function loadProtectedNames() {
  const names = new Set();
  if (!fs.existsSync(MANIFEST_PATH)) return names;
  try {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    for (const row of manifest.hubLocal?.skills ?? []) {
      if (row.name) names.add(row.name);
    }
    for (const row of manifest.trailOfBits?.skills ?? []) {
      if (row.name) names.add(row.name);
    }
  } catch (err) {
    console.warn(`  WARN: could not parse manifest, manifest protection disabled: ${String(err)}`);
  }
  return names;
}

/** A destination is a "real" committed folder when it exists and is not a symlink/junction. */
function isRealDirectory(p) {
  try {
    const st = fs.lstatSync(p);
    return st.isDirectory() && !st.isSymbolicLink();
  } catch {
    return false;
  }
}

function listPackSkills(packSkillsDir) {
  if (!fs.existsSync(packSkillsDir)) {
    throw new Error(`Pack skills dir not found: ${packSkillsDir}`);
  }
  return fs
    .readdirSync(packSkillsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => fs.existsSync(path.join(packSkillsDir, name, 'SKILL.md')))
    .filter((name) => !EXCLUDE.has(name));
}

function gitPull(cloneRoot) {
  if (!fs.existsSync(path.join(cloneRoot, '.git'))) {
    throw new Error(`Not a git repo: ${cloneRoot}. Clone first: git clone https://github.com/addyosmani/agent-skills.git`);
  }
  const r = spawnSync('git', ['-C', cloneRoot, 'pull', '--ff-only'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (r.status !== 0) {
    const msg = [r.stdout, r.stderr].filter(Boolean).join('\n').trim();
    throw new Error(`git pull failed (${r.status}): ${msg || 'unknown error'}`);
  }
  const rev = spawnSync('git', ['-C', cloneRoot, 'rev-parse', '--short', 'HEAD'], {
    encoding: 'utf8',
  });
  return (rev.stdout || '').trim();
}

function syncJunctions(packSkillsDir, cursorSkillsDir, protectedNames, dryRun) {
  const names = listPackSkills(packSkillsDir);
  /** @type {Record<string, unknown>[]} */
  const results = [];

  for (const name of names) {
    const target = path.join(packSkillsDir, name);
    const link = path.join(cursorSkillsDir, name);

    if (protectedNames.has(name)) {
      results.push({ name, action: 'skip-protected' });
      continue;
    }

    // Robust, manifest-independent guard: never clobber a committed real folder.
    if (isRealDirectory(link)) {
      results.push({ name, action: 'skip-real-dir' });
      continue;
    }

    if (dryRun) {
      results.push({ name, action: 'would-link' });
      continue;
    }

    try {
      const r = ensureLinkedDirectory({
        linkPath: link,
        targetPath: target,
        preferJunction: true,
        fallbackCopy: false,
      });
      results.push({ name, ...r });
    } catch (err) {
      results.push({ name, action: 'error', error: String(err) });
    }
  }

  return results;
}

/** @param {string[]} names skill folder names (hub-relative) */
function printSecurityAuditHints(names, { dryRun } = {}) {
  if (names.length === 0) return;

  const label = dryRun ? 'Would link — audit after sync' : 'New/updated links — security audit';
  console.log(`\n${label} (from repo root):`);
  console.log('  Fast gate (Node, ~seconds):');
  for (const name of names) {
    console.log(`    node .cursor/scripts/audit-skills-trust.mjs --skill ${name}`);
  }
  if (names.length > 1) {
    const flags = names.map((n) => `--skill ${n}`).join(' ');
    console.log(`    node .cursor/scripts/audit-skills-trust.mjs ${flags}`);
  }
  console.log('  Deep scan (SkillSpector --no-llm; optional, needs Python 3.12 + pip install):');
  console.log('    See pinned install in .cursor/scripts/skillspector-pin.mjs');
  console.log(`    pip install "${SKILLSPECTOR_PIP_SPEC}"`);
  for (const name of names) {
    console.log(
      `    node .cursor/scripts/skills-trust-deep-scan.mjs --skill ${name} --require-skillspector`,
    );
  }
  console.log(
    '  Or ask the agent: /audit-skill-security <name> — CI runs deep scan automatically on PR.',
  );
}

function main() {
  const { pull, dryRun } = parseArgs(process.argv.slice(2));
  const cloneRoot = process.env.AGENT_SKILLS_ROOT || DEFAULT_CLONE;
  const packSkillsDir = path.join(cloneRoot, 'skills');
  const protectedNames = loadProtectedNames();

  console.log('Agent Skills sync');
  console.log(`  Clone:        ${cloneRoot}`);
  console.log(`  Cursor links: ${CURSOR_SKILLS}`);
  console.log(`  Protected:    ${protectedNames.size} manifest names (hubLocal + trailOfBits)`);
  console.log(`  OpenClaw:     openclaw.json → skills.load.extraDirs (same clone)`);
  if (dryRun) console.log('  Mode:         DRY RUN (no changes)');

  let head = '(pull skipped)';
  if (pull && !dryRun) {
    head = gitPull(cloneRoot);
    console.log(`  git pull:     OK @ ${head}`);
  } else if (pull && dryRun) {
    console.log('  git pull:     skipped (dry run)');
  }

  const results = syncJunctions(packSkillsDir, CURSOR_SKILLS, protectedNames, dryRun);
  const linkedNames = results.filter((r) => r.action === 'linked').map((r) => r.name);
  const wouldLinkNames = results.filter((r) => r.action === 'would-link').map((r) => r.name);
  const linked = linkedNames.length;
  const noop = results.filter((r) => r.action === 'noop').length;
  const wouldLink = wouldLinkNames.length;
  const skipProtected = results.filter((r) => r.action === 'skip-protected').length;
  const skipRealDir = results.filter((r) => r.action === 'skip-real-dir').length;
  const errors = results.filter((r) => r.action === 'error');

  console.log(
    `  Junctions:    ${results.length} candidates (${linked} new/updated, ${noop} already OK, ${wouldLink} would-link)`,
  );
  console.log(`  Skipped:      ${skipProtected} protected (manifest), ${skipRealDir} committed real folders`);
  if (EXCLUDE.size) {
    console.log(`  Excluded:     ${[...EXCLUDE].join(', ')}`);
  }
  for (const e of errors) {
    console.error(`  ERROR ${e.name}: ${e.error}`);
  }

  if (errors.length) process.exit(1);

  if (dryRun) {
    printSecurityAuditHints(wouldLinkNames, { dryRun: true });
    console.log('\nDry run complete. Re-run without --dry-run to apply.');
    return;
  }

  printSecurityAuditHints(linkedNames, { dryRun: false });
  console.log('\nDone. Restart OpenClaw gateway if Alfred is running; reload Cursor window optional.');
}

main();
