# NarrARA — INC-00 (Cimientos) · versión Clean Architecture

> **Propuesta para revisión.** Reescritura de `INC-00` adoptando **Clean Architecture** (Robert C. Martin) como marco arquitectónico principal, en sustitución de «hexagonal» como término rector. El autor revisa y, si procede, se integra al documento `NarrARA_Plan_Incrementos` (que subiría a v1.1.0) y se propaga el cambio de vocabulario al resto de documentos.
>
> **Cambios en v1.1.0 (2026-08-26).** Alineación con **ADR-007 v1.1.0** (estructura física de carpetas) y con la **convención de nomenclatura de código en inglés** ya aplicada en ADR-002 v1.1.0 y SPEC-01 v1.1.0. Carpetas: `src/entities` → `src/domain`, `src/use-cases` → `src/application`, `src/drivers` → `src/composition`, `app/` → `src/app`. Interfaces renombradas a inglés (`CuentoRepository` → `StoryRepository`, etc.). Actualizados **T02, T03, T07, T08** y **DoD02, DoD07, DoD08**. Incorporadas las decisiones de **ADR-005**, **ADR-006** y **ADR-008**, posteriores a la v0.2.0.
>
> **Cambios en v1.2.0 (2026-08-26).** Se declaran **siete** puertos en lugar de cinco: se añaden `SessionProvider` (identidad de la sesión anónima, ADR-008) y `QuotaCounter` (cupo de generación por sesión con autoridad en servidor, ADR-006), ubicados en `src/application/ports/services/` (ADR-007 §5). Actualizados **T07** y **DoD08**, la tabla de §5, y cerrada la cuestión abierta de §10.
>
> **Recordatorio de artefactos:** `INC-XX` es la *Spec de Incremento* (planificación + Definition of Done). No lleva Gherkin; el comportamiento verificable vive en las *Spec de Componente* (`SPEC-NN`). `INC-00` referencia **cero** SPEC porque es scaffolding sin lógica de dominio.

---

## Nota de marco: Clean Architecture en NarrARA

Clean Architecture organiza el sistema en **capas concéntricas** con una **regla de dependencia** inviolable: el código fuente solo apunta hacia dentro. Las capas externas conocen a las internas; nunca al revés.

| Capa (Clean) | Contenido en NarrARA | Carpeta propuesta |
|--------------|----------------------|-------------------|
| **Entities** (reglas de empresa) | Dominio puro: `Story`, `Page`, `Profile`, `VerificationVerdict`; motor de verificación y rebalanceo como servicios de dominio. TS puro, sin I/O. | `src/domain` |
| **Use Cases** (reglas de aplicación) | Orquestador del pipeline (generar→verificar→moraleja→moderar) y cada caso de uso. Define las **interfaces** (puertos) que necesita. | `src/application` |
| **Interface Adapters** | Implementaciones de esas interfaces: adaptadores de repositorio y de IA, controladores, presenters. | `src/adapters` |
| **Frameworks & Drivers** | Next.js (App Router), composition root, UI de presentación, Postgres/pgvector (futuro), APIs externas (LLM, TTS). El borde. | `src/app`, `src/ui`, `src/composition` |

> **Nomenclatura de carpetas (ADR-007 v1.1.0).** Se emplean `domain` y `application` en lugar de `entities` y `use-cases`. Son términos de DDD, no de Clean Architecture; la divergencia es deliberada, se justifica por legibilidad en el uso diario y la correspondencia con los círculos queda establecida por esta tabla. Debe declararse como tal en la memoria.

> **Convención de nomenclatura de código.** Identificadores en **inglés** en todas las capas, incluida Entities. Lenguaje natural (prosa, Gherkin, historias de usuario) en **español**. Los nombres de dominio siguen el contrato de **SPEC-01 v1.1.0**.

**Inversión de dependencia en la frontera Use Cases ↔ Interface Adapters:** un caso de uso que necesita persistir **define una interfaz en su propia capa** (`StoryRepository`), y el adaptador de la capa externa la **implementa**. Así la dependencia apunta hacia dentro aunque el flujo de datos vaya hacia fuera. Esto es lo que en el diseño previo (hexagonal) llamábamos «puerto»: se conserva íntegro, solo cambia el encuadre y el nombre de la capa.

---

# INC-00 — Cimientos

**Estado:** ✅ Completado · **Fecha de cierre:** 2026-08-27 · **Versión:** 1.2.0 (v1.1.0: 2026-08-26; v0.2.0: 2026-07-08)

### 1. Objetivo y valor

Establecer el **esqueleto ejecutable** del proyecto conforme a Clean Architecture: estructura de capas (Entities / Use Cases / Interface Adapters / Frameworks & Drivers), tooling de desarrollo (TypeScript estricto, Vitest, Playwright, linter, formateo), integración continua en verde, y las **interfaces de los casos de uso declaradas** (los antiguos «puertos»). No implementa lógica de dominio; su valor es **habilitar que cada incremento posterior se construya sobre cimientos correctos y verificables**, con la regla de dependencia de Clean blindada desde el minuto uno.

Hace *demostrable* la decisión arquitectónica ante el tribunal: las capas y su regla de dependencia existen en el árbol de ficheros —y se imponen por linter— antes de escribir una sola regla de negocio.

### 2. Alcance

**Incluye:**
- Inicialización de Next.js (App Router) + TypeScript estricto con **pnpm**.
- Estructura de carpetas por capas de Clean (`domain`, `application`, `adapters`, `composition`, `app`, `ui`), conforme a **ADR-007 v1.1.0**, con organización **por concepto** dentro de cada capa.
- Configuración verificada de Vitest (unitario/integración) y Playwright (E2E) — ya instalados; aquí se estructuran con un test *dummy* en verde por runner.
- ESLint + Prettier + `tsconfig` estricto como scripts de `pnpm`.
- **Regla de dependencia de Clean impuesta por linter:** Entities no importa de ninguna capa; Use Cases solo de Entities; Adapters de Use Cases y Entities; Frameworks & Drivers del resto. Un import que viole el sentido hacia dentro **falla el lint**.
- Declaración de las **interfaces de casos de uso** (puertos) en la capa Use Cases: repositorio, LLM, TTS, moderación, embeddings, y los servicios de sesión (`SessionProvider`, ADR-008) y cupo (`QuotaCounter`, ADR-006). **Todas async** (devuelven `Promise`; ADR-003).
- **Composition root manual** (DI sin framework; ADR-004) como punto único de ensamblado, en Frameworks & Drivers (`src/composition`).
- Adaptador *stub* in-memory de `StoryRepository`, solo para probar el ensamblado.
- Contenerización base: `Dockerfile` + `docker-compose.yml` mínimo (RNF-13, HU-33).
- CI (GitHub Actions): install → lint → typecheck → test → build.
- Gestión de secretos por entorno con `.env.example` (RNF-02).

**NO incluye:**
- Ninguna regla de dominio (verificación, rebalanceo, moraleja) → INC-01+.
- Ningún adaptador de IA real ni llamada a API externa → INC-04.
- Persistencia real (Postgres/pgvector) → INC-05 (ADR-003).
- Autenticación y cuentas de usuario → **fuera del proyecto** (ADR-008: el MVP no tiene cuentas; material diferido en §17.5 y §18.5 del troncal).
- Sesión anónima persistente y contador de cupo → incrementos posteriores (ver §10, cuestiones abiertas).
- UI más allá de una página mínima que confirme el arranque.

### 3. Trazabilidad

- **Requisitos:** RNF-08 (interfaces intercambiables — se sientan las bases), RNF-09 (tests + análisis estático en CI), RNF-13 (contenerización), RNF-02 (secretos).
- **Historias de usuario:** HU-33 (despliegue reproducible).
- **Specs de componente referenciadas:** ninguna.

### 4. Dependencias y precondiciones

- **Precondición externa:** entorno operativo (VS Code + PowerShell + Claude Code en Windows) — ✅ resuelto.
- **Decisiones aceptadas:** **ADR-001 v1.1.0** (Next.js full-stack), **ADR-002 v1.1.0** (Genkit tras la interfaz de LLM), **ADR-003** (persistencia diferida, async-first), **ADR-004** (composition root manual), **ADR-005** (despliegue híbrido, sin colas), **ADR-006** (coste cero y minimización de datos), **ADR-008** (sesión anónima, sin cuentas).
- **Decisiones pendientes de aceptación que condicionan este incremento:**
  - **ADR-007 v1.1.0** — estructura física de carpetas. **Bloqueante para T02**: define los nombres de carpeta que esta versión ya aplica.
  - **ADR-001 v1.2.0** — mecanismo de entrada (Server Actions en lugar de Route Handlers). No bloquea INC-00, que no implementa entrada, pero conviene cerrarla antes de INC-06.
- **Nota de marco:** este INC-00 asume Clean Architecture; su aceptación implica propagar el cambio hexagonal→Clean al resto de documentos (reconciliación).

### 5. Interfaces y adaptadores afectados

| Interfaz (capa Use Cases) | Estado en INC-00 | Adaptador (capa Interface Adapters) |
|---------------------------|------------------|-------------------------------------|
| `StoryRepository` | Declarada (async) | *Stub* in-memory (prueba de ensamblado) |
| `NarrativeGenerator` | Declarada (async, vacía) | Ninguno (fake en INC-02; Genkit en INC-04) |
| `SpeechSynthesizer` | Declarada (async, vacía) | Ninguno (Web Speech API + nube en INC-04 — **cubre RNF-08**, ADR-006) |
| `ContentModerator` | Declarada (async, vacía) | Ninguno (fake en INC-02; real en INC-03) |
| `EmbeddingProvider` | Declarada (async, vacía) | Ninguno (real en INC-05) |
| `SessionProvider` | Declarada (async) | Ninguno (real en el incremento de biblioteca/sesión — ADR-008) |
| `QuotaCounter` | Declarada (async) | Ninguno (real en el incremento de biblioteca/sesión — ADR-006) |

**Ubicación (ADR-007 v1.1.0):** `StoryRepository` en `src/application/ports/repositories/`; las cuatro de IA (`NarrativeGenerator`, `SpeechSynthesizer`, `ContentModerator`, `EmbeddingProvider`) en `src/application/ports/ai/`; `SessionProvider` y `QuotaCounter` en `src/application/ports/services/`.

> **Invariante (ADR-003):** todas las interfaces devuelven `Promise<T>` aunque el *stub* in-memory resuelva de forma síncrona. El dominio y los casos de uso «piensan en asíncrono» desde el inicio.

### 6. Tareas (`INC-00-Txx`)

- **INC-00-T01.** Inicializar Next.js (App Router) + TypeScript estricto con pnpm. Verificar `pnpm dev`.
- **INC-00-T02.** Crear la estructura de capas Clean conforme a **ADR-007 v1.1.0** (`src/domain`, `src/application`, `src/adapters`, `src/composition`, `src/app`, `src/ui`), con las subcarpetas por concepto dentro de `domain`. Documentar en un README de arquitectura la responsabilidad de cada capa, la tabla de correspondencia capa↔círculo y la **regla de dependencia** (sentido hacia dentro).
- **INC-00-T03.** `tsconfig` estricto (`strict`, `noUncheckedIndexedAccess`) con alias de path por capa: `@domain/*`, `@application/*`, `@adapters/*`, `@composition/*`.
- **INC-00-T04.** Estructurar Vitest: test *dummy* unitario en verde. Script `pnpm test`.
- **INC-00-T05.** Estructurar Playwright: test *dummy* E2E en verde contra la página mínima. Script `pnpm test:e2e`.
- **INC-00-T06.** ESLint + Prettier + scripts. Integrar la **regla de dependencia de Clean** con `eslint-plugin-boundaries`, configurando las seis reglas de **ADR-007 v1.1.0 §4**, de modo que cualquier import en sentido incorrecto falle el lint.
- **INC-00-T07.** Declarar las siete interfaces de casos de uso en `src/application/ports/`, con firmas async mínimas y comentario de propósito, identificadores en inglés: `StoryRepository` (en `ports/repositories/`); `NarrativeGenerator`, `SpeechSynthesizer`, `ContentModerator`, `EmbeddingProvider` (en `ports/ai/`); `SessionProvider` y `QuotaCounter` (en `ports/services/`).
- **INC-00-T08.** Implementar el *stub* in-memory de `StoryRepository` en `src/adapters/persistence/in-memory/` y el **composition root** en `src/composition/container.ts` que lo inyecte. Test de integración que prueba el ensamblado y el contrato async.

> **Nota de implementación (T08).** En Next.js, un almacén en memoria a nivel de módulo se reinicia con el *hot reload* en desarrollo y no comparte estado entre invocaciones en producción serverless (ADR-005). El *stub* debe anclarse a `globalThis` y ese comportamiento debe quedar documentado en el README, para no confundir un límite conocido del adaptador con un fallo de la arquitectura.
- **INC-00-T09.** `Dockerfile` + `docker-compose.yml` mínimo. Verificar arranque contenerizado.
- **INC-00-T10.** `.env.example` + `.env` en `.gitignore`. Documentar política de secretos (RNF-02).
- **INC-00-T11.** Workflow de GitHub Actions: install → lint → typecheck → test → build. Verificar verde.
- **INC-00-T12.** README raíz: arranque, testing, mapa de capas Clean, enlace a ADRs.

### 7. Estrategia de test (TDD)

INC-00 es infraestructura; el «test» valida cimientos, no comportamiento de dominio:
- **Vitest (unitario):** test *dummy* que confirma runner + resolución de alias/`tsconfig`.
- **Vitest (integración):** instancia el composition root, obtiene el *stub* de `StoryRepository` a través de su interfaz y confirma que devuelve `Promise` (valida contrato async + DI manual + regla de dependencia en tiempo de ejecución).
- **Playwright (E2E):** smoke test que arranca la app y confirma que la página mínima responde 200.
- **CI como test de sistema:** el workflow verifica lint + typecheck + build + tests reproducibles.
- **Orden:** sin red-green-refactor clásico (no hay lógica). Criterio: «verde reproducible en local y en CI».

### 8. Definition of Done (`INC-00-DoDxx`)

`INC-00` está **Completado** cuando todos los ítems son ✅:

- **INC-00-DoD01.** `pnpm install` reproduce el entorno en una máquina limpia sin errores.
- **INC-00-DoD02.** Existe la estructura de capas Clean conforme a ADR-007 v1.1.0 (`domain`, `application`, `adapters`, `composition`, `app`, `ui`) y está documentada en el README de arquitectura, con la tabla de correspondencia capa↔círculo.
- **INC-00-DoD03.** `pnpm dev` arranca la app y sirve una página mínima.
- **INC-00-DoD04.** `pnpm test` pasa con ≥1 test unitario y ≥1 de integración en verde.
- **INC-00-DoD05.** `pnpm test:e2e` pasa el smoke test de Playwright en verde.
- **INC-00-DoD06.** `pnpm lint` y `pnpm typecheck` pasan sin errores.
- **INC-00-DoD07.** La regla de dependencia de Clean está activa: un import de prueba desde `domain` hacia `adapters` **falla el lint** (verificado con un caso que se revierte). Se comprueba igualmente que un import desde `ui` hacia `domain` falla.
- **INC-00-DoD08.** Las siete interfaces de casos de uso están declaradas (async) en `src/application/ports/` (`repositories/`, `ai/`, `services/`), con identificadores en inglés.
- **INC-00-DoD09.** El composition root ensambla el *stub* de repositorio y el test de integración lo demuestra.
- **INC-00-DoD10.** `docker-compose up` levanta la app de forma reproducible.
- **INC-00-DoD11.** No hay secretos en el repositorio; existe `.env.example` y `.env` está ignorado.
- **INC-00-DoD12.** El workflow de GitHub Actions pasa en verde sobre un commit limpio.
- **INC-00-DoD13.** El README raíz explica arranque, testing y mapa de capas Clean.

### 9. Riesgos y notas

- **Riesgo (curva Node/Next/Clean).** El autor viene de PHP con experiencia casi nula en JS/TS de servidor. INC-00 asienta ese aprendizaje (ESM, async, resolución de imports) y además el vocabulario de Clean. Mitigación: no avanzar a INC-01 hasta que el esqueleto se **entienda**, no solo funcione.
- **Riesgo (contaminación de capas por Next).** Next empuja a poner lógica en Server Actions/route handlers (capa Frameworks & Drivers). Mitigación: la regla de dependencia por linter (T06) lo bloquea automáticamente; es la salvaguarda técnica de la tesis arquitectónica.
- **Nota (coherencia documental).** ✅ La propagación hexagonal→Clean está completada en troncal (v1.8.0), Consolidación (v1.4.0), Historias de Usuario (v1.1.0), Especificaciones (v1.1.0) y ADR-001/002 (v1.1.0).
- **Nota (Genkit).** No entra en INC-00. Vivirá en `src/adapters/ai/genkit/` (capa Interface Adapters) en INC-04, tras la interfaz `NarrativeGenerator` ya declarada aquí.
- **Nota (ADR-006).** El desarrollo se realiza contra **adaptadores fake** y la CI **nunca invoca APIs reales**. INC-00 no declara adaptadores fake (llegan en INC-02), pero el workflow de T11 no debe requerir ninguna credencial de proveedor.

### 10. Cuestiones abiertas

- ~~**Puerto `SessionProvider` y contador de cupo (`QuotaCounter`).**~~ ✅ **Resuelto (v1.2.0):** ambos puertos se declaran en INC-00 (siete interfaces en total), en `src/application/ports/services/`. Solo se declaran las interfaces async; sus adaptadores reales llegan en el incremento que implemente la biblioteca/sesión. T07 y DoD08 ajustados.
- **Aceptación de ADR-007 v1.1.0.** Bloqueante para T02. En este repositorio, ADR-007 figura como **Aceptada**.
