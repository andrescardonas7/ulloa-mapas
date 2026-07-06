---
name: npm-supply-chain-security
description: >-
  Harden npm/pnpm/bun installs against supply-chain attacks: ignore-scripts,
  block git deps, release cooldown, lockfile-lint, npm ci, dependency confusion
  (scoped private packages + .npmrc registry routing), npx/MCP offline workspace.
  Load when auditing package.json, .npmrc, lockfiles, adding dependencies, setting
  up private registry, reviewing Dependabot/Renovate PRs, or user cites Lirantal
  npm-security-best-practices or dependency confusion.
---

# npm supply chain security

Basado en [npm-security-best-practices](https://github.com/lirantal/npm-security-best-practices) (Apache-2.0, Liran Tal). Complementa **security-review** (auth, APIs, secretos); esta skill cubre el **package manager y la cadena de suministro**.

**Package manager por defecto en este hub:** pnpm si `package.json` declara `packageManager: pnpm@…`; si no, seguir lo que use el repo.

## Cuándo activar

- Añadir o actualizar dependencias, crear `.npmrc` / `pnpm-workspace.yaml`
- Registry privado + npm público en el mismo monorepo
- Revisar PR que toca `*-lock*` o fuentes `git+` / tarball
- Configurar MCP u otras herramientas lanzadas con `npx`
- Post-incidente (Shai-Hulud, typosquatting, cuenta npm comprometida)

## Cuándo NO activar

- Solo preguntas de API REST/GraphQL sin tocar deps
- Proyectos sin Node (sin `package.json` ni lockfile npm)

## Flujo de auditoría (orden)

1. **Inventario**: `package.json`, lockfile, `.npmrc`, `pnpm-workspace.yaml`, CI install script.
2. **Dependency confusion** (si hay paquetes privados): ver sección siguiente.
3. **Scripts**: `ignore-scripts` / `allowBuilds` + `strictDepBuilds`.
4. **Fuentes**: `allow-git=none` (npm), `blockExoticSubdeps` (pnpm).
5. **Cooldown**: `min-release-age` / `minimumReleaseAge`.
6. **Lockfile**: `lockfile-lint` en CI; rechazar hosts o `resolved` inesperados.
7. **Instalación**: `pnpm install --frozen-lockfile` o `npm ci` en CI.
8. **Vulnerabilidades**: Trivy / `pnpm audit`; fixes urgentes vía exclusiones de cooldown documentadas.

## §17 Dependency confusion (detalle)

**Escenario:** la org usa registry privado y npm público. Un atacante publica `@scope` imposible… en realidad el riesgo clásico es **nombre sin scope** idéntico al paquete interno con **versión mayor** en público.

### Mitigación principal

| Paso | Acción |
|------|--------|
| 1 | Renombrar paquetes internos a `@company/pkg` |
| 2 | En `.npmrc` del repo: `@company:registry=https://npm.company.com/` |
| 3 | Credenciales en `~/.npmrc` o `NPM_TOKEN` en CI — nunca en repo |
| 4 | Yarn Berry: `npmScopes.company.npmRegistryServer` en `.yarnrc.yml` |

### Mitigaciones adicionales

- Placeholders en npm público para nombres legacy sin scope (transición).
- `lockfile-lint` con `--allowed-hosts` acotados.
- pnpm `blockExoticSubdeps: true` para transitivas desde git/tarball.

### Señales en revisión de código

- Dependencia sin scope que coincide con convención interna (`company-utils`, `internal-api`).
- Lockfile con `resolved` apuntando a registry distinto del esperado.
- `.npmrc` sin entrada `@scope:registry` pese a dependencias `@scope/*`.

## Plantillas copy-paste

Ver también la regla `.cursor/rules/10-security/npm-supply-chain.mdc`.

### `.npmrc` (seguridad base)

```ini
ignore-scripts=true
allow-git=none
min-release-age=30
# @myorg:registry=https://npm.myorg.example/
```

### `pnpm-workspace.yaml`

```yaml
minimumReleaseAge: 43200
trustPolicy: no-downgrade
blockExoticSubdeps: true
strictDepBuilds: true
allowBuilds:
  esbuild: true
```

## npx y MCP (§8)

No ejecutar `npx @scope/tool` sin pin ni red en entornos sensibles.

1. Workspace dedicado con lockfile: `~/mcp` o ruta del proyecto.
2. `pnpm add` / `npm install` las herramientas ahí.
3. Invocar con `--offline` / `--no` y `--workspace` según documentación npm.

En `mcp.json` / config Cursor: fijar versión y workspace offline cuando sea posible.

## Anti-patrones (rechazar en review)

```bash
npm update
npx some-cli
pnpm update --latest
```

Preferir: Renovate/Dependabot con cooldown, `pnpm audit --fix`, upgrades interactivos revisados.

## Salida esperada de una auditoría

Entregar:

1. **Hallazgos** (crítico / alto / medio) con archivo y línea o config.
2. **Diff sugerido** mínimo (`.npmrc`, `pnpm-workspace.yaml`, nombres de paquetes).
3. **CI**: comandos `lockfile-lint`, `frozen-lockfile`, Trivy si aplica.
4. **Excepciones** documentadas (paquetes en `allowBuilds`, `minimumReleaseAgeExclude`).

## Referencias

- Guía completa: https://github.com/lirantal/npm-security-best-practices
- Dependency confusion (Alex Birsan): citado en §17 del README
- Lockfile injection: §5 — `lockfile-lint`
- Secretos en `.env`: §9 — alinear con `security-env.mdc` del hub

## Evals (routing)

| Caso | ¿Cargar skill? |
|------|----------------|
| "Configura @acme/registry para paquetes privados" | Sí |
| "Añade lodash al frontend" sin registry privado | Opcional (regla con globs puede bastar) |
| "¿Cómo funciona useEffect?" | No |
| PR solo cambia `pnpm-lock.yaml` | Sí |
| Revisar fugas de API keys en `.env` | No — usar **security-review** / **api-key-security** |
