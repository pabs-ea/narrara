# NarrARA — Documento maestro de consolidación

> **Propósito.** Punto único de entrada al proyecto. Recopila el estado real, las decisiones tomadas, los documentos vigentes y los puntos pendientes, a fecha de la última sesión de trabajo. Sirve para retomar sin perder contexto.

**Fecha de consolidación:** 2026-08-25 · **Rev. Consolidación:** v1.3.0

---

## 1. Documentos del proyecto (versiones vigentes)

| Documento | Versión vigente | Contenido |
|-----------|:---------------:|-----------|
| **NarrARA (principal)** | **v1.7.0** | Definición completa del proyecto: problema, solución, requisitos, MVP, metodología, stack. Es el documento troncal. Marco: Clean Architecture. |
| **Historias de Usuario** | **v1.0.0** | 33 historias en 7 épicas, con Gherkin, MoSCoW y trazabilidad a requisitos. |
| **UX / Stitch** | **v1.1.0** | Mapa de 13 pantallas, flujos de usuario y briefs por pantalla para Stitch. Enfoque web responsive. |
| **Especificaciones (SDD)** | **v1.1.0** | Plantilla de SPEC-NN + SPEC-01 (motor de verificación), contrato en inglés. |
| **Plan de Incrementos** | **v1.0.0** | Plan maestro de incrementos + plantilla de Spec de Incremento + INC-00 (cimientos). |
| **Investigación Dislexia** | **v1.0.0** | Evidencia científica sobre diseño para dislexia. Documento reutilizable e independiente. |

> **Nota de versionado:** cada documento sigue SemVer adaptado (MAJOR = cambio de enfoque; MINOR = añadir/quitar apartados; PATCH = matices). Las versiones antiguas se conservan en disco pero **la vigente es la de la tabla**.

---

## 2. Resumen del proyecto

**NarrARA** (Narrativa Accesible y Regulada por Adaptación) es una **aplicación web** para que madres y padres creen y narren cuentos infantiles personalizados, con **control automático de adecuación y seguridad** del contenido.

**Tesis defendible ante el tribunal:** no es "una app que llama a un LLM para hacer cuentos", sino **un sistema de generación de contenido infantil con restricciones verificables y guardarraíles de seguridad evaluados**, sobre arquitectura limpia, que democratiza el acceso económico a la narrativa infantil.

**Motivaciones:**
- **Económica:** los libros infantiles se han encarecido; NarrARA da narrativa ilimitada y personalizada a coste marginal casi nulo.
- **De adecuación:** el cuento se adapta al nivel lector, intereses y necesidades del niño (incl. dislexia).

**Diferenciador clave:** el valor no está en generar (eso es "comprado" vía API), sino en **verificar, moderar y evaluar** que el contenido es apropiado. Ahí está la contribución técnica.

---

## 3. Decisiones firmes (consolidadas)

### 3.1. Producto y alcance
- **Público:** familias con niños (3-10 años). Adulto = operador; niño = destinatario.
- **Educadores:** fuera del MVP, pero el modelo de roles se prepara para admitirlos sin reescritura.
- **Audio:** en el MVP solo para registrados. **Imagen/ilustraciones:** ampliación futura.
- **Auditoría de veredictos:** interna (para métricas y memoria), sin UI en el MVP.

### 3.2. Generación de cuentos (pipeline)
Flujo confirmado:
0. **Entrada de idea** (frase o palabras sueltas; adulto o niño) + **sanitización/moderación del input**.
1. **Generar cuento** (según idea + **parámetros derivados** del perfil). **Minimización de datos (ADR-006):** al LLM viajan rango de edad, longitud y restricciones textuales; **nunca** nombre, edad exacta ni etiqueta de modo dislexia.
2. **Verificar**: legibilidad y vocabulario sobre el **cuento completo**; longitud máxima **por página** con **rebalanceo en cascada** (corte por frase completa; si el exceso llega a la última página y se pasa, se **crea página nueva al final**).
3. **Generar moraleja** (la IA la deriva del cuento ya validado).
4. **Verificar moraleja**: existe, breve y **coherente** con el cuento (LLM-as-judge).
5. **Moderación final**: una única pasada sobre **cuento + moraleja**.
6. **Generar audio** por página (solo registrados).
7. **Entregar**.

- **Moraleja:** generada por IA (no por el adulto), en **página propia de cierre**, **fuera del cómputo** de longitud/páginas.
- **Longitud/páginas (Opción A):** el adulto fija longitud total + nº de páginas; longitud por página se deriva (`total/páginas`). Presets **Corto/Medio/Largo** + topes de sistema.
- **Legibilidad:** automática según la edad del perfil, **ajustable** mediante input en el formulario.

### 3.3. Modo dislexia (basado en evidencia — ver doc Investigación)
- **Hallazgo:** OpenDyslexic **no** está respaldado por la evidencia; no se impone.
- **Actúa sobre texto** (frases cortas, vocabulario frecuente, legibilidad exigente) **y presentación** (sans-serif estándar tipo Verdana/Open Sans, tamaño ≥18px, espaciado de letras +30-35%, interlineado amplio, alineación izquierda, líneas cortas, fondo crema/pastel).
- **Configurable/desactivable.** OpenDyslexic solo como opción, no como solución.
- El atributo "dislexia" **viaja con el cuento hasta la UI** (no se queda en el pipeline).

### 3.4. Acceso (modelo freemium)
- **Guest (anónimo):** genera cuento (texto + moraleja + verificación), puede activar modo dislexia, **sin audio**, **sin persistencia**, **cupo de 2 generaciones por sesión** (acumuladas; borrar y regenerar **no** devuelve cupo). Al agotar → muro de conversión.
- **Registrado:** pack completo (audio, perfiles persistentes, biblioteca, favoritos, historial, configuración fina).
- **Estructura:** una cuenta = una familia con varios perfiles de niño (MVP). Multi-adulto por familia = deseable (backlog).
- **Autorización por niveles/capabilities**, validada en **servidor** (no en el cliente).

### 3.5. Plataforma y stack (CORREGIDO en v1.4.0)
- **Aplicación web responsive**, **desktop como referencia** de diseño; responsive impecable en móvil resuelto en implementación. Se descartan app nativa y mobile-first.
- **Stack JavaScript/TypeScript de extremo a extremo. NADA de Python.**
  - **Frontend:** Next.js (React) + TypeScript.
  - **Backend:** Node.js + TypeScript mediante **Next.js full-stack** (App Router), sin framework de backend (ADR-004). Lógica en la capa de **Use Cases**, nunca en Server Actions/route handlers. DI por **composition root manual**. **NestJS = ruta de migración futura**, no opción de partida.
  - **Gestor de paquetes:** **pnpm**.
  - **BD:** persistencia **diferida** (ADR-003): se arranca con adaptador **in-memory** tras interfaz de repositorio; PostgreSQL + pgvector entra en INC-05. Interfaces **async desde el día uno** (`Promise<T>`) aunque el in-memory resuelva al instante. Redis como optimización futura.
  - **Testing:** **Vitest** (unitario/integración) + **Playwright** (E2E).
  - **Async:** **fuera del MVP** (ADR-005). Audio síncrono por página bajo demanda; colas (BullMQ) como línea futura.
  - **Despliegue:** Docker + Compose en local y CI; **Vercel** en producción (ADR-005).
  - **Infra:** Docker + Docker Compose; GitHub Actions (CI/CD).
  - **IA:** vía API preentrenada, sin fine-tuning, tras interfaces de servicio definidas en Use Cases. **Gama Flash/Flash-Lite del nivel gratuito** (nunca Pro). **TTS por defecto en el navegador (Web Speech API)**, coste cero y segundo adaptador que cubre RNF-08 (ADR-006).
  - **Coste operativo objetivo: CERO** (ADR-006). Capas gratuitas en despliegue y BD; cupos máximos explícitos en todos los planes; desarrollo con adaptadores fake y CI sin llamadas reales.

### 3.6. Arquitectura
- **Modular Monolith con Clean Architecture (Robert C. Martin).** Marco rector, consolidado desde un enfoque hexagonal de partida (ambos comparten la regla de dependencia hacia dentro).
- Capas: **Entities** (dominio puro: motor de verificación, rebalanceo) → **Use Cases** (orquestador del pipeline) → **Interface Adapters** (adaptadores repo/IA) → **Frameworks & Drivers** (Next.js, Postgres, APIs).
- Se descartan microservicios y event-driven a gran escala (no justificados).
- **Interfaces de IA intercambiables** definidas en Use Cases (demostrado con ≥2 adaptadores en una interfaz).
- **Async con colas retirado del MVP** (ADR-005): el audio se genera por página bajo demanda; las colas quedan como línea futura, añadibles sin tocar Entities ni Use Cases.

### 3.7. Metodología (§21 del doc principal)
- **TDD** (Test-Driven Development) como pilar: ciclo red-green-refactor. El motor de verificación es el caso ideal.
- **SDD = Specification-Driven Development.** **Terminología cerrada: NO se menciona BDD.** El Gherkin es el *formato* de los criterios de aceptación dentro de SDD, no una metodología aparte.
- **Dos artefactos de especificación:**
  - **`INC-XX` (Spec de Incremento):** unidad de **planificación**. Objetivo, alcance, dependencias, interfaces afectadas y **Definition of Done** verificable. **Sin Gherkin.**
  - **`SPEC-NN` (Spec de Componente):** unidad de **comportamiento**. Reglas deterministas + **criterios de aceptación en Gherkin**.
  - Un incremento referencia **0..N** specs de componente.
- **Trazabilidad completa:** Requisito → Historia de usuario → INC-XX (qué) + SPEC-NN (comportamiento) → Test → Código.
- Granularidad de specs: **una por componente/módulo**, solo del núcleo a implementar.
- **Planificación por incrementos** (documento `NarrARA_Plan_Incrementos`), no por calendario de semanas.

### 3.8. Estado de los ADR

| ADR | Título | Estado |
|-----|--------|--------|
| **ADR-001** | Next.js full-stack para el MVP (NestJS como migración futura) | ✅ Aceptada |
| **ADR-002** | Genkit como framework del adaptador de IA | ✅ Aceptada |
| **ADR-003** | Persistencia diferida tras interfaz de repositorio (in-memory first, async) | ✅ Aceptada |
| **ADR-004** | Composition root manual como mecanismo de DI | ✅ Aceptada |
| **ADR-005** | Despliegue híbrido (Docker local/CI + Vercel prod) y sin colas en el MVP | ✅ Aceptada |
| **ADR-006** | Coste mínimo y minimización de datos en llamadas a IA | ✅ Aceptada |

> **Estado:** los seis ADR están **aceptados** (2026-08-25) y reconciliados a Clean Architecture. Pendiente únicamente la verificación externa que señala ADR-006: confirmar en la documentación oficial del proveedor los términos y límites de la capa gratuita de IA.

---

## 4. Estado de avance por fase

| Fase | Estado |
|------|--------|
| Definición del proyecto (problema, solución, valor) | ✅ Completa |
| Requisitos (funcionales, no funcionales, restricciones) | ✅ Completos (§17) |
| Stakeholders | ✅ Completos (§16) |
| Historias de usuario (Gherkin + MoSCoW + trazabilidad) | ✅ Completas (33 HU) |
| Alcance MVP + backlog de pendientes | ✅ Definido (§18, §19) |
| Investigación dislexia | ✅ Completa |
| Diseño UX (mapa, flujos, briefs Stitch) | ✅ Material listo para generar en Stitch |
| Metodología (TDD + SDD) | ✅ Definida y terminología cerrada |
| Marco arquitectónico (Clean Architecture) | ✅ Adoptado y propagado a troncal + Consolidación |
| Plan de incrementos (maestro + plantilla INC-XX) | ✅ Definido (8 incrementos, INC-00 → INC-07) |
| INC-00 (Spec de Incremento, cimientos) | ✅ Redactado en Clean (pendiente integrar al Plan) |
| ADRs | 🟡 001/002 aceptados; 003/004 en Propuesto |
| Especificaciones SDD (SPEC-NN) | 🟡 Iniciadas (plantilla + SPEC-01 de 1) |
| Reconciliación documental (Clean + v1.5.0) | 🟡 Troncal ✅ y Consolidación ✅; **ADR pendientes** |
| Diseño de pantallas en Stitch | ⬜ Pendiente (generar y revisar) |
| Modelo de dominio detallado | ⬜ Pendiente |
| Tabla maestra de parámetros | ⬜ Pendiente (CRÍTICO, bloquea SPEC-01) |
| Implementación (ejecución INC-00) | ⬜ No iniciada |

---

## 5. Puntos críticos pendientes (backlog vivo — §19 del doc principal)

### 5.1. Parámetros y generación
- **Tabla maestra de parámetros** (CRÍTICO): valores concretos de cada preset (Corto/Medio/Largo) y nivel de dificultad: palabras objetivo, nº páginas, longitud por página, rango de legibilidad (Fernández-Huerta/INFLESZ), longitud media de frase, % palabras fuera de lista de frecuencia. Deben ser tablas verificables, no adjetivos.
- **Especificación fina del modo dislexia** (parcialmente resuelta en §20; faltan valores exactos de tipografía/tamaños en la tabla).

### 5.2. Límites de planes y coste
- **El "10" del plan registrado:** decidir si es límite de **generación** o de **almacenamiento**, y qué pasa con el otro eje. Cuidado con la incoherencia borrar/regenerar (misma trampa que se resolvió para el guest).
- ~~**Cupo del plan registrado:** ¿ilimitado o generoso?~~ → ✅ **CERRADO (ADR-006):** ningún plan es ilimitado. Pendiente solo fijar el valor numérico.
- **Migración guest → registrado:** al convertirse, los cuentos de la sesión anónima migran a la cuenta. Definir mecanismo.

### 5.3. Sesión, autenticación y autorización
- **Contador de cupo en servidor, no en el JWT** (el cliente no es autoridad sobre su propio límite; anclar a sesión+IP con rate limiting).
- **Revocación de JWT y expiración de sesión guest** (invalidar token guest en la conversión).

### 5.4. Infraestructura de datos
- **Revisar/simplificar el modelo de BDs.** Criterio correcto: Redis = estado efímero + contadores (todos los roles); Postgres+pgvector = persistencia. **Recomendación pendiente de confirmar: arrancar el MVP solo con Postgres**, Redis como optimización futura.

### 5.5. Peso académico
- **Peso de la nota técnica vs memoria escrita:** pendiente de que el autor revise **las bases del máster**. Condiciona cuánto recortar de implementación.
- **Fecha de entrega:** sin fecha rígida por ahora; el autor prefiere **calidad sobre velocidad** (producto completo, vistoso y bien hecho) al ritmo sostenible de ~2-3h/día. Confirmar con las bases si hay fecha de convocatoria.

### 5.6. Decisiones menores abiertas
- ~~**Backend NestJS vs Next.js solo**~~ → ✅ **CERRADO** (ADR-004): Next.js full-stack para el MVP; NestJS como migración futura.
- **Caso límite del rebalanceo** (SPEC-01): frase única más larga que el máximo de página → propuesta: aceptar página sobredimensionada y marcar advertencia. A confirmar en implementación.
- **Separación de responsabilidades del motor** (SPEC-01-R10): el motor verifica/rebalancea pero NO regenera; la decisión de reintentar es del orquestador. A validar.

---

## 6. Restricciones del proyecto

- **RES-01:** TFM individual a **tiempo parcial** (~2-3 h/día), **sin fecha de entrega rígida**; calidad sobre velocidad. Alcance controlado por el Plan de Incrementos, no por calendario. Sin fine-tuning ni datasets propios; IA vía API.
- **RES-02:** Presupuesto limitado de llamadas a API.
- **RES-03:** Dependencia de servicios de IA de terceros.
- **RES-04:** Contenido para **menores** → marco legal y ético como restricción dura.
- **RES-05:** Idioma inicial **español** (índices de legibilidad específicos). Multi-idioma = ampliación.
- **RES-06:** MVP acotado: núcleo verificación+moderación primero; imagen diferida.
- **Restricción de tiempo real:** ~2-3h/día, con días sueltos casi inactivos.

---

## 7. Nombre del proyecto (nota)

Se evaluó renombrar a "WonderBook" o "BookAI". **Descartados:**
- **WonderBook:** muy saturado en el mismo nicho (varias apps de storybooks IA con ese nombre) y con una **marca física registrada** (Playaway Products, libro con audio). Riesgo de confusión y de marca.
- **BookAI:** genérico e indefendible como marca.

**Recomendación:** mantener **NarrARA** (distintivo, disponible, con significado que refuerza la tesis) salvo que se decida buscar alternativas distintivas y verificar disponibilidad. No es crítico para el TFM.

---

## 8. Próximos pasos sugeridos (orden recomendado)

1. **Reconciliar los ADR a Clean Architecture** (ADR-002 menciona «puertos hexagonales») y **cerrar ADR-003/004**: alinear formato con ADR-001/002 y pasarlos a *Aceptado*.
2. **Integrar el INC-00 (versión Clean) al Plan de Incrementos** (bump a v1.1.0).
3. **Ejecutar INC-00** — cimientos: esqueleto en capas Clean, tooling, regla de dependencia por linter, interfaces async, composition root, Docker, CI. **Aquí empieza el código.**
4. **Definir la tabla maestra de parámetros** (CRÍTICO — desbloquea SPEC-01 y el motor de verificación).
5. **Modelo de dominio detallado** (capa Entities).
6. **INC-01 + SPEC-01** — motor de verificación con TDD.
7. **Generar pantallas en Stitch** (tanda 1: flujo nuclear P01→P05→P06→P08 + acceso) y revisarlas.
8. **Completar specs** del núcleo (pipeline orquestador, guardarraíl de moderación, moraleja).
9. **Revisar las bases del máster** (peso memoria/código, fecha de convocatoria) — informativo, ya no bloquea la planificación.

---

## 9. Advertencias de continuidad (para no repetir errores)

- **Stack = TypeScript/Node. NUNCA Python/FastAPI.** (Se arrastró por error del stack inicial; corregido en v1.4.0.)
- **Testing = Vitest + Playwright.** (No pytest.) **Gestor de paquetes = pnpm.**
- **Plataforma = web responsive desktop-first.** (No mobile-first, no app nativa.)
- **SDD = Specification-Driven Development. NO se menciona BDD.** El Gherkin es el formato de criterios de aceptación dentro de SDD.
- **Arquitectura = Clean Architecture** (Entities → Use Cases → Interface Adapters → Frameworks & Drivers). Ya **no** se dice «hexagonal» como marco rector; los «puertos» son **interfaces definidas en Use Cases**.
- **Backend = Next.js full-stack, sin NestJS en el MVP.** NestJS solo como migración futura. La lógica **nunca** va en Server Actions ni route handlers.
- **Interfaces async desde el día uno** (`Promise<T>`), aunque el adaptador in-memory resuelva al instante.
- **Dos artefactos SDD:** `INC-XX` (planificación + DoD, sin Gherkin) y `SPEC-NN` (comportamiento + Gherkin). **No existe SPEC-00.**
- **Orden de arranque: INC-00 (cimientos, sin SPEC) antes que INC-01 + SPEC-01.**
- **La moraleja no se modera aparte:** entra en la pasada final junto al cuento.
- **El enfoque es MVP-first:** definir mucho está bien, pero implementar solo el núcleo; el resto queda documentado como líneas futuras.
- **No hay deadline rígido.** Ritmo sostenible ~2-3 h/día, calidad sobre velocidad.
- **SIN COLAS en el MVP** (ADR-005). Nada de BullMQ ni workers: el audio se genera **por página bajo demanda**. Vercel es serverless y no soporta procesos persistentes.
- **Despliegue: Docker en local/CI, Vercel en producción.** No autohospedar.
- **COSTE CERO** (ADR-006). Capas gratuitas, gama Flash/Flash-Lite, TTS en navegador. Ningún plan ilimitado. La CI nunca llama a APIs reales.
- **Al LLM NUNCA van datos del menor** (ADR-006): ni nombre, ni edad exacta, ni etiqueta de dislexia. Solo **parámetros derivados**. La entrada libre se cubre con **transparencia**, no con filtrado (un nombre puede ser un personaje inventado).
- **Nomenclatura: código en inglés** (`Story`, `Page`, `LLMService`); **lenguaje natural en español** (prosa, Gherkin, 33 HU).
