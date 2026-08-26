# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere al [Versionado Semántico](https://semver.org/lang/es/).

## [No publicado]

### Añadido

- **Playwright 1.62** para tests E2E: `playwright.config.ts` (proyecto único
  `chromium`, `webServer` sobre `pnpm dev`), smoke test `e2e/smoke.spec.ts`
  que confirma que la home responde 200 y renderiza el stub de NarrARA, y
  script `pnpm test:e2e`. `vitest.config.ts` excluye `e2e/**` para evitar que
  Vitest recoja los specs de Playwright.
- **Documentación del TFM incorporada a `docs/`**, organizada por propósito en carpetas
  hermanas de `decisions/` (nombres con sufijo de versión para reflejar la versión vigente):
  - `docs/project/` — [troncal](docs/project/NarrARA_v1_7_0.md) (v1.7.0),
    [consolidación](docs/project/NarrARA_Consolidacion_v1_3_0.md) (v1.3.0) e
    [historias de usuario](docs/project/NarrARA_Historias_Usuario_v1.0.0.md) (v1.0.0).
  - `docs/research/` — [investigación sobre dislexia](docs/research/Investigacion_Dislexia_v1.0.0.md) (v1.0.0).
  - `docs/ux/` — [diseño de pantallas y flujos](docs/ux/NarrARA_UX_Stitch_v1.1.0.md) (v1.1.0).
  - `docs/specs/` — [contenedor SDD](docs/specs/NarrARA_Specs_v1_2_0.md) (v1.2.0) y
    [SPEC-01, motor de verificación](docs/specs/SPEC-01_Motor_Verificacion_v1_1_0.md) (v1.1.0).
  - `docs/increments/` — [plan maestro de incrementos](docs/increments/NarrARA_Plan_Incrementos_v1_1_0.md) (v1.1.0),
    [INC-00, cimientos](docs/increments/INC-00_Cimientos_v1_2_0.md) (v1.2.0)
    e [INC-01, motor de verificación](docs/increments/INC-01_Motor_Verificacion_v1_0_0.md) (v1.0.0).
  - Índice general de documentación en [`docs/README.md`](docs/README.md).
- **8 ADRs de arquitectura del TFM** incorporados al registro de decisiones
  (`docs/decisions/`), bajo el esquema unificado `ADR-NNN`:
  - [ADR-001](docs/decisions/ADR-001-nextjs-fullstack.md) — Next.js full-stack para el MVP.
  - [ADR-002](docs/decisions/ADR-002-genkit-adaptador-ia.md) — Genkit como framework del adaptador de IA.
  - [ADR-003](docs/decisions/ADR-003-persistencia-diferida.md) — Persistencia diferida tras interfaz de repositorio.
  - [ADR-004](docs/decisions/ADR-004-composition-root-manual.md) — Composition root manual (inyección de dependencias).
  - [ADR-005](docs/decisions/ADR-005-despliegue-sin-colas.md) — Despliegue híbrido y renuncia a colas en el MVP.
  - [ADR-006](docs/decisions/ADR-006-coste-minimo.md) — Coste mínimo y minimización de datos en IA.
  - [ADR-007](docs/decisions/ADR-007-estructura-fisica-capas.md) — Estructura física de carpetas (Clean Architecture).
  - [ADR-008](docs/decisions/ADR-008-sin-cuentas-sesion-anonima.md) — Sesión anónima persistente (sin cuentas, propuesta).
- Dependencia **Zod 4** (`zod@^4.4.3`) para la definición y validación de esquemas de los
  objetos de dominio, con inferencia estática de tipos en TypeScript.
- ADR-011: decisión de usar **Vitest** (testing) y **Zod** (tipado/validación), con estado
  Aceptada (ver [ADR-011](docs/decisions/ADR-011-testing-vitest-y-zod.md)).
- Configuración de testing con **Vitest 4**: `vitest.config.ts` (entorno `jsdom` por defecto
  para componentes; entorno `node` por fichero para backend), `vitest.setup.ts` con los
  matchers de **jest-dom**, resolución nativa del alias `@/*`, cobertura con
  `@vitest/coverage-v8`, y scripts `test`, `test:run` y `test:coverage`. Incluye tests de
  ejemplo para ambos entornos (jsdom y node).

- Herramientas de diseño asistido por IA para el flujo de desarrollo (ver
  [ADR-010](docs/decisions/ADR-010-herramientas-diseno-asistido.md)):
  - **Impeccable** v3.2.0 integrado en el proyecto (`.claude/skills/impeccable/`): skills
    de diseño y detector de anti-patrones de UI. Incluye un hook `PostToolUse` compartido
    en `.claude/settings.json` que ejecuta el detector tras cada edición de UI.
  - **UI UX Pro Max** v2.6.2 adoptado como plugin de Claude Code a nivel de usuario (no
    versionado en el repo): bases de datos de estilos, paletas, tipografías y guías por
    stack.
- `.gitignore`: se ignora `.claude/settings.local.json` (configuración personal); el hook
  compartido se mantiene en `.claude/settings.json`.

### Cambiado

- **INC-00 (Cimientos) → v1.2.0:** se amplía de cinco a **siete puertos** declarados en el
  esqueleto. Se añaden `SessionProvider` (identidad de la sesión anónima, ADR-008) y
  `QuotaCounter` (cupo de generación por sesión con autoridad en servidor, ADR-006), en
  `src/application/ports/services/`. Ajustados T07, DoD08, la tabla de interfaces y cerrada
  la cuestión abierta correspondiente. Renombrado el fichero a `INC-00_Cimientos_v1_2_0.md`.
- **Registro de decisiones unificado al esquema `ADR-NNN`.** Los ADR previos en formato
  MADR (`0001`–`0003`) se migran conservando su contenido y su fecha de aceptación original:
  `0001`→**ADR-009** (stack base), `0002`→**ADR-010** (diseño asistido), `0003`→**ADR-011**
  (Vitest+Zod). Se reconcilia el solapamiento del stack base con [ADR-001](docs/decisions/ADR-001-nextjs-fullstack.md),
  que pasa a ser la decisión autoritativa del framework y el mecanismo de entrada. Se
  actualizan la plantilla (`adr-template.md`) y el índice (`README.md`) al nuevo formato.
- `CLAUDE.md`: ampliado con convenciones de código (Server vs Client Components, lógica de
  IA en el servidor, tipos, estilos), sección de testing con **Vitest 4**, checklist de
  accesibilidad WCAG 2.2 AA, sección de seguridad y secretos, y checklist de cierre
  actualizado (tests y accesibilidad).
- `CLAUDE.md`: regla de gobernanza obligatoria nº5 — **uso de Zod** como fuente única de
  verdad para tipar y validar objetos de dominio y fronteras de datos (tipos derivados con
  `z.infer<>`), reflejada también en el checklist de cierre.
- `eslint.config.mjs`: se ignoran los directorios generados `coverage/` y `.claude/` para
  que no ensucien el análisis de ESLint.
- `tsconfig.json`: se excluyen los ficheros de test (`**/*.test.ts`, `**/*.test.tsx`,
  `__tests__/**`) del typecheck del build de producción; Vitest los sigue ejecutando con su
  propia configuración.
- Migrada la aplicación a `src/app/` y creadas las capas Clean (`src/domain`,
  `src/application`, `src/adapters`, `src/composition`, `src/ui`) conforme a
  ADR-007. `tsconfig.json` estricto (`noUncheckedIndexedAccess`) con los
  cuatro alias por capa; nuevo script `pnpm typecheck`. Documentada la
  correspondencia círculo↔carpeta y la regla de dependencia en `src/README.md`.
  Sustituida la home de `create-next-app` por un stub mínimo de NarrARA
  (`lang="es"`, sin logo ni enlaces de plantilla).

## [0.1.0] - 2026-07-07

### Añadido

- Proyecto base Next.js 16 con React 19, TypeScript y Tailwind CSS 4 (gestor pnpm).
- Base de gobernanza y contexto del proyecto:
  - `CLAUDE.md` con las reglas obligatorias (SemVer, CHANGELOG, MCP context7, ADR).
  - `CONTRIBUTING.md` con la convención de Conventional Commits y su relación con SemVer.
  - Registro de decisiones de arquitectura en `docs/decisions/` (índice, plantilla MADR
    y ADR-0001 sobre el stack tecnológico base).
  - Carpeta `context/` con documentación de modelo de datos, APIs y glosario de dominio.
  - `.env.example` como plantilla de variables de entorno.
- README profesional del proyecto.

### Corregido

- `.gitignore`: se deja de ignorar `.env.example` para que la plantilla de variables se
  versione.

[No publicado]: https://github.com/pabs-ea/narrara/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/pabs-ea/narrara/releases/tag/v0.1.0
