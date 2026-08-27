# Arquitectura de `src/`

Este árbol implementa **Clean Architecture** (Robert C. Martin). La única regla
irrenunciable es la **regla de dependencia**: el código fuente solo puede
apuntar **hacia dentro**. Los círculos externos conocen a los internos; nunca
al revés. Decisión completa y su justificación:
[ADR-007](../docs/decisions/ADR-007-estructura-fisica-capas.md).

## Correspondencia círculo ↔ carpeta

| Círculo (Clean Architecture) | Carpeta                       | Contenido                                                                         |
| ----------------------------- | ------------------------------ | ---------------------------------------------------------------------------------- |
| 1 · Entities                   | `domain/`                      | Dominio puro: entidades, value objects, motor de verificación. Sin I/O.            |
| 2 · Use Cases                  | `application/`                 | Orquestador del pipeline, casos de uso y las interfaces (`ports/`) que necesitan.  |
| 3 · Interface Adapters         | `adapters/`                    | Implementaciones de esas interfaces: repositorios, adaptadores de IA, controladores, presenters. |
| 4 · Frameworks & Drivers        | `app/`, `ui/`, `composition/`  | Next.js, componentes de presentación, composition root. El borde.                  |

`domain` y `application` son vocabulario de DDD, no de Clean Architecture; la
divergencia es deliberada (ADR-007 §3.1) — la correspondencia con los círculos
la fija esta tabla, no el nombre de la carpeta.

## Regla de dependencia (impuesta por linter — `eslint-plugin-boundaries`)

1. `domain/` no importa de ninguna otra carpeta de `src/`.
2. `application/` importa únicamente de `domain/`.
3. `adapters/` importa de `application/` y `domain/`; nunca de `app/`, `ui/` ni `composition/`.
4. `ui/` no importa de `domain/` ni `application/`; solo tipos `*ViewModel` desde `adapters/inbound/presenters/`.
5. `app/` importa de `composition/`, de `adapters/inbound/` y de `ui/` (renderiza sus componentes de presentación); nunca de `domain/` ni `application/`.
6. Únicamente `composition/` puede importar de las cuatro capas — es el *main
   component*, el único punto autorizado a instanciar adaptadores concretos
   (ADR-004).

Un import en sentido incorrecto **falla `pnpm lint`**.

## Alias de import

| Alias             | Resuelve a           |
| ------------------ | ---------------------- |
| `@domain/*`         | `src/domain/*`         |
| `@application/*`    | `src/application/*`    |
| `@adapters/*`       | `src/adapters/*`       |
| `@composition/*`    | `src/composition/*`    |

`app/` y `ui/` no tienen alias propio (ADR-007 §4): usan imports relativos o
los cuatro alias de arriba.

## Interfaces de servicio (puertos)

Las interfaces que necesita `application/` viven en `application/ports/`,
agrupadas por naturaleza, y **todas devuelven `Promise<T>` desde el día uno**
(ADR-003), aunque el adaptador in-memory resuelva de forma síncrona:

| Puerto                | Ubicación            | Motivo                                              |
| ---------------------- | ---------------------- | ------------------------------------------------------ |
| `StoryRepository`      | `ports/repositories/`  | Persistencia de cuentos (ADR-003).                     |
| `NarrativeGenerator`   | `ports/ai/`             | LLM: generación del cuento y la moraleja.              |
| `SpeechSynthesizer`    | `ports/ai/`             | TTS — dos adaptadores cubren RNF-08 (ADR-006).          |
| `ContentModerator`     | `ports/ai/`             | Guardarraíl de moderación.                             |
| `EmbeddingProvider`    | `ports/ai/`             | Deduplicación por similitud (INC-05).                  |
| `SessionProvider`      | `ports/services/`       | Identidad de la sesión anónima (ADR-008).              |
| `QuotaCounter`         | `ports/services/`       | Cupo de generación por sesión (ADR-006).               |
