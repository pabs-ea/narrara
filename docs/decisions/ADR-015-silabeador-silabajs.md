# ADR-015 — Silabeador del español: adoptar `silabajs` tras un port, con fallback propio

- **Versión:** v1.0.0
- **Fecha:** 2026-08-28
- **Estado:** ✅ **Aceptada** · **Fecha de aceptación:** 2026-08-28
- **Decisores:** autor del TFM
- **Relacionado con:** [ADR-012](./ADR-012-indice-legibilidad-inflesz.md) (el IFSZ necesita el conteo de sílabas `S`); SPEC-01 v1.2.0 (R01 legibilidad, R11 pureza); INC-01 (cálculo de legibilidad); [`docs/LEARNINGS.md`](../LEARNINGS.md) (aislamiento de herramientas de terceros vendorizadas)

---

## Contexto

El Índice de Flesch-Szigriszt (**ADR-012**) exige contar las **sílabas** (`S`) del texto. El
silabeo del español es **reglado y determinista**, pero tiene casos que **mueven el recuento** y,
con él, el IFSZ: **hiatos, diptongos, triptongos**, la «h» muda y la «y». Un error sistemático en
`S` desplaza el IFSZ varios puntos y puede cambiar el veredicto sin que se note.

`S` es una **medición del texto**, no un dato que el LLM conozca, así que **se calcula en el
backend** (ver el razonamiento de generación vs verificación en SPEC-01). Queda decidir si se usa
una librería existente o se implementa a medida.

Del análisis de librerías de npm (context7 **no las indexa**, por ser micro-paquetes; se juzgaron
por el registro de npm):

- **`silabajs`** v2.1.0 — silabeo lingüístico completo (hiato, diptongo, triptongo, tónica), **0
  dependencias**, **tipos TypeScript** nativos, **MIT**. Publicado recientemente (poca rodadura,
  un solo mantenedor).
- **`syllable-es`** v1.0.1 — conteo por **regex aproximada**, sin tipos, con dependencias, sin
  mantenimiento reciente (2022). Sesga el recuento en hiato/diptongo.
- Librerías de **guionado** (`hypher`, etc.) — parten conservador → **infracontarían** sílabas.

---

## Decisión

- Adoptar **`silabajs`** (fijado a **v2.1.0**) como silebeador del español, por ser el más
  **correcto** en los casos peligrosos de los que existen.
- Usarlo **siempre a través de un port propio** (interfaz `SyllableCounter` / función de conteo
  inyectada), de modo que el cálculo de legibilidad dependa de **nuestra abstracción**, no del
  paquete directamente.
- **Validarlo con un corpus de test** de palabras y frases con recuento silábico **conocido**,
  cubriendo hiatos, diptongos, triptongos, «h» y «y».
- **Fallback:** si el corpus revela errores de cálculo, se sustituye por una **implementación
  propia por reglas** (opción B) **sin tocar** el resto, gracias al port. El corpus de validación
  se reutiliza tal cual.

---

## Justificación

- **Correcto donde importa:** es el único de los existentes que maneja explícitamente
  hiato/diptongo/triptongo, justo lo que afecta al recuento.
- **Bajo acoplamiento:** 0 dependencias, TS y MIT; y al ir tras un port, el riesgo de que sea un
  paquete nuevo y de un solo autor queda **aislado** (se puede saltar a B sin refactor).
- **No se confía a ciegas:** el corpus de validación es innegociable; probar antes de comprometer
  no cuesta nada y el corpus sirve para A, B o C.
- **Pureza (R11):** el conteo es una función pura (sin I/O); inyectado en el dominio, no rompe la
  pureza del motor.

---

## Alternativas consideradas

### `syllable-es` (regex)
- **En contra:** conteo aproximado que sesga hiato/diptongo; sin tipos; sin mantenimiento reciente.
- **Motivo del descarte:** insuficiente para una métrica central que debe ser precisa.

### Implementación propia desde el inicio (opción B)
- **A favor:** cero dependencia externa; mejor relato de «lógica propia» en la defensa.
- **En contra:** más esfuerzo por delante ahora.
- **Motivo:** se conserva como **fallback** (y como mejora futura defendible), no como punto de
  partida, para no bloquear el arranque.

### Vendorizar `silabajs` (opción C)
- **A favor:** sin dependencia viva; control total; encaja con el patrón de LEARNINGS.
- **Motivo:** punto medio válido; se mantiene como opción si A da problemas de mantenimiento pero
  no de cálculo.

---

## Consecuencias

**Positivas:**
- Arranque rápido con el silabeo más correcto disponible.
- El port permite cambiar A→B→C sin tocar el cálculo de legibilidad.

**Negativas / riesgos:**
- Dependencia sobre un paquete **nuevo y de baja adopción** en el corazón de la métrica.
  *Mitigación:* port + corpus de validación + fallback B ya previstos.
- **Wiring con la regla de dependencia (a resolver en INC-01):** el motor vive en `domain/` y no
  debe importar librerías externas. El encaje limpio es **inyectar la función de conteo**
  (`countSyllables`) en el dominio, con el adaptador de `silabajs` en `adapters/` (o vendorizado),
  ensamblado en el composition root. Se concreta en la revisión de INC-01.
- context7 no verifica este paquete; **fijar versión exacta** y revisar su página/issues antes de
  cada actualización.

---

## Notas de trazabilidad

- Habilita el cálculo de `S` que exige **ADR-012** y la regla **SPEC-01-R01**.
- Introduce una nueva tarea en **INC-01** (adoptar silabajs tras port + corpus de validación) y un
  punto de wiring para la revisión de INC-01.
- Coherente con **SPEC-01-R11** (pureza) vía inyección de la función de conteo.
