#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { readStdin, profileAllows } = require('./read-stdin.cjs');

readStdin()
  .then((raw) => {
    if (!profileAllows('session-end', ['standard', 'strict'])) {
      return;
    }
    const hubRoot = path.resolve(__dirname, '..', '..');
    const statePath = path.join(hubRoot, 'hooks', 'state', 'continual-learning.json');
    const summariesDir = path.join(hubRoot, 'hooks', 'state', 'session-summaries');

    let sessionId = 'unknown';
    try {
      const input = JSON.parse(raw || '{}');
      sessionId = input.session_id || input.conversation_id || sessionId;
    } catch {
      // ignore
    }

    fs.mkdirSync(summariesDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.writeFileSync(
      path.join(summariesDir, `${stamp}-${sessionId}.json`),
      JSON.stringify({ endedAt: new Date().toISOString(), sessionId }, null, 2),
      'utf8'
    );

    let state = { version: 1, lastRunAtMs: Date.now(), sessions: [] };
    if (fs.existsSync(statePath)) {
      try {
        state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
      } catch {
        // reset
      }
    }
    state.lastRunAtMs = Date.now();
    state.lastSessionId = sessionId;
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf8');
  })
  .catch(() => process.exit(0));
