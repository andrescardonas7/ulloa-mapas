/**
 * Static pattern catalog for repo-trust-scan (read-only, no network).
 * @typedef {{ id: string, severity: 'high' | 'medium' | 'low', message: string, regex: RegExp, fileFilter?: RegExp, lineFilter?: (line: string) => boolean }} TrustPattern
 */

/** @type {TrustPattern[]} */
export const CONTENT_PATTERNS = [
  {
    id: 'curl-pipe-shell',
    severity: 'high',
    message: 'Pipe from curl/wget into a shell',
    regex: /\b(curl|wget)\s+[^\n|]*\|\s*(ba)?sh\b/i,
    fileFilter: /\.(md|sh|bash|ps1|py|js|mjs|cjs|ts|tsx|yml|yaml)$/i,
    lineFilter: (line) => !isBenignSecurityDocLine(line),
  },
  {
    id: 'iwr-pipe-iex',
    severity: 'high',
    message: 'PowerShell download cradle (iwr/iex pipe)',
    regex: /\b(iwr|Invoke-WebRequest)[^\n|]*\|\s*iex\b/i,
    fileFilter: /\.(ps1|md|psm1)$/i,
    lineFilter: (line) => !isBenignSecurityDocLine(line),
  },
  {
    id: 'node-child-process-exec',
    severity: 'medium',
    message: 'child_process exec/spawn with shell (review for injection)',
    regex: /\b(child_process|execSync|exec)\s*\(/i,
    fileFilter: /\.(js|mjs|cjs|ts|tsx)$/i,
    lineFilter: (line) => !/\b(test|example|mock)\b/i.test(line) && !isBenignSecurityDocLine(line),
  },
  {
    id: 'eval-dynamic',
    severity: 'high',
    message: 'Dynamic code execution (eval / new Function)',
    regex: /\b(eval\s*\(|new\s+Function\s*\()/i,
    fileFilter: /\.(js|mjs|cjs|ts|tsx)$/i,
    lineFilter: (line) =>
      !/\b(eslint-disable|example|test)\b/i.test(line) && !isBenignSecurityDocLine(line),
  },
  {
    id: 'raw-github-dep',
    severity: 'medium',
    message: 'Dependency pinned to raw GitHub URL without integrity',
    regex: /(github\.com\/[^/\s]+\/[^/\s]+)(?:\.git)?(?:#|@)/i,
    fileFilter: /(package\.json|requirements.*\.txt|pyproject\.toml|Cargo\.toml|go\.mod)$/i,
  },
  {
    id: 'http-tarball-url',
    severity: 'medium',
    message: 'Non-HTTPS tarball or registry URL',
    regex: /["']http:\/\/[^"']+["']/i,
    fileFilter: /(package\.json|pnpm-lock\.yaml|package-lock\.json|yarn\.lock)$/i,
  },
  {
    id: 'obfuscated-payload',
    severity: 'high',
    message: 'Obfuscated payload decoded and executed (base64/charCode + eval/exec on same line)',
    regex:
      /\b(eval|exec(Sync)?|new\s+Function|child_process|spawn(Sync)?)\b[^\n]*\b(atob|Buffer\.from\s*\([^\n]*base64|String\.fromCharCode|unescape|b64decode|base64\.b64decode)\b|\b(atob|Buffer\.from\s*\([^\n]*base64|String\.fromCharCode|unescape|b64decode|base64\.b64decode)\b[^\n]*\b(eval|exec(Sync)?|new\s+Function|child_process|spawn(Sync)?)\b/i,
    fileFilter: /\.(js|mjs|cjs|ts|tsx|py)$/i,
    lineFilter: (line) =>
      !/\b(test|example|mock|spec)\b/i.test(line) && !isBenignSecurityDocLine(line),
  },
  {
    id: 'credential-exfiltration',
    severity: 'high',
    message: 'Reads credentials/secrets and sends them over the network on the same line',
    regex:
      /(process\.env|\.npmrc|\.aws[/\\]credentials|\.ssh[/\\]|id_rsa|os\.environ)[^\n]*\b(fetch|axios|https?\.request|XMLHttpRequest|net\.connect|requests\.(post|get)|urllib|curl|wget)\b|\b(fetch|axios|https?\.request|requests\.(post|get)|curl|wget)\b[^\n]*(process\.env|\.npmrc|\.aws[/\\]credentials|\.ssh[/\\]|id_rsa|os\.environ)/i,
    fileFilter: /\.(js|mjs|cjs|ts|tsx|py|sh|ps1)$/i,
    lineFilter: (line) =>
      !/\b(test|example|mock|spec)\b/i.test(line) && !isBenignSecurityDocLine(line),
  },
];

/** @type {TrustPattern[]} */
export const WORKFLOW_PATTERNS = [
  {
    id: 'pull-request-target',
    severity: 'high',
    message: 'Workflow uses pull_request_target (review secret exposure)',
    regex: /pull_request_target\s*:/i,
    fileFilter: /\.github\/workflows\/[^/]+\.ya?ml$/i,
  },
  {
    id: 'workflow-write-permission',
    severity: 'medium',
    message: 'Workflow grants write permission on contents/packages/actions',
    regex: /\b(contents|packages|actions):\s*write\b/i,
    fileFilter: /\.github\/workflows\/[^/]+\.ya?ml$/i,
  },
];

export const LIFECYCLE_SCRIPT_KEYS = new Set([
  'preinstall',
  'install',
  'postinstall',
  'prepare',
  'prepack',
  'postpack',
  'prepublishOnly',
]);

export const SKIP_DIR_NAMES = new Set([
  '.git',
  'node_modules',
  '.pnpm-store',
  'dist',
  'build',
  'vendor',
  'coverage',
  '.next',
  'out',
  'target',
  '__pycache__',
  '.venv',
  'venv',
  '.turbo',
  '.cache',
]);

/** Lines that document anti-patterns (skills, HOOKS, commands) — not executable install paths. */
export function isBenignSecurityDocLine(line) {
  const t = line.trim();
  if (/\b(avoid|never|do not|don't|prohibited|unsafe|not make|deny|block|matcher|niega)\b/i.test(t)) {
    return true;
  }
  // Detection-rule definitions (this scanner's own patterns, Semgrep/Sigma/YARA rules):
  // a `regex:`/`pattern:` field, or a JS regex literal using detection syntax, is not executable code.
  if (/^\s*(regex|pattern|message|id)\s*:/.test(t)) return true;
  if (/^\s*\/.*\\b\(.*\)\\b/.test(t) && /\[\^\\n\]/.test(t)) return true;
  if (/```/.test(t)) return true;
  if (/^#{1,6}\s/.test(t)) return true;
  if (/^\s*[-*]\s/.test(t) && /\b(curl|wget|iwr|eval)\b/i.test(t)) return true;
  if (
    /\b(example|for example|e\.g\.|documented|pattern|detects|vector|SIGMA|YARA|❌|✅|Checks:)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  if (/^\|/.test(t)) return true;
  if (/`[^`]*(curl|wget|iwr|eval)[^`]*`/i.test(t)) return true;
  if (/\b(regex:|pattern:|rg\s+|\/curl|\\b\(curl|pip\s+install)\b/i.test(t)) return true;
  return false;
}

export const SKIP_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.zip',
  '.gz',
  '.tar',
  '.pdf',
  '.exe',
  '.dll',
  '.so',
  '.dylib',
  '.wasm',
  '.lock', // lockfiles scanned separately in manifest phase
]);

export const MAX_SCAN_FILE_BYTES = 512 * 1024;
