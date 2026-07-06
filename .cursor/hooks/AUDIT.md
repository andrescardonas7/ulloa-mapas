# Hooks audit

<!-- Generated: 2026-03-27 18:13:12 UTC · Updated: 2026-04-21 reorganización Cursor -->

## Scope

Review of `.cursor/hooks.json` and scripts under `.cursor/hooks/bash/`.
Goal: keep automation active while eliminating unnecessary interruptions.

## Verdict by hook

| Hook | Purpose | Problem found | Fix applied | Status |
| ---- | ------- | ------------- | ----------- | ------ |
| `bash/after-file-edit.sh` | Format + lint + console warn after edits | Two separate hooks doubled subprocess work | Single script after merge of lint + console warn | Active |
| `bash/before-shell-guard.sh` | Block destructive shell commands | None | No change needed | Active |
| `bash/after-shell-pr.sh` | Log PR URL after `gh pr create` | Ran after every shell command (unnecessary invocations) | `matcher` on `hooks.json` limits to `gh pr create` | Active |
| `bash/stop-console-audit.sh` | Final `console.log` audit at end of agent turn | In repos without commits, scanned ALL tracked+untracked JS/TS files | Now only checks staged files when no commits exist | Active |
| `preToolUse` prompt review | Review edits before `Write`/`ApplyPatch`/`EditNotebook` | Prompt-type hooks open Cursor's hook UI before every edit, stealing focus from chat | Removed from active config; no script-level fix possible for this event type | Removed |

## Why preToolUse was the only hook removed

The other hooks write to stderr on specific conditions and produce no UI beyond that. A `preToolUse` hook with `type: "prompt"` is different: it triggers a model evaluation step inside Cursor's UI before applying the edit. That evaluation renders in the hook panel and pulls focus away from the chat. The interruption is not caused by the prompt text or the timeout; it is how Cursor processes prompt hooks. There is no silent mode for this event type.

The fallback-detection logic it provided (empty catch blocks, silent defaults masking missing config) should be enforced through linter rules or code review instead.

## What changed in the scripts

### after-file-edit.sh (formerly after-edit-lint + after-edit-console-warn)

Merged into one hook invocation: one stdin read, Prettier/ESLint conditional, then console.log warning.

### stop-console-audit.sh

Emits optional stderr line with agent `status` from stdin when present (for observability).

### after-shell-pr.sh

Behavior unchanged; selection now driven by `matcher` in `hooks.json` instead of running after every shell command.
