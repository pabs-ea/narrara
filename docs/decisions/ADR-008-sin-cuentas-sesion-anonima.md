# ADR-008 — Reducción de alcance: eliminación del modelo de cuentas y sustitución por sesión anónima persistente

- **Versión:** v1.0.0
- **Fecha:** 2026-08-25
- **Estado:** **Propuesta — pendiente de revisión y de consulta con la tutoría**
- **Decisores:** autor del TFM
- **Relacionado con:** NarrARA (principal) §17.1 (RF-01, RF-02, RF-03, RF-11, RF-13), §17.2 (RNF-01, RNF-02, RNF-14), §18.2, §18.3, §19.2, §19.3; Historias de Usuario E1, E2, E6; ADR-005, ADR-006; INC-05

> **Aviso de alcance.** Esta decisión retira del MVP una épica completa del catálogo de Historias de Usuario (E1) y reformula otras dos (E2 y E6). No debe aceptarse sin validación previa con la tutoría del TFM si el alcance está comprometido en la propuesta formal del trabajo.

---

## Contexto

El troncal (§18.2) incluye en el alcance del MVP un **modelo de acceso freemium** con dos roles: Guest anónimo (2 generaciones por sesión, sin audio, sin persistencia) y Registrado (pack completo con audio, perfiles persistentes, biblioteca, favoritos e historial). Ello implica registro con email y contraseña, inicio y cierre de sesión, autorización por rol validada en servidor y migración de los cuentos generados como invitado a la cuenta recién creada.

Ese alcance genera tres tipos de coste que conviene evaluar de forma explícita:

**1. Coste de construcción.** Autenticación, gestión de sesión, hasheo de credenciales, pantallas de registro y acceso, recuperación de contraseña, contador de cupo por rol anclado en servidor, revocación de tokens y migración de datos entre roles. Es trabajo de infraestructura de aplicación que no toca la contribución defendible del TFM —verificar, moderar y evaluar— y que compite directamente por el tiempo del motor de verificación. Las restricciones del proyecto son severas: desarrollo individual, ritmo de 2-3 h/día, autor con experiencia casi nula en el ecosistema Node de servidor, y un calendario que no admite dilación.

**2. Coste de decisiones abiertas.** El §19.2 y el §19.3 registran como pendientes el mecanismo de migración guest → registrado, el límite del plan registrado (si es de generación o de almacenamiento), el contador de cupo en servidor con rate limiting, la revocación del JWT en la conversión y la duración de la sesión de invitado. Son cinco decisiones no triviales que el modelo de cuentas obliga a cerrar antes de codificar.

**3. Coste legal y ético.** El modelo de cuentas almacena de forma duradera perfiles de menores (alias, edad, nivel lector, intereses, temas a evitar y modo dislexia) asociados a la cuenta de un adulto identificado por email. RES-04 establece el marco con menores como restricción dura y RNF-01 exige minimización de datos conforme a RGPD. Es la superficie de datos personales más amplia del proyecto y no aporta nada a la tesis.

Existe precedente propio: **ADR-005** retiró las colas y BullMQ del MVP con este mismo criterio —infraestructura que no toca el núcleo defendible y consume tiempo del que sí lo hace—.

---

## Decisión

**Se elimina del alcance del MVP el modelo de cuentas de usuario en su totalidad, y se sustituye por una sesión anónima persistente.**

### 1. Sin cuentas

No existe registro, ni inicio o cierre de sesión, ni credenciales, ni roles, ni modelo freemium. No existe la entidad `Usuario` en el dominio.

### 2. Sesión anónima persistente

En el primer acceso, el servidor genera un identificador de sesión opaco y lo almacena en una cookie. Los cuentos y los perfiles se persisten asociados a ese identificador.

- **Duración:** cookie persistente de larga duración (valor concreto a fijar en la spec correspondiente; orientativamente 90 días de inactividad).
- **Ámbito:** la biblioteca reside en el navegador desde el que se creó. No es accesible desde otro dispositivo ni desde otro navegador. **Esta limitación debe comunicarse explícitamente en la interfaz.**
- **Pérdida:** el borrado de la cookie por parte del usuario o su caducidad implican la pérdida del acceso a los cuentos asociados.

### 3. Capacidades: sin niveles

Desaparece la matriz de capacidades por rol (§18.3). Todas las capacidades del MVP están disponibles para cualquier visitante:

- **El audio se mantiene en el MVP para todos.** Estaba condicionado al rol Registrado y esa condición desaparece. Su permanencia es obligatoria: **ADR-006** cubre RNF-08 (≥2 implementaciones de una interfaz de servicio) mediante el doble adaptador de TTS —Web Speech API y proveedor en la nube—; si el audio saliera del alcance, ese requisito no funcional quedaría sin cumplir.
- **Los perfiles de niño se persisten** contra la sesión, no contra una cuenta.
- **La biblioteca se persiste** contra la sesión.

### 4. Cupo de generación

Se mantiene un cupo por sesión, exigido por **ADR-006** para acotar el coste de API, pero pasa a ser **único** en lugar de escalonado por rol. Se mantiene la regla de que la autoridad sobre el contador reside en el servidor y de que borrar un cuento no devuelve cupo.

### 5. Autorización

Persiste como comprobación de pertenencia: un cuento pertenece a una sesión, y las operaciones sobre él verifican esa pertenencia. La comprobación reside en la capa de Use Cases, no en la cáscara de entrada.

---

## Puntos que desaparecen o se reformulan

### Historias de Usuario

| Historia | Estado | Observación |
|---|---|---|
| **E1 — Acceso y cuentas** | **Épica eliminada** | |
| HU-01 — Probar sin registro | Eliminada | Deja de tener sentido: no hay registro del que distinguirse |
| HU-02 — Límite de uso para invitados | **Reformulada** | Pasa a cupo único por sesión; desaparece la invitación a registrarse |
| HU-03 — Registro de cuenta | Eliminada | |
| HU-04 — Inicio y cierre de sesión | Eliminada | |
| HU-05 — Conversión de invitado a registrado | Eliminada | Desaparece con ella la decisión abierta de §19.2 sobre el mecanismo de migración |
| **E2 — Perfiles** | **Reformulada** | Los perfiles se asocian a la sesión, no a una cuenta. Se conservan HU-06 a HU-10 sustituyendo «Registrado» por «usuario» |
| HU-24 — Audio por página | **Reformulada** | Deja de estar condicionado al rol; disponible para todos |
| **E6 — Biblioteca e historial** | **Reformulada** | Se conserva íntegra sustituyendo «Registrado» por «usuario»: HU-25 (consultar y releer), HU-26 (borrar), HU-27 (favoritos), HU-28 (evitar duplicados) |

### Requisitos funcionales

| Requisito | Estado |
|---|---|
| **RF-01** — El adulto puede registrarse y autenticarse | **Eliminado** |
| RF-02 — Crear, editar y eliminar perfiles de niño | Conservado; «bajo una cuenta» pasa a «bajo una sesión» |
| RF-03 — Varios perfiles bajo una misma cuenta | Conservado; «cuenta» pasa a «sesión» |
| RF-04 — Solicitar un cuento indicando idea y perfil | Conservado sin cambios |
| RF-11 — Consultar, releer y borrar cuentos guardados | **Conservado** |
| RF-12 — Deduplicación por embeddings | **Conservado** |
| RF-13 — Favoritos y regeneración de variante | Conservado sin cambios |

### Requisitos no funcionales

| Requisito | Estado |
|---|---|
| **RNF-02** — Contraseñas hasheadas | **Parcialmente eliminado.** Desaparece la parte de contraseñas; se conservan HTTPS y la gestión segura de secretos |
| RNF-01 — RGPD y minimización de datos de menores | **Conservado y reforzado.** Ver §Consecuencias |
| **RNF-14** — Extensibilidad del modelo de roles y propiedad de perfiles | **Requiere reformulación.** Sin modelo de roles, la extensibilidad hacia el rol educador debe replantearse o retirarse |
| RNF-08 — ≥2 adaptadores en una interfaz de servicio | **Conservado.** Depende de la permanencia del audio (ver §Decisión punto 3) |

### Secciones del troncal

- **§18.2** — Retirar el modelo de acceso freemium y la autorización por niveles del alcance del MVP.
- **§18.3** — Eliminar la matriz de capacidades por rol.
- **§19.2** — Cierra los puntos abiertos «el 10 del plan registrado» y «migración guest → registrado»: dejan de existir.
- **§19.3** — Se reduce a la política de cupo por sesión y su rate limiting. Desaparecen la revocación de JWT, la expiración de la sesión de invitado y el modelo de dos roles en el token.
- **§13 (pipeline, paso 6)** — El audio deja de estar condicionado al rol.

---

## Alternativas consideradas

### Mantener el modelo de cuentas completo

- **A favor:** conserva el alcance aprobado sin necesidad de renegociación; el freemium es una funcionalidad de producto realista.
- **En contra:** el coste de construcción y de decisiones abiertas recae íntegramente en área que no aporta a la contribución del TFM; amplía la superficie de datos personales de menores; comprometido con un calendario que no admite dilación.
- **Motivo del descarte:** el riesgo de no completar el núcleo defendible a tiempo supera el valor de la funcionalidad.

### Eliminar toda persistencia (aplicación puramente efímera)

- **A favor:** el recorte más simple posible; elimina de golpe la base de datos, la sesión y las consideraciones de RGPD.
- **En contra:** arrastra consigo E6 completa y, con ella, **RF-12** (deduplicación por embeddings), que es la justificación de `pgvector` e **INC-05**. Se perdería una parte técnica del proyecto por efecto colateral, no por decisión. Además degrada notablemente la demostración de defensa, donde una biblioteca con varios cuentos y sus veredictos asociados es mejor material que un cuento único que se pierde.
- **Motivo del descarte:** recorta más de lo necesario y daña partes del proyecto que sí aportan valor técnico.

### Autenticación delegada a un proveedor externo (Auth.js, Clerk, Supabase Auth)

- **A favor:** reduce sustancialmente el coste de construcción respecto a implementar autenticación propia.
- **En contra:** no elimina el coste de las decisiones abiertas (cupos por rol, migración guest → registrado, modelo de propiedad), ni la superficie de datos personales; añade una dependencia externa con implicaciones de coste que chocan con ADR-006.
- **Motivo del descarte:** reduce el coste más barato de los tres y no toca los otros dos.

---

## Consecuencias

**Positivas:**

- Tiempo de desarrollo liberado hacia el motor de verificación, el guardarraíl de moderación y el harness de evaluación, que constituyen la contribución defendible.
- **Reducción sustancial de la superficie de datos personales.** No se almacenan credenciales ni direcciones de correo, y los perfiles de menores dejan de estar asociados a un adulto identificado. Refuerza RNF-01 y RES-04, y aporta a la memoria una línea coherente de minimización de datos por diseño, alineada con **ADR-006**.
- Se cierran cinco decisiones abiertas del backlog (§19.2 y §19.3) por eliminación, no por resolución.
- Se conservan íntegras la biblioteca, la deduplicación por embeddings, `pgvector` e INC-05.
- La lección arquitectónica sobre autorización de pertenencia se mantiene en versión simplificada.

**Negativas / riesgos:**

- **Se retira una épica completa del alcance aprobado.** Es el riesgo principal y no es técnico. **Mitigación:** validación previa con la tutoría y presentación en la memoria como decisión de ingeniería evaluada, con este ADR como evidencia, en la línea de ADR-005.
- **Pérdida de acceso a la biblioteca** al borrar la cookie, al caducar o al cambiar de navegador o dispositivo. **Mitigación:** comunicación explícita de la limitación en la interfaz.
- **El identificador de sesión sigue siendo un dato personal** a efectos de RGPD, al permitir singularizar a un usuario. La carga se reduce respecto al modelo de cuentas, pero no desaparece. **Mitigación:** aviso de cookies y política de retención documentada.
- **Acumulación de datos huérfanos:** cada visitante genera una sesión. Con el almacenamiento limitado de la capa gratuita (ADR-006), es necesaria una política de purga de sesiones inactivas desde el primer momento.
- **Reformulación documental extensa.** Afecta a dos épicas de Historias de Usuario, cinco secciones del troncal, un RF eliminado y tres RNF afectados. Es trabajo de documentación, no de código, pero debe planificarse dentro de la reconciliación en curso.

---

## Notas de trazabilidad

- Requiere actualizar **Historias de Usuario** conforme a la tabla de §Puntos que desaparecen.
- Requiere actualizar **NarrARA (principal) §17.1, §17.2, §18.2, §18.3, §19.2, §19.3** y el paso 6 del pipeline.
- Requiere actualizar **Consolidación** en los apartados correspondientes.
- **Complementa ADR-005:** comparte el criterio de retirar del MVP lo que no toca la contribución defendible.
- **Complementa ADR-006:** refuerza la línea de minimización de datos y mantiene el cupo de generación como control de coste.
- Afecta al alcance de **INC-05** (el modelo de datos pierde la entidad de usuario y gana el identificador de sesión).

---

## Cuestiones abiertas

- **Validación con la tutoría.** Bloqueante para la aceptación.
- Duración concreta de la cookie de sesión y política de purga de sesiones inactivas.
- Reformulación o retirada de **RNF-14**, que presupone un modelo de roles inexistente tras esta decisión.
- La plantilla canónica (`PLANTILLA-ADR.md`) no se ha aplicado literalmente. Debe reconciliarse antes de la aceptación formal.
