// @vitest-environment node
import { describe, expect, it } from "vitest";

import { segmentSentences } from "../../text/segment-sentences";
import { tokenize } from "../../text/tokenize";
import { computeReadability, readabilityWithinRange } from "../readability";

// Fake determinista del contador de sílabas: mapa de recuentos para las
// palabras del texto de prueba. Mantiene el test PURO (no importa el adaptador
// real de silabajs) y hace que S sea exacto y auditable.
const SYLLABLES: Record<string, number> = {
  la: 1,
  niña: 2,
  ríe: 2,
  el: 1,
  sol: 1,
  brilla: 2,
  hoy: 1,
};
const fakeCountSyllables = (word: string): number => SYLLABLES[word] ?? 0;

describe("computeReadability", () => {
  it("aplica la fórmula IFSZ = 206.835 − 62.3·(S/P) − (P/F)", () => {
    // "La niña ríe. El sol brilla hoy."
    //   F = 2 frases; P = 7 palabras; S = 1+2+2+1+1+2+1 = 10
    //   IFSZ = 206.835 − 62.3·(10/7) − (7/2) = 206.835 − 89.0 − 3.5 = 114.335
    const ifsz = computeReadability("La niña ríe. El sol brilla hoy.", {
      countSyllables: fakeCountSyllables,
      segmentSentences,
      tokenize,
    });
    expect(ifsz).toBeCloseTo(114.335, 3);
  });

  it("no tiene techo: un texto muy simple puede superar 100", () => {
    const ifsz = computeReadability("La niña ríe. El sol brilla hoy.", {
      countSyllables: fakeCountSyllables,
      segmentSentences,
      tokenize,
    });
    expect(ifsz).toBeGreaterThan(100);
  });
});

describe("readabilityWithinRange", () => {
  it("cumple cuando IFSZ es igual al mínimo (mínimo inclusivo)", () => {
    expect(readabilityWithinRange(80, { min: 80, max: null })).toBe(true);
  });

  it("no cumple cuando IFSZ es igual al máximo (máximo exclusivo)", () => {
    expect(readabilityWithinRange(85, { min: 65, max: 85 })).toBe(false);
  });

  it("cumple cuando IFSZ está estrictamente por debajo del máximo", () => {
    expect(readabilityWithinRange(84.9, { min: 65, max: 85 })).toBe(true);
  });

  it("no cumple cuando IFSZ está por debajo del mínimo", () => {
    expect(readabilityWithinRange(64, { min: 65, max: 85 })).toBe(false);
  });

  it("sin techo (max = null): cualquier IFSZ ≥ min cumple", () => {
    expect(readabilityWithinRange(500, { min: 80, max: null })).toBe(true);
  });
});
