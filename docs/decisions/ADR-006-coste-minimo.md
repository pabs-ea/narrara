# ADR-006 — Estrategia de coste mínimo y minimización de datos en las llamadas a IA

- **Versión:** v1.0.0
- **Fecha:** 2026-08-25
- **Estado:** ✅ **Aceptada** · **Fecha de aceptación:** 2026-08-25
- **Decisores:** autor del TFM
- **Relacionado con:** NarrARA (principal) §5, §17.2, §17.3 (RES-02, RES-04); Consolidación §3.2, §3.5; ADR-002; ADR-005; INC-02, INC-04, INC-05

---

## Contexto

NarrARA es un **TFM**, no un producto comercial. El escenario más probable es que el proyecto no continúe más allá de la defensa. Bajo esa premisa, **cualquier gasto recurrente es difícil de justificar**: no hay ingresos que lo compensen ni horizonte de explotación que lo amortice. La restricción RES-02 ("presupuesto limitado de llamadas a API") resulta insuficiente: el objetivo real es **coste operativo prácticamente nulo**, tanto en despliegue como en consumo de IA.

Esta restricción entra en tensión con otra restricción dura del proyecto. Las capas gratuitas de los proveedores de IA suelen reservarse el derecho a **usar las entradas y salidas para mejorar sus modelos**. NarrARA genera contenido a partir del perfil de un **menor** (edad, intereses, necesidades de accesibilidad), y **RES-04** establece el marco legal y ético con menores como restricción dura, con requisitos de RGPD asociados.

El conflicto es directo: la opción de coste cero es precisamente la que ofrece menos garantías sobre el tratamiento de los datos enviados. Resolverlo exige decidir **qué información viaja al proveedor de IA**.

---

## Decisión

### 1. Coste operativo objetivo: cero

- **Despliegue:** capa gratuita de Vercel para la aplicación (ADR-005) y capa gratuita de un Postgres gestionado con soporte de `pgvector` (Neon o Supabase) para la persistencia de INC-05. Se aceptan sus limitaciones conocidas: almacenamiento reducido, suspensión por inactividad con arranque en frío y backups limitados.
- **LLM:** se diseña contra los **modelos de gama Flash / Flash-Lite** del nivel gratuito, **nunca contra modelos de gama Pro**, cuyos cupos diarios son incompatibles con un uso demostrable.
- **TTS:** la implementación por defecto es la **Web Speech API del navegador**, que se ejecuta en el cliente con coste cero. Un adaptador de TTS en la nube queda como implementación alternativa, activable solo si se dispone de presupuesto.
- **Moderación:** se prioriza el uso de endpoints de moderación sin coste cuando el proveedor los ofrezca.
- **Desarrollo y CI:** el desarrollo se realiza contra **adaptadores fake** (INC-02) y los tests emplean *fixtures*; **la integración continua nunca invoca APIs reales**. El consumo de cupo se limita a la validación manual y a la demostración.
- **Cupos de uso:** todos los planes, incluido el de usuario registrado, tienen **límite máximo explícito**. No existe la opción "ilimitado".

### 2. Minimización de datos: el proveedor de IA no recibe datos personales

**Regla rectora:** *al proveedor de IA solo viajan **parámetros derivados**, nunca atributos del perfil del menor.*

- **No se envía:** nombre del niño, edad exacta, ni la etiqueta de **modo dislexia** u otra necesidad de accesibilidad (potencial categoría especial del art. 9 RGPD).
- **Sí se envía:** **rango de edad**, longitud objetivo y número de páginas, y las **restricciones textuales derivadas** (rango de legibilidad objetivo, longitud media de frase, vocabulario de alta frecuencia). Son datos funcionalmente necesarios y no identificativos.
- **La traducción perfil → parámetros ocurre aguas arriba**, en la capa de Use Cases, coherente con SPEC-01 §7. El adaptador de IA construye el prompt **exclusivamente** con los parámetros recibidos; no tiene acceso al perfil.

### 3. Entrada de texto libre: transparencia, no filtrado

La idea inicial que introduce el usuario es **contenido creativo**, y un nombre en ella **no es necesariamente un dato personal**: puede ser un personaje inventado ("el dragón Sylvan"). No es técnicamente fiable distinguir un nombre real de uno ficticio, y un filtro que lo intentara produciría falsos positivos que degradarían el producto.

Por tanto:
- **No se implementa detección ni supresión de nombres** en la entrada libre.
- Se informa al usuario, en la interfaz, de que el texto introducido se envía a un proveedor externo y de que **no debe incluir datos personales reales**.
- La sanitización del paso 0 del pipeline mantiene su propósito original (seguridad y moderación del input), **no** el de anonimizar.

---

## Justificación

- **Coherencia con la naturaleza del proyecto:** un TFM sin continuidad prevista no debe generar obligaciones económicas. El coste cero es la opción alineada con el ciclo de vida real del trabajo.
- **Resuelve el conflicto RES-02 / RES-04 sin sacrificar ninguno:** la minimización de datos permite usar la capa gratuita **sin** exponer información del menor, en lugar de elegir entre coste y ética.
- **La garantía es verificable, no declarativa:** que el prompt se construya solo con parámetros derivados se comprueba inspeccionando el código del adaptador. Es una afirmación auditable, no una promesa.
- **Aprovecha la arquitectura ya decidida:** SPEC-01 §7 ya situaba la traducción de perfil a parámetros aguas arriba. Esta decisión no añade complejidad: formaliza y da valor a una separación que ya existía.
- **La Web Speech API cubre dos objetivos a la vez:** elimina el mayor sumidero de coste (el TTS se factura por carácter y un cuento son varias páginas) **y** aporta el segundo adaptador que exige **RNF-08** (≥2 implementaciones de una interfaz de servicio), demostrando intercambiabilidad real sin gasto.
- **Honestidad sobre el alcance de la protección:** prometer solo lo que se puede garantizar técnicamente —y cubrir el resto con información previa— es más defendible que un filtrado que aparenta una seguridad que no existe.

---

## Alternativas consideradas

### Nivel de pago del proveedor de IA (o Vertex AI) para evitar el uso de datos en entrenamiento
- **A favor:** garantías contractuales sobre el tratamiento de datos; sin límites de cupo estrictos.
- **En contra:** gasto recurrente sin retorno en un proyecto sin continuidad prevista; contradice el objetivo de coste cero.
- **Motivo del descarte:** la minimización de datos alcanza el mismo objetivo de protección sin coste. Si en el futuro el proyecto se explotara, este sería el camino natural.

### Filtrado automático de datos personales en la entrada libre
- **A favor:** protección aparentemente más amplia.
- **En contra:** imposible distinguir de forma fiable un nombre real de un personaje ficticio; los falsos positivos degradarían la experiencia central del producto.
- **Motivo del descarte:** coste alto, fiabilidad baja y daño funcional; se sustituye por transparencia.

### TTS en la nube como implementación por defecto
- **A favor:** calidad de voz notablemente superior.
- **En contra:** facturación por carácter sobre textos largos y multipágina; es el principal riesgo de gasto del proyecto.
- **Motivo del descarte:** incompatible con el objetivo de coste cero. Queda como adaptador alternativo.

---

## Consecuencias

**Positivas:**
- Coste operativo previsible de aproximadamente 0 €.
- El proveedor de IA no recibe datos personales ni categorías especiales del menor; refuerza RES-04 y los requisitos de RGPD.
- Aporta a la memoria una línea defendible de **minimización de datos por diseño**.
- Cubre RNF-08 sin gasto mediante el doble adaptador de TTS.

**Negativas / riesgos:**
- **Calidad de voz inferior** con la Web Speech API, y comportamiento variable entre navegadores. **Mitigación:** el adaptador de TTS en la nube permanece implementado y activable; la comparación entre ambos es material válido para el capítulo de evaluación.
- **Límites de cupo del nivel gratuito** (peticiones por minuto y por día). **Mitigación:** cupos de aplicación acotados, reintentos con retroceso exponencial ante errores 429, y **contenido pregenerado para la demostración y el vídeo de defensa**, que no debe depender de la disponibilidad del cupo en directo.
- **Arranque en frío y suspensión por inactividad** en la base de datos gratuita. Aceptable para un TFM; a considerar antes de cualquier demostración en directo.
- **Verificación pendiente de los términos del proveedor:** los límites y condiciones de las capas gratuitas se revisan con frecuencia, y existen indicios de restricciones territoriales para el uso comercial en la UE. **Debe confirmarse en la documentación oficial del proveedor**, no en fuentes secundarias, antes de dar por firme esta decisión.

---

## Notas de trazabilidad

- Requiere **endurecer RES-02** en el documento principal: de "presupuesto limitado" a **"coste operativo objetivo cero; sin gasto recurrente"**.
- Requiere reflejar en **§5** la elección de gama de modelos y la Web Speech API como TTS por defecto.
- Afecta al **paso 1 del pipeline** (§3.2 de la Consolidación): el prompt se construye con parámetros derivados, no con el perfil.
- **Cierra un punto abierto del backlog:** el cupo del plan registrado **no puede ser ilimitado**; debe fijarse un máximo explícito.
- Afecta a **INC-02** (adaptadores fake como modo de desarrollo por defecto), **INC-04** (gama de modelos, doble adaptador de TTS, medición de latencia) e **INC-05** (proveedor de Postgres gratuito con `pgvector`).
- Complementa **ADR-002**: Genkit sigue siendo el framework del adaptador, ahora con la gama de modelos acotada.
- Complementa **ADR-005**: ambos comparten el criterio de minimizar infraestructura y gasto.
