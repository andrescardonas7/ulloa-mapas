#!/usr/bin/env node
/**
 * Link hub-local OpenClaw skills into .cursor/skills (single source of truth).
 *
 * Usage:
 *   node .cursor/scripts/sync-hub-skills.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureLinkedDirectory } from './fs-link.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const CURSOR_SKILLS = path.join(REPO_ROOT, '.cursor', 'skills');
const OPENCLAW_SKILLS = path.join(REPO_ROOT, 'skills');

/** Hub skills mirrored into Cursor (name → folder under skills/). */
const HUB_SKILLS = ['coding-guidelines'];

function main() {
  console.log('Hub skills → Cursor junctions');
  console.log(`  OpenClaw: ${OPENCLAW_SKILLS}`);
  console.log(`  Cursor:   ${CURSOR_SKILLS}`);

  const errors = [];

  for (const name of HUB_SKILLS) {
    const target = path.join(OPENCLAW_SKILLS, name);
    const link = path.join(CURSOR_SKILLS, name);
    const skillFile = path.join(target, 'SKILL.md');

    if (!fs.existsSync(skillFile)) {
      errors.push({ name, error: `Missing ${skillFile}` });
      continue;
    }

    try {
      const r = ensureLinkedDirectory({
        linkPath: link,
        targetPath: target,
        preferJunction: true,
        fallbackCopy: false,
      });
      console.log(`  ${name}: ${r.action} (${r.method})`);
    } catch (err) {
      errors.push({ name, error: String(err) });
    }
  }

  if (errors.length) {
    for (const e of errors) console.error(`  ERROR ${e.name}: ${e.error}`);
    process.exit(1);
  }

  console.log('\nDone.');
}

main();
