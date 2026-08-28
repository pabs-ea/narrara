// Longitud de frase máxima (SPEC-01-R03). Devuelve el número de palabras de la
// frase más larga del texto. La regla es un MÁXIMO por frase: cumple si este
// valor ≤ `maxSentenceLength`. No hay mínimo (las frases cortas son válidas).
// Usa el MISMO criterio de fin de frase que el IFSZ (F) y la paginación.

import { segmentSentences } from "../text/segment-sentences";
import { tokenize } from "../text/tokenize";

export function computeMaxSentenceLength(text: string): number {
  const sentences = segmentSentences(text);
  let maxFound = 0;
  for (const sentence of sentences) {
    const wordCount = tokenize(sentence).length;
    if (wordCount > maxFound) maxFound = wordCount;
  }
  return maxFound;
}
