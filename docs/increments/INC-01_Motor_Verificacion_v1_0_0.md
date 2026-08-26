# INC-01 — Motor de verificación

**Estado:** Planificado · **Versión:** 1.0.0 · **Fecha:** 2026-08-26

> **Incremento del núcleo defendible.** Implementa `SPEC-01` (motor de verificación de restricciones). Es la primera pieza de lógica de dominio del proyecto y la base de su capítulo de evaluación. Se construye enteramente contra dobles de prueba, sin IA real ni persistencia.

---

### 1. Objetivo y valor

Entregar el **motor de verificación determinista** que, dado un cuento generado y unos parámetros derivados del perfil, emite un **veredicto** de cumplimiento (legibilidad, vocabulario, longitud de frase y de página) y aplica el **rebalanceo en cascada** de páginas cuando se excede la longitud máxima. Es el componente que sostiene la contribución central del TFM —verificar de forma auditable y reproducible—, por lo que debe quedar probado y evaluado **antes** de depender de ningún proveedor de IA real (INC-04).

### 2. Alcance

- **Incluye:**
  - El servicio de dominio `VerificationEngine` conforme al contrato de SPEC-01 (§3): entrada `Story` + `VerificationParameters`, salida `VerificationVerdict`.
  - Las funciones puras de cálculo: legibilidad (Fernández-Huerta / INFLESZ), porcentaje de vocabulario fuera de lista, longitud media de frase y segmentación de frases.
  - El rebalanceo en cascada (SPEC-01-R05 a R08), con corte por frase completa y creación de página nueva al final.
  - Las reglas de dominio como código propio en `src/domain/verification/rules/`.
  - La validación de entrada con excepción `InvalidVerificationInputError` (no veredicto) ante cuento vacío, parámetros incompletos o lista de frecuencia vacía.
- **NO incluye:**
  - Generación ni reescritura de texto (es del orquestador + LLM, INC-02/INC-04).
  - La decisión de re-generar o cuántos reintentos (orquestador del pipeline, INC-02).
  - Verificación de la moraleja (spec aparte).
  - Moderación de contenido (INC-03).
  - Cualquier llamada a IA, red o persistencia (SPEC-01-R11: pureza).
  - La derivación perfil → `VerificationParameters`, que ocurre aguas arriba en la capa Use Cases (INC-02) y no en el motor.

### 3. Trazabilidad

- **Requisitos:** RF-05, RF-06, RF-06b, RF-08, RNF-07.
- **Historias de usuario:** HU-13 (verificación automática), HU-14 (rebalanceo).
- **Specs de componente referenciadas:** **SPEC-01** (Motor de verificación de restricciones), v1.1.0.
- **Capa (Clean):** Entities — servicio de dominio puro.

### 4. Dependencias y precondiciones

- **Incrementos:** INC-00 completado (esqueleto, tooling, CI, regla de dependencia por linter, `StoryRepository` stub y composition root ensamblados).
- **Decisiones:** ADR-007 v1.1.0 (estructura y nomenclatura) ✅; convención de código en inglés ✅.
- **🔴 Bloqueo activo (heredado de SPEC-01 §7).** El motor no puede completarse sin la **tabla maestra de parámetros con valores concretos** (§19.1 del troncal): rangos de legibilidad por franja de edad, longitud máxima por página, lista de frecuencia de vocabulario, umbrales de porcentaje y de longitud media de frase. **Es la precondición crítica de mayor prioridad.** Sin ella pueden escribirse las funciones de cálculo y sus tests con valores de prueba, pero no puede validarse el comportamiento real ni cerrarse el DoD.
- **Modelo de dominio:** entidades `Story` y `Page` disponibles (se crean al inicio de este incremento si INC-00 no las dejó).

### 5. Puertos y adaptadores afectados

- **Ninguno.** El motor es una función pura del dominio (SPEC-01-R11): no define ni consume puertos, no toca adaptadores. Esta ausencia es una característica, no una carencia: es lo que lo hace testeable sin infraestructura y lo que se afirmará en la defensa.
- Los dobles de prueba de este incremento son **objetos `Story` mock construidos en los tests**, no adaptadores.

### 6. Tareas (`INC-01-Txx`)

- **INC-01-T01.** Modelar las entidades `Story`, `Page` y los value objects asociados en `src/domain/story/`, si INC-00 no las creó. Invariantes y validación en construcción.
- **INC-01-T02.** Definir los tipos del contrato de SPEC-01 en `src/domain/verification/`: `VerificationParameters`, `VerificationVerdict`, `VerificationWarning`, `Finding`, `Severity`.
- **INC-01-T03.** Implementar la **segmentación de frases** robusta (puntuación ambigua, abreviaturas, diálogos) como función pura. Es la base de varias reglas; se hace primero.
- **INC-01-T04.** Implementar el **cálculo de legibilidad** (índice elegido) sobre el texto completo del cuento (SPEC-01-R01).
- **INC-01-T05.** Implementar el **porcentaje de vocabulario fuera de lista** (SPEC-01-R02).
- **INC-01-T06.** Implementar la **longitud media de frase** (SPEC-01-R03).
- **INC-01-T07.** Implementar la **detección de exceso de longitud por página** (SPEC-01-R04).
- **INC-01-T08.** Implementar el **rebalanceo en cascada** (R05-R08): traslado a la página siguiente, corte por frase completa, página nueva al final, determinismo.
- **INC-01-T09.** Implementar la **composición del veredicto** (SPEC-01-R09): `passes` y `details` por dimensión.
- **INC-01-T10.** Implementar la **validación de entrada** con `InvalidVerificationInputError` (SPEC-01 §3, §6).
- **INC-01-T11.** Resolver el **caso límite de la frase única sobredimensionada** (SPEC-01 §6): aceptar la página con `warning`, a confirmar en implementación.
- **INC-01-T12.** Ensamblar `VerificationEngine` como fachada del dominio que orquesta las funciones puras y devuelve el `VerificationVerdict`.

### 7. Estrategia de test (TDD)

TDD clásico red-green-refactor: este incremento **sí** tiene lógica, a diferencia de INC-00.

- **Orden sugerido (de SPEC-01 §8):** funciones puras de cálculo primero (legibilidad, vocabulario, segmentación), luego el veredicto, y por último el rebalanceo, regla a regla.
- **Unitario (Vitest) — el grueso:**
  - Legibilidad con textos de valor conocido, un test por rango.
  - Porcentaje de vocabulario fuera de lista.
  - Segmentación de frases con casos de puntuación difícil.
  - Rebalanceo: un test por regla R04-R08; **determinismo (R08) ejecutando dos veces** y comparando resultado idéntico.
  - Veredicto (R09): combinaciones cumple / no-cumple por dimensión.
  - Validación: cuento vacío, parámetros incompletos, lista vacía → excepción.
  - Pureza (R11): verificada por la regla de dependencia del linter (el módulo no importa nada fuera de `domain/`).
- **Integración (Vitest):** el motor con un `Story` mock completo, anticipando su uso desde el pipeline (INC-02).
- **E2E:** N/A en este incremento (se cubre indirectamente en INC-06).
- **Corpus de prueba:** conviene iniciar aquí el corpus de textos que **deben** pasar y que **deben** fallar (`tests/corpus/`), que alimentará el capítulo de evaluación.

### 8. Definition of Done (`INC-01-DoDxx`)

- **INC-01-DoD01.** Las entidades `Story` y `Page` existen en `src/domain/story/` con sus invariantes y tests.
- **INC-01-DoD02.** El contrato de SPEC-01 está tipado en `src/domain/verification/` con identificadores en inglés idénticos a la spec.
- **INC-01-DoD03.** Las cuatro funciones de cálculo (legibilidad, vocabulario, longitud de frase, segmentación) pasan sus tests unitarios con textos de valor conocido.
- **INC-01-DoD04.** El rebalanceo cumple R05-R08, con un test por regla y el test de determinismo en verde.
- **INC-01-DoD05.** El veredicto (R09) devuelve `passes` y `details` correctos en las combinaciones cubiertas.
- **INC-01-DoD06.** La entrada inválida lanza `InvalidVerificationInputError` en los tres casos (cuento vacío, parámetros incompletos, lista vacía).
- **INC-01-DoD07.** El motor no importa nada fuera de `src/domain/`; la regla de dependencia del linter lo verifica (pureza R11).
- **INC-01-DoD08.** `VerificationEngine` es invocable como función pura y su test de integración con un `Story` mock pasa en verde.
- **INC-01-DoD09.** Los cinco escenarios Gherkin de SPEC-01 §5 tienen su test correspondiente, referenciado por nombre (`SPEC-01 / escenario …`).
- **INC-01-DoD10.** Existe un corpus inicial en `tests/corpus/` con al menos un caso que debe pasar y uno que debe fallar por cada dimensión.

> **Nota sobre el DoD y el bloqueo de parámetros.** DoD01-DoD08 pueden cerrarse con valores de prueba. La **validación del comportamiento real contra los valores definitivos** de la tabla maestra queda condicionada a que esa tabla exista (ver §9). Mientras no exista, INC-01 puede alcanzar «verde estructural» pero no «verde validado».

### 9. Riesgos y notas

- **🔴 Riesgo crítico — tabla maestra de parámetros sin valores.** Es el bloqueo heredado de SPEC-01 §7 y §19.1 del troncal. **Mitigación:** desarrollar las funciones de cálculo con valores de prueba parametrizables desde el inicio, de modo que fijar los valores reales sea cambiar una tabla de configuración, no reescribir lógica. Priorizar la obtención de esos valores (investigación de dislexia, §20) en paralelo a la codificación.
- **Riesgo — segmentación de frases en español.** Abreviaturas, diálogos y puntuación ambigua hacen no trivial detectar el fin de frase, y varias reglas dependen de ello. **Mitigación:** T03 se hace primero y con batería de tests propia; es la base del resto.
- **Riesgo — caso de la frase única sobredimensionada** (SPEC-01 §6, T11). No se puede cortar por frase sin partirla. **Decisión propuesta:** aceptar la página con `warning` y dejar la re-generación al orquestador (INC-02); confirmar en implementación.
- **Nota — el motor no decide re-generar.** SPEC-01-R10: emite veredicto; la política de reintentos es del orquestador (INC-02). No introducir aquí lógica de reintento aunque resulte tentador.
- **Nota — corpus como activo de evaluación.** El corpus iniciado en DoD10 no es solo material de test: es la evidencia del capítulo de evaluación del TFM. Conviene etiquetarlo y versionarlo desde el principio.
