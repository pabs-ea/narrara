# Registro de Decisiones de Arquitectura (ADR)

Este directorio contiene los **Architecture Decision Records** (ADR) del proyecto
NarrARA. Un ADR documenta una decisión técnica relevante, su contexto y sus
consecuencias, de forma que el histórico de *por qué* se hizo algo no se pierda.

## Formato y numeración

Los ADR usan el esquema unificado **`ADR-NNN`** (identificador estable, citado desde el
resto de la documentación del TFM: troncal, incrementos `INC-NN` y especificaciones
`SPEC-NN`). Cada ADR es un fichero `ADR-NNN-titulo-en-kebab-case.md` y lleva **versión
semántica propia** (`vX.Y.Z`) en su cabecera para registrar reediciones.

> **Nota histórica.** Los ADR-009, ADR-010 y ADR-011 se registraron inicialmente con el
> formato MADR y numeración `0001`–`0003`. Se migraron al esquema unificado `ADR-NNN`
> conservando su contenido; su fecha de aceptación original se mantiene en la cabecera.

## ¿Cuándo escribir un ADR?

Crea un ADR cuando tomes una decisión que:

- Afecte a la estructura o arquitectura del sistema.
- Introduzca, sustituya o elimine una tecnología o dependencia importante.
- Sea difícil o costosa de revertir.
- Alguien podría cuestionar en el futuro con un «¿por qué se hizo así?».

## Cómo crear uno

1. Copia [`adr-template.md`](./adr-template.md).
2. Nómbralo con el siguiente número correlativo y un título en kebab-case:
   `ADR-NNN-titulo-corto.md` (p. ej. `ADR-012-eleccion-proveedor-llm.md`).
3. Rellena las secciones y déjalo con estado **Propuesta**.
4. Al aceptarse, cambia el estado a **✅ Aceptada**, fija la fecha de aceptación y añádelo
   al índice de abajo.
5. Una decisión nunca se borra: si se revierte, se crea un ADR nuevo que **Sustituye** al
   anterior, y el antiguo pasa a estado **Obsoleta** / **Sustituida por ADR-NNN**.

## Estados posibles

`Propuesta` · `✅ Aceptada` · `Rechazada` · `Obsoleta` · `Sustituida por ADR-NNN`

## Índice de decisiones

| Nº      | Título                                                                                  | Versión | Estado      |
| ------- | --------------------------------------------------------------------------------------- | ------- | ----------- |
| ADR-001 | [Next.js full-stack para el MVP](./ADR-001-nextjs-fullstack.md)                          | v1.2.0  | Propuesta   |
| ADR-002 | [Genkit como framework del adaptador de IA](./ADR-002-genkit-adaptador-ia.md)            | v1.1.0  | ✅ Aceptada |
| ADR-003 | [Persistencia diferida tras interfaz de repositorio](./ADR-003-persistencia-diferida.md) | v1.0.0  | ✅ Aceptada |
| ADR-004 | [Composition root manual (inyección de dependencias)](./ADR-004-composition-root-manual.md) | v1.0.0  | ✅ Aceptada |
| ADR-005 | [Despliegue híbrido y renuncia a colas en el MVP](./ADR-005-despliegue-sin-colas.md)     | v1.0.0  | ✅ Aceptada |
| ADR-006 | [Coste mínimo y minimización de datos en IA](./ADR-006-coste-minimo.md)                  | v1.0.0  | ✅ Aceptada |
| ADR-007 | [Estructura física de carpetas (Clean Architecture)](./ADR-007-estructura-fisica-capas.md) | v1.1.0  | ✅ Aceptada |
| ADR-008 | [Sesión anónima persistente (sin cuentas)](./ADR-008-sin-cuentas-sesion-anonima.md)      | v1.0.0  | Propuesta   |
| ADR-009 | [Stack tecnológico base](./ADR-009-stack-tecnologico-base.md)                            | v1.1.0  | ✅ Aceptada |
| ADR-010 | [Herramientas de diseño asistido por IA](./ADR-010-herramientas-diseno-asistido.md)      | v1.1.0  | ✅ Aceptada |
| ADR-011 | [Testing con Vitest y validación con Zod](./ADR-011-testing-vitest-y-zod.md)             | v1.1.0  | ✅ Aceptada |
