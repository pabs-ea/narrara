# NarrARA — Generador de cuentos infantiles personalizados, seguros y verificables

> **Documento de definición del proyecto (Anteproyecto de TFM)**

---

## Control de versiones

| Versión | Fecha | Autor | Descripción del cambio |
|---------|------------|-------|------------------------|
| 1.0.0 | 2026-07-01 | — | Versión inicial. Planteamiento completo tras el pivote crítico: núcleo desplazado de la generación al motor de adaptación verificable y al guardarraíl de seguridad. Público acotado a familias con niños. Incorporada la motivación económica (acceso libre y barato a narrativa infantil). |
| 1.1.0 | 2026-07-01 | — | Añadidos los apartados de Stakeholders (§16) y Catálogo de Requisitos (§17): funcionales, no funcionales y restricciones. Consolidadas las decisiones de producto (solo audio en MVP, imagen como ampliación; cuento estructurado en páginas navegables; audio por página; interacción mínima supervisada del niño; educadores como ampliación con código preparado; auditoría interna) y las decisiones de generación (verificación de legibilidad/vocabulario sobre el cuento completo; longitud máxima por página con rebalanceo en cascada y creación de página nueva al final; moderación global final). |
| 1.2.0 | 2026-07-02 | — | Definido el alcance del MVP (§18) y añadido el apartado de Puntos Críticos Pendientes / deficiencias detectadas (§19) como backlog vivo. Consolidadas nuevas decisiones: moraleja generada por IA con verificación de coherencia (LLM-as-judge) en página propia y fuera del cómputo de longitud; corrección del flujo del pipeline (entrada de idea como paso 0 con sanitización/moderación del input); longitud y páginas configurables por perfil (Opción A) con presets corto/medio/largo; legibilidad automática por edad y ajustable; modelo de acceso freemium (guest sin persistencia ni audio, con cupo de 2 generaciones; registrado con pack completo); modo dislexia sobre texto y presentación. Decisión de posponer el refinamiento fino en favor de un enfoque MVP-first. |
| 1.3.0 | 2026-07-02 | — | Añadida la Especificación del Modo Dislexia (§20) basada en evidencia científica recopilada (British Dyslexia Association, estudios de eye-tracking y revisiones sobre fuentes DF). Hallazgo clave: OpenDyslexic no está respaldado por la evidencia; el enfoque se reorienta a presentación legible estándar + espaciado + ajustes de texto, con opciones configurables. Resuelve parcialmente el punto §19.1. Investigación disponible también como documento independiente reutilizable. |
| 1.4.0 | 2026-07-03 | — | Corregido el stack tecnológico (§5): se descarta Python/FastAPI; el proyecto se desarrolla en un stack **JavaScript/TypeScript completo** (Next.js + Node/TS, Vitest, Playwright). Añadido el apartado de Metodología de Desarrollo (§21): **TDD** (Test-Driven Development) como pilar y **SDD/BDD** (desarrollo guiado por especificación/comportamiento) apoyado en los criterios Gherkin de las historias de usuario. Registrada la decisión de plataforma (web app responsive, desktop como referencia). Confirmado el enfoque web responsive; audio/imagen como capacidades diferidas. |
| 1.5.0 | 2026-07-11 | — | Reconciliación de decisiones posteriores a v1.4.0. Cerrada la terminología metodológica: **SDD = Specification-Driven Development** (retirado BDD; el Gherkin de las SPEC-NN es el formato de criterios de aceptación dentro de SDD). Retirado el plazo rígido de 1 mes en RES-01 (proyecto a tiempo parcial, sin fecha rígida; alcance controlado por el Plan de Incrementos). Marcado el Roadmap de 4 semanas (§14) como histórico, sustituido por el Plan de Incrementos. Consolidada la decisión de backend (§5): **Next.js full-stack para el MVP, NestJS como migración futura** (ADR-004). Enlazadas las decisiones ADR-003 (persistencia diferida in-memory first) y ADR-004. Referenciados los artefactos INC-XX / SPEC-NN. **Adoptada Clean Architecture (Robert C. Martin) como marco arquitectónico rector** (capas Entities / Use Cases / Interface Adapters / Frameworks & Drivers); propagado el vocabulario hexagonal→Clean en todo el documento, conservando el diseño de fondo (los antiguos «puertos» pasan a interfaces definidas por Use Cases e implementadas por Interface Adapters). |
| 1.6.0 | 2026-08-21 | — | Resuelta la incompatibilidad entre despliegue y arquitectura asíncrona (**ADR-005**): despliegue híbrido (Docker + Compose en local/CI, Vercel en producción) y **retirada del procesamiento asíncrono con colas del alcance del MVP** (audio síncrono por página bajo demanda; colas como línea futura). Actualizados §5 (BullMQ fuera del stack activo), §6 (la decisión de colas pasa a renuncia justificada) y §8. Fijada la **convención de nomenclatura**: identificadores de código en inglés, lenguaje natural (prosa, Gherkin, historias de usuario) en español. |
| 1.7.0 | 2026-08-25 | — | **ADR-006 (coste mínimo y minimización de datos).** Endurecida **RES-02**: de "presupuesto limitado" a **coste operativo objetivo cero** (capas gratuitas de despliegue y BD, modelos de gama Flash/Flash-Lite, TTS por defecto en el navegador mediante Web Speech API, cupos máximos explícitos, CI sin llamadas reales). Establecida la regla de **minimización de datos**: al proveedor de IA solo viajan **parámetros derivados** (rango de edad, longitud, restricciones textuales), **nunca** el nombre, la edad exacta ni la etiqueta de modo dislexia del menor. La entrada de texto libre se gobierna por **transparencia**, no por filtrado. Cerrado el punto abierto del cupo del plan registrado (ningún plan es ilimitado). |

> **Convención de versionado (SemVer adaptado):**
> - **MAJOR** (X.0.0): cambio de enfoque, de público objetivo o de la tesis central del proyecto.
> - **MINOR** (0.X.0): añadir/quitar componentes, apartados o funcionalidades relevantes.
> - **PATCH** (0.0.X): correcciones, matices, reformulaciones o ajustes menores.

---

## 1. Nombre del proyecto

**NarrARA** (Narrativa Accesible y Regulada por Adaptación). Aplicación para que madres y padres creen y narren cuentos a medida de sus hijos, con control automático de adecuación y seguridad del contenido.

---

## 2. Problema

Contar cuentos a los hijos es una de las prácticas con mayor impacto demostrado en el desarrollo del lenguaje y el vínculo afectivo, pero choca con dos barreras reales:

- **Económica.** Los libros infantiles se han encarecido de forma notable en los últimos años. Una familia que quiera renovar el repertorio con cierta frecuencia se enfrenta a un gasto recurrente nada despreciable, y las bibliotecas no siempre cubren la demanda ni los intereses concretos de cada niño.
- **De adecuación.** El cuento comprado rara vez encaja con el nivel lector, los intereses (dinosaurios, una mascota concreta, un miedo que se quiere trabajar) o la situación emocional puntual del niño esa noche.

**¿Quién lo sufre?** Familias con niños de entre 3 y 10 años, especialmente las de renta ajustada, y de rebote los propios niños, que pierden acceso a variedad de estímulos narrativos.

**¿Por qué merece la pena?** Democratiza el acceso a narrativa infantil ilimitada y personalizada a coste marginal casi nulo, y lo hace en el ámbito más sensible posible —contenido consumido por menores—, lo que convierte la **seguridad y adecuación del contenido en el verdadero reto técnico**, no la generación en sí.

---

## 3. Solución propuesta

Una aplicación donde el adulto define un perfil del niño (edad, nivel lector, intereses, temas a evitar) y solicita un cuento con una idea breve ("un cuento sobre superar el miedo a la oscuridad, con una zorra valiente"). El sistema **no se limita a generar**: ejecuta un pipeline que genera, **verifica automáticamente que el resultado cumple restricciones duras** (legibilidad, longitud, vocabulario, seguridad) y, si no las cumple, **re-genera o post-edita** hasta lograrlo. El cuento resultante se puede leer, escuchar narrado por voz e ilustrar por escenas.

**Cómo interviene la IA — y aquí está el núcleo del proyecto:** la IA no es solo el LLM que escribe. El aporte técnico es un **motor de adaptación y control de calidad con restricciones verificables** y un **guardarraíl de seguridad de contenido de primera clase**, ambos evaluados con métricas objetivas. La generación es la parte fácil y "comprada"; el valor está en garantizar que lo generado es apropiado, medirlo y demostrarlo.

---

## 4. Usuarios

Madres, padres y cuidadores como usuarios principales (son ellos quienes operan la app y validan el contenido); los niños como destinatarios del cuento, nunca como operadores directos. Secundariamente, educadores de infantil.

---

## 5. Tecnologías recomendadas

> **Stack JavaScript/TypeScript de extremo a extremo.** Se descarta Python; todo el proyecto (frontend y backend) se desarrolla en TypeScript para unificar lenguaje, tooling y modelos compartidos.

- **Frontend:** **Next.js** (React) con TypeScript, con foco en accesibilidad (WCAG), diseño responsive (desktop como referencia) y modo lectura nocturna de bajo estímulo.
- **Backend:** **Node.js con TypeScript**, mediante **Next.js full-stack** (App Router) para el MVP (ver **ADR-004**). La lógica de negocio reside en la capa de **Use Cases** (Clean Architecture) tras las interfaces de servicio —nunca en Server Actions ni route handlers—, y la inversión de dependencias se resuelve con un **composition root manual** (DI sin framework). **NestJS** queda documentado como **ruta de migración futura** por escalabilidad o funcionalidad, viable sin reescribir el dominio gracias a la arquitectura limpia.
- **Base de datos:** PostgreSQL + extensión **pgvector** (cuentas, perfiles, cuentos, historial, embeddings). Ver §19.4: para el MVP se evalúa **una sola BD (Postgres)** para minimizar fricción; Redis queda como optimización futura para estado efímero/rate limiting si el rendimiento lo justifica.
- **Testing:** **Vitest** (unitario e integración) y **Playwright** (E2E). Pilar del proyecto por el uso de TDD (ver §21).
- **Cola / async:** **fuera del alcance del MVP** (ADR-005). El audio se genera de forma **síncrona y bajo demanda por página**. Una solución de colas en Node (p.ej. BullMQ) queda como **línea futura**, implementable como incremento aislado sin tocar el dominio.
- **Infraestructura:** Docker + Docker Compose; despliegue en un PaaS o VPS; **GitHub Actions** para CI/CD.
- **IA (todo vía API preentrenada, sin fine-tuning):** LLM para generación y post-edición, **acotado a modelos de gama Flash/Flash-Lite del nivel gratuito** (nunca gama Pro, por cupo diario); **TTS por defecto mediante la Web Speech API del navegador** (coste cero y segundo adaptador que cubre RNF-08), con TTS en la nube como adaptador alternativo; (ampliación) API de generación de imagen; clasificador/servicio de moderación de contenido. Integrados tras **interfaces de servicio definidas en la capa de Use Cases** (Clean Architecture) e implementadas por adaptadores en Interface Adapters, mediante SDKs de Node.
- **Librerías de PLN (en JS/TS):** cálculo de índices de legibilidad en español (p.ej. Fernández-Huerta / INFLESZ), tokenización y cruce contra listas de frecuencia léxica del español.
- **Observabilidad:** logging estructurado, métricas y trazas del pipeline de generación.

---

## 6. Arquitectura

**Modular Monolith con Clean Architecture (Robert C. Martin).** Se descarta explícitamente microservicios y event-driven a gran escala por no estar justificados en el dominio (evita el over-engineering que un tribunal penalizaría).

> **Nota de trazabilidad.** El diseño partió de un enfoque **hexagonal (Ports & Adapters)** y se ha consolidado bajo **Clean Architecture**, marco más prescriptivo que encaja mejor con la orquestación del pipeline por casos de uso. Ambos comparten el núcleo (regla de dependencia hacia dentro, dominio agnóstico a la infraestructura); los antiguos «puertos» pasan a ser **interfaces definidas por la capa de Use Cases** e implementadas por Interface Adapters.

**Capas (regla de dependencia: el código fuente solo apunta hacia dentro):**

| Capa (Clean) | Contenido en NarrARA |
|--------------|----------------------|
| **Entities** | Dominio puro: `Cuento`, `Página`, `Perfil`, `Veredicto`; motor de verificación y rebalanceo como servicios de dominio. TS puro, sin I/O. |
| **Use Cases** | Orquestador del pipeline (generar→verificar→moraleja→moderar) y casos de uso; define las interfaces de servicio que necesita. |
| **Interface Adapters** | Implementaciones de esas interfaces: adaptadores de repositorio y de IA, controladores, presenters. |
| **Frameworks & Drivers** | Next.js, Postgres/pgvector (futuro), APIs externas (LLM, TTS). El borde. |

Dos decisiones arquitectónicas **justificadas por el problema, no por lucimiento**:

- **Interfaces de IA intercambiables:** cada proveedor (LLM, TTS, imagen, moderación) está detrás de una interfaz de servicio definida en Use Cases. Se demuestra la intercambiabilidad implementando **al menos dos adaptadores para una interfaz** (p.ej. un LLM vía API y una alternativa local/otro proveedor), probando que el dominio no depende del proveedor. Esto justifica la arquitectura de verdad.
- **Renuncia justificada al procesamiento asíncrono con colas (ADR-005):** se evaluó introducir colas (BullMQ) por la latencia de generar audio e imagen, y **se descartó para el MVP**. Generando el audio **por página y bajo demanda**, la latencia deja de exigir infraestructura asíncrona; mantenerla sería el *over-engineering* que este mismo apartado rechaza. Además, el entorno de producción elegido (serverless) no soporta workers persistentes. Las colas quedan como **línea futura**, añadibles como incremento aislado sin tocar Entities ni Use Cases — lo que demuestra en la práctica el valor de la regla de dependencia.

**Decisiones arquitectónicas recientes formalizadas en ADR:**

- **ADR-003 (persistencia diferida, in-memory first):** la persistencia real se difiere tras una interfaz de repositorio; el dominio se valida primero contra un adaptador in-memory, con interfaces **asíncronas desde el día uno** para no acoplar el dominio a acceso síncrono.
- **ADR-004 (Next.js full-stack para el MVP):** capa de entrega con Next.js sin framework de backend; inversión de dependencias mediante composition root manual; NestJS como migración futura.
- **ADR-006 (coste mínimo y minimización de datos):** coste operativo objetivo cero (capas gratuitas, gama Flash, TTS en navegador); y **al proveedor de IA solo viajan parámetros derivados, nunca atributos del perfil del menor** (ni nombre, ni edad exacta, ni la etiqueta de modo dislexia).
- **ADR-005 (despliegue híbrido y sin colas en el MVP):** Docker + Compose en local y CI (RNF-13, HU-33); Vercel en producción; procesamiento asíncrono con colas retirado del alcance del MVP y documentado como línea futura.

---

## 7. Componentes de IA

- **LLM (generación y post-edición).** Genera el borrador y, cuando un verificador falla, **reescribe** para cumplir la restricción incumplida. Vía API. Sin fine-tuning; el control se logra por prompting estructurado + verificación externa.
- **Motor de verificación de restricciones (núcleo original, lógica propia).** No es un modelo comprado: es código propio que evalúa el cuento contra restricciones duras — índice de legibilidad dentro de rango para la edad, longitud de frase media, porcentaje de palabras fuera de la lista de frecuencia permitida, longitud total. Devuelve un veredicto y, en fallo, dispara la re-generación. **Aquí está buena parte de la contribución del proyecto.**
- **Guardarraíl de seguridad de contenido (componente de primera clase).** Pipeline de moderación en capas: clasificador de toxicidad/adecuación + reglas (lista negra temática por edad) + un LLM-as-judge que evalúa adecuación infantil. Con su **propio set de evaluación** construido a medida con casos límite, reportando precisión y recall.
- **TTS.** Narración por voz. Por defecto en el navegador (Web Speech API); adaptador de nube alternativo (ADR-006).
- **Generación de imagen.** Ilustración por escena. Vía API. Consistencia de personaje: en el MVP, **estilo consistente vía prompt canónico + seed fija**, asumiendo y documentando su limitación; IP-Adapter queda como ampliación.
- **Embeddings + pgvector.** Para deduplicar cuentos, recuperar los similares del historial y evitar repetir tramas.
- **RAG (ligero, opcional).** Sobre una pequeña base de "plantillas narrativas" pedagógicas para guiar la estructura del cuento.
- **Multimodal:** sí, texto + imagen + audio.
- **Agentes:** no se necesitan; el bucle generar-verificar-corregir es un flujo controlado, más robusto y explicable que un agente autónomo.

---

## 8. Complejidad

- **Dificultad técnica: 4/5.** El bucle de generación-verificación-corrección, la orquestación multimodal asíncrona y el pipeline de moderación con evaluación son técnicamente exigentes; la generación pura no.
- **Cantidad de desarrollo: 4/5.** Backend en capas (Clean Architecture), verificadores, moderación, frontend accesible, evaluación.
- **Riesgo del proyecto: 2/5 (controlado).** Al no depender de fine-tuning ni datasets grandes, y al usar APIs preentrenadas detrás de interfaces de servicio con mocks, el riesgo de no entregar es bajo. El principal riesgo es de *alcance*, mitigado priorizando el núcleo (verificación + moderación) sobre lo accesorio (imagen).

---

## 9. Retos técnicos

Diseñar restricciones de legibilidad válidas para español infantil y calibrarlas por edad; conseguir que el bucle de corrección converja sin quedar en reintentos infinitos (límite de reintentos + degradación elegante); construir un set de evaluación de moderación con casos límite realistas; gestionar latencia y coste de las generaciones multimedia; mantener el dominio limpio y agnóstico al proveedor de IA.

---

## 10. Aspectos de Ingeniería del Software

- **Arquitectura y patrones:** Clean Architecture (regla de dependencia demostrada por linter + doble adaptador en una interfaz de servicio), Strategy/Adapter para proveedores de IA, patrón pipeline para verificación y moderación, Repository para persistencia.
- **Testing:** unitarios del dominio y de los verificadores (aquí el testing es natural y abundante: cada restricción es testeable); integración con adaptadores de IA *mockeados*; E2E del flujo "crear perfil → generar → verificar → narrar"; y **tests de evaluación** del guardarraíl de moderación como parte de la suite.
- **Seguridad, auth y autorización:** autenticación de cuentas familiares, autorización por roles (adulto único operador; perfiles de niño como datos, no como usuarios), protección de datos de menores (minimización, RGPD, sin exponer PII a terceros más de lo imprescindible).
- **Auditoría y logging:** registro trazable de cada generación, veredicto de verificación y decisión de moderación (fundamental para un producto de contenido infantil: poder auditar *por qué* se aprobó o rechazó un cuento).
- **Monitorización:** métricas de tasa de aprobación al primer intento, reintentos medios, latencia y coste por cuento.
- **CI/CD, Docker, despliegue:** pipeline con lint + tests + build de imagen; contenerización completa; despliegue reproducible.
- **Calidad y mantenibilidad:** cobertura, análisis estático, ADRs documentando por qué Clean Architecture y por qué async (blindaje anti-*over-engineering* ante el tribunal).

---

## 11. Posibles ampliaciones

Consistencia de personajes real con IP-Adapter/LoRA; export a EPUB y audiolibro; modo colaborativo padre-hijo donde el niño elige el rumbo; series de cuentos con personajes recurrentes; voces personalizadas (la del propio padre/madre); modo offline con modelo local; panel para educadores; y —solo como línea futura, no como promesa del TFM— extensión validada a otros públicos como mayores.

---

## 12. Originalidad

**8/10.** Un generador de cuentos por prompt es común (2-3/10), pero el desplazamiento del centro de gravedad hacia **restricciones verificables + guardarraíl de seguridad evaluado + adaptación medible**, sumado a una motivación social clara (acceso económico a narrativa infantil), lo separa netamente del wrapper de LLM típico. La originalidad no está en generar cuentos, sino en **garantizar y demostrar que son apropiados**, que es justo lo difícil.

---

## 13. Plan de evaluación

Este apartado convierte promesas en datos y constituye el capítulo de resultados de la memoria:

- **Evaluación del motor de adaptación:** sobre un conjunto de N cuentos generados por franja de edad, reportar qué porcentaje cumple los rangos de legibilidad/longitud objetivo al primer intento y tras el bucle de corrección. Métrica objetiva, gráfica clara.
- **Evaluación del guardarraíl de moderación:** set de prueba propio con casos seguros y casos límite (violencia velada, miedos, temas sensibles), reportando precisión, recall y falsos negativos (los críticos en contenido infantil).
- **Evaluación de usabilidad/accesibilidad:** auditoría WCAG del frontend + prueba con un pequeño número de familias o expertos, reportada estructuradamente.
- **Análisis de coste:** coste medio real (€) y latencia por cuento generado, y discusión de la viabilidad económica frente al precio de un libro —cerrando el círculo con la motivación económica del proyecto.

---

## 14. Roadmap de 4 semanas

> **⚠️ Apartado histórico (sustituido).** Esta planificación por semanas se conserva por su lógica de priorización (núcleo defendible primero) y la «regla de supervivencia», pero **queda sustituida como herramienta de planificación por el Plan de Incrementos** (documento independiente `NarrARA_Plan_Incrementos`). El proyecto ya **no se planifica por calendario de semanas**, sino por incrementos de valor (INC-00, INC-01…) a ritmo sostenible. Las referencias a «semana 1/2/3/4» deben leerse como *orden lógico de fases*, no como plazos. Correspondencia orientativa: Semana 1 → INC-00; Semana 2 → INC-01 + INC-02; Semana 3 → INC-03 + INC-04; Semana 4 → INC-05 + INC-06 + INC-07.

- **Semana 1 — Cimientos.** Diseño y ADRs (justificar Clean Architecture y async), esqueleto en capas (Clean), modelo de dominio (Perfil, Cuento, Restricción, VeredictoModeración), PostgreSQL+pgvector, Docker Compose, CI básico, auth de cuentas familiares. Definición de todas las interfaces de servicio de IA con **adaptadores mock**.
- **Semana 2 — Núcleo sin IA real.** Motor de verificación de restricciones (legibilidad, longitud, vocabulario) completamente testeado contra los mocks. CRUD de perfiles y cuentos. Bucle generar-verificar-corregir funcionando con adaptadores falsos. Aquí se acumula el grueso de tests unitarios.
- **Semana 3 — IA real y multimedia.** Enchufar adaptadores reales (LLM, TTS, imagen, moderación) detrás de las interfaces de servicio ya probadas. Workers y colas para imagen/audio. Guardarraíl de moderación completo. Observabilidad (logging estructurado + métricas). Segundo adaptador para una interfaz (demostrar intercambiabilidad).
- **Semana 4 — Cierre y evidencia.** Tests de integración y E2E, hardening de seguridad y RGPD, despliegue, **ejecución del plan de evaluación y redacción del capítulo de resultados**, documentación y memoria.

**Regla de supervivencia:** el núcleo defendible (verificación + moderación) está listo y testeado en semana 2 con mocks; si en semana 3 falla un proveedor de IA, el corazón del TFM ya está hecho y evaluado. La generación multimedia es lo primero que se sacrifica si aprieta el calendario, sin comprometer la tesis del proyecto.

---

## 15. Tesis del proyecto (frase de defensa)

> NarrARA no es "una app que llama a un LLM para hacer cuentos". Es **un sistema de generación de contenido infantil con restricciones verificables y guardarraíles de seguridad evaluados**, construido sobre arquitectura limpia, que democratiza el acceso económico a la narrativa infantil.

---

## 16. Stakeholders

### 16.1. Stakeholders directos (usan u operan el sistema)

- **Adulto responsable (madre / padre / cuidador).** Usuario operador principal. Crea y gestiona perfiles, solicita cuentos, los revisa y los pone a disposición del niño. Es quien valida el contenido antes de que llegue al menor. Toda acción con efecto (generar, borrar, editar) recae en él.
- **Niño (3-10 años).** Destinatario del contenido, **no operador**. Consume el cuento en un modo simplificado y supervisado (escucha la narración, pasa página). No tiene cuenta propia, no introduce texto y no puede ejecutar acciones destructivas. Es un stakeholder pasivo, pero el más importante en términos de seguridad y adecuación.
- **Educador de infantil** *(ampliación futura, no MVP).* Podría generar material para el aula con perfiles de grupo. No se implementa en el MVP, pero el modelo de roles y propiedad de perfiles se diseña para admitirlo sin reescritura.

### 16.2. Stakeholders indirectos (no operan el sistema pero influyen o se ven afectados)

- **Autor del TFM / desarrollador.** Responsable del diseño, implementación y evaluación.
- **Tribunal y director del TFM.** Sus criterios (rigor técnico, evaluación con métricas, ausencia de over-engineering, calidad de ingeniería) constituyen requisitos de facto del proyecto.
- **Proveedores de IA** (LLM, TTS, y en ampliación imagen y moderación). Dependencia externa que impone restricciones de coste, latencia, disponibilidad, límites de rate y términos de uso.
- **Marco regulador y ético.** RGPD y protección del menor. No es una persona, pero impone requisitos no negociables sobre datos y contenido.

---

## 17. Catálogo de Requisitos

> Estado del catálogo: **borrador consolidado** sobre las decisiones de producto y de generación tomadas. Sujeto a refinamiento en versiones posteriores.

### 17.1. Requisitos funcionales (RF)

**Gestión de cuentas y perfiles**

- **RF-01.** El adulto puede registrarse y autenticarse.
- **RF-02.** El adulto puede crear, editar y eliminar perfiles de niño (alias, edad, nivel lector, intereses, temas a evitar).
- **RF-03.** Un adulto puede gestionar varios perfiles de niño bajo una misma cuenta.

**Generación de cuentos (núcleo)**

- **RF-04.** El adulto puede solicitar un cuento indicando una idea breve y seleccionando un perfil.
- **RF-05.** El sistema genera el cuento aplicando las restricciones del perfil (vocabulario, longitud, legibilidad).
- **RF-05b.** El sistema estructura el cuento en **páginas/secciones navegables**.
- **RF-06.** El sistema verifica automáticamente que el cuento cumple las restricciones duras: **legibilidad y vocabulario se verifican sobre el cuento completo**; **la longitud máxima se controla por página**. Si no se cumplen, re-genera o post-edita hasta un límite de reintentos.
- **RF-06b.** Cuando una página excede la longitud máxima, el sistema **calcula el exceso y lo reubica en cascada hacia la página siguiente**, cortando siempre por límites naturales (frase completa, nunca a mitad de palabra o frase). Si el exceso llega a la última página y esta también se pasa, **se crea una página nueva al final** (sin límite rígido de páginas).
- **RF-07.** El sistema somete el **cuento completo** al guardarraíl de moderación **en una única pasada final**, antes de mostrarlo.
- **RF-08.** Si tras los reintentos no se cumple alguna restricción o la moderación falla, el sistema informa al adulto en lugar de entregar contenido dudoso (degradación elegante).

**Multimedia (audio en MVP; imagen como ampliación)**

- **RF-09.** El sistema genera narración por voz **por página** (un audio por página), de forma automática junto al cuento. El audio se genera **después del rebalanceo de páginas**, para que cada audio corresponda exactamente al texto final de su página.
- **RF-10.** *(Ampliación futura)* El sistema puede ilustrar el cuento por escenas, una imagen por página.

**Navegación y consumo**

- **RF-15.** El adulto puede navegar el cuento página a página (anterior/siguiente), con el texto y su audio correspondiente.
- **RF-16.** Existe un **modo de consumo simplificado y supervisado** para el niño, con controles grandes (play/pausa, pasar página), sin acciones destructivas ni entrada de texto accesibles al menor.

**Biblioteca e historial**

- **RF-11.** El adulto puede consultar, releer y borrar cuentos guardados.
- **RF-12.** El sistema evita duplicar tramas casi idénticas (deduplicación por embeddings).
- **RF-13.** El adulto puede marcar un cuento como favorito y regenerar una variante a partir de él.

**Auditoría (interna)**

- **RF-14.** El sistema registra internamente, por cada cuento, el veredicto de verificación y de moderación (trazabilidad). En el MVP esta auditoría es **solo interna** (persistencia y logs para métricas y memoria); la visualización se decidirá más adelante.

### 17.2. Requisitos no funcionales (RNF)

**Seguridad y privacidad**

- **RNF-01.** Cumplimiento RGPD; minimización de datos de menores; el perfil del niño usa alias, no datos identificativos innecesarios.
- **RNF-02.** Contraseñas hasheadas, comunicación cifrada (HTTPS), gestión segura de secretos y API keys (nunca en el repositorio).
- **RNF-03. Seguridad de contenido:** ningún cuento se entrega sin pasar la moderación. Objetivo prioritario: minimizar los falsos negativos (contenido inapropiado que se cuela).

**Rendimiento y coste**

- **RNF-04.** El texto se resuelve primero y se muestra; el audio por página puede completarse de forma asíncrona sin bloquear la lectura.
- **RNF-05.** Coste medio por cuento acotado y monitorizado; el coste marginal debe ser muy inferior al precio de un libro (enlaza con la motivación económica).

**Fiabilidad y disponibilidad**

- **RNF-06.** Si un proveedor de IA falla, el sistema degrada con elegancia (reintentos, mensaje claro, sin colgarse).
- **RNF-07.** El bucle de corrección tiene límite de reintentos para no bloquearse ni disparar el coste.

**Mantenibilidad, calidad y extensibilidad**

- **RNF-08.** Proveedores de IA intercambiables tras interfaces de servicio (Clean Architecture, definidas en Use Cases); demostrado con al menos dos adaptadores en una interfaz.
- **RNF-09.** Cobertura de tests mínima en el dominio y los verificadores; análisis estático en CI.
- **RNF-10.** Observabilidad: logging estructurado y métricas (tasa de aprobación al primer intento, reintentos medios, latencia y coste por cuento).
- **RNF-14. Extensibilidad:** el modelo de roles y de propiedad de perfiles se diseña para admitir el rol educador y perfiles de aula en el futuro sin reescritura (preparado, no implementado).

**Usabilidad y accesibilidad**

- **RNF-11.** Interfaz operable por el adulto con esfuerzo mínimo; cumplimiento WCAG en lo razonable. En el **modo niño**: controles amplios, alto contraste opcional y navegación operable sin lectura precisa.
- **RNF-12.** Modo lectura nocturna de bajo estímulo para el momento del cuento.

**Portabilidad y despliegue**

- **RNF-13.** Contenerización completa; despliegue reproducible; configuración externalizada por entorno.

### 17.3. Restricciones (del proyecto y del dominio)

- **RES-01.** Proyecto individual desarrollado a **tiempo parcial** (ritmo sostenible, ~2-3 h/día), priorizando calidad sobre velocidad y **sin fecha de entrega rígida** → sin fine-tuning, sin datasets propios grandes; IA vía API preentrenada. El alcance se controla mediante el Plan de Incrementos, no mediante un calendario fijo.
- **RES-02.** **Coste operativo objetivo: cero** (ADR-006). Al tratarse de un TFM sin continuidad comercial prevista, no se asume gasto recurrente ni en despliegue ni en consumo de IA: capas gratuitas, modelos de gama Flash/Flash-Lite, TTS en el navegador y cupos máximos explícitos en todos los planes. El desarrollo se realiza contra adaptadores fake y la CI nunca invoca APIs reales.
- **RES-03.** Dependencia de servicios externos de terceros (términos de uso, límites de rate, disponibilidad).
- **RES-04.** Contenido dirigido a **menores** → el marco legal y ético es una restricción dura, no una preferencia.
- **RES-05.** Idioma inicial: **español** (los índices de legibilidad elegidos son específicos del español). Multi-idioma queda como ampliación.
- **RES-06.** Alcance MVP acotado: se prioriza el núcleo de verificación + moderación sobre lo multimedia. La imagen se pospone a ampliación.

### 17.4. Impacto en el modelo de dominio (adelanto)

- La entidad `Cuento` se compone de `Página` (orden, texto, audio).
- El `VeredictoVerificación` se asocia al **cuento** (legibilidad y vocabulario) y a la **página** (longitud).
- El rebalanceo de longitud es un servicio de dominio determinista: cascada de primera a última página, corte por límites naturales, creación de página nueva al final si persiste el exceso.
- La `Moderación` produce un veredicto único a nivel de cuento (cuento + moraleja), ejecutado al final del pipeline.
- El `Propietario` de un perfil se modela por **rol genérico** para admitir el rol educador más adelante sin reescritura.

---

## 18. Alcance del MVP

> **Enfoque MVP-first.** Se prioriza construir un producto funcional con las capacidades principales y refinar los detalles finos (parámetros exactos, límites de planes, políticas de sesión) sobre el producto ya en marcha, no antes. Las cuestiones abiertas se registran en §19.

### 18.1. Flujo del pipeline de generación (referencia del MVP)

0. **Entrada de la idea** — el usuario introduce una frase o un conjunto de palabras sueltas. La idea pasa por **sanitización y moderación de input** antes de generar nada (defensa temprana y ahorro de coste).
1. **Generar cuento** — a partir de la idea y de los parámetros del perfil (longitud, páginas, nivel de dificultad, modo dislexia).
2. **Verificar** — legibilidad y vocabulario sobre el cuento completo; longitud máxima por página con rebalanceo en cascada (creación de página nueva al final si persiste el exceso).
3. **Generar moraleja** — la IA la deriva del cuento ya validado.
4. **Verificar moraleja** — que exista, sea breve y sea **coherente con el cuento** (LLM-as-judge).
5. **Moderación final** — una única pasada sobre **cuento + moraleja**.
6. **Generar audio** — narración por página (solo para usuarios registrados).
7. **Entregar**.

### 18.2. Capacidades incluidas en el MVP

- Generación de cuentos a partir de idea (frase o palabras) con sanitización de input.
- Cuento en páginas navegables + moraleja generada por IA en página propia de cierre.
- Motor de verificación de restricciones (legibilidad/vocabulario global + longitud por página con rebalanceo).
- Guardarraíl de moderación final sobre cuento + moraleja.
- Presets de longitud (corto / medio / largo) y niveles de dificultad anclados a métricas objetivas del español.
- Legibilidad automática según la edad del perfil, **ajustable** mediante un input en el formulario.
- Modo dislexia sobre **texto** (frases, vocabulario) y **presentación** (tipografía, tamaño, espaciado, contraste).
- Longitud y nº de páginas configurables por perfil (Opción A: total + páginas, longitud por página derivada; con topes de sistema).
- Modelo de acceso **freemium**:
  - **Guest (anónimo):** genera cuento (texto + moraleja + verificación), puede activar modo dislexia, **sin audio**, **sin persistencia**, cupo de **2 generaciones** por sesión (contabilizadas de forma acumulada; borrar y regenerar no devuelve cupo).
  - **Registrado:** pack completo (audio, perfiles persistentes, biblioteca, favoritos, historial, configuración fina).
- Autorización por niveles/capabilities según rol (guest / registered), validada en **servidor**.
- Clean Architecture con proveedores de IA intercambiables tras interfaces de servicio.

### 18.3. Matriz de capacidades por rol

| Capacidad | Guest | Registrado |
|-----------|:-----:|:----------:|
| Generar cuento (texto + moraleja + verificación) | ✅ | ✅ |
| Activar modo dislexia | ✅ | ✅ |
| Presets de longitud | ✅ | ✅ |
| Audio (narración) | ❌ | ✅ |
| Persistencia (biblioteca, historial) | ❌ | ✅ |
| Perfiles guardados | ❌ | ✅ |
| Configuración fina por perfil | ❌ | ✅ |
| Cupo de generación | 2 / sesión | Por definir (§19) |

### 18.4. Fuera del MVP (ampliaciones)

Ilustraciones por escena (imagen); consistencia real de personajes (IP-Adapter/LoRA); export a EPUB/audiolibro; modo colaborativo padre-hijo; series con personajes recurrentes; voces personalizadas; modo offline; panel para educadores; multi-idioma; extensión validada a otros públicos (mayores).

---

## 19. Puntos críticos pendientes / deficiencias detectadas

> **Backlog vivo.** Cuestiones detectadas durante la definición que se resolverán sobre el MVP ya en marcha, no antes. No bloquean el arranque del desarrollo.

### 19.1. Parámetros y generación

- **Tabla maestra de parámetros.** Definir los valores concretos de cada preset (corto/medio/largo) y de cada nivel de dificultad: palabras objetivo, nº de páginas, longitud por página, rango de legibilidad (Fernández-Huerta/INFLESZ), longitud media de frase, % de palabras fuera de lista de frecuencia. **Crítico:** los presets deben ser tablas de parámetros verificables, no adjetivos que el LLM interpreta libremente. Es la pieza que da valor al motor de verificación.
- **Especificación del modo dislexia.** ✅ **Resuelto en §20.** Detallado qué cambia en texto y en presentación con base en evidencia científica. El atributo "dislexia" debe viajar con el cuento hasta la UI, no quedarse en el pipeline.

### 19.2. Límites de planes y coste

- **El "10" del plan registrado.** Resolver si es límite de **generación** (protege coste de API) o de **almacenamiento** (nº de cuentos guardados simultáneamente). Y decidir qué ocurre con el otro eje. Cuidado con la incoherencia de "borrar y regenerar": si no consume cupo, el límite se vuelve infinito (mismo problema ya resuelto para el guest).
- **Cupo del plan free/registrado.** ✅ **Cerrado por ADR-006:** ningún plan es ilimitado; todos tienen límite máximo explícito. Pendiente únicamente fijar el valor numérico concreto.
- **Migración guest → registrado.** Al convertirse, los cuentos generados en sesión anónima se migran a la cuenta nueva (promoción de sesión). Definir el mecanismo.

### 19.3. Sesión, autenticación y autorización

- **Contador de cupo en servidor, no en el JWT.** El JWT identifica rol (guest/registered), pero el contador de generaciones debe leerse de servidor (p.ej. Redis) anclado a sesión+IP con rate limiting. Regla: el cliente nunca es la autoridad sobre su propio límite.
- **Revocación de JWT y expiración de sesión guest.** Prever invalidación del token guest en la conversión a registrado (expiraciones cortas + refresh, o lista de revocación). Definir duración razonable del token guest.

### 19.4. Infraestructura de datos (a simplificar)

- **Revisar el modelo de dos BDs.** Se detectó un error de criterio: Redis y Postgres+pgvector **no se reparten por tipo de usuario** (Redis≠"BD del guest", Postgres≠"BD del de pago"), sino **por función**: Redis para estado efímero + contadores + rate limiting (todos los roles); Postgres+pgvector para persistencia (cuentos, perfiles, embeddings). 
- **Buscar una solución más sencilla para el MVP.** Evaluar si es posible arrancar el MVP con **una sola tecnología de datos** para reducir fricción de infraestructura (p.ej. Postgres para todo, incluido el control de cupo/sesión, e incorporar Redis solo si el rendimiento lo justifica). Objetivo: minimizar piezas móviles en el arranque.

---

## 20. Especificación del Modo Dislexia (basada en evidencia)

> **Hallazgo de partida.** La premisa inicial de usar la fuente OpenDyslexic **no está respaldada por la evidencia científica**, especialmente en niños. La investigación rigurosa no encuentra mejoras en velocidad ni precisión de lectura con fuentes "de dislexia" (OpenDyslexic, Dyslexie) frente a fuentes estándar. Las dificultades de la dislexia provienen mayoritariamente de déficits de **codificación fonológica y alfabética**, no de un problema visual que una fuente pueda resolver. Cuando alguna fuente DF parecía ayudar, el beneficio provenía del **espaciado**, no de la forma de las letras.
>
> **Enfoque adoptado en NarrARA:** presentación legible estándar + espaciado + ajustes de texto, todo **configurable**. No se impone una fuente especial; OpenDyslexic puede ofrecerse como *opción* de preferencia del usuario, pero no como solución.

### 20.1. Capa de presentación (frontend)

Ajustes con respaldo en las guías de la British Dyslexia Association (BDA) y estudios de eye-tracking:

- **Tipografía:** fuente **sans-serif estándar** (p.ej. Verdana, Open Sans, Tahoma, Arial). Evitar serif e itálicas en el cuerpo del texto.
- **Tamaño de fuente:** grande, **≥ 18px** para el cuerpo (la BDA recomienda 12-14pt / 16-19px como mínimo; la comprensión mejora con 18+). Encabezados al menos un 20% mayores.
- **Espaciado entre letras (tracking):** aumentado, en el entorno del **30-35% del tamaño de fuente**. Es el ajuste con mayor respaldo empírico. No exagerar: en exceso también perjudica.
- **Espaciado entre palabras:** ligeramente aumentado, en la misma línea del 30-35%.
- **Interlineado (line-height):** amplio pero sin extremos (evitar valores demasiado apretados o demasiado altos; un interlineado por defecto generoso funciona mejor).
- **Separación de párrafos:** párrafos bien separados para partir el texto en secciones manejables.
- **Alineación:** a la **izquierda**, sin justificar (evita los "ríos" de espaciado irregular).
- **Longitud de línea:** **líneas cortas** (las líneas cortas facilitan la lectura; referencia 40-120 caracteres, tendiendo a lo corto).
- **Fondo:** evitar el **blanco puro** (deslumbra); usar crema o un pastel suave. Encaja con el modo lectura nocturna de bajo estímulo (RNF-12).
- **Color:** evitar combinaciones verde y rojo/rosa (daltonismo).

### 20.2. Capa de texto (generación + verificación)

Coherente con que la dislexia es un tema de decodificación, no visual:

- **Frases cortas** y estructura sintáctica simple.
- **Vocabulario de alta frecuencia**, minimizando palabras raras.
- **Rango de legibilidad más exigente** que el estándar de la edad (índices Fernández-Huerta / INFLESZ).
- Estos parámetros se integran en la tabla maestra (§19.1) y los verifica el motor de restricciones ya existente.

### 20.3. Consideraciones de diseño y honestidad metodológica

- **Configurable / desactivable:** todos los ajustes de presentación son opciones, no imposiciones. Se puede ofrecer OpenDyslexic como preferencia opcional sin presentarlo como eficaz.
- **Evidencia mayormente en inglés:** los principios de espaciado y tamaño son transferibles al español, pero la validación específica en español es limitada. Debe declararse así en la memoria.
- **El atributo `dislexia` viaja con el cuento hasta la UI:** no es solo un parámetro de generación, también condiciona la capa de presentación. El modelo de dominio debe reflejarlo.
- **Valor para el TFM:** la postura "implementé ajustes basados en evidencia y los hice configurables" es más defendible ante un tribunal que "usé la fuente de moda".

### 20.4. Fuentes consultadas

- British Dyslexia Association — Dyslexia Style Guide (2023).
- Wery & Diliberto (2016/2017), *The effect of a specialized dyslexia font, OpenDyslexic, on reading rate and accuracy*, Annals of Dyslexia.
- Estudios de eye-tracking sobre fuentes y espaciado (Universidad de Michigan; estudio sobre Wikipedia).
- Zorzi et al. — efecto del espaciado extra entre letras en niños con dislexia.
- Revisiones sobre inter-letter / inter-word spacing y fuentes DF (PMC).

---

## 21. Metodología de desarrollo

El proyecto se desarrolla siguiendo dos metodologías complementarias que refuerzan la calidad y la trazabilidad, y que constituyen un argumento de defensa relevante ante el tribunal.

### 21.1. TDD — Test-Driven Development (pilar)

El desarrollo se guía por tests escritos **antes** que el código de producción, siguiendo el ciclo **red → green → refactor**:

- **Red:** se escribe un test que falla, derivado del comportamiento esperado.
- **Green:** se escribe el código mínimo para que pase.
- **Refactor:** se mejora el diseño manteniendo los tests en verde.

**Por qué encaja especialmente bien en NarrARA:** el núcleo del proyecto (motor de verificación de restricciones, rebalanceo de páginas, verificación de la moraleja, pipeline de moderación) es **lógica determinista con entradas y salidas claras**, el caso ideal para TDD. Cada restricción (legibilidad, longitud, vocabulario) se expresa como un test antes de implementarse.

**Herramientas:** **Vitest** para tests unitarios y de integración.

**Implicaciones asumidas:** TDD ralentiza el desarrollo en horas absolutas pero reduce la depuración y eleva la robustez. Refuerza la necesidad de un alcance de implementación acotado (ver §18 y backlog de plan por incrementos).

### 21.2. SDD — Specification-Driven Development

Bajo SDD, cada funcionalidad arranca de una **especificación formal** que es la fuente de verdad de la que derivan tests y código. NarrARA emplea **dos artefactos de especificación**:

- **Spec de Incremento (`INC-XX`):** unidad de planificación. Define **qué se entrega** en el incremento (objetivo, alcance, dependencias, interfaces afectadas y **Definition of Done** verificable). No lleva Gherkin.
- **Spec de Componente (`SPEC-NN`):** unidad de comportamiento. Define el **contrato de una pieza de lógica** con reglas deterministas y **criterios de aceptación en Gherkin**.

Un incremento referencia **0..N** specs de componente. Los criterios **Dado / Cuando / Entonces** viven en las specs de componente y son el formato de especificación del comportamiento dentro de SDD; **no constituyen una metodología BDD independiente**. Los tests **E2E con Playwright** se derivan directamente de esos criterios, cerrando la trazabilidad requisito → historia → criterio → test.

**Herramientas:** **Playwright** para los tests E2E que validan los flujos de usuario.

> **Planificación bajo SDD:** el desarrollo se organiza en **incrementos de valor** (documento `NarrARA_Plan_Incrementos`). Cada incremento se especifica en una Spec de Incremento (`INC-XX`) con su Definition of Done, y referencia las Specs de Componente (`SPEC-NN`) donde vive el comportamiento verificable con Gherkin.

### 21.3. Estrategia de testing (visión general)

- **Unitario (Vitest):** capa de Entities (dominio puro), motor de verificación de restricciones, rebalanceo, lógica de moraleja. Es donde TDD tiene mayor peso.
- **Integración (Vitest):** adaptadores de IA (mockeados), persistencia, pipeline completo de generación con dobles de prueba.
- **E2E (Playwright):** flujos de usuario derivados de los criterios Gherkin (crear cuento, navegar páginas, registro/acceso).
- **Trazabilidad:** requisito (§17) → historia de usuario → criterio Gherkin → test. Cadena completa verificable.

### 21.4. Decisión de plataforma (registro)

- **Aplicación web responsive** desarrollada con Next.js, **desktop como referencia** de diseño y comportamiento responsive impecable en móvil/tablet (resuelto en implementación con CSS, no en la fase de diseño).
- Se descartan explícitamente app nativa y enfoque mobile-first (no acordados).
- Esta decisión se formalizará como ADR en la fase de arquitectura, junto con las de Clean Architecture, procesamiento asíncrono y BD única.
