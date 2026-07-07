# Registro de Decisiones de Arquitectura (ADR)

Este directorio contiene los **Architecture Decision Records** (ADR) del proyecto
NarrARA. Un ADR documenta una decisión técnica relevante, su contexto y sus
consecuencias, de forma que el histórico de *por qué* se hizo algo no se pierda.

Usamos el formato [MADR](https://adr.github.io/madr/) (Markdown Any Decision Records).

## ¿Cuándo escribir un ADR?

Crea un ADR cuando tomes una decisión que:

- Afecte a la estructura o arquitectura del sistema.
- Introduzca, sustituya o elimine una tecnología o dependencia importante.
- Sea difícil o costosa de revertir.
- Alguien podría cuestionar en el futuro con un "¿por qué se hizo así?".

## Cómo crear uno

1. Copia [`adr-template.md`](./adr-template.md).
2. Nómbralo con el siguiente número correlativo y un título en kebab-case:
   `NNNN-titulo-corto.md` (p. ej. `0002-eleccion-proveedor-llm.md`).
3. Rellena las secciones y déjalo con estado **Propuesta**.
4. Al aceptarse, cambia el estado a **Aceptada** y añádelo al índice de abajo.
5. Una decisión nunca se borra: si se revierte, se crea un ADR nuevo que
   **Sustituye** al anterior, y el antiguo pasa a estado **Obsoleta**.

## Estados posibles

`Propuesta` · `Aceptada` · `Rechazada` · `Obsoleta` · `Sustituida por [NNNN]`

## Índice de decisiones

| Nº   | Título                                                     | Estado   |
| ---- | ---------------------------------------------------------- | -------- |
| 0001 | [Stack tecnológico base](./0001-stack-tecnologico-base.md) | Aceptada |
