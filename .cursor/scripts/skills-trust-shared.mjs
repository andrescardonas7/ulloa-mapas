/**
 * Shared helpers for hub skill trust audits (fast gate + optional deep scan).
 * Pattern catalog: skills-trust-block-patterns.mjs (aligned with high-signal SkillSpector categories).
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DEFAULT_HUB_ROOT = path.resolve(__dirname, '..');

/** @param {string} hubRoot */
export function resolveHubRoot(hubRoot) {
  return path.resolve(hubRoot ?? DEFAULT_HUB_ROOT);
}

/** @param {string} hubRoot */
export function skillsRootFromHub(hubRoot) {
  return path.join(resolveHubRoot(hubRoot), 'skills');
}

export const NESTED_SKILL_ALLOWLIST = [/^document-skills\/(pdf|docx|pptx|xlsx)$/];

export const OBSOLETE_ROOT_PACKS = new Set([
  'building-secure-contracts',
  'testing-handbook-skills',
  'culture-index',
]);

export const SKIP_TRUST_SCAN_DIRS = new Set(['skill-trust-audit']);

/** @param {string} line */
export function isBenignInjectionExample(line) {
  const t = line.trim();
  if (/^\$inj\d*\s*=/.test(t)) return true;
  if (/\bnocase\b/i.test(t)) return true;
  if (/```/.test(t)) return true;
  if (/\b(strings:|condition:|alert\s|Sigma|YARA|#\s*Detects)\b/i.test(t)) return true;
  if (/^[-*]\s*"/.test(t) || /^".*"\.\.\./.test(t)) return true;
  if (/^\s*-\s*\[\s*[xX ]?\s*\]/.test(t)) return true;
  if (/\bdetect(s|ing)?\s+(known\s+)?patterns?\b/i.test(t)) return true;
  if (/\b(prompt injection|injection_detected|guardrail|classifier flags)\b/i.test(t))
    return true;
  if (/\b(Pattern Categories|matched_pattern|system_prompt_override|variants)\b/i.test(t))
    return true;
  if (/--\s*["']/.test(t) && /\binstructions?\b/i.test(t)) return true;
  if (/\b(example|for example|e\.g\.|test vector|detection rule)\b/i.test(t)) return true;
  if (/\bnever interpret\b/i.test(t) && /\binstructions\b/i.test(t)) return true;
  if (/skills-trust-block-patterns|skillspector-alignment/i.test(t)) return true;
  return false;
}

/** @param {string} line */
export function isBenignCurlPipeBashMention(line) {
  if (isNegatedSecurityMention(line)) return true;
  if (/command_injection|INJECTION_PATTERNS|Pattern Categories/i.test(line)) return true;
  if (/r["'](\(\?i\)|\(\?)/.test(line)) return true;
  if (/\(\?i\)/.test(line) && /\|\s*\w+/.test(line)) return true;
  return false;
}

/** @param {string} line */
export function isNegatedSecurityMention(line) {
  if (/\b(detect(s|ing)?|flags?|blocks?|mitigates?|guardrail|regex layer|classifier)\b/i.test(line))
    return true;
  return /\b(avoid|never|do not|don't|prohibited|unsafe|not make|does not make)\b/i.test(
    line,
  );
}

/** @param {string} line */
export function isBenignForensicArtifactMention(line) {
  const t = line.trim();
  // DFIR glossary tables and scenario playbooks (not key exfil instructions).
  if (!/\bauthorized_keys\b/i.test(t) && !/\.ssh\/(id_rsa|id_ed25519|id_ecdsa)/i.test(t)) {
    return false;
  }
  if (/^\|[^|]*(authorized_keys|\.ssh\/)/i.test(t)) return true;
  if (/^\|/.test(t)) return true;
  if (
    /\b(examine|check|review|analyze|inspect|identify|parse|collect|investigate|monitor|detect)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  if (/\bauthorized_keys\b[^.\n]{0,60}\b(backdoor|persistence|attacker|compromise|added)\b/i.test(t)) {
    return true;
  }
  if (/\b(Path|Artifact|Purpose|SSH keys|Authorized|forensic|evidence)\b/i.test(t)) {
    return true;
  }
  if (/\b(os\.path\.join|evidence_root|\/etc\/ssh)\b/i.test(t)) return true;
  return false;
}

/** @param {string} line */
export function isBenignEnvAccess(line) {
  if (isNegatedSecurityMention(line)) return true;
  if (isBenignInjectionExample(line)) return true;
  if (/\b(example|placeholder|document|describe|test|mock)\b/i.test(line)) return true;
  if (/process\.env\.[A-Z_]+/.test(line) && !/\b(forEach|entries|keys)\b/.test(line))
    return true;
  return false;
}

/** @param {string[]} args @param {string} cwd */
export function runGit(args, cwd) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (result.status !== 0) return null;
  return result.stdout.trim();
}

/** @param {string} content */
export function normalizeNewlines(content) {
  return content.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/** @param {string} skillsRoot */
export function listTopLevelSkillDirs(skillsRoot) {
  if (!fs.existsSync(skillsRoot)) return [];
  return fs
    .readdirSync(skillsRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => path.join(skillsRoot, e.name));
}

/**
 * @param {string} skillsRoot
 * @param {string} repoRoot
 * @param {{ baseRef?: string }} [options] CI: set SKILLS_AUDIT_BASE_REF (e.g. PR base SHA or push before SHA)
 * @returns {string[]}
 */
export function getChangedSkillDirs(skillsRoot, repoRoot, options = {}) {
  const root = runGit(['rev-parse', '--show-toplevel'], repoRoot) || repoRoot;
  const baseRef = options.baseRef ?? process.env.SKILLS_AUDIT_BASE_REF;

  let diff = '';
  if (baseRef) {
    diff =
      runGit(['diff', '--name-only', `${baseRef}...HEAD`, '--', '.cursor/skills'], root) ||
      '';
  } else {
    diff = runGit(['diff', '--name-only', 'HEAD', '--', '.cursor/skills'], root) || '';
  }
  const cached = runGit(
    ['diff', '--cached', '--name-only', '--', '.cursor/skills'],
    root,
  );
  const names = new Set(
    `${diff}\n${cached || ''}`
      .split(/\r?\n/)
      .filter(Boolean),
  );

  return skillPathsToDirs(skillsRoot, names);
}

/** @param {Iterable<string>} skillPaths paths under .cursor/skills/ */
function skillPathsToDirs(skillsRoot, skillPaths) {
  const dirs = new Set();
  for (const rel of skillPaths) {
    const normalized = rel.replace(/^\.cursor\/skills\//, '').replace(/\\/g, '/');
    const top = normalized.split('/')[0];
    if (top) dirs.add(path.join(skillsRoot, top));
    if (normalized.startsWith('document-skills/')) {
      const sub = normalized.split('/')[1];
      if (sub) dirs.add(path.join(skillsRoot, 'document-skills', sub));
    }
  }
  return [...dirs].filter((d) => fs.existsSync(d));
}

/**
 * Skill folders with staged changes only (pre-commit scope).
 * @param {string} skillsRoot
 * @param {string} repoRoot
 * @returns {string[]}
 */
export function getStagedSkillDirs(skillsRoot, repoRoot) {
  const root = runGit(['rev-parse', '--show-toplevel'], repoRoot) || repoRoot;
  const staged =
    runGit(
      [
        'diff',
        '--cached',
        '--name-only',
        '--diff-filter=ACMR',
        '--',
        '.cursor/skills',
      ],
      root,
    ) || '';
  return skillPathsToDirs(skillsRoot, staged.split(/\r?\n/).filter(Boolean));
}

/** @param {string[]} argv */
export function parseSkillFilters(argv) {
  const names = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--skill' && argv[i + 1]) {
      names.push(argv[++i]);
      continue;
    }
    if (argv[i]?.startsWith('--skill=')) {
      names.push(argv[i].slice('--skill='.length));
    }
  }
  return names.length > 0 ? new Set(names) : null;
}

/**
 * @param {string} skillsRoot
 * @param {{ changedOnly?: boolean, skillFilter?: Set<string> | null, repoRoot?: string }} options
 * @returns {string[]}
 */
export function resolveSkillDirsToScan(
  skillsRoot,
  { changedOnly, stagedOnly, skillFilter, repoRoot, baseRef } = {},
) {
  let dirs = stagedOnly
    ? getStagedSkillDirs(skillsRoot, repoRoot ?? process.cwd())
    : changedOnly
      ? getChangedSkillDirs(skillsRoot, repoRoot ?? process.cwd(), { baseRef })
      : [
        ...listTopLevelSkillDirs(skillsRoot),
        ...NESTED_SKILL_ALLOWLIST.flatMap((re) => {
          const m = re.source.match(/document-skills\/\(([^)]+)\)/);
          if (!m) return [];
          return m[1].split('|').map((sub) =>
            path.join(skillsRoot, 'document-skills', sub),
          );
        }),
      ];

  if (skillFilter) {
    dirs = [...skillFilter].flatMap((name) => {
      if (name.startsWith('document-skills/')) {
        const sub = name.split('/')[1];
        return sub ? [path.join(skillsRoot, 'document-skills', sub)] : [];
      }
      return [path.join(skillsRoot, name)];
    });
  }

  return [...new Set(dirs.map((d) => path.resolve(d)))].filter((d) => {
    const rel = path.relative(skillsRoot, d).replace(/\\/g, '/');
    const top = rel.split('/')[0];
    return !SKIP_TRUST_SCAN_DIRS.has(top);
  });
}
