# Skills (`.cursor/skills`)

This folder contains **skills**: domain-specific workflows, tooling, and guidance for AI agents. Each skill is a **folder with a `SKILL.md`** file. Cursor (and the Agent Skills standard) uses the **`description`** in the frontmatter to decide when to trigger a skill.

---

## What lives here

- **One folder per skill** (e.g. `backend-patterns/`, `differential-review/`), **directly under `skills/`** (flat structure).
- **`SKILL.md`** in each folder: YAML frontmatter (`name`, `description`) and markdown body (when to use, instructions, examples).
- Optional: `references/`, `workflows/`, `scripts/`, `resources/` inside a skill.

**Why flat?** Cursor discovers skills with the pattern `skills/<folder>/SKILL.md` at the first level. Category subfolders (e.g. `skills/security/differential-review/`) are **not** guaranteed to be discovered (recursive discovery is not documented). Organization by theme (security, testing, etc.) is done in this README and in each skill’s `description`, not via folder hierarchy.

### Authoring practices (high value, low ceremony)

These patterns match what works well in real agent workflows (including internal “skills” guidance): they are **recommendations**, not a rigid taxonomy.

- **One main job per skill** — If a folder mixes two unrelated jobs (e.g. “API reference” and “how we verify releases”), split or use clear sections so the agent knows what to load first.
- **`description` = when to trigger** — Put *when* to open the skill in YAML `description`; put *how* in the body. Avoid encoding the full workflow only in `description` (agents may skip the body).
- **Gotchas / common mistakes** — Add a short section (often titled `## Gotchas` or `## Common mistakes`) with the failures you see in practice. That section is usually the highest ROI for agent behavior.
- **Progressive disclosure** — Keep `SKILL.md` to the essential path; put long tables, API dumps, or optional flows in `references/` or `workflows/` and link from the top.
- **Scripts and assets** — Prefer deterministic steps in scripts when the same code would be rewritten every time; keep `SKILL.md` as the map and guardrails.

Skills copied by `../scripts/sync-trailofbits-skills.mjs` from `vendor/trailofbits-skills` are **reset when you sync**; prefer editing those upstream or maintaining local-only skills for heavy customization.

### Manifest (`.sync-manifest.json`)

Traceability for two catalogs:

| Section | Maintained by | Overwritten on ToB sync? |
| --- | --- | --- |
| **`trailOfBits`** | `../scripts/sync-trailofbits-skills.mjs` | Yes (refreshed each sync) |
| **`anthropicCyber`** | `../scripts/sync-cyber-skills.mjs` | Yes (refreshed each cyber sync) |
| **`pmSkills`** | `../scripts/sync-pm-skills.mjs` | Yes (refreshed each PM sync) |
| **`hubLocal`** | Hand-edited in this repo | No (preserved by sync scripts) |

Run `node ../scripts/audit-skills-trust.mjs --changed-only` after adding or changing any skill (see `skills-audit-policy.mdc`).

**Layout (flat only):** Cursor discovers `skills/<name>/SKILL.md` at **one** level. Legacy plugin **pack folders** (`building-secure-contracts/`, `testing-handbook-skills/`, `culture-index/`) duplicated skills already synced flat; they were removed from this hub (May 2026). `sync-trailofbits-skills.mjs` deletes those three on each real sync. `sharp-edges/` kept its flat `SKILL.md`; only the inner duplicate `sharp-edges/skills/` was removed.

**Auditoría (`audit-skills-trust.mjs`):** Mapa OWASP AST10 ↔ hub (límites AST08, AST06, AST10): [`docs/security/agentic-skills-ast10-hub-map.md`](../../docs/security/agentic-skills-ast10-hub-map.md).

| Modo | Qué escanea |
| --- | --- |
| *(sin flags)* | Layout de **todos** los `SKILL.md` + trust scan de cada carpeta top-level |
| `--changed-only` | Layout **global** (igual que arriba) + trust scan solo de carpetas tocadas en `git diff` bajo `.cursor/skills` |
| `--skill <nombre>` | Layout y trust solo bajo `skills/<nombre>/` (repetir `--skill` para varias) |
| `--anthropic-cyber` | Trust scan solo de skills listadas en `anthropicCyber` del manifest |

No existe `--path`. Para las **31 skills `hubLocal`** del manifest:

```bash
node .cursor/scripts/audit-skills-trust.mjs --hub-local
# o desde .cursor/:  pnpm audit:skills:hub-local
```

Para el lote **`anthropicCyber`** (58 skills tras sync):

```bash
node .cursor/scripts/audit-skills-trust.mjs --anthropic-cyber
# o desde .cursor/:  pnpm audit:skills:anthropic-cyber
```

Auditar skills concretas:

```bash
node .cursor/scripts/audit-skills-trust.mjs --skill using-agent-skills --skill coding-guidelines
```

Si `--changed-only` no lista nada (p. ej. `skills/` aún sin trackear en git), el trust scan puede escanear **0** carpetas aunque el layout pase o falle igual.

### Trail of Bits (upstream sync)

Roughly **73 skills** from [trailofbits/skills](https://github.com/trailofbits/skills) are copied from `vendor/trailofbits-skills` into this folder by `../scripts/sync-trailofbits-skills.mjs`. To refresh from GitHub, see **`../SYNC-TRAILOFBITS.md`**. Skills not from that repo (for example `backend-patterns/`, `humanizer/`, the **engineering workflow pack**) are left unchanged by the script.

### Anthropic Cybersecurity Skills (curated upstream sync)

Roughly **58 granular SOC/DFIR/threat-intel skills** (allowlist) from [mukul975/Anthropic-Cybersecurity-Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills) sync from `vendor/anthropic-cybersecurity-skills` via `../scripts/sync-cyber-skills.mjs`. They **complement** the SecOps playbooks below; they do **not** replace `web-pentest`, `threat-hunting`, etc.

- **Update:** `../SYNC-ANTHROPIC-CYBER.md`
- **Router for agents:** `using-cyber-skills/`
- **Manifest section:** `.sync-manifest.json` → `anthropicCyber`
- **Audit batch:** `node ../scripts/audit-skills-trust.mjs --anthropic-cyber`

### PM Skills (phuryn/pm-skills upstream sync)

**68 skills** and **42 slash commands** from [phuryn/pm-skills](https://github.com/phuryn/pm-skills) sync from `vendor/phuryn-pm-skills` via `../scripts/sync-pm-skills.mjs`. Complements the **engineering workflow pack** (`using-agent-skills`, `/spec`, `/plan`, `/build`) with product discovery, strategy, PRD, GTM, and AI-shipping workflows.

- **Update:** `../SYNC-PM-SKILLS.md`
- **Router for agents:** `using-pm-skills/`
- **Manifest section:** `.sync-manifest.json` → `pmSkills`
- **Audit batch:** `node ../scripts/audit-skills-trust.mjs --pm-skills`

---

## Folder guide (what each skill is for)

Use this as a quick map. Each folder contains a `SKILL.md` entry point unless noted.

### Development and UI

- **`backend-patterns/`** — Path: `.cursor/skills/backend-patterns/` — Backend architecture, APIs, and server-side best practices
- **`frontend-patterns/`** — Path: `.cursor/skills/frontend-patterns/` — Frontend patterns for React/Next.js and UI workflows
- **`coding-standards/`** — Path: `.cursor/skills/coding-standards/` — Universal coding standards and patterns
- **`react-best-practices/`** — Path: `.cursor/skills/react-best-practices/` — React/Next.js performance optimization guidance
- **`vercel-react-best-practices/`** — Path: `.cursor/skills/vercel-react-best-practices/` — Vercel-specific React/Next.js performance rules
- **`UI/`** — Path: `.cursor/skills/UI/` — Opinionated constraints for building better interfaces
- **`web-design-guidelines/`** — Path: `.cursor/skills/web-design-guidelines/` — UI/UX and accessibility review guidelines
- **`humanizer/`** — Path: `.cursor/skills/humanizer/` — Make writing sound more natural and human

### Workflow and planning

- **`ask-questions-if-underspecified/`** — Path: `.cursor/skills/ask-questions-if-underspecified/` — Ask clarifying questions before implementation
- **`brainstorming/`** — Path: `.cursor/skills/brainstorming/` — Explore intent and design before building
- **`writing-plans/`** — Path: `.cursor/skills/writing-plans/` — Create implementation plans
- **`executing-plans/`** — Path: `.cursor/skills/executing-plans/` — Execute a written plan with checkpoints
- **`dispatching-parallel-agents/`** — Path: `.cursor/skills/dispatching-parallel-agents/` — Split independent work across subagents
- **`subagent-driven-development/`** — Path: `.cursor/skills/subagent-driven-development/` — Run tasks via subagents with review loops
- **`finishing-a-development-branch/`** — Path: `.cursor/skills/finishing-a-development-branch/` — Decide merge/PR/cleanup when implementation completes
- **`using-git-worktrees/`** — Path: `.cursor/skills/using-git-worktrees/` — Worktrees for isolated feature work
- **`using-superpowers/`** — Path: `.cursor/skills/using-superpowers/` — Use skills and tooling at session start
- **`skill-creator/`** — Path: `.cursor/skills/skill-creator/` — Create new skills with correct structure
- **`skill-template/`** — Path: `.cursor/skills/skill-template/` — Standard `SKILL.md` template with process, red flags, and verification gates
- **`writing-skills/`** — Path: `.cursor/skills/writing-skills/` — Guidance for writing and testing skills
- **`receiving-code-review/`** — Path: `.cursor/skills/receiving-code-review/` — Interpret and validate review feedback
- **`requesting-code-review/`** — Path: `.cursor/skills/requesting-code-review/` — Request code review before merge
- **`verification-before-completion/`** — Path: `.cursor/skills/verification-before-completion/` — Require verification before claiming done

### Testing and quality

- **`test-driven-development/`** — Path: `.cursor/skills/test-driven-development/` — TDD workflow and rules
- **`tdd-workflow/`** — Path: `.cursor/skills/tdd-workflow/` — Step-by-step TDD enforcement
- **`property-based-testing/`** — Path: `.cursor/skills/property-based-testing/` — Property-based testing guidance
- **`systematic-debugging/`** — Path: `.cursor/skills/systematic-debugging/` — Structured debugging process

### Agent architecture (hub-local)

- **`agents-best-practices/`** — Path: `.cursor/skills/agents-best-practices/` — Provider-neutral harness design: agent loop, typed tools, permissions, context/compaction, skills/MCP, evals, launch gates. Upstream: [DenisSergeevitch/agents-best-practices](https://github.com/DenisSergeevitch/agents-best-practices) (MIT). Use with **`agent-harness-security/`** (Cursor `.cursor/` surface) and **`skill-design-philosophy/`** (authoring skills); does not replace always-on rules in `.cursor/rules/10-security/`.

### Security, audits, and compliance

- **`agent-harness-security/`** — Path: `.cursor/skills/agent-harness-security/` — AgentShield, hooks, MCP audit on the Cursor agent surface (not product harness blueprints)
- **`skill-trust-audit/`** — Path: `.cursor/skills/skill-trust-audit/` — Light grep trust scan for new/changed skills (prompt injection, exfil hints); required by `skills-audit-policy.mdc`
- **`security-review/`** — Path: `.cursor/skills/security-review/` — Security review checklist and patterns
- **`differential-review/`** — Path: `.cursor/skills/differential-review/` — Security-focused diff/PR review
- **`fix-review/`** — Path: `.cursor/skills/fix-review/` — Verify audit remediations in fix branches
- **`audit-context-building/`** — Path: `.cursor/skills/audit-context-building/` — Deep context building before audits
- **`audit-prep-assistant/`** — Path: `.cursor/skills/audit-prep-assistant/` — Prepare codebase for security review
- **`guidelines-advisor/`** — Path: `.cursor/skills/guidelines-advisor/` — Security best-practice advisory guidance
- **`secure-workflow-guide/`** — Path: `.cursor/skills/secure-workflow-guide/` — Secure development workflow guidance
- **`spec-to-code-compliance/`** — Path: `.cursor/skills/spec-to-code-compliance/` — Spec-to-code alignment checks
- **`entry-point-analyzer/`** — Path: `.cursor/skills/entry-point-analyzer/` — Identify state-changing entry points in contracts
- **`variant-analysis/`** — Path: `.cursor/skills/variant-analysis/` — Find bug variants and build queries
- **`sharp-edges/`** — Path: `.cursor/skills/sharp-edges/` — Identify footguns and unsafe defaults

### Documents and formats

- **`docx/`** — Path: `.cursor/skills/docx/` — Create and edit Word documents
- **`pdf/`** — Path: `.cursor/skills/pdf/` — Extract and manipulate PDFs
- **`pptx/`** — Path: `.cursor/skills/pptx/` — Create and edit PowerPoint presentations

### Tools and analysis

- **`burpsuite-project-parser/`** — Path: `.cursor/skills/burpsuite-project-parser/` — Parse Burp Suite project files
- **`constant-time-analysis/`** — Path: `.cursor/skills/constant-time-analysis/` — Detect timing side-channel risks
- **`codeql/`**, **`semgrep/`**, **`sarif-parsing/`** — Path: `.cursor/skills/<name>/` — Static analysis workflows (Trail of Bits `static-analysis` plugin)
- **`semgrep-rule-creator/`** — Path: `.cursor/skills/semgrep-rule-creator/` — Build Semgrep rules
- **Testing handbook (flat folders)** — e.g. `address-sanitizer/`, `libfuzzer/`, `wycheproof/`, `testing-handbook-generator/` — Fuzzing, sanitizers, and related tooling
- **`dwarf-expert/`** — Path: `.cursor/skills/dwarf-expert/` — DWARF debug format guidance
- **`interpreting-culture-index/`** — Path: `.cursor/skills/interpreting-culture-index/` — Interpret Culture Index profiles

### Smart contract scanners and token checks

- **`token-integration-analyzer/`** — Path: `.cursor/skills/token-integration-analyzer/` — Analyze token integration patterns
- **`algorand-vulnerability-scanner/`** — Path: `.cursor/skills/algorand-vulnerability-scanner/` — Scan Algorand contracts for common issues
- **`cairo-vulnerability-scanner/`** — Path: `.cursor/skills/cairo-vulnerability-scanner/` — Scan Cairo/StarkNet contracts
- **`cosmos-vulnerability-scanner/`** — Path: `.cursor/skills/cosmos-vulnerability-scanner/` — Scan Cosmos SDK / CosmWasm issues
- **`solana-vulnerability-scanner/`** — Path: `.cursor/skills/solana-vulnerability-scanner/` — Scan Solana programs
- **`substrate-vulnerability-scanner/`** — Path: `.cursor/skills/substrate-vulnerability-scanner/` — Scan Substrate pallets
- **`ton-vulnerability-scanner/`** — Path: `.cursor/skills/ton-vulnerability-scanner/` — Scan TON contracts

### Personal Knowledge Management (Obsidian)

Pack `"obsidian-pkm"` — 6 skills for working inside real Obsidian vaults. Entry point is the router.

- **`using-obsidian/`** — Meta-router. Load first when user mentions Obsidian, vault, PKM, wikilinks, canvases, bases, or research intake. Routes to the five granular skills with high precision.
- **`obsidian-markdown/`** — Obsidian Flavored Markdown (wikilinks, embeds, callouts, properties, block refs). Only for content that will live in a vault.
- **`obsidian-bases/`** — `.base` files: filters, formulas, summaries, table/cards/list/map views over your notes.
- **`json-canvas/`** — `.canvas` files: nodes, edges, groups, visual boards, mind maps, research canvases.
- **`obsidian-cli/`** — Official CLI for a running Obsidian app (create/search/append, plugin dev loop, screenshots, JS eval).
- **`defuddle/`** — Clean web-to-Markdown extraction (removes clutter). Preferred intake tool when saving research into the vault.

All six are `hubLocal` (May 2026). Full provenance in `vendor/obsidian-skills/`. See `using-obsidian/SKILL.md` for the decision tree.

### Research & web search (hub local)

Pack `"hub-research"`.

- **`anysearch/`** — Real-time web search, vertical domain queries (finance/CVE/academic), parallel batch search, and URL extraction. Router vs `defuddle` / `parallel-web` in `anysearch/SKILL.md`. Sync: `.cursor/SYNC-ANYSEARCH.md`.

---

## Skills nuevas (recién agregadas)

Última actualización del catálogo local: **mayo 2026** (**262** carpetas de skill con `SKILL.md` bajo `skills/`: **31** `hubLocal`, **73** Trail of Bits, **58** `anthropicCyber`, resto hub/SecOps/symlinks; verificar con `node ../scripts/verify-skill-counts.mjs`). Algunas entradas son **symlinks** a `C:\Users\zelda\.agents\skills` o `C:\Users\zelda\.claude\skills` (marcadas con `→`); el resto son carpetas locales del hub.

### Paquete *engineering workflow* (hub local)

Meta-skill de enrutado y **22 skills por fase** del ciclo de ingeniería (upstream v0.6.2). Entrada: **`using-agent-skills/`** (árbol de decisión + secuencia típica de feature). Listadas en `.sync-manifest.json` → `hubLocal` con `"pack": "engineering-workflow"`. Actualizar: `pnpm --dir .cursor sync:engineering-workflow`.

| Fase | Skill | Resumen |
| --- | --- | --- |
| Meta | `using-agent-skills/` | Descubre e invoca la skill correcta por fase |
| Definir | `interview-me/` | Entrevista una pregunta a la vez hasta ~95% de intención |
| Definir | `idea-refine/` | Divergencia/convergencia sobre ideas vagas |
| Definir | `spec-driven-development/` | Spec y criterios de aceptación antes de código |
| Planificar | `planning-and-task-breakdown/` | Tareas ordenadas y verificables |
| Construir | `incremental-implementation/` | Slices verticales finos, verificar cada uno |
| Construir | `source-driven-development/` | Implementación anclada a docs oficiales |
| Construir | `doubt-driven-development/` | Revisión adversarial en decisiones no triviales |
| Construir | `frontend-ui-engineering/` | UI de calidad producción (no “AI slop”) |
| Construir | `api-and-interface-design/` | APIs y contratos estables entre módulos |
| Verificar | `browser-testing-with-devtools/` | Chrome DevTools MCP (DOM, red, perf) |
| Verificar | `debugging-and-error-recovery/` | Reproducir → localizar → arreglar → blindar |
| Revisar | `code-review-and-quality/` | Review multi-eje antes de merge |
| Revisar | `security-and-hardening/` | OWASP, input no confiable, least privilege |
| Revisar | `performance-optimization/` | Medir primero; optimizar cuellos reales |
| Revisar | `code-simplification/` | Refactor de claridad sin cambiar comportamiento |
| Entregar | `git-workflow-and-versioning/` | Commits atómicos, ramas, conflictos |
| Entregar | `ci-cd-and-automation/` | Pipelines y quality gates |
| Entregar | `documentation-and-adrs/` | ADRs y documentación del *por qué* |
| Entregar | `deprecation-and-migration/` | Deprecar APIs y migrar usuarios |
| Entregar | `observability-and-instrumentation/` | Logs estructurados, métricas RED, trazas, alertas por síntoma |
| Entregar | `shipping-and-launch/` | Checklist pre-lanzamiento, monitoreo, rollback |

Secuencia típica de feature (no obligatoria en bugs pequeños): ver tabla en `using-agent-skills/SKILL.md` → *Lifecycle Sequence*.

### Hub: comportamiento, seguridad y tooling (local)

| Skill | Para qué |
| --- | --- |
| **`coding-guidelines/`** | Comportamiento estilo Karpathy (pensar antes, diffs quirúrgicos, metas verificables). Fuente adaptada: [andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills). |
| **`clean-code-martin/`** | Checklist Clean Code (Martin) para reviews de legibilidad y smells. Fuente: libro + [gist wojteklu](https://gist.github.com/wojteklu/73c6914cc446146b8b533c0988cf8d29). Comando: `/clean-code-review`. |
| **`api-key-security/`** | Auditar claves, tokens, `.env`, `settings.json`, MCP y allowlists del agente. |
| **`npm-supply-chain-security/`** | Endurecer npm/pnpm/bun: ignore-scripts, lockfile-lint, cooldown, dependency confusion (complementa `npm-supply-chain-guard/`). |
| **`code-hardcode-audit/`** | Secretos, magic numbers y rutas embebidas (política de hardcoding del hub). |
| **`skill-design-philosophy/`** | Diseñar/refinar skills: routing, evals, progressive disclosure, gotchas. |
| **`find-skills/`** | Descubrir e instalar skills del ecosistema abierto. |
| **`update-changelog/`** | Actualizar `CHANGELOG.md` desde el último tag (adaptado de mitsuhiko/agent-stuff). |
| **`remote-repo-cache/`** | Checkout read-only de repos externos en caché (sin ensuciar el árbol del proyecto). |
| **`skill-trust-audit/`** | Escaneo rg de confianza tras añadir/cambiar skills (obligatorio por política del hub). |
| **`using-cyber-skills/`** | Router: playbooks SecOps del hub vs skills granulares `anthropicCyber` (STIX, DFIR, SOC). |
| **`anysearch/`** | Búsqueda web en tiempo real, dominios verticales y extracción de URLs (AnySearch CLI). Sync: `SYNC-ANYSEARCH.md`. |

### Desarrollo backend, frontend y full-stack

- **`backend-development/`** — Sistemas backend robustos: Node.js, Python, Go, Rust, NestJS, FastAPI, Django, PostgreSQL/MongoDB/Redis, REST/GraphQL/gRPC, OAuth 2.1, JWT, OWASP Top 10, Docker/Kubernetes/CI/CD.
- **`frontend-development/`** — Guías para apps React/TypeScript modernas: Suspense, lazy loading, `useSuspenseQuery`, organización por features, MUI v7, TanStack Router, performance y TypeScript.
- **`better-auth/`** — Autenticación y autorización con Better Auth (email/password, OAuth, 2FA/TOTP, passkeys/WebAuthn, sesiones, RBAC, rate limiting, adaptadores de BD).
- **`databases/`** — MongoDB y PostgreSQL: diseño de esquemas, aggregation pipelines, queries SQL, índices, migraciones, réplica/sharding, backups, tuning de performance.
- **`modern-python/`** — Patrones y tooling modernos de Python.
- **`devcontainer-setup/`** — Configuración de dev containers reproducibles.

### Diseño, UI y "taste" (mayoría symlinks)

Catálogo [taste-skill](https://github.com/Leonxlnx/taste-skill) enlazado como junctions a `~/.agents/skills` (`sync-taste-skills.mjs`; no se commitean). Instalar/actualizar upstream: `npx skills add https://github.com/Leonxlnx/taste-skill` y copiar a `~/.agents/skills`, luego `node .cursor/scripts/sync-taste-skills.mjs`. Greenfield → `design-taste-frontend`; legacy → `redesign-existing-projects`; comps/imágenes → `imagegen-frontend-web` / `imagegen-frontend-mobile` / `brandkit`; image→code → `image-to-code`; restricciones Tailwind/a11y → primero `ui-skills`.

- **`css-protips/`** — 29 protips tácticos de CSS (adaptados de AllThingsSmitty/css-protips). Carga cuando hay decisiones micro de layout, tipografía fluida, focus, imágenes, selectores o ritmo vertical que las reglas de alto nivel + Tailwind no cubren todavía.
- **`design-taste-frontend/`** → `~/.agents/skills/design-taste-frontend` — **v2**: lee el brief, infiere la dirección de diseño y evita interfaces "templated"; design systems reales, audit-first en redesigns, pre-flight check estricto.
- **`gpt-taste/`** → `~/.agents/skills/gpt-taste` — UX/UI + GSAP avanzado con AIDA, bento grids y ScrollTriggers.
- **`image-taste-frontend/`** — No longer in the hub catalog; install via `~/.agents/skills/` or use **`design-taste-frontend`** / **`huashu-design`** for visual pipelines.
- **`high-end-visual-design/`** → `~/.agents/skills/high-end-visual-design` — Enseña al agente a diseñar como agencia de alta gama (tipografía, spacing, sombras, cards).
- **`industrial-brutalist-ui/`** → `~/.agents/skills/industrial-brutalist-ui` — Interfaces brutalistas/industriales tipo blueprints desclasificados.
- **`minimalist-ui/`** → `~/.agents/skills/minimalist-ui` — Interfaces editoriales limpias, monocromo cálido, bento plano.
- **`stitch-design-taste/`** → `~/.agents/skills/stitch-design-taste` — Sistema de diseño semántico para Google Stitch (`DESIGN.md`).
- **`redesign-existing-projects/`** → `~/.agents/skills/redesign-existing-projects` — Auditar y elevar a calidad premium proyectos existentes sin romper funcionalidad.
- **`full-output-enforcement/`** → `~/.agents/skills/full-output-enforcement` — Anula la truncación por defecto del LLM y fuerza salidas completas sin placeholders (útil cuando el agente entrega trabajo a medias).
- **`image-to-code/`** → `~/.agents/skills/image-to-code` — Pipeline imagen → análisis → implementación frontend.
- **`imagegen-frontend-web/`** → `~/.agents/skills/imagegen-frontend-web` — Comps web (hero, landing, multi-sección); solo imágenes de referencia.
- **`imagegen-frontend-mobile/`** → `~/.agents/skills/imagegen-frontend-mobile` — Pantallas y flujos móviles; solo imágenes de referencia.
- **`brandkit/`** → `~/.agents/skills/brandkit` — Boards de identidad (logo, paleta, tipografía).
- **`design-taste-frontend-v1/`** → `~/.agents/skills/design-taste-frontend-v1` — Pin opcional del taste-skill v1 si v2 rompe un flujo existente.
- **`fixing-accessibility/`** → `~/.agents/skills/fixing-accessibility` — Auditar y corregir ARIA, foco, contraste, errores de formularios, WCAG.
- **`fixing-motion-performance/`** → `~/.agents/skills/fixing-motion-performance` — Corregir jank: layout thrashing, propiedades de compositor, scroll-linked, blur.

### Workflow, depuración y resolución de problemas

- **`debugging-framework/`** — Dispatch a sub-skills de depuración (índice; las skills ejecutables están en la raíz).
- **`problem-solving-framework/`** — Dispatch cuando estás atascado (índice; sub-skills en la raíz).
- **`root-cause-tracing/`**, **`defense-in-depth/`** — Depuración (layout plano, descubrible por Cursor).
- **`when-stuck/`**, **`collision-zone-thinking/`**, **`inversion-exercise/`**, **`meta-pattern-recognition/`**, **`scale-game/`**, **`simplification-cascades/`** — Problem-solving (layout plano).
- **`karpathy-guidelines/`** — Guías de comportamiento estilo Karpathy para reducir errores típicos de LLM al codear.
- **`context-engineering/`** — Ingeniería de contexto para agentes: degradación, compaction, caching, memoria, multi-agente, LLM-as-Judge.
- **`second-opinion/`** — Obtener una segunda opinión sobre decisiones o código.
- **`let-fate-decide/`** — Ruleta para romper parálisis por análisis en decisiones equivalentes.
- **`git-cleanup/`** — Limpieza de branches/commits/worktrees al cerrar trabajo.
- **`claude-in-chrome-troubleshooting/`** — Diagnóstico de Claude en Chrome.

### Testing, fuzzing y calidad

- **`web-testing/`** — Playwright, Vitest, k6 (E2E, unit, integración, carga, seguridad, visual, a11y, Core Web Vitals).
- **`aflpp/`** → `~/.agents/skills/aflpp` — AFL++ para fuzzing multi-core de C/C++.
- **`harness-writing/`** — Escritura de harnesses de fuzzing.
- **`testing-handbook-generator/`** — Generador del testing handbook de Trail of Bits.

### SecOps — ofensivo, defensivo y cadena de suministro (paquete reciente)

Skills con `metadata.type: offensive` o `defensive` en el frontmatter. Van **en la raíz** de `skills/` (misma regla de descubrimiento plana que el resto). Las personas en `.cursor/agents/` (`redteam-planner`, `reverse-engineer`, etc.) son el complemento recomendado para tareas largas.

**Router (granular vs playbooks):** `using-cyber-skills/` — cuándo abrir un playbook hub vs una skill `anthropicCyber` (STIX, Volatility, Sigma, etc.). Ver **`../SYNC-ANTHROPIC-CYBER.md`** para actualizar el lote importado.

**Ofensivo** (`type: offensive`) — solo en entornos y alcance **autorizados**:

- **`active-directory-attack/`**, **`advanced-redteam/`**, **`red-team-ops/`** — AD, APT simulado, C2, persistencia, evasión.
- **`initial-access/`**, **`privesc-windows/`**, **`privesc-linux/`**, **`edr-evasion/`** — acceso inicial y escalada.
- **`recon-osint/`**, **`web-pentest/`**, **`network-attack/`**, **`mobile-pentest/`**, **`cloud-security/`** — superficie externa y nube.
- **`exploit-development/`**, **`vulnerability-analysis/`**, **`shellcode-dev/`**, **`reverse-engineering/`**, **`keylogger-arch/`** — explotación y RE ofensiva.
- **`windows-boundaries/`**, **`windows-mitigations/`**, **`crypto-analysis/`**, **`ai-security/`**, **`coding-mastery/`** — mitigaciones, cripto y automatización ofensiva.

**Defensivo** (`type: defensive`):

- **`incident-response/`**, **`threat-hunting/`**, **`malware-analysis/`** — IR, caza de amenazas y análisis de malware.

**Cadena de suministro (local / sin API)** — alineado con reglas always-on `supply-chain-security*.mdc`:

- **`supply-chain-guard/`**, **`npm-supply-chain-guard/`**, **`misteye-security-check/`** — revisión de dependencias, lockfiles y CI; perfil MistEye **offline** (sin credenciales en la nube).

### Seguridad adicional y auditoría

- **`code-hardcode-audit/`** — Auditoría de valores hardcodeados (secretos, constantes mágicas, credenciales).
- **`agentic-actions-auditor/`** — Auditoría de GitHub Actions que invocan agentes de IA y exponen entradas controladas por atacantes.
- **`audit-context-building/`** — Construcción de contexto profundo antes de auditorías de seguridad.
- **`code-maturity-assessor/`** — Evaluación de madurez de código para engagements de seguridad.
- **`constant-time-analysis/`** — Detección de riesgos de timing side-channel en código criptográfico.
- **`dimensional-analysis/`** — Análisis de unidades y fórmulas para encontrar errores de dimensión.
- **`entry-point-analyzer/`** — Identificación de entry points state-changing en smart contracts.
- **`fp-check/`** — Verificación sistemática de posibles falsos positivos en hallazgos de seguridad.
- **`insecure-defaults/`** — Detección de defaults inseguros.
- **`mutation-testing/`** — Configuración de campañas de mutation testing con `mewt` o `muton`.
- **`supply-chain-risk-auditor/`** — Revisión de riesgo de supply chain en dependencias.
- **`zeroize-audit/`** — Detección de secretos que no se limpian de memoria o cuya limpieza elimina el compilador.
- **`designing-workflow-skills/`** — Diseñar skills orientadas a workflow de seguridad.
- **`semgrep-rule-variant-creator/`** — Crear variantes de reglas Semgrep a partir de una existente.

### Trailmark y grafos de auditoría

- **`trailmark/`**, **`trailmark-summary/`**, **`trailmark-structural/`** — Grafos de código, pre-análisis estructural, blast radius, taint y entry points.
- **`diagramming-code/`**, **`crypto-protocol-diagram/`**, **`mermaid-to-proverif/`** — Diagramas Mermaid y modelos ProVerif para protocolos y flujo de código.
- **`genotoxic/`**, **`vector-forge/`**, **`audit-augmentation/`**, **`graph-evolution/`** — Mutation testing guiado por grafos, generación de vectores y análisis evolutivo.

### MCP y meta-skills

- **`skill-trust-audit/`** → `~/.agents/skills/skill-trust-audit` — Escaneo ligero (rg) de skills nuevas o cambiadas: inyección, exfiltración, promos embebidas. Obligatorio tras añadir skills (ver `skills-audit-policy.mdc`).
- **`mcp-builder/`** — Crear servidores MCP de alta calidad (FastMCP en Python o MCP SDK en Node/TS).
- **`mcp-management/`** — Descubrir, analizar y ejecutar tools/prompts/resources de servidores MCP.
- **`capture-skill/`** — Capturar/formalizar conocimiento ad-hoc como una nueva skill.
- **`skill-improver/`** — Mejorar skills existentes (claridad, gotchas, ROI para el agente).

### Documentos (meta)

- **`document-skills/`** — Meta-skill que agrupa los generadores de documentos (DOCX/PDF/PPTX/XLSX) y orquesta su uso.

### Multimedia

- **`baoyu-youtube-transcript/`** → `~/.agents/skills/baoyu-youtube-transcript` — Descargar transcripciones/subtítulos y portadas de YouTube por URL o ID.

### Archivos sueltos

- **`agent_skills_spec.md`** — Especificación/contrato que siguen los `SKILL.md` de esta carpeta (frontmatter, secciones recomendadas, convenciones).

---

## Main groups

- **Engineering workflow (hub)**: `using-agent-skills` + fase `interview-me` → `shipping-and-launch` (ver tabla arriba)
- **Hub behavior & security**: `coding-guidelines`, `api-key-security`, `npm-supply-chain-security`, `code-hardcode-audit`, `skill-design-philosophy`, `find-skills`, `update-changelog`, `remote-repo-cache`, `skill-trust-audit`
- **Development**: `backend-patterns`, `frontend-patterns`, `coding-standards`, `react-best-practices`, `vercel-react-best-practices`, `UI`, `web-design-guidelines`
- **Workflow and planning**: `writing-plans`, `executing-plans`, `dispatching-parallel-agents`, `subagent-driven-development`, `brainstorming`, `finishing-a-development-branch`, `using-superpowers`, `using-git-worktrees`, `skill-creator`, `writing-skills`
- **Security and audits**: `security-review`, `differential-review`, `fix-review`, `agentic-actions-auditor`, `entry-point-analyzer`, `variant-analysis`, `audit-context-building`, `fp-check`, `sharp-edges`, `spec-to-code-compliance`, `supply-chain-risk-auditor`, `zeroize-audit`, `supply-chain-guard`, `npm-supply-chain-guard`, `misteye-security-check`, plus chain scanners listed below (Algorand, Cairo, Cosmos, Solana, Substrate, TON)
- **SecOps (offensive / defensive)**: `red-team-ops`, `advanced-redteam`, `incident-response`, `threat-hunting`, `malware-analysis`, `web-pentest`, `exploit-development`, `reverse-engineering`, and related folders listed in **SecOps** above
- **Documents**: `docx`, `pdf`, `pptx`
- **Testing and QA**: `test-driven-development`, `tdd-workflow`, `property-based-testing`, `receiving-code-review`, `requesting-code-review`, `verification-before-completion`, `systematic-debugging`
- **Clarify and gate**: `ask-questions-if-underspecified`
- **Tools and analysis**: `burpsuite-project-parser`, `constant-time-analysis`, `dimensional-analysis`, `mutation-testing`, `codeql`, `semgrep`, `sarif-parsing`, `semgrep-rule-creator`, `dwarf-expert`, `interpreting-culture-index`, `humanizer`, Trailmark skills (`trailmark`, `diagramming-code`, `crypto-protocol-diagram`, `mermaid-to-proverif`, `genotoxic`, `vector-forge`), and fuzzing or sanitizer tools named in the Trail of Bits testing-handbook plugin (see flat folders such as `libfuzzer/`, `wycheproof/`)

---

## Trail of Bits layout (flat)

Skills that used to be shipped as nested “packs” in upstream (`building-secure-contracts`, `testing-handbook-skills`, etc.) are synced here as **one folder per skill** at the top level (for example `audit-prep-assistant/`, `semgrep/`, `interpreting-culture-index/`). Run `../scripts/sync-trailofbits-skills.mjs` after updating `vendor/trailofbits-skills` to match the latest plugin layout.

---

## `SecOps/`

`SecOps/` mirrors many of the skills above for a SecOps-oriented layout. The **`description`** in each `SKILL.md` is what the agent uses to choose when to run a skill.

---

## For the agent

- **Triggering:** The agent sees each skill’s **`description`** (and optionally `name`). Use it when the user’s goal or the current task matches that description.
- **Entry point:** Open the skill’s **`SKILL.md`** for “When to use”, “When NOT to use”, and step-by-step instructions.
- **Extra material:** Use `references/`, `workflows/`, and `scripts/` as referenced from `SKILL.md`; don’t load everything up front.
