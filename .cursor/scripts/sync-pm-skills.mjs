#!/usr/bin/env node
/**
 * Copies PM skills and slash commands from vendor/phuryn-pm-skills into the Cursor hub.
 *
 * Upstream: https://github.com/phuryn/pm-skills (MIT)
 * - Skills: pm-<plugin>/skills/<name>/ -> .cursor/skills/<name>/  (flat, Cursor discovery)
 * - Commands: pm-<plugin>/commands/<name>.md -> .cursor/commands/<name>.md
 *
 * Does NOT overwrite hub-local, Trail of Bits, or anthropicCyber skill folders.
 * Does NOT overwrite pre-existing hub commands (only adds/updates PM-managed commands).
 *
 * Usage (from repo root RULES):
 *   node .cursor/scripts/sync-pm-skills.mjs
 *   node .cursor/scripts/sync-pm-skills.mjs --dry-run
 *   node .cursor/scripts/sync-pm-skills.mjs --prune
 *
 * See: .cursor/SYNC-PM-SKILLS.md
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const VENDOR = path.join(REPO_ROOT, 'vendor', 'phuryn-pm-skills');
const DEST_SKILLS = path.join(REPO_ROOT, '.cursor', 'skills');
const DEST_COMMANDS = path.join(REPO_ROOT, '.cursor', 'commands');
const MANIFEST_NAME = '.sync-manifest.json';

const argv = process.argv.slice(2);
const DRY_RUN =
  argv.includes('--dry-run') || argv.includes('-n') || argv.includes('--dryrun');
const PRUNE = argv.includes('--prune');

const PLUGIN_PREFIX = 'pm-';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadManifest() {
  const dest = path.join(DEST_SKILLS, MANIFEST_NAME);
  if (!fs.existsSync(dest)) return {};
  try {
    return readJson(dest);
  } catch {
    return {};
  }
}

function buildProtectedSkillNames(manifest) {
  const protectedNames = new Set();
  for (const section of ['hubLocal', 'trailOfBits', 'anthropicCyber']) {
    for (const row of manifest[section]?.skills ?? []) {
      if (row.name) protectedNames.add(row.name);
    }
  }
  return protectedNames;
}

function rmRecursive(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

function listPlugins(vendorRoot) {
  if (!fs.existsSync(vendorRoot)) return [];
  return fs
    .readdirSync(vendorRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name.startsWith(PLUGIN_PREFIX))
    .map((e) => e.name);
}

function discoverPmCatalog(vendorRoot) {
  /** @type {{ name: string, plugin: string }[]} */
  const skills = [];
  /** @type {{ name: string, plugin: string }[]} */
  const commands = [];

  for (const plugin of listPlugins(vendorRoot)) {
    const skillsDir = path.join(vendorRoot, plugin, 'skills');
    const commandsDir = path.join(vendorRoot, plugin, 'commands');

    if (fs.existsSync(skillsDir)) {
      for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const skillMd = path.join(skillsDir, entry.name, 'SKILL.md');
        if (fs.existsSync(skillMd)) {
          skills.push({ name: entry.name, plugin });
        }
      }
    }

    if (fs.existsSync(commandsDir)) {
      for (const file of fs.readdirSync(commandsDir)) {
        if (!file.endsWith('.md')) continue;
        commands.push({ name: file.replace(/\.md$/i, ''), plugin });
      }
    }
  }

  skills.sort((a, b) => a.name.localeCompare(b.name));
  commands.sort((a, b) => a.name.localeCompare(b.name));
  return { skills, commands };
}

function loadHubCommandNames() {
  if (!fs.existsSync(DEST_COMMANDS)) return new Set();
  return new Set(
    fs
      .readdirSync(DEST_COMMANDS)
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace(/\.md$/i, '')),
  );
}

function writeManifest(catalog, manifest) {
  const dest = path.join(DEST_SKILLS, MANIFEST_NAME);
  const byPlugin = {};
  for (const row of catalog.skills) {
    byPlugin[row.plugin] = (byPlugin[row.plugin] ?? 0) + 1;
  }

  const next = {
    catalogUpdatedAt: new Date().toISOString(),
    ...(manifest.trailOfBits ? { trailOfBits: manifest.trailOfBits } : {}),
    ...(manifest.hubLocal ? { hubLocal: manifest.hubLocal } : {}),
    ...(manifest.anthropicCyber ? { anthropicCyber: manifest.anthropicCyber } : {}),
    pmSkills: {
      generatedAt: new Date().toISOString(),
      source: 'vendor/phuryn-pm-skills (phuryn/pm-skills)',
      upstream: 'https://github.com/phuryn/pm-skills',
      license: 'MIT',
      dryRun: false,
      skillCount: catalog.skills.length,
      commandCount: catalog.commands.length,
      plugins: byPlugin,
      skills: catalog.skills,
      commands: catalog.commands,
    },
  };

  fs.writeFileSync(dest, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  console.log(
    `\nWrote ${path.relative(REPO_ROOT, dest)} (pmSkills: ${catalog.skills.length} skills, ${catalog.commands.length} commands)`,
  );
}

function prunePmSkills(previousNames, currentNames) {
  let removed = 0;
  for (const name of previousNames) {
    if (currentNames.has(name)) continue;
    const dest = path.join(DEST_SKILLS, name);
    if (!fs.existsSync(dest)) continue;
    if (DRY_RUN) {
      console.log(`[dry-run] would prune removed PM skill: ${name}/`);
    } else {
      rmRecursive(dest);
      console.log(`pruned removed PM skill: ${name}/`);
    }
    removed += 1;
  }
  return removed;
}

function prunePmCommands(previousNames, currentNames, hubCommandsBeforeSync) {
  let removed = 0;
  for (const name of previousNames) {
    if (currentNames.has(name)) continue;
    if (hubCommandsBeforeSync.has(name)) {
      console.warn(`skip prune command ${name}.md (exists as hub command, not PM-only)`);
      continue;
    }
    const dest = path.join(DEST_COMMANDS, `${name}.md`);
    if (!fs.existsSync(dest)) continue;
    if (DRY_RUN) {
      console.log(`[dry-run] would prune removed PM command: ${name}.md`);
    } else {
      fs.rmSync(dest, { force: true });
      console.log(`pruned removed PM command: ${name}.md`);
    }
    removed += 1;
  }
  return removed;
}

function main() {
  if (!fs.existsSync(VENDOR)) {
    console.error(`Missing: ${VENDOR}`);
    console.error(
      'Clone: git clone --depth 1 https://github.com/phuryn/pm-skills.git vendor/phuryn-pm-skills',
    );
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log('[dry-run] No files will be modified.\n');
  }

  const manifest = loadManifest();
  const protectedNames = buildProtectedSkillNames(manifest);
  const catalog = discoverPmCatalog(VENDOR);
  const hubCommandsBeforeSync = loadHubCommandNames();
  const previousPmSkills = new Set(
    (manifest.pmSkills?.skills ?? []).map((s) => s.name),
  );
  const previousPmCommands = new Set(
    (manifest.pmSkills?.commands ?? []).map((c) => c.name),
  );
  const currentSkillNames = new Set(catalog.skills.map((s) => s.name));
  const currentCommandNames = new Set(catalog.commands.map((c) => c.name));

  /** @type {string[]} */
  const skippedProtected = [];
  /** @type {string[]} */
  const skippedCommands = [];
  /** @type {string[]} */
  const duplicateSkills = [];
  const seenSkills = new Set();

  for (const row of catalog.skills) {
    if (seenSkills.has(row.name)) {
      duplicateSkills.push(row.name);
      continue;
    }
    seenSkills.add(row.name);

    if (protectedNames.has(row.name)) {
      skippedProtected.push(row.name);
      continue;
    }

    const src = path.join(VENDOR, row.plugin, 'skills', row.name);
    const dest = path.join(DEST_SKILLS, row.name);
    if (DRY_RUN) {
      console.log(`[dry-run] would copy skill ${row.name} (${row.plugin})`);
    } else {
      rmRecursive(dest);
      fs.cpSync(src, dest, { recursive: true });
      console.log(`+ skill ${row.name}  (${row.plugin})`);
    }
  }

  const pmManagedCommands = new Set(
    (manifest.pmSkills?.commands ?? []).map((c) => c.name),
  );

  for (const row of catalog.commands) {
    const dest = path.join(DEST_COMMANDS, `${row.name}.md`);
    const src = path.join(VENDOR, row.plugin, 'commands', `${row.name}.md`);
    const hubHadBefore = hubCommandsBeforeSync.has(row.name);
    const isPmManaged = pmManagedCommands.has(row.name);

    if (hubHadBefore && !isPmManaged && !DRY_RUN) {
      skippedCommands.push(row.name);
      continue;
    }

    if (DRY_RUN) {
      console.log(`[dry-run] would copy command /${row.name} (${row.plugin})`);
    } else {
      fs.copyFileSync(src, dest);
      console.log(`+ command /${row.name}  (${row.plugin})`);
    }
  }

  if (duplicateSkills.length > 0) {
    console.warn('\nDuplicate skill names across plugins (skipped duplicates):');
    for (const n of duplicateSkills) console.warn(`  - ${n}`);
  }

  if (skippedProtected.length > 0) {
    console.warn('\nSkipped skills (protected hub/ToB/cyber names):');
    for (const n of skippedProtected) console.warn(`  - ${n}`);
  }

  if (skippedCommands.length > 0) {
    console.warn('\nSkipped commands (pre-existing hub command, not PM-managed):');
    for (const n of skippedCommands) console.warn(`  - ${n}`);
  }

  let prunedSkills = 0;
  let prunedCommands = 0;
  if (PRUNE) {
    prunedSkills = prunePmSkills(previousPmSkills, currentSkillNames);
    prunedCommands = prunePmCommands(
      previousPmCommands,
      currentCommandNames,
      hubCommandsBeforeSync,
    );
  }

  if (DRY_RUN) {
    console.log(
      `\n[dry-run] Done: ${catalog.skills.length} skills, ${catalog.commands.length} commands would sync`,
    );
    if (PRUNE) {
      console.log(
        `[dry-run] would prune ${prunedSkills} skill folder(s), ${prunedCommands} command file(s)`,
      );
    }
    return;
  }

  writeManifest(catalog, manifest);
  console.log(
    `\nDone: ${catalog.skills.length} skills -> ${DEST_SKILLS}, ${catalog.commands.length} commands -> ${DEST_COMMANDS}`,
  );
  if (PRUNE) {
    console.log(`Pruned ${prunedSkills} skill folder(s), ${prunedCommands} command file(s).`);
  }
  console.log('\nNext: node .cursor/scripts/audit-skills-trust.mjs --pm-skills');
}

main();
