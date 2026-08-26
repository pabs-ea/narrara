# ADR-004 — Composition root manual como mecanismo de inyección de dependencias

- **Versión:** v1.0.0
- **Fecha:** 2026-08-21
- **Estado:** ✅ **Aceptada** · **Fecha de aceptación:** 2026-08-25
- **Decisores:** autor del TFM
- **Relacionado con:** NarrARA (principal) §6; Consolidación §3.5, §3.6; ADR-001; ADR-003; INC-00

> **Alcance de este ADR.** La decisión de **usar Next.js full-stack para el MVP y dejar NestJS como migración futura** pertenece a **ADR-001** y no se repite aquí. Este ADR resuelve únicamente la consecuencia técnica que ADR-001 dejó apuntada: *"se renuncia a la DI de primera clase de Nest; se resuelve con composición manual"*. Aquí se concreta **cómo**.

---

## Contexto

Clean Architecture exige que las capas internas (Entities, Use Cases) no conozcan a las externas. Un caso de uso que necesita persistir o llamar a un LLM no puede instanciar el adaptador concreto: eso sería una dependencia hacia fuera y rompería la regla de dependencia.

En NestJS este problema se resuelve con un contenedor de inyección de dependencias integrado. Al haber descartado NestJS para el MVP (ADR-001), el proyecto **no dispone de ese mecanismo** y debe resolver la inversión de dependencias de forma explícita.

Es además una cuestión con peso en la defensa: el tribunal puede preguntar cómo se garantiza el desacoplamiento sin un framework que lo imponga.

---

## Decisión

**Se adopta un composition root manual** como único punto de ensamblado de dependencias, ubicado en la capa de **Frameworks & Drivers**.

Reglas concretas:
- Los casos de uso **reciben sus dependencias por constructor**, tipadas contra las interfaces que ellos mismos definen.
- **Ningún módulo instancia adaptadores concretos** (`new GenkitLLMAdapter()`, `new InMemoryCuentoRepository()`) fuera del composition root.
- El composition root es el único lugar donde se decide qué implementación concreta se inyecta (real, fake o stub), lo que habilita el testing con dobles sin infraestructura.

No se adopta ningún contenedor de DI de terceros (InversifyJS, tsyringe u otros).

---

## Justificación

- **Demuestra comprensión del patrón, no dependencia de él:** ante el tribunal es más sólido explicar una inversión de dependencias resuelta explícitamente que delegarla en un framework que la oculta.
- **Coste cero en dependencias y ceremonia:** un contenedor de terceros añadiría decoradores, metadatos y curva de aprendizaje sin beneficio real en un monolito modular de este tamaño.
- **Facilita el testing con dobles:** al ser el composition root el único punto de decisión, sustituir adaptadores reales por fakes en tests de integración es inmediato — requisito directo de la estrategia TDD del proyecto.
- **Encaja con la persistencia diferida (ADR-003):** el cambio de adaptador in-memory a Postgres se reduce a una línea en el composition root.

---

## Alternativas consideradas

### Contenedor de DI de terceros (InversifyJS, tsyringe)
- **A favor:** resolución automática de dependencias; menos código de ensamblado a mano conforme crece el grafo.
- **En contra:** dependencia adicional, decoradores y metadatos reflectivos, curva de aprendizaje; sobredimensionado para el alcance del MVP.
- **Motivo del descarte:** añade ceremonia sin resolver un problema que el proyecto tenga realmente a esta escala.

### Instanciación directa en los casos de uso (sin inversión)
- **A favor:** el código más corto posible a corto plazo.
- **En contra:** rompe la regla de dependencia de Clean Architecture, acopla el núcleo a la infraestructura e imposibilita el testing sin dependencias reales. Invalidaría la tesis arquitectónica del TFM.
- **Motivo del descarte:** incompatible con el marco arquitectónico adoptado.

---

## Consecuencias

**Positivas:**
- Inversión de dependencias explícita y auditable en un único fichero.
- Sin dependencias externas para DI.
- Testing con dobles trivial; sustituir implementaciones es local al composition root.

**Negativas / riesgos:**
- **Exige disciplina:** sin un contenedor que lo imponga, nada impide técnicamente instanciar un adaptador donde no toca. **Mitigación:** la regla de dependencia por linter (INC-00-T06) bloquea los imports en sentido incorrecto, convirtiendo la disciplina en una comprobación automática.
- El ensamblado manual crece con el número de dependencias. Aceptable en el alcance del MVP; si creciera en exceso, sería una señal a favor de la migración a NestJS ya contemplada en ADR-001.

---

## Notas de trazabilidad

- Materializado en **INC-00-T08** (composition root + stub in-memory) y verificado por **INC-00-DoD09**.
- Consecuencia directa de **ADR-001** (renuncia a la DI de NestJS).
- Se apoya en **ADR-003** (el adaptador in-memory es el primer ensamblado real).
- Reflejado en **NarrARA (principal) §5, §6** y **Consolidación §3.5, §3.6**.
