'use strict';

const MAX_STDIN = 1024 * 1024;
const STDIN_TIMEOUT_MS = 1500;

function readStdin() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      resolve('{}');
      return;
    }

    let data = '';
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      resolve(value || '{}');
    };

    const timer = setTimeout(() => finish(data), STDIN_TIMEOUT_MS);

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      if (data.length < MAX_STDIN) {
        data += chunk.substring(0, MAX_STDIN - data.length);
      }
    });
    process.stdin.on('end', () => {
      clearTimeout(timer);
      finish(data);
    });
    process.stdin.on('error', () => {
      clearTimeout(timer);
      finish('{}');
    });
  });
}

function hookProfile() {
  const raw = String(process.env.ECC_HOOK_PROFILE || 'standard').toLowerCase();
  return ['minimal', 'standard', 'strict'].includes(raw) ? raw : 'standard';
}

function hookDisabled(hookId) {
  const disabled = new Set(
    String(process.env.ECC_DISABLED_HOOKS || '')
      .split(',')
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean)
  );
  return disabled.has(String(hookId || '').toLowerCase());
}

function profileAllows(hookId, allowed = ['standard', 'strict']) {
  if (hookDisabled(hookId)) return false;
  return allowed.includes(hookProfile());
}

module.exports = { readStdin, hookProfile, hookDisabled, profileAllows };
