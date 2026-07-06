#!/usr/bin/env node
/**
 * Report size of always-on vs large intelligent-apply rules (context budget).
 * Run from repo root: node .cursor/scripts/audit-rules-context.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rulesDir = path.join(__dirname, '..', 'rules');
const repoRoot = path.join(__dirname, '..', '..');

function readFileStats(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/).length;
  return { lines, chars: raw.length };
}

function listMdcFiles(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listMdcFiles(p));
    else if (ent.name.endsWith('.mdc')) out.push(p);
  }
  return out;
}

function isAlwaysApply(filePath) {
  const head = fs.readFileSync(filePath, 'utf8').slice(0, 800);
  return /alwaysApply:\s*true/.test(head);
}

function rel(p) {
  return path.relative(rulesDir, p).replace(/\\/g, '/');
}

const files = listMdcFiles(rulesDir);
const alwaysOn = [];
const intelligentHeavy = [
  '00-agent-behavior/cursor-agent-orchestration.mdc',
  '00-agent-behavior/human.mdc',
];

for (const f of files) {
  if (!isAlwaysApply(f)) continue;
  const s = readFileStats(f);
  alwaysOn.push({ rel: rel(f), ...s });
}

alwaysOn.sort((a, b) => b.chars - a.chars);

let totalLines = 0;
let totalChars = 0;
for (const r of alwaysOn) {
  totalLines += r.lines;
  totalChars += r.chars;
}

console.log('=== Always-on rules (.mdc, alwaysApply: true) ===\n');
for (const r of alwaysOn) {
  console.log(`${r.rel.padEnd(48)} ${String(r.lines).padStart(5)} lines  ${String(r.chars).padStart(7)} chars`);
}
console.log(`${'TOTAL'.padEnd(48)} ${String(totalLines).padStart(5)} lines  ${String(totalChars).padStart(7)} chars`);

const agentsMd = path.join(repoRoot, 'AGENTS.md');
if (fs.existsSync(agentsMd)) {
  const a = readFileStats(agentsMd);
  console.log(`\nAGENTS.md (repo root, often injected)     ${String(a.lines).padStart(5)} lines  ${String(a.chars).padStart(7)} chars`);
  console.log(`Combined hub baseline (mdc + AGENTS.md)  ${String(totalLines + a.lines).padStart(5)} lines  ${String(totalChars + a.chars).padStart(7)} chars`);
}

console.log('\n=== Removed from every chat (apply intelligently) ===\n');
let savedLines = 0;
let savedChars = 0;
for (const name of intelligentHeavy) {
  const p = path.join(rulesDir, ...name.split('/'));
  if (!fs.existsSync(p)) continue;
  const s = readFileStats(p);
  savedLines += s.lines;
  savedChars += s.chars;
  console.log(`${name.padEnd(48)} ${String(s.lines).padStart(5)} lines  ${String(s.chars).padStart(7)} chars`);
}
console.log(`${'Not injected every turn (approx. savings)'.padEnd(48)} ${String(savedLines).padStart(5)} lines  ${String(savedChars).padStart(7)} chars`);

console.log(
  '\nNote: Cursor also injects User Rules (global settings), workspace rules, and plugins — not counted here.',
);
