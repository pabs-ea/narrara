# NarrARA — Especificaciones (Spec-Driven Development)

> **Documento contenedor de especificaciones (SDD).** Contiene la **metodología SDD**, la **convención de idioma** y la **plantilla reutilizable de Spec de Componente**. Cada spec de componente vive en **su propio fichero** (`SPEC-NN_*.md`). Bajo Spec-Driven Development, cada spec es la **fuente de verdad** de la que se derivan los tests (Vitest/Playwright) y el código. No se implementa nada sin una spec que lo respalde.
>
> **Cadena de trazabilidad:** Requisito (§17) → Historia de usuario + Gherkin → **INC-XX** (qué se entrega) + **SPEC-NN** (cómo se comporta) → Tests (TDD: red-green-refactor) → Código.

---

## Control de versiones

| Versión | Fecha | Descripción |
|---------|------------|-------------|
| 1.0.0 | 2026-07-03 | Versión inicial. Plantilla de spec + SPEC-01 (Motor de verificación de restricciones). |
| 1.1.0 | 2026-08-21 | Aclarada la distinción entre los **dos artefactos SDD** (`INC-XX` / `SPEC-NN`). Vocabulario reconciliado a **Clean Architecture**. **Contrato de SPEC-01 traducido a inglés** conforme a la convención de nomenclatura de código. Añadida la convención de idioma. |
| 1.2.0 | 2026-08-26 | **Extraída SPEC-01 a su propio fichero** (`SPEC-01_Motor_Verificacion_v1_1_0.md`), conforme a la convención de «un documento por spec» y en simetría con el Plan de Incrementos v1.1.0. Este documento queda como **contenedor**: metodología SDD, convención de idioma y **plantilla** de Spec de Componente. Añadido el índice de specs redactadas. |

---

## Convenciones

### Dos artefactos de especificación

Bajo SDD, NarrARA emplea **dos artefactos distintos** que no deben confundirse:

| Artefacto | Unidad | Contenido | ¿Gherkin? |
|-----------|--------|-----------|:---------:|
| **`INC-XX`** (Spec de Incremento) | Planificación | Objetivo, alcance, dependencias, interfaces afectadas, tareas, **Definition of Done** | ❌ No |
| **`SPEC-NN`** (Spec de Componente) | Comportamiento | Contrato, reglas deterministas, casos límite, **criterios de aceptación** | ✅ Sí |

Un incremento referencia **0..N** specs de componente. `INC-00` (cimientos) no referencia ninguna, por ser scaffolding sin lógica de dominio. **No existe `SPEC-00`.** Las Spec de Incremento viven en el documento `NarrARA_Plan_Incrementos`; este documento contiene únicamente las Spec de Componente.

### Generales

- **Granularidad:** una spec **por componente/módulo** (agrupa varias historias de usuario relacionadas). Más manejable que una spec por historia para un núcleo técnico.
- **Identificación:** `SPEC-NN` + título. Reglas internas numeradas `SPEC-NN-Rxx`.
- **Alcance:** solo se escriben specs de lo que se va a implementar (núcleo). Las funcionalidades diferidas no tienen spec hasta que entren en implementación.
- **Estado:** `Borrador` / `Aprobada` / `Implementada`.

### Convención de idioma

- **Identificadores de código en inglés:** tipos, interfaces, propiedades, funciones y ficheros. Aplica a **todas las capas**, incluida la de Entities.
- **Lenguaje natural en español:** prosa de las specs, reglas descritas, criterios de aceptación en **Gherkin** y las historias de usuario. El Gherkin es documentación legible por negocio, no código.
- **Correspondencia de dominio** (para leer specs previas a v1.1.0): `Cuento` → `Story`, `Página` → `Page`, `Perfil` → `Profile`, `Veredicto` → `Verdict`.

---

# PLANTILLA DE SPEC DE COMPONENTE (reutilizable)

> Copiar esta plantilla para cada nuevo componente. Rellenar todas las secciones; si una no aplica, indicar "N/A" y por qué.

## SPEC-NN — [Nombre del componente]

**Estado:** Borrador · **Versión:** 0.1.0 · **Fecha:** —

### 1. Propósito
Una o dos frases: qué hace este componente y por qué existe.

### 2. Trazabilidad
- **Requisitos:** RF-xx, RNF-xx (del §17).
- **Historias de usuario:** HU-xx.
- **Incremento que lo implementa:** INC-XX.
- **Capa (Clean):** Entities / Use Cases / Interface Adapters.
- **Dependencias:** otras specs o componentes de los que depende.

### 3. Entradas y salidas (contrato)
- **Entrada:** estructura y tipos de datos que recibe (identificadores en inglés).
- **Salida:** estructura y tipos que devuelve.
- **Errores/excepciones:** qué puede fallar y cómo se comunica.

### 4. Reglas de comportamiento
Lista numerada de reglas deterministas (`SPEC-NN-Rxx`). Cada regla debe ser **verificable** con un test.

### 5. Criterios de aceptación (Gherkin)
Escenarios Dado/Cuando/Entonces derivados de las historias. Son la especificación ejecutable. **En español.**

### 6. Casos límite y de error
Situaciones frontera que deben cubrirse explícitamente con tests.

### 7. Parámetros y configuración
Valores externos (de la tabla maestra, del perfil, del sistema) que la lógica consume. No hardcodear.

### 8. Estrategia de test (TDD)
Qué se cubre con unitario / integración / E2E, y el orden red-green-refactor.

### 9. Fuera de alcance
Lo que este componente explícitamente NO hace (para evitar ámbito difuso).

---

## Specs de componente redactadas

| Spec | Fichero | Implementada por | Estado |
|---|---|---|---|
| SPEC-01 — Motor de verificación de restricciones | `SPEC-01_Motor_Verificacion_v1_1_0.md` | INC-01 | Aprobada |
| SPEC-02 — Orquestador del pipeline | *(pendiente)* | INC-02 | No redactada |
| SPEC-03 — Guardarraíl de moderación | *(pendiente)* | INC-03 | No redactada |
| SPEC-04 — Persistencia | *(pendiente)* | INC-05 | No redactada |

> Las specs pendientes se redactarán en su propio fichero conforme se aproxime la ejecución de su incremento, y deben estar **Aprobadas** antes de empezar a codificar ese incremento.
