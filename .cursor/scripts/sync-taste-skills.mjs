#!/usr/bin/env node
/**
 * Link Leonxlnx/taste-skill installs from ~/.agents/skills into .cursor/skills.
 *
 * Source of truth: install or refresh with:
 *   npx skills add https://github.com/Leonxlnx/taste-skill
 * then copy into ~/.agents/skills (or set TASTE_SKILLS_ROOT).
 *
 * Usage:
 *   node .cursor/scripts/sync-taste-skills.mjs
 *   node .cursor/scripts/sync-taste-skills.mjs --dry-run
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureLinkedDirectory } from './fs-link.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CURSOR_ROOT = path.resolve(__dirname, '..');
const CURSOR_SKILLS = path.join(CURSOR_ROOT, 'skills');
const DEFAULT_TASTE_ROOT = path.join(process.env.HOME || process.env.USERPROFILE || '', '.agents', 'skills');

/** Install names from https://github.com/Leonxlnx/taste-skill */
const TASTE_SKILLS = [
  'brandkit',
  'design-taste-frontend',
  'design-taste-frontend-v1',
  'full-output-enforcement',
  'gpt-taste',
  'high-end-visual-design',
  'image-to-code',
  'imagegen-frontend-mobile',
  'imagegen-frontend-web',
  'industrial-brutalist-ui',
  'minimalist-ui',
  'redesign-existing-projects',
  'stitch-design-taste',
];

function parseArgs(argv) {
  return { dryRun: argv.includes('--dry-run') || argv.includes('-n') };
}

function isRealDirectory(p) {
  try {
    const st = fs.lstatSync(p);
    return st.isDirectory() && !st.isSymbolicLink();
  } catch {
    return false;
  }
}

function main() {
  const { dryRun } = parseArgs(process.argv.slice(2));
  const tasteRoot = process.env.TASTE_SKILLS_ROOT || DEFAULT_TASTE_ROOT;

  console.log('Taste skills → Cursor junctions');
  console.log(`  Source: ${tasteRoot}`);
  console.log(`  Cursor: ${CURSOR_SKILLS}`);
  if (dryRun) console.log('  Mode:   DRY RUN');

  const results = [];

  for (const name of TASTE_SKILLS) {
    const target = path.join(tasteRoot, name);
    const link = path.join(CURSOR_SKILLS, name);
    const skillMd = path.join(target, 'SKILL.md');

    if (!fs.existsSync(skillMd)) {
      results.push({ name, action: 'missing-source', target });
      continue;
    }

    if (isRealDirectory(link)) {
      results.push({ name, action: 'skip-real-dir' });
      continue;
    }

    if (dryRun) {
      results.push({ name, action: 'would-link', target });
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

  for (const row of results) {
    console.log(`  ${row.name}: ${row.action}${row.target ? ` → ${row.target}` : ''}${row.error ? ` (${row.error})` : ''}`);
  }

  const errors = results.filter((r) => r.action === 'error' || r.action === 'missing-source');
  if (errors.length > 0) {
    process.exitCode = 1;
  }
}

main();
