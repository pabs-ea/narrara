# CLAUDE.md

Guía para agentes de IA (Claude Code) y personas que trabajen en este repositorio.
Léela antes de hacer cambios.

## Visión del proyecto

**NarrARA** (*Narrativa Accesible y Regulada por Adaptación*) es una aplicación web de
generación de cuentos mediante IA generativa, desarrollada como Trabajo Fin de Máster.
Su eje es producir narrativa **accesible** y **adaptada** a cada lector. La
accesibilidad no es un extra: es un requisito de primera clase.

## Stack y comandos

- **Framework:** Next.js 16 (App Router) · **UI:** React 19 · **Estilos:** Tailwind CSS 4
- **Lenguaje:** TypeScript · **Gestor de paquetes:** pnpm
- **Tests:** Vitest 4 (pendiente de configurar)

```bash
pnpm install   # instalar dependencias
pnpm dev       # servidor de desarrollo (http://localhost:3000)
pnpm build     # build de producción
pnpm start     # servir el build
pnpm lint      # ESLint
pnpm test      # tests con Vitest (disponible al configurar el runner)
```

## Reglas obligatorias de gobernanza

Estas reglas se aplican **en cada cambio**. No son opcionales.

### 1. Versionado — SemVer en `package.json`

Ante cualquier cambio de lógica, estructura o código, **actualiza el campo `version`**
de `package.json` siguiendo [Semantic Versioning](https://semver.org/lang/es/)
(`MAJOR.MINOR.PATCH`):

- **PATCH** (`0.1.0` → `0.1.1`): correcciones que no cambian el comportamiento esperado (`fix`).
- **MINOR** (`0.1.0` → `0.2.0`): nueva funcionalidad retrocompatible (`feat`).
- **MAJOR** (`0.1.0` → `1.0.0`): cambios incompatibles.

> **Fase pre-1.0.0:** mientras estemos en `0.x`, el MAJOR permanece en `0` y los cambios
> incompatibles se reflejan incrementando el **MINOR** (lo permite SemVer en desarrollo inicial).

La correspondencia entre tipo de commit y salto de versión está en
[`CONTRIBUTING.md`](./CONTRIBUTING.md).

### 2. Historial — `CHANGELOG.md`

Documenta **todo** cambio en [`CHANGELOG.md`](./CHANGELOG.md), siguiendo estrictamente el
formato [Keep a Changelog 1.0.0 (es-ES)](https://keepachangelog.com/es-ES/1.0.0/).

- Añade las entradas bajo la sección **`## [No publicado]`** hasta que se publique una versión.
- Usa las secciones en español: **Añadido, Cambiado, Obsoleto, Eliminado, Corregido, Seguridad.**
- La versión en `package.json` y la última versión del `CHANGELOG.md` deben coincidir en cada release.

### 3. Versiones de tecnología — MCP context7

Antes de **introducir o actualizar** cualquier tecnología o dependencia, consulta
**context7** (MCP): resuelve el ID de la librería y verifica la versión y la API vigentes.
No te fíes del conocimiento previo del modelo. Al fijar una dependencia en `package.json`,
usa la versión confirmada por context7.

### 4. Decisiones — ADR

Toda decisión técnica relevante (arquitectura, elección de tecnología, cambios difíciles
de revertir) se registra como **ADR** en [`docs/decisions/`](./docs/decisions/README.md),
partiendo de [`adr-template.md`](./docs/decisions/adr-template.md).

### 5. Tipado y validación — Zod (obligatorio)

Para mantener la estabilidad del proyecto, **todo objeto de dominio y toda entrada/salida
de datos se modela con un esquema [Zod](https://zod.dev)** (`zod@^4`) como fuente única de
verdad; los tipos de TypeScript se **derivan** del esquema con `z.infer<>`, nunca se
declaran por duplicado a mano.

- **Esquema primero:** define el `z.object({...})` y exporta el tipo inferido
  (`export type Cuento = z.infer<typeof CuentoSchema>`).
- **Valida en los límites:** parsea con Zod **toda** frontera de confianza — cuerpos de las
  peticiones (Route Handlers / Server Actions), respuestas del proveedor de IA, variables
  de entorno y cualquier dato externo. Usa `safeParse` para gestionar errores de forma
  controlada.
- **No** uses `interface`/`type` sueltos para datos que cruzan una frontera ni el casteo
  `as` para forzar formas de datos sin validar: rompe la garantía de estabilidad.
- Los esquemas viven en un módulo de dominio reutilizable, no duplicados por feature.

## Convenciones de código

- **Idioma:** documentación, ADRs y CHANGELOG en **español**; código, identificadores y
  **mensajes de commit en inglés**.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/es/) (ver
  [`CONTRIBUTING.md`](./CONTRIBUTING.md)).
- **Server vs Client Components:** por defecto, Server Components. Añade `"use client"`
  solo cuando necesites interactividad, estado o APIs del navegador. Mantén los Client
  Components lo más pequeños posible (hojas del árbol).
- **Lógica de IA en el servidor:** las llamadas al proveedor de IA generativa se hacen
  **siempre en el servidor** (Route Handlers en `app/api/` o Server Actions), nunca desde
  el cliente. Así la clave del proveedor nunca llega al navegador.
- **Tipos:** TypeScript en modo estricto. Los tipos de dominio (p. ej. `Cuento`, `Perfil`)
  se **derivan de un esquema Zod** (ver regla obligatoria nº5), en un módulo reutilizable,
  nunca duplicados a mano.
- **Estilos:** Tailwind CSS mediante clases utilitarias; evita estilos en línea y CSS ad hoc.
- **Estructura:** el código de la app vive en `app/`; los endpoints internos en `app/api/`.

## Testing — Vitest

- **Runner:** [Vitest 4](https://vitest.dev). El framework de tests está decidido; su
  configuración (dependencias y script `pnpm test`) se añadirá verificando versiones con
  context7 y se registrará su detalle si procede.
- **Componentes:** prueba los componentes React con Testing Library sobre un entorno
  `jsdom` (o el *browser mode* de Vitest).
- **Ubicación:** ficheros `*.test.ts` / `*.test.tsx` junto al código que prueban, o en
  `__tests__/`.
- **Prioridad:** cubre con tests la lógica de generación/adaptación y la validación de
  entrada; incluye aserciones de accesibilidad (roles, nombres accesibles) donde aplique.

## Accesibilidad (requisito de primera clase)

Valida cada cambio de UI contra **[WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/)
nivel AA**. Checklist mínimo por cambio de interfaz:

- [ ] HTML **semántico** (`header`, `nav`, `main`, `button`, `label`…), no `div` para todo.
- [ ] Atributo `lang` correcto en el documento (la app es en español: `lang="es"`).
- [ ] **Contraste** de texto suficiente (AA: 4.5:1 normal, 3:1 texto grande).
- [ ] **Foco** visible y orden de tabulación lógico; todo lo interactivo es accesible por teclado.
- [ ] Imágenes con `alt` significativo (o `alt=""` si son decorativas).
- [ ] Formularios con `label` asociado y errores anunciados.
- [ ] No transmitir información **solo** por color.

## Seguridad y secretos

- **Nunca** commitees claves ni secretos. Añade toda variable nueva a
  [`.env.example`](./.env.example) con un valor placeholder.
- Las claves de servidor **no** llevan prefijo `NEXT_PUBLIC_` (ese prefijo expone el valor
  al navegador). Solo son públicas las variables realmente no sensibles.
- **Valida y sanea** la entrada del usuario que alimenta los prompts de IA.

## Mapa del repositorio

```
app/                Código de la aplicación (Next.js App Router)
app/api/            Endpoints internos (Route Handlers) y lógica de servidor/IA
context/            Contexto del proyecto: modelo de datos, APIs, dominio
docs/decisions/     Registro de decisiones de arquitectura (ADR)
.claude/            Configuración de Claude Code (skills, hooks, settings)
CHANGELOG.md        Historial de cambios (Keep a Changelog)
CONTRIBUTING.md     Convención de commits y flujo de trabajo
```

## Checklist antes de terminar un cambio

1. ¿Actualizada la `version` de `package.json` según SemVer?
2. ¿Añadida la entrada correspondiente en `CHANGELOG.md`?
3. ¿Verificadas las versiones de dependencias nuevas con context7?
4. ¿La decisión merece un ADR? Si sí, créalo.
5. ¿Los objetos de dominio y las fronteras de datos usan esquemas **Zod** con tipos
   derivados (regla nº5)?
6. ¿Actualizado el contexto (`context/`) si cambió el esquema o una API?
7. ¿Añadidos/actualizados los tests (Vitest) del código afectado?
8. ¿Revisada la accesibilidad (checklist WCAG) si tocaste UI?
9. ¿Pasa `pnpm lint` y `pnpm build`?
