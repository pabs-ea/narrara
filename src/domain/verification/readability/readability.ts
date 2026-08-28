// Legibilidad IFSZ (Índice de Flesch-Szigriszt, ADR-012) — regla SPEC-01-R01.
//
//   IFSZ = 206.835 − 62.3·(S/P) − (P/F)
//
// donde S = sílabas totales, P = palabras totales, F = frases totales. El
// resultado NO está acotado a 0-100 (puede superar 100 o bajar de 0). Función
// pura: el contador de sílabas se INYECTA (no importa silabajs), igual que la
// tokenización y la segmentación (mismo criterio de frase que R03/paginación).

import type { SyllableCounter } from "./syllable-counter";

const INTERCEPT = 206.835;
const SYLLABLE_COEFFICIENT = 62.3;

export interface ReadabilityDeps {
  readonly countSyllables: SyllableCounter;
  readonly segmentSentences: (text: string) => string[];
  readonly tokenize: (text: string) => string[];
}

export function computeReadability(
  text: string,
  deps: ReadabilityDeps,
): number {
  const words = deps.tokenize(text);
  const sentences = deps.segmentSentences(text);
  const wordCount = words.length; // P
  const sentenceCount = sentences.length; // F
  const syllableCount = words.reduce(
    (total, word) => total + deps.countSyllables(word),
    0,
  ); // S

  return (
    INTERCEPT -
    SYLLABLE_COEFFICIENT * (syllableCount / wordCount) -
    wordCount / sentenceCount
  );
}

// Rango de legibilidad (R01): mínimo INCLUSIVO, máximo EXCLUSIVO; max = null
// significa "sin techo".
export function readabilityWithinRange(
  value: number,
  range: { readonly min: number; readonly max: number | null },
): boolean {
  return value >= range.min && (range.max === null || value < range.max);
}
