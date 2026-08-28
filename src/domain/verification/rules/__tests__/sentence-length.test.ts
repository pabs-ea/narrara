// @vitest-environment node
import { describe, expect, it } from "vitest";

import { computeMaxSentenceLength } from "../sentence-length";

describe("computeMaxSentenceLength", () => {
  it("devuelve la longitud de la frase más larga (en palabras)", () => {
    // Frases de 3 y 7 palabras → máximo 7.
    expect(
      computeMaxSentenceLength(
        "El sol brilla. La niña pequeña corre muy rápido hoy.",
      ),
    ).toBe(7);
  });

  it("cuenta la frase más larga aunque esté en medio", () => {
    expect(
      computeMaxSentenceLength("Hola. Uno dos tres cuatro cinco. Adiós."),
    ).toBe(5);
  });

  it("una sola frase corta no falla (sin mínimo): su máximo es pequeño", () => {
    expect(computeMaxSentenceLength("Corre.")).toBe(1);
  });

  it("devuelve 0 para un texto sin palabras", () => {
    expect(computeMaxSentenceLength("   ")).toBe(0);
  });
});
