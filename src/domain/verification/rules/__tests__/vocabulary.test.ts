// @vitest-environment node
import { describe, expect, it } from "vitest";

import { computeVocabulary } from "../vocabulary";

const ALLOWED = new Set([
  "el",
  "la",
  "niño",
  "juega",
  "con",
  "pelota",
  "y",
  "corre",
]);
const NO_NAMES = new Set<string>();

describe("computeVocabulary", () => {
  it("da 0% cuando todas las palabras están en la lista", () => {
    const result = computeVocabulary(
      "El niño juega con la pelota.",
      ALLOWED,
      NO_NAMES,
    );
    expect(result.percentageOutside).toBe(0);
  });

  it("calcula el porcentaje de palabras fuera de la lista", () => {
    // "el, niño, juega, con, el, dinosaurio" → 1 de 6 fuera
    const result = computeVocabulary(
      "El niño juega con el dinosaurio.",
      ALLOWED,
      NO_NAMES,
    );
    expect(result.percentageOutside).toBeCloseTo((1 / 6) * 100, 5);
  });

  it("no penaliza los nombres de personaje (cuentan como dentro)", () => {
    // "Pipo" no está en la lista, pero sí en characterNames → no penaliza.
    const withName = computeVocabulary(
      "Pipo juega con la pelota.",
      ALLOWED,
      new Set(["Pipo"]),
    );
    expect(withName.percentageOutside).toBe(0);
  });

  it("penaliza el nombre si NO se declara en characterNames", () => {
    // "pipo" (1 de 5) queda fuera de lista si no se declara.
    const withoutName = computeVocabulary(
      "Pipo juega con la pelota.",
      ALLOWED,
      NO_NAMES,
    );
    expect(withoutName.percentageOutside).toBeCloseTo((1 / 5) * 100, 5);
  });

  it("compara de forma insensible a mayúsculas (nombre en cualquier caja)", () => {
    const result = computeVocabulary(
      "Pipo juega con la pelota.",
      ALLOWED,
      new Set(["pipo"]),
    );
    expect(result.percentageOutside).toBe(0);
  });
});
