# ADR-009 — Stack tecnológico base (Next.js · React · TypeScript · Tailwind · pnpm)

- **Versión:** v1.1.0
- **Fecha:** 2026-08-26 (v1.0.0: 2026-07-07, registrada como ADR-0001 en el esquema MADR previo)
- **Estado:** ✅ **Aceptada** · **Fecha de aceptación:** 2026-07-07
- **Decisores:** autor del TFM
- **Relacionado con:** ADR-001 (Next.js full-stack y mecanismo de entrada); NarrARA (principal) §5; CLAUDE.md

> **Nota de reconciliación (v1.1.0).** Este ADR es la migración del antiguo **ADR-0001 «Stack tecnológico base»** (formato MADR, numeración `0001`) al esquema unificado `ADR-NNN` adoptado por el proyecto. Su contenido no cambia de fondo. La **elección de Next.js como framework full-stack frente a un backend separado (NestJS) y el mecanismo de entrada** (Server Actions / Server Components / Route Handlers) se decide en detalle y de forma autoritativa en **ADR-001**; este ADR registra el resto del stack base (React, TypeScript, Tailwind, pnpm) y la justificación original de arranque del proyecto.

---

## Contexto

NarrARA es una aplicación web de generación de cuentos mediante IA generativa, desarrollada como Trabajo Fin de Máster. Necesita una base tecnológica que permita:

- Construir una interfaz web **accesible** (la accesibilidad es un requisito central del proyecto: la «A» de NarrARA es «Accesible»).
- Integrar llamadas a modelos de IA generativa **desde el servidor**, sin exponer claves en el cliente.
- Iterar rápido con una sola persona desarrolladora y buen soporte de tipado.
- Tener una ruta de despliegue sencilla.

Esta decisión registra retroactivamente el stack ya elegido al inicializar el proyecto, para dejar constancia de su justificación.

---

## Decisión

Se adopta **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4, con pnpm como gestor de paquetes**.

- Unifica frontend y backend en un solo proyecto (la concreción del mecanismo de entrada se detalla en **ADR-001**).
- Permite mantener las claves de IA en el servidor.
- Ofrece tipado estático de extremo a extremo (TypeScript en modo estricto).
- Tailwind acelera la construcción de una UI consistente y facilita atender criterios de accesibilidad.

---

## Justificación

- **Menos superficie que mantener:** un único proyecto para UI y lógica de servidor, en coherencia con el enfoque MVP-first y el ritmo sostenible.
- **Seguridad de la clave del proveedor:** las llamadas a IA se ejecutan en el servidor; la clave nunca llega al navegador.
- **Fiabilidad en desarrollo:** TypeScript estricto reduce errores en tiempo de desarrollo.
- **Reducción de riesgo:** ecosistema amplio, comunidad grande y documentación abundante para una persona desarrolladora en solitario.

---

## Alternativas consideradas

### SPA con Vite + React + backend separado (Express/Fastify)
- **En contra:** más piezas que coordinar y desplegar para un TFM de una sola persona; obliga a gestionar CORS y dos despliegues.
- **Motivo del descarte:** coste de integración sin valor para la contribución del TFM.

### Framework full-stack alternativo (Remix, SvelteKit, Astro)
- **En contra:** válidos, pero Next.js ofrece mayor familiaridad, comunidad y material de referencia.
- **Motivo del descarte:** reduce el riesgo del proyecto elegir la opción con más soporte.

> La disyuntiva concreta **Next.js full-stack vs. NestJS separado** y la elección del mecanismo de entrada se tratan en **ADR-001**, que amplía y afina esta decisión.

---

## Consecuencias

**Positivas:**
- Un único proyecto para UI y lógica de servidor; menos superficie que mantener.
- Las claves de proveedores de IA nunca llegan al cliente.
- TypeScript estricto reduce errores en tiempo de desarrollo.
- Ecosistema amplio y documentación abundante.

**Negativas / riesgos:**
- Acoplamiento al ecosistema Next.js/Vercel.
- Next.js 16, React 19 y Tailwind 4 son versiones recientes; hay que vigilar cambios de API y **verificar versiones con MCP context7** antes de introducir dependencias.
- La accesibilidad no viene «gratis»: debe validarse explícitamente (WCAG 2.2 AA).

---

## Notas de trazabilidad

- Migra el antiguo **ADR-0001** (formato MADR, `0001-stack-tecnologico-base.md`) al esquema unificado `ADR-NNN`.
- La decisión de framework full-stack y mecanismo de entrada se detalla en **ADR-001**.
- Reflejado en **CLAUDE.md** (stack y comandos) y en el commit inicial `Creado proyecto NextJS base`.
