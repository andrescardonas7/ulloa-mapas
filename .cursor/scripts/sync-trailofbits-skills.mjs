#!/usr/bin/env node
/**
 * Copies Trail of Bits Claude Code skills from vendor/trailofbits-skills/plugins
 * into a flat .cursor/skills/<name>/ layout for Cursor discovery.
 *
 * Duplicate skill folder names (rare): the plugin that sorts first alphabetically wins.
 *
 * Usage (from repo root RULES):
 *   node .cursor/scripts/sync-trailofbits-skills.mjs
 *   node .cursor/scripts/sync-trailofbits-skills.mjs --dry-run
 *
 * Prerequisites:
 *   git submodule update --init vendor/trailofbits-skills
 *   # or: git pull  inside vendor/trailofbits-skills
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const VENDOR = path.join(REPO_ROOT, "vendor", "trailofbits-skills");
const PLUGINS = path.join(VENDOR, "plugins");
const DEST_ROOT = path.join(REPO_ROOT, ".cursor", "skills");
const MANIFEST_NAME = ".sync-manifest.json";

const argv = process.argv.slice(2);
const DRY_RUN =
  argv.includes("--dry-run") || argv.includes("-n") || argv.includes("--dryrun");

/** Nested pack folders under .cursor/skills/ that are obsolete once skills are flat-synced */
const OBSOLETE_NESTED_DIRS = [
  "building-secure-contracts",
  "testing-handbook-skills",
  "culture-index",
];

function listPluginDirs() {
  if (!fs.existsSync(PLUGINS)) {
    console.error(`Missing: ${PLUGINS}`);
    console.error("Run: git submodule update --init vendor/trailofbits-skills");
    process.exit(1);
  }
  return fs
    .readdirSync(PLUGINS, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => path.join(PLUGINS, d.name))
    .sort((a, b) => a.localeCompare(b));
}

function collectSkills() {
  /** @type {{ skillName: string, plugin: string, skillPath: string }[]} */
  const rows = [];
  for (const pluginRoot of listPluginDirs()) {
    const skillsDir = path.join(pluginRoot, "skills");
    if (!fs.existsSync(skillsDir)) continue;
    const plugin = path.basename(pluginRoot);
    for (const name of fs.readdirSync(skillsDir, { withFileTypes: true })) {
      if (!name.isDirectory()) continue;
      const skillPath = path.join(skillsDir, name.name);
      const md = path.join(skillPath, "SKILL.md");
      if (!fs.existsSync(md)) continue;
      rows.push({
        skillName: name.name,
        plugin,
        skillPath,
      });
    }
  }
  rows.sort((a, b) => a.plugin.localeCompare(b.plugin));

  /** @type {Map<string, typeof rows[0]>} */
  const winners = new Map();
  /** @type {{ skillName: string, keptPlugin: string, skippedPlugin: string }[]} */
  const duplicateConflicts = [];

  for (const row of rows) {
    const existing = winners.get(row.skillName);
    if (!existing) {
      winners.set(row.skillName, row);
      continue;
    }
    duplicateConflicts.push({
      skillName: row.skillName,
      keptPlugin: existing.plugin,
      skippedPlugin: row.plugin,
    });
  }

  const skills = [...winners.values()].sort((a, b) =>
    a.skillName.localeCompare(b.skillName),
  );
  return { skills, duplicateConflicts };
}

function rmRecursive(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

function writeManifest(skillRows) {
  const dest = path.join(DEST_ROOT, MANIFEST_NAME);
  /** @type {Record<string, unknown>} */
  let existing = {};
  if (fs.existsSync(dest)) {
    try {
      existing = JSON.parse(fs.readFileSync(dest, "utf8"));
    } catch {
      existing = {};
    }
  }
  const manifest = {
    catalogUpdatedAt: new Date().toISOString(),
    trailOfBits: {
      generatedAt: new Date().toISOString(),
      source: "vendor/trailofbits-skills/plugins (Trail of Bits)",
      dryRun: false,
      skillCount: skillRows.length,
      skills: skillRows.map((s) => ({ name: s.skillName, plugin: s.plugin })),
    },
    ...(existing.hubLocal ? { hubLocal: existing.hubLocal } : {}),
    ...(existing.anthropicCyber ? { anthropicCyber: existing.anthropicCyber } : {}),
  };
  fs.writeFileSync(dest, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`\nWrote ${path.relative(REPO_ROOT, dest)}`);
}

function main() {
  if (DRY_RUN) {
    console.log("[dry-run] No files will be modified.\n");
  }

  const { skills, duplicateConflicts } = collectSkills();

  if (duplicateConflicts.length > 0) {
    console.warn(
      "\nDuplicate skill folder names across plugins (first plugin by name wins):",
    );
    for (const d of duplicateConflicts) {
      console.warn(
        `  - ${d.skillName}: kept ${d.keptPlugin}, skipped ${d.skippedPlugin}`,
      );
    }
    console.warn("");
  }

  let copied = 0;
  for (const { skillName, plugin, skillPath } of skills) {
    const dest = path.join(DEST_ROOT, skillName);
    if (DRY_RUN) {
      console.log(`[dry-run] would copy ${skillName}  (${plugin}) -> ${dest}`);
    } else {
      rmRecursive(dest);
      fs.cpSync(skillPath, dest, { recursive: true });
      console.log(`+ ${skillName}  (${plugin})`);
    }
    copied += 1;
  }

  for (const dir of OBSOLETE_NESTED_DIRS) {
    const p = path.join(DEST_ROOT, dir);
    if (fs.existsSync(p)) {
      if (DRY_RUN) {
        console.log(`[dry-run] would remove obsolete pack: ${dir}/`);
      } else {
        rmRecursive(p);
        console.log(`removed obsolete pack: ${dir}/`);
      }
    }
  }

  if (DRY_RUN) {
    console.log(`\n[dry-run] Done: ${copied} skills would be synced -> ${DEST_ROOT}`);
    return;
  }

  writeManifest(skills);
  console.log(`\nDone: ${copied} skills -> ${DEST_ROOT}`);
}

main();
