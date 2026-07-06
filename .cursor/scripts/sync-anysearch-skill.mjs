#!/usr/bin/env node
/**
 * Sync AnySearch skill from vendor/anysearch-skill into .cursor/skills/anysearch/.
 * Preserves hub-authored SKILL.md and local runtime.conf / .env.
 *
 * Usage (from repo root RULES):
 *   node .cursor/scripts/sync-anysearch-skill.mjs
 *   node .cursor/scripts/sync-anysearch-skill.mjs --dry-run
 *
 * Update upstream:
 *   git -C vendor/anysearch-skill pull origin main
 *   node .cursor/scripts/sync-anysearch-skill.mjs
 *
 * See: .cursor/SYNC-ANYSEARCH.md
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const VENDOR = path.join(REPO_ROOT, "vendor", "anysearch-skill");
const DEST = path.join(REPO_ROOT, ".cursor", "skills", "anysearch");
const MANIFEST = path.join(REPO_ROOT, ".cursor", "skills", ".sync-manifest.json");

const DRY_RUN =
  process.argv.includes("--dry-run") ||
  process.argv.includes("-n") ||
  process.argv.includes("--dryrun");

const PRESERVE_FILES = new Set([
  "SKILL.md",
  ".gitignore",
  ".env",
  "runtime.conf",
]);

const COPY_FILES = [".env.example", "runtime.conf.example"];

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function updateManifest(version) {
  if (!fs.existsSync(MANIFEST)) return;
  const data = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  const hub = data.hubLocal ?? { skills: [] };
  const row = hub.skills.find((s) => s.name === "anysearch");
  if (row) {
    row.syncedAt = new Date().toISOString();
    row.upstreamVersion = version;
  }
  data.catalogUpdatedAt = new Date().toISOString();
  data.hubLocal = hub;
  if (!DRY_RUN) {
    fs.writeFileSync(MANIFEST, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  }
}

function main() {
  if (!fs.existsSync(VENDOR)) {
    console.error(
      "Missing vendor/anysearch-skill. Clone upstream:\n" +
        "  git clone --depth 1 https://github.com/anysearch-ai/anysearch-skill.git vendor/anysearch-skill",
    );
    process.exit(1);
  }

  const vendorSkill = path.join(VENDOR, "SKILL.md");
  let version = "unknown";
  if (fs.existsSync(vendorSkill)) {
    const fm = fs.readFileSync(vendorSkill, "utf8").match(/^version:\s*(\S+)/m);
    if (fm) version = fm[1];
  }

  console.log(`AnySearch sync (upstream v${version})${DRY_RUN ? " [dry-run]" : ""}`);

  if (!DRY_RUN) {
    fs.mkdirSync(path.join(DEST, "references"), { recursive: true });
    fs.mkdirSync(path.join(DEST, "scripts"), { recursive: true });
  }

  for (const file of COPY_FILES) {
    const src = path.join(VENDOR, file);
    const dest = path.join(DEST, file);
    if (!fs.existsSync(src)) {
      console.warn(`Skip missing: ${file}`);
      continue;
    }
    console.log(`  copy ${file}`);
    if (!DRY_RUN) fs.copyFileSync(src, dest);
  }

  const scriptsSrc = path.join(VENDOR, "scripts");
  if (fs.existsSync(scriptsSrc)) {
    console.log("  copy scripts/");
    if (!DRY_RUN) copyRecursive(scriptsSrc, path.join(DEST, "scripts"));
  }

  const refDest = path.join(DEST, "references", "full-guide.md");
  console.log("  copy references/full-guide.md (from upstream SKILL.md)");
  if (!DRY_RUN && fs.existsSync(vendorSkill)) {
    fs.copyFileSync(vendorSkill, refDest);
  }

  console.log("  preserve: SKILL.md, .gitignore, .env, runtime.conf");
  updateManifest(version);
  console.log(DRY_RUN ? "Dry-run complete." : "Sync complete.");
}

main();
