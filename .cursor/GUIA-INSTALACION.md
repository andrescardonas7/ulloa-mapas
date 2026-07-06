# Guía de instalación — Cursor Hub

Guía para saber **qué comando usar** y **cuándo**, sin duplicar skills ni rules entre editores.

---

## 1. ¿Qué herramienta uso: `setup.sh` o `cursor-hub`?

| Quiero                                                                           | Usar                                    |
| -------------------------------------------------------------------------------- | --------------------------------------- |
| **Un solo comando** que exporte + instale en el proyecto con buenos valores por defecto | `setup.sh`                              |
| **Elegir exactamente** targets, modo inactivo o solo export/global                | `node scripts/cursor-hub.mjs` o `npx`   |

- **`setup.sh`**: atajo que llama por detrás a `cursor-hub`. Hace `export` + `install --project` con `cursor,vscode` por defecto, placeholders y (con `--all`) modo inactivo.
  - Requiere **bash** (Linux, macOS, Git Bash en Windows). En Windows sin bash, usa `cursor-hub` con `node` o `npx`.

- **`cursor-hub`** (vía `node scripts/cursor-hub.mjs` o `npx`): control total. Export, install por proyecto, install global, doctor.
  - Usa esto cuando quieras `--targets`, `--all`, `--inactive-non-cursor`, `--active-non-cursor`, o solo `export` / `install --global`.

---

## 2. ¿`node` o `npx`?

| Forma                            | Cuándo usarla                                                                                  |
| -------------------------------- | ---------------------------------------------------------------------------------------------- |
| **`node scripts/cursor-hub.mjs`** | Estás **dentro** de la carpeta `.cursor`. Ej.: `cd "…\RULES\.cursor"` y luego `node scripts/…`. |
| **`npx "C:\...\RULES\.cursor"`**  | Ejecutar **desde cualquier carpeta** sin `cd` al hub. La ruta = carpeta del hub.               |
| **`npx .`**                       | Igual, **desde dentro** de `.cursor`: `npx . install --project "RUTA"`.                        |

Las dos hacen lo mismo; `node` es más directo si ya estás en `.cursor`, `npx` es más cómodo si invocas desde otra ruta. **En esta guía se usan ambas**; elige la que te resulte más simple.

En ambos casos se usa el código de tu carpeta `.cursor`; **npx con ruta local no descarga nada de npm** (el paquete no tiene que estar publicado).

---

## 3. Dónde está el hub y dónde el proyecto

- **Hub** (`RUTA_HUB`): la carpeta que tiene `package.json`, `scripts/cursor-hub.mjs`, `rules/`, `skills/`, etc. Por ejemplo:
  `C:\Users\tu-usuario\ruta\al\.cursor`
- **Proyecto** (`RUTA_PROYECTO`): la carpeta donde quieres que se creen `.cursor`, `.github`, etc. Por ejemplo:
  `C:\Users\tu-usuario\proyectos\mi-app`

---

## 4. Ejemplos listos para copiar (npx)

Rutas ya rellenadas. **Solo cambia la ruta de tu proyecto** en los pasos 2 y 3.

```bash
# 1) (Solo si no lo hiciste antes) instalar global
npx --yes "RUTA_HUB" install --global

# 2) instalar en tu proyecto (CAMBIA esta ruta por la de tu app)
npx --yes "RUTA_HUB" install --project "RUTA_PROYECTO"

# 3) verificar que quedó bien (CAMBIA esta ruta por la de tu app)
npx --yes "RUTA_HUB" doctor --project "RUTA_PROYECTO"
```

**Exportar** (generar .md y copilot-instructions) antes de instalar en un proyecto nuevo:

```bash
npx --yes "RUTA_HUB" export
```

**Solo Cursor** o **solo VS Code** en un proyecto:

```bash
npx --yes "RUTA_HUB" install --project "RUTA_PROYECTO" --targets cursor
npx --yes "RUTA_HUB" install --project "RUTA_PROYECTO" --targets vscode
```

---

## 5. Comandos por escenario

Sustituye:

- `RUTA_HUB` → la ruta absoluta a tu carpeta `.cursor` (ej. `C:\Users\tu-usuario\ruta\al\.cursor`)
- `RUTA_PROYECTO` → la ruta a tu app (ej. `C:\Users\tu-usuario\proyectos\mi-app`)

### 5.1 Solo Cursor + VS Code (por defecto, recomendado en Cursor)

Solo se activan Cursor y VS Code/Copilot. El resto no se enlaza; Cursor no suma skills/rules de otros editores.

**Con setup.sh (bash / Git Bash):**

```bash
cd "RUTA_HUB"
./setup.sh --project "RUTA_PROYECTO"
```

**Con cursor-hub (node, estando en el hub):**

```bash
cd "RUTA_HUB"
node scripts/cursor-hub.mjs export
node scripts/cursor-hub.mjs install --project "RUTA_PROYECTO" --targets cursor,vscode
```

**Con cursor-hub (npx, desde cualquier carpeta):**

```bash
npx "RUTA_HUB" export
npx "RUTA_HUB" install --project "RUTA_PROYECTO" --targets cursor,vscode
```

---

### 5.2 Solo VS Code

```bash
npx "RUTA_HUB" install --project "RUTA_PROYECTO" --targets vscode
```

(o `node scripts/cursor-hub.mjs install --project "RUTA_PROYECTO" --targets vscode` desde `RUTA_HUB`).

---

### 5.3 Solo Cursor

```bash
npx "RUTA_HUB" install --project "RUTA_PROYECTO" --targets cursor
```

---

### 5.4 Todos los editores, pero solo Cursor activo (modo seguro)

Instala datos para Cursor, VS Code, OpenCode, Antigravity y Claude; **solo Cursor queda activo**. El resto se copia a `.cursor-inactive/` y en carpetas placeholder para que Cursor no los cargue.

**Con setup.sh:**

```bash
./setup.sh --project "RUTA_PROYECTO" --all
```

**Con cursor-hub:**

```bash
npx "RUTA_HUB" export
npx "RUTA_HUB" install --project "RUTA_PROYECTO" --all
```

(`--all` implica modo inactivo para los no-Cursor si no pones `--active-non-cursor`).

---

### 5.5 Todos los editores y todos activos

Solo si quieres que en ese proyecto se activen también VS Code, OpenCode, Antigravity y Claude (enlaces normales). Cursor podría contar skills/rules de otros si los comparten.

**Con setup.sh:**

```bash
./setup.sh --project "RUTA_PROYECTO" --all --active-non-cursor
```

**Con cursor-hub:**

```bash
npx "RUTA_HUB" install --project "RUTA_PROYECTO" --all --active-non-cursor
```

---

### 5.6 Instalación global (OpenCode, Antigravity, Claude)

Una vez por máquina, para que esos editores usen el hub de forma global:

```bash
npx "RUTA_HUB" install --global
```

O, para elegir targets:

```bash
npx "RUTA_HUB" install --global --targets opencode,antigravity,claude
```

---

### 5.7 Solo exportar (generar .md y copilot-instructions)

```bash
npx "RUTA_HUB" export
```

---

### 5.8 Comprobar que todo está bien (doctor)

```bash
npx "RUTA_HUB" doctor --project "RUTA_PROYECTO"
```

---

## 6. Resumen rápido

| Objetivo                              | setup.sh                               | cursor-hub (npx o node)             |
| ------------------------------------- | -------------------------------------- | ----------------------------------- |
| Atajo: export + Cursor+VS Code         | `./setup.sh --project "RUTA_PROYECTO"` | —                                   |
| Solo Cursor                           | —                                      | `install --project "RUTA" --targets cursor` |
| Solo VS Code                          | —                                      | `install --project "RUTA" --targets vscode`  |
| Cursor + VS Code                      | `./setup.sh --project "RUTA"`          | `install --project "RUTA" --targets cursor,vscode` |
| Todos, solo Cursor activo (modo seguro) | `./setup.sh --project "RUTA" --all`   | `install --project "RUTA" --all`    |
| Todos activos                         | `./setup.sh … --all --active-non-cursor` | `install … --all --active-non-cursor` |
| Global (OpenCode, Antigravity, Claude) | `./setup.sh --global`                  | `install --global`                  |
| Solo exportar                         | —                                      | `export`                            |
| Verificar enlace                      | —                                      | `doctor --project "RUTA"`           |

---

## 7. `node` vs `npx` — resumen

- **`node scripts/cursor-hub.mjs`**: necesitas estar en `RUTA_HUB` o usar la ruta absoluta al `.mjs`. No requiere npx.
- **`npx "RUTA_HUB"`** o **`npx .`** (desde `RUTA_HUB`): npx usa el `bin` del `package.json` y ejecuta el mismo script. Cómodo si no quieres hacer `cd` al hub.

Puedes mezclar: por ejemplo `npx "RUTA_HUB" export` y después `node "RUTA_HUB/scripts/cursor-hub.mjs" install --project "RUTA_PROYECTO"`. El resultado es el mismo.

---

## 8. Windows sin bash

`setup.sh` necesita bash (Git Bash o WSL). Si solo tienes PowerShell o CMD:

1. Usa **cursor-hub** con `node` o `npx` como en los ejemplos de arriba.
2. Para imitar `./setup.sh --project "RUTA"` (cambia la ruta del proyecto):

   ```powershell
   npx --yes "RUTA_HUB" export
   npx --yes "RUTA_HUB" install --project "RUTA_PROYECTO" --targets cursor,vscode
   ```
