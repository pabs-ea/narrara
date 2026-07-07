# 0001. Stack tecnológico base

- **Estado:** Aceptada
- **Fecha:** 2026-07-07
- **Decisores:** Pablo Esteban

## Contexto y problema

NarrARA es una aplicación web de generación de cuentos mediante IA generativa,
desarrollada como Trabajo Fin de Máster. Necesita una base tecnológica que permita:

- Construir una interfaz web accesible (la accesibilidad es un requisito central del
  proyecto: la "A" de NarrARA es "Accesible").
- Integrar llamadas a modelos de IA generativa desde el servidor sin exponer claves
  en el cliente.
- Iterar rápido con una sola persona desarrolladora y buen soporte de tipado.
- Tener una ruta de despliegue sencilla.

Esta decisión registra retroactivamente el stack ya elegido al inicializar el proyecto,
para dejar constancia de su justificación.

## Opciones consideradas

- **Next.js (App Router) + React + TypeScript + Tailwind CSS**, gestor de paquetes pnpm.
- SPA con Vite + React + un backend separado (Express/Fastify).
- Framework full-stack alternativo (Remix, SvelteKit, Astro).

## Decisión

Opción elegida: **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4, con
pnpm como gestor de paquetes**, porque unifica frontend y backend (Server Components y
Route Handlers) en un solo proyecto, permite mantener las claves de IA en el servidor,
ofrece tipado estático de extremo a extremo y un despliegue directo. Tailwind acelera la
construcción de una UI consistente y facilita atender criterios de accesibilidad.

## Consecuencias

### Positivas

- Un único proyecto para UI y lógica de servidor; menos superficie que mantener.
- Las claves de proveedores de IA nunca llegan al cliente (se usan en el servidor).
- TypeScript estricto reduce errores en tiempo de desarrollo.
- Ecosistema amplio y documentación abundante.

### Negativas / compromisos asumidos

- Acoplamiento al ecosistema Next.js/Vercel.
- Next.js 16, React 19 y Tailwind 4 son versiones recientes; hay que vigilar cambios de
  API y verificar versiones con **MCP context7** antes de introducir dependencias.
- La accesibilidad no viene "gratis": debe validarse explícitamente (WCAG).

## Alternativas descartadas

- **SPA + backend separado:** más piezas que coordinar y desplegar para un TFM de una
  sola persona; obliga a gestionar CORS y dos despliegues.
- **Remix / SvelteKit / Astro:** válidos, pero Next.js ofrece mayor familiaridad,
  comunidad y material de referencia, lo que reduce el riesgo del proyecto.

## Referencias

- Commit inicial `Creado proyecto NextJS base`.
- Plantilla: [`adr-template.md`](./adr-template.md).
