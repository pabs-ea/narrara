# NarrARA — Plan de Incrementos (Spec-Driven Development)

> **Documento de planificación por incrementos.** Define el **plan maestro** (índice ordenado de incrementos) y la **plantilla reutilizable de Spec de Incremento**. Cada incremento se redacta en su propio fichero (`INC-00_Cimientos_vX.Y.Z.md`, `INC-01_Motor_Verificacion_vX.Y.Z.md`, …).
>
> - **Spec de Incremento (`INC-XX`)** — unidad de *planificación*. Define **qué se entrega**: objetivo, alcance, dependencias, puertos afectados, tareas y **Definition of Done**. Sin Gherkin.
> - **Spec de Componente (`SPEC-NN`)** — unidad de *especificación de comportamiento*. Define el **contrato de una pieza de lógica** con reglas deterministas y **Gherkin**. Vive en el documento de Especificaciones (SDD). Ya existe `SPEC-01`.
>
> **Relación:** un incremento referencia **0..N** specs de componente. `INC-00` referencia **cero** (es scaffolding, no implementa lógica de dominio). `INC-01` referencia `SPEC-01`.

---

## Control de versiones

| Versión | Fecha | Descripción |
|---------|------------|-------------|
| 1.0.0 | 2026-07-08 | Versión inicial. Plan maestro + plantilla de Spec de Incremento + `INC-00` (Cimientos) embebido. |
| 1.1.0 | 2026-08-26 | **Reconciliado a Clean Architecture.** Vocabulario «hexagonal» → Clean en el plan maestro y la plantilla. **Extraído `INC-00` a su propio fichero** (`INC-00_Cimientos_v1_1_0.md`), conforme a la propia convención de «un documento por incremento»; este documento deja de contener el detalle de INC-00. Nomenclatura de puertos y adaptadores del plan maestro reconciliada a la convención de código en inglés y a los nombres de ADR-007 v1.1.0. Actualizada la columna de dependencias por las decisiones cerradas (ADR-005, ADR-006, ADR-008). |

---

## Convenciones

- **Un documento por incremento.** A partir de esta versión, cada incremento vive en su propio fichero. Este documento conserva únicamente el **plan maestro** y la **plantilla**. El detalle de cada `INC-XX` se encuentra en `INC-XX_*.md`.
- **Numeración de tareas y DoD:** `INC-NN-Txx` para tareas, `INC-NN-DoDxx` para criterios de cierre.
- **Nomenclatura de código en inglés** en todas las capas; lenguaje natural en español (prosa, Gherkin, historias de usuario). Coherente con ADR-007 v1.1.0, ADR-002 v1.1.0 y SPEC-01 v1.1.0.
- **Marco arquitectónico:** Clean Architecture. Correspondencia capa↔carpeta fijada en ADR-007 v1.1.0.

---

## 1. Plan maestro de incrementos

> Índice ordenado. Cada fila es una unidad de valor. El orden respeta la estrategia del proyecto: **construir y validar el núcleo defendible (verificación + moderación) antes que lo accesorio** (§18 del documento principal). La IA real entra *después* de que el dominio esté probado contra dobles de prueba.

| ID | Título | Valor entregable | Depende de | SPEC-NN | Estado |
|----|--------|------------------|-----------|---------|--------|
| **INC-00** | Cimientos | Esqueleto Clean ejecutable, tooling, CI en verde, siete puertos declarados | — | — | ✅ Completado |
| **INC-01** | Motor de verificación | Verificación determinista (legibilidad, vocabulario, longitud) + rebalanceo, testeada contra dobles | INC-00 | SPEC-01 | Planificado |
| **INC-02** | Orquestador del pipeline (sin IA real) | Bucle generar→verificar→moraleja→moderar con adaptadores *fake*; degradación elegante y límite de reintentos | INC-01 | SPEC-02 (pend.) | Planificado |
| **INC-03** | Guardarraíl de moderación | Pipeline de moderación en capas + set de evaluación propio (precisión/recall) | INC-02 | SPEC-03 (pend.) | Planificado |
| **INC-04** | Adaptadores de IA reales | Enchufar LLM/TTS reales tras los puertos ya probados; ≥2 adaptadores en un puerto (RNF-08) | INC-02, INC-03 | — | Planificado |
| **INC-05** | Persistencia | Adaptador real (Postgres) tras `StoryRepository`; perfiles y biblioteca ancladas a sesión (ADR-003, ADR-008) | INC-02 | SPEC-04 (pend.) | Planificado |
| **INC-06** | Frontend y consumo | Pantallas (Stitch→código), navegación por páginas, modo dislexia en presentación, modo niño | INC-02, INC-05 | — | Planificado |
| **INC-07** | Observabilidad y cierre | Logging estructurado, métricas, auditoría interna, hardening RGPD, despliegue reproducible | INC-04, INC-05, INC-06 | — | Planificado |

> **Nota de reconciliación:** este plan maestro **sustituye** al «Roadmap de 4 semanas» (§14 del documento principal), que quedaba anclado a un deadline rígido de 1 mes (RES-01). El enfoque acordado es por **unidades de valor sin fecha rígida**, a ritmo sostenible (~2-3 h/día).

> **Frontera del plan (regla de supervivencia):** el núcleo defendible del TFM (INC-01 + INC-03) queda **listo y evaluado antes de depender de ningún proveedor de IA real** (INC-04). Si un proveedor falla en INC-04, el corazón del proyecto ya está hecho.

### Cambios de alcance sobre el plan original (ADR-008)

- **INC-05** ya no incluye «cuentas» de usuario: el MVP no tiene cuentas (ADR-008). Persiste perfiles y biblioteca **anclados al identificador de sesión anónima**. El material de cuentas queda diferido (§18.5 del troncal).
- **INC-06** mantiene las pantallas del núcleo; las de registro, login y muro de conversión quedan diferidas con la épica E1.

---

# PLANTILLA DE SPEC DE INCREMENTO (reutilizable)

> Copiar para cada nuevo incremento a su propio fichero. Rellenar todas las secciones; si una no aplica, indicar «N/A» y por qué. **No** lleva Gherkin: el comportamiento conductual se especifica en las Spec de Componente (`SPEC-NN`) que el incremento referencia.

## INC-NN — [Título del incremento]

**Estado:** Planificado · **Versión:** 0.1.0 · **Fecha:** —

### 1. Objetivo y valor
Una o dos frases: qué capacidad demostrable aporta este incremento y por qué existe. Si aplica, atar a la contribución del TFM.

### 2. Alcance
- **Incluye:** lista explícita de lo que se entrega.
- **NO incluye:** lista explícita de lo que queda fuera (evita el ámbito difuso y el arrastre de scope).

### 3. Trazabilidad
- **Requisitos:** RF-xx, RNF-xx (§17).
- **Historias de usuario:** HU-xx.
- **Specs de componente referenciadas:** SPEC-NN (0..N).

### 4. Dependencias y precondiciones
Qué incrementos, ADRs o decisiones deben estar cerrados antes de empezar.

### 5. Puertos y adaptadores afectados
Qué toca de la arquitectura Clean: puertos nuevos o modificados (en `application/ports/`), adaptadores (fake/real) que se introducen (en `adapters/`).

### 6. Tareas (`INC-NN-Txx`)
Lista ordenada de tareas concretas. Cada una debe ser objetivamente verificable.

### 7. Estrategia de test (TDD)
Qué se cubre con Vitest (unitario/integración) y qué con Playwright (E2E), y el orden red-green-refactor. Para incrementos de infraestructura sin lógica, indicar qué se valida (arranque, CI, smoke test).

### 8. Definition of Done (`INC-NN-DoDxx`)
Checklist verificable de cierre. Cada ítem es comprobable de forma binaria (existe/no existe, pasa/no pasa). **Estos son los criterios de aceptación del incremento** (no Gherkin, salvo que referencie una SPEC-NN que sí lo tenga).

### 9. Riesgos y notas
Riesgos específicos del incremento y decisiones abiertas.

---

## Incrementos redactados

| Incremento | Fichero | Estado |
|---|---|---|
| INC-00 — Cimientos | `INC-00_Cimientos_v1_2_0.md` | ✅ Completado |
| INC-01 — Motor de verificación | `INC-01_Motor_Verificacion_v1_1_0.md` | Planificado |

> Los incrementos INC-02 a INC-07 se redactarán en su propio fichero conforme se aproxime su ejecución, cada uno con la SPEC-NN que corresponda ya aprobada.
