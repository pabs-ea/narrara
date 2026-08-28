// @vitest-environment node
import { describe, expect, it } from "vitest";

import { InvalidVerificationInputError, type VerificationParameters } from "../contract";
import { createVerificationEngine } from "../verification-engine";

// Fake determinista: 1 sílaba por palabra. Mantiene el test PURO (sin el
// adaptador silabajs) y hace S = P, de modo que el IFSZ es predecible.
const oneSyllable = (): number => 1;
const engine = createVerificationEngine(oneSyllable);

const NARRATIVE = "El sol brilla hoy. La luna sale de noche.";
const ALL_WORDS = new Set([
  "el",
  "sol",
  "brilla",
  "hoy",
  "la",
  "luna",
  "sale",
  "de",
  "noche",
]);

function passingParameters(): VerificationParameters {
  return {
    readabilityRange: { min: 80, max: null },
    maxLengthPerPage: 20,
    maxSentenceLength: 10,
    allowedFrequencyList: ALL_WORDS,
    maxPercentageWordsOutsideList: 5,
  };
}

function input(parameters: VerificationParameters, narrative = NARRATIVE) {
  return { narrative, characterNames: new Set<string>(), parameters };
}

describe("VerificationEngine.verify", () => {
  it("devuelve un VerificationResult que cumple todas las dimensiones", () => {
    const result = engine.verify(input(passingParameters()));
    expect(result.verdict.passes).toBe(true);
    expect(result.pages).toHaveLength(1);
    expect(result.pages[0]?.text).toBe(NARRATIVE);
    expect(result.warnings).toHaveLength(0);
  });

  it("no cumple por legibilidad fuera de rango", () => {
    const result = engine.verify(
      input({ ...passingParameters(), readabilityRange: { min: 0, max: 50 } }),
    );
    expect(result.verdict.details.readability.passes).toBe(false);
    expect(result.verdict.passes).toBe(false);
  });

  it("no cumple por vocabulario fuera de lista", () => {
    const result = engine.verify(
      input({
        ...passingParameters(),
        allowedFrequencyList: new Set(["el"]),
        maxPercentageWordsOutsideList: 0,
      }),
    );
    expect(result.verdict.details.vocabulary.passes).toBe(false);
    expect(result.verdict.passes).toBe(false);
  });

  it("no cumple por una frase demasiado larga", () => {
    const result = engine.verify(
      input({ ...passingParameters(), maxSentenceLength: 3 }),
    );
    expect(result.verdict.details.sentenceLength.passes).toBe(false);
    expect(result.verdict.passes).toBe(false);
  });

  it("emite un warning por frase sobredimensionada sin fallar (R07)", () => {
    const result = engine.verify(
      input(
        {
          ...passingParameters(),
          maxLengthPerPage: 3,
          allowedFrequencyList: new Set([
            "uno",
            "dos",
            "tres",
            "cuatro",
            "cinco",
            "seis",
          ]),
        },
        "Uno dos tres cuatro cinco seis.",
      ),
    );
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]?.dimension).toBe("pageLength");
    expect(result.verdict.details.pageLength.passes).toBe(true);
    expect(result.verdict.passes).toBe(true);
  });

  it("lanza InvalidVerificationInputError con entrada inválida", () => {
    expect(() =>
      engine.verify(input(passingParameters(), "   ")),
    ).toThrow(InvalidVerificationInputError);
  });
});
