// Composición del veredicto (SPEC-01-R09). A partir de las medidas de cada
// dimensión y del resultado de la paginación, decide si el cuento cumple y
// construye el `details`. `passes` es cierto solo si R01 (legibilidad), R02
// (vocabulario), R03 (longitud de frase) y `pageLength` se cumplen. Las páginas
// sobredimensionadas emitidas como `warning` (R07) NO hacen fallar `pageLength`.
// Función pura; no genera ni reescribe texto (R10).

import type { Finding, VerificationParameters, VerificationVerdict } from "./contract";
import type { Page } from "../story/page";
import { readabilityWithinRange } from "./readability/readability";
import { tokenize } from "./text/tokenize";

export interface ComposeVerdictInput {
  /** IFSZ obtenido (R01). */
  readonly readability: number;
  /** Porcentaje de palabras fuera de lista (R02). */
  readonly vocabularyPercentage: number;
  /** Longitud de la frase más larga, en palabras (R03). */
  readonly maxSentenceLength: number;
  /** Páginas resultantes de la paginación. */
  readonly pages: readonly Page[];
  /** Advertencias de la paginación (p. ej. página sobredimensionada, R07). */
  readonly paginationWarnings: readonly Finding[];
  readonly parameters: VerificationParameters;
}

export function composeVerdict(input: ComposeVerdictInput): VerificationVerdict {
  const { parameters } = input;

  const readabilityPasses = readabilityWithinRange(
    input.readability,
    parameters.readabilityRange,
  );
  const vocabularyPasses =
    input.vocabularyPercentage <= parameters.maxPercentageWordsOutsideList;
  const sentenceLengthPasses =
    input.maxSentenceLength <= parameters.maxSentenceLength;

  // Índices de páginas aceptadas como sobredimensionadas (warning R07): no
  // cuentan como incumplimiento de longitud de página.
  const warnedPages = new Set(
    input.paginationWarnings
      .filter((finding) => finding.dimension === "pageLength")
      .map((finding) => finding.pageIndex),
  );

  const offendingPages = input.pages
    .map((page, index) => ({ index, words: tokenize(page.text).length }))
    .filter(
      ({ index, words }) =>
        words > parameters.maxLengthPerPage && !warnedPages.has(index),
    )
    .map(({ index }) => index);

  const pageLengthPasses = offendingPages.length === 0;

  const passes =
    readabilityPasses &&
    vocabularyPasses &&
    sentenceLengthPasses &&
    pageLengthPasses;

  return {
    passes,
    details: {
      readability: { value: input.readability, passes: readabilityPasses },
      vocabulary: {
        percentageOutside: input.vocabularyPercentage,
        passes: vocabularyPasses,
      },
      sentenceLength: {
        maxFound: input.maxSentenceLength,
        passes: sentenceLengthPasses,
      },
      pageLength: { passes: pageLengthPasses, offendingPages },
    },
  };
}
