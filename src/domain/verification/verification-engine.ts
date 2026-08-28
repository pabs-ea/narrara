// Fachada del motor de verificación (SPEC-01-R10, R11). Orquesta las funciones
// puras del dominio: valida la entrada → mide (legibilidad, vocabulario,
// longitud de frase) → pagina → compone el veredicto, y devuelve un
// `VerificationResult`. El contador de sílabas se INYECTA; el motor NO importa
// nada externo (silabajs vive en un adaptador). NO genera ni reescribe texto ni
// decide re-generar: eso es del orquestador (INC-02).

import type { VerificationResult } from "./contract";
import type { SyllableCounter } from "./readability/syllable-counter";
import { computeMaxSentenceLength } from "./rules/sentence-length";
import { computeReadability } from "./readability/readability";
import { computeVocabulary } from "./rules/vocabulary";
import { composeVerdict } from "./verdict";
import { paginate } from "./pagination/paginate";
import { segmentSentences } from "./text/segment-sentences";
import { tokenize } from "./text/tokenize";
import { validateInput } from "./validate-input";

export interface VerificationEngine {
  verify(input: unknown): VerificationResult;
}

export function createVerificationEngine(
  countSyllables: SyllableCounter,
): VerificationEngine {
  return {
    verify(input: unknown): VerificationResult {
      const { narrative, characterNames, parameters } = validateInput(input);

      const readability = computeReadability(narrative, {
        countSyllables,
        segmentSentences,
        tokenize,
      });
      const vocabulary = computeVocabulary(
        narrative,
        parameters.allowedFrequencyList,
        characterNames,
      );
      const maxSentenceLength = computeMaxSentenceLength(narrative);
      const { pages, warnings } = paginate(
        narrative,
        parameters.maxLengthPerPage,
      );

      const verdict = composeVerdict({
        readability,
        vocabularyPercentage: vocabulary.percentageOutside,
        maxSentenceLength,
        pages,
        paginationWarnings: warnings,
        parameters,
      });

      return { verdict, pages, warnings };
    },
  };
}
