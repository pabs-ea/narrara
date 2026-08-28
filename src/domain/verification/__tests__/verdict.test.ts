// @vitest-environment node
import { describe, expect, it } from "vitest";

import type { VerificationParameters } from "../contract";
import { createPage } from "../../story/page";
import { composeVerdict } from "../verdict";

const PARAMETERS: VerificationParameters = {
  readabilityRange: { min: 80, max: null },
  maxLengthPerPage: 3,
  maxSentenceLength: 5,
  allowedFrequencyList: new Set(["x"]),
  maxPercentageWordsOutsideList: 10,
};

// Medidas base que cumplen todas las dimensiones.
function passingInput() {
  return {
    readability: 90,
    vocabularyPercentage: 5,
    maxSentenceLength: 4,
    pages: [createPage("uno dos"), createPage("tres")],
    paginationWarnings: [],
    parameters: PARAMETERS,
  };
}

describe("composeVerdict", () => {
  it("cumple solo si R01, R02, R03 y pageLength se cumplen", () => {
    const verdict = composeVerdict(passingInput());
    expect(verdict.passes).toBe(true);
    expect(verdict.details.readability).toEqual({ value: 90, passes: true });
    expect(verdict.details.vocabulary).toEqual({
      percentageOutside: 5,
      passes: true,
    });
    expect(verdict.details.sentenceLength).toEqual({
      maxFound: 4,
      passes: true,
    });
    expect(verdict.details.pageLength).toEqual({
      passes: true,
      offendingPages: [],
    });
  });

  it("no cumple si la legibilidad cae por debajo del mínimo", () => {
    const verdict = composeVerdict({ ...passingInput(), readability: 70 });
    expect(verdict.details.readability.passes).toBe(false);
    expect(verdict.passes).toBe(false);
  });

  it("no cumple si el vocabulario supera el máximo", () => {
    const verdict = composeVerdict({
      ...passingInput(),
      vocabularyPercentage: 20,
    });
    expect(verdict.details.vocabulary.passes).toBe(false);
    expect(verdict.passes).toBe(false);
  });

  it("no cumple si una frase supera el máximo", () => {
    const verdict = composeVerdict({ ...passingInput(), maxSentenceLength: 6 });
    expect(verdict.details.sentenceLength.passes).toBe(false);
    expect(verdict.passes).toBe(false);
  });

  it("una página sobredimensionada con warning NO hace fallar pageLength (R07)", () => {
    const verdict = composeVerdict({
      ...passingInput(),
      pages: [createPage("uno dos"), createPage("uno dos tres cuatro cinco")],
      paginationWarnings: [
        {
          dimension: "pageLength",
          severity: "warning",
          message: "sobredimensionada",
          pageIndex: 1,
        },
      ],
    });
    expect(verdict.details.pageLength.passes).toBe(true);
    expect(verdict.details.pageLength.offendingPages).toEqual([]);
    expect(verdict.passes).toBe(true);
  });

  it("una página que supera el máximo SIN warning hace fallar pageLength", () => {
    const verdict = composeVerdict({
      ...passingInput(),
      pages: [createPage("uno dos"), createPage("uno dos tres cuatro cinco")],
      paginationWarnings: [],
    });
    expect(verdict.details.pageLength.passes).toBe(false);
    expect(verdict.details.pageLength.offendingPages).toEqual([1]);
    expect(verdict.passes).toBe(false);
  });
});
