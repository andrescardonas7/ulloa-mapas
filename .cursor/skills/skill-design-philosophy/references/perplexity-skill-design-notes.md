# Notas ampliadas: diseño, refinamiento y mantenimiento de Agent Skills

Resumen estructurado inspirado en el artículo de Perplexity sobre skills. El núcleo operativo está en `../SKILL.md`; este archivo es material de apoyo (carga bajo demanda).

**Fuente:** [Designing, refining, and maintaining agent skills at Perplexity](https://research.perplexity.ai/articles/designing-refining-and-maintaining-agent-skills-at-perplexity)

---

## Qué es una Skill (más que un prompt)

- Instrucciones, archivos auxiliares, scripts, referencias, assets y configuración.
- Cápsula operativa de conocimiento especializado activada bajo demanda.
- No es software determinista clásico: el objetivo es **moldear comportamiento probabilístico** con contexto bien seleccionado.
- Cada línea compite por atención en una ventana finita: texto irrelevante u obvio **degrada** el resultado.

## Por qué importan

- Los modelos generales no siempre resuelven bien tareas **especializadas, repetibles o sensibles a errores**.
- El valor no es solo “más instrucciones”, sino **mejor decisión**: cuándo usar herramientas, excepciones, reglas de dominio, errores a evitar, información a priorizar.

## Estructura típica de directorio

| Componente | Rol |
|------------|-----|
| `SKILL.md` | Corazón: nombre, descripción, cuerpo instructivo; posible `depends:` u homólogos. |
| `scripts/` | Utilidades o lógica auxiliar. |
| `references/` | Documentación o fuentes internas del dominio. |
| `assets/` | Imágenes, plantillas u otros recursos. |
| `config.json` | Configuración adicional si aplica. |

Separar lo esencial del accesorio: núcleo enfocado; lo pesado o condicional fuera del cuerpo principal.

## `SKILL.md`

- No convertirlo en mezcla caótica de manuales y notas.
- Mantener **claro, legible y orientado a decisiones operativas**, no enciclopedia.

## Descripción y routing

- La descripción es crítica: ayuda al sistema a decidir **cuándo cargar** la skill.
- Estilo recomendable: **condiciones de activación** (*Load when…* / cuándo cargar).
- Debe captar: tipo de tarea, señales semánticas, **límites del dominio**.
- Fallos frecuentes por mala descripción:
  - Carga cuando no debe → ruido y costo.
  - No carga cuando debe → respuestas pobres o inconsistentes.

## Regla guía por línea

**¿El agente fallaría sin esta instrucción?** Si no, sobra.

## Costo de contexto

- Más texto → más tokens, más interferencia con otras instrucciones.
- Implicaciones:
  - No duplicar conocimiento que el modelo ya domina.
  - No duplicar instrucciones globales del sistema.
  - Preferir regla corta, excepciones o ejemplo límite frente a párrafos largos.
  - No meter en el núcleo material movible a referencias o assets.

## Cuándo crear / no crear

Ver tabla resumida en `SKILL.md`. Añadido aquí: si la skill parece “demasiado fácil de escribir de una pasada”, puede que **no haga falta** o que el problema esté mal acotado.

## Contenido valioso en el cuerpo

- Criterios de decisión, restricciones, casos límite, errores frecuentes del agente.
- Excepciones operativas, reglas de priorización, secuencias cuando el orden importa.
- Enseñar **cómo pensar y qué evitar**, no solo información descriptiva.

## Ejemplos

- Útiles cuando aclaran **límites, activación, desambiguación o fallos típicos**.
- Evitar inundar con demos largas.
- Un buen ejemplo contrasta **cuándo sí** vs **cuándo no** debe activarse la skill (mejora routing).

## Evals antes de escribir la skill

Incluir:

- Casos **positivos** (debe cargarse y mejorar).
- Casos **negativos** (no debe cargarse).
- Casos **frontera o ambiguos**.

Sin forma de probar, el refinamiento tiende a intuición y parches.

## Flujo de trabajo (orden)

1. Escribir evaluaciones.
2. Diseñar descripción de routing.
3. Redactar cuerpo central.
4. Mover material condicional o pesado a jerarquía de apoyo.
5. Iterar con pruebas y fallos reales.
6. Publicar cuando haya valor estable y acotado.

## Routing: buenas prácticas

- Descripciones centradas en **condiciones de uso**, no en marketing interno.
- Evals positivos y negativos para activación.
- Lenguaje que capture dominio y **sinónimos**.
- Evitar solapamientos ambiguos entre skills vecinas.
- Al añadir una skill nueva, revisar comportamiento del router global.

## Progresividad

- No volcar todo de una vez: primero esencial; lo pesado o situacional después o en archivos de apoyo.
- Jerarquía para lo condicional: `references/`, `assets/`, procedimientos de baja frecuencia.

## Gotchas

- Observaciones sobre fallos repetidos, confusiones, matices que el modelo maneja mal.
- Tratarlos como activo central, no nota marginal.

## Mantenimiento append-mostly

- Acumular gotchas, restricciones y ajustes de descripción desde uso real.
- No es crecer sin control: priorizar observaciones **precisas**.

## Reacción ante fallos

| Problema | Acción típica |
|----------|----------------|
| Falla dentro del dominio correcto | Añadir o mejorar gotcha. |
| Carga donde no debe | Ajustar descripción; reforzar evals negativos. |
| No carga donde debe | Ampliar señales semánticas; evals positivos. |
| Demasiado pesada | Mover fuera del núcleo o simplificar. |

## Documentación obvia

- Evitar explicaciones “bonitas” pero poco útiles; no tutoriales largos si el objetivo es guiar decisiones.

## Interoperabilidad y regresiones

- Una skill nueva puede afectar a otras (routing ambiguo, competencia por mismos casos, contexto genérico).
- Mantener skills es optimizar **el sistema completo**.
- Mejoras locales pueden regresar otros comportamientos sin evals amplias.

## Refinar

- Refinar ≠ alargar: más **precisión**, menor costo de contexto, mejor routing, más robustez.
- A menudo refinar = **podar**; la descripción suele ser lo más difícil.

## Dependencias

- Declarar con campos tipo `depends:` cuando tenga sentido **funcional**.
- Evitar redes opacas difíciles de depurar.

## Publicación

Una skill está razonablemente lista cuando:

- Descripción suficientemente precisa.
- Evals positivos, negativos y de frontera.
- Cuerpo compacto y útil.
- Gotchas alineados a fallos reales.
- Impacto neto positivo sin regresiones significativas.

## Principios (lista compacta)

- Minimalismo útil; routing preciso; evaluación primero; contexto progresivo; gotchas sobre teoría; mantenimiento incremental; visión sistémica.

## Checklist operativo

### Antes de escribir

- Problema y alcance claros; confirmar que el modelo falla sin la skill.
- Decidir qué parte es **estable** y merece contexto persistente.
- Preparar evals positivos, negativos y de frontera.

### Al redactar la descripción

- Cuándo debe cargarse; delimitar dominio; señales semánticas; evitar vaguedad tipo marketing.

### Al redactar el cuerpo

- Solo instrucciones que cambian resultados; criterios, restricciones, excepciones; podar teoría innecesaria; núcleo corto.

### Al estructurar archivos

- Núcleo en `SKILL.md`; material pesado o condicional en apoyos; separar central vs soporte.

### Al probar

- Carga correcta en positivos; no carga en negativos; ambiguos; regresiones frente a otras skills.

### Al mantener

- Añadir gotchas ante fallos; ajustar descripción si el routing falla; podar redundancia; alinear con evidencia real.

## Tabla de diagnóstico (duplicado intencional para consulta offline)

| Síntoma | Causa probable | Acción recomendada |
|---------|----------------|-------------------|
| Se activa demasiado | Descripción demasiado amplia | Restringir activación; evals negativos. |
| No se activa cuando debe | Descripción estrecha o pocas señales | Lenguaje del dominio; evals positivos. |
| Mejora poca | Contenido genérico | Criterios, restricciones, gotchas. |
| Sistema más pesado | Exceso en el núcleo | Podar; mover a auxiliares. |
| Conflictos con otras skills | Solapamiento / routing ambiguo | Revisar descripciones; revalidar conjunto. |
| Envejece mal | Conocimiento inestable | Acotar o fuentes dinámicas. |

## Antipatrones (lista)

- Skill como documentación corporativa extensa; repetir conocimiento general; sin evals; descripciones vagas; mezclar esencial y condicional sin jerarquía; texto por completitud humana; reescribir todo en vez de gotchas dirigidos; publicar sin medir interferencias.

---

*Este archivo es referencia larga; preferir el núcleo en `SKILL.md` para sesiones con presupuesto de contexto ajustado.*
