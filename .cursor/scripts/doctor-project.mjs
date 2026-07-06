import fs from 'node:fs';
import path from 'node:path';

import { auditSkillsTrust } from './audit-skills-trust.mjs';
import { describePath } from './fs-link.mjs';
import { discoverSkills, isOpenCodeSkillName } from './skill-discovery.mjs';

function resolveHubConfigPath(hubRoot, configuredPath) {
  const normalized = configuredPath.replace(/^\.cursor[\\/]/, '');
  return path.resolve(hubRoot, normalized);
}

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function hasFrontmatter(filePath) {
  if (!fs.existsSync(filePath)) return false;

  const content = fs.readFileSync(filePath, 'utf8');
  return content.startsWith('---\n') || content.startsWith('---\r\n');
}

function listMarkdownFiles(dirPath, { requireFrontmatter = false, excludeReadme = false } = {}) {
  if (!fs.existsSync(dirPath)) return [];

  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name)
    .filter((name) => !(excludeReadme && name.toLowerCase().startsWith('readme')))
    .filter((name) => !requireFrontmatter || hasFrontmatter(path.join(dirPath, name)))
    .sort((a, b) => a.localeCompare(b));
}

function validateHooksConfig(hubRoot) {
  const hooksConfigPath = path.join(hubRoot, 'hooks.json');
  const hooksDir = path.join(hubRoot, 'hooks');
  const config = describePath(hooksConfigPath);

  if (!config.exists || !config.isFile) {
    return {
      config,
      directory: describePath(hooksDir),
      entries: [],
      missingCommands: [],
      error: config.exists ? 'hooks.json is not a file' : 'hooks.json is missing',
    };
  }

  try {
    const parsed = readJsonFile(hooksConfigPath);
    const entries = Object.entries(parsed?.hooks ?? {}).flatMap(([event, definitions]) => {
      if (!Array.isArray(definitions)) return [];

      return definitions
        .filter((definition) => definition && typeof definition.command === 'string')
        .map((definition) => {
          const resolvedPath = resolveHubConfigPath(hubRoot, definition.command);
          return {
            event,
            command: definition.command,
            resolvedPath,
            exists: fs.existsSync(resolvedPath),
          };
        });
    });

    return {
      config,
      directory: describePath(hooksDir),
      entries,
      missingCommands: entries.filter((entry) => !entry.exists),
    };
  } catch (error) {
    return {
      config,
      directory: describePath(hooksDir),
      entries: [],
      missingCommands: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function buildWarnings({
  hooks,
  invalidOpenCodeNames,
  nestedCursorDirExists,
  skillsTrust,
}) {
  /** @type {string[]} */
  const warnings = [];

  if (hooks.missingCommands.length > 0) {
    warnings.push(`hooks.json references ${hooks.missingCommands.length} missing hook script(s)`);
  }
  if (hooks.error) {
    warnings.push(`hooks.json could not be parsed: ${hooks.error}`);
  }
  if (invalidOpenCodeNames.length > 0) {
    warnings.push(`${invalidOpenCodeNames.length} skill name(s) are not OpenCode-safe`);
  }
  if (nestedCursorDirExists) {
    warnings.push('Nested .cursor directory detected inside hub root');
  }
  if (skillsTrust && !skillsTrust.ok) {
    warnings.push(
      `skills trust audit failed (${skillsTrust.errors.length} blocking issue(s); run: node .cursor/scripts/audit-skills-trust.mjs)`,
    );
  }

  return warnings;
}

export function doctorProject({ hubRoot, projectRoot }) {
  const projectAbs = path.resolve(projectRoot);
  const hubAbs = path.resolve(hubRoot);
  const commandsRoot = path.join(hubAbs, 'commands');
  const agentsRoot = path.join(hubAbs, 'agents');
  const hooks = validateHooksConfig(hubAbs);
  const skills = discoverSkills({ hubRoot: hubAbs });
  const skillsTrust = auditSkillsTrust({
    hubRoot: hubAbs,
    changedOnly: false,
    repoRoot: path.dirname(hubAbs),
  });
  const invalidOpenCodeNames = skills
    .filter((skill) => !isOpenCodeSkillName(skill.name))
    .map((skill) => skill.name)
    .sort((a, b) => a.localeCompare(b));

  const checks = [
    { name: 'cursor.projectLink', path: path.join(projectAbs, '.cursor') },
    {
      name: 'vscode.copilotInstructions',
      path: path.join(projectAbs, '.github', 'copilot-instructions.md'),
    },
    {
      name: 'opencode.projectSkills',
      path: path.join(projectAbs, '.opencode', 'skill'),
    },
    {
      name: 'antigravity.workspaceSkills',
      path: path.join(projectAbs, '.agent', 'skills'),
    },
    {
      name: 'antigravity.workspaceRules',
      path: path.join(projectAbs, '.agent', 'rules'),
    },
    {
      name: 'claude.workspaceSkills',
      path: path.join(projectAbs, '.claude', 'skills'),
    },
  ];

  return {
    hubRoot: hubAbs,
    projectRoot: projectAbs,
    exports: {
      rules: describePath(path.join(hubAbs, 'dist', 'exports', 'rules-md')),
      vscode: describePath(
        path.join(hubAbs, 'dist', 'exports', 'vscode', 'copilot-instructions.md'),
      ),
    },
    hubChecks: {
      hooks,
      docs: {
        rootReadme: describePath(path.join(hubAbs, 'README.md')),
        hooksReadme: describePath(path.join(hubAbs, 'hooks', 'README.md')),
        commandsReadme: describePath(path.join(commandsRoot, 'README.md')),
        agentsReadme: describePath(path.join(agentsRoot, 'README.md')),
        skillsReadme: describePath(path.join(hubAbs, 'skills', 'README.md')),
      },
    },
    catalog: {
      commands: {
        root: describePath(commandsRoot),
        files: listMarkdownFiles(commandsRoot, {
          requireFrontmatter: true,
          excludeReadme: true,
        }),
        get count() {
          return this.files.length;
        },
      },
      agents: {
        root: describePath(agentsRoot),
        files: listMarkdownFiles(agentsRoot, { excludeReadme: true }),
        get count() {
          return this.files.length;
        },
      },
      skills: {
        root: describePath(path.join(hubAbs, 'skills')),
        count: skills.length,
        invalidOpenCodeNames,
      },
    },
    skillsTrust: {
      ok: skillsTrust.ok,
      scannedCount: skillsTrust.scannedCount,
      errorCount: skillsTrust.errors.length,
      warningCount: skillsTrust.warnings.length,
      errors: skillsTrust.errors.slice(0, 20),
      warnings: skillsTrust.warnings.slice(0, 10),
    },
    checks: checks.map((check) => ({ ...check, info: describePath(check.path) })),
    warnings: buildWarnings({
      hooks,
      invalidOpenCodeNames,
      nestedCursorDirExists: fs.existsSync(path.join(hubAbs, '.cursor')),
      skillsTrust,
    }),
  };
}
