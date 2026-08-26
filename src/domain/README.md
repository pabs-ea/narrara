# `domain/` — Círculo 1 · Entities

Dominio puro: entidades, value objects y el motor de verificación. Sin I/O,
sin dependencias de framework. No importa de ninguna otra capa de `src/`
(regla de dependencia, ver [`../README.md`](../README.md)).

**Vacío en INC-00 a propósito.** El modelo de dominio (`Story`, `Page`,
`VerificationEngine`, etc.) es responsabilidad de **INC-01** — este
incremento sienta los cimientos (capas, tooling, puertos) sin implementar
ninguna regla de negocio.
