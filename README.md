# NarrARA

> **Narrativa Accesible y Regulada por Adaptación**

Aplicación web de generación de cuentos mediante IA generativa, con foco en producir
narrativa **accesible** y **adaptada** a las necesidades de cada lector.

**Estado:** 🚧 En desarrollo · Trabajo Fin de Máster (Máster en Desarrollo de IA).

## Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS 4](https://tailwindcss.com)
- Gestor de paquetes: [pnpm](https://pnpm.io)

## Requisitos previos

- [Node.js](https://nodejs.org) 20 o superior
- [pnpm](https://pnpm.io/installation) 11 o superior

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

## Scripts

| Comando       | Descripción                         |
| ------------- | ----------------------------------- |
| `pnpm dev`    | Servidor de desarrollo              |
| `pnpm build`  | Build de producción                 |
| `pnpm start`  | Sirve el build de producción        |
| `pnpm lint`   | Análisis estático con ESLint        |

## Estructura del proyecto

```
app/                Código de la aplicación (Next.js App Router)
context/            Contexto del proyecto: modelo de datos, APIs y dominio
docs/decisions/     Registro de decisiones de arquitectura (ADR)
public/             Recursos estáticos
CLAUDE.md           Guía y reglas de gobernanza para el desarrollo
CONTRIBUTING.md     Convención de commits y flujo de trabajo
CHANGELOG.md        Historial de cambios
```

## Documentación

- [`CLAUDE.md`](./CLAUDE.md) — reglas de gobernanza (SemVer, changelog, ADR, context7).
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — convención de commits y flujo de trabajo.
- [`CHANGELOG.md`](./CHANGELOG.md) — historial de cambios.
- [`docs/decisions/`](./docs/decisions/README.md) — decisiones de arquitectura.
- [`context/`](./context/README.md) — modelo de datos, APIs y glosario de dominio.

## Convenciones

- Versionado: [Semantic Versioning](https://semver.org/lang/es/).
- Commits: [Conventional Commits](https://www.conventionalcommits.org/es/) (en inglés).
- Historial: [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).
- Accesibilidad conforme a [WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/).

## Licencia

Proyecto académico (TFM). Uso y distribución sujetos a las condiciones que determine su
autor.
