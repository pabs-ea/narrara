# NarrARA — Historias de Usuario

> **Documento de historias de usuario.** Derivadas del Catálogo de Requisitos (§17 del documento principal NarrARA v1.3.0). Formato: plantilla clásica *Como / quiero / para*, criterios de aceptación en **Gherkin** (Dado / Cuando / Entonces), priorización **MoSCoW** y **trazabilidad** a los requisitos funcionales (RF) y no funcionales (RNF).

---

## Control de versiones

| Versión | Fecha | Descripción |
|---------|------------|-------------|
| 1.0.0 | 2026-07-02 | Versión inicial. Historias de usuario derivadas del catálogo de requisitos del documento NarrARA v1.3.0, organizadas en 7 épicas. |

---

## Leyenda

- **Roles:** `Guest` (usuario anónimo), `Registrado` (usuario con cuenta), `Sistema` (comportamiento automático), `Admin/Dev` (operación y mantenimiento).
- **MoSCoW:** `Must` (imprescindible MVP), `Should` (importante, no bloquea MVP), `Could` (deseable), `Won't` (fuera de este alcance).
- **Trazabilidad:** referencia a los RF/RNF del catálogo (§17).

---

## Índice de épicas

1. **E1 — Acceso y cuentas** (registro, login, sesión guest, conversión)
2. **E2 — Perfiles de niño**
3. **E3 — Generación de cuentos** (el núcleo)
4. **E4 — Seguridad y adecuación del contenido**
5. **E5 — Lectura y consumo** (navegación, audio, modo niño, dislexia)
6. **E6 — Biblioteca e historial**
7. **E7 — Calidad, operación y observabilidad** (transversal / técnica)

---

## E1 — Acceso y cuentas

### HU-01 — Probar la aplicación sin registro
**Como** Guest, **quiero** generar un cuento sin tener que registrarme, **para** probar la aplicación antes de decidir si creo una cuenta.
**MoSCoW:** Must · **Traza:** RF-04, RNF-11

- **Dado** que soy un visitante sin cuenta, **cuando** accedo a la aplicación, **entonces** puedo introducir una idea y generar un cuento sin registrarme.
- **Dado** que soy Guest, **cuando** genero un cuento, **entonces** obtengo el texto y la moraleja pero **no** el audio.
- **Dado** que soy Guest, **cuando** cierro la aplicación, **entonces** los cuentos generados no se conservan (sin persistencia).

### HU-02 — Límite de uso para invitados
**Como** Sistema, **quiero** limitar a 2 generaciones por sesión de Guest, **para** proteger el coste de API y evitar abuso.
**MoSCoW:** Must · **Traza:** RF-04, RNF-05, RES-02

- **Dado** que soy Guest y no he generado cuentos, **cuando** genero uno, **entonces** el contador de generaciones consumidas aumenta en el servidor.
- **Dado** que he consumido mis 2 generaciones, **cuando** intento generar otro cuento, **entonces** el sistema me lo impide y me invita a registrarme.
- **Dado** que he consumido una generación, **cuando** borro ese cuento e intento generar otro, **entonces** la generación sigue contando (borrar no devuelve cupo).

> **Nota:** el mecanismo exacto de conteo (servidor + rate limiting) está en el backlog §19.3 del documento principal.

### HU-03 — Registro de cuenta
**Como** adulto, **quiero** registrarme con email y método de acceso, **para** desbloquear el pack completo de funcionalidades.
**MoSCoW:** Must · **Traza:** RF-01, RNF-01, RNF-02

- **Dado** que no tengo cuenta, **cuando** completo el registro con datos válidos, **entonces** se crea mi cuenta y quedo autenticado.
- **Dado** que introduzco un email ya registrado, **cuando** intento registrarme, **entonces** el sistema me avisa y no duplica la cuenta.
- **Dado** que me registro, **cuando** se almacena mi contraseña, **entonces** se guarda de forma cifrada (hash), nunca en claro.

### HU-04 — Inicio y cierre de sesión
**Como** Registrado, **quiero** iniciar y cerrar sesión, **para** acceder de forma segura a mis datos.
**MoSCoW:** Must · **Traza:** RF-01, RNF-02

- **Dado** que tengo cuenta, **cuando** introduzco credenciales válidas, **entonces** accedo a mi espacio con todas mis funcionalidades.
- **Dado** que introduzco credenciales inválidas, **cuando** intento entrar, **entonces** el acceso se deniega con un mensaje claro y sin revelar cuál dato falla.
- **Dado** que tengo sesión abierta, **cuando** cierro sesión, **entonces** mi sesión se invalida.

### HU-05 — Conversión de invitado a registrado conservando el trabajo
**Como** Guest que se registra, **quiero** conservar los cuentos que generé como invitado, **para** no perder lo que ya había creado.
**MoSCoW:** Should · **Traza:** RF-01, RF-11

- **Dado** que he generado cuentos como Guest, **cuando** completo el registro, **entonces** esos cuentos se migran a mi cuenta nueva.
- **Dado** que me acabo de convertir en Registrado, **cuando** entro en mi biblioteca, **entonces** veo los cuentos migrados.

> **Nota:** mecanismo de migración pendiente de definir (backlog §19.2).

---

## E2 — Perfiles de niño

### HU-06 — Crear perfil de niño
**Como** Registrado, **quiero** crear un perfil para mi hijo con sus datos (alias, edad, nivel lector, intereses, temas a evitar), **para** que los cuentos se adapten a él.
**MoSCoW:** Must · **Traza:** RF-02, RNF-01

- **Dado** que estoy registrado, **cuando** creo un perfil con alias y edad, **entonces** el perfil se guarda asociado a mi cuenta.
- **Dado** que creo un perfil, **cuando** introduzco los datos del niño, **entonces** solo se piden datos mínimos (alias en vez de nombre real).
- **Dado** que indico intereses y temas a evitar, **cuando** guardo el perfil, **entonces** esos valores quedan disponibles para la generación.

### HU-07 — Gestionar varios perfiles
**Como** Registrado, **quiero** gestionar varios perfiles de niño bajo mi cuenta, **para** atender a más de un hijo.
**MoSCoW:** Must · **Traza:** RF-03

- **Dado** que tengo varios hijos, **cuando** creo varios perfiles, **entonces** puedo mantenerlos simultáneamente.
- **Dado** que voy a generar un cuento, **cuando** selecciono el perfil, **entonces** el cuento usa las restricciones de ese perfil concreto.

### HU-08 — Editar y eliminar perfil
**Como** Registrado, **quiero** editar o eliminar un perfil, **para** mantenerlo actualizado a medida que el niño crece.
**MoSCoW:** Must · **Traza:** RF-02

- **Dado** que tengo un perfil, **cuando** edito su edad o nivel, **entonces** las siguientes generaciones usan los valores nuevos.
- **Dado** que ya no necesito un perfil, **cuando** lo elimino, **entonces** desaparece de mi cuenta.

### HU-09 — Configurar longitud y nivel por perfil
**Como** Registrado, **quiero** configurar la longitud del cuento (corto/medio/largo) y el nivel de dificultad por perfil, **para** ajustar la experiencia al niño (edad, ritmo, necesidades).
**MoSCoW:** Must · **Traza:** RF-02, RF-05

- **Dado** que edito un perfil, **cuando** elijo un preset de longitud, **entonces** ese preset se aplica a los cuentos de ese perfil.
- **Dado** que el perfil tiene una edad, **cuando** no ajusto la dificultad manualmente, **entonces** el sistema deriva el nivel de legibilidad automáticamente de la edad.
- **Dado** que quiero afinar, **cuando** ajusto la dificultad mediante el input del formulario, **entonces** se respeta mi ajuste por encima del valor automático.

### HU-10 — Activar modo dislexia por perfil
**Como** Registrado, **quiero** activar un modo dislexia en el perfil, **para** que el cuento se genere y se presente de forma más accesible.
**MoSCoW:** Should · **Traza:** RF-02, RF-05, RNF-11

- **Dado** que un perfil tiene el modo dislexia activo, **cuando** genero un cuento, **entonces** el texto usa frases cortas y vocabulario frecuente.
- **Dado** que el modo dislexia está activo, **cuando** leo el cuento, **entonces** la presentación aplica los ajustes de accesibilidad (tipografía, espaciado, tamaño, fondo).
- **Dado** que soy Guest, **cuando** pruebo la aplicación, **entonces** también puedo activar el modo dislexia como opción puntual (sin persistencia).

---

## E3 — Generación de cuentos (núcleo)

### HU-11 — Generar cuento a partir de una idea
**Como** usuario (Guest o Registrado), **quiero** introducir una idea (una frase o palabras sueltas) y obtener un cuento, **para** contar una historia personalizada.
**MoSCoW:** Must · **Traza:** RF-04, RF-05

- **Dado** que introduzco una frase o palabras sueltas, **cuando** solicito el cuento, **entonces** el sistema genera una historia basada en esa idea.
- **Dado** que soy Registrado y selecciono un perfil, **cuando** genero, **entonces** el cuento aplica las restricciones de ese perfil.
- **Dado** que la generación está en curso, **cuando** espero, **entonces** el sistema me informa del progreso.

### HU-12 — Cuento estructurado en páginas
**Como** usuario, **quiero** que el cuento se organice en páginas navegables, **para** leerlo de forma cómoda y por partes.
**MoSCoW:** Must · **Traza:** RF-05b, RF-15

- **Dado** que se ha generado un cuento, **cuando** lo abro, **entonces** se presenta dividido en páginas.
- **Dado** que estoy en una página, **cuando** avanzo o retrocedo, **entonces** navego a la página contigua.

### HU-13 — Verificación automática de adecuación del texto
**Como** Sistema, **quiero** verificar que el cuento cumple las restricciones de legibilidad, vocabulario y longitud, **para** garantizar que es apropiado para el perfil.
**MoSCoW:** Must · **Traza:** RF-06, RF-08, RNF-07

- **Dado** que se genera un cuento, **cuando** finaliza la generación, **entonces** el sistema verifica legibilidad y vocabulario sobre el cuento completo.
- **Dado** que una página supera la longitud máxima, **cuando** se verifica, **entonces** se activa el rebalanceo.
- **Dado** que tras el límite de reintentos no se cumplen las restricciones, **cuando** se agota el bucle, **entonces** el sistema informa al usuario en lugar de entregar contenido dudoso.

### HU-14 — Rebalanceo de páginas por longitud
**Como** Sistema, **quiero** redistribuir el exceso de longitud de una página hacia la siguiente, **para** que ninguna página quede demasiado densa.
**MoSCoW:** Must · **Traza:** RF-06b

- **Dado** que una página excede la longitud, **cuando** aplico el rebalanceo, **entonces** el exceso pasa a la página siguiente cortando por límites naturales (frase completa).
- **Dado** que el exceso llega a la última página y esta también se pasa, **cuando** no hay página siguiente, **entonces** se crea una página nueva al final.
- **Dado** que corto texto, **cuando** reubico, **entonces** nunca parto una palabra ni una frase a la mitad.

### HU-15 — Moraleja generada automáticamente
**Como** usuario, **quiero** que el cuento termine con una moraleja, **para** que el niño aprenda un valor.
**MoSCoW:** Must · **Traza:** RF-05

- **Dado** que el cuento está generado y validado, **cuando** se completa, **entonces** la IA deriva una moraleja del contenido del cuento.
- **Dado** que hay moraleja, **cuando** leo el cuento, **entonces** aparece en una página propia de cierre.
- **Dado** que se calcula la longitud del cuento, **cuando** se cuentan páginas y palabras, **entonces** la moraleja no entra en ese cómputo.

### HU-16 — Coherencia de la moraleja
**Como** Sistema, **quiero** verificar que la moraleja se desprende del cuento y no es genérica, **para** asegurar su calidad y pertinencia.
**MoSCoW:** Should · **Traza:** RF-06

- **Dado** que se ha generado la moraleja, **cuando** la verifico, **entonces** compruebo que existe y es breve.
- **Dado** que la moraleja podría ser genérica o incoherente, **cuando** la evalúo (LLM-as-judge), **entonces** se acepta solo si es coherente con la narrativa.

### HU-17 — Regenerar una variante
**Como** Registrado, **quiero** regenerar una variante de un cuento que me gustó, **para** obtener otra versión sin empezar de cero.
**MoSCoW:** Could · **Traza:** RF-13

- **Dado** que tengo un cuento, **cuando** pido una variante, **entonces** el sistema genera una nueva versión relacionada.
- **Dado** que genero variantes, **cuando** se producen, **entonces** el sistema evita repetir una trama casi idéntica.

---

## E4 — Seguridad y adecuación del contenido

### HU-18 — Sanitización y moderación del input
**Como** Sistema, **quiero** sanitizar y moderar la idea de entrada antes de generar, **para** cortar entradas inapropiadas o maliciosas en la puerta.
**MoSCoW:** Must · **Traza:** RF-07, RNF-03, RES-04

- **Dado** que un usuario introduce una idea, **cuando** la envía, **entonces** el sistema la sanitiza y la modera antes de generar.
- **Dado** que la idea es inapropiada, **cuando** se modera, **entonces** el sistema la rechaza y no gasta una generación.
- **Dado** que la idea contiene un intento de manipulación del modelo, **cuando** se sanitiza, **entonces** se neutraliza.

### HU-19 — Moderación final del contenido generado
**Como** Sistema, **quiero** moderar el cuento completo junto con la moraleja antes de mostrarlo, **para** que ningún contenido inapropiado llegue al niño.
**MoSCoW:** Must · **Traza:** RF-07, RNF-03, RES-04

- **Dado** que el cuento y la moraleja están listos, **cuando** finaliza el pipeline, **entonces** se moderan en una única pasada conjunta.
- **Dado** que la moderación detecta contenido inadecuado, **cuando** falla el control, **entonces** el cuento no se entrega y se informa al usuario.
- **Dado** que la moderación se supera, **cuando** todo es correcto, **entonces** el cuento se muestra.

### HU-20 — Protección de los datos del menor
**Como** adulto, **quiero** que los datos de mi hijo se traten con minimización y protección, **para** cumplir la normativa y proteger su privacidad.
**MoSCoW:** Must · **Traza:** RNF-01, RES-04

- **Dado** que creo un perfil, **cuando** introduzco datos, **entonces** solo se solicitan los mínimos necesarios (alias, no datos identificativos innecesarios).
- **Dado** que se almacenan datos, **cuando** se transmiten, **entonces** viajan cifrados.

---

## E5 — Lectura y consumo

### HU-21 — Navegar el cuento página a página
**Como** usuario, **quiero** avanzar y retroceder por las páginas del cuento, **para** leerlo a mi ritmo.
**MoSCoW:** Must · **Traza:** RF-15, RF-05b

- **Dado** que abro un cuento, **cuando** pulso siguiente/anterior, **entonces** navego entre páginas.
- **Dado** que estoy en la última página, **cuando** avanzo, **entonces** llego a la página de moraleja.

### HU-22 — Escuchar la narración por voz
**Como** Registrado, **quiero** escuchar el cuento narrado por página, **para** que mi hijo lo disfrute también en audio.
**MoSCoW:** Should · **Traza:** RF-09, RNF-04

- **Dado** que soy Registrado, **cuando** abro un cuento, **entonces** dispongo de la narración por voz de cada página.
- **Dado** que estoy en una página, **cuando** reproduzco el audio, **entonces** se narra el texto de esa página.
- **Dado** que el texto ya está visible, **cuando** el audio aún se genera, **entonces** puedo leer sin esperar a que el audio esté listo.
- **Dado** que soy Guest, **cuando** abro un cuento, **entonces** el audio no está disponible y se me invita a registrarme.

### HU-23 — Modo de consumo simplificado para el niño
**Como** adulto, **quiero** un modo de lectura simplificado y supervisado, **para** que mi hijo maneje lo justo (play/pausa, pasar página) sin riesgo.
**MoSCoW:** Should · **Traza:** RF-16, RNF-11

- **Dado** que activo el modo niño, **cuando** el niño usa la pantalla, **entonces** solo ve controles grandes (play/pausa, pasar página).
- **Dado** que estoy en modo niño, **cuando** el niño interactúa, **entonces** no hay acciones destructivas ni entrada de texto accesibles.

### HU-24 — Presentación accesible (modo dislexia y lectura nocturna)
**Como** usuario, **quiero** una presentación accesible y de bajo estímulo, **para** cuidar la lectura en el momento del cuento.
**MoSCoW:** Should · **Traza:** RNF-11, RNF-12

- **Dado** que el modo dislexia está activo, **cuando** leo, **entonces** se aplican tipografía sans-serif, tamaño grande, espaciado aumentado, alineación izquierda y fondo no blanco.
- **Dado** que es de noche, **cuando** activo la lectura nocturna, **entonces** la interfaz reduce el estímulo visual.

---

## E6 — Biblioteca e historial

### HU-25 — Consultar y releer cuentos guardados
**Como** Registrado, **quiero** consultar mi biblioteca de cuentos, **para** releer los que ya creé.
**MoSCoW:** Must · **Traza:** RF-11

- **Dado** que soy Registrado, **cuando** abro mi biblioteca, **entonces** veo los cuentos que he guardado.
- **Dado** que elijo un cuento guardado, **cuando** lo abro, **entonces** puedo releerlo con su navegación y audio.

### HU-26 — Borrar cuentos
**Como** Registrado, **quiero** borrar cuentos de mi biblioteca, **para** mantenerla ordenada.
**MoSCoW:** Should · **Traza:** RF-11

- **Dado** que tengo un cuento guardado, **cuando** lo borro, **entonces** desaparece de mi biblioteca.

### HU-27 — Marcar favoritos
**Como** Registrado, **quiero** marcar cuentos como favoritos, **para** encontrarlos rápido.
**MoSCoW:** Could · **Traza:** RF-13

- **Dado** que tengo cuentos, **cuando** marco uno como favorito, **entonces** queda destacado y filtrable.

### HU-28 — Evitar cuentos duplicados
**Como** Sistema, **quiero** evitar guardar tramas casi idénticas, **para** que la biblioteca aporte variedad.
**MoSCoW:** Could · **Traza:** RF-12

- **Dado** que genero un cuento muy similar a otro existente, **cuando** se compara (embeddings), **entonces** el sistema lo detecta y evita la duplicación.

---

## E7 — Calidad, operación y observabilidad (transversal)

### HU-29 — Degradación elegante ante fallos de IA
**Como** usuario, **quiero** que la aplicación no se rompa si un proveedor de IA falla, **para** tener siempre una respuesta clara.
**MoSCoW:** Must · **Traza:** RNF-06, RNF-07

- **Dado** que un proveedor de IA no responde, **cuando** falla, **entonces** el sistema reintenta y, si no es posible, muestra un mensaje claro sin colgarse.

### HU-30 — Proveedores de IA intercambiables
**Como** Admin/Dev, **quiero** poder cambiar de proveedor de IA sin tocar el dominio, **para** no depender de un único servicio.
**MoSCoW:** Must · **Traza:** RNF-08

- **Dado** que un puerto de IA tiene varios adaptadores, **cuando** cambio la configuración, **entonces** el sistema usa otro proveedor sin cambios en la lógica de dominio.

### HU-31 — Observabilidad del pipeline
**Como** Admin/Dev, **quiero** métricas y logs del proceso de generación, **para** monitorizar calidad, coste y latencia.
**MoSCoW:** Should · **Traza:** RNF-10, RF-14

- **Dado** que se genera un cuento, **cuando** finaliza, **entonces** se registran métricas (aprobación al primer intento, reintentos, latencia, coste).
- **Dado** que ocurre un evento relevante, **cuando** sucede, **entonces** queda en un log estructurado.

### HU-32 — Auditoría interna de decisiones
**Como** Admin/Dev, **quiero** registrar los veredictos de verificación y moderación de cada cuento, **para** poder auditar por qué se aprobó o rechazó.
**MoSCoW:** Should · **Traza:** RF-14, RNF-03

- **Dado** que un cuento pasa por el pipeline, **cuando** se decide aprobarlo o rechazarlo, **entonces** el veredicto se persiste internamente.

### HU-33 — Despliegue reproducible
**Como** Admin/Dev, **quiero** un despliegue contenerizado y configurable por entorno, **para** desplegar de forma fiable.
**MoSCoW:** Must · **Traza:** RNF-13

- **Dado** que despliego la aplicación, **cuando** uso los contenedores, **entonces** el entorno se levanta de forma reproducible con su configuración externalizada.

---

## Resumen de priorización MoSCoW

| MoSCoW | Historias |
|--------|-----------|
| **Must** | HU-01, HU-02, HU-03, HU-04, HU-06, HU-07, HU-08, HU-09, HU-11, HU-12, HU-13, HU-14, HU-15, HU-18, HU-19, HU-20, HU-21, HU-25, HU-29, HU-30, HU-33 |
| **Should** | HU-05, HU-10, HU-16, HU-22, HU-23, HU-24, HU-26, HU-31, HU-32 |
| **Could** | HU-17, HU-27, HU-28 |
| **Won't (este alcance)** | Ilustraciones, export EPUB/audiolibro, modo colaborativo, series, voces personalizadas, panel educadores, multi-idioma |

---

## Notas de trazabilidad inversa (cobertura de requisitos)

- **RF-01** → HU-03, HU-04, HU-05
- **RF-02** → HU-06, HU-08, HU-09, HU-10
- **RF-03** → HU-07
- **RF-04** → HU-01, HU-02, HU-11
- **RF-05 / RF-05b** → HU-09, HU-11, HU-12
- **RF-06 / RF-06b** → HU-13, HU-14
- **RF-07** → HU-18, HU-19
- **RF-08** → HU-13
- **RF-09** → HU-22
- **RF-10** → (ampliación, Won't)
- **RF-11** → HU-05, HU-25, HU-26
- **RF-12** → HU-28
- **RF-13** → HU-17, HU-27
- **RF-14** → HU-31, HU-32
- **RF-15** → HU-12, HU-21
- **RF-16** → HU-23
- **RNF-01** → HU-03, HU-06, HU-20
- **RNF-02** → HU-03, HU-04
- **RNF-03** → HU-18, HU-19, HU-32
- **RNF-04** → HU-22
- **RNF-05** → HU-02
- **RNF-06 / RNF-07** → HU-13, HU-29
- **RNF-08** → HU-30
- **RNF-10** → HU-31
- **RNF-11** → HU-01, HU-10, HU-23, HU-24
- **RNF-12** → HU-24
- **RNF-13** → HU-33
- **RNF-14** → (preparación técnica; sin HU de usuario final en el MVP)
