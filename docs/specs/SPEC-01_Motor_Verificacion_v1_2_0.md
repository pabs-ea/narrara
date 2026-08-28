# SPEC-01 — Motor de verificación de restricciones

**Estado:** Aprobada · **Versión:** 1.2.0 · **Fecha:** 2026-08-28

> **Spec de Componente (SDD).** La plantilla y la metodología SDD viven en el documento
> contenedor `NarrARA_Specs`.
>
> - **Implementada por:** INC-01.
> - **Contrato en inglés** conforme a la convención de nomenclatura de código (ADR-007).

> **Cambios en v1.2.0** (sustituye a v1.1.0):
>
> - **Índice de legibilidad fijado: IFSZ / Escala INFLESZ** (antes «Fernández-Huerta / INFLESZ»
>   sin decidir) — **ADR-012**. `readabilityRange` se expresa en unidades IFSZ; **máximo
>   exclusivo y opcional** (sin techo cuando `max = null`).
> - **Modelo de paginación** en vez de rebalanceo: el motor parte de **narrativa continua** y la
>   **pagina** de forma determinista (antes recibía un `Story` ya paginado y rebalanceaba) —
>   **ADR-014**. Reformula R04-R08 y refina **RF-06b**.
> - **Contrato expresado con esquemas Zod** (regla de gobernanza nº5), no `interface` sueltas;
>   tipos derivados con `z.infer`.
> - **Longitud de frase por máximo, no por media** (`maxSentenceLength`); sin mínimo duro.
> - **Nombres propios** (`characterNames`) excluidos del cálculo de vocabulario.
> - **Detalle de página enriquecido** (qué páginas incumplen) y `Finding`/`Severity` definidos.
> - **Gherkin ampliado** (vocabulario, frase, frase sobredimensionada, validación de entrada).
> - **Caso de la frase sobredimensionada resuelto** (antes «a confirmar»).

### 1. Propósito

Dado un **cuento generado como texto continuo** y unos parámetros derivados del perfil, el motor
(1) **pagina** el texto de forma determinista según el perfil y (2) **verifica** de forma
determinista si cumple las restricciones duras (legibilidad, vocabulario y longitud de frase),
emitiendo un **veredicto**. Es el núcleo original del proyecto y la base de su capítulo de
evaluación.

### 2. Trazabilidad

- **Requisitos:** RF-05, RF-05b, RF-06, **RF-06b** (refinado por ADR-014), RF-08, RNF-07.
- **Historias de usuario:** HU-13 (verificación automática), HU-14 (paginación/longitud).
- **Incremento que lo implementa:** **INC-01**.
- **Decisiones:** **ADR-012** (índice IFSZ/INFLESZ), **ADR-014** (texto continuo + paginación).
- **Capa (Clean):** **Entities** — servicio de dominio puro, sin I/O, sin dependencias de framework.
- **Dependencias:** [tabla maestra de parámetros](../../context/domain/tabla-maestra-parametros.md)
  (valores por franja de edad); modelo de dominio `Story` / `Page`.

### 3. Entradas y salidas (contrato)

El contrato se expresa con **esquemas Zod** como fuente de verdad; los tipos de TypeScript se
**derivan** con `z.infer` (no se declaran a mano). La validación (`safeParse`) se aplica en la
frontera de entrada.

**Entrada:**

- `narrative: string` — texto **continuo** del cuento, **sin** la moraleja (la moraleja se
  verifica aparte) y **sin** paginar.
- `characterNames: ReadonlySet<string>` — nombres propios de los personajes (para excluirlos del
  cálculo de vocabulario, ver R02). Puede ser vacío.
- `parameters: VerificationParameters` — derivado del perfil y de la tabla maestra.

```ts
const VerificationParametersSchema = z.object({
  // IFSZ (ADR-012). min inclusivo, max EXCLUSIVO; max: null → sin techo.
  readabilityRange: z.object({ min: z.number(), max: z.number().nullable() }),
  maxLengthPerPage: z.number().int().positive(),   // PALABRAS por página
  maxSentenceLength: z.number().int().positive(),  // PALABRAS por frase (máximo)
  allowedFrequencyList: z.set(z.string()).refine((s) => s.size > 0),
  maxPercentageWordsOutsideList: z.number().min(0).max(100), // porcentaje 0-100
});
export type VerificationParameters = z.infer<typeof VerificationParametersSchema>;
```

**Salida:**

```ts
const SeveritySchema = z.enum(['error', 'warning']);

const FindingSchema = z.object({
  dimension: z.enum(['readability', 'vocabulary', 'sentenceLength', 'pageLength']),
  severity: SeveritySchema,
  message: z.string(),
  pageIndex: z.number().int().nonnegative().optional(), // si aplica a una página concreta
});
export type Finding = z.infer<typeof FindingSchema>;

const VerificationVerdictSchema = z.object({
  passes: z.boolean(),
  details: z.object({
    readability: z.object({ value: z.number(), passes: z.boolean() }),       // IFSZ obtenido
    vocabulary: z.object({ percentageOutside: z.number(), passes: z.boolean() }),
    sentenceLength: z.object({ maxFound: z.number(), passes: z.boolean() }), // frase más larga
    pageLength: z.object({ passes: z.boolean(), offendingPages: z.array(z.number().int()) }),
  }),
});
export type VerificationVerdict = z.infer<typeof VerificationVerdictSchema>;

const VerificationResultSchema = z.object({
  verdict: VerificationVerdictSchema,
  pages: z.array(PageSchema),          // resultado de la paginación (siempre presente)
  warnings: z.array(FindingSchema),
});
export type VerificationResult = z.infer<typeof VerificationResultSchema>;
```

> El motor devuelve **siempre** `pages` (el texto paginado). El ensamblado del `Story` final
> (título + páginas + moraleja) es responsabilidad del orquestador (INC-02), no del motor.

**Errores (entrada inválida → `InvalidVerificationInputError`, no un veredicto):**

- `narrative` vacío o solo espacios.
- `parameters` incompletos o mal formados (lo detecta el `safeParse` del esquema Zod).
- `allowedFrequencyList` vacía.
- `readabilityRange.min > max` (cuando `max` no es `null`).
- `maxLengthPerPage`, `maxSentenceLength` no positivos.
- `maxPercentageWordsOutsideList` fuera de `[0, 100]`.

### 4. Reglas de comportamiento

**Verificación de calidad (nivel cuento):**

- **SPEC-01-R01 (Legibilidad — IFSZ).** La legibilidad se calcula sobre el **texto completo**
  (`narrative`, sin moraleja) con el **Índice de Flesch-Szigriszt**
  `IFSZ = 206.835 − 62.3·(S/P) − (P/F)` (S sílabas, P palabras, F frases; **ADR-012**). Cumple si
  `readabilityRange.min ≤ IFSZ` **y** (`readabilityRange.max === null` **o** `IFSZ < readabilityRange.max`).
  El máximo es **exclusivo**; `null` significa **sin techo**.
- **SPEC-01-R02 (Vocabulario).** Se calcula el **porcentaje de palabras fuera** de
  `allowedFrequencyList` sobre el texto completo. Las palabras presentes en `characterNames`
  **cuentan como dentro de lista** (los nombres propios inventados no penalizan). Cumple si el
  porcentaje ≤ `maxPercentageWordsOutsideList`.
- **SPEC-01-R03 (Longitud de frase — máximo).** **Ninguna frase** debe superar
  `maxSentenceLength` palabras. Es un **máximo por frase** (no una media): `sentenceLength.passes`
  es cierto si la frase más larga ≤ `maxSentenceLength`. **No hay mínimo**: las frases cortas son
  válidas y deseables.

**Paginación (determinista):**

- **SPEC-01-R04 (Paginación por longitud).** El motor reparte `narrative` en páginas de hasta
  `maxLengthPerPage` **palabras**, **cortando siempre por frase completa** (R05). El número de
  páginas **emerge** del reparto; no se fija de antemano.
- **SPEC-01-R05 (Corte por límites naturales).** El corte se hace siempre por **frase completa**;
  nunca se parte una palabra ni una frase. Esto puede dejar una página ligeramente por debajo del
  máximo, lo cual es aceptable.
- **SPEC-01-R06 (Sobrante en páginas nuevas).** El texto restante forma **tantas páginas nuevas
  como haga falta**; si el sobrante supera por sí solo `maxLengthPerPage`, se generan varias
  páginas (sin límite rígido, sujeto a topes de sistema si se definen).
- **SPEC-01-R07 (Frase sobredimensionada).** Si una **frase única** supera `maxLengthPerPage`, no
  puede partirse sin romperla (R05): se **acepta la página sobredimensionada** y se emite un
  `Finding` de severidad `warning` (dimensión `pageLength`, con `pageIndex`). Esa página **no
  hace fallar** `pageLength.passes`; queda como advertencia para que el orquestador decida
  regenerar.
- **SPEC-01-R08 (Determinismo).** Dadas las mismas entradas, la paginación **y** el veredicto
  producen **siempre el mismo resultado**. Sin aleatoriedad.

**Veredicto y responsabilidades:**

- **SPEC-01-R09 (Veredicto).** `passes: true` solo si R01, R02, R03 se cumplen **y**
  `pageLength.passes` (todas las páginas ≤ `maxLengthPerPage`, salvo el caso R07 que va como
  warning). En caso contrario `passes: false` con el `details` del incumplimiento (para que el
  orquestador decida re-generar o degradar — RF-08).
- **SPEC-01-R10 (Separación de responsabilidades).** El motor **pagina y verifica**; **NO** genera
  ni reescribe texto ni llama al LLM. La decisión de re-generar es del orquestador (capa **Use
  Cases**, INC-02), no de este componente.
- **SPEC-01-R11 (Pureza).** El motor es una función pura del dominio: sin I/O, sin red ni
  persistencia, sin dependencias de Next ni de Genkit. Testeable con Vitest sin infraestructura.

### 5. Criterios de aceptación (Gherkin)

```gherkin
Escenario: Cuento que cumple todas las restricciones
  Dado un texto cuyo IFSZ está dentro del rango de legibilidad
  Y con un porcentaje de palabras fuera de lista por debajo del máximo
  Y sin ninguna frase que supere el máximo de palabras
  Cuando el motor pagina y verifica el cuento
  Entonces el veredicto es "cumple"
  Y las páginas resultantes no superan la longitud máxima

Escenario: Paginación por longitud de página
  Dado un texto continuo más largo que la longitud máxima de página
  Cuando el motor pagina el cuento
  Entonces se reparte en varias páginas por debajo del máximo
  Y el corte se realiza por frase completa
  Y ninguna palabra queda partida

Escenario: Sobrante que genera varias páginas nuevas
  Dado un texto cuyo sobrante final supera por sí solo la longitud máxima
  Cuando el motor pagina
  Entonces se crean tantas páginas nuevas como sean necesarias

Escenario: Frase única sobredimensionada
  Dado un texto con una sola frase más larga que la longitud máxima de página
  Cuando el motor pagina
  Entonces esa frase queda en una página sobredimensionada
  Y se emite una advertencia de tipo "pageLength"
  Y el veredicto no falla por longitud de página

Escenario: Cuento que no cumple la legibilidad
  Dado un texto cuyo IFSZ está por debajo del mínimo del rango
  Cuando el motor verifica el cuento
  Entonces el veredicto es "no cumple"
  Y el detalle indica el fallo de legibilidad

Escenario: Cuento que no cumple el vocabulario
  Dado un texto con más palabras fuera de lista que el máximo permitido
  Cuando el motor verifica el cuento
  Entonces el veredicto es "no cumple"
  Y el detalle indica el fallo de vocabulario

Escenario: Nombres propios no penalizan el vocabulario
  Dado un texto con nombres de personajes fuera de la lista de frecuencia
  Y esos nombres declarados en characterNames
  Cuando el motor verifica el vocabulario
  Entonces esos nombres no cuentan como palabras fuera de lista

Escenario: Cuento con una frase demasiado larga
  Dado un texto con una frase que supera el máximo de palabras por frase
  Cuando el motor verifica el cuento
  Entonces el veredicto es "no cumple"
  Y el detalle indica el fallo de longitud de frase

Escenario: Determinismo
  Dado un mismo texto y los mismos parámetros
  Cuando el motor pagina y verifica dos veces
  Entonces el resultado es idéntico en ambas ejecuciones

Escenario: Entrada inválida
  Dado un texto vacío o una lista de frecuencia vacía
  Cuando se invoca el motor
  Entonces se lanza InvalidVerificationInputError
  Y no se devuelve un veredicto
```

### 6. Casos límite y de error

- **Frase única > máximo de página** → se acepta la página sobredimensionada con `warning` (R07).
  Ya **no** queda «a confirmar»: es comportamiento definido.
- **Sobrante final > máximo de página** → varias páginas nuevas (R06).
- **Puntuación ambigua** (abreviaturas, diálogos con comillas) → la segmentación de frases debe
  ser robusta; se cubre con tests específicos. El conteo de frases (`F`) afecta al IFSZ, así que
  segmentación y legibilidad deben ser coherentes.
- **`narrative` vacío / parámetros nulos / lista vacía** → `InvalidVerificationInputError`.
- **Rango de legibilidad sin techo** (`max: null`) es válido (típico de F1).

### 7. Parámetros y configuración

Todos provienen de la
[tabla maestra de parámetros](../../context/domain/tabla-maestra-parametros.md) y del perfil;
**ninguno se hardcodea**: `readabilityRange` (IFSZ), `maxLengthPerPage` (palabras),
`maxSentenceLength` (palabras), `allowedFrequencyList`, `maxPercentageWordsOutsideList` (%). El
modo dislexia y la edad ajustan estos valores **aguas arriba** (no es responsabilidad del motor).

> **Pendientes de la tabla maestra:** el corpus de `allowedFrequencyList` (lista de frecuencia
> del español infantil) y el *delta* del modo dislexia. Los rangos actuales son provisionales
> (a afinar con pruebas); solo F1 · 70 palabras/página está anclado en un dato real.

### 8. Estrategia de test

> **TDD ≠ estrategia de test.** TDD (*Test-Driven Development*) es un **método de implementación**
> —**red** (escribir el test, que falle) → **green** (código mínimo que lo pasa) → **refactor**
> (añadir la lógica necesaria sin romper los tests)—, **no** un tipo de prueba. Esta sección
> define **qué se prueba y a qué nivel** (el plan de pruebas); **cómo se construye** cada pieza
> aplicando TDD es competencia del incremento (INC-01).

- **Unitario (Vitest) — el grueso:**
  - **Silabeo del español** (base del IFSZ): palabras de recuento silábico conocido, diptongos,
    hiatos, «h», «y».
  - **Legibilidad IFSZ** con textos de valor conocido (incluidos valores > 100 para verificar que
    no hay techo en F1).
  - **Vocabulario**: porcentaje fuera de lista; exclusión de `characterNames` (R02).
  - **Segmentación de frases** con puntuación difícil (diálogos, abreviaturas).
  - **Longitud de frase**: máximo por frase (R03), sin mínimo.
  - **Paginación** (R04-R07): corte por frase, varias páginas para el sobrante, frase
    sobredimensionada con warning; **determinismo (R08)** ejecutando dos veces.
  - **Veredicto (R09)**: combinaciones cumple/no-cumple por dimensión.
  - **Validación de entrada**: los seis casos de §3 → excepción.
  - **Pureza (R11)**: el módulo no importa nada fuera de `domain/` (lo verifica el linter).
- **Integración (Vitest):** el motor con un texto continuo mock completo, anticipando su uso
  desde el pipeline (INC-02).
- **E2E (Playwright):** cubierto indirectamente en el flujo «crear cuento» (no específico).
- **Orden de implementación sugerido (aplicando TDD en INC-01):** silabeo → legibilidad →
  vocabulario/segmentación → longitud de frase → veredicto → paginación (lo más complejo), regla
  a regla.
- **Corpus de prueba:** iniciar en `tests/corpus/` los textos que **deben** pasar y que **deben**
  fallar por cada dimensión (activo del capítulo de evaluación).

### 9. Fuera de alcance

- **No** genera ni reescribe texto (eso es del orquestador + LLM). Paginar **reparte**, no
  reescribe.
- **No** ensambla el `Story` final (título + moraleja) ni genera audio: eso es aguas arriba/abajo.
- **No** verifica la moraleja (spec aparte).
- **No** modera contenido (spec aparte — guardarraíl de seguridad).
- **No** decide re-generar ni cuántos reintentos (orquestador, RF-08 / RNF-07).
- **No** accede a persistencia ni a servicios externos (R11).
