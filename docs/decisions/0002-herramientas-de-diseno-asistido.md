# 0002. Herramientas de diseño asistido por IA

- **Estado:** Aceptada
- **Fecha:** 2026-07-07
- **Decisores:** Pablo Esteban

## Contexto y problema

La accesibilidad y la calidad visual son requisitos de primera clase en NarrARA (la "A" es
"Accesible"). Al desarrollar la interfaz con una sola persona, conviene apoyarse en
herramientas que aporten criterio de diseño (estilos, paletas, tipografías) y que detecten
de forma temprana anti-patrones de UI y problemas de accesibilidad, sin sustituir la
validación WCAG manual.

Se necesita decidir qué herramientas de diseño asistido por IA integrar y cómo encajarlas
en el repositorio respetando las reglas de gobernanza (versionado, CHANGELOG, secretos y
configuración personal frente a compartida).

## Opciones consideradas

- **A — No usar herramientas de diseño asistido:** apoyarse solo en conocimiento propio y
  revisiones manuales WCAG.
- **B — UI UX Pro Max** (plugin de Claude Code): bases de datos de estilos, paletas,
  tipografías, gráficos y guías por stack (incluye Next.js, React, Tailwind, shadcn/ui).
- **C — Impeccable** (skill/CLI): skills de diseño y un detector de anti-patrones de UI y
  problemas de calidad/accesibilidad, con hook que se ejecuta tras cada edición.
- **D — Combinar B y C:** guía de diseño (B) más detección automática (C).

## Decisión

Opción elegida: **D — combinar UI UX Pro Max e Impeccable**, con dos modos de instalación
distintos según su naturaleza:

- **UI UX Pro Max** se instala como **plugin de Claude Code a nivel de usuario**
  (`~/.claude/plugins/`). Es asistencia para el desarrollador, no código del producto, por
  lo que **no se versiona en el repo**.
- **Impeccable** se instala **dentro del proyecto** (`.claude/skills/impeccable/`) porque
  su detector y su hook deben ser reproducibles para cualquiera que trabaje en el repo. El
  hook se declara en `.claude/settings.json` (compartido). La configuración personal
  (permisos) queda en `.claude/settings.local.json`, que se ignora en Git.

## Consecuencias

### Positivas

- Guía de diseño coherente (estilos/paletas/tipografías) alineada con el stack.
- Detección automática de anti-patrones de UI tras cada edición, reforzando el objetivo de
  accesibilidad antes de la revisión manual.
- Separación limpia entre configuración compartida (hook) y personal (permisos).

### Negativas / compromisos asumidos

- Impeccable declara `node >= 24`; el entorno usa Node 22. El detector se ha verificado
  funcional en Node 22, pero conviene vigilar incompatibilidades futuras.
- El generador de sistemas de diseño de UI UX Pro Max requiere **Python 3.x** (instalado
  Python 3.12).
- Se añaden ~96 ficheros de terceros al repo (Impeccable); aumenta la superficie a mantener.
- Estas herramientas **no sustituyen** la validación WCAG manual; son un apoyo.

## Alternativas descartadas

- **A (ninguna herramienta):** desaprovecha ayuda de bajo coste para un requisito central
  del proyecto (accesibilidad).
- **B o C en solitario:** cubren mitades complementarias (guía vs. detección); usarlas
  juntas da más valor sin conflicto.

## Referencias

- [[0001]] Stack tecnológico base.
- Impeccable: <https://github.com/pbakaus/impeccable>
- UI UX Pro Max: <https://github.com/nextlevelbuilder/ui-ux-pro-max-skill>
- Plantilla: [`adr-template.md`](./adr-template.md).
