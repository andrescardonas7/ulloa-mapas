#!/usr/bin/env node
/**
 * Verifies that hub skill counts are internally consistent and that the
 * .sync-manifest.json never claims more skills than actually exist on disk.
 *
 * What it checks:
 *   1. Actual count of top-level skill folders containing a SKILL.md under
 *      .cursor/skills/ (flat layout; junctions/symlinks are followed).
 *   2. Per manifest section (trailOfBits, hubLocal, anthropicCyber): the
 *      declared `skillCount` must equal its own `skills` array length.
 *   3. The manifest tracked total (sum of section skillCounts) must NOT exceed
 *      the actual folder count (an over-count means the manifest is corrupt).
 *
 * The manifest is intentionally a *subset* catalog: hub-local extras, SecOps
 * playbooks, and symlinked skills are not all tracked there (see
 * .cursor/skills/README.md). So a tracked-total BELOW the folder count is
 * expected and reported as informational, not a failure.
 *
 * Exit code:
 *   0  all consistency checks pass
 *   1  a real mismatch (section count != array length, or tracked > folders)
 *
 * Usage (from repo root RULES):
 *   node .cursor/scripts/verify-skill-counts.mjs
 *   node .cursor/scripts/verify-skill-counts.mjs --json
 *
 * Style/conventions follow sync-trailofbits-skills.mjs and audit-skills-trust.mjs.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const SKILLS_ROOT = path.join(REPO_ROOT, ".cursor", "skills");
const MANIFEST_PATH = path.join(SKILLS_ROOT, ".sync-manifest.json");
const MANIFEST_SECTIONS = ["trailOfBits", "hubLocal", "anthropicCyber"];

const argv = process.argv.slice(2);
const AS_JSON = argv.includes("--json");

/** Count top-level skills/<name>/ folders that contain a SKILL.md. */
function countSkillFolders() {
  if (!fs.existsSync(SKILLS_ROOT)) {
    return { count: 0, names: [] };
  }
  const names = [];
  for (const entry of fs.readdirSync(SKILLS_ROOT)) {
    if (entry.startsWith(".")) continue;
    // statSync follows junctions/symlinks so linked skills are counted.
    const skillMd = path.join(SKILLS_ROOT, entry, "SKILL.md");
    if (fs.existsSync(skillMd)) names.push(entry);
  }
  names.sort((a, b) => a.localeCompare(b));
  return { count: names.length, names };
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return { ok: false, error: `Missing manifest: ${MANIFEST_PATH}` };
  }
  try {
    return { ok: true, data: JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")) };
  } catch (err) {
    return { ok: false, error: `Invalid JSON in manifest: ${String(err)}` };
  }
}

function main() {
  const errors = [];
  const info = [];

  const { count: folderCount } = countSkillFolders();

  const manifest = loadManifest();
  if (!manifest.ok) {
    console.error(manifest.error);
    process.exit(1);
  }

  /** @type {Record<string, { declared: number | null, actual: number }>} */
  const sections = {};
  let trackedTotal = 0;

  for (const key of MANIFEST_SECTIONS) {
    const section = manifest.data[key];
    if (!section) {
      info.push(`section "${key}" not present in manifest (skipped)`);
      continue;
    }
    const declared =
      typeof section.skillCount === "number" ? section.skillCount : null;
    const actual = Array.isArray(section.skills) ? section.skills.length : 0;
    sections[key] = { declared, actual };
    trackedTotal += actual;

    if (declared === null) {
      errors.push(`section "${key}": missing numeric skillCount`);
    } else if (declared !== actual) {
      errors.push(
        `section "${key}": declared skillCount=${declared} != skills[].length=${actual}`,
      );
    }
  }

  if (trackedTotal > folderCount) {
    errors.push(
      `manifest tracks ${trackedTotal} skills but only ${folderCount} skill folders exist on disk (over-count)`,
    );
  }

  const untracked = folderCount - trackedTotal;

  if (AS_JSON) {
    console.log(
      JSON.stringify(
        { folderCount, trackedTotal, untracked, sections, errors, ok: errors.length === 0 },
        null,
        2,
      ),
    );
  } else {
    console.log("Skill count verification\n");
    console.log(`  Actual skill folders (skills/<name>/SKILL.md): ${folderCount}`);
    for (const key of MANIFEST_SECTIONS) {
      const s = sections[key];
      if (!s) continue;
      const flag = s.declared === s.actual ? "OK" : "MISMATCH";
      console.log(
        `  manifest.${key}: declared=${s.declared} array=${s.actual} [${flag}]`,
      );
    }
    console.log(`  Manifest tracked total: ${trackedTotal}`);
    console.log(
      `  Untracked (hub extras / SecOps playbooks / symlinks): ${untracked}`,
    );
    for (const line of info) console.log(`  note: ${line}`);
  }

  if (errors.length > 0) {
    console.error("\nSkill count verification FAILED:\n");
    for (const e of errors) console.error(`- ${e}`);
    process.exit(1);
  }

  if (!AS_JSON) {
    console.log("\nSkill count verification passed.");
  }
}

main();
