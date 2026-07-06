import path from 'node:path';

import {
    ensureCopiedDirectory,
    ensureCopiedFile,
    ensureDir,
    ensureLinkedDirectory,
    ensureLinkedFile,
} from './fs-link.mjs';
import {
    exportRulesToMarkdown,
    exportVscodeCopilotInstructions,
} from './mdc-to-md.mjs';
import { discoverSkills, isOpenCodeSkillName } from './skill-discovery.mjs';

const PROJECT_TARGETS_DEFAULT = ['cursor', 'vscode'];
const PROJECT_TARGETS_ALL = [
  'cursor',
  'vscode',
  'opencode',
  'antigravity',
  'claude',
];
const GLOBAL_TARGETS_DEFAULT = ['opencode', 'antigravity', 'claude'];
const GLOBAL_TARGETS_ALL = ['opencode', 'antigravity', 'claude'];

function normalizeTargets({ targets, scope }) {
  const defaults =
    scope === 'project' ? PROJECT_TARGETS_DEFAULT : GLOBAL_TARGETS_DEFAULT;
  const all = scope === 'project' ? PROJECT_TARGETS_ALL : GLOBAL_TARGETS_ALL;

  if (!targets || targets.size === 0) {
    return new Set(defaults);
  }

  if (targets.has('all')) {
    return new Set(all);
  }

  const resolved = new Set();
  for (const t of targets) {
    if (all.includes(t)) resolved.add(t);
  }

  return resolved.size > 0 ? resolved : new Set(defaults);
}

function getEnvPath(name) {
  const v = process.env[name];
  return v && String(v).trim() ? String(v).trim() : null;
}

/** Windows: USERPROFILE; macOS/Linux: HOME */
function getUserProfileDir() {
  if (process.platform === 'win32') {
    return getEnvPath('USERPROFILE');
  }
  return getEnvPath('HOME');
}

/** Windows: %LOCALAPPDATA%\\opencode\\skill; Unix: ~/.config/opencode/skill */
function getOpenCodeGlobalSkillRoot() {
  if (process.platform === 'win32') {
    const localAppData = getEnvPath('LOCALAPPDATA');
    if (localAppData === null) return null;
    return path.join(localAppData, 'opencode', 'skill');
  }

  const home = getEnvPath('HOME');
  if (home === null) return null;
  return path.join(home, '.config', 'opencode', 'skill');
}

export function getDefaultProjectRoot() {
  return process.cwd();
}

export function exportAll({ hubRoot }) {
  const rules = exportRulesToMarkdown({ hubRoot });
  const vscode = exportVscodeCopilotInstructions({ hubRoot });
  return { rules, vscode };
}

function assertProjectIsNotHub(projectAbs, hubAbs) {
  if (projectAbs !== hubAbs) return;

  throw new Error(
    [
      'Refusing to install into the hub directory itself.',
      'Pass --project pointing to your project root (the folder that should contain a .cursor/ link).',
    ].join(' ')
  );
}

function splitProjectTargets(enabled, inactiveNonCursor) {
  const activeTargets = new Set(enabled);
  const inactiveTargets = new Set();

  if (!inactiveNonCursor) {
    return { activeTargets, inactiveTargets };
  }

  for (const target of enabled) {
    if (target === 'cursor') continue;
    inactiveTargets.add(target);
    activeTargets.delete(target);
  }

  return { activeTargets, inactiveTargets };
}

function addAction(actions, name, result) {
  actions.push({ name, result });
}

function addFsAction(actions, name, operation, paths) {
  addAction(actions, name, operation(paths));
}

function addActiveProjectActions(actions, activeTargets, context) {
  const { projectAbs, hubAbs, exports, hubSkills } = context;
  const cursorLink = path.join(projectAbs, '.cursor');

  if (activeTargets.has('cursor') && path.resolve(cursorLink) !== hubAbs) {
    addFsAction(actions, 'cursor.projectLink', ensureLinkedDirectory, {
      linkPath: cursorLink,
      targetPath: hubAbs,
    });
  }
  if (activeTargets.has('vscode')) {
    addFsAction(
      actions,
      'vscode.copilotInstructions',
      ensureLinkedFile,
      {
        linkPath: path.join(projectAbs, '.github', 'copilot-instructions.md'),
        targetPath: exports.vscode.dest,
      }
    );
  }
  if (activeTargets.has('opencode')) {
    addFsAction(
      actions,
      'opencode.projectSkills',
      ensureLinkedDirectory,
      {
        linkPath: path.join(projectAbs, '.opencode', 'skill'),
        targetPath: hubSkills,
      }
    );
  }
  if (activeTargets.has('antigravity')) {
    addFsAction(
      actions,
      'antigravity.workspaceSkills',
      ensureLinkedDirectory,
      {
        linkPath: path.join(projectAbs, '.agent', 'skills'),
        targetPath: hubSkills,
      }
    );
    addFsAction(
      actions,
      'antigravity.workspaceRules',
      ensureLinkedDirectory,
      {
        linkPath: path.join(projectAbs, '.agent', 'rules'),
        targetPath: path.join(hubAbs, 'dist', 'exports', 'rules-md'),
      }
    );
  }
  if (activeTargets.has('claude')) {
    addFsAction(
      actions,
      'claude.workspaceSkills',
      ensureLinkedDirectory,
      {
        linkPath: path.join(projectAbs, '.claude', 'skills'),
        targetPath: hubSkills,
      }
    );
  }
}

function addInactiveProjectActions(actions, inactiveTargets, context) {
  if (inactiveTargets.size === 0) return;

  const { projectAbs, hubAbs, exports, hubSkills } = context;
  const inactiveRoot = path.join(projectAbs, '.cursor-inactive');

  if (inactiveTargets.has('vscode')) {
    addFsAction(
      actions,
      'vscode.inactiveCopy',
      ensureCopiedFile,
      {
        destPath: path.join(inactiveRoot, 'vscode', 'copilot-instructions.md'),
        sourcePath: exports.vscode.dest,
      }
    );
    ensureDir(path.join(projectAbs, '.github'));
  }
  if (inactiveTargets.has('opencode')) {
    addFsAction(
      actions,
      'opencode.inactiveCopy',
      ensureCopiedDirectory,
      {
        destPath: path.join(inactiveRoot, 'opencode', 'skill'),
        sourcePath: hubSkills,
      }
    );
    ensureDir(path.join(projectAbs, '.opencode'));
  }
  if (inactiveTargets.has('antigravity')) {
    addFsAction(
      actions,
      'antigravity.inactiveSkillsCopy',
      ensureCopiedDirectory,
      {
        destPath: path.join(inactiveRoot, 'antigravity', 'skills'),
        sourcePath: hubSkills,
      }
    );
    addFsAction(
      actions,
      'antigravity.inactiveRulesCopy',
      ensureCopiedDirectory,
      {
        destPath: path.join(inactiveRoot, 'antigravity', 'rules'),
        sourcePath: path.join(hubAbs, 'dist', 'exports', 'rules-md'),
      }
    );
    ensureDir(path.join(projectAbs, '.agent'));
  }
  if (inactiveTargets.has('claude')) {
    addFsAction(
      actions,
      'claude.inactiveCopy',
      ensureCopiedDirectory,
      {
        destPath: path.join(inactiveRoot, 'claude', 'skills'),
        sourcePath: hubSkills,
      }
    );
    ensureDir(path.join(projectAbs, '.claude'));
  }
}

function addGlobalOpencodeActions(actions, { hubAbs }) {
  const opencodeGlobalSkillRoot = getOpenCodeGlobalSkillRoot();
  if (opencodeGlobalSkillRoot === null) {
    addAction(actions, 'opencode.globalSummary', {
      skipped: true,
      reason:
        process.platform === 'win32'
          ? 'LOCALAPPDATA not set'
          : 'HOME not set (expected ~/.config/opencode/skill)',
    });
    return;
  }
  ensureDir(opencodeGlobalSkillRoot);

  const skills = discoverSkills({ hubRoot: hubAbs });
  let linked = 0;
  let skipped = 0;

  for (const skill of skills) {
    if (!isOpenCodeSkillName(skill.name)) {
      skipped++;
      continue;
    }

    addAction(
      actions,
      `opencode.globalSkill:${skill.name}`,
      ensureLinkedDirectory({
        linkPath: path.join(opencodeGlobalSkillRoot, skill.name),
        targetPath: skill.dir,
      })
    );
    linked++;
  }

  addAction(actions, 'opencode.globalSummary', {
    root: opencodeGlobalSkillRoot,
    linked,
    skipped,
  });
}

function addGlobalAntigravityActions(actions, { hubAbs, userProfile }) {
  if (userProfile === null) {
    addAction(actions, 'antigravity.globalSummary', {
      skipped: true,
      reason:
        process.platform === 'win32' ? 'USERPROFILE not set' : 'HOME not set',
    });
    return;
  }

  const agRoot = path.join(userProfile, '.gemini', 'antigravity');
  addFsAction(
    actions,
    'antigravity.globalSkills',
    ensureLinkedDirectory,
    {
      linkPath: path.join(agRoot, 'skills'),
      targetPath: path.join(hubAbs, 'skills'),
    }
  );
  addFsAction(
    actions,
    'antigravity.globalRules',
    ensureLinkedDirectory,
    {
      linkPath: path.join(agRoot, 'rules'),
      targetPath: path.join(hubAbs, 'dist', 'exports', 'rules-md'),
    }
  );
}

function addGlobalClaudeActions(actions, { hubAbs, userProfile }) {
  if (userProfile === null) {
    addAction(actions, 'claude.globalSummary', {
      skipped: true,
      reason:
        process.platform === 'win32' ? 'USERPROFILE not set' : 'HOME not set',
    });
    return;
  }

  addFsAction(
    actions,
    'claude.globalSkills',
    ensureLinkedDirectory,
    {
      linkPath: path.join(userProfile, '.claude', 'skills'),
      targetPath: path.join(hubAbs, 'skills'),
    }
  );
}

function addGlobalTargetActions(actions, enabled, context) {
  if (enabled.has('opencode')) addGlobalOpencodeActions(actions, context);
  if (enabled.has('antigravity')) addGlobalAntigravityActions(actions, context);
  if (enabled.has('claude')) addGlobalClaudeActions(actions, context);
}

export function installProject({
  hubRoot,
  projectRoot,
  targets,
  inactiveNonCursor = false,
}) {
  const projectAbs = path.resolve(projectRoot);
  const hubAbs = path.resolve(hubRoot);
  const enabled = normalizeTargets({ targets, scope: 'project' });
  assertProjectIsNotHub(projectAbs, hubAbs);

  // 1) Ensure exports exist (needed for VS Code + Antigravity rules)
  const exports = exportAll({ hubRoot: hubAbs });

  /** @type {{name: string, result: any}[]} */
  const actions = [];
  const hubSkills = path.join(hubAbs, 'skills');
  const { activeTargets, inactiveTargets } = splitProjectTargets(
    enabled,
    Boolean(inactiveNonCursor)
  );
  const context = { projectAbs, hubAbs, exports, hubSkills };

  addActiveProjectActions(actions, activeTargets, context);
  addInactiveProjectActions(actions, inactiveTargets, context);

  return {
    projectRoot: projectAbs,
    hubRoot: hubAbs,
    exports,
    targets: Array.from(enabled),
    inactiveTargets: Array.from(inactiveTargets),
    actions,
  };
}

export function installGlobal({ hubRoot, targets }) {
  const hubAbs = path.resolve(hubRoot);
  const exports = exportAll({ hubRoot: hubAbs });
  const enabled = normalizeTargets({ targets, scope: 'global' });
  const userProfile = getUserProfileDir();

  /** @type {{name: string, result: any}[]} */
  const actions = [];
  addGlobalTargetActions(actions, enabled, { hubAbs, userProfile });

  return { hubRoot: hubAbs, exports, targets: Array.from(enabled), actions };
}
