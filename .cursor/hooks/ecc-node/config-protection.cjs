#!/usr/bin/env node
/**
 * Blocks edits to linter/formatter config files (ECC config-protection, MIT).
 * Cursor afterFileEdit: exit 2 denies the edit batch.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { readStdin, profileAllows } = require('./read-stdin.cjs');

const PROTECTED_FILES = new Set([
  '.eslintrc',
  '.eslintrc.js',
  '.eslintrc.cjs',
  '.eslintrc.json',
  '.eslintrc.yml',
  '.eslintrc.yaml',
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
  'eslint.config.ts',
  'eslint.config.mts',
  'eslint.config.cts',
  '.prettierrc',
  '.prettierrc.js',
  '.prettierrc.cjs',
  '.prettierrc.json',
  '.prettierrc.yml',
  '.prettierrc.yaml',
  'prettier.config.js',
  'prettier.config.cjs',
  'prettier.config.mjs',
  'biome.json',
  'biome.jsonc',
  '.ruff.toml',
  'ruff.toml',
  '.shellcheckrc',
  '.stylelintrc',
  '.stylelintrc.json',
  '.markdownlint.json',
  '.markdownlint.yaml',
  '.markdownlintrc',
]);

function resolveFilePath(input) {
  return input.file_path || input.path || input.file || '';
}

function configExists(filePath) {
  try {
    fs.lstatSync(filePath);
    return true;
  } catch (err) {
    return !(err && err.code === 'ENOENT');
  }
}

readStdin()
  .then((raw) => {
    if (!profileAllows('config-protection', ['standard', 'strict'])) {
      process.exit(0);
    }
    let input = {};
    try {
      input = JSON.parse(raw || '{}');
    } catch {
      process.exit(0);
    }

    const filePath = resolveFilePath(input);
    if (!filePath) {
      process.exit(0);
    }

    const basename = path.basename(filePath);
    if (PROTECTED_FILES.has(basename) && configExists(filePath)) {
      console.error(
        `[ecc] BLOCKED: editing ${basename} — fix source code instead of weakening lint/format config.`
      );
      process.exit(2);
    }

    process.exit(0);
  })
  .catch(() => process.exit(0));
