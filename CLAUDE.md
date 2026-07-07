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

```bash
pnpm install   # instalar dependencias
pnpm dev       # servidor de desarrollo (http://localhost:3000)
pnpm build     # build de producción
pnpm start     # servir el build
pnpm lint      # ESLint
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
**context7** (MCP) para obtener versiones y APIs actualizadas. No te fíes del
conocimiento previo del modelo: verifica siempre la versión y la API vigentes.

### 4. Decisiones — ADR

Toda decisión técnica relevante (arquitectura, elección de tecnología, cambios difíciles
de revertir) se registra como **ADR** en [`docs/decisions/`](./docs/decisions/README.md),
partiendo de [`adr-template.md`](./docs/decisions/adr-template.md).

## Convenciones

- **Idioma:** documentación, ADRs y CHANGELOG en **español**; código, identificadores y
  **mensajes de commit en inglés**.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/es/) (ver
  [`CONTRIBUTING.md`](./CONTRIBUTING.md)).
- **Accesibilidad:** valida los cambios de UI contra criterios
  [WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/) (semántica HTML, contraste,
  foco, `lang`, textos alternativos).
- **Secretos:** nunca commitees claves. Añade nuevas variables a
  [`.env.example`](./.env.example) con valores placeholder.

## Mapa del repositorio

```
app/                Código de la aplicación (Next.js App Router)
context/            Contexto del proyecto: modelo de datos, APIs, dominio
docs/decisions/     Registro de decisiones de arquitectura (ADR)
CHANGELOG.md        Historial de cambios (Keep a Changelog)
CONTRIBUTING.md     Convención de commits y flujo de trabajo
```

## Checklist antes de terminar un cambio

1. ¿Actualizada la `version` de `package.json` según SemVer?
2. ¿Añadida la entrada correspondiente en `CHANGELOG.md`?
3. ¿Verificadas las versiones de dependencias nuevas con context7?
4. ¿La decisión merece un ADR? Si sí, créalo.
5. ¿Actualizado el contexto (`context/`) si cambió el esquema o una API?
6. ¿Pasa `pnpm lint` y `pnpm build`?
