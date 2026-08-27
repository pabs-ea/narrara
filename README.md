# NarrARA

> **Narrativa Accesible y Regulada por Adaptación**

Aplicación web de generación de cuentos mediante IA generativa, con foco en producir
narrativa **accesible** y **adaptada** a las necesidades de cada lector.

**Estado:** 🚧 En desarrollo · Trabajo Fin de Máster (Máster en Desarrollo de IA).

## Stack

- [Next.js 16](https://nextjs.org) (App Router) · [React 19](https://react.dev) · TypeScript estricto
- [Tailwind CSS 4](https://tailwindcss.com)
- [Zod 4](https://zod.dev) — tipado y validación en las fronteras de confianza
- [Vitest 4](https://vitest.dev) (unitario/integración) · [Playwright](https://playwright.dev) (E2E)
- ESLint 9 + `eslint-plugin-boundaries` (regla de dependencia de Clean Architecture) + Prettier
- Docker + Docker Compose (local/CI) · GitHub Actions (CI)
- Gestor de paquetes: [pnpm](https://pnpm.io)

## Requisitos previos

- [Node.js](https://nodejs.org) 22
- [pnpm](https://pnpm.io/installation) 11 o superior
- [Docker](https://www.docker.com/) (opcional, para el entorno contenerizado)

## Puesta en marcha

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env.local   # y rellena los valores

# 3. Arrancar el servidor de desarrollo
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

### Con Docker

```bash
docker compose up --build
```

Levanta la app en `http://localhost:3000`. Verificado: la build multi-stage y el
arranque contenerizado sirven `200` en `/`.

## Scripts

| Comando               | Descripción                             |
| ---------------------- | ----------------------------------------- |
| `pnpm dev`             | Servidor de desarrollo                    |
| `pnpm build`           | Build de producción                       |
| `pnpm start`           | Sirve el build de producción              |
| `pnpm lint`            | Análisis estático con ESLint              |
| `pnpm typecheck`       | Comprobación de tipos (`tsc --noEmit`)    |
| `pnpm format`          | Formatea el código con Prettier           |
| `pnpm format:check`    | Verifica el formato sin escribir          |
| `pnpm test`            | Tests con Vitest (watch)                  |
| `pnpm test:run`        | Tests con Vitest (una pasada)             |
| `pnpm test:coverage`   | Tests con cobertura                       |
| `pnpm test:e2e`        | Tests E2E con Playwright                  |

## Arquitectura y estructura del proyecto

```
src/
├─ domain/           Círculo 1 · Entities — dominio puro, sin I/O
├─ application/       Círculo 2 · Use Cases — orquestador + puertos (ports/)
├─ adapters/          Círculo 3 · Interface Adapters — repos, IA, controladores
├─ composition/       Círculo 4 · composition root manual (ADR-004)
├─ app/               Círculo 4 · Next.js App Router
└─ ui/                Círculo 4 · componentes de presentación

context/            Contexto del proyecto: modelo de datos, APIs y dominio
docs/                Documentación del TFM — ver docs/README.md
docs/decisions/      Registro de decisiones de arquitectura (ADR)
```

Ver [`src/README.md`](./src/README.md) para la correspondencia círculo↔carpeta
completa y la regla de dependencia impuesta por linter.

## Documentación

- [`CLAUDE.md`](./CLAUDE.md) — reglas de gobernanza (SemVer, changelog, ADR, context7).
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — convención de commits y flujo de trabajo.
- [`CHANGELOG.md`](./CHANGELOG.md) — historial de cambios.
- [`docs/README.md`](./docs/README.md) — índice completo de la documentación del TFM.
- [`docs/decisions/`](./docs/decisions/README.md) — decisiones de arquitectura (ADR).
- [`context/`](./context/README.md) — modelo de datos, APIs y glosario de dominio.

## Convenciones

- Versionado: [Semantic Versioning](https://semver.org/lang/es/).
- Commits: [Conventional Commits](https://www.conventionalcommits.org/es/) (en inglés).
- Historial: [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).
- Accesibilidad conforme a [WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/) 2.2 AA.
- Identificadores de código en inglés; prosa y documentación en español.

## Licencia

Proyecto académico (TFM). Uso y distribución sujetos a las condiciones que determine su
autor.
