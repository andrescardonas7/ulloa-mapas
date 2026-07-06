#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { doctorProject } from './doctor-project.mjs';
import { exportAll, getDefaultProjectRoot, installGlobal, installProject } from './installer.mjs';
import { runRepoTrustScan } from './repo-trust-scan.mjs';

function getHubRoot() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, '..');
}

function printHelp() {
  // Keep this short; the README will be the full manual.
  // eslint-disable-next-line no-console
  console.log(
    [
      'cursor-hub',
      '',
      'Usage:',
      '  cursor-hub install --project <path> [--targets cursor,vscode]',
      '  cursor-hub install --global [--targets opencode,antigravity,claude]',
      '  cursor-hub export',
      '  cursor-hub doctor --project <path>',
      '  cursor-hub trust-scan --project <path> [--mode quick|full] [--strict]',
      '',
      'Notes:',
      '  - Default project targets: cursor,vscode',
      '  - Default global targets: opencode,antigravity,claude',
      '  - With --all, non-cursor targets are inactive by default.',
      '    Use --active-non-cursor to enable them.',
      '  - Use --all to enable every target for the scope.',
      '  - Hub root is the folder containing package.json.',
      '  - On Windows, directory links prefer junctions; fallback is copy.',
    ].join('\n')
  );
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const command = args[0] ?? 'help';

  const flags = new Map();
  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = args[i + 1];
    const value = next && !next.startsWith('--') ? next : true;
    flags.set(key, value);
    if (value !== true) i++;
  }

  return { command, flags };
}

function parseTargets(flags) {
  const raw = flags.get('targets') ?? flags.get('target') ?? flags.get('only');
  const all = flags.get('all') === true;
  const items = typeof raw === 'string' ? raw.split(',') : [];
  const resolved = new Set();

  if (all) {
    resolved.add('all');
    return resolved;
  }

  for (const item of items) {
    const name = item.trim().toLowerCase();
    if (!name) continue;
    if (name === 'copilot') {
      resolved.add('vscode');
      continue;
    }
    resolved.add(name);
  }

  return resolved;
}

function ensureHubLooksValid(hubRoot) {
  const pkg = path.join(hubRoot, 'package.json');
  if (!fs.existsSync(pkg)) {
    throw new Error(`Not a hub directory (missing package.json): ${hubRoot}`);
  }
}

async function main() {
  const hubRoot = getHubRoot();
  ensureHubLooksValid(hubRoot);

  const { command, flags } = parseArgs(process.argv);

  if (command === 'help' || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  if (command === 'export') {
    const result = exportAll({ hubRoot });
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ ok: true, command, hubRoot, result }, null, 2));
    return;
  }

  if (command === 'install' || command === 'sync') {
    const projectRoot =
      flags.get('project') === true ? getDefaultProjectRoot() : flags.get('project');
    const targets = parseTargets(flags);
    const inactiveNonCursor =
      flags.get('inactive-non-cursor') === true ||
      (targets.has('all') && flags.get('active-non-cursor') !== true);

    if (flags.get('global') === true) {
      const result = installGlobal({ hubRoot, targets });
      // eslint-disable-next-line no-console
      console.log(JSON.stringify({ ok: true, command, hubRoot, result }, null, 2));
      return;
    }

    const project =
      typeof projectRoot === 'string' && projectRoot.trim()
        ? projectRoot
        : getDefaultProjectRoot();

    const result = installProject({
      hubRoot,
      projectRoot: project,
      targets,
      inactiveNonCursor,
    });
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ ok: true, command, hubRoot, result }, null, 2));
    return;
  }

  if (command === 'doctor') {
    const projectRoot =
      flags.get('project') === true ? getDefaultProjectRoot() : flags.get('project');
    const project =
      typeof projectRoot === 'string' && projectRoot.trim()
        ? projectRoot
        : getDefaultProjectRoot();

    const result = doctorProject({ hubRoot, projectRoot: project });
    const ok = result.warnings.length === 0 && result.skillsTrust?.ok !== false;
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ ok, command, hubRoot, result }, null, 2));
    if (!ok) {
      process.exitCode = 1;
    }
    return;
  }

  if (command === 'trust-scan') {
    const projectRoot =
      flags.get('project') === true ? getDefaultProjectRoot() : flags.get('project');
    const project =
      typeof projectRoot === 'string' && projectRoot.trim()
        ? projectRoot
        : getDefaultProjectRoot();
    const mode = flags.get('mode') === 'full' ? 'full' : 'quick';
    const strict = flags.get('strict') === true;
    const json = flags.get('json') === true;
    const noHistory = flags.get('no-history') === true;

    const scan = runRepoTrustScan({
      target: project,
      mode,
      strict,
      json,
      noHistory,
    });

    if (scan.error) {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify({ ok: false, command, error: scan.error }, null, 2));
      process.exitCode = scan.exitCode ?? 2;
      return;
    }

    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ ok: scan.ok, command, hubRoot, report: scan.report }, null, 2));
    process.exitCode = scan.exitCode;
    return;
  }

  throw new Error(`Unknown command: ${command}. Run \"cursor-hub --help\".`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(`[cursor-hub] ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
});

