# INC-01 — Motor de verificación

**Estado:** Planificado · **Versión:** 1.1.0 · **Fecha:** 2026-08-28

> **Incremento del núcleo defendible.** Implementa `SPEC-01` v1.2.0 (motor de verificación de
> restricciones). Es la primera pieza de lógica de dominio del proyecto y la base de su capítulo
> de evaluación. Se construye enteramente con **TDD** (red-green-refactor) y contra dobles de
> prueba, sin IA real ni persistencia.

> **Cambios en v1.1.0** (alineación con SPEC-01 v1.2.0 y ADR-012/013/014/015):
>
> - El motor **pagina texto continuo** (ADR-014) en vez de rebalancear un `Story` ya paginado;
>   R04-R08 pasan de «rebalanceo» a «paginación».
> - Legibilidad = **IFSZ/INFLESZ** (ADR-012); nueva pieza: **silabeador** vía `silabajs` tras un
>   port (ADR-015).
> - Contrato en **Zod**; `Finding`/`Severity`/`characterNames`/`VerificationResult`.
> - Longitud de frase por **máximo** (no media); nombres propios excluidos del vocabulario.
> - **Tareas reescritas como ciclos TDD** (RED → GREEN → REFACTOR) con fichero de test y comando.
> - §7 aclara: TDD es el **método de implementación**, no el plan de test.
> - Bloqueo de la tabla maestra **degradado**: ya existe con valores provisionales.

---

### 1. Objetivo y valor

Entregar el **motor de verificación determinista** que, dada la **narrativa continua** de un
cuento y unos parámetros derivados del perfil, **pagina** el texto y **verifica** su cumplimiento
(legibilidad IFSZ, vocabulario, longitud de frase, longitud de página), emitiendo un
**veredicto**. Es el componente que sostiene la contribución central del TFM —verificar de forma
**auditable y reproducible**—, por lo que debe quedar probado **antes** de depender de ningún
proveedor de IA real (INC-04).

### 2. Alcance

- **Incluye:**
  - El servicio de dominio `VerificationEngine` conforme al contrato de SPEC-01 v1.2.0 (§3):
    entrada `{ narrative, characterNames, parameters }`, salida `VerificationResult`
    (`verdict` + `pages` + `warnings`).
  - Las funciones puras: tokenización de palabras, segmentación de frases, **legibilidad IFSZ**,
    porcentaje de vocabulario fuera de lista (excluyendo `characterNames`), longitud máxima de
    frase, y **paginación** (corte por frase, varias páginas, frase sobredimensionada con
    `warning`, determinismo).
  - El **silabeador** del español (`silabajs` tras un port propio) para el conteo de sílabas del
    IFSZ (ADR-015).
  - El contrato tipado con **Zod** y la validación de entrada con `InvalidVerificationInputError`.
  - Las reglas de dominio como código propio en `src/domain/verification/`.
- **NO incluye:**
  - Generación ni reescritura de texto (orquestador + LLM, INC-02/INC-04). Paginar **reparte**,
    no reescribe.
  - La producción de `characterNames`, `title` y `moral` (los autoría el LLM; contrato de
    generación, SPEC-02).
  - El ensamblado del `Story` final (título + moraleja) y el audio (aguas arriba/abajo).
  - La decisión de re-generar o cuántos reintentos (orquestador, INC-02).
  - Verificación de la moraleja (spec aparte) y moderación (INC-03).
  - Cualquier llamada a IA, red o persistencia (SPEC-01-R11: pureza).
  - La derivación perfil → `VerificationParameters` (capa Use Cases, INC-02).

### 3. Trazabilidad

- **Requisitos:** RF-05, RF-05b, RF-06, RF-06b (refinado por ADR-014), RF-08, RNF-07.
- **Historias de usuario:** HU-13 (verificación automática), HU-14 (paginación/longitud).
- **Spec de componente:** **SPEC-01 v1.2.0**.
- **Decisiones:** ADR-012 (IFSZ/INFLESZ), ADR-013 (nivel de lectura, propuesta), ADR-014 (texto
  continuo + paginación), ADR-015 (silabeador `silabajs` + fallback).
- **Parámetros:** [tabla maestra](../../context/domain/tabla-maestra-parametros.md).
- **Capa (Clean):** Entities — servicio de dominio puro (con el silabeador inyectado).

### 4. Dependencias y precondiciones

- **Incrementos:** INC-00 completado (esqueleto, tooling, CI, regla de dependencia por linter,
  composition root ensamblado).
- **Decisiones:** ADR-007 (estructura y nomenclatura en inglés) ✅; ADR-012/014/015 ✅.
- **Dependencia nueva:** `silabajs` (v2.1.0, pinned; MIT). context7 no la indexa → fijar versión
  y revisar su página antes de actualizar (ADR-015).
- **Modelo de dominio:** entidades `Story` / `Page` (se crean en T01 si INC-00 no las dejó).
- **🟠 Bloqueo degradado — valores de la tabla maestra.** La
  [tabla maestra](../../context/domain/tabla-maestra-parametros.md) **ya existe** con valores
  **provisionales** (solo F1·70 palabras/página anclado en dato real; falta el corpus de
  `allowedFrequencyList` y el delta de dislexia). INC-01 puede alcanzar **«verde estructural» y
  «verde con valores provisionales»**; el **«verde validado»** contra valores definitivos queda
  condicionado al afinado con pruebas y a la lista de frecuencia.

### 5. Puertos y adaptadores afectados

- **Una abstracción y un adaptador** (novedad respecto a v1.0.0, por el IFSZ):
  - `SyllableCounter` — **tipo función de dominio** (`(word: string) => number`) que el cálculo
    de legibilidad recibe **inyectado**. Vive en el dominio; el dominio depende solo de este tipo.
  - `silabajsSyllableCounter` — **adaptador** en `src/adapters/text/` que implementa
    `SyllableCounter` envolviendo `silabajs`. Se **cablea en el composition root**.
- **Cumplimiento de la regla de dependencia:** el dominio **no importa** `silabajs`; recibe la
  función por parámetro (inversión de dependencias). Así el motor sigue siendo **puro** (R11) y el
  único punto de contacto externo queda aislado y sustituible (fallback de ADR-015 sin tocar el
  dominio).
- El resto de dobles de prueba son **entradas mock construidas en los tests** (narrativa +
  parámetros), no adaptadores.

### 6. Tareas (`INC-01-Txx`)

Cada tarea es un **ciclo TDD**: **RED** (escribir el test, que falle) → **GREEN** (código mínimo
que lo pasa) → **REFACTOR** (afinar sin romper). Comando de una pasada: `pnpm test:run <patrón>`.
Orden dependiente: primero las bases (tokenización, segmentación, silabeo), luego los cálculos,
luego paginación y veredicto, y por último la fachada y el cableado.

- **INC-01-T01 · Entidades `Story` / `Page` y value objects (`Title`, `Moral`).**
  - **RED:** `src/domain/story/__tests__/story.test.ts` — construir `Page` con texto válido;
    `Page` con texto vacío → error de invariante; `Story` con ≥1 página y `title`/`moral`
    válidos; `Story` sin páginas → error. `pnpm test:run story` → falla.
  - **GREEN:** `src/domain/story/{story,page,title,moral}.ts` con invariantes en construcción.
  - **REFACTOR:** extraer value objects comunes; mensajes de error claros.

- **INC-01-T02 · Contrato Zod de SPEC-01.**
  - **RED:** `src/domain/verification/__tests__/contract.test.ts` — `VerificationParametersSchema`
    acepta un objeto válido y rechaza (`safeParse`) uno con `readabilityRange.min > max`,
    `maxLengthPerPage ≤ 0`, `%` fuera de `[0,100]`, lista vacía. `pnpm test:run contract` → falla.
  - **GREEN:** `src/domain/verification/contract.ts` — esquemas Zod
    (`VerificationParameters`, `VerificationInput`, `Finding`, `Severity`, `VerificationVerdict`,
    `VerificationResult`) con tipos derivados por `z.infer`; clase `InvalidVerificationInputError`.
  - **REFACTOR:** centralizar mensajes; asegurar `readabilityRange.max` **opcional/`null`**.

- **INC-01-T03 · Tokenización de palabras (`tokenize`).**
  - **RED:** `src/domain/verification/text/__tests__/tokenize.test.ts` — cuenta palabras con
    tildes/`ñ`, ignora signos y números sueltos, `case-insensitive` para comparación.
    `pnpm test:run tokenize` → falla.
  - **GREEN:** `src/domain/verification/text/tokenize.ts` (función pura).
  - **REFACTOR:** normalización (minúsculas, guiones internos); tabla de casos.

- **INC-01-T04 · Segmentación de frases (`segmentSentences`).**
  - **RED:** `src/domain/verification/text/__tests__/segment-sentences.test.ts` — separa por
    `. ! ?`; respeta **abreviaturas** (`Sr.`, `etc.`) y **diálogos con comillas**; texto de una
    sola frase → 1 frase. `pnpm test:run segment` → falla.
  - **GREEN:** `src/domain/verification/text/segment-sentences.ts` (función pura, determinista).
  - **REFACTOR:** lista de abreviaturas configurable; batería de casos difíciles. Alimenta R01
    (F), R03 y paginación → criterio de fin de frase **único**.

- **INC-01-T05 · Silabeador (`SyllableCounter` + adaptador `silabajs`) — ADR-015.**
  - **RED:** `src/domain/verification/readability/__tests__/syllable-counter.test.ts` — corpus de
    recuento conocido cubriendo hiato `ríe`→2, diptongo `cielo`→2, triptongo `buey`→1, «h» muda
    `ahora`→3, «y` `rey`→1. `pnpm test:run syllable` → falla.
  - **GREEN:** tipo `SyllableCounter` en `.../readability/syllable-counter.ts`; adaptador
    `src/adapters/text/silabajs-syllable-counter.ts` que envuelve `silabajs`. El test usa el
    adaptador; código mínimo para pasar el corpus.
  - **REFACTOR:** extraer el corpus a `tests/corpus/syllables.ts`. **Si el corpus revela errores
    de `silabajs` → fallback implementación propia por reglas, sin tocar el tipo/port** (ADR-015).

- **INC-01-T06 · Legibilidad IFSZ (`computeReadability`) — R01.**
  - **RED:** `src/domain/verification/readability/__tests__/readability.test.ts` — `IFSZ = 206.835
    − 62.3·(S/P) − (P/F)` sobre textos de valor conocido (p. ej. el simple ≈107 **> 100**, para
    verificar que **no hay techo**); `min ≤ IFSZ` y `max` exclusivo/`null`. `pnpm test:run
    readability` → falla.
  - **GREEN:** `computeReadability(text, { countSyllables, segmentSentences, tokenize })` — función
    pura que **recibe inyectado** el contador de sílabas (no importa `silabajs`).
  - **REFACTOR:** precisión numérica (usar `206.835`); casos de texto vacío ya cubiertos por
    validación.

- **INC-01-T07 · Vocabulario fuera de lista (`computeVocabulary`) — R02.**
  - **RED:** `.../rules/__tests__/vocabulary.test.ts` — `%` de palabras fuera de
    `allowedFrequencyList`; **los `characterNames` cuentan como dentro** (no penalizan);
    `% ≤ max` cumple. `pnpm test:run vocabulary` → falla.
  - **GREEN:** `src/domain/verification/rules/vocabulary.ts` (usa `tokenize`, resta `characterNames`).
  - **REFACTOR:** comparación normalizada; devolver también `percentageOutside`.

- **INC-01-T08 · Longitud de frase máxima (`computeMaxSentenceLength`) — R03.**
  - **RED:** `.../rules/__tests__/sentence-length.test.ts` — devuelve la longitud de la **frase más
    larga** (en palabras); cumple si `maxFound ≤ maxSentenceLength`; **frases cortas nunca fallan**
    (sin mínimo). `pnpm test:run sentence-length` → falla.
  - **GREEN:** `src/domain/verification/rules/sentence-length.ts` (usa `segmentSentences` + `tokenize`).
  - **REFACTOR:** exponer `maxFound` para el `details` del veredicto.

- **INC-01-T09 · Paginación (`paginate`) — R04-R08.**
  - **RED:** `.../pagination/__tests__/paginate.test.ts` — llena hasta `maxLengthPerPage`
    (palabras) cortando **por frase**; sobrante → **varias páginas** (R06); **frase única
    sobredimensionada** → página aceptada + `Finding` `warning` (R07); **determinismo** ejecutando
    dos veces (R08). `pnpm test:run paginate` → falla.
  - **GREEN:** `src/domain/verification/pagination/paginate.ts` (usa `segmentSentences` + `tokenize`).
  - **REFACTOR:** reparto de una sola pasada; sin aleatoriedad; `warnings` con `pageIndex`.

- **INC-01-T10 · Validación de entrada (`validateInput`) — §3 errores.**
  - **RED:** `.../__tests__/validate-input.test.ts` — narrativa vacía, `parameters` inválidos
    (`safeParse`), lista vacía, `min>max`, valores no positivos, `%` fuera de rango →
    `InvalidVerificationInputError` (no veredicto). `pnpm test:run validate-input` → falla.
  - **GREEN:** `src/domain/verification/validate-input.ts` (apoyado en el esquema Zod de T02).
  - **REFACTOR:** mensajes que identifican el campo que falla.

- **INC-01-T11 · Composición del veredicto (`composeVerdict`) — R09.**
  - **RED:** `.../__tests__/verdict.test.ts` — `passes` cierto solo si R01∧R02∧R03∧`pageLength`;
    `details` por dimensión con `value`/`passes`; el warning de frase sobredimensionada **no**
    hace fallar `pageLength`. `pnpm test:run verdict` → falla.
  - **GREEN:** `src/domain/verification/verdict.ts`.
  - **REFACTOR:** construir `Finding[]` coherentes con las dimensiones.

- **INC-01-T12 · Fachada `VerificationEngine.verify(input)` — R10, R11.**
  - **RED:** `.../__tests__/verification-engine.test.ts` — con narrativa mock + parámetros:
    valida → mide → pagina → compone → devuelve `VerificationResult`; un caso que cumple y otro que
    falla por cada dimensión. `pnpm test:run verification-engine` → falla.
  - **GREEN:** `src/domain/verification/verification-engine.ts` (orquesta las funciones puras;
    recibe `countSyllables` inyectado; **no** importa nada externo).
  - **REFACTOR:** firma limpia; sin lógica de reintento (es del orquestador, R10).

- **INC-01-T13 · Cableado y pureza (composition root).**
  - **RED:** `src/composition/__tests__/verification.integration.test.ts` — el engine cableado con
    `silabajsSyllableCounter` procesa una narrativa mock completa de principio a fin. `pnpm
    test:run verification.integration` → falla.
  - **GREEN:** ensamblar en `src/composition/` el engine con el adaptador real de `silabajs`.
  - **REFACTOR:** confirmar que **`pnpm lint`** (regla de dependencia) no reporta imports del
    dominio hacia fuera de `domain/` (pureza R11); el adaptador vive en `adapters/`.

- **INC-01-T14 · Corpus de evaluación (`tests/corpus/`).**
  - Sin ciclo RED/GREEN clásico: es **material de datos**. Reunir textos que **deben pasar** y que
    **deben fallar** por cada dimensión (legibilidad, vocabulario, frase, página), usando los
    valores **provisionales** de la tabla maestra. Etiquetado y versionado desde el inicio (activo
    del capítulo de evaluación).

### 7. Estrategia de test

> **TDD ≠ estrategia de test.** TDD (red → green → refactor) es el **método de implementación** de
> las tareas del §6; esta sección define **qué se prueba y a qué nivel** (el plan de pruebas),
> alineado con SPEC-01 §8.

- **Unitario (Vitest) — el grueso** (una batería por función pura del §6): silabeo, legibilidad
  IFSZ (incluidos valores > 100), vocabulario (con exclusión de `characterNames`), segmentación,
  longitud de frase (máximo), paginación (corte por frase, varias páginas, frase sobredimensionada,
  **determinismo dos pasadas**), veredicto, validación de entrada.
- **Integración (Vitest):** el engine cableado (T13) con narrativa mock completa, anticipando su
  uso desde el pipeline (INC-02).
- **Pureza (R11):** la verifica la **regla de dependencia del linter** (el dominio no importa nada
  fuera de `domain/`; `silabajs` solo aparece en `adapters/`).
- **E2E:** N/A en este incremento (se cubre indirectamente en INC-06).
- **Corpus (`tests/corpus/`):** textos que deben pasar/fallar por dimensión (T14) — activo de
  evaluación.

### 8. Definition of Done (`INC-01-DoDxx`)

- **INC-01-DoD01.** `Story`, `Page`, `Title`, `Moral` existen en `src/domain/story/` con sus
  invariantes y tests en verde (T01).
- **INC-01-DoD02.** El contrato de SPEC-01 v1.2.0 está tipado con **Zod** en
  `src/domain/verification/`, con `z.infer` y `InvalidVerificationInputError` (T02).
- **INC-01-DoD03.** Tokenización y segmentación pasan sus tests, incluidos casos de puntuación
  difícil (T03, T04).
- **INC-01-DoD04.** El **silabeador** (`silabajs` tras port) pasa el corpus de recuentos conocidos
  (hiato/diptongo/triptongo/«h»/«y»); si falla, el fallback propio lo pasa (T05, ADR-015).
- **INC-01-DoD05.** La **legibilidad IFSZ** (R01) es correcta en textos de valor conocido,
  **incluido un valor > 100 sin techo en F1**, con el silabeador inyectado (T06).
- **INC-01-DoD06.** **Vocabulario** (R02) con **exclusión de `characterNames`** y **longitud de
  frase** por máximo (R03) pasan sus tests (T07, T08).
- **INC-01-DoD07.** La **paginación** (R04-R08) cumple: corte por frase, varias páginas para el
  sobrante, frase sobredimensionada con `warning`, y **determinismo** (dos pasadas idénticas) (T09).
- **INC-01-DoD08.** La **entrada inválida** lanza `InvalidVerificationInputError` en todos los casos
  del §3 (T10).
- **INC-01-DoD09.** El **veredicto** (R09) devuelve `passes` y `details` correctos por dimensión
  (T11).
- **INC-01-DoD10.** `VerificationEngine.verify` es invocable como función pura, con el silabeador
  inyectado, y su **test de integración** cableado pasa en verde (T12, T13).
- **INC-01-DoD11.** **Pureza (R11):** `pnpm lint` no reporta imports del dominio hacia fuera de
  `domain/`; `silabajs` solo en `adapters/` (T13).
- **INC-01-DoD12.** Los **escenarios Gherkin de SPEC-01 §5** tienen su test correspondiente,
  referenciado por nombre (`SPEC-01 / escenario …`).
- **INC-01-DoD13.** Existe un **corpus** en `tests/corpus/` con al menos un caso que debe pasar y
  uno que debe fallar por cada dimensión (T14).

> **DoD y valores de la tabla maestra.** Con los valores **provisionales** se cierran
> DoD01-DoD13 en «verde con valores provisionales». El **«verde validado»** contra valores
> definitivos exige afinar rangos con pruebas y disponer del corpus de `allowedFrequencyList`.

### 9. Riesgos y notas

- **🟠 Valores de la tabla maestra (degradado).** Ya existe con valores provisionales; falta el
  corpus de `allowedFrequencyList` y el delta de dislexia. **Mitigación:** todo se lee de la tabla
  (nada hardcodeado), así que fijar valores definitivos es cambiar configuración, no lógica.
- **Riesgo — `silabajs` nuevo y de baja adopción** (corazón de la métrica). **Mitigación:** port +
  corpus de validación + fallback propio, ya previstos (ADR-015); versión fijada.
- **Riesgo — segmentación de frases en español** (abreviaturas, diálogos). **Mitigación:** T04 se
  hace pronto, con batería propia; su criterio de fin de frase es **único** para R01/R03/paginación.
- **Nota — frase única sobredimensionada resuelta** (SPEC-01-R07): página aceptada con `warning`;
  ya **no** es «a confirmar».
- **Nota — el motor no decide re-generar** (R10): emite veredicto; la política de reintentos es del
  orquestador (INC-02).
- **Nota — el dominio no importa `silabajs`:** se inyecta la función `countSyllables`; el import
  vive en `adapters/` y se cablea en el composition root (regla de dependencia).
- **Nota — corpus como activo de evaluación** (T14): evidencia del capítulo de evaluación;
  etiquetarlo y versionarlo desde el principio.
