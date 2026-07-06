# Actualizar skills de Trail of Bits (Cursor)

Los skills del repo [trailofbits/skills](https://github.com/trailofbits/skills) viven en **`vendor/trailofbits-skills`** (submódulo Git). La copia que usa Cursor está en **`.cursor/skills/`**, generada con el script de sincronización (estructura plana).

## Cuando quieras traer la última versión

En PowerShell, desde la raíz del repo **`RULES`** (donde están `vendor/` y `.cursor/`):

```powershell
cd "C:\Users\zelda\Documents\ESTUDIO PROGRAMACION\RULES"

# 1) Actualizar el submódulo (código oficial)
git submodule update --init vendor/trailofbits-skills
git -C vendor/trailofbits-skills pull origin main

# 2) Volver a copiar skills al layout de Cursor
node .cursor/scripts/sync-trailofbits-skills.mjs
# Vista previa sin escribir archivos:
#   node .cursor/scripts/sync-trailofbits-skills.mjs --dry-run
# (desde la carpeta .cursor: npm run sync:trailofbits | npm run sync:trailofbits:dry)
```

Si clonaste el repo sin submódulos (`git clone` sin `--recurse-submodules`):

```powershell
git submodule update --init --recursive
```

## Qué hace el script

- Lee `vendor/trailofbits-skills/plugins/*/skills/*/`.
- Copia cada carpeta de skill a `.cursor/skills/<nombre>/` (sobrescribe solo esas carpetas).
- **No borra** skills tuyos que no vienen de Trail of Bits (`backend-patterns`, `pdf`, `humanizer`, etc.).
- Si hubo duplicado de nombre entre plugins, gana el plugin que ordena antes alfabéticamente (caso raro); el script **avisa por consola** con `skipped` vs `kept`.
- Tras un sync real (no `--dry-run`), escribe **`.cursor/skills/.sync-manifest.json`** con fecha, conteo y lista de skills copiados (trazabilidad).

## Archivos

| Ruta | Rol |
|------|-----|
| `vendor/trailofbits-skills/` | Submódulo; aquí haces `git pull` |
| `.cursor/scripts/sync-trailofbits-skills.mjs` | Sincroniza hacia `.cursor/skills/` |

## Primera vez en otra máquina

```powershell
git clone --recurse-submodules <url-de-tu-repo>
# o tras clone normal:
git submodule update --init --recursive
node .cursor/scripts/sync-trailofbits-skills.mjs
```
