#!/usr/bin/env node
/**
 * Hub skills gate: flat layout, frontmatter, pattern scan (SkillSpector-aligned catalog).
 * Usage:
 *   node .cursor/scripts/audit-skills-trust.mjs           # all skills
 *   node .cursor/scripts/audit-skills-trust.mjs --changed-only
 *   node .cursor/scripts/audit-skills-trust.mjs --staged-only   # pre-commit scope
 *   node .cursor/scripts/audit-skills-trust.mjs --skill using-agent-skills
 *   node .cursor/scripts/audit-skills-trust.mjs --hub-local
 *   node .cursor/scripts/audit-skills-trust.mjs --anthropic-cyber
 *   node .cursor/scripts/audit-skills-trust.mjs --pm-skills
 *   pnpm --dir .cursor audit:skills:hub-local
 *
 * Deep scan (optional): skills-trust-deep-scan.mjs + CI job deep-audit.
 *
 * Notes:
 *   --changed-only limits trust scan dirs (git diff under .cursor/skills) but layout
 *   is checked on every SKILL.md unless --skill filters the tree.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { BLOCK_RULES } from './skills-trust-block-patterns.mjs';
import {
    DEFAULT_HUB_ROOT,
    NESTED_SKILL_ALLOWLIST,
    OBSOLETE_ROOT_PACKS,
    SKIP_TRUST_SCAN_DIRS,
    normalizeNewlines,
    parseSkillFilters,
    resolveHubRoot,
    resolveSkillDirsToScan,
} from './skills-trust-shared.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export { DEFAULT_HUB_ROOT };

const SCANNABLE_FILE = /\.(md|sh|py|js|mjs|ps1|json|ya?ml)$/i;

function extractFrontmatterBlock(content) {
  const normalized = normalizeNewlines(content);
  const match = normalized.match(/^---\n([\s\S]*?)\n---/);
  return match ? match[1] : null;
}

function hasDescriptionInFrontmatter(content) {
  const block = extractFrontmatterBlock(content);
  if (!block) return false;

  const lines = block.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith('description:')) continue;

    const inline = line.slice('description:'.length).trim();
    if (inline && inline !== '>-' && inline !== '>' && inline !== '|') {
      return true;
    }

    for (let j = i + 1; j < lines.length; j++) {
      if (/^[\w-]+:/.test(lines[j])) break;
      if (/^\s+\S/.test(lines[j])) return true;
    }
  }

  return false;
}

function walkFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    if (entry.isDirectory()) walkFiles(full, acc);
    else acc.push(full);
  }
  return acc;
}

function findAllSkillMdFiles(skillsRoot) {
  const found = walkFiles(skillsRoot, []);
  return found.filter((f) => path.basename(f) === 'SKILL.md');
}

function skillMdRelative(skillsRoot, skillMdAbs) {
  return path.relative(skillsRoot, skillMdAbs).replace(/\\/g, '/');
}

function isObsoleteNestedSkillPath(rel) {
  const parts = rel.split('/');
  if (OBSOLETE_ROOT_PACKS.has(parts[0])) return true;
  if (parts[0] === 'sharp-edges' && parts[1] === 'skills') return true;
  return false;
}

/** @returns {Set<string> | null} */
export function loadHubLocalSkillFilter(hubRoot = DEFAULT_HUB_ROOT) {
  const manifestPath = path.join(resolveHubRoot(hubRoot), 'skills', '.sync-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    return null;
  }
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch {
    return null;
  }
  const rows = manifest.hubLocal?.skills;
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return new Set(rows.map((r) => r.name).filter(Boolean));
}

/** @returns {Set<string> | null} */
export function loadAnthropicCyberSkillFilter(hubRoot = DEFAULT_HUB_ROOT) {
  const manifestPath = path.join(resolveHubRoot(hubRoot), 'skills', '.sync-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    return null;
  }
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch {
    return null;
  }
  const rows = manifest.anthropicCyber?.skills;
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return new Set(rows.map((r) => r.name).filter(Boolean));
}

export function loadPmSkillsSkillFilter(hubRoot = DEFAULT_HUB_ROOT) {
  const manifestPath = path.join(resolveHubRoot(hubRoot), 'skills', '.sync-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    return null;
  }
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch {
    return null;
  }
  const rows = manifest.pmSkills?.skills;
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return new Set(rows.map((r) => r.name).filter(Boolean));
}

function skillMdUnderFilter(rel, skillFilter) {
  if (!skillFilter) return true;
  const top = rel.split('/')[0];
  if (skillFilter.has(top)) return true;
  if (top === 'document-skills') {
    const sub = rel.split('/')[1];
    return sub && skillFilter.has(`document-skills/${sub}`);
  }
  return false;
}

function validateLayout(skillsRoot, skillMdAbs, errors) {
  const rel = skillMdRelative(skillsRoot, skillMdAbs);
  if (isObsoleteNestedSkillPath(rel)) return;

  const parts = rel.split('/');
  parts.pop();

  if (parts.length === 1) return;
  const nestedPath = parts.join('/');
  const allowed = NESTED_SKILL_ALLOWLIST.some((re) => re.test(nestedPath));
  if (!allowed) {
    errors.push(
      `Nested SKILL.md not allowed (use flat skills/<name>/SKILL.md): skills/${rel}`,
    );
  }
}

/**
 * @param {import('./skills-trust-block-patterns.mjs').BlockRule} rule
 * @param {string} relFile
 */
function isBlockingFinding(rule, relFile) {
  if (rule.level === 'warn') return false;
  return relFile === 'SKILL.md';
}

function scanFileTrust(skillsRoot, absPath, skillDir, errors, warnings) {
  const relDir = path.relative(skillsRoot, skillDir).replace(/\\/g, '/');
  if (SKIP_TRUST_SCAN_DIRS.has(relDir.split('/')[0])) return;

  const relFile = path.relative(skillDir, absPath).replace(/\\/g, '/');
  const content = normalizeNewlines(fs.readFileSync(absPath, 'utf8'));
  const lines = content.split('\n');
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    for (const rule of BLOCK_RULES) {
      const globTarget = relFile === 'SKILL.md' ? 'SKILL.md' : relFile;
      if (!rule.fileGlob.test(globTarget)) continue;
      if (!rule.regex.test(line)) continue;
      if (rule.lineFilter && !rule.lineFilter(line)) continue;

      const loc = `${relDir}/${relFile}:${i + 1}`;
      const msg = `[${rule.category}:${rule.id}] ${loc}: ${line.trim().slice(0, 120)}`;
      if (isBlockingFinding(rule, relFile)) errors.push(msg);
      else warnings.push(msg);
    }
  }
}

function auditSkillDir(skillsRoot, skillDir, errors, warnings) {
  const skillMd = path.join(skillDir, 'SKILL.md');
  if (!fs.existsSync(skillMd)) return;

  validateLayout(skillsRoot, skillMd, errors);

  const skillContent = fs.readFileSync(skillMd, 'utf8');
  const rel = path.relative(skillsRoot, skillDir).replace(/\\/g, '/');
  if (!hasDescriptionInFrontmatter(skillContent)) {
    errors.push(`Missing or empty description in skills/${rel}/SKILL.md frontmatter`);
  }

  const files = walkFiles(skillDir).filter((f) => {
    const base = path.basename(f);
    if (base === 'SKILL.md') return true;
    return SCANNABLE_FILE.test(base);
  });

  for (const file of files) {
    scanFileTrust(skillsRoot, file, skillDir, errors, warnings);
  }
}

/**
 * @param {{ hubRoot?: string, changedOnly?: boolean, repoRoot?: string, skillFilter?: Set<string> | null }} options
 */
export function auditSkillsTrust({
  hubRoot = DEFAULT_HUB_ROOT,
  changedOnly = false,
  stagedOnly = false,
  repoRoot = process.cwd(),
  skillFilter = null,
  baseRef,
} = {}) {
  const hubAbs = resolveHubRoot(hubRoot);
  const skillsRoot = path.join(hubAbs, 'skills');

  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const warnings = [];

  if (!fs.existsSync(skillsRoot)) {
    return {
      ok: false,
      errors: ['skills/ directory missing in hub'],
      warnings: [],
      scannedCount: 0,
      skillsRoot,
    };
  }

  const scopedScan = Boolean(stagedOnly || changedOnly || skillFilter);
  const uniqueDirs = resolveSkillDirsToScan(skillsRoot, {
    changedOnly,
    stagedOnly,
    skillFilter,
    repoRoot,
    baseRef,
  });

  if (!scopedScan) {
    for (const skillMd of findAllSkillMdFiles(skillsRoot)) {
      validateLayout(skillsRoot, skillMd, errors);
    }
  }

  if (skillFilter) {
    for (const name of skillFilter) {
      const dir = name.startsWith('document-skills/')
        ? path.join(skillsRoot, 'document-skills', name.split('/')[1] || '')
        : path.join(skillsRoot, name);
      if (!fs.existsSync(dir)) {
        errors.push(`hubLocal skill folder missing: skills/${name}/`);
        continue;
      }
      if (!fs.existsSync(path.join(dir, 'SKILL.md'))) {
        errors.push(`hubLocal skill missing SKILL.md: skills/${name}/SKILL.md`);
      }
    }
  }

  for (const dir of uniqueDirs) {
    auditSkillDir(skillsRoot, dir, errors, warnings);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    scannedCount: uniqueDirs.length,
    skillsRoot,
  };
}

function main() {
  const stagedOnly = process.argv.includes('--staged-only');
  const changedOnly = process.argv.includes('--changed-only') && !stagedOnly;
  const hubLocal = process.argv.includes('--hub-local');
  const anthropicCyber = process.argv.includes('--anthropic-cyber');
  const pmSkills = process.argv.includes('--pm-skills');
  let skillFilter = parseSkillFilters(process.argv);
  if (!skillFilter && hubLocal) {
    skillFilter = loadHubLocalSkillFilter();
    if (!skillFilter) {
      console.error(
        'Skill trust audit failed:\n\n- --hub-local: no hubLocal.skills in skills/.sync-manifest.json',
      );
      process.exit(1);
    }
  }
  if (!skillFilter && anthropicCyber) {
    skillFilter = loadAnthropicCyberSkillFilter();
    if (!skillFilter) {
      console.error(
        'Skill trust audit failed:\n\n- --anthropic-cyber: no anthropicCyber.skills in skills/.sync-manifest.json (run sync-cyber-skills.mjs first)',
      );
      process.exit(1);
    }
  }
  if (!skillFilter && pmSkills) {
    skillFilter = loadPmSkillsSkillFilter();
    if (!skillFilter) {
      console.error(
        'Skill trust audit failed:\n\n- --pm-skills: no pmSkills.skills in skills/.sync-manifest.json (run sync-pm-skills.mjs first)',
      );
      process.exit(1);
    }
  }
  const result = auditSkillsTrust({
    changedOnly,
    stagedOnly,
    repoRoot: process.cwd(),
    skillFilter,
  });

  if (result.warnings.length > 0) {
    console.warn('Skill trust audit warnings:\n');
    for (const w of result.warnings) console.warn(`- ${w}`);
  }

  if (!result.ok) {
    console.error('Skill trust audit failed:\n');
    for (const e of result.errors) console.error(`- ${e}`);
    process.exit(1);
  }

  console.log(
    `Skill trust audit passed (${result.scannedCount} skill folder(s) scanned, ${BLOCK_RULES.length} patterns).`,
  );
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main();
}
