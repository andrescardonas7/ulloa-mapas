# Scripts (`.cursor/scripts`)

Documentación de los scripts del hub: **por qué existen** y **qué es importante** saber.

---

## 1. Razón de ser de estos scripts

Este repositorio (`cursor-workspace`) es un **hub central para Cursor**: reglas, skills, hooks y comandos bajo `.cursor/`. El instalador puede generar exports locales para otros editores; **`.github/` (Copilot) y `.opencode/` no se suben a GitHub** (`.gitignore` en la raíz).

**Problema que resuelven:** Sin estos scripts tendrías que copiar o mantener a mano la misma configuración en cada proyecto y en cada herramienta. Eso genera duplicados, desincronización y trabajo repetitivo.

**Qué hacen en concreto:**

| Objetivo                                                     | Cómo lo resuelven los scripts                                                                                                                      |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Un solo lugar** donde editar reglas y skills               | El hub vive en `RULES/.cursor`. Los proyectos no copian archivos; se **enlazan** a este directorio (symlink/junction) o reciben exports.           |
| **Cursor en proyectos**                                      | `cursor-hub install --targets cursor` enlaza `project/.cursor` a este hub.                                                                          |
| **Otros editores (opcional, local)**                         | Targets `vscode`, `claude`, etc. generan `.github/`, `.opencode/`, … **solo en disco**; no forman parte de este repo en GitHub.                      |
| **Formatos distintos** (Cursor usa `.mdc`, otros `.md`)     | `export` escribe en `dist/exports/` (p. ej. Markdown plano, copilot-instructions) si usas targets no-Cursor.                                         |
| **Comprobar** que un proyecto está bien enlazado             | El comando `doctor` describe enlaces y exports sin modificar nada.                                                                                 |
| **Auditar skills** (layout plano + confianza)                | `pnpm audit:skills` (todo), `pnpm audit:skills:hub-local`, `pnpm audit:skills:changed` desde `.cursor/`.                                              |
| **Medir contexto** de reglas always-on vs intelligent-apply  | `node scripts/audit-rules-context.mjs` — líneas/chars de `.mdc` + `AGENTS.md`; ver también `rules/README.md` (Context budget).                    |

En resumen: **exportar** (convertir y generar archivos) e **instalar** (enlazar o copiar ese resultado en proyectos o en el perfil global) para que todas las herramientas usen la misma base de reglas y skills sin duplicar manualmente.

---

## 2. Qué es importante (resumen)

### 2.1 Orden típico de uso

1. **Editas** reglas o skills en `RULES/.cursor` (p. ej. `rules/`, `skills/`).
2. **Exportas** para que existan los `.md` y el archivo de VS Code:
   `node scripts/cursor-hub.mjs export`
3. **Instalas** en un proyecto o global:
   `node scripts/cursor-hub.mjs install --project "C:\ruta\al\proyecto" --targets cursor,vscode`
   o usas `./setup.sh` para hacer export + install con buenos valores por defecto.

### 2.2 Cuándo usar qué

| Quieres…                                                                    | Usa                                                                            |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Un solo comando: export + instalar en el proyecto padre con cursor + vscode | `./setup.sh` o `./setup.sh --project "ruta"`                                   |
| Solo exportar (regenerar `dist/exports/`)                                   | `node scripts/cursor-hub.mjs export`                                           |
| Instalar en un proyecto con targets concretos                               | `node scripts/cursor-hub.mjs install --project "ruta" --targets cursor,vscode` |
| Instalar en todos los targets de proyecto                                   | `node scripts/cursor-hub.mjs install --project "ruta" --all`                   |
| Instalar en perfil global (opencode, antigravity, claude)                   | `node scripts/cursor-hub.mjs install --global`                                 |
| Ver estado de enlaces y exports sin cambiar nada                            | `node scripts/cursor-hub.mjs doctor --project "ruta"` (incluye **skills trust audit**) |
| Escanear un repo clonado/desconocido **antes del primer install** (solo lectura) | `node scripts/repo-trust-scan.mjs --target "ruta"` o `cursor-hub trust-scan --project "ruta"` |
| Ejecutar sin estar en el hub (desde cualquier carpeta)                      | `npx "C:\...\RULES\.cursor" export` (y lo mismo para `install` / `doctor`)     |

**Nota:** `setup.sh` requiere Bash (Linux, macOS o Git Bash en Windows). En Windows sin Bash, usa `cursor-hub` con `node` o `npx`.

### 2.3 Targets

- **Proyecto:** `cursor`, `vscode`, `opencode`, `antigravity`, `claude`. Por defecto solo `cursor,vscode`. Con `--all`, los que no son Cursor quedan inactivos (copia en `.cursor-inactive/`) salvo que pongas `--active-non-cursor`.
- **Global:** `opencode`, `antigravity`, `claude` (rutas en `%LOCALAPPDATA%`, `%USERPROFILE%\.gemini`, `%USERPROFILE%\.claude`).

---

## 3. Qué hace cada script (referencia)

| Script                  | Responsabilidad                                                                                                                                                                                       |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **cursor-hub.mjs**      | Entrada CLI: comandos `export`, `install`, `doctor`, `trust-scan`; parseo de argumentos y delegación al instalador.                                                                                  |
| **repo-trust-scan.mjs** | Escaneo opt-in de confianza en repos clonados (patrones + manifests; modo `full` con gitleaks/trivy/osv si están en PATH). Fail-open; `--strict` solo en CI.                                           |
| **repo-trust-patterns.mjs** | Catálogo de patrones estáticos usado por `repo-trust-scan.mjs`.                                                                                                                                   |
| **installer.mjs**       | Lógica de instalación: `installProject`, `installGlobal`, `exportAll`, `doctorProject`. Usa `fs-link.mjs` y `mdc-to-md.mjs`.                                                                          |
| **fs-link.mjs**         | Crear enlaces (junction en Windows, symlink donde se pueda) y, si falla, copiar. Funciones: `ensureLinkedDirectory`, `ensureLinkedFile`, `ensureCopiedDirectory`, `ensureCopiedFile`, `describePath`. |
| **mdc-to-md.mjs**       | Exportar reglas `.mdc` a Markdown en `dist/exports/rules-md/` y generar `dist/exports/vscode/copilot-instructions.md` para VS Code.                                                                   |
| **skill-discovery.mjs** | Descubrir skills en `skills/` (p. ej. para OpenCode): detectar `SKILL.md`, filtrar por nombre válido OpenCode.                                                                                        |

`setup.sh` (en la raíz de `.cursor`) ejecuta `cursor-hub` con argumentos por defecto: primero `export`, luego `install` para el proyecto.

---

## 4. Cómo ejecutarlos

Desde la raíz del hub (la carpeta que contiene `scripts/` y `package.json`):

```bash
node scripts/cursor-hub.mjs export
node scripts/cursor-hub.mjs install --project "C:\path\to\app" --targets cursor,vscode
node scripts/cursor-hub.mjs install --global
node scripts/cursor-hub.mjs doctor --project "C:\path\to\app"
node scripts/repo-trust-scan.mjs --target "C:\path\to\cloned-repo" --mode quick
node scripts/cursor-hub.mjs trust-scan --project "C:\path\to\cloned-repo" --mode full
```

Con `npx` (desde cualquier directorio):

```bash
npx "C:\...\RULES\.cursor" export
npx "C:\...\RULES\.cursor" install --project "C:\path\to\app" --targets cursor,vscode
```

Ayuda del CLI:

```bash
node scripts/cursor-hub.mjs --help
```

---

## 5. Dónde seguir leyendo

- **Visión general del hub:** [.cursor/README.md](../README.md)
- **Guía de instalación (español):** [.cursor/GUIA-INSTALACION.md](../GUIA-INSTALACION.md) — cuándo usar `setup.sh` vs `cursor-hub`, `node` vs `npx`, y todos los escenarios.
