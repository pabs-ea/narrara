# ADR-012 — Índice de legibilidad: Flesch-Szigriszt (IFSZ) y Escala INFLESZ

- **Versión:** v1.1.0
- **Fecha:** 2026-08-27
- **Estado:** ✅ **Aceptada** · **Fecha de aceptación:** 2026-08-27
- **Decisores:** autor del TFM
- **Relacionado con:** SPEC-01 (regla **SPEC-01-R01**, parámetro `readabilityRange`); INC-01 (tarea **INC-01-T04**); tabla maestra de parámetros (§19.1 del troncal, columna de legibilidad); investigación de accesibilidad ([`docs/research/Investigacion_Dislexia_v1.0.0.md`](../research/Investigacion_Dislexia_v1.0.0.md)); `CLAUDE.md` (accesibilidad como requisito de primera clase; regla de gobernanza nº4)

> **Cambios en v1.1.0 (2026-08-28):** añadida la subsección «Origen de las constantes», que
> explica de dónde salen `206.835` y `62.3` (para que no parezcan valores arbitrarios). Sin
> cambios en la decisión.

---

## Contexto

El motor de verificación (SPEC-01) debe evaluar de forma **determinista** si un cuento
cumple una restricción de **legibilidad**: la regla **SPEC-01-R01** calcula la legibilidad
del cuento completo y comprueba que cae dentro de un rango (`readabilityRange: { min, max }`)
derivado del perfil del lector.

La spec dejó la métrica **sin decidir**, escrita como *«Fernández-Huerta / INFLESZ»*. Esa
barra es una decisión pendiente disfrazada de detalle: **cada fórmula produce un número
distinto para el mismo texto y sobre una escala distinta**, de modo que un rango como
`{ min: 55, max: 80 }` no significa nada hasta fijar la fórmula. Sin resolverlo:

- No se puede rellenar la columna de legibilidad de la **tabla maestra de parámetros** (§19.1).
- No se puede escribir el test de R01 con un **valor conocido** esperado.

Se necesita, además, una **fuente fiable y citable** de la que extraer la fórmula exacta y su
escala de interpretación, para poder codificar sobre una base sólida y defenderla en el TFM.

---

## Decisión

Se adopta el **Índice de Flesch-Szigriszt (IFSZ)**, interpretado con la **Escala INFLESZ**,
como métrica única de legibilidad de NarrARA.

**Fórmula (índice de perspicuidad de Flesch-Szigriszt):**

```
IFSZ = 206.835 − 62.3 · (S / P) − (P / F)
```

- **S** = número total de **sílabas** del texto.
- **P** = número total de **palabras** del texto.
- **F** = número total de **frases** (oraciones) del texto.
- `S / P` = sílabas medias por palabra; `P / F` = palabras medias por frase.
- La constante `206.835` aparece redondeada como `207` en algunas fuentes; se fija el valor
  preciso `206.835`. El coeficiente del segundo término (`P/F`) es `1`.

#### Origen de las constantes (para evitar confusión)

Las constantes **no son arbitrarias**: son el **intercepto** y los **coeficientes** de una
regresión lineal ajustada contra la dificultad de lectura medida. La fórmula tiene la forma
`intercepto − a·(sílabas/palabra) − b·(palabras/frase)`: palabras largas (más sílabas) y frases
largas **restan** puntos → texto más difícil → número más bajo.

- **`206.835` (intercepto).** Se hereda **directamente del *Flesch Reading Ease* original**
  (inglés, 1948): `RES = 206.835 − 1.015·(palabras/frase) − 84.6·(sílabas/palabra)`. Ancla la
  escala para que lo trivialmente fácil ronde 100. Szigriszt lo mantuvo sin cambios.
- **`62.3` (coeficiente de las sílabas).** Es la **recalibración de Szigriszt (1993) para el
  español**. En el Flesch inglés ese coeficiente es **84.6**; se bajó a **62.3** porque el
  español es **más polisilábico** que el inglés (más sílabas por palabra): con 84.6 los textos
  españoles puntuarían falsamente como más difíciles. El coeficiente de `palabras/frase` pasó de
  `1.015` a `1`.

En resumen: `206.835` viene de **Flesch**; `62.3` es el ajuste de **Szigriszt** al español. La
**fórmula** (con estas constantes) es de Flesch→Szigriszt; la **escala de interpretación** (los
tramos de abajo) es de **INFLESZ / Barrio-Cantalejo**. Son piezas distintas y complementarias.

El resultado es un número (habitualmente 0–100; **mayor = más fácil**) que se interpreta con
la **Escala INFLESZ** (Barrio-Cantalejo et al., 2008), de cinco tramos:

| Puntuación IFSZ | Nivel INFLESZ  |
| --------------- | -------------- |
| `< 40`          | Muy difícil    |
| `40 – 55`       | Algo difícil   |
| `55 – 65`       | Normal         |
| `65 – 80`       | Bastante fácil |
| `> 80`          | Muy fácil      |

El umbral de accesibilidad para el ciudadano medio validado por el estudio es **IFSZ ≥ 55**.

En consecuencia, `readabilityRange.{ min, max }` de `VerificationParameters` (SPEC-01 §3) se
expresa **en unidades IFSZ** y sus valores por franja de edad/perfil se fijan en la tabla
maestra (§19.1) tomando estos tramos como marco (ver *Consecuencias*).

---

## Justificación

- **Validado para el español moderno.** La Escala INFLESZ se construyó revisando la escala de
  perspicuidad de Szigriszt sobre una **muestra aleatoria** de 210 publicaciones (630
  fragmentos de ≥500 palabras: quiosco, textos escolares y revistas científicas) y reajustando
  los tramos a los hábitos lectores del español. Fernández-Huerta (1959) no cuenta con una
  validación equivalente.
- **Trae su propia escala de interpretación.** Los cinco tramos dan un marco directo para
  construir los rangos por perfil, en lugar de tener que inventar la interpretación del número.
- **Determinista y sin I/O.** El cálculo depende solo del recuento de sílabas, palabras y
  frases: es una función pura, compatible con la pureza (**SPEC-01-R11**) y el determinismo
  (**SPEC-01-R08**) exigidos al motor. El silabeo del español es reglado (fonológico) y, por
  tanto, reproducible.
- **Umbral documentado.** El estudio ofrece un límite de accesibilidad citable (≥55), útil como
  referencia inferior de partida.
- **Fuente fiable y citable.** La fórmula y la escala provienen de una publicación revisada por
  pares (*Anales del Sistema Sanitario de Navarra*), lo que satisface el requisito de sustentar
  el código en documentación oficial.

---

## Alternativas consideradas

### Fórmula de Fernández-Huerta (1959)
- **A favor:** muy citada, sencilla, adaptación temprana de Flesch al español.
- **En contra:** de 1959, sin validación con muestra representativa ni reajuste de la escala a
  los hábitos lectores actuales del español; su interpretación es menos defendible.
- **Motivo del descarte:** INFLESZ ofrece la misma familia de fórmula con validación moderna y
  escala interpretativa propia.

### Fórmula RES original de Flesch (`206.835 − 0.846·(S/P) − 1.015·(P/F)`)
- **A favor:** estándar internacional muy conocido.
- **En contra:** diseñada y calibrada para el **inglés**; los propios autores de INFLESZ
  concluyen que no es adecuada para los hábitos lectores del español.
- **Motivo del descarte:** inadecuada para textos en español.

---

## Consecuencias

**Positivas:**
- `readabilityRange` pasa a tener una **escala concreta y citable**; R01 se vuelve testeable con
  valores conocidos.
- Se **desbloquea** la columna de legibilidad de la tabla maestra (§19.1).
- El cálculo es determinista y puro, alineado con R08 y R11.

**Negativas / riesgos:**
- **La correspondencia edad → rango IFSZ NO la proporciona INFLESZ.** La escala se validó con
  textos dirigidos a **pacientes adultos**, no con lectura infantil por edad. Definir qué rango
  IFSZ es apropiado para cada franja (p. ej. primeros lectores, modo dislexia) es una
  **calibración propia pendiente**, que se apoyará en [`docs/research/Investigacion_Dislexia_v1.0.0.md`](../research/Investigacion_Dislexia_v1.0.0.md)
  y se fijará en §19.1. *Mitigación:* usar los tramos como marco (apuntar a «bastante fácil»
  65–80 / «muy fácil» >80 para lectores jóvenes) y documentar la calibración con su fuente.
- **Requiere un silabeador del español fiable y determinista** (dependencia de implementación de
  INC-01-T04). *Mitigación:* silabeo por reglas fonológicas del español; batería de tests con
  palabras de recuento silábico conocido.
- **El recuento de frases (`F`) depende de la segmentación de frases** (INC-01-T03). Ambas piezas
  deben usar exactamente el mismo criterio de fin de frase para ser coherentes. *Mitigación:*
  T03 se implementa primero y alimenta tanto a R01 como a R03.

---

## Notas de trazabilidad

- **Fuente primaria (validación de la escala):** Barrio-Cantalejo IM, Simón-Lorda P, et al.
  «Validación de la Escala INFLESZ para evaluar la legibilidad de los textos dirigidos a
  pacientes». *An. Sist. Sanit. Navar.* 2008;31(2):135-152.
  Texto completo: <https://scielo.isciii.es/scielo.php?script=sci_arttext&pid=S1137-66272008000300004>
  · PDF: <https://scielo.isciii.es/pdf/asisna/v31n2/original2.pdf>
- **Origen de la fórmula (perspicuidad):** Szigriszt Pazos F. «Sistemas predictivos de
  legibilidad del mensaje escrito: fórmula de perspicuidad». Tesis doctoral, Universidad
  Complutense de Madrid, 1993.
- Materializa la decisión pendiente de **SPEC-01-R01** y del parámetro `readabilityRange`
  (SPEC-01 §3, §7).
- Es precondición de **INC-01-T04** (cálculo de legibilidad) y de la columna de legibilidad de
  la tabla maestra (§19.1 del troncal).
- Registrada conforme a la regla de gobernanza nº4 de `CLAUDE.md` (decisiones técnicas → ADR).
