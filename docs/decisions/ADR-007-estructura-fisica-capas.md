# ADR-007 — Estructura física de carpetas y correspondencia con los círculos de Clean Architecture

- **Versión:** v1.1.1
- **Fecha:** 2026-08-27 (v1.1.0: 2026-08-26; v1.0.0: 2026-08-25)
- **Estado:** ✅ **Aceptada** · **Fecha de aceptación:** 2026-08-26
- **Decisores:** autor del TFM
- **Relacionada con:** ADR-001 (Next.js full-stack), ADR-002 (Genkit tras interfaces de IA), ADR-003 (persistencia diferida), ADR-004 (composition root manual), ADR-006 (minimización de datos), ADR-008 (sesión anónima); **INC-00**; **SPEC-01** (Especificaciones v1.1.0)
- **Sustituye a:** ADR-007 v1.0.0

> **Cambios en v1.1.1.** Corregido un hueco de la regla 5 (§4): el texto nunca mencionaba `src/ui/` como destino permitido para `src/app/`, pese a que las páginas de Next.js necesitan renderizar componentes de presentación — sin esta relación, ninguna página podría importar un componente de `src/ui/`. Detectado durante la ejecución de INC-00-T06 (el linter transcribía fielmente el texto original y bloqueaba esa importación); confirmado con el usuario que no hay alternativa que preserve las cuatro capas sin esta relación. No es un rediseño: las direcciones de dependencia de las otras cinco reglas no cambian.
>
> **Cambios en v1.1.0.** Aplicada la **convención de nomenclatura de código en inglés** (identificadores en inglés en todas las capas; lenguaje natural en español), ya cerrada y aplicada en ADR-002 v1.1.0, INC-00 y SPEC-01 v1.1.0. La v1.0.0 usaba identificadores en castellano (`Cuento`, `Página`, `Veredicto`, `Restricción`), incompatibles con esa convención. Añadidos los **cinco puertos que exige INC-00-T07** (repositorio, LLM, TTS, moderación, embeddings), ausentes en la v1.0.0. Fijado el criterio de **organización por concepto** dentro de cada capa. Sustituido `dependency-cruiser` por `eslint-plugin-boundaries`, conforme a INC-00-T06. Alineado con ADR-008 (sesión anónima, sin entidad de usuario).

---

## 1. Contexto

El marco rector del proyecto es Clean Architecture (Robert C. Martin), que define cuatro círculos concéntricos: Entities, Use Cases, Interface Adapters y Frameworks & Drivers. INC-00 establece la estructura de capas como primera tarea del proyecto, pero deja abiertas tres cuestiones que condicionan el trabajo diario y que este ADR cierra:

1. **Cómo se organiza el contenido *dentro* de cada capa**, que es donde se decide si el árbol envejece bien o se convierte en un cajón de sastre.
2. **Dónde vive la interfaz de usuario**, que INC-00 no aborda porque su alcance excluye la UI.
3. **Qué carpeta corresponde a cada círculo**, incluido el caso del composition root y el del código que solo instancia SDK de terceros.

Adicionalmente, los círculos de Clean Architecture son conceptuales, no una prescripción de carpetas: Martin señala que cuatro es un número esquemático y que la regla irrenunciable es la regla de dependencia, no la cantidad de anillos.

---

## 2. Decisión

### 2.1. Capas de primer nivel

| Círculo Clean Architecture | Carpeta |
|---|---|
| 1 · Entities | `src/domain/` |
| 2 · Use Cases | `src/application/` |
| 3 · Interface Adapters | `src/adapters/` |
| 4 · Frameworks & Drivers | `src/app/`, `src/ui/`, `src/composition/` y `node_modules` |

`src/composition/` pertenece al círculo 4, conforme a ADR-004, que sitúa el composition root en la capa de Frameworks & Drivers. Es el *main component* en el sentido de Martin: el detalle más externo, el que instancia las implementaciones concretas y las entrega a las capas internas. Dentro de esa capa constituye la excepción documentada a la regla de dependencia, ya que es el único módulo autorizado a importar de las cuatro capas.

Se mantiene como carpeta hermana de `src/app/` y no dentro de ella por una razón práctica: `container.ts` es TypeScript plano y debe poder instanciarse desde los tests sin arrancar Next.js.

**No existe una carpeta `src/infrastructure/`.** El código que solo instancia clientes de terceros vive dentro del adaptador que lo consume (`adapters/ai/genkit/client.ts`), y el parseo de configuración junto al composition root (`composition/env.ts`).

### 2.2. Organización interna: por concepto, no por tipo técnico

Dentro de `src/domain/` y de `src/application/use-cases/`, el criterio de agrupación es el **concepto de negocio**, no la categoría técnica del artefacto. No existen carpetas `entities/`, `value-objects/` ni `errors/` de primer nivel dentro del dominio.

**Justificación:** lo que cambia junto debe vivir junto. Una entidad, sus value objects y sus errores forman parte del mismo concepto y se modifican en la misma tarea; repartirlos por tipo obliga a tocar varias carpetas por cada cambio y convierte carpetas como `value-objects/` en cajones donde conviven conceptos que no se relacionan entre sí.

**Excepción justificada:** `src/domain/shared/` agrupa primitivas transversales (identificadores, tipo `Result`, error base de dominio) que no pertenecen a ningún concepto concreto.

**Válvula de escape:** si una carpeta de concepto superase la decena de ficheros, la subdivisión por tipo se aplica *dentro de ella* (`story/value-objects/`), nunca de forma global, para no perder la cohesión.

**Los DTO no residen en el dominio.** Los de entrada y salida de casos de uso pertenecen a `application/`; los ViewModels, a `adapters/inbound/presenters/`.

### 2.3. Nomenclatura

Identificadores de código —tipos, interfaces, propiedades, funciones y nombres de fichero y de carpeta— **en inglés, en todas las capas, incluida Entities**. Lenguaje natural —prosa de documentación, criterios de aceptación en Gherkin, historias de usuario— **en español**. Es la convención ya cerrada y aplicada en ADR-002 v1.1.0, INC-00 y SPEC-01 v1.1.0.

Los nombres del dominio siguen los del contrato de SPEC-01 v1.1.0: `Story`, `Page`, `VerificationParameters`, `VerificationVerdict`.

### 2.4. Los cinco puertos de INC-00-T07

Las interfaces que definen los casos de uso se declaran en `src/application/ports/`, agrupadas por naturaleza, y **todas devuelven `Promise<T>` desde el día uno** (ADR-003):

| Puerto | Ubicación | Adaptadores previstos |
|---|---|---|
| Repositorio | `ports/repositories/` | in-memory (INC-00), Postgres (INC-05) |
| LLM | `ports/ai/` | fake (INC-02), Genkit (INC-04) |
| TTS | `ports/ai/` | Web Speech API y proveedor en la nube — **cubre RNF-08** (ADR-006) |
| Moderación | `ports/ai/` | fake (INC-02), real (INC-03) |
| Embeddings | `ports/ai/` | fake, real (INC-05, deduplicación por similitud) |

### 2.5. Interfaz de usuario

- **`src/app/`** — enrutado, layouts, Server Components y Server Actions. Es el único punto del frontend autorizado a importar de `src/composition/`.
- **`src/ui/`** — componentes de presentación, hooks de cliente y estilos, incluidos los tokens tipográficos derivados de la investigación de dislexia (§20 del troncal).

`src/ui/` no importa de `src/domain/` ni de `src/application/`: consume exclusivamente tipos `*ViewModel` procedentes de `adapters/inbound/presenters/`.

---

## 3. Alternativas consideradas

### 3.1. Nombres de carpeta `entities/` y `use-cases/` (los de INC-00)

- **A favor:** correspondencia literal uno a uno con los nombres de los círculos de Martin; el argumento más fácil de defender ante un tribunal, y coherente con el rechazo de `infrastructure/` por ser vocabulario ajeno al marco.
- **En contra:** `domain/` y `application/` son los términos más extendidos en el ecosistema TypeScript y resultan más legibles en el uso diario; `use-cases/` como carpeta de primer nivel obliga además a anidar `use-cases/use-cases/` o a mezclar puertos y casos de uso en el mismo nivel.
- **Motivo del descarte:** se prioriza la legibilidad cotidiana. **Se asume explícitamente que `domain` y `application` son vocabulario de DDD, no de Clean Architecture**, y que la correspondencia con los círculos queda establecida por la tabla de §2.1 en lugar de por el nombre. Esta asunción debe declararse en la memoria, no dejarse a la interpretación del lector.
- **Consecuencia:** INC-00 debe actualizarse (T02, T03, T07, T08, DoD02, DoD08).

### 3.2. Subdivisión del dominio por tipo técnico (`entities/`, `value-objects/`, `dtos/`, `errors/`)

- **A favor:** clasificación explícita del rol de cada artefacto; patrón habitual en tutoriales de DDD.
- **En contra:** *package by layer* dentro del dominio. Rompe la cohesión, dispersa cada cambio entre varias carpetas y degenera en carpetas-cajón. Una `dtos/` dentro del dominio sería además señal de que una preocupación de transporte se ha filtrado hacia dentro.
- **Motivo del descarte:** perjudica precisamente la propiedad que se quiere demostrar, que es un dominio cohesionado y aislado.

### 3.3. Mantener `infrastructure/` como capa separada de `adapters/`

- **A favor:** distingue el código que implementa interfaces propias del que solo instancia SDK de terceros.
- **En contra:** una capa de primer nivel con dos ficheros no se sostiene, e introduce vocabulario de DDD/Onion en el nivel más visible del árbol.
- **Motivo del descarte:** la distinción se conserva mediante la subdivisión interna de `adapters/`, sin coste estructural.

---

## 4. Cumplimiento

La regla de dependencia no se sostiene por convención de carpetas ni por alias de `tsconfig`: ambos son documentales. Su cumplimiento se verifica con **`eslint-plugin-boundaries`** (INC-00-T06), con ejecución obligatoria en CI y verificado por **INC-00-DoD07**.

Reglas exigibles:

1. `src/domain/` no importa de ninguna otra carpeta de `src/`.
2. `src/application/` importa únicamente de `src/domain/`.
3. `src/adapters/` importa de `src/application/` y `src/domain/`; nunca de `src/app/`, `src/ui/` ni `src/composition/`.
4. `src/ui/` no importa de `src/domain/` ni de `src/application/`; solo tipos `*ViewModel` desde `src/adapters/inbound/presenters/`.
5. `src/app/` importa de `src/composition/`, de `src/adapters/inbound/` y de `src/ui/` (renderiza sus componentes de presentación); nunca de `src/domain/` ni de `src/application/`.
6. Únicamente `src/composition/` puede importar de todas las capas.

La regla 4 tiene además carácter de **restricción técnica**, no solo arquitectónica: la frontera servidor→cliente de Next.js solo admite objetos serializables, por lo que las entidades de dominio (que exponen métodos) no pueden cruzarla. El uso de ViewModels es simultáneamente una exigencia del marco arquitectónico y del framework.

Alias de `tsconfig`: `@domain/*`, `@application/*`, `@adapters/*`, `@composition/*`.

---

## 5. Estructura resultante

```
src/
├─ domain/                              ← Círculo 1 · Entities
│  ├─ story/
│  │  ├─ Story.ts                       raíz de agregado
│  │  ├─ Page.ts
│  │  ├─ StoryRequest.ts
│  │  ├─ StoryStatus.ts                 value object
│  │  ├─ errors.ts
│  │  └─ Story.test.ts
│  ├─ profile/
│  │  ├─ Profile.ts
│  │  ├─ AgeRange.ts                    value object
│  │  ├─ ReadingLevel.ts                value object
│  │  └─ errors.ts
│  ├─ verification/                     SPEC-01
│  │  ├─ VerificationEngine.ts          servicio de dominio puro (R11)
│  │  ├─ VerificationParameters.ts
│  │  ├─ VerificationVerdict.ts
│  │  ├─ Finding.ts
│  │  ├─ Severity.ts
│  │  ├─ Constraint.ts
│  │  ├─ ConstraintCode.ts
│  │  └─ rules/  Rule.ts, InputRules.ts, OutputRules.ts
│  ├─ moderation/
│  │  ├─ ModerationVerdict.ts
│  │  └─ errors.ts
│  └─ shared/    Id.ts, Result.ts, DomainError.ts
│
├─ application/                         ← Círculo 2 · Use Cases
│  ├─ ports/
│  │  ├─ repositories/  StoryRepository.ts, ProfileRepository.ts
│  │  ├─ ai/            NarrativeGenerator.ts, SemanticEvaluator.ts,
│  │  │                 SpeechSynthesizer.ts, ContentModerator.ts,
│  │  │                 EmbeddingProvider.ts
│  │  └─ services/      Clock.ts, IdGenerator.ts, TraceLogger.ts,
│  │                    SessionProvider.ts, QuotaCounter.ts
│  ├─ use-cases/
│  │  ├─ generate-story/    GenerateStory.ts, Input.ts, Output.ts
│  │  ├─ verify-request/    VerifyRequest.ts, Input.ts, Output.ts
│  │  ├─ list-library/
│  │  └─ delete-story/
│  └─ pipeline/             GenerationPipeline.ts
│
├─ adapters/                            ← Círculo 3 · Interface Adapters
│  ├─ inbound/         controllers/, presenters/, validation/
│  ├─ persistence/
│  │  ├─ in-memory/    InMemoryStoryRepository.ts, InMemoryProfileRepository.ts
│  │  └─ postgres/     (vacío hasta INC-05)
│  ├─ ai/
│  │  ├─ genkit/       client.ts, GenkitNarrativeGenerator.ts,
│  │  │                GenkitSemanticEvaluator.ts, GenkitContentModerator.ts,
│  │  │                flows/, mappers/ConstraintPrompt.ts
│  │  ├─ speech/       WebSpeechSynthesizer.ts, CloudSpeechSynthesizer.ts
│  │  └─ fake/         (adaptadores de desarrollo — INC-02, ADR-006)
│  ├─ session/         CookieSessionProvider.ts
│  └─ observability/   ConsoleTraceLogger.ts
│
├─ composition/        container.ts, env.ts        ← Círculo 4 · Composition root
│
├─ app/                                            ← Círculo 4 · Next.js
│  ├─ (app)/stories/[id]/page.tsx
│  ├─ _actions/
│  └─ api/
│
└─ ui/                 components/, styles/typography.css
```

---

## 6. Consecuencias

**Positivas:**

- El árbol es navegable por concepto de negocio, que es como se plantea el trabajo diario.
- La correspondencia carpeta ↔ círculo queda explícita y verificable por linter.
- Los cinco puertos de INC-00-T07 tienen ubicación asignada antes de escribir código.
- El doble adaptador de TTS, que cubre RNF-08, queda visible en la estructura.

**Negativas y riesgos asumidos:**

- **`domain` y `application` no son nombres canónicos de Clean Architecture.** Es una divergencia deliberada y debe declararse en la memoria (ver §3.1); de lo contrario parece un descuido terminológico, justo el que este proyecto ha estado corrigiendo.
- **`src/adapters/` concentra más responsabilidad y crecerá más deprisa.** Se mitiga con la subdivisión por naturaleza y debe revisarse si alguna subcarpeta se convierte en cajón de sastre.
- La ausencia de carpeta explícita para el círculo 4 puede inducir a error a un lector externo; se compensa con la tabla de §2.1, que debe reflejarse también en el troncal.

---

## 7. Notas de trazabilidad

- **Requiere actualizar INC-00** (→ v1.1.0): tareas **T02, T03, T07, T08** y criterios **DoD02, DoD08**, que hoy nombran `src/entities`, `src/use-cases` y `src/drivers`, y que usan `CuentoRepository` en castellano.
- Requiere reflejar la tabla de correspondencia de §2.1 en **§6 del troncal**.
- Consistente con **SPEC-01 v1.1.0** (contrato en inglés, regla R11 de pureza del motor).
- Consistente con **ADR-008**: no existe entidad de usuario; la propiedad de historias y perfiles se ancla a la sesión mediante el puerto `SessionProvider`.

---

## 8. Cuestiones abiertas

- La plantilla canónica (`PLANTILLA-ADR.md`) no se ha aplicado literalmente. Debe reconciliarse antes de la aceptación formal.
- Queda pendiente decidir si el desdoblamiento Server Action → Controller se mantiene tras la ejecución de INC-00, o si se colapsa por resultar un paso puramente delegante (compartida con ADR-001 v1.2.0).
- El puerto `QuotaCounter` se declara aquí por coherencia con el cupo por sesión (ADR-006, ADR-008), pero **no figura entre los cinco de INC-00-T07**. Debe decidirse si entra en INC-00 o en un incremento posterior.
