# SPEC-01 — Motor de verificación de restricciones

**Estado:** Aprobada · **Versión:** 1.1.0 · **Fecha:** 2026-08-26 (contrato en inglés: 2026-08-21)

> **Spec de Componente (SDD).** Extraída a fichero propio desde `NarrARA_Specs` v1.2.0, conforme a la convención de «un documento por spec». La plantilla y la metodología SDD viven en el documento contenedor `NarrARA_Specs`.
>
> - **Implementada por:** INC-01 (`INC-01_Motor_Verificacion_v1_0_0.md`).
> - **Contrato en inglés** conforme a la convención de nomenclatura de código (ADR-007 v1.1.0).

### 1. Propósito

Evaluar de forma **determinista** si un cuento generado cumple las restricciones duras definidas por el perfil (legibilidad, vocabulario y longitud), emitir un **veredicto** y, cuando la longitud por página se incumpla, aplicar el **rebalanceo** de páginas. Es el núcleo original del proyecto y la base de su capítulo de evaluación.

### 2. Trazabilidad

- **Requisitos:** RF-05, RF-06, RF-06b, RF-08, RNF-07.
- **Historias de usuario:** HU-13 (verificación automática), HU-14 (rebalanceo).
- **Incremento que lo implementa:** **INC-01**.
- **Capa (Clean):** **Entities** — servicio de dominio puro, sin I/O, sin dependencias de framework.
- **Dependencias:** tabla maestra de parámetros (§19.1 del doc principal, **pendiente de valores**); modelo de dominio `Story` / `Page` (§17.4).

### 3. Entradas y salidas (contrato)

**Entrada:**

- `story: Story` — objeto con lista ordenada de `pages` (cada una con `text`), **sin** la página de moraleja (la moraleja se verifica aparte).
- `parameters: VerificationParameters` — derivado del perfil y de la tabla maestra:

```ts
interface VerificationParameters {
  readabilityRange: { min: number; max: number };
  maxLengthPerPage: number;
  allowedFrequencyList: ReadonlySet<string>;
  maxPercentageWordsOutsideList: number;
  maxAverageSentenceLength: number;
}
```

**Salida:**

```ts
interface VerificationVerdict {
  passes: boolean;
  details: {
    readability: { value: number; passes: boolean };
    vocabulary: { percentageOutside: number; passes: boolean };
    sentenceLength: { averageValue: number; passes: boolean };
    pageLength: { passesPerPage: boolean };
  };
  rebalancedStory?: Story;
  warnings?: VerificationWarning[];
}
```

**Errores:**

- Entrada inválida (`story` vacía, `parameters` incompletos, `allowedFrequencyList` vacía) → **excepción de validación** (`InvalidVerificationInputError`), no un veredicto.

> **Nota de traducción (v1.1.0):** este contrato sustituye al de v1.0.0, que usaba identificadores en español (`cuento`, `paginas`, `parametros`, `rangoLegibilidad`, `longitudMaxPorPagina`, `listaFrecuenciaPermitida`, `maxPorcentajePalabrasFueraLista`, `longitudFraseMediaMax`, `VeredictoVerificacion`, `cumple`, `detalles`, `cuentoRebalanceado`). Las **reglas y criterios no cambian**.

### 4. Reglas de comportamiento

- **SPEC-01-R01 (Legibilidad — nivel cuento).** La legibilidad se calcula sobre el **texto completo del cuento** (todas las páginas concatenadas, sin la moraleja), usando el índice elegido (Fernández-Huerta / INFLESZ). Cumple si el valor cae dentro de `readabilityRange`.
- **SPEC-01-R02 (Vocabulario — nivel cuento).** Se calcula el **porcentaje de palabras fuera** de `allowedFrequencyList` sobre el cuento completo. Cumple si ese porcentaje ≤ `maxPercentageWordsOutsideList`.
- **SPEC-01-R03 (Longitud de frase — nivel cuento).** La longitud media de frase no debe superar `maxAverageSentenceLength`.
- **SPEC-01-R04 (Longitud — nivel página).** Ninguna página debe superar `maxLengthPerPage`. Si alguna la supera, se activa el rebalanceo (R05-R08).
- **SPEC-01-R05 (Rebalanceo en cascada).** El exceso de una página se traslada a la **siguiente**, recorriendo las páginas de la primera a la última.
- **SPEC-01-R06 (Corte por límites naturales).** Al trasladar texto, el corte se hace siempre por **frase completa**; nunca se parte una palabra ni una frase a la mitad. Esto puede dejar una página ligeramente por debajo del máximo, lo cual es aceptable.
- **SPEC-01-R07 (Página nueva al final).** Si el exceso llega a la **última página** y esta también supera el máximo, se **crea una página nueva al final** con el sobrante. Sin límite rígido de páginas (sujeto a topes de sistema si se definen).
- **SPEC-01-R08 (Determinismo).** Dadas las mismas entradas, el rebalanceo produce **siempre el mismo resultado**. Sin aleatoriedad.
- **SPEC-01-R09 (Veredicto).** El motor devuelve `passes: true` solo si R01, R02, R03 se cumplen y, tras el rebalanceo, R04 se cumple en todas las páginas. En caso contrario `passes: false` con el detalle del incumplimiento (para que el orquestador decida re-generar o degradar — ver RF-08).
- **SPEC-01-R10 (Separación de responsabilidades).** El motor **verifica y rebalancea**; NO genera texto ni llama al LLM. La decisión de re-generar es del orquestador del pipeline (capa **Use Cases**), no de este componente.
- **SPEC-01-R11 (Pureza).** El motor es una función pura del dominio: sin I/O, sin acceso a red ni a persistencia, sin dependencias de Next ni de Genkit. Debe ser testeable con Vitest sin ninguna infraestructura delante.

### 5. Criterios de aceptación (Gherkin)

```gherkin
Escenario: Cuento que cumple todas las restricciones
  Dado un cuento cuyo texto está dentro del rango de legibilidad
  Y con un porcentaje de palabras fuera de lista por debajo del máximo
  Y con todas las páginas por debajo de la longitud máxima
  Cuando el motor verifica el cuento
  Entonces el veredicto es "cumple"
  Y no se modifica la estructura de páginas

Escenario: Página que excede la longitud se rebalancea
  Dado un cuento donde la página 1 supera la longitud máxima
  Cuando el motor verifica el cuento
  Entonces el exceso de la página 1 pasa a la página 2
  Y el corte se realiza por frase completa
  Y ninguna palabra queda partida

Escenario: Exceso que llega a la última página
  Dado un cuento donde el exceso se propaga hasta la última página
  Y la última página también supera el máximo
  Cuando el motor rebalancea
  Entonces se crea una página nueva al final con el sobrante

Escenario: Cuento que no cumple la legibilidad
  Dado un cuento cuyo índice de legibilidad está fuera del rango
  Cuando el motor verifica el cuento
  Entonces el veredicto es "no cumple"
  Y el detalle indica el fallo de legibilidad

Escenario: Determinismo del rebalanceo
  Dado un mismo cuento y los mismos parámetros
  Cuando el motor rebalancea dos veces
  Entonces el resultado es idéntico en ambas ejecuciones
```

### 6. Casos límite y de error

- Cuento de una sola página que excede el máximo → se crea una segunda página (R07).
- Cuento con una única frase larguísima que por sí sola supera el máximo de página → no se puede cortar por frase (R06); definir comportamiento: se acepta la página sobredimensionada y se marca advertencia (`warnings`, candidato a re-generación por el orquestador). **A confirmar en implementación.**
- Texto con puntuación ambigua (abreviaturas, diálogos) que dificulta detectar el fin de frase → la segmentación de frases debe ser robusta; cubrir con tests específicos.
- Lista de frecuencia vacía o parámetros nulos → excepción de validación.
- Cuento vacío → excepción de validación.

### 7. Parámetros y configuración

Todos provienen de la **tabla maestra de parámetros** (pendiente de valores, §19.1) y del perfil; **ninguno se hardcodea**: `readabilityRange`, `maxLengthPerPage`, `allowedFrequencyList`, `maxPercentageWordsOutsideList`, `maxAverageSentenceLength`. El modo dislexia y la edad ajustan estos valores aguas arriba (no es responsabilidad del motor).

> ⚠️ **Bloqueo activo:** sin la tabla maestra con valores concretos, esta spec no puede implementarse por completo. Es el punto crítico pendiente de mayor prioridad.

### 8. Estrategia de test (TDD)

- **Unitario (Vitest) — el grueso:**
  - Cálculo de legibilidad con textos de valor conocido (red-green por cada rango).
  - Cálculo de porcentaje de vocabulario fuera de lista.
  - Segmentación de frases (casos con puntuación difícil).
  - Rebalanceo: cada regla R04-R08 con su test; determinismo (R08) ejecutando dos veces.
  - Veredicto (R09): combinaciones cumple/no-cumple.
  - Pureza (R11): el módulo no importa nada de capas externas (verificado además por la regla de dependencia del linter).
- **Integración (Vitest):** el motor dentro del pipeline (Use Cases) con un cuento mock completo.
- **E2E (Playwright):** cubierto indirectamente al verificar el flujo "crear cuento" (no específico de este componente).
- **Orden TDD sugerido:** empezar por las funciones puras de cálculo (legibilidad, vocabulario, segmentación), luego el veredicto, y por último el rebalanceo (lo más complejo), regla a regla.

### 9. Fuera de alcance

- **No** genera ni reescribe texto (eso es del orquestador + LLM).
- **No** verifica la moraleja (spec aparte).
- **No** modera contenido (spec aparte — guardarraíl de seguridad).
- **No** decide re-generar ni cuántos reintentos (eso es del orquestador del pipeline, RF-08 / RNF-07).
- **No** genera audio ni afecta a la presentación.
- **No** accede a persistencia ni a servicios externos (R11).
