'use strict';

const MAX_HEAD = 65536;
const HEAD_TIMEOUT_MS = 250;

function readStdinHead() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      resolve('');
      return;
    }

    let data = '';
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve(data);
    };

    const timer = setTimeout(finish, HEAD_TIMEOUT_MS);

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      if (data.length < MAX_HEAD) {
        data += chunk.slice(0, MAX_HEAD - data.length);
      }
      if (data.length >= MAX_HEAD) {
        clearTimeout(timer);
        finish();
      }
    });
    process.stdin.on('end', () => {
      clearTimeout(timer);
      finish();
    });
    process.stdin.on('error', () => {
      clearTimeout(timer);
      finish();
    });
    if (typeof process.stdin.resume === 'function') {
      process.stdin.resume();
    }
  });
}

function extractFilePath(raw) {
  if (!raw) return '';
  const m = raw.match(/"file_path"\s*:\s*"((?:\\.|[^"\\])*)"/);
  if (m) {
    try {
      return JSON.parse(`"${m[1]}"`);
    } catch {
      return m[1];
    }
  }
  try {
    const input = JSON.parse(raw);
    return input.file_path || input.path || input.file || '';
  } catch {
    return '';
  }
}

module.exports = { readStdinHead, extractFilePath };
