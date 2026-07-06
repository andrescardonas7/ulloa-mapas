import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HOOKS_CONFIG_PATH = path.join('.cursor', 'hooks.json');

function runGit(args, cwd) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || 'git command failed').trim());
  }

  return result.stdout.trim();
}

function parseJsonFile(absPath) {
  const contents = fs.readFileSync(absPath, 'utf8');
  JSON.parse(contents);
}

function validateHooksConfig(repoRoot) {
  const absPath = path.join(repoRoot, HOOKS_CONFIG_PATH);
  const parsed = JSON.parse(fs.readFileSync(absPath, 'utf8'));
  const definitions = Object.values(parsed?.hooks ?? {}).flatMap((entry) =>
    Array.isArray(entry) ? entry : [],
  );

  /** @type {string[]} */
  const missingCommands = [];

  for (const definition of definitions) {
    if (!definition || typeof definition.command !== 'string') {
      continue;
    }

    const resolvedPath = path.resolve(repoRoot, definition.command);
    if (!fs.existsSync(resolvedPath)) {
      missingCommands.push(definition.command);
    }
  }

  if (missingCommands.length > 0) {
    throw new Error(
      `hooks.json references missing hook scripts: ${missingCommands.join(', ')}`,
    );
  }
}

function checkShellSyntax(absPath, problems) {
  const result = spawnSync('sh', ['-n', absPath], {
    encoding: 'utf8',
  });

  if (result.error && result.error.code === 'ENOENT') {
    return;
  }

  if (result.status !== 0) {
    problems.push(
      `${absPath}: shell syntax check failed\n${(result.stderr || result.stdout || '').trim()}`,
    );
  }
}

function main() {
  const repoRoot = process.cwd();
  const stagedOutput = runGit(['diff', '--cached', '--name-only', '--diff-filter=ACMR'], repoRoot);
  const stagedFiles = stagedOutput.split(/\r?\n/).filter(Boolean);

  if (stagedFiles.length === 0) {
    process.exit(0);
  }

  /** @type {string[]} */
  const problems = [];

  for (const relativePath of stagedFiles) {
    const absPath = path.join(repoRoot, relativePath);
    if (!fs.existsSync(absPath) || !fs.statSync(absPath).isFile()) {
      continue;
    }

    if (relativePath.endsWith('.json')) {
      try {
        parseJsonFile(absPath);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        problems.push(`${relativePath}: invalid JSON (${message})`);
      }
    }

    if (relativePath.endsWith('.sh')) {
      checkShellSyntax(absPath, problems);
    }
  }

  const hooksFilesTouched = stagedFiles.some(
    (relativePath) =>
      relativePath === HOOKS_CONFIG_PATH || relativePath.startsWith('.cursor/hooks/'),
  );

  if (hooksFilesTouched) {
    try {
      validateHooksConfig(repoRoot);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      problems.push(message);
    }
  }

  const skillsTouched = stagedFiles.some((relativePath) =>
    relativePath.startsWith('.cursor/skills/'),
  );

  if (skillsTouched) {
    const auditScript = path.join(__dirname, 'audit-skills-trust.mjs');
    const audit = spawnSync(process.execPath, [auditScript, '--staged-only'], {
      cwd: repoRoot,
      encoding: 'utf8',
    });
    if (audit.status !== 0) {
      problems.push(
        `skill trust audit failed (run: node .cursor/scripts/audit-skills-trust.mjs --staged-only)\n${(audit.stderr || audit.stdout || '').trim()}`,
      );
    }
  }

  if (problems.length > 0) {
    console.error('Pre-commit checks failed:\n');
    for (const problem of problems) {
      console.error(`- ${problem}`);
    }
    process.exit(1);
  }

  console.log('Pre-commit checks passed.');
}

main();
