#!/usr/bin/env node
/**
 * Copies curated cybersecurity skills from vendor/anthropic-cybersecurity-skills/skills
 * into flat .cursor/skills/<name>/ for Cursor discovery.
 *
 * Does NOT overwrite hub-local, Trail of Bits, or SecOps playbook skills.
 *
 * Usage (from repo root RULES):
 *   node .cursor/scripts/sync-cyber-skills.mjs
 *   node .cursor/scripts/sync-cyber-skills.mjs --dry-run
 *   node .cursor/scripts/sync-cyber-skills.mjs --prune
 *
 * Update upstream:
 *   git submodule update --init vendor/anthropic-cybersecurity-skills
 *   git -C vendor/anthropic-cybersecurity-skills pull origin main
 *   node .cursor/scripts/sync-cyber-skills.mjs
 *
 * See: .cursor/SYNC-ANTHROPIC-CYBER.md
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const VENDOR = path.join(REPO_ROOT, "vendor", "anthropic-cybersecurity-skills");
const VENDOR_SKILLS = path.join(VENDOR, "skills");
const DEST_ROOT = path.join(REPO_ROOT, ".cursor", "skills");
const MANIFEST_NAME = ".sync-manifest.json";
const ALLOWLIST_PATH = path.join(__dirname, "cyber-skills-allowlist.json");

/** Hub SecOps playbooks — never replace with upstream granular skills */
const SECOPS_HUB_PLAYBOOKS = new Set([
  "web-pentest",
  "threat-hunting",
  "malware-analysis",
  "incident-response",
  "red-team-ops",
  "advanced-redteam",
  "active-directory-attack",
  "recon-osint",
  "network-attack",
  "exploit-development",
  "reverse-engineering",
  "privesc-windows",
  "privesc-linux",
  "edr-evasion",
  "initial-access",
  "mobile-pentest",
  "cloud-security",
  "ai-security",
  "shellcode-dev",
  "vulnerability-analysis",
  "crypto-analysis",
  "coding-mastery",
  "windows-boundaries",
  "windows-mitigations",
  "keylogger-arch",
]);

const argv = process.argv.slice(2);
const DRY_RUN =
  argv.includes("--dry-run") || argv.includes("-n") || argv.includes("--dryrun");
const PRUNE = argv.includes("--prune");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadAllowlist() {
  if (!fs.existsSync(ALLOWLIST_PATH)) {
    console.error(`Missing allowlist: ${ALLOWLIST_PATH}`);
    process.exit(1);
  }
  const data = readJson(ALLOWLIST_PATH);
  if (!Array.isArray(data.skills) || data.skills.length === 0) {
    console.error("Allowlist has no skills[] entries.");
    process.exit(1);
  }
  return data;
}

function loadManifest() {
  const dest = path.join(DEST_ROOT, MANIFEST_NAME);
  if (!fs.existsSync(dest)) return {};
  try {
    return readJson(dest);
  } catch {
    return {};
  }
}

function buildProtectedNames(manifest) {
  const protectedNames = new Set(SECOPS_HUB_PLAYBOOKS);
  for (const row of manifest.hubLocal?.skills ?? []) {
    if (row.name) protectedNames.add(row.name);
  }
  for (const row of manifest.trailOfBits?.skills ?? []) {
    if (row.name) protectedNames.add(row.name);
  }
  return protectedNames;
}

function rmRecursive(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

function writeManifest(allowlist, syncedRows, manifest) {
  const dest = path.join(DEST_ROOT, MANIFEST_NAME);
  const bySubdomain = {};
  for (const row of syncedRows) {
    bySubdomain[row.subdomain] = (bySubdomain[row.subdomain] ?? 0) + 1;
  }

  const next = {
    catalogUpdatedAt: new Date().toISOString(),
    ...(manifest.trailOfBits ? { trailOfBits: manifest.trailOfBits } : {}),
    ...(manifest.hubLocal ? { hubLocal: manifest.hubLocal } : {}),
    anthropicCyber: {
      generatedAt: new Date().toISOString(),
      source:
        "vendor/anthropic-cybersecurity-skills/skills (mukul975/Anthropic-Cybersecurity-Skills)",
      upstream:
        allowlist.source ??
        "https://github.com/mukul975/Anthropic-Cybersecurity-Skills",
      allowlistFile: ".cursor/scripts/cyber-skills-allowlist.json",
      dryRun: false,
      skillCount: syncedRows.length,
      domains: bySubdomain,
      skills: syncedRows.map((s) => ({ name: s.name, subdomain: s.subdomain })),
    },
  };

  fs.writeFileSync(dest, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  console.log(
    `\nWrote ${path.relative(REPO_ROOT, dest)} (anthropicCyber: ${syncedRows.length} skills)`,
  );
}

function pruneRemoved(previousNames, currentNames) {
  let removed = 0;
  for (const name of previousNames) {
    if (currentNames.has(name)) continue;
    const dest = path.join(DEST_ROOT, name);
    if (!fs.existsSync(dest)) continue;
    if (DRY_RUN) {
      console.log(`[dry-run] would prune removed allowlist skill: ${name}/`);
    } else {
      rmRecursive(dest);
      console.log(`pruned removed allowlist skill: ${name}/`);
    }
    removed += 1;
  }
  return removed;
}

function main() {
  if (!fs.existsSync(VENDOR_SKILLS)) {
    console.error(`Missing: ${VENDOR_SKILLS}`);
    console.error(
      "Run: git submodule update --init vendor/anthropic-cybersecurity-skills",
    );
    console.error(
      "Or clone: git clone --depth 1 https://github.com/mukul975/Anthropic-Cybersecurity-Skills.git vendor/anthropic-cybersecurity-skills",
    );
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log("[dry-run] No files will be modified.\n");
  }

  const allowlist = loadAllowlist();
  const manifest = loadManifest();
  const protectedNames = buildProtectedNames(manifest);
  const previousCyber = new Set(
    (manifest.anthropicCyber?.skills ?? []).map((s) => s.name),
  );
  const currentNames = new Set(allowlist.skills.map((s) => s.name));

  /** @type {{ name: string, subdomain: string }[]} */
  const syncedRows = [];
  /** @type {string[]} */
  const skippedProtected = [];
  /** @type {string[]} */
  const missingUpstream = [];
  /** @type {string[]} */
  const duplicateInAllowlist = [];

  const seen = new Set();
  for (const entry of allowlist.skills) {
    const name = entry.name;
    const subdomain = entry.subdomain ?? "unknown";
    if (seen.has(name)) {
      duplicateInAllowlist.push(name);
      continue;
    }
    seen.add(name);

    if (protectedNames.has(name)) {
      skippedProtected.push(name);
      continue;
    }

    const src = path.join(VENDOR_SKILLS, name);
    const skillMd = path.join(src, "SKILL.md");
    if (!fs.existsSync(skillMd)) {
      missingUpstream.push(name);
      continue;
    }

    const dest = path.join(DEST_ROOT, name);
    if (DRY_RUN) {
      console.log(`[dry-run] would copy ${name} (${subdomain}) -> ${dest}`);
    } else {
      rmRecursive(dest);
      fs.cpSync(src, dest, { recursive: true });
      console.log(`+ ${name}  (${subdomain})`);
    }
    syncedRows.push({ name, subdomain });
  }

  if (duplicateInAllowlist.length > 0) {
    console.warn("\nDuplicate names in allowlist (skipped duplicates):");
    for (const n of duplicateInAllowlist) console.warn(`  - ${n}`);
  }

  if (skippedProtected.length > 0) {
    console.warn("\nSkipped (protected hub/ToB/SecOps playbook names):");
    for (const n of skippedProtected) console.warn(`  - ${n}`);
  }

  if (missingUpstream.length > 0) {
    console.error("\nMissing in vendor (not synced):");
    for (const n of missingUpstream) console.error(`  - ${n}`);
    if (!DRY_RUN) process.exit(1);
  }

  let pruned = 0;
  if (PRUNE) {
    pruned = pruneRemoved(previousCyber, currentNames);
  }

  if (DRY_RUN) {
    console.log(
      `\n[dry-run] Done: ${syncedRows.length} skills would sync -> ${DEST_ROOT}`,
    );
    if (PRUNE) console.log(`[dry-run] would prune ${pruned} folder(s)`);
    return;
  }

  writeManifest(allowlist, syncedRows, manifest);
  console.log(`\nDone: ${syncedRows.length} skills -> ${DEST_ROOT}`);
  if (PRUNE) console.log(`Pruned ${pruned} folder(s) no longer in allowlist.`);
  console.log(
    "\nNext: node .cursor/scripts/audit-skills-trust.mjs --anthropic-cyber",
  );
}

main();
