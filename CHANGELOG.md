# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere al [Versionado Semántico](https://semver.org/lang/es/).

## [No publicado]

### Añadido

- Herramientas de diseño asistido por IA para el flujo de desarrollo (ver
  [ADR-0002](docs/decisions/0002-herramientas-de-diseno-asistido.md)):
  - **Impeccable** v3.2.0 integrado en el proyecto (`.claude/skills/impeccable/`): skills
    de diseño y detector de anti-patrones de UI. Incluye un hook `PostToolUse` compartido
    en `.claude/settings.json` que ejecuta el detector tras cada edición de UI.
  - **UI UX Pro Max** v2.6.2 adoptado como plugin de Claude Code a nivel de usuario (no
    versionado en el repo): bases de datos de estilos, paletas, tipografías y guías por
    stack.
- `.gitignore`: se ignora `.claude/settings.local.json` (configuración personal); el hook
  compartido se mantiene en `.claude/settings.json`.

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
