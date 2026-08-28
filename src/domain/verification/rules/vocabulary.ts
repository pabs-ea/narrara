// Vocabulario fuera de lista (SPEC-01-R02). Calcula el porcentaje de palabras
// del texto que NO están en `allowedFrequencyList`. Los nombres propios de los
// personajes (`characterNames`) cuentan como "dentro de lista" (los nombres
// inventados no penalizan). Función pura; la comparación es insensible a
// mayúsculas (tokenize ya normaliza; las listas se normalizan aquí).

import { tokenize } from "../text/tokenize";

export interface VocabularyResult {
  /** Porcentaje de palabras fuera de lista (0-100). */
  readonly percentageOutside: number;
  /** Palabras fuera de lista. */
  readonly outsideCount: number;
  /** Total de palabras consideradas. */
  readonly wordCount: number;
}

function toLowerCaseSet(values: ReadonlySet<string>): Set<string> {
  return new Set([...values].map((value) => value.toLowerCase()));
}

export function computeVocabulary(
  text: string,
  allowedFrequencyList: ReadonlySet<string>,
  characterNames: ReadonlySet<string>,
): VocabularyResult {
  const allowed = toLowerCaseSet(allowedFrequencyList);
  const names = toLowerCaseSet(characterNames);
  const words = tokenize(text);

  const outsideCount = words.filter(
    (word) => !allowed.has(word) && !names.has(word),
  ).length;

  const percentageOutside =
    words.length === 0 ? 0 : (outsideCount / words.length) * 100;

  return { percentageOutside, outsideCount, wordCount: words.length };
}
