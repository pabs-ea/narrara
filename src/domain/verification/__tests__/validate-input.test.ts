// @vitest-environment node
import { describe, expect, it } from "vitest";

import { InvalidVerificationInputError } from "../contract";
import { validateInput } from "../validate-input";

function baseInput() {
  return {
    narrative: "Había una vez un zorro.",
    characterNames: new Set<string>(),
    parameters: {
      readabilityRange: { min: 80, max: null },
      maxLengthPerPage: 70,
      maxSentenceLength: 8,
      allowedFrequencyList: new Set(["el", "la"]),
      maxPercentageWordsOutsideList: 5,
    },
  };
}

describe("validateInput", () => {
  it("devuelve la entrada parseada cuando es válida", () => {
    const input = baseInput();
    const result = validateInput(input);
    expect(result.narrative).toBe("Había una vez un zorro.");
  });

  it("rechaza una narrativa vacía", () => {
    expect(() => validateInput({ ...baseInput(), narrative: "" })).toThrow(
      InvalidVerificationInputError,
    );
  });

  it("rechaza una narrativa de solo espacios", () => {
    expect(() =>
      validateInput({ ...baseInput(), narrative: "   \n\t" }),
    ).toThrow(InvalidVerificationInputError);
  });

  it("rechaza una allowedFrequencyList vacía", () => {
    const input = baseInput();
    input.parameters.allowedFrequencyList = new Set<string>();
    expect(() => validateInput(input)).toThrow(InvalidVerificationInputError);
  });

  it("rechaza readabilityRange con min > max", () => {
    const input = baseInput();
    input.parameters.readabilityRange = { min: 85, max: 80 };
    expect(() => validateInput(input)).toThrow(InvalidVerificationInputError);
  });

  it("rechaza maxLengthPerPage no positivo", () => {
    const input = baseInput();
    input.parameters.maxLengthPerPage = 0;
    expect(() => validateInput(input)).toThrow(InvalidVerificationInputError);
  });

  it("rechaza maxSentenceLength no positivo", () => {
    const input = baseInput();
    input.parameters.maxSentenceLength = -1;
    expect(() => validateInput(input)).toThrow(InvalidVerificationInputError);
  });

  it("rechaza maxPercentageWordsOutsideList fuera de [0, 100]", () => {
    const high = baseInput();
    high.parameters.maxPercentageWordsOutsideList = 101;
    expect(() => validateInput(high)).toThrow(InvalidVerificationInputError);

    const low = baseInput();
    low.parameters.maxPercentageWordsOutsideList = -1;
    expect(() => validateInput(low)).toThrow(InvalidVerificationInputError);
  });
});
