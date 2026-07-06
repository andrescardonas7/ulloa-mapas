#!/usr/bin/env node
'use strict';

const { readStdin, profileAllows } = require('./read-stdin.cjs');

const SECRET_PATTERNS = [
  /sk-[a-zA-Z0-9]{20,}/,
  /sk-proj-[a-zA-Z0-9_-]{20,}/,
  /ghp_[a-zA-Z0-9]{36,}/,
  /github_pat_[a-zA-Z0-9_]{20,}/,
  /glpat-[a-zA-Z0-9_-]{20,}/,
  /AKIA[A-Z0-9]{16}/,
  /xox[bpsa]-[a-zA-Z0-9-]+/,
  /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bBearer\s+[a-zA-Z0-9._-]{20,}\b/,
  /(?:api[_-]?key|secret|password|token)\s*[:=]\s*['"]?[a-zA-Z0-9_./+-]{16,}/i,
];

readStdin()
  .then((raw) => {
    const out = { continue: true };

    if (!profileAllows('before-submit-prompt', ['minimal', 'standard', 'strict'])) {
      process.stdout.write(JSON.stringify(out));
      return;
    }

    try {
      const input = JSON.parse(raw || '{}');
      const prompt = input.prompt || input.content || input.message || input.text || '';
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.test(prompt)) {
          out.continue = false;
          out.user_message =
            'Possible secret in prompt. Remove keys/tokens; use environment variables instead.';
          console.error('[ecc] Blocked prompt: possible secret detected.');
          break;
        }
      }
    } catch {
      // fail-open
    }

    process.stdout.write(JSON.stringify(out));
  })
  .catch(() => {
    process.stdout.write(JSON.stringify({ continue: true }));
  });
