# Documentación de NarrARA

Índice de la documentación del proyecto. Cada documento lleva su propia **tabla de
control de versiones** en la cabecera; el sufijo de versión del nombre de fichero refleja
la versión vigente de ese documento.

> **Punto de entrada recomendado:** [Documento maestro de consolidación](./project/NarrARA_Consolidacion_v1_3_0.md)
> — recopila el estado real, las decisiones tomadas y los puntos pendientes. Para el detalle
> completo del proyecto, el troncal es [NarrARA (principal)](./project/NarrARA_v1_7_0.md).

## Estructura

| Carpeta | Contenido |
|---|---|
| [`project/`](./project/) | Definición del proyecto: troncal, consolidación e historias de usuario. |
| [`research/`](./research/) | Investigación reutilizable que fundamenta decisiones de producto. |
| [`ux/`](./ux/) | Diseño de experiencia: mapa de pantallas, flujos y briefs. |
| [`specs/`](./specs/) | SDD · **comportamiento**: contenedor de specs de componente (`SPEC-NN`). |
| [`increments/`](./increments/) | SDD · **planificación**: plan maestro e incrementos (`INC-NN`). |
| [`decisions/`](./decisions/) | Registro de decisiones de arquitectura (ADR). Ver su [índice](./decisions/README.md). |

> Los dos artefactos SDD son distintos y no se confunden: `INC-XX` es la unidad de
> **planificación** (objetivo, alcance, Definition of Done; sin Gherkin); `SPEC-NN` es la
> unidad de **comportamiento** (contrato, reglas deterministas y criterios en Gherkin).
> Un incremento referencia 0..N specs de componente. No existe `SPEC-00`.

## Producto / definición — [`project/`](./project/)

| Documento | Versión | Descripción |
|---|---|---|
| [NarrARA (principal)](./project/NarrARA_v1_7_0.md) | v1.7.0 | Documento troncal: problema, solución, requisitos, MVP, metodología, stack. Fuente de verdad del *qué*. |
| [Consolidación](./project/NarrARA_Consolidacion_v1_3_0.md) | v1.3.0 | Punto único de entrada: estado, decisiones firmes y backlog vivo. |
| [Historias de Usuario](./project/NarrARA_Historias_Usuario_v1.0.0.md) | v1.0.0 | 33 historias en 7 épicas, con Gherkin, MoSCoW y trazabilidad a requisitos. |

## Investigación — [`research/`](./research/)

| Documento | Versión | Descripción |
|---|---|---|
| [Investigación: diseño para dislexia](./research/Investigacion_Dislexia_v1.0.0.md) | v1.0.0 | Evidencia científica sobre presentación y texto legibles. Base del «modo dislexia». Reutilizable e independiente. |

## UX / Diseño — [`ux/`](./ux/)

| Documento | Versión | Descripción |
|---|---|---|
| [Diseño UX (mapa, flujos, briefs Stitch)](./ux/NarrARA_UX_Stitch_v1.1.0.md) | v1.1.0 | Inventario de 13 pantallas, flujos de usuario y briefs por pantalla. |

## SDD · comportamiento — [`specs/`](./specs/)

| Documento | Versión | Estado | Descripción |
|---|---|---|---|
| [Especificaciones (contenedor SDD)](./specs/NarrARA_Specs_v1_2_0.md) | v1.2.0 | — | Metodología SDD, convención de idioma y **plantilla** de Spec de Componente. |
| [SPEC-01 — Motor de verificación](./specs/SPEC-01_Motor_Verificacion_v1_1_0.md) | v1.1.0 | Aprobada | Contrato determinista de verificación (legibilidad, vocabulario, longitud) y rebalanceo. Implementada por INC-01. |

> Pendientes de redactar: SPEC-02 (orquestador), SPEC-03 (moderación), SPEC-04 (persistencia).

## SDD · planificación — [`increments/`](./increments/)

| Documento | Versión | Estado | Descripción |
|---|---|---|---|
| [Plan de Incrementos (plan maestro)](./increments/NarrARA_Plan_Incrementos_v1_1_0.md) | v1.1.0 | — | Índice ordenado de incrementos (INC-00 → INC-07) y **plantilla** de Spec de Incremento. |
| [INC-00 — Cimientos](./increments/INC-00_Cimientos_v1_2_0.md) | v1.2.0 | ✅ Completado | Esqueleto Clean ejecutable: capas, tooling, regla de dependencia por linter, **siete** puertos async, composition root, Docker y CI. Aquí empieza el código. |
| [INC-01 — Motor de verificación](./increments/INC-01_Motor_Verificacion_v1_0_0.md) | v1.0.0 | Planificado | Primer incremento de dominio: implementa SPEC-01 contra dobles de prueba. Depende de INC-00. |

> Pendientes de redactar: INC-02 … INC-07.

## Otras ubicaciones de contexto

- [`../context/`](../context/) — contexto para el código: modelo de datos, APIs y glosario de dominio.
