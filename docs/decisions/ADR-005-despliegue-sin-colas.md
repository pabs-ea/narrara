# ADR-005 — Despliegue híbrido (Docker en local/CI, Vercel en producción) y renuncia a colas en el MVP

- **Versión:** v1.0.0
- **Fecha:** 2026-08-21
- **Estado:** ✅ **Aceptada** · **Fecha de aceptación:** 2026-08-25
- **Decisores:** autor del TFM
- **Relacionado con:** NarrARA (principal) §5, §6, §17.2; Consolidación §3.5, §3.6; ADR-001; INC-00, INC-04, INC-07

---

## Contexto

La documentación arrastraba dos decisiones tomadas por separado que resultaron **mutuamente incompatibles**:

1. **Despliegue.** ADR-001 (v1.0.0) apuntaba a Vercel; el documento principal y el DoD de INC-00 exigen **Docker + Docker Compose** y reproducibilidad (RNF-13, HU-33).
2. **Procesamiento asíncrono.** El §6 presentaba las **colas (BullMQ)** como una de las dos decisiones arquitectónicas defendibles, justificada por la latencia de generar audio e imagen ("decenas de segundos").

**La incompatibilidad:** Vercel ejecuta funciones *serverless*, sin procesos de larga duración. Un worker de BullMQ requiere un proceso persistente y una instancia de Redis; ninguna de las dos cosas existe en ese modelo. Desplegar en Vercel **invalidaba técnicamente** la justificación del §6, dejando el documento defendiendo una arquitectura que el entorno de ejecución no podía sostener.

Restricciones que enmarcan la decisión: proyecto individual a tiempo parcial (~2-3 h/día), autor con experiencia casi nula en el ecosistema Node de servidor, y presupuesto limitado (RES-02). La contribución defendible del TFM es **verificar, moderar y evaluar**, no orquestar infraestructura asíncrona.

---

## Decisión

**1. Despliegue híbrido.**
- **Local y CI:** Docker + Docker Compose. Garantiza el entorno reproducible exigido por RNF-13 y HU-33, y es lo que verifica el DoD de INC-00.
- **Producción:** Vercel, aprovechando la integración nativa con Next.js y el despliegue de bajo mantenimiento.
- **Persistencia:** PostgreSQL + pgvector gestionado por un proveedor externo (a concretar en INC-05), no dentro de Vercel.

**2. Sin colas ni workers en el MVP.**
Se **retira BullMQ y el procesamiento asíncrono con colas del alcance del MVP**. La generación de audio se resuelve de forma **síncrona y bajo demanda por página**, no por cuento completo, manteniendo cada invocación dentro de los límites de ejecución de las funciones serverless. El frontend muestra progreso mediante *streaming* o *polling* ligero.

Las colas quedan documentadas como **línea futura**, implementables como incremento aislado sin tocar Entities ni Use Cases.

---

## Justificación

- **Elimina una contradicción real, no cosmética.** Defender en la memoria una arquitectura de colas sobre un entorno que no las soporta es una vulnerabilidad directa ante el tribunal. Es preferible una decisión menor bien justificada que una mayor insostenible.
- **Coherente con el criterio anti-*over-engineering* del propio proyecto.** El §6 establece que las decisiones arquitectónicas deben justificarse por el problema. Con audio generado por página bajo demanda, la latencia deja de ser un problema que exija colas: mantenerlas sería precisamente el over-engineering que el proyecto dice evitar.
- **Protege el tiempo del núcleo defendible.** Montar Redis, BullMQ, un worker persistente y su despliegue es trabajo que no toca el motor de verificación ni la moderación. Con 2-3 h/día y una curva de Node por delante, cada hora ahí es una hora que no va a la contribución del TFM.
- **Coste económico mínimo.** Evita el gasto recurrente de Redis gestionado y de un servicio de worker (RES-02).
- **Mantiene un único despliegue**, preservando intacta la justificación de **ADR-001** (que descartó NestJS precisamente para evitar dos proyectos y dos despliegues). La opción de worker externo habría debilitado ese argumento.
- **Reversible sin coste arquitectónico.** Si el tiempo lo permite, introducir colas es añadir un adaptador y un caso de uso; la regla de dependencia de Clean garantiza que el dominio no se entera.

---

## Alternativas consideradas

### Worker separado fuera de Vercel (Next en Vercel + worker en Railway/Render + Redis)
- **A favor:** conserva el §6 tal cual está; una arquitectura distribuida tiene valor narrativo.
- **En contra:** dos despliegues y dos pipelines de CI (contradice la justificación de ADR-001); coste recurrente de ~5-15 €/mes; BullMQ tiene particularidades con Redis serverless (conexiones persistentes); alto consumo de tiempo en un área que no aporta a la tesis.
- **Motivo del descarte:** el coste en tiempo y la contradicción con ADR-001 superan el beneficio narrativo.

### Todo autohospedado con Docker (VPS)
- **A favor:** máxima coherencia con el troncal tal como estaba escrito; refuerza RNF-13; un solo despliegue conceptual.
- **En contra:** trabajo de administración de sistemas (VPS, proxy inverso, TLS, backups, actualizaciones) que no suma nada a la tesis; riesgo de indisponibilidad el día de la defensa; coste recurrente.
- **Motivo del descarte:** desvía tiempo del núcleo y añade un riesgo operativo evitable.

---

## Consecuencias

**Positivas:**
- Documentación y entorno de ejecución dejan de contradecirse.
- Menos infraestructura, menos coste y menos superficie de fallo.
- Entorno reproducible garantizado en local y CI (RNF-13, HU-33) sin pagar el precio de autohospedar producción.
- Tiempo liberado hacia el motor de verificación y el guardarraíl de moderación.

**Negativas / riesgos:**
- **Se pierde una de las dos decisiones arquitectónicas destacadas del §6.** El proyecto pasa a apoyarse en una sola (interfaces de IA intercambiables) más la propia Clean Architecture. **Mitigación:** presentar en la memoria la renuncia como decisión evaluada, con este ADR como evidencia; la capacidad de decidir *no* construir algo es un criterio de ingeniería defendible.
- **Divergencia de runtime entre CI y producción:** los tests corren en contenedor y producción es serverless. **Mitigación:** los tests E2E de Playwright deben ejecutarse también contra el despliegue de *preview* de Vercel antes de promocionar a producción.
- **Límites de ejecución serverless:** si la generación por página superase el límite, habría que reconsiderar. **Mitigación:** medir la latencia real en INC-04 y, si se excede, activar la línea futura de colas.

---

## Notas de trazabilidad

- Requiere actualizar **NarrARA (principal) §5** (retirar BullMQ del stack activo), **§6** (sustituir la decisión de colas) y **§14** (apartado histórico, mención a workers).
- Requiere actualizar **Consolidación §3.5 y §3.6**.
- Afecta al alcance de **INC-04** (medición de latencia real) y **INC-07** (despliegue y observabilidad).
- Complementa **ADR-001**, cuya justificación de "un único despliegue" queda reforzada por esta decisión.
