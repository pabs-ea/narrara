// @vitest-environment node
import { describe, expect, it } from "vitest";

import { SYLLABLE_CORPUS } from "../../../../tests/corpus/syllables";
import { silabajsSyllableCounter } from "../silabajs-syllable-counter";

// Se valida el adaptador REAL (envuelve silabajs) contra el corpus de recuento
// silábico conocido (ADR-015). Si el corpus revelara errores de cálculo, el
// fallback propio lo reutiliza tal cual.
describe("silabajsSyllableCounter", () => {
  for (const { word, syllables, phenomenon } of SYLLABLE_CORPUS) {
    it(`cuenta ${syllables} sílaba(s) en "${word}" — ${phenomenon}`, () => {
      expect(silabajsSyllableCounter(word)).toBe(syllables);
    });
  }
});
