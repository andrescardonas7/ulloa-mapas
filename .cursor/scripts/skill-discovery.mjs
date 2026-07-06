import fs from 'node:fs';
import path from 'node:path';

function extractFrontmatter(skillFile) {
  const content = fs.readFileSync(skillFile, 'utf8');
  const lines = content.split('\n');
  let inFrontmatter = false;
  let name = '';
  let description = '';

  for (const line of lines) {
    if (line.trim() === '---') {
      if (inFrontmatter) break;
      inFrontmatter = true;
      continue;
    }
    if (!inFrontmatter) continue;

    const match = line.match(/^(\w+):\s*(.*)$/);
    if (!match) continue;
    const [, key, value] = match;
    if (key === 'name') name = value.trim();
    if (key === 'description') description = value.trim();
  }

  return { name, description };
}

function walkDirs(rootDir, maxDepth) {
  /** @type {string[]} */
  const dirs = [];

  function recurse(dir, depth) {
    if (depth > maxDepth) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const full = path.join(dir, e.name);
      dirs.push(full);
      recurse(full, depth + 1);
    }
  }

  recurse(rootDir, 0);
  return dirs;
}

export function discoverSkills({ hubRoot, maxDepth = 4 }) {
  const skillsRoot = path.join(hubRoot, 'skills');
  if (!fs.existsSync(skillsRoot)) return [];

  const dirs = [skillsRoot, ...walkDirs(skillsRoot, maxDepth)];
  /** @type {{ name: string, description: string, dir: string, skillFile: string }[]} */
  const skills = [];

  for (const d of dirs) {
    const skillFile = path.join(d, 'SKILL.md');
    if (!fs.existsSync(skillFile)) continue;
    const { name, description } = extractFrontmatter(skillFile);
    const finalName = name || path.basename(d);
    skills.push({ name: finalName, description, dir: d, skillFile });
  }

  // Deduplicate by name; prefer the closest to skillsRoot (shorter path)
  skills.sort((a, b) => a.dir.length - b.dir.length);
  const seen = new Set();
  const out = [];
  for (const s of skills) {
    if (seen.has(s.name)) continue;
    seen.add(s.name);
    out.push(s);
  }
  return out;
}

export function isOpenCodeSkillName(name) {
  // Match opencode rules: lowercase alphanumeric + single hyphens, no leading/trailing hyphen
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name);
}

