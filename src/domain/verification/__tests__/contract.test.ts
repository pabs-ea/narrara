// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  InvalidVerificationInputError,
  VerificationParametersSchema,
} from "../contract";

// Objeto válido de referencia (parámetros de F1 de la tabla maestra:
// techo de legibilidad abierto con max = null).
function validParameters() {
  return {
    readabilityRange: { min: 80, max: null },
    maxLengthPerPage: 70,
    maxSentenceLength: 8,
    allowedFrequencyList: new Set(["el", "la", "zorro"]),
    maxPercentageWordsOutsideList: 5,
  };
}

describe("VerificationParametersSchema", () => {
  it("acepta un objeto de parámetros válido", () => {
    const result = VerificationParametersSchema.safeParse(validParameters());
    expect(result.success).toBe(true);
  });

  it("acepta un rango de legibilidad con techo numérico (min < max)", () => {
    const result = VerificationParametersSchema.safeParse({
      ...validParameters(),
      readabilityRange: { min: 65, max: 85 },
    });
    expect(result.success).toBe(true);
  });

  it("rechaza readabilityRange con min > max", () => {
    const result = VerificationParametersSchema.safeParse({
      ...validParameters(),
      readabilityRange: { min: 85, max: 80 },
    });
    expect(result.success).toBe(false);
  });

  it("rechaza maxLengthPerPage no positivo", () => {
    expect(
      VerificationParametersSchema.safeParse({
        ...validParameters(),
        maxLengthPerPage: 0,
      }).success,
    ).toBe(false);
    expect(
      VerificationParametersSchema.safeParse({
        ...validParameters(),
        maxLengthPerPage: -5,
      }).success,
    ).toBe(false);
  });

  it("rechaza maxSentenceLength no positivo", () => {
    expect(
      VerificationParametersSchema.safeParse({
        ...validParameters(),
        maxSentenceLength: 0,
      }).success,
    ).toBe(false);
  });

  it("rechaza maxPercentageWordsOutsideList fuera de [0, 100]", () => {
    expect(
      VerificationParametersSchema.safeParse({
        ...validParameters(),
        maxPercentageWordsOutsideList: -1,
      }).success,
    ).toBe(false);
    expect(
      VerificationParametersSchema.safeParse({
        ...validParameters(),
        maxPercentageWordsOutsideList: 101,
      }).success,
    ).toBe(false);
  });

  it("rechaza una allowedFrequencyList vacía", () => {
    const result = VerificationParametersSchema.safeParse({
      ...validParameters(),
      allowedFrequencyList: new Set<string>(),
    });
    expect(result.success).toBe(false);
  });
});

describe("InvalidVerificationInputError", () => {
  it("es una subclase de Error con nombre propio", () => {
    const error = new InvalidVerificationInputError("mensaje");
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("InvalidVerificationInputError");
    expect(error.message).toBe("mensaje");
  });
});
