# Cursor hooks

Configuración activa: **`.cursor/hooks.json`** en la raíz de `.cursor`.

- **Contrato para Cursor y agentes:** [../HOOKS.md](../HOOKS.md) (stdin, matchers, opciones).
- **Instrucciones repo:** [../../AGENTS.md](../../AGENTS.md).

Documentación oficial: [Cursor Hooks](https://cursor.com/docs/agent/hooks).

---

## Estructura

```text
.cursor/
├── hooks.json
├── HOOKS.md                 ← Contrato técnico (léelo antes de tocar hooks)
└── hooks/
    ├── README.md            ← Este archivo
    ├── AUDIT.md
    ├── bash/                ← Hooks registrados (un proceso por evento donde aplica)
    │   ├── after-file-edit.sh
    │   ├── before-shell-guard.sh
    │   ├── after-shell-pr.sh
    │   └── stop-console-audit.sh
    └── ecc-node/            ← Opcional (ECC); ver ecc-node/README.md
```

---

## Pipeline registrado

| Evento | Script | Notas |
|--------|--------|--------|
| `afterFileEdit` | `bash/after-file-edit.sh` | Un solo hook: formato + aviso `console.log` |
| `beforeShellExecution` | `bash/before-shell-guard.sh` | Con `matcher` (solo comandos de riesgo) |
| `afterShellExecution` | `bash/after-shell-pr.sh` | Con `matcher` `gh\\s+pr\\s+create` |
| `stop` | `bash/stop-console-audit.sh` | Audit final + `status` en stderr si viene en stdin |

---

## Requisitos

`bash`, **`git`**, y **`npx`** cuando el proyecto tenga Prettier/ESLint. **`jq`** es opcional (los scripts usan `python` o `sed` como respaldo vía `bash/lib/hook-io.sh`).

Variable opcional: **`CURSOR_PROJECT_DIR`**.

---

## Opcional: pila Node (`ecc-node/`)

Ver **`ecc-node/README.md`** y **`ecc-node/hooks.config.example.json`**. No sustituye a `hooks.json` salvo que lo copies explícitamente.
