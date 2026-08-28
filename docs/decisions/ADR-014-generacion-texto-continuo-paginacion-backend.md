# ADR-014 — Generación como texto continuo y paginación determinista en el backend

- **Versión:** v1.0.0
- **Fecha:** 2026-08-28
- **Estado:** ✅ **Aceptada** · **Fecha de aceptación:** 2026-08-28
- **Decisores:** autor del TFM
- **Relacionado con:** SPEC-01 (reformula R04-R08 y el contrato de entrada); troncal RF-05b, **RF-06b**, RF-09; INC-01 (T03, T07/T08); INC-02 (generación); [ADR-012](./ADR-012-indice-legibilidad-inflesz.md); tabla maestra de parámetros ([`context/domain/tabla-maestra-parametros.md`](../../context/domain/tabla-maestra-parametros.md))

---

## Contexto

El cuento se presenta en **páginas navegables** (RF-05b) y existe un requisito de **longitud
máxima por página** adaptada al perfil del lector. Hay dos formas de conseguirlo:

- **(a)** El LLM devuelve el cuento **ya partido en páginas** y el backend **rebalancea** las
  que exceden el máximo, arrastrando el sobrante en cascada a la página siguiente (es el modelo
  que describe **RF-06b** del troncal).
- **(b)** El LLM genera **narrativa continua** con una longitud **orientativa**, y el backend
  **pagina** de forma determinista según el perfil.

El modelo (a) tiene dos problemas: controlar la longitud a través del LLM es **poco fiable**
(los modelos no respetan recuentos exactos de palabras), y cualquier intento de re-partir o
regenerar una página concreta **arriesga incoherencia** con el resto del cuento.

---

## Decisión

Se adopta el modelo **(b)**:

- El LLM genera el cuento como **texto continuo**, con un objetivo de longitud **orientativo**
  (p. ej. «unas 200 palabras»); que se pase o se quede corto **no importa**.
- El **backend pagina** de forma **determinista**: reparte el texto en páginas de hasta
  `maxLengthPerPage` (**en palabras**, ver tabla maestra), **cortando siempre por frase
  completa**, nunca a mitad de palabra ni de frase, y generando **tantas páginas como haga
  falta** (el número de páginas **emerge**; no se fija de antemano).
- La **paginación es una función pura del dominio** (determinista, sin I/O) y **reutiliza la
  segmentación de frases** (INC-01-T03).
- **Caso límite:** una frase única más larga que `maxLengthPerPage` no se puede partir sin
  romperla → se **acepta la página sobredimensionada con un `warning`**; la decisión de
  regenerar es del orquestador (INC-02), no de la paginación.

---

## Justificación

- **Cada pieza hace lo que sabe:** el LLM narra; el control de formato y de adaptación es
  nuestro y **determinista**.
- **Adaptación real:** la paginación usa las **palabras/página de la franja de edad** en el
  momento de paginar, no en la generación; un mismo texto se pagina distinto para un lector de
  4 años que para uno de 9.
- **Sin riesgo de incoherencia:** al paginar (mover/repartir frases completas) nunca se
  reescribe contenido; desaparece el riesgo de «regenerar una página que no encaja con el
  resto».
- **Simplifica el algoritmo:** partiendo de texto continuo ya no hay «arrastre en cascada» de
  excesos entre páginas pre-partidas; es un reparto de una sola pasada.

---

## Alternativas consideradas

### (a) El LLM devuelve páginas + rebalanceo en cascada
- **A favor:** es el modelo que ya describía RF-06b.
- **En contra:** control de longitud poco fiable vía LLM; riesgo de incoherencia al re-partir;
  el rebalanceo en cascada es más complejo.
- **Motivo del descarte:** se descarta como modelo primario. **El algoritmo de corte por frase
  se conserva**, ahora como paginación de texto continuo.

### Número de páginas fijo por preset
- **A favor:** control exacto del número de páginas.
- **En contra:** obliga a repartir a un número rígido, menos natural.
- **Motivo del descarte:** el número de páginas **emerge** del tope de palabras/página más la
  longitud típica del preset; no hace falta fijarlo.

---

## Consecuencias

**Positivas:**
- Dominio simple, puro y determinista; adaptación por perfil; sin riesgo de incoherencia;
  menos dependencia del comportamiento del LLM.

**Negativas / riesgos:**
- **Reformula SPEC-01 (R04-R08) y su contrato de entrada** → SPEC-01 debe actualizarse a
  **v1.2.0** (tarea pendiente): el motor parte de narrativa continua, no de un `Story` ya
  paginado, y R05-R08 pasan de «rebalanceo» a «paginación».
- **RF-06b del troncal** describe el rebalanceo en cascada (modelo a): este ADR lo **refina**;
  conviene anotarlo cuando se actualice el troncal. El **resultado** (páginas que caben, corte
  por frase, página nueva para el sobrante) es equivalente.
- **RF-09** (un audio por página) se genera **después** de paginar; sigue siendo válido.
- Persiste el **caso de la frase sobredimensionada** (warning); su política de regeneración es
  del orquestador (INC-02).

---

## Notas de trazabilidad

- Reformula **SPEC-01-R04 a R08** y el contrato de entrada (§3); pendiente SPEC-01 v1.2.0.
- Refina **RF-06b** del troncal; mismo resultado, distinto punto de partida.
- Afecta a **INC-01** (T03 alimenta la paginación; T07/T08 pasan de «rebalanceo» a
  «paginación») y a **INC-02** (contrato de generación: texto continuo + longitud orientativa).
- La unidad `maxLengthPerPage` (palabras) y sus valores por franja viven en la
  [tabla maestra de parámetros](../../context/domain/tabla-maestra-parametros.md).
