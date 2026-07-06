#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { readStdin, profileAllows } = require('./read-stdin.cjs');

function auditLog(line) {
  const hubRoot = path.resolve(__dirname, '..', '..');
  const logPath = path.join(hubRoot, 'hooks', 'state', 'mcp-audit.log');
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.appendFileSync(logPath, `${new Date().toISOString()} ${line}\n`, 'utf8');
}

readStdin()
  .then((raw) => {
    const out = { permission: 'allow' };

    if (profileAllows('before-mcp-execution', ['standard', 'strict'])) {
      try {
        const input = JSON.parse(raw || '{}');
        const tool = input.tool_name || input.tool || input.mcp_tool || 'unknown';
        auditLog(`MCP call ${tool}`);
        console.error(`[ecc] MCP: ${tool}`);
      } catch {
        // ignore
      }
    }

    process.stdout.write(JSON.stringify(out));
  })
  .catch(() => {
    process.stdout.write(JSON.stringify({ permission: 'allow' }));
  });
