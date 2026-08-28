# ADR-013 — Input opcional «nivel de lectura» para desacoplar la complejidad de la edad

- **Versión:** v1.0.0
- **Fecha:** 2026-08-28
- **Estado:** Propuesta <!-- mejora futura; no entra en el núcleo del MVP -->
- **Decisores:** autor del TFM
- **Relacionado con:** tabla maestra de parámetros (§19.1 del troncal); parámetros de **generación** (prompt) vs **validación** (backend); INC-02 (generación); [ADR-012](./ADR-012-indice-legibilidad-inflesz.md); [ADR-006](./ADR-006-coste-minimo.md) (minimización de datos); [UX](../ux/NarrARA_UX_Stitch_v1.1.0.md) (control de dificultad ajustable); [Historias de usuario](../project/NarrARA_Historias_Usuario_v1.0.0.md) (configurar nivel de dificultad)

---

## Contexto

En la tabla maestra, la **complejidad sintáctica** y la **complejidad narrativa** son
parámetros de **generación** (instrucciones al LLM, **no** se validan en el backend) y se
**derivan directamente de la franja de edad** (F1/F2/F3).

Pero la edad cronológica y el nivel lector **no siempre coinciden**: un niño de 5 años puede
leer por encima de su edad, y otro de 8 puede necesitar textos más simples (dificultades de
lectura, aprendizaje del español como segunda lengua, etc.). Derivar la complejidad **solo**
de la edad deja fuera esa variación.

Además, el [documento de UX](../ux/NarrARA_UX_Stitch_v1.1.0.md) y las
[historias de usuario](../project/NarrARA_Historias_Usuario_v1.0.0.md) ya contemplan un
**«control de nivel de dificultad», ajustable manualmente y derivado de la edad por defecto**.
Este ADR concreta esa idea para la dimensión de complejidad de prompt.

Una propiedad lo hace barato: la complejidad sintáctica/narrativa **solo alimenta el prompt**,
no el motor determinista. Exponerla como ajuste **no toca la validación** ni añade riesgo al
núcleo.

---

## Decisión

Se propone añadir en el frontal un **input opcional «nivel de lectura»** que, cuando el usuario
lo utiliza, fija los niveles de **complejidad sintáctica y narrativa** enviados al LLM,
**con independencia de la edad**.

- **Por defecto** el nivel se **deriva de la franja de edad** (comportamiento actual); el usuario
  puede **subirlo o bajarlo** manualmente.
- **Alcance acotado (MVP):** solo mapea a las **instrucciones de prompt** (complejidad
  sintáctica/narrativa). **No** altera los parámetros **validados** (longitud, rango IFSZ,
  vocabulario), que siguen anclados a la edad. Extender el «nivel de lectura» a esos parámetros
  duros es una decisión **posterior y separada** (ver *Consecuencias*).
- Es una **mejora opcional**: el producto funciona sin ella (la edad basta como valor por
  defecto).

---

## Justificación

- **Adaptación real más allá de la edad cronológica**, coherente con la accesibilidad como
  requisito de primera clase.
- **Coste bajo y riesgo nulo para el motor:** al tocar solo instrucciones de prompt, no cambia
  la lógica determinista ni la validación. Se puede añadir o quitar sin refactor del núcleo.
- **Ya alineado** con el control de dificultad manual previsto en UX y en las historias de usuario.

---

## Alternativas consideradas

### Derivar la complejidad solo de la edad (status quo)
- **A favor:** más simple; menos superficie de UI.
- **En contra:** no cubre la variación de nivel lector dentro de una misma edad.
- **Motivo del descarte (parcial):** se conserva como **valor por defecto**, pero se permite
  el ajuste manual encima.

### Sustituir la edad por un «nivel de lectura» único
- **A favor:** un solo control.
- **En contra:** la edad sigue siendo necesaria para la longitud y para la seguridad/moderación
  (lista negra temática por edad). Perderla complica más de lo que simplifica.
- **Motivo del descarte:** la edad se mantiene; el nivel de lectura la **matiza**, no la sustituye.

---

## Consecuencias

**Positivas:**
- Adaptación más fina y opcional, sin coste para el motor determinista.
- Encaja con UX/HU ya redactadas.

**Negativas / riesgos:**
- Más superficie de UI y de configuración; hay que definir el **mapeo nivel → complejidad**.
- **Decisión abierta:** si en el futuro se quiere que el «nivel de lectura» afecte también a los
  parámetros **validados** (IFSZ, longitud, vocabulario), deberá decidirse en un ADR aparte, por
  su impacto en el motor.
- **Minimización de datos ([ADR-006](./ADR-006-coste-minimo.md)):** el «nivel de lectura» es un
  atributo del menor; al LLM viaja **solo el parámetro derivado** (los niveles de complejidad),
  **nunca la etiqueta** ni datos identificativos, en coherencia con ADR-006.

---

## Notas de trazabilidad

- Concreta el «control de dificultad ajustable» ya previsto en
  [UX](../ux/NarrARA_UX_Stitch_v1.1.0.md) y en las
  [historias de usuario](../project/NarrARA_Historias_Usuario_v1.0.0.md).
- Afecta a la fase de **generación** (INC-02), no al motor de verificación (INC-01/SPEC-01).
- Complementa la separación **generación (prompt) vs validación (backend)** consolidada en la
  tabla maestra de parámetros.
- Sujeta a la minimización de datos de [ADR-006](./ADR-006-coste-minimo.md).
