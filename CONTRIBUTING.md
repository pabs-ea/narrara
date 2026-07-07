# Guía de contribución

Gracias por contribuir a **NarrARA**. Este documento define cómo escribir commits y
cuál es el flujo de trabajo para mantener el proyecto ordenado y trazable.

> Documentación en español; **código y mensajes de commit en inglés**.

## Convención de commits — Conventional Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/). Cada
mensaje sigue la estructura:

```
<type>(<scope opcional>): <descripción en imperativo>

<cuerpo opcional>

<footer opcional>
```

Ejemplos:

```
feat(stories): add story generation endpoint
fix(ui): correct focus order in the reader view
docs(changelog): document 0.2.0 changes
```

### Tipos permitidos

| Tipo       | Uso                                                              |
| ---------- | --------------------------------------------------------------- |
| `feat`     | Nueva funcionalidad                                             |
| `fix`      | Corrección de un error                                          |
| `docs`     | Solo documentación                                              |
| `style`    | Formato, sin cambios de lógica (espacios, comas, etc.)         |
| `refactor` | Cambio de código que no corrige un bug ni añade funcionalidad   |
| `perf`     | Mejora de rendimiento                                           |
| `test`     | Añadir o corregir tests                                         |
| `build`    | Cambios en el sistema de build o dependencias                  |
| `ci`       | Cambios en configuración de integración continua               |
| `chore`    | Tareas de mantenimiento sin impacto en `src`                   |

### Cambios incompatibles (breaking changes)

Indícalos con un `!` tras el tipo/scope **o** con un footer `BREAKING CHANGE:`.

```
feat(api)!: change story response schema

BREAKING CHANGE: `content` field renamed to `body`.
```

## Relación con SemVer

El tipo de commit determina el salto de [versión](https://semver.org/lang/es/) en
`package.json` (ver [`CLAUDE.md`](./CLAUDE.md)):

| Commit                         | Salto de versión           |
| ------------------------------ | -------------------------- |
| `fix:`                         | **PATCH** (`0.1.0`→`0.1.1`) |
| `feat:`                        | **MINOR** (`0.1.0`→`0.2.0`) |
| `!` / `BREAKING CHANGE:`       | **MAJOR** (`0.1.0`→`1.0.0`)* |
| `docs`, `style`, `refactor`, `test`, `chore`, `build`, `ci` | Sin salto (salvo criterio) |

> \* En fase pre-1.0.0, un cambio incompatible incrementa el **MINOR** (el MAJOR se
> mantiene en `0`).

## Flujo de trabajo por cambio

1. **Rama** a partir de `main`: `git checkout -b feat/nombre-corto`.
2. Implementa el cambio. Si introduces o actualizas una dependencia, verifica su versión
   con **MCP context7**.
3. **Actualiza `package.json`** (`version`) según SemVer.
4. **Añade la entrada en [`CHANGELOG.md`](./CHANGELOG.md)** bajo `## [No publicado]`.
5. Si es una decisión de arquitectura, **crea un [ADR](./docs/decisions/README.md)**.
6. Ejecuta `pnpm lint` y `pnpm build`.
7. **Commit** con Conventional Commits y abre la Pull Request.
