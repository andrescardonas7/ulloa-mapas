#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { readStdin, profileAllows } = require('./read-stdin.cjs');

const THRESHOLD = 0.55;

function hubRoot() {
  return path.resolve(__dirname, '..', '..');
}

function parseInstinctFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const front = match[1];
  const id = front.match(/^id:\s*(.+)$/m)?.[1]?.trim();
  const confidence = Number(front.match(/^confidence:\s*([\d.]+)/m)?.[1] ?? 0);
  const action =
    text.match(/## Action\r?\n([\s\S]*?)(?:\r?\n## |\r?\n---|$)/)?.[1]?.trim() ||
    text.match(/# .+\r?\n\r?\n([\s\S]+)/)?.[1]?.trim();
  if (!id || !action || confidence < THRESHOLD) return null;
  return { id, confidence, action };
}

function loadInstincts() {
  const base = path.join(hubRoot(), 'hooks', 'state', 'instincts');
  const dirs = [
    path.join(base, 'personal'),
    path.join(base, 'inherited'),
  ];
  const out = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      if (!/\.(yaml|yml|md)$/i.test(name)) continue;
      try {
        const parsed = parseInstinctFile(path.join(dir, name));
        if (parsed) out.push(parsed);
      } catch {
        // skip bad files
      }
    }
  }
  return out.sort((a, b) => b.confidence - a.confidence).slice(0, 12);
}

function buildContext(instincts) {
  if (process.env.ECC_SESSION_START_CONTEXT === 'off') return '';
  const max = Number(process.env.ECC_SESSION_START_MAX_CHARS || 4000);
  if (max === 0) return '';

  const lines = instincts.map(
    (i) => `- [${Math.round(i.confidence * 100)}%] ${i.action}`
  );
  let block = '';
  if (lines.length) {
    block = `Active instincts (project .cursor/hooks/state/instincts):\n${lines.join('\n')}`;
  } else {
    block =
      'ECC instincts: none yet. Add YAML under .cursor/hooks/state/instincts/personal/ — see skill ecc-continuous-learning.';
  }

  const summaryPath = path.join(
    hubRoot(),
    'hooks',
    'state',
    'active-session-context.md'
  );
  fs.writeFileSync(summaryPath, `${block}\n`, 'utf8');

  if (block.length > max) return `${block.slice(0, max)}\n…(truncated)`;
  return block;
}

readStdin()
  .then((raw) => {
    const env = {
      ECC_HOOK_PROFILE: process.env.ECC_HOOK_PROFILE || 'standard',
      ECC_HUB_ROOT: hubRoot(),
    };
  const instincts = profileAllows('session-start', ['standard', 'strict'])
      ? loadInstincts()
      : [];
    const additional_context = buildContext(instincts);

    const output = {
      env,
      ...(additional_context ? { additional_context } : {}),
    };
    process.stdout.write(JSON.stringify(output));
  })
  .catch(() => {
    process.stdout.write(JSON.stringify({ env: { ECC_HOOK_PROFILE: 'standard' } }));
  });
