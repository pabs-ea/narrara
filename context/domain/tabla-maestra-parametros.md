# Tabla maestra de parámetros

**Fuente de verdad** de los valores que adaptan la generación y la verificación de un cuento al
perfil del lector. Describe el **qué** (los valores); el **porqué** de cada elección está en los
ADR referenciados.

> **Estado:** provisional. Solo **F1 · 70 palabras/página** está anclado en un dato real (cuento
> físico estándar para 4 años). El resto son **valores de partida** a afinar con pruebas. No se
> hardcodean: alimentan `VerificationParameters` (SPEC-01 §3).

## Franjas de edad

| Franja | Edad | Etapa lectora |
| ------ | ---- | ------------- |
| **F1** | 3-5  | Prelectores (les leen a ellos) |
| **F2** | 6-7  | Primeros lectores (leen solos) |
| **F3** | 8-10 | Lectores en desarrollo |

El público objetivo es 3-10 años (troncal). El **modo dislexia** es un **modificador**
ortogonal (aún sin definir, ver *Pendiente*), no una franja.

## Dos niveles de parámetros

- **Generación (prompt):** instrucciones al LLM. **No se validan.**
- **Validación (backend):** restricciones deterministas que comprueba el motor (SPEC-01).
  Si fallan, el orquestador regenera (sin segunda llamada de evaluación al LLM).

---

## 1. Longitud por franja × preset

Modelo: `palabras/página` es fijo por franja; el preset (Corto/Medio/Largo) escala el **nº de
páginas**. `palabras ≈ páginas × palabras/página`. La paginación es determinista y la hace el
backend a partir de texto continuo (**ADR-014**).

| Franja (palabras/página) | Corto | Medio | Largo |
| ------------------------ | ----- | ----- | ----- |
| **F1** · (70) | 5 pág → ~350 | 8 pág → ~560 | 10 pág → ~700 |
| **F2** · (100) | 7 pág → ~700 | 10 pág → ~1000 | 12 pág → ~1200 |
| **F3** · (140) | 10 pág → ~1400 | 13 pág → ~1820 | 16 pág → ~2240 |

El total de palabras es el **objetivo orientativo** que se pasa al LLM; la longitud exacta no
importa porque la paginación la controla el backend (**ADR-014**).

### Palabras/página vs palabras/frase — no confundir

La **frase** cumple **tres** papeles distintos, y ninguno es el tamaño de la página:

| Papel | Qué hace | Parámetro |
| ----- | -------- | --------- |
| **Unidad de corte al paginar** | La página se llena hasta `maxLengthPerPage` y **el corte se hace siempre por frase completa** (nunca a mitad) | — (regla de paginación) |
| **Restricción de validación** | El motor comprueba que **ninguna frase** supere el máximo de palabras | `maxSentenceLength` |
| **Conteo para el IFSZ** | El nº de frases (`F`) entra en la fórmula de legibilidad | — (cálculo IFSZ) |

En cambio, **el tamaño de la página se mide en `palabras/página`** (`maxLengthPerPage`). Es
decir: *paginar* = «lleno hasta N palabras/página **y corto por frase**»; *validar la frase* =
«ninguna frase pasa de M palabras» es una comprobación **aparte** del motor.

## 2. Restricciones de VALIDACIÓN (backend / motor)

| Parámetro (`VerificationParameters`) | F1 · 3-5 | F2 · 6-7 | F3 · 8-10 |
| ------------------------------------ | -------- | -------- | --------- |
| `maxLengthPerPage` (palabras/página) | **70** ✅ | 100 | 140 |
| Longitud de frase (palabras) | ≤ 8 | ≤ 10 | ≤ 15 |
| `readabilityRange` — **IFSZ** (**ADR-012**) | **≥ 80** | **≥ 65 y < 85** | **≥ 55 y < 65** |
| `maxPercentageWordsOutsideList` | 5 % | 10 % | 15 % |

Notas de semántica:

- **IFSZ:** cumple si `min ≤ IFSZ < max` (**mínimo inclusivo, máximo exclusivo**). **F1 no tiene
  techo** (`max = null`): para un prelector «demasiado fácil» no existe. El IFSZ **no está
  acotado a 0-100** (puede superar 100 y bajar de 0), por eso F1 es solo un piso.
- **Longitud de frase:** el límite **duro** es el **máximo**. **No hay mínimo duro**: las frases
  cortas son deseables para lectores jóvenes y no se rechazan.
- El cálculo del IFSZ requiere contar sílabas (`S`), palabras (`P`) y frases (`F`) del texto
  (silabeador del español + tokenización + segmentación); esos algoritmos son de INC-01, no de
  esta tabla.

## 3. Parámetros de GENERACIÓN (prompt / LLM — no se validan)

| Parámetro | F1 · 3-5 | F2 · 6-7 | F3 · 8-10 |
| --------- | -------- | -------- | --------- |
| Complejidad de vocabulario | very_low | low | medium |
| Palabras nuevas máx. | 2 | 5 | 10 |
| Complejidad sintáctica | very_low | low | medium |
| Complejidad narrativa | very_low | low | medium |

- La complejidad **sintáctica/narrativa** puede además ajustarse manualmente con el input
  opcional «nivel de lectura» (**ADR-013**, propuesta).
- **«Palabras nuevas máx.» y `maxPercentageWordsOutsideList` son la misma palanca de
  vocabulario**: la primera es la instrucción al LLM; la segunda, lo que mide el backend contra
  la lista de frecuencia. Hay que hacerlas coherentes cuando exista la lista (ver *Pendiente*).

### Salida del LLM (contrato de generación)

El LLM devuelve una **respuesta estructurada** (no texto pelado), validada con Zod en la
frontera:

```json
{
  "title": "El Tesoro de la Montaña de Cristal",
  "narrative": "…texto continuo, sin paginar…",
  "moral": "…",
  "characterNames": ["Pipo", "Lolo", "Mía"]
}
```

- **`narrative`** es el **texto continuo** (ADR-014); lo **pagina el backend**, no el LLM.
- **`characterNames`** los **autoría el LLM** (inventó los nombres) → se **piden**, no se miden;
  se usan en R02 para no penalizar nombres propios. Es el lado «autoría» de la línea *autoría vs
  medición* (las mediciones —sílabas, IFSZ, %— se calculan en el backend, nunca se piden).
- **Robustez:** aceptar solo los `characterNames` que **aparecen literalmente** en `narrative`
  (cruce determinista). Si se escapa alguno, cuenta como «fuera de lista» → **falla del lado
  seguro** (como mucho fuerza una regeneración; nunca relaja el control).
- El detalle fino del contrato de generación vive en **SPEC-02** (orquestador, pendiente); aquí
  solo se ancla el plan. El motor (INC-01 / SPEC-01) **recibe** `characterNames`, no los produce.

---

## Representación estructurada (para código)

```yaml
# min inclusivo, max exclusivo; readabilityRange.max = null → sin techo
franjas:
  F1:
    edad: [3, 5]
    maxLengthPerPage: 70
    maxSentenceLength: 8
    readabilityRange: { min: 80, max: null }
    maxPercentageWordsOutsideList: 5
    length: { corto: 350, medio: 560, largo: 700 }
    prompt: { vocabulary: very_low, maxNewWords: 2, syntax: very_low, narrative: very_low }
  F2:
    edad: [6, 7]
    maxLengthPerPage: 100
    maxSentenceLength: 10
    readabilityRange: { min: 65, max: 85 }
    maxPercentageWordsOutsideList: 10
    length: { corto: 700, medio: 1000, largo: 1200 }
    prompt: { vocabulary: low, maxNewWords: 5, syntax: low, narrative: low }
  F3:
    edad: [8, 10]
    maxLengthPerPage: 140
    maxSentenceLength: 15
    readabilityRange: { min: 55, max: 65 }
    maxPercentageWordsOutsideList: 15
    length: { corto: 1400, medio: 1820, largo: 2240 }
    prompt: { vocabulary: medium, maxNewWords: 10, syntax: medium, narrative: medium }
```

---

## Pendiente

- **Modo dislexia:** definir como *delta* sobre la franja (frase más corta, IFSZ mínimo más
  alto, más espaciado en presentación). Sin valores aún.
- **Lista de frecuencia de vocabulario** (`allowedFrequencyList`): decidir el corpus de origen
  (p. ej. lista de frecuencia del español infantil). Es un activo, no un número.
- **Afinado de rangos** de IFSZ, longitud de frase y % con pruebas reales. Ojo: la banda de F3
  (55-65) es estrecha y elevará la tasa de regeneración.

## Referencias

- **ADR-012** — índice de legibilidad IFSZ / Escala INFLESZ.
- **ADR-013** — input opcional «nivel de lectura» (complejidad sintáctica/narrativa).
- **ADR-014** — generación como texto continuo y paginación en el backend.
- **SPEC-01** — motor de verificación (consume `VerificationParameters`).
- **ADR-006** — minimización de datos: al LLM viajan solo parámetros derivados, nunca atributos
  del menor.
