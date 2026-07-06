# MistEye Security Gate — Windows Setup (Offline Local)

This deployment is intentionally local-only.

## Install locations

- `C:\Users\zelda\.claude\skills\misteye-security-check\` (source of truth)
- `C:\Users\zelda\.cursor\skills-cursor\misteye-security-check\`
- `C:\Users\zelda\.agents\skills\misteye-security-check\`

## Behavior

- local pre-checks only
- deterministic heuristics
- high risk blocked
- medium risk asks user confirmation
- low risk continues with warning

## Mirror command

```powershell
cd C:\Users\zelda\.claude\skills\misteye-security-check
robocopy . C:\Users\zelda\.cursor\skills-cursor\misteye-security-check /MIR /XD .git
robocopy . C:\Users\zelda\.agents\skills\misteye-security-check /MIR /XD .git
```
