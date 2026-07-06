import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { doctorProject } from './doctor-project.mjs';
import { installGlobal, installProject } from './installer.mjs';

function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function withEnv(vars, run) {
  const previous = new Map();
  for (const [key, value] of Object.entries(vars)) {
    previous.set(key, process.env[key]);
    if (value === null) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    return run();
  } finally {
    for (const [key, value] of previous.entries()) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

function createInstallableHub(hubRoot) {
  writeFile(path.join(hubRoot, 'hooks.json'), JSON.stringify({ version: 1, hooks: {} }, null, 2));
  writeFile(
    path.join(hubRoot, 'rules', 'sample.mdc'),
    ['---', 'description: Sample rule', 'alwaysApply: false', '---', '', '# Sample'].join('\n'),
  );
  writeFile(path.join(hubRoot, 'dist', 'exports', 'vscode', 'copilot-instructions.md'), '# VS Code\n');
  fs.mkdirSync(path.join(hubRoot, 'dist', 'exports', 'rules-md'), { recursive: true });
  writeFile(path.join(hubRoot, 'skills', 'good-skill', 'SKILL.md'), '# Skill\n');
}

test('doctorProject reports missing hook scripts and inventories hub assets', () => {
  const hubRoot = makeTempDir('cursor-hub-');
  const projectRoot = makeTempDir('cursor-project-');

  writeFile(path.join(hubRoot, 'README.md'), '# Hub\n');
  writeFile(path.join(hubRoot, 'hooks', 'README.md'), '# Hooks\n');
  writeFile(path.join(hubRoot, 'commands', 'README.md'), '# Commands\n');
  writeFile(path.join(hubRoot, 'agents', 'README.md'), '# Agents\n');
  writeFile(path.join(hubRoot, 'skills', 'README.md'), '# Skills\n');
  writeFile(path.join(hubRoot, 'hooks', 'existing.sh'), '#!/usr/bin/env bash\n');
  writeFile(
    path.join(hubRoot, 'hooks.json'),
    JSON.stringify(
      {
        version: 1,
        hooks: {
          afterFileEdit: [{ command: '.cursor/hooks/existing.sh', timeout: 5 }],
          stop: [{ command: '.cursor/hooks/missing.sh', timeout: 5 }],
        },
      },
      null,
      2,
    ),
  );
  writeFile(
    path.join(hubRoot, 'commands', 'doctor.md'),
    ['---', 'description: Run doctor', '---', '', '# Doctor'].join('\n'),
  );
  writeFile(path.join(hubRoot, 'agents', 'planner.md'), '# Planner\n');
  writeFile(
    path.join(hubRoot, 'skills', 'good-skill', 'SKILL.md'),
    ['---', 'name: good-skill', 'description: Good skill', '---', '', '# Good'].join('\n'),
  );
  writeFile(
    path.join(hubRoot, 'skills', 'Bad Skill', 'SKILL.md'),
    ['---', 'description: Invalid name skill', '---', '', '# Bad'].join('\n'),
  );
  writeFile(path.join(hubRoot, 'dist', 'exports', 'vscode', 'copilot-instructions.md'), '# VS Code\n');
  fs.mkdirSync(path.join(hubRoot, 'dist', 'exports', 'rules-md'), { recursive: true });
  fs.mkdirSync(path.join(projectRoot, '.cursor'), { recursive: true });

  const result = doctorProject({ hubRoot, projectRoot });

  assert.equal(result.hubChecks.hooks.entries.length, 2);
  assert.equal(result.hubChecks.hooks.missingCommands.length, 1);
  assert.equal(result.hubChecks.hooks.missingCommands[0].command, '.cursor/hooks/missing.sh');
  assert.equal(result.catalog.commands.count, 1);
  assert.deepEqual(result.catalog.commands.files, ['doctor.md']);
  assert.deepEqual(result.catalog.agents.files, ['planner.md']);
  assert.ok(result.catalog.skills.invalidOpenCodeNames.includes('Bad Skill'));
  assert.ok(
    result.warnings.includes('hooks.json references 1 missing hook script(s)'),
  );
});

test('doctorProject warns about nested hub .cursor directories', () => {
  const hubRoot = makeTempDir('cursor-hub-nested-');
  const projectRoot = makeTempDir('cursor-project-nested-');

  fs.mkdirSync(path.join(hubRoot, '.cursor', 'hooks', 'state'), { recursive: true });
  writeFile(path.join(hubRoot, 'hooks.json'), JSON.stringify({ version: 1, hooks: {} }, null, 2));
  fs.mkdirSync(path.join(projectRoot, '.cursor'), { recursive: true });

  const result = doctorProject({ hubRoot, projectRoot });

  assert.ok(result.warnings.includes('Nested .cursor directory detected inside hub root'));
});

test('installProject links active cursor and vscode targets', () => {
  const hubRoot = makeTempDir('cursor-hub-install-');
  const projectRoot = makeTempDir('cursor-project-install-');

  createInstallableHub(hubRoot);

  const result = installProject({
    hubRoot,
    projectRoot,
    targets: new Set(['cursor', 'vscode']),
  });

  assert.deepEqual(result.targets, ['cursor', 'vscode']);
  assert.deepEqual(result.inactiveTargets, []);
  assert.deepEqual(
    result.actions.map((action) => action.name),
    ['cursor.projectLink', 'vscode.copilotInstructions'],
  );
  assert.equal(fs.existsSync(path.join(projectRoot, '.cursor')), true);
  assert.equal(
    fs.existsSync(path.join(projectRoot, '.github', 'copilot-instructions.md')),
    true,
  );
});

test('installProject copies non-cursor targets into .cursor-inactive when requested', () => {
  const hubRoot = makeTempDir('cursor-hub-inactive-');
  const projectRoot = makeTempDir('cursor-project-inactive-');

  createInstallableHub(hubRoot);

  const result = installProject({
    hubRoot,
    projectRoot,
    targets: new Set(['all']),
    inactiveNonCursor: true,
  });

  assert.ok(result.targets.includes('cursor'));
  assert.ok(result.inactiveTargets.includes('vscode'));
  assert.ok(result.inactiveTargets.includes('opencode'));
  assert.ok(result.inactiveTargets.includes('antigravity'));
  assert.ok(result.inactiveTargets.includes('claude'));
  assert.equal(fs.existsSync(path.join(projectRoot, '.cursor')), true);
  assert.equal(
    fs.existsSync(
      path.join(projectRoot, '.cursor-inactive', 'vscode', 'copilot-instructions.md'),
    ),
    true,
  );
  assert.equal(
    fs.existsSync(path.join(projectRoot, '.cursor-inactive', 'opencode', 'skill')),
    true,
  );
  assert.equal(
    fs.existsSync(path.join(projectRoot, '.cursor-inactive', 'antigravity', 'rules')),
    true,
  );
  assert.equal(
    fs.existsSync(path.join(projectRoot, '.cursor-inactive', 'claude', 'skills')),
    true,
  );
});

test('installGlobal links claude and antigravity when user home is set', () => {
  const hubRoot = makeTempDir('cursor-hub-global-user-');
  const userHome = makeTempDir('cursor-user-home-');

  createInstallableHub(hubRoot);

  const homeEnv =
    process.platform === 'win32'
      ? { USERPROFILE: userHome, HOME: null, LOCALAPPDATA: null }
      : { HOME: userHome, USERPROFILE: null, LOCALAPPDATA: null };

  const result = withEnv(homeEnv, () =>
    installGlobal({
      hubRoot,
      targets: new Set(['antigravity', 'claude']),
    }),
  );

  assert.deepEqual(result.targets, ['antigravity', 'claude']);
  assert.deepEqual(
    result.actions.map((action) => action.name),
    ['antigravity.globalSkills', 'antigravity.globalRules', 'claude.globalSkills'],
  );
  assert.equal(
    fs.existsSync(path.join(userHome, '.gemini', 'antigravity', 'skills')),
    true,
  );
  assert.equal(
    fs.existsSync(path.join(userHome, '.gemini', 'antigravity', 'rules')),
    true,
  );
  assert.equal(fs.existsSync(path.join(userHome, '.claude', 'skills')), true);
});

test('installGlobal links OpenCode-safe skills and reports skipped invalid names', () => {
  const hubRoot = makeTempDir('cursor-hub-global-opencode-');
  const opencodeRoot = makeTempDir('cursor-opencode-root-');
  const opencodeSkillRoot =
    process.platform === 'win32'
      ? path.join(opencodeRoot, 'opencode', 'skill')
      : path.join(opencodeRoot, '.config', 'opencode', 'skill');

  createInstallableHub(hubRoot);
  writeFile(
    path.join(hubRoot, 'skills', 'Bad Skill', 'SKILL.md'),
    ['---', 'description: Invalid name skill', '---', '', '# Bad'].join('\n'),
  );

  const opencodeEnv =
    process.platform === 'win32'
      ? { LOCALAPPDATA: opencodeRoot, HOME: null, USERPROFILE: null }
      : { HOME: opencodeRoot, LOCALAPPDATA: null, USERPROFILE: null };

  const result = withEnv(opencodeEnv, () =>
    installGlobal({
      hubRoot,
      targets: new Set(['opencode']),
    }),
  );

  assert.deepEqual(result.targets, ['opencode']);
  assert.deepEqual(
    result.actions.map((action) => action.name),
    ['opencode.globalSkill:good-skill', 'opencode.globalSummary'],
  );
  assert.equal(fs.existsSync(path.join(opencodeSkillRoot, 'good-skill')), true);
  assert.equal(fs.existsSync(path.join(opencodeSkillRoot, 'Bad Skill')), false);
  assert.deepEqual(result.actions.at(-1)?.result, {
    root: opencodeSkillRoot,
    linked: 1,
    skipped: 1,
  });
});

test('installGlobal links claude when HOME is set (non-Windows)', { skip: process.platform === 'win32' }, () => {
  const hubRoot = makeTempDir('cursor-hub-global-home-');
  const home = makeTempDir('cursor-home-');

  createInstallableHub(hubRoot);

  const result = withEnv(
    {
      HOME: home,
      USERPROFILE: null,
      LOCALAPPDATA: null,
    },
    () =>
      installGlobal({
        hubRoot,
        targets: new Set(['claude']),
      }),
  );

  assert.deepEqual(result.targets, ['claude']);
  assert.equal(fs.existsSync(path.join(home, '.claude', 'skills')), true);
});
