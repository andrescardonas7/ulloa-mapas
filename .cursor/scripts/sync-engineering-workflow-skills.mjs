#!/usr/bin/env node
/**
 * Copy committed engineering-workflow skills from the addyosmani/agent-skills clone
 * into .cursor/skills/<name>/ (flat layout). Unlike sync-agent-skills.mjs (junctions),
 * this refreshes hub-owned copies listed in .sync-manifest.json with pack
 * "engineering-workflow".
 *
 * Does NOT copy:
 *   - test-driven-development (hub uses Superpowers TDD in .cursor/skills/)
 *   - context-engineering (hub-behavior fork; sync separately if needed)
 *
 * Usage (from repo root):
 *   node .cursor/scripts/sync-engineering-workflow-skills.mjs
 *   node .cursor/scripts/sync-engineering-workflow-skills.mjs --dry-run
 *   node .cursor/scripts/sync-engineering-workflow-skills.mjs --no-pull
 *
 * Typical update flow:
 *   node .cursor/scripts/sync-agent-skills.mjs        # pull clone + junctions
 *   node .cursor/scripts/sync-engineering-workflow-skills.mjs
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CURSOR_ROOT = path.resolve(__dirname, '..');
const DEST_ROOT = path.join(CURSOR_ROOT, 'skills');
const MANIFEST_PATH = path.join(DEST_ROOT, '.sync-manifest.json');
const DEFAULT_CLONE = 'C:/Users/zelda/agent-skills';

const EXCLUDE = new Set(['test-driven-development', 'context-engineering']);

const HUB_OVERRIDES_MARKER = '## Hub overrides (RULES workspace)';

const HUB_OVERRIDES_BLOCK = `${HUB_OVERRIDES_MARKER}

This hub vendors the addyosmani/agent-skills pack as **committed** copies under \`.cursor/skills/\`. Apply these substitutions so agents do not pick the wrong workflow:

| Topic | Use in this hub |
| --- | --- |
| Test methodology | \`.cursor/skills/test-driven-development\` (Superpowers) — **not** \`agent-skills/.../test-driven-development\` |
| Surgical scope / code style | \`coding-guidelines\` skill + \`karpathy-coding-guidelines\` rule |
| Auth, secrets, Cursor config | \`security-review\` skill (hub); optional \`security-and-hardening\` for OWASP breadth |
| Simplification | \`code-simplification\` only when asked or code is clearly bloated — not drive-by refactors |

Refresh upstream copies: \`node .cursor/scripts/sync-engineering-workflow-skills.mjs\` after \`sync-agent-skills.mjs\` pull.
`;

function parseArgs(argv) {
  return {
    pull: !argv.includes('--no-pull'),
    dryRun: argv.includes('--dry-run') || argv.includes('-n'),
  };
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadEngineeringWorkflowNames() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(`Missing manifest: ${MANIFEST_PATH}`);
  }
  const manifest = readJson(MANIFEST_PATH);
  const names = (manifest.hubLocal?.skills ?? [])
    .filter((row) => row.pack === 'engineering-workflow' && row.name)
    .map((row) => row.name)
    .filter((name) => !EXCLUDE.has(name));

  if (names.length === 0) {
    throw new Error('No engineering-workflow skills in manifest hubLocal.skills');
  }
  return { manifest, names: [...new Set(names)].sort() };
}

function gitPull(cloneRoot) {
  if (!fs.existsSync(path.join(cloneRoot, '.git'))) {
    throw new Error(
      `Not a git repo: ${cloneRoot}. Clone: git clone https://github.com/addyosmani/agent-skills.git`,
    );
  }
  const r = spawnSync('git', ['-C', cloneRoot, 'pull', '--ff-only'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (r.status !== 0) {
    const msg = [r.stdout, r.stderr].filter(Boolean).join('\n').trim();
    throw new Error(`git pull failed (${r.status}): ${msg || 'unknown error'}`);
  }
  const rev = spawnSync('git', ['-C', cloneRoot, 'rev-parse', '--short', 'HEAD'], {
    encoding: 'utf8',
  });
  const tag = spawnSync('git', ['-C', cloneRoot, 'describe', '--tags', '--always'], {
    encoding: 'utf8',
  });
  return {
    head: (rev.stdout || '').trim(),
    describe: (tag.stdout || '').trim(),
  };
}

function rmRecursive(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

function applyUsingAgentSkillsPatch(destSkillMd) {
  let body = fs.readFileSync(destSkillMd, 'utf8');
  const markerIdx = body.indexOf(HUB_OVERRIDES_MARKER);
  if (markerIdx !== -1) {
    body = body.slice(0, markerIdx).trimEnd();
  }
  body = `${body}\n\n${HUB_OVERRIDES_BLOCK}`;
  fs.writeFileSync(destSkillMd, body, 'utf8');
}

function syncSkill(name, srcDir, destDir, dryRun) {
  const src = path.join(srcDir, name);
  const dest = path.join(destDir, name);
  const srcSkill = path.join(src, 'SKILL.md');

  if (!fs.existsSync(srcSkill)) {
    return { name, action: 'missing-upstream' };
  }

  if (dryRun) {
    return { name, action: 'would-copy' };
  }

  if (fs.existsSync(dest)) {
    rmRecursive(dest);
  }
  fs.cpSync(src, dest, { recursive: true });
  return { name, action: 'copied' };
}

function updateManifestEngineeringPack(manifest, syncedNames, upstreamDescribe) {
  const hub = manifest.hubLocal ?? { skills: [] };
  const existing = new Set(
    hub.skills.filter((r) => r.pack === 'engineering-workflow').map((r) => r.name),
  );
  let added = 0;
  for (const name of syncedNames) {
    if (existing.has(name)) continue;
    hub.skills.push({ name, pack: 'engineering-workflow' });
    existing.add(name);
    added += 1;
  }
  hub.engineeringWorkflow = {
    updatedAt: new Date().toISOString(),
    upstream: 'https://github.com/addyosmani/agent-skills',
    upstreamDescribe: upstreamDescribe,
    skillCount: [...existing].length,
    excluded: [...EXCLUDE],
  };
  manifest.hubLocal = hub;
  manifest.catalogUpdatedAt = new Date().toISOString();
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  return added;
}

function main() {
  const { pull, dryRun } = parseArgs(process.argv.slice(2));
  const cloneRoot = process.env.AGENT_SKILLS_ROOT || DEFAULT_CLONE;
  const packSkillsDir = path.join(cloneRoot, 'skills');

  const { manifest, names } = loadEngineeringWorkflowNames();

  console.log('Engineering workflow skills sync');
  console.log(`  Clone:  ${cloneRoot}`);
  console.log(`  Dest:   ${DEST_ROOT}`);
  console.log(`  Skills: ${names.length} from manifest (pack=engineering-workflow)`);
  if (dryRun) console.log('  Mode:   DRY RUN');

  let upstreamDescribe = '(pull skipped)';
  if (pull && !dryRun) {
    const rev = gitPull(cloneRoot);
    upstreamDescribe = rev.describe;
    console.log(`  git pull: OK @ ${rev.head} (${rev.describe})`);
  } else if (pull && dryRun) {
    console.log('  git pull: skipped (dry run)');
  }

  const results = names.map((name) =>
    syncSkill(name, packSkillsDir, DEST_ROOT, dryRun),
  );

  if (!dryRun) {
    const usingMd = path.join(DEST_ROOT, 'using-agent-skills', 'SKILL.md');
    if (fs.existsSync(usingMd)) {
      applyUsingAgentSkillsPatch(usingMd);
      console.log('  Patched:  using-agent-skills/SKILL.md (hub overrides)');
    }
    const added = updateManifestEngineeringPack(manifest, names, upstreamDescribe);
    if (added > 0) {
      console.log(`  Manifest: added ${added} new engineering-workflow skill(s)`);
    }
  }

  const copied = results.filter((r) => r.action === 'copied').length;
  const would = results.filter((r) => r.action === 'would-copy').length;
  const missing = results.filter((r) => r.action === 'missing-upstream');

  console.log(`  Result:   ${copied} copied, ${would} would-copy`);
  for (const m of missing) {
    console.error(`  MISSING upstream: ${m.name}`);
  }
  if (missing.length) process.exit(1);

  if (!dryRun && (copied > 0 || names.includes('observability-and-instrumentation'))) {
    console.log('\nAudit changed skills (from repo root):');
    const auditFlags = names.map((n) => `--skill ${n}`).join(' ');
    console.log(`  node .cursor/scripts/audit-skills-trust.mjs ${auditFlags}`);
  }

  console.log(dryRun ? '\nDry run complete.' : '\nDone.');
}

main();
