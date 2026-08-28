# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere al [Versionado Semántico](https://semver.org/lang/es/).

## [No publicado]

### Añadido

- **INC-01-T14 — Corpus de evaluación del motor (`tests/corpus/`).** Se añade
  `tests/corpus/verification-cases.ts` (textos etiquetados que deben pasar y fallar por cada
  dimensión —legibilidad, vocabulario, longitud de frase, longitud de página— con los valores
  provisionales de la tabla maestra) y su test `tests/corpus/__tests__/verification-corpus.test.ts`,
  que valida el corpus contra el motor real cableado con silabajs y referencia por nombre los
  escenarios Gherkin de SPEC-01 §5 (incluidos determinismo y entrada inválida). Activo del
  capítulo de evaluación (DoD12/DoD13).

- **INC-01-T13 — Cableado del motor en el composition root (pureza R11).** El `Container`
  (`src/composition/container.ts`) ensambla `VerificationEngine` inyectando el adaptador real
  `silabajsSyllableCounter` en el motor puro. Se añade el test de integración
  `src/composition/__tests__/verification.integration.test.ts` (motor cableado con silabajs real
  procesando una narrativa mock de principio a fin, determinista). `pnpm lint` (regla de
  dependencia) confirma que el dominio no importa fuera de `domain/` y que `silabajs` solo vive
  en `adapters/`.

- **INC-01-T12 — Fachada `VerificationEngine.verify` — R10, R11.** Se añade
  `src/domain/verification/verification-engine.ts` con `createVerificationEngine(countSyllables)`,
  que orquesta las funciones puras (validar → medir → paginar → componer) y devuelve el
  `VerificationResult` (`verdict` + `pages` + `warnings`). El contador de sílabas se inyecta; el
  motor no importa nada externo (pureza R11) ni decide re-generar (R10, es del orquestador).

- **INC-01-T11 — Composición del veredicto (`composeVerdict`) — R09.** Se añade
  `src/domain/verification/verdict.ts`, función pura que a partir de las medidas por dimensión y
  del resultado de la paginación construye el `VerificationVerdict`: `passes` es cierto solo si
  legibilidad (R01), vocabulario (R02), longitud de frase (R03) y longitud de página se cumplen,
  con `details` por dimensión (`value`/`passes`). Las páginas sobredimensionadas emitidas como
  `warning` (R07) no cuentan como incumplimiento de longitud de página.

- **INC-01-T10 — Validación de entrada (`validateInput`).** Se añade
  `src/domain/verification/validate-input.ts`, que valida la entrada del motor con el esquema Zod
  del contrato (`safeParse`) y exige narrativa no vacía; ante cualquier fallo (narrativa vacía,
  lista de frecuencia vacía, `min>max`, valores no positivos, `%` fuera de `[0,100]`) lanza
  `InvalidVerificationInputError` con un mensaje que identifica el campo, sin devolver veredicto.

- **INC-01-T09 — Paginación determinista (`paginate`) — R04-R08.** Se añade
  `src/domain/verification/pagination/paginate.ts`, función pura que reparte la narrativa continua
  en páginas de hasta `maxLengthPerPage` palabras cortando siempre por frase completa (R04/R05),
  genera tantas páginas como haga falta para el sobrante (R06), acepta la frase única
  sobredimensionada en su propia página con un `Finding` de severidad `warning` sin hacer fallar
  la longitud de página (R07), y es determinista (R08, reparto de una sola pasada sin aleatoriedad).

- **INC-01-T08 — Longitud de frase máxima (`computeMaxSentenceLength`) — R03.** Se añade
  `src/domain/verification/rules/sentence-length.ts`, función pura que devuelve el número de
  palabras de la frase más larga (máximo por frase; sin mínimo). Usa el mismo criterio de fin
  de frase que el IFSZ y la paginación.

- **INC-01-T07 — Vocabulario fuera de lista (`computeVocabulary`) — R02.** Se añade
  `src/domain/verification/rules/vocabulary.ts`, función pura que calcula el porcentaje de
  palabras del texto fuera de `allowedFrequencyList`, tratando los `characterNames` como
  dentro de lista (los nombres propios no penalizan). Comparación insensible a mayúsculas;
  devuelve `percentageOutside`, `outsideCount` y `wordCount`.

- **INC-01-T06 — Legibilidad IFSZ (`computeReadability`) — R01.** Se añade
  `src/domain/verification/readability/readability.ts` con `computeReadability`, función pura
  que aplica el Índice de Flesch-Szigriszt `IFSZ = 206.835 − 62.3·(S/P) − (P/F)` (ADR-012) con
  el contador de sílabas, la tokenización y la segmentación **inyectados** (el dominio no importa
  silabajs). El resultado no tiene techo (puede superar 100). Incluye `readabilityWithinRange`
  (mínimo inclusivo, máximo exclusivo, `null` = sin techo) para la comprobación de R01.

- **INC-01-T05 — Silabeador del español (`SyllableCounter` + adaptador `silabajs`).** Se añade
  el tipo de dominio `SyllableCounter` (`src/domain/verification/readability/syllable-counter.ts`,
  función pura inyectable, sin dependencias externas) y su adaptador
  `silabajsSyllableCounter` (`src/adapters/text/silabajs-syllable-counter.ts`), que envuelve la
  librería **`silabajs` v2.1.0** (dependencia nueva, MIT, pinada exacta; context7 no la indexa).
  El adaptador se valida contra un **corpus de recuento silábico conocido** (`tests/corpus/syllables.ts`:
  hiato, diptongo, triptongo, «h» muda, «y») que silabajs supera. `silabajs` solo aparece en
  `adapters/`; el dominio no la importa (pureza R11, ADR-015). El test del corpus vive en la capa
  de adaptadores para no violar la regla de dependencia (un test en `domain/` no puede importar
  de `adapters/`).

- **INC-01-T04 — Segmentación de frases (`segmentSentences`).** Se añade
  `src/domain/verification/text/segment-sentences.ts`, función pura y determinista que separa
  el texto por signos terminales (`. ! ? …`, colapsando varios seguidos), respeta las
  abreviaturas conocidas (configurables, `Sr.`, `etc.`…) y mantiene las comillas de cierre de
  los diálogos dentro de su frase. Su criterio de fin de frase es **único** y lo comparten el
  conteo de frases (`F`) del IFSZ (R01), la longitud de frase (R03) y la paginación (R04-R08).

- **INC-01-T03 — Tokenización de palabras (`tokenize`).** Se añade
  `src/domain/verification/text/tokenize.ts`, función pura que separa el texto en palabras
  (secuencias de letras Unicode con tildes/`ñ` y guiones internos), ignora signos de puntuación
  y números sueltos, y normaliza a minúsculas para comparar sin distinguir mayúsculas. Base del
  conteo de palabras (`P`) del IFSZ, del vocabulario (R02) y de la longitud de frase (R03).

- **INC-01-T02 — Contrato Zod del motor de verificación (SPEC-01 v1.2.0 §3).** Se añade
  `src/domain/verification/contract.ts` con los esquemas Zod como fuente única de verdad
  (`VerificationParameters`, `VerificationInput`, `Finding`, `Severity`, `VerificationVerdict`,
  `VerificationResult`) y sus tipos derivados con `z.infer`, más la excepción
  `InvalidVerificationInputError`. El `VerificationParametersSchema` valida los invariantes de
  entrada (rango de legibilidad con `max` exclusivo/`null`, `maxLengthPerPage`/`maxSentenceLength`
  positivos, `%` en `[0,100]`, lista de frecuencia no vacía). `Page` pasa a modelarse con
  `PageSchema` (Zod) como fuente de verdad, del que se deriva su tipo (regla de gobernanza nº5).

- **INC-01-T01 — Entidades de dominio del cuento.** Se añaden `Story`, `Page` y los value
  objects `Title` y `Moral` en `src/domain/story/`, con sus invariantes de construcción
  (texto/valor no vacío; un cuento tiene al menos una página) y su batería de tests (Vitest).
  Primera pieza de lógica de dominio de INC-01, construida con TDD; el dominio permanece puro
  (sin I/O ni dependencias de framework).

- **ADR-015 — Silabeador del español (`silabajs`) tras un port, con fallback propio.** Para el
  conteo de sílabas (`S`) que exige el IFSZ (ADR-012), se adopta `silabajs` v2.1.0 (MIT, 0
  dependencias, TS, maneja hiato/diptongo/triptongo), **usado a través de un port** y
  **validado con un corpus** de recuentos conocidos; si falla el cálculo, se sustituye por una
  implementación propia por reglas sin tocar el resto. context7 no indexa el paquete; versión
  fijada.

- **ADR-014 — Generación como texto continuo y paginación en el backend.** El LLM genera
  narrativa continua con longitud orientativa y el backend la pagina de forma determinista
  (palabras/página por franja de edad), cortando por frase completa. Reformula SPEC-01
  R04-R08 (de «rebalanceo» a «paginación») y refina RF-06b del troncal; materializado en
  SPEC-01 v1.2.0.
- **Tabla maestra de parámetros** (`context/domain/tabla-maestra-parametros.md`): valores de
  partida por franja de edad (F1 3-5, F2 6-7, F3 8-10) para longitud, `maxLengthPerPage`,
  longitud de frase, rango IFSZ y % de vocabulario fuera de lista, más los parámetros de
  prompt. Solo F1·70 palabras/página está anclado en un dato real; el resto son provisionales.
  Rango IFSZ a piso sin techo en F1 (el IFSZ no está acotado a 100).

- **ADR-013 (Propuesta) — Input opcional «nivel de lectura».** Registra como mejora futura la
  posibilidad de un control en el frontal que fije la complejidad sintáctica y narrativa
  enviada al LLM con independencia de la edad (por defecto derivada de la franja, ajustable
  manualmente). Alcance MVP acotado a las instrucciones de prompt; no toca los parámetros
  validados por el motor. Sujeto a minimización de datos (ADR-006).

- **ADR-012 — Índice de legibilidad INFLESZ (Flesch-Szigriszt).** Resuelve la decisión
  pendiente de `SPEC-01-R01` (la spec dejaba el índice sin elegir, «Fernández-Huerta /
  INFLESZ»): se adopta el **Índice de Flesch-Szigriszt (IFSZ)** con la **Escala INFLESZ**,
  con fórmula, tramos y fuente primaria citable (Barrio-Cantalejo et al., *An. Sist. Sanit.
  Navar.* 2008;31(2)). Fija que `readabilityRange` se expresa en unidades IFSZ y deja
  registrada como pendiente la calibración edad→rango (no la aporta INFLESZ). Desbloquea la
  columna de legibilidad de la tabla maestra (§19.1) e `INC-01-T04`.

- **`docs/LEARNINGS.md`**: registro vivo de lecciones operativas (incidentes de
  fiabilidad de subagentes de IA, condiciones de carrera sobre un worktree
  compartido, disciplina TDD, artefactos de `core.autocrlf` en Windows, y
  aislamiento de herramientas de terceros vendorizadas). Regla de gobernanza
  nº6 añadida a `CLAUDE.md` para consultarlo antes de trabajo complejo con
  subagentes y para registrar nuevos incidentes cuando ocurran.
- **Contenerización** (INC-00-T09, ADR-005): `Dockerfile` multi-stage sobre
  `node:22-alpine` con salida `standalone` de Next.js, `docker-compose.yml`
  con un único servicio `app` (sin BD: Postgres llega en INC-05), y
  `.dockerignore`. `package.json` fija `packageManager` para que Corepack
  instale la versión exacta de pnpm en el contenedor.
- **Composition root manual** (`src/composition/container.ts`, ADR-004) que
  ensambla el primer adaptador real: `InMemoryStoryRepository`
  (`src/adapters/persistence/in-memory/`), anclado a `globalThis` para
  sobrevivir al hot reload de Next.js. Test de integración que prueba el
  ensamblado y el contrato async (INC-00-DoD09).
- Las **siete interfaces de casos de uso** (puertos) de INC-00-T07 en
  `src/application/ports/`: `StoryRepository` (`repositories/`);
  `NarrativeGenerator`, `SpeechSynthesizer`, `ContentModerator`,
  `EmbeddingProvider` (`ai/`); `SessionProvider`, `QuotaCounter`
  (`services/`). Todas async (`Promise<T>`, ADR-003).
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
    [SPEC-01, motor de verificación](docs/specs/SPEC-01_Motor_Verificacion_v1_2_0.md) (v1.2.0).
  - `docs/increments/` — [plan maestro de incrementos](docs/increments/NarrARA_Plan_Incrementos_v1_1_0.md) (v1.1.0),
    [INC-00, cimientos](docs/increments/INC-00_Cimientos_v1_2_0.md) (v1.2.0)
    e [INC-01, motor de verificación](docs/increments/INC-01_Motor_Verificacion_v1_1_0.md) (v1.1.0).
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
  matchers de **jest-dom**, resolución nativa de los cuatro alias por capa
  (`@domain/*`, `@application/*`, `@adapters/*`, `@composition/*`), cobertura con
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
- **Regla de dependencia de Clean Architecture impuesta por linter**
  (`eslint-plugin-boundaries` 7.2 + `eslint-import-resolver-typescript`),
  codificando las seis reglas de ADR-007 §4. Verificada con dos casos que
  fallan el lint (domain→adapters, ui→application) y se revierten
  (INC-00-DoD07).
- **Prettier 3.9** + `prettier-plugin-tailwindcss` (ordena clases
  automáticamente) + `eslint-config-prettier`. Scripts `pnpm format` y
  `pnpm format:check`. Alcance limitado a código (`.prettierignore` excluye
  Markdown).
- **Integración continua** (`.github/workflows/ci.yml`, INC-00-T11):
  install → lint → typecheck → test → build sobre Node 22, sin ningún
  secreto (ADR-006: la CI nunca invoca APIs reales).
- `.gitattributes`: normaliza los finales de línea a LF. Añadido tras detectar
  que un checkout con `core.autocrlf` en Windows provocaba un falso fallo de
  `pnpm format:check`.

### Cambiado

- **INC-01 → v1.1.0** (`docs/increments/INC-01_Motor_Verificacion_v1_1_0.md`, sustituye a v1.0.0).
  Alineado con SPEC-01 v1.2.0 y ADR-012/013/014/015: el motor **pagina texto continuo** (no
  rebalancea), legibilidad **IFSZ** con **silabeador `silabajs` tras un port** (nueva abstracción
  + adaptador en §5), contrato **Zod** con `characterNames`/`Finding`, longitud de frase por
  máximo. **Tareas reescritas como ciclos TDD** (RED → GREEN → REFACTOR con fichero de test y
  comando, sin prompts literales); §7 separa plan de test vs TDD; DoD reescrito (13 ítems); bloqueo
  de la tabla maestra **degradado** (ya existe con valores provisionales). Referencias actualizadas
  en `docs/README.md`, plan de incrementos y CHANGELOG.
- **SPEC-01 §8 — aclaración conceptual de TDD.** Reescrito el epígrafe de pruebas para separar
  el **plan de test** (qué/cuánto se prueba y a qué nivel) del **TDD como método de
  implementación** (red-green-refactor), que es competencia de INC-01. Sin cambios en el
  contrato ni en las reglas del motor.
- **Tabla maestra — nota del contrato de generación.** Aclarado que el LLM devuelve una
  **respuesta estructurada** (`title` + `narrative` continuo + `moral` + `characterNames`), no
  texto pelado: «texto continuo» (ADR-014) se refiere al campo `narrative`. Los `characterNames`
  los autoría el LLM y se cruzan contra el texto (falla del lado seguro); el detalle fino queda
  para SPEC-02.
- **ADR-012 → v1.1.0.** Añadida la subsección «Origen de las constantes»: explica que `206.835`
  es el intercepto heredado del *Flesch Reading Ease* original y `62.3` la recalibración de
  Szigriszt para el español (frente al `84.6` inglés, por ser el español más polisilábico), para
  que no parezcan valores arbitrarios. Sin cambios en la decisión.
- **SPEC-01 → v1.2.0** (`docs/specs/SPEC-01_Motor_Verificacion_v1_2_0.md`, sustituye a v1.1.0).
  El motor pasa de recibir un `Story` ya paginado y **rebalancear**, a recibir **narrativa
  continua** y **paginarla** (ADR-014). Reglas R04-R08 reformuladas (de rebalanceo a
  paginación; frase sobredimensionada resuelta con `warning`, ya no «a confirmar»). Legibilidad
  fijada a **IFSZ/INFLESZ** (ADR-012) con `readabilityRange` de máximo **exclusivo y opcional**
  (sin techo). Longitud de frase por **máximo** (`maxSentenceLength`), no por media. Contrato
  reexpresado con **esquemas Zod** (regla nº5), `Finding`/`Severity` definidos, detalle de
  página con las páginas que incumplen, y **nombres propios** (`characterNames`) excluidos del
  vocabulario. Gherkin ampliado (vocabulario, frase, frase sobredimensionada, validación de
  entrada). Referencias actualizadas en el contenedor de specs, `docs/README.md` e INC-01.
- **INC-00 (Cimientos) completado.** README raíz actualizado (stack, scripts,
  estructura de capas, enlace a `src/README.md` y a `docs/README.md`).
  Marcado como Completado en `docs/increments/INC-00_Cimientos_v1_2_0.md`,
  en el plan maestro de incrementos y en el índice de documentación.
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

### Corregido

- **ADR-007 → v1.1.1:** corregido un hueco de la regla 5 (§4): el texto nunca
  mencionaba `src/ui/` como destino permitido para `src/app/`, pese a que las
  páginas de Next.js necesitan renderizar componentes de presentación.
  Corregido en el propio ADR y en `eslint.config.mjs`.

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
