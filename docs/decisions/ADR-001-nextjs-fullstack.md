# ADR-001 — Next.js full-stack para el MVP (núcleo desacoplado vía Clean Architecture)

- **Versión:** v1.2.0
- **Fecha:** 2026-08-26 (v1.1.0: 2026-08-21 · v1.0.0: 2026-07-06)
- **Estado:** Propuesta (pendiente de revisión y aceptación)
- **Decisores:** autor del TFM
- **Relacionado con:** NarrARA (principal) §3.5, §3.6; Consolidación §3.5, §5.6; ADR-002, ADR-004, ADR-005, ADR-007
- **Sustituye a:** ADR-001 v1.1.0 (reconciliación terminológica a Clean Architecture, ya aceptada el 2026-08-25). Esta versión conserva íntegro ese cambio y añade la decisión de mecanismo de entrada; ver §Cambios respecto a v1.1.0.

---

## Contexto

La documentación de NarrARA dejó abierta de forma explícita la decisión sobre el backend. En la Consolidación (§5.6) figura como decisión menor abierta: *"Backend NestJS vs Next.js solo"*, y en §3.5 NestJS aparecía como **preferencia "a consolidar en ADR"**, nunca como decisión firme.

Es necesario cerrar formalmente esta decisión antes de iniciar la implementación, ya que condiciona la estructura del repositorio, el número de proyectos a mantener y la estrategia de despliegue (un único despliegue vs. frontend + backend separados).

El marco del proyecto es un MVP-first a ritmo sostenible (~2-3 h/día), con **Clean Architecture** (Robert C. Martin) como marco arquitectónico rector (§3.6).

---

## Decisión

**Se adopta Next.js como framework full-stack para el MVP.**

El núcleo de la aplicación (Entities, Use Cases, puertos definidos por los casos de uso y sus adaptadores) se mantiene **independiente del framework**, conforme a la regla de dependencia de Clean Architecture. Next.js pertenece a la capa de **Frameworks & Drivers** y actúa exclusivamente como **mecanismo de entrega**: recibe la petición, invoca un adaptador de entrada y devuelve una representación, sin contener lógica de dominio ni de aplicación.

### Mecanismo de entrada

- **Server Actions** son el mecanismo principal para las **mutaciones** (crear cuento, crear perfil). Se ubican en `src/app/_actions/` y son cáscaras finas: obtienen el composition root, delegan en el controlador correspondiente de `src/adapters/inbound/controllers/` y devuelven un ViewModel.
- **Los Server Components** resuelven las **lecturas** invocando directamente al controlador en el servidor, sin pasar por una llamada HTTP explícita.
- **Los Route Handlers (`src/app/api/`) quedan reservados** para los casos que las Server Actions no cubren: streaming de respuestas, webhooks de terceros o cualquier necesidad futura de API consumible desde fuera de la aplicación. No son el camino por defecto.

En los tres casos, el punto de entrada es una cáscara del círculo 4 y la validación, el mapeo y la presentación viven en la capa de Interface Adapters.

---

## Justificación

- **Menor superficie para un MVP:** un único proyecto y un único despliegue (ADR-005), menos fontanería de integración y menos configuración de CI/CD. Coherente con el ritmo sostenible y el enfoque MVP-first.
- **Clean Architecture neutraliza el coste de la decisión:** con Entities, Use Cases y los puertos aislados del framework, el "backend real" (casos de uso, puertos de IA, verificación, moderación) es idéntico se monte sobre Next o sobre Nest. El mecanismo de entrega es un detalle del círculo externo.
- **Las Server Actions eliminan fontanería que no aporta a la tesis:** el único consumidor del backend es el propio frontend de la aplicación. Definir a mano un contrato HTTP (rutas, verbos, códigos de estado, serialización, `fetch` en cliente) es trabajo de integración sin valor para la contribución del TFM, que está en verificar, moderar y evaluar.
- **Reversibilidad:** si en el futuro se justifica NestJS (por DI de primera clase, modularidad explícita o escalado), se migra únicamente la cáscara de entrega sin tocar el núcleo. La decisión se pospone sin penalización, que es precisamente la garantía que ofrece la arquitectura elegida.
- **Compatibilidad con el resto del stack:** Next.js encaja con el despliegue de ADR-005 y no impone atadura sobre PostgreSQL + pgvector.

---

## Alternativas consideradas

### NestJS como backend separado
- **A favor:** inyección de dependencias de primera clase; estructura modular explícita; mayor valor narrativo ante el tribunal ("backend con arquitectura limpia separado").
- **En contra:** dos proyectos y dos despliegues; más CI; mayor superficie de mantenimiento para un MVP a ritmo sostenible.
- **Motivo del descarte (para el MVP):** el coste de setup y mantenimiento no se justifica cuando Clean Architecture ya aporta la separación limpia que NestJS facilitaría. Queda como camino de migración futura documentado. La renuncia a su contenedor de DI se resuelve en **ADR-004**.

### Route Handlers como mecanismo de entrada principal
- **A favor:** contrato HTTP explícito y visible, más fácil de documentar y de mostrar en la memoria; endpoints probables de forma aislada pasándoles un objeto `Request`; abre la puerta a consumidores externos sin trabajo adicional.
- **En contra:** obliga a escribir y mantener a mano rutas, verbos, códigos de estado, serialización y las llamadas `fetch` del cliente, para un único consumidor que es la propia aplicación.
- **Motivo del descarte:** el coste recae íntegramente en fontanería de integración. La visibilidad del contrato HTTP se recupera por otra vía: la capa de controladores de `src/adapters/inbound/` es explícita, documentable y probable con Vitest, con independencia de qué cáscara la invoque. Se mantienen disponibles para los casos citados en §Decisión.

---

## Consecuencias

**Positivas:**
- Setup y despliegue simplificados; un solo repositorio y un solo pipeline.
- El derecho a migrar a NestJS queda intacto gracias al desacoplamiento.
- Demuestra ante el tribunal una decisión de arquitectura evaluada con criterio, no adoptada por defecto.

**Negativas / riesgos:**
- **Riesgo de fuga de lógica hacia las Server Actions.** Al invocarse como funciones locales, la barrera psicológica para meter lógica dentro es menor que en un controlador HTTP. **Mitigación:** las acciones se limitan a obtener el composition root y delegar; la regla de dependencia por linter (INC-00-T06) bloquea que `src/app/` importe de `src/domain/` o `src/application/`.
- **Las Server Actions son endpoints públicos.** La opacidad de su identificador no constituye control de acceso: cualquier comprobación de autorización debe implementarse explícitamente dentro de la acción o del controlador. Debe quedar recogido en la spec de seguridad correspondiente.
- **Solo cruzan la frontera datos serializables.** Las entidades de dominio no pueden devolverse a un componente de cliente. Es coherente con el uso obligatorio de ViewModels que establece **ADR-007 §5, regla 4**, que pasa así a ser también una restricción técnica.
- **Menor testabilidad aislada de la cáscara de entrada** frente a un Route Handler. **Mitigación:** el desdoblamiento Server Action → Controller mantiene la lógica de entrada en TypeScript plano, probable con Vitest sin arrancar Next.js.
- Se renuncia (por ahora) a la DI de primera clase de Nest; se resuelve con composition root manual, según **ADR-004**.

---

## Cambios respecto a v1.1.0

La v1.1.0 reconcilió la terminología de hexagonal a Clean Architecture sin tocar la decisión de fondo. Esta v1.2.0 **conserva esa terminología intacta** y añade una única decisión sustantiva que la v1.1.0 no abordaba: el **mecanismo de entrada**.

1. **Mecanismo de entrada (nuevo).** Hasta la v1.1.0 el ADR establecía Route Handlers / API Routes como adaptador de entrada. Se sustituyen por **Server Actions** como mecanismo principal para mutaciones, **Server Components** para lecturas, y **Route Handlers reservados** para streaming, webhooks y consumidores externos. Se añade la alternativa descartada correspondiente (§Alternativas consideradas).
2. **Consecuencias.** El riesgo de fuga de lógica se reformula sobre Server Actions y se añaden tres riesgos específicos de ese mecanismo: endpoints públicos (la opacidad del identificador no es control de acceso), serialización (solo cruzan datos serializables → ViewModels obligatorios, coherente con ADR-007 §4 regla 4) y menor testabilidad aislada de la cáscara de entrada.
3. **Trazabilidad.** Referencias actualizadas a ADR-007 v1.1.0 y ADR-008.

> **Nota sobre la genealogía.** La v1.1.0 (Clean Architecture) fue aceptada el 2026-08-25. Esta v1.2.0 no la revierte ni la reescribe: solo añade el mecanismo de entrada, que quedó sin decidir en aquel momento.

---

## Notas de trazabilidad

- Requiere actualizar **NarrARA (principal) §3.5** y **Consolidación §3.5 y §5.6** para reflejar la decisión cerrada, con la terminología de Clean Architecture.
- Se relaciona con **ADR-002** (Genkit como framework del adaptador de IA), que asume esta decisión.
- Se relaciona con **ADR-004** (composition root manual), que resuelve la renuncia a la DI de NestJS.
- Se relaciona con **ADR-005** (despliegue), cuya justificación de un único despliegue se apoya en esta decisión.
- Se relaciona con **ADR-007** (estructura física de capas), que materializa en carpetas la separación aquí establecida.

---

## Cuestiones abiertas

- La plantilla canónica (`PLANTILLA-ADR.md`) no se ha aplicado literalmente en esta reedición, que conserva la estructura de secciones de la v1.0.0. Debe reconciliarse antes de la aceptación formal.
- Queda pendiente decidir si el desdoblamiento Server Action → Controller se mantiene tras la ejecución de INC-00, o si se colapsa por resultar un paso puramente delegante (compartida con ADR-007).
