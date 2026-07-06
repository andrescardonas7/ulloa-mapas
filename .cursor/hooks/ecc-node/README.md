# ECC-style Node hooks (opcional)

Estos scripts son el adaptador local hacia el ecosistema **everything-claude-code / ECC**: transforman el JSON de Cursor y pueden delegar en **`scripts/hooks/*.js`** en la **raíz del repositorio**.

## Dependencias

1. Copiar o enlazar el directorio **`scripts/hooks/`** (y si aplica **`scripts/lib/`**, p. ej. `shell-split`) desde un proyecto ECC completo, **o** implementar esos módulos en tu repo.
2. Sin ese árbol, los hooks que llaman a `runExistingHook()` no ejecutan la segunda fase (formato, typecheck, sesión, etc.), aunque los que solo hacen logging sí pueden funcionar.

## Activación

1. Copia **`hooks.config.example.json`** sobre **`.cursor/hooks.json`** (sustituye la configuración solo-Bash), **o** fusiona entradas a mano.
2. Ajusta variables de entorno opcionales: `ECC_HOOK_PROFILE`, `ECC_DISABLED_HOOKS`.

## Rutas

- Comandos registrados usan: `node .cursor/hooks/ecc-node/<script>.js`
- `adapter.js` resuelve la raíz del repo con tres niveles desde `ecc-node/` (`.cursor/hooks/ecc-node` → raíz del proyecto).
