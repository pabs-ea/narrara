# NarrARA — Diseño UX: Mapa de pantallas, flujo y briefs para Stitch

> **Documento de diseño UX.** Material derivado de las Historias de Usuario (v1.0.0) para generar las pantallas en Stitch. Contiene: (1) inventario completo de vistas, (2) flujo de usuario que las conecta, y (3) un brief/prompt por pantalla listo para pegar en Stitch.
>
> **Cómo usarlo:** copia el bloque "PROMPT PARA STITCH" de cada pantalla y pégalo en la herramienta. Los briefs son autónomos; incluyen propósito, elementos, estados y accesibilidad. Ajusta según lo que devuelva Stitch y lo revisamos juntos.

---

## Control de versiones

| Versión | Fecha | Descripción |
|---------|------------|-------------|
| 1.0.0 | 2026-07-02 | Versión inicial. Mapa de pantallas, flujo de usuario y briefs para Stitch, derivados de las Historias de Usuario v1.0.0. Alcance MVP (Must + Should relevantes para UX). |
| 1.1.0 | 2026-07-02 | Corregido el enfoque de plataforma: se elimina el "mobile-first" (no acordado) y se adopta **aplicación web responsive con desktop como referencia de diseño** y comportamiento responsive impecable en móvil, resuelto en implementación (Next.js + CSS). Añadida sección de estrategia responsive con el comportamiento de adaptación por pantalla. |

---

## Principios de diseño transversales (aplican a TODAS las pantallas)

Incluye estas notas en cualquier prompt de Stitch, o téngalas presentes al revisar:

- **Doble registro visual:** interfaz **sobria y funcional** para el adulto (gestión, formularios); interfaz **cálida y de bajo estímulo** para el momento del cuento (lectura, consumo). El cambio de tono debe notarse entre el panel y el lector.
- **Accesibilidad base (WCAG):** contraste suficiente, targets táctiles amplios, foco visible, navegación por teclado, textos alternativos.
- **Modo dislexia (activable):** fuente sans-serif (Verdana/Open Sans), tamaño ≥18px, espaciado de letras +30-35%, interlineado amplio, alineación izquierda sin justificar, líneas cortas, **fondo crema/pastel en vez de blanco**. No imponer OpenDyslexic; ofrecerlo solo como opción.
- **Modo lectura nocturna:** variante de bajo estímulo (tonos apagados, brillo reducido) para el lector de cuentos.
- **Español** como idioma de interfaz.
- **Aplicación web responsive, desktop como referencia:** se diseña y se genera en Stitch pensando en **desktop**, pero la app debe ser **perfectamente responsive** al accederse desde móvil o tablet. El responsive se resuelve en implementación (Next.js + CSS), no en Stitch. Ver la estrategia de adaptación en la sección "Estrategia responsive".
- **Estados siempre visibles:** cada pantalla con acciones asíncronas debe contemplar estados de carga, vacío, error y éxito.

---

## Estrategia responsive (comportamiento en móvil/tablet)

Se diseña en desktop, pero cada patrón debe adaptarse así al reducir el ancho:

- **Navegación:** barra superior/lateral en desktop → menú compacto o barra inferior en móvil.
- **P05 Crear cuento:** opciones en fila/columnas en desktop → apiladas verticalmente en móvil; el campo de idea siempre prominente.
- **P08 Lector de cuento:** texto centrado con márgenes amplios en desktop → a pantalla completa con controles al alcance del pulgar en móvil. Los controles de navegación (anterior/siguiente) pasan a los laterales o a la zona inferior en móvil.
- **P09 Modo niño:** los botones grandes se hacen aún más dominantes en móvil; layout a pantalla completa en ambos.
- **P10 Biblioteca:** cuadrícula de varias columnas en desktop → 1-2 columnas o lista en móvil.
- **P11/P12 Perfiles:** tarjetas en fila en desktop → apiladas en móvil; formularios a una columna siempre.
- **Formularios (P02, P03, P12, P13):** una sola columna en ambos; en desktop centrados con ancho máximo acotado para no estirar los campos.
- **Targets táctiles:** en móvil, mínimo 44×44px; los controles del lector y del modo niño, mayores.
- **Breakpoints de referencia:** móvil <640px, tablet 640-1024px, desktop >1024px (orientativos para implementación).

---

## 1. Mapa de pantallas (inventario de vistas)

### Bloque A — Entrada y acceso
- **P01 — Landing / Home pública** (punto de entrada; permite probar sin registro)
- **P02 — Registro**
- **P03 — Inicio de sesión**
- **P04 — Muro de conversión** (aparece al agotar el cupo guest)

### Bloque B — Creación de cuentos (núcleo)
- **P05 — Crear cuento** (entrada de idea + opciones)
- **P06 — Generación en progreso** (estado de espera del pipeline)
- **P07 — Error / degradación elegante** (cuando falla verificación, moderación o proveedor)

### Bloque C — Lectura y consumo
- **P08 — Lector de cuento (modo adulto)** (navegación por páginas + audio si registrado)
- **P09 — Lector modo niño** (consumo simplificado supervisado)

### Bloque D — Gestión (solo registrado)
- **P10 — Biblioteca** (lista de cuentos guardados)
- **P11 — Gestión de perfiles** (lista de perfiles de niño)
- **P12 — Crear / editar perfil** (formulario con longitud, dificultad, dislexia)

### Bloque E — Transversal
- **P13 — Ajustes de cuenta** (datos, preferencias, cierre de sesión)

> **Total MVP: 13 pantallas.** Las pantallas P09 (modo niño), y las de gestión P10-P13 pueden considerarse una segunda tanda si se quiere priorizar el flujo nuclear primero (P01→P05→P06→P08 + acceso P02/P03/P04).

---

## 2. Flujo de usuario (qué lleva a qué)

### Flujo Guest (sin registro)
```
P01 Landing
  └─(Probar / escribir idea)→ P05 Crear cuento
        └─(Generar)→ P06 Generación en progreso
              ├─(éxito)→ P08 Lector (modo adulto, SIN audio)
              │             └─(intentar audio)→ P04 Muro de conversión
              │             └─(generar otro, cupo disponible)→ P05
              │             └─(generar otro, cupo agotado)→ P04 Muro de conversión
              └─(fallo)→ P07 Error / degradación
P04 Muro de conversión → P02 Registro
```

### Flujo de registro / acceso
```
P01 Landing → P02 Registro → (éxito, migra cuentos guest)→ P10 Biblioteca
P01 Landing → P03 Login → (éxito)→ P10 Biblioteca
P02 Registro ⇄ P03 Login (enlaces cruzados "¿ya tienes cuenta?/crear cuenta")
```

### Flujo Registrado (pack completo)
```
P10 Biblioteca
  ├─(nuevo cuento)→ P05 Crear cuento
  │      └─(seleccionar perfil)→ [usa P11/P12 si no hay perfil]
  │      └─(generar)→ P06 → P08 Lector (CON audio) / P07 Error
  ├─(abrir cuento guardado)→ P08 Lector
  │      └─(modo niño)→ P09 Lector modo niño
  ├─(perfiles)→ P11 Gestión de perfiles
  │      └─(crear/editar)→ P12 Crear/editar perfil
  └─(ajustes)→ P13 Ajustes de cuenta → (cerrar sesión)→ P01
```

### Flujo de consumo modo niño
```
P08 Lector (adulto) →(activar modo niño)→ P09 Lector modo niño
  └─(solo play/pausa y pasar página; sin salidas destructivas)
  └─(salir del modo niño requiere acción del adulto)→ P08
```

---

## 3. Briefs por pantalla (prompts para Stitch)

---

### P01 — Landing / Home pública
**Historias:** HU-01, HU-11 · **Rol:** Guest

**PROMPT PARA STITCH:**
> Diseña una landing page (aplicación web responsive, desktop como referencia) para una app de generación de cuentos infantiles personalizados con IA. Tono cálido, acogedor e infantil pero cuidado (no infantiloide). Objetivo: que un padre o madre entienda en segundos qué hace la app y pueda **probarla sin registrarse**.
> Elementos: un título breve con la propuesta de valor ("Crea cuentos únicos para tus hijos"), un subtítulo que mencione que es personalizable y gratis para probar, un **campo de entrada destacado para escribir una idea o unas palabras** ("Escribe una idea: una zorra valiente, el bosque, la luna...") con un botón principal "Crear cuento". Debajo, de forma secundaria, enlaces "Iniciar sesión" y "Registrarse". Una sección breve de 3 beneficios con iconos (personalizado por edad, con valores/moraleja, accesible/modo dislexia).
> Estados: campo vacío (con placeholder de ejemplo), campo con texto.
> Accesibilidad: alto contraste, botón grande, texto legible. Incluye una variante con **modo dislexia** activado (fuente sans-serif, mayor espaciado, fondo crema).

---

### P02 — Registro
**Historias:** HU-03, HU-05 · **Rol:** Guest→Registrado

**PROMPT PARA STITCH:**
> Diseña una pantalla de registro (aplicación web responsive, desktop como referencia), sobria y de confianza, para la misma app de cuentos infantiles. Objetivo: crear cuenta para desbloquear el pack completo (audio, biblioteca, perfiles).
> Elementos: campos de email y contraseña (con indicador de fortaleza), opción de registro con proveedor social como alternativa, botón principal "Crear cuenta", enlace "¿Ya tienes cuenta? Inicia sesión". Un mensaje sutil que indique "Conservaremos los cuentos que ya has creado" (migración desde guest). Nota breve de privacidad/protección de datos.
> Estados: formulario vacío, validación de email inválido, email ya registrado (mensaje de error), carga tras enviar.
> Accesibilidad: labels visibles, errores claros y asociados a cada campo, foco visible.

---

### P03 — Inicio de sesión
**Historias:** HU-04 · **Rol:** Registrado

**PROMPT PARA STITCH:**
> Diseña una pantalla de inicio de sesión (aplicación web responsive, desktop como referencia), sobria, coherente con la de registro.
> Elementos: campos de email y contraseña, botón "Entrar", enlace "¿No tienes cuenta? Regístrate", enlace "¿Olvidaste tu contraseña?".
> Estados: vacío, credenciales inválidas (mensaje genérico que no revele qué dato falla), carga.
> Accesibilidad: labels visibles, foco visible, errores claros.

---

### P04 — Muro de conversión
**Historias:** HU-02, HU-05, HU-22 · **Rol:** Guest

**PROMPT PARA STITCH:**
> Diseña una pantalla-muro (o modal a pantalla completa) que aparece cuando un usuario invitado ha **agotado sus 2 cuentos de prueba** o intenta usar el audio (función exclusiva de registrados). Tono positivo y motivador, no punitivo.
> Elementos: mensaje claro ("Has usado tus 2 cuentos de prueba" o "El audio narrado es para usuarios registrados"), lista corta de lo que se desbloquea al registrarse (audio narrado, biblioteca, perfiles, cuentos ilimitados de prueba), botón principal "Registrarse gratis", enlace secundario "Ya tengo cuenta". Refuerzo de que conservará los cuentos ya creados.
> Estados: variante "cupo agotado" y variante "función bloqueada (audio)".
> Accesibilidad: jerarquía clara, botón grande, contraste alto.

---

### P05 — Crear cuento
**Historias:** HU-09, HU-10, HU-11 · **Rol:** Guest / Registrado

**PROMPT PARA STITCH:**
> Diseña la pantalla principal de creación de cuento (aplicación web responsive, desktop como referencia). Es el corazón de la app. Objetivo: que el usuario introduzca una idea y ajuste unas pocas opciones antes de generar.
> Elementos: campo de texto amplio para la idea ("Escribe una idea o unas palabras sueltas"), selector de **longitud** con 3 opciones (Corto / Medio / Largo), un **toggle de modo dislexia**. Para usuarios **registrados**: además un **selector de perfil de niño** (con avatares/alias) y un enlace "crear perfil" si no hay ninguno, y un control opcional para **ajustar la dificultad** (deslizador o selector por edad) que por defecto se deriva del perfil. Botón principal grande "Crear cuento".
> Muestra dos variantes: (a) vista **Guest** (sin selector de perfil, con nota "Regístrate para guardar y añadir voz"), (b) vista **Registrado** (con selector de perfil y ajuste de dificultad).
> Estados: idea vacía (botón deshabilitado o con aviso suave), opciones seleccionadas.
> Accesibilidad: controles grandes y etiquetados; variante con modo dislexia activo (sans-serif, espaciado, fondo crema).

---

### P06 — Generación en progreso
**Historias:** HU-11, HU-13 · **Rol:** Guest / Registrado

**PROMPT PARA STITCH:**
> Diseña una pantalla de espera/carga mientras la IA genera el cuento. Debe transmitir que "algo mágico está pasando" y hacer amena la espera (la generación puede tardar decenas de segundos). Tono cálido e infantil.
> Elementos: una animación o ilustración central evocadora (libro que se escribe solo, estrellas, etc.), un texto de progreso que va cambiando por fases ("Imaginando la historia...", "Cuidando las palabras...", "Preparando la moraleja..."), una barra o indicador de progreso. Sin botones de acción salvo un discreto "cancelar".
> Estados: fases sucesivas del progreso.
> Accesibilidad: no depender solo de animación; texto de estado legible; respetar "reduce motion".

---

### P07 — Error / degradación elegante
**Historias:** HU-13, HU-19, HU-29 · **Rol:** Guest / Registrado

**PROMPT PARA STITCH:**
> Diseña una pantalla de error amable para cuando el cuento no se puede entregar (no cumple los controles de calidad/seguridad tras los reintentos, o un servicio no responde). Nada alarmante; tono tranquilizador.
> Elementos: ilustración suave, mensaje claro y honesto ("No hemos podido crear un cuento adecuado esta vez"), explicación breve y no técnica, botón principal "Volver a intentarlo" y botón secundario "Cambiar la idea". Si aplica, nota de que no se ha consumido cupo (si decidís no cobrar el intento fallido).
> Estados: variante "no pasó los controles de calidad/seguridad" y variante "problema técnico temporal".
> Accesibilidad: mensaje claro, sin jerga, contraste alto.

---

### P08 — Lector de cuento (modo adulto)
**Historias:** HU-12, HU-15, HU-21, HU-22, HU-24 · **Rol:** Guest / Registrado

**PROMPT PARA STITCH:**
> Diseña el lector de cuento (aplicación web responsive, desktop como referencia), para el momento de leer/contar la historia. Tono cálido, inmersivo y de **bajo estímulo**. Es la pantalla más importante de consumo.
> Elementos: el texto de la **página actual** bien legible y centrado, controles de **navegación anterior/siguiente**, un **indicador de página** (ej. "3 / 6"), un **control de reproducción de audio** (play/pausa) por página **solo visible para registrados**. Acceso a un botón para **entrar en modo niño**. La **última página muestra la moraleja** de forma destacada y diferenciada visualmente (icono, marco especial). Botón sutil para volver a la biblioteca o crear otro cuento.
> Muestra variantes: (a) página normal del cuento, (b) **página de moraleja** (destacada), (c) versión **Guest** sin controles de audio (con invitación sutil a registrarse para escuchar), (d) versión con **modo dislexia** activo, (e) versión **lectura nocturna**.
> Estados: audio en reproducción / pausado / generándose.
> Accesibilidad: texto grande, alto contraste, controles amplios; en modo dislexia aplicar sans-serif, espaciado +35%, interlineado amplio, alineación izquierda, fondo crema; respetar navegación por teclado.

---

### P09 — Lector modo niño
**Historias:** HU-23 · **Rol:** Niño (supervisado)

**PROMPT PARA STITCH:**
> Diseña una variante ultra-simplificada del lector, pensada para que un niño pequeño la maneje con un adulto al lado. Máxima simplicidad y seguridad.
> Elementos: solo el texto de la página (grande) y/o la ilustración, un **botón enorme de play/pausa**, y **flechas grandes** para pasar página. **Sin** menús, sin campos de texto, sin botones de borrar/compartir/ajustes, sin nada destructivo. Salir del modo niño debe requerir un gesto deliberado del adulto (ej. mantener pulsado, o un candado).
> Estados: reproduciendo / pausado; primera y última página.
> Accesibilidad: targets muy grandes, altísimo contraste, cero elementos que distraigan o permitan salir por accidente.

---

### P10 — Biblioteca
**Historias:** HU-25, HU-26, HU-27 · **Rol:** Registrado

**PROMPT PARA STITCH:**
> Diseña la biblioteca de cuentos del usuario registrado (aplicación web responsive, desktop como referencia). Es la pantalla de inicio tras iniciar sesión. Tono cálido pero ordenado.
> Elementos: una cuadrícula o lista de **tarjetas de cuento** (cada una con título, un color/portada generada, el perfil al que pertenece, e indicador de favorito), un botón principal destacado "Crear nuevo cuento", acceso a perfiles y ajustes (barra de navegación inferior o superior), y un **filtro por perfil o favoritos**. Cada tarjeta permite abrir, marcar favorito y borrar.
> Estados: **biblioteca con cuentos**, **estado vacío** (mensaje motivador "Aún no tienes cuentos, crea el primero" con botón), acción de borrado con confirmación.
> Accesibilidad: tarjetas con buen contraste, acciones etiquetadas, confirmación antes de borrar.

---

### P11 — Gestión de perfiles
**Historias:** HU-06, HU-07, HU-08 · **Rol:** Registrado

**PROMPT PARA STITCH:**
> Diseña la pantalla de gestión de perfiles de niño (aplicación web responsive, desktop como referencia). Objetivo: ver y administrar los perfiles de los hijos.
> Elementos: lista de **tarjetas de perfil** (avatar/alias, edad, indicador de modo dislexia si está activo), botón "Añadir perfil", y en cada tarjeta acciones de editar y eliminar.
> Estados: **con perfiles**, **estado vacío** (mensaje "Crea el perfil de tu hijo para personalizar los cuentos"), confirmación de borrado.
> Accesibilidad: targets amplios, acciones claras, confirmación destructiva.

---

### P12 — Crear / editar perfil
**Historias:** HU-06, HU-08, HU-09, HU-10 · **Rol:** Registrado

**PROMPT PARA STITCH:**
> Diseña el formulario de creación/edición de perfil de niño (aplicación web responsive, desktop como referencia), sencillo y no intimidante.
> Elementos: campo de **alias** (no nombre real, con nota de privacidad), selector de **edad**, selección de **intereses** (chips seleccionables: animales, espacio, piratas, dinosaurios...), campo de **temas a evitar**, selector de **longitud por defecto** (Corto/Medio/Largo), control de **nivel de dificultad** (que por defecto se deriva de la edad, con opción de ajustarlo manualmente), y un **toggle de modo dislexia**. Botón "Guardar perfil".
> Estados: creación (campos vacíos), edición (campos rellenos), validación de campos obligatorios.
> Accesibilidad: labels claras, chips accesibles por teclado, ayuda contextual breve; nota de que se piden datos mínimos.

---

### P13 — Ajustes de cuenta
**Historias:** HU-04, HU-20 · **Rol:** Registrado

**PROMPT PARA STITCH:**
> Diseña una pantalla de ajustes de cuenta, sobria y funcional (aplicación web responsive, desktop como referencia).
> Elementos: datos de la cuenta (email), preferencias globales (modo lectura nocturna por defecto, idioma), sección de privacidad/datos (con opción de exportar o eliminar datos, en línea con RGPD), y un botón claro de **cerrar sesión**. Sección "acerca de" discreta.
> Estados: vista normal; confirmación al eliminar cuenta/datos.
> Accesibilidad: agrupación lógica, controles etiquetados, acciones destructivas con confirmación.

---

## 4. Notas para la revisión conjunta (tras generar en Stitch)

Al traer los diseños, revisaremos:
- **Coherencia con las historias:** que cada pantalla cubra los criterios de aceptación de sus HU.
- **Estados completos:** que no falte el estado vacío, de carga o de error donde aplique.
- **Los dos registros visuales:** que el contraste adulto/niño y sobrio/cálido se note.
- **Accesibilidad real:** contraste, tamaños, y que el modo dislexia esté bien resuelto (no como simple cambio de fuente).
- **Gaps del backlog:** algunas decisiones (límites del plan de pago, migración) afectan a P04/P10 y pueden requerir ajuste cuando se cierren.

---

## 5. Orden sugerido de diseño en Stitch

Para avanzar por prioridad (flujo nuclear primero):

1. **Tanda 1 (flujo nuclear demostrable):** P01 → P05 → P06 → P08 → P07 (+ P02, P03, P04 para el acceso).
2. **Tanda 2 (gestión registrado):** P10 → P11 → P12 → P13.
3. **Tanda 3 (consumo especial):** P09 (modo niño).
