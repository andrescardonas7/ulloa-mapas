/**
 * Hub skill block patterns — high-signal subset aligned with NVIDIA SkillSpector categories.
 * Full coverage (64 patterns, AST, taint, YARA, OSV SC4): skills-trust-deep-scan.mjs + CI deep-audit.
 * Pin: skillspector-pin.mjs (v2.1.3). Static rules only here — no runtime Python dependency.
 * @see https://github.com/NVIDIA/SkillSpector
 *
 * @typedef {'error' | 'warn'} BlockLevel
 * @typedef {{
 *   id: string;
 *   category: string;
 *   regex: RegExp;
 *   fileGlob: RegExp;
 *   level?: BlockLevel;
 *   skillMdOnly?: boolean;
 *   lineFilter?: (line: string) => boolean;
 * }} BlockRule
 */

import {
    isBenignCurlPipeBashMention,
    isBenignEnvAccess,
    isBenignForensicArtifactMention,
    isBenignInjectionExample,
    isNegatedSecurityMention,
} from './skills-trust-shared.mjs';

const SCRIPT_GLOB = /\.(py|sh|js|mjs|ps1)$/i;
const MARKDOWN_GLOB = /\.md$/i;
const ALL_SCAN_GLOB = /\.(md|sh|py|js|mjs|ps1|json|ya?ml)$/i;

/** @type {BlockRule[]} */
export const BLOCK_RULES = [
  // --- Supply chain (SC) ---
  {
    id: 'curl-pipe-bash',
    category: 'SC2',
    regex: /curl\s+[^\n|]*\|\s*(ba)?sh\b/i,
    fileGlob: ALL_SCAN_GLOB,
    lineFilter: (line) => !isBenignCurlPipeBashMention(line),
  },
  {
    id: 'wget-pipe-shell',
    category: 'SC2',
    regex: /wget\s+[^\n|]*\|\s*(ba)?sh\b/i,
    fileGlob: ALL_SCAN_GLOB,
    lineFilter: (line) => !isBenignCurlPipeBashMention(line),
  },
  {
    id: 'base64-decode-exec',
    category: 'SC3',
    regex: /base64\.(b64decode|decode)|atob\s*\(|Buffer\.from\([^,]+,\s*['"]base64['"]\)/i,
    fileGlob: SCRIPT_GLOB,
    level: 'warn',
    lineFilter: (line) =>
      !isNegatedSecurityMention(line) &&
      /\b(exec|eval|subprocess|spawn|Function)\b/i.test(line),
  },

  // --- Prompt injection (P) ---
  {
    id: 'inject-ignore-instructions',
    category: 'P1',
    regex: /\b(ignore|disregard)\s+(all\s+)?(previous\s+)?instructions\b/i,
    fileGlob: MARKDOWN_GLOB,
    lineFilter: (line) => !isBenignInjectionExample(line),
  },
  {
    id: 'ignore-safety-constraints',
    category: 'P1',
    regex:
      /\b(ignore|disregard|forget)\s+(all\s+)?(safety|security|system)\s+(rules|instructions|constraints|policies)\b/i,
    fileGlob: /^SKILL\.md$/i,
    lineFilter: (line) => !isBenignInjectionExample(line),
  },
  {
    id: 'jailbreak-directive',
    category: 'P1',
    regex:
      /\b(you are now in (developer|god|unrestricted) mode|enter\s+developer\s+mode\s+with\s+no\s+restrictions|\bDAN\b\s+mode)\b/i,
    fileGlob: /^SKILL\.md$/i,
    lineFilter: (line) => !isBenignInjectionExample(line),
  },
  {
    id: 'hidden-system-prompt-exfil',
    category: 'P6',
    regex:
      /\b(reveal|print|output|dump|send)\s+(the\s+)?(system\s+prompt|hidden\s+instructions|internal\s+rules)\b/i,
    fileGlob: /^SKILL\.md$/i,
    lineFilter: (line) => !isBenignInjectionExample(line),
  },

  // --- Data exfiltration (E) ---
  {
    id: 'discord-webhook',
    category: 'E1',
    regex: /discord(app)?\.com\/api\/webhooks\//i,
    fileGlob: ALL_SCAN_GLOB,
    lineFilter: (line) => !isNegatedSecurityMention(line),
  },
  {
    id: 'telegram-bot-exfil',
    category: 'E1',
    regex: /api\.telegram\.org\/bot/i,
    fileGlob: ALL_SCAN_GLOB,
    lineFilter: (line) => !isNegatedSecurityMention(line),
  },
  {
    id: 'pastebin-exfil',
    category: 'E1',
    regex: /pastebin\.com\/(raw\/)?[a-zA-Z0-9]+/i,
    fileGlob: ALL_SCAN_GLOB,
    lineFilter: (line) => !isNegatedSecurityMention(line),
  },
  {
    id: 'env-enumeration-exfil',
    category: 'E2',
    regex: /\b(os\.environ\.items|os\.environ\.keys|process\.env)\b.*\b(forEach|entries|post|send|fetch|request)/i,
    fileGlob: SCRIPT_GLOB,
    level: 'warn',
    lineFilter: (line) => !isBenignEnvAccess(line),
  },
  {
    id: 'env-harvest-loop',
    category: 'E2',
    regex: /for\s+\w+\s*,\s*\w+\s+in\s+os\.environ\.items\s*\(/i,
    fileGlob: /\.py$/i,
    level: 'warn',
    lineFilter: (line) => !isBenignEnvAccess(line),
  },
  {
    id: 'context-leak-instruction',
    category: 'E4',
    regex:
      /\b(send|post|upload|transmit)\s+(the\s+)?(full\s+)?(conversation|chat\s+history|context|transcript)\s+(to|via)\b/i,
    fileGlob: MARKDOWN_GLOB,
    lineFilter: (line) => !isBenignInjectionExample(line),
  },

  // --- Privilege / destructive (PE) ---
  {
    id: 'rm-rf-root',
    category: 'PE2',
    regex: /rm\s+-rf\s+\/(?!\w)/i,
    fileGlob: ALL_SCAN_GLOB,
    lineFilter: (line) =>
      !/\/var\/lib\/apt|apt\/lists|\/path\/to\/|tmp|cache|build/i.test(line),
  },
  {
    id: 'ssh-private-key-access',
    category: 'PE3',
    regex: /\.ssh\/(id_rsa|id_ed25519|id_ecdsa)|authorized_keys/i,
    fileGlob: ALL_SCAN_GLOB,
    lineFilter: (line) =>
      !isNegatedSecurityMention(line) &&
      !isBenignInjectionExample(line) &&
      !isBenignForensicArtifactMention(line),
  },

  // --- Behavioral AST (executable scripts) ---
  {
    id: 'py-exec-call',
    category: 'AST1',
    regex: /\bexec\s*\(/,
    fileGlob: /\.py$/i,
    level: 'warn',
    lineFilter: (line) => !isBenignInjectionExample(line),
  },
  {
    id: 'py-eval-call',
    category: 'AST2',
    regex: /\beval\s*\(/,
    fileGlob: /\.py$/i,
    level: 'warn',
    lineFilter: (line) => !isBenignInjectionExample(line),
  },
  {
    id: 'py-subprocess-shell-true',
    category: 'AST4',
    regex: /subprocess\.(run|call|Popen)\([^)]*shell\s*=\s*True/i,
    fileGlob: /\.py$/i,
    level: 'warn',
    lineFilter: (line) => !isBenignInjectionExample(line),
  },
  {
    id: 'js-child-process-exec',
    category: 'AST4',
    regex: /\b(child_process\.)?(exec|execSync|spawn)\s*\(/,
    fileGlob: /\.(js|mjs)$/i,
    level: 'warn',
    lineFilter: (line) => !isBenignInjectionExample(line),
  },

  // --- Trigger abuse (TR) ---
  {
    id: 'always-invoke-skill',
    category: 'TR2',
    regex: /\b(always|must|every\s+time)\s+(use|invoke|run|load)\s+this\s+skill\b/i,
    fileGlob: /^SKILL\.md$/i,
    lineFilter: (line) => !isBenignInjectionExample(line),
  },

  // --- MCP (LP) ---
  {
    id: 'mcp-wildcard-permission',
    category: 'LP2',
    regex: /permissions?\s*:\s*\[?\s*['"]?\*['"]?/i,
    fileGlob: /\.(md|json|ya?ml)$/i,
    level: 'warn',
    lineFilter: (line) => !isNegatedSecurityMention(line),
  },

  // --- MCP tool poisoning hints (TP) ---
  {
    id: 'zero-width-chars',
    category: 'TP2',
    regex: /[\u200B-\u200D\uFEFF]/,
    fileGlob: MARKDOWN_GLOB,
    level: 'warn',
  },
];
