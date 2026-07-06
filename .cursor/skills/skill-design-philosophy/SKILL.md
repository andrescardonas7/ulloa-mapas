---
name: skill-design-philosophy
description: >-
  Load when authoring, refining, auditing, or reviewing Agent Skills (SKILL.md):
  routing and activation, progressive disclosure, evals (positive/negative/boundary),
  gotchas, skill dependencies, context-token cost, maintenance, or Perplexity-style
  "skill design" philosophy. Triggers: diseñar/refinar/auditar skills, routing,
  evals de skills, gotchas, carga progresiva, dependencias entre skills, regresiones,
  ecología de skills, "Load when", SKILL.md structure beyond boilerplate.
---

# Filosofía de diseño de Agent Skills

Una **Skill** no es solo un prompt: es una **cápsula operativa** (instrucciones, referencias, scripts, assets, configuración) que se activa **bajo demanda**. Objetivo: moldear un sistema probabilístico con **contexto mínimo y útil** (arquitectura de contexto), no escribir documentación enciclopédica.

## Cuándo NO cargar esta skill

- Tareas normales de código que no tocan ningún `SKILL.md` ni el diseño/routing de skills.
- Edición de **rules** (`.cursor/rules/*.mdc`), **prompts ad hoc** o **system prompts** generales.
- Mecánica de Cursor (rutas, frontmatter, locations): usar `create-skill` en `~/.cursor/skills-cursor/create-skill/`.

## Cuatro perspectivas

| Perspectiva | Qué implica |
|-------------|-------------|
| **Directorio** | Archivos organizados que soportan el comportamiento del agente. |
| **Formato** | Estructura reconocible, centrada en `SKILL.md` y metadatos. |
| **Invocable** | El agente puede cargarla en tiempo de ejecución cuando aplica. |
| **Progresiva** | Cargar solo lo necesario; reducir costo y ruido contextual. |

## Principios rectores

- **Minimalismo útil**: solo líneas que cambiarían el comportamiento; prueba: *¿el agente fallaría sin esto?*
- **Routing preciso**: la `description` del frontmatter decide buena parte del éxito (condiciones de activación, dominio, sinónimos; evitar marketing vago).
- **Evaluación primero**: definir cómo se mide el valor antes de hinchar el texto.
- **Gotchas > teoría**: fallos reales, excepciones, confusiones frecuentes.
- **Visión sistémica**: nuevas skills pueden empeorar el routing de las demás; vigilar solapamientos y regresiones.

## Cuándo crear una Skill

- El modelo falla sin contexto especializado o hay que forzar **consistencia** entre sesiones.
- Hay **criterios, excepciones o gotchas** que el modelo no maneja bien por defecto.
- El valor es **juicio / procedimiento / restricciones**, no solo un algoritmo cerrado.

## Cuándo no crear una Skill

- El modelo ya resuelve bien sin ella; el contenido repite políticas globales; es consejo genérico que no cambia actuación.
- El conocimiento **cambia muy rápido** o conviene **tiempo real / herramientas** en lugar de contexto estático.
- Si "sale en una sola pasada" sin esfuerzo, probablemente **no merece** skill o está mal acotada.

## Cuerpo de `SKILL.md`: qué priorizar

- Criterios de decisión, restricciones del dominio, **casos límite**, errores frecuentes del agente.
- Excepciones operativas, priorización entre alternativas, **secuencias** cuando el orden importa.
- Ejemplos **cortos** que desambigúen activación (sí vs no), no tutoriales largos.

## Estructura de directorio (progresiva)

Mantén el **núcleo** en `SKILL.md`. Mueve a apoyos lo condicional o pesado:

- `references/` — documentación extensa, tablas, detalle.
- `assets/` — plantillas, imágenes.
- `scripts/` — utilidades.

Opcional: `config.json` si tu entorno lo usa. Dependencias entre skills (`depends:` u homólogos): solo relaciones **claras y funcionales**.

## Orden de trabajo recomendado

1. **Evals**: positivos (debe cargarse / mejora), negativos (no debe cargarse), frontera.
2. **Description** de routing (estilo *cuándo cargar*, señales semánticas del dominio).
3. **Cuerpo** compacto orientado a decisiones.
4. **Jerarquía** de archivos para material accesorio.
5. Iterar con evidencia; publicar con **impacto neto positivo** y evals de regresión.

## Diagnóstico rápido

| Síntoma | Causa probable | Acción |
|---------|----------------|--------|
| Se activa demasiado | `description` demasiado amplia | Restringir condiciones; reforzar evals negativos. |
| No se activa cuando debe | Descripción estrecha o pocas señales | Añadir lenguaje del dominio y sinónimos; evals positivos. |
| Poca mejora | Texto genérico o poco accionable | Sustituir teoría por criterios, restricciones y gotchas. |
| Contexto pesado | Núcleo hinchado | Podar; mover a `references/` / `assets/`. |
| Conflictos entre skills | Solapamiento / routing ambiguo | Reescribir descripciones; revalidar el conjunto. |
| Envejece mal | Conocimiento inestable | Acotar o mover a fuentes dinámicas / herramientas. |

## Antipatrones

- Manual corporativo largo como skill; repetir lo que el modelo ya sabe; ignorar evals.
- Mezclar esencial y condicional sin jerarquía; "completitud humana" sin utilidad para el agente.
- Publicar sin medir interferencias; arreglar todo reescribiendo en vez de **añadir gotchas** puntuales.

## Mantenimiento

Enfoque **append-mostly**: añadir gotchas, excepciones y ajustes de routing desde fallos reales; **refinar** suele ser **podar** y precisar, no alargar.

## Referencia ampliada

Notas detalladas y checklist extensos: [references/perplexity-skill-design-notes.md](references/perplexity-skill-design-notes.md).

## Fuente

[Designing, refining, and maintaining agent skills at Perplexity](https://research.perplexity.ai/articles/designing-refining-and-maintaining-agent-skills-at-perplexity).
