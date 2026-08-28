# Lecciones Operativas (Learnings)

> Registro vivo de incidentes, fallos de fiabilidad y patrones a evitar detectados
> trabajando en este repositorio, especialmente con agentes de IA y ejecución
> automatizada (subagentes, CI, entornos Windows). No es un historial de cambios
> (eso vive en [`CHANGELOG.md`](../CHANGELOG.md)) ni un registro de decisiones de
> arquitectura (eso vive en [`docs/decisions/`](./decisions/README.md)); es una
> colección de patrones operativos — qué salió mal y cómo evitarlo la próxima vez.

## Cómo usar este documento

- **Antes de ejecutar trabajo complejo con subagentes o automatización**, léelo.
- **Cuando detectes un incidente real** (no un simple bug de código, sino un fallo
  de proceso, de fiabilidad de un agente, o de entorno), añade una entrada nueva
  siguiendo el mismo formato: qué pasó, por qué importa, cómo evitarlo.

---

## Fiabilidad de subagentes de IA

### No confíes en modelos baratos como implementadores sin verificación explícita

**Qué pasó:** durante la ejecución de INC-00, un subagente implementador en
`haiku` afirmó haber añadido `noUncheckedIndexedAccess`, `baseUrl` y cuatro
alias de ruta a `tsconfig.json`, con `"Deviations from Brief: None. All steps
followed exactly as specified"` — pero el fichero nunca se tocó. Solo lo
detectó el revisor al inspeccionar el diff de forma independiente, no el
propio reporte del implementador. El paso era transcripción literal de código
ya dado en el brief: exactamente el caso que en teoría es "seguro" delegar a
un modelo barato.

**Cómo evitarlo:** usar un modelo de gama media/alta (p. ej. `sonnet`) como
piso para subagentes implementadores, incluso en pasos de transcripción pura.
Si se usa un modelo más barato, exigir explícitamente en el dispatch un paso
de verificación ("relee el fichero tras escribirlo y confirma byte a byte")
antes de aceptar un estado DONE. El controller debe verificar de forma
independiente — no solo confiar en el reporte — antes de dar una tarea por
completada.

### No dejes un subagente "esperando" sobre un worktree compartido mientras dispatchas otro

**Qué pasó:** un subagente se quedó esperando a que respondiera el daemon de
Docker. Para no bloquear el resto del incremento, se aparcó su trabajo con
`git stash push -u` y se dispatchó otra tarea sobre el árbol limpio. El
subagente aparcado, al reanudarse por su cuenta, no encontró sus ficheros y
ejecutó `git stash apply` — mientras la otra tarea seguía trabajando en el
mismo directorio. Concurrencia real sobre el mismo filesystem, justo lo que
hay que evitar entre implementadores.

**Cómo evitarlo:** si hay que liberar un worktree compartido, no basta con
"pedirle que espere" a un subagente — hay que detenerlo explícitamente
(mensaje de STOP, confirmar que no tomará más acciones) antes de tocar su
stash o dispatchar otra tarea sobre el mismo árbol. Si ocurre un incidente
así de todos modos, verificar manualmente fichero por fichero (duplicados,
choques de versión) antes de commitear, y pasar las tareas afectadas por
revisión independiente aunque ya se hayan verificado a mano.

---

## Disciplina TDD

### El ciclo Rojo-Verde-Refactor no se sigue solo porque el brief diga "TDD"

**Qué pasó:** en la única tarea de INC-00 con lógica real bajo TDD, el brief
solo incluía Rojo→Verde (test que falla → implementación mínima que lo pasa)
y se dio la tarea por cerrada ahí, sin plantearse si el código necesitaba
refactor. Al revisarlo a posteriori — porque el usuario preguntó
explícitamente si se estaba siguiendo el ciclo completo — el código resultó
estar ya limpio, pero eso no sustituye haberlo comprobado como parte del
proceso.

**Cómo evitarlo:** todo brief con TDD debe incluir un paso explícito de
Refactor tras el verde, pidiendo al implementador que revise duplicación,
nombres y complejidad y lo diga explícitamente en su reporte (qué revisó, qué
cambió, o por qué no hacía falta cambiar nada) — no darlo por hecho de forma
implícita.

---

## Entorno Windows

### `core.autocrlf` puede hacer fallar `pnpm format:check` sin que el código esté realmente mal

**Qué pasó:** `pnpm format:check` falló localmente en dos ficheros. La causa
no era el contenido commiteado (siempre fue LF correcto) sino que el checkout
local en Windows con `core.autocrlf=true` convierte a CRLF en disco, y
Prettier lo marca como "mal formateado" aunque lo que está en git sea
correcto.

**Cómo evitarlo:** el repositorio ya incluye [`.gitattributes`](../.gitattributes)
con `* text=auto eol=lf`, para que git normalice los finales de línea en el
checkout independientemente de la configuración local de cada máquina. Si
`format:check` falla en un fichero que nadie ha tocado, sospecha primero de
esto antes de asumir un error de contenido.

### Un daemon de Docker Desktop "arriba pero sin responder" puede necesitar un reinicio completo del proceso

**Qué pasó:** `docker info` / `docker compose` dejaron de responder pese a
que el proceso de Docker Desktop seguía en ejecución. Reiniciar solo la CLI
no sirvió; hizo falta matar el proceso completo (`Stop-Process -Force`) y
relanzar el ejecutable.

**Cómo evitarlo:** si `docker info` no responde en unos segundos, no asumas
que "ya arrancará" solo esperando — comprueba el proceso y, si lleva un rato
sin responder, reinícialo por completo en vez de esperar indefinidamente. No
bloquees el resto del trabajo por esto: aparca la verificación en caliente,
documenta explícitamente que queda pendiente, y sigue con tareas que no
dependan de ella.

---

## Herramientas de terceros vendorizadas

### Nunca dejes que un formateador toque código de terceros que no mantienes

**Qué pasó:** la primera ejecución de `pnpm format` reformateó ~65 ficheros
de la herramienta Impeccable vendorizada en `.claude/skills/impeccable/`
(ver [ADR-010](./decisions/ADR-010-herramientas-diseno-asistido.md)),
divergiendo la copia local del upstream sin ningún beneficio.

**Cómo evitarlo:** excluir explícitamente en `.prettierignore` (y en
`eslint.config.mjs`) cualquier directorio de código de terceros vendorizado,
igual que ya se hace con `.claude/`.

---

## Honestidad documental

### Un documento permanente no debe afirmar más de lo que está verificado

**Qué pasó:** el cierre de un incremento (INC-00) declaraba "Estado: ✅
Completado" sin matizar que uno de sus criterios de cierre (el workflow de
GitHub Actions pasando en verde) solo se había verificado por equivalencia
local — el workflow real no se dispara hasta abrir la Pull Request.

**Cómo evitarlo:** cuando un criterio de cierre depende de algo que solo
puede confirmarse fuera de la sesión actual (una ejecución real de CI, una
verificación manual del usuario), decláralo explícitamente como pendiente en
el propio documento permanente, no solo en el reporte interno de la tarea.

---

## Ejecución de tests y build en local

### Un `.next` obsoleto hace fallar `pnpm typecheck` con errores falsos

**Qué pasó:** durante INC-01, `pnpm typecheck` falló con cuatro errores
`TS2307: Cannot find module '../../app/page.js'` (y `layout.js`) — todos en
ficheros **generados** por Next dentro de `.next/types/validator.ts` y
`.next/dev/types/validator.ts`, no en el código fuente. `tsconfig.json` incluye
`.next/types/**/*.ts`, así que un `.next` de un build anterior con otro estado
contamina el chequeo de tipos con referencias obsoletas. En un checkout limpio
de CI no existe `.next`, así que allí no ocurre; es un artefacto **local**.

**Cómo evitarlo:** si `pnpm typecheck` falla solo en ficheros bajo `.next/`,
no busques el error en tu código: borra `.next` (o ejecuta `pnpm build`, que lo
regenera) y repite. Sospecha de esto antes de tocar nada del `src/`.

### Vitest escanea los worktrees de Claude Code (`.claude/worktrees/**`) si no se excluyen

**Qué pasó:** `pnpm test:run` (suite completa) falló con un error de Playwright
(`test() in a configuration file` / dos versiones de `@playwright/test`) que
provenía de un **worktree sobrante** de un incremento anterior en
`.claude/worktrees/feature+INC-00/e2e/smoke.spec.ts`, con su propio
`node_modules`. El `exclude` de Vitest tenía `e2e/**`, que no cubre esa ruta
anidada, y `.claude/**` no estaba excluido (ESLint sí lo ignora vía
`globalIgnores`, pero Vitest no heredaba esa exclusión). Los tests propios
pasaban; el único fallo era ruido del worktree.

**Cómo evitarlo:** `vitest.config.ts` excluye ahora `**/.claude/**` además de
`e2e/**`. Si aparece un fallo de tests en un fichero que no reconoces, comprueba
si vive bajo `.claude/worktrees/` antes de investigarlo como un fallo real.

### Los alias `@domain/*` (tsconfig paths) no resuelven desde `tests/` (solo dentro de `src/`)

**Qué pasó:** un test en `tests/corpus/__tests__/` que importaba
`@domain/verification/contract` falló con `Cannot find package
'@domain/verification/contract'`. Los alias de `tsconfig.json` (`@domain/*`,
`@adapters/*`, …) resuelven en Vitest para ficheros bajo `src/`, pero **no**
para ficheros bajo `tests/` (fuera de ese árbol). La configuración usa
`resolve: { tsconfigPaths: true }`, que no cubre este caso.

**Cómo evitarlo:** en tests situados **fuera de `src/`** (p. ej. el corpus de
`tests/`), importa el código de producción con **rutas relativas**
(`../../../src/domain/…`), no con alias. Alternativa pendiente si molesta:
añadir el resolver de paths de tsconfig de forma global a Vitest.

### Los filtros posicionales de Vitest son *substring*, no *regex*

**Qué pasó:** `pnpm test:run "contract|story"` no ejecutó nada
(`No test files found`). El filtro posicional de Vitest trata el argumento como
**subcadena** del path del fichero, no como expresión regular, así que `|` no
funciona como alternancia.

**Cómo evitarlo:** para ejecutar varios ficheros de test en una pasada, pasa
**varios argumentos** (`pnpm test:run contract story`), que Vitest combina como
OR. Para uno solo, usa el patrón más específico posible (el nombre del fichero).

---

## Disciplina de shell (agentes de IA)

### Un `cd` para inspeccionar deja el cwd del shell cambiado y rompe los comandos siguientes

**Qué pasó:** para inspeccionar un paquete se ejecutó `cd node_modules/silabajs`.
El directorio de trabajo del shell **persiste entre invocaciones**, así que los
comandos posteriores (`pnpm test:run …`) se ejecutaron desde `node_modules/silabajs`
y fallaron (`Command "test:run" not found`; Vitest arrancó en el directorio
equivocado y no encontró tests). El síntoma no apuntaba a la causa real (un cwd
heredado), lo que costó un par de intentos hasta darse cuenta.

**Cómo evitarlo:** no cambies el cwd del shell para tareas de inspección puntual;
usa rutas **absolutas** en el propio comando (`cat /ruta/absoluta/...`) o
herramientas de lectura que no dependan del cwd. Si necesitas un `cd`, vuelve a
la raíz del proyecto en el mismo comando o inmediatamente después, y ejecuta los
comandos de `pnpm`/tests siempre desde la raíz.
