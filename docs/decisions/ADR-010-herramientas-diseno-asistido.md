# ADR-010 — Herramientas de diseño asistido por IA (UI UX Pro Max + Impeccable)

- **Versión:** v1.1.0
- **Fecha:** 2026-08-26 (v1.0.0: 2026-07-07, registrada como ADR-0002 en el esquema MADR previo)
- **Estado:** ✅ **Aceptada** · **Fecha de aceptación:** 2026-07-07
- **Decisores:** autor del TFM
- **Relacionado con:** ADR-009 (stack base); CLAUDE.md (accesibilidad, checklist WCAG)

> **Nota de reconciliación (v1.1.0).** Migración del antiguo **ADR-0002** (formato MADR, numeración `0002`) al esquema unificado `ADR-NNN`. El contenido no cambia de fondo.

---

## Contexto

La accesibilidad y la calidad visual son requisitos de primera clase en NarrARA (la «A» es «Accesible»). Al desarrollar la interfaz con una sola persona, conviene apoyarse en herramientas que aporten criterio de diseño (estilos, paletas, tipografías) y que detecten de forma temprana anti-patrones de UI y problemas de accesibilidad, **sin sustituir** la validación WCAG manual.

Hay que decidir qué herramientas de diseño asistido por IA integrar y cómo encajarlas en el repositorio respetando las reglas de gobernanza (versionado, CHANGELOG, secretos y configuración personal frente a compartida).

---

## Decisión

Se **combinan UI UX Pro Max e Impeccable**, con dos modos de instalación distintos según su naturaleza:

- **UI UX Pro Max** se instala como **plugin de Claude Code a nivel de usuario** (`~/.claude/plugins/`). Es asistencia para el desarrollador, no código del producto, por lo que **no se versiona en el repo**.
- **Impeccable** se instala **dentro del proyecto** (`.claude/skills/impeccable/`) porque su detector y su hook deben ser reproducibles para cualquiera que trabaje en el repo. El hook se declara en `.claude/settings.json` (compartido). La configuración personal (permisos) queda en `.claude/settings.local.json`, que se ignora en Git.

---

## Justificación

- **Guía de diseño coherente** (estilos/paletas/tipografías) alineada con el stack (Next.js, React, Tailwind, shadcn/ui).
- **Detección automática de anti-patrones de UI** tras cada edición, reforzando el objetivo de accesibilidad antes de la revisión manual.
- **Separación limpia** entre configuración compartida (hook, reproducible) y personal (permisos, ignorada en Git).
- Las dos cubren mitades complementarias —guía de diseño frente a detección automática— y se refuerzan sin conflicto.

---

## Alternativas consideradas

### No usar herramientas de diseño asistido
- **En contra:** desaprovecha ayuda de bajo coste para un requisito central del proyecto (accesibilidad).
- **Motivo del descarte:** el coste de adopción es bajo y el beneficio, directo sobre un requisito de primera clase.

### UI UX Pro Max o Impeccable en solitario
- **En contra:** cubren mitades complementarias (guía frente a detección).
- **Motivo del descarte:** usarlas juntas aporta más valor sin conflicto.

---

## Consecuencias

**Positivas:**
- Guía de diseño coherente alineada con el stack.
- Detección automática de anti-patrones de UI tras cada edición.
- Separación limpia entre configuración compartida (hook) y personal (permisos).

**Negativas / riesgos:**
- Impeccable declara `node >= 24`; el entorno usa Node 22. El detector se ha verificado funcional en Node 22, pero conviene vigilar incompatibilidades futuras.
- El generador de sistemas de diseño de UI UX Pro Max requiere **Python 3.x** (instalado Python 3.12).
- Se añaden ~96 ficheros de terceros al repo (Impeccable); aumenta la superficie a mantener.
- Estas herramientas **no sustituyen** la validación WCAG manual; son un apoyo.

---

## Notas de trazabilidad

- Migra el antiguo **ADR-0002** (`0002-herramientas-de-diseno-asistido.md`) al esquema unificado `ADR-NNN`.
- Se apoya en el stack base de **ADR-009**.
- Impeccable: <https://github.com/pbakaus/impeccable>
- UI UX Pro Max: <https://github.com/nextlevelbuilder/ui-ux-pro-max-skill>
