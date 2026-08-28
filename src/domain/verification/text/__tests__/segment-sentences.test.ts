// @vitest-environment node
import { describe, expect, it } from "vitest";

import { segmentSentences } from "../segment-sentences";

describe("segmentSentences", () => {
  it("separa las frases por el punto", () => {
    expect(segmentSentences("Hola mundo. Adiós mundo.")).toEqual([
      "Hola mundo.",
      "Adiós mundo.",
    ]);
  });

  it("separa por signos de exclamación e interrogación", () => {
    expect(segmentSentences("¿Vienes? ¡Claro!")).toEqual([
      "¿Vienes?",
      "¡Claro!",
    ]);
  });

  it("trata un texto sin puntuación terminal como una sola frase", () => {
    expect(segmentSentences("Esto no termina con punto")).toEqual([
      "Esto no termina con punto",
    ]);
  });

  it("no corta en un punto de abreviatura (Sr.)", () => {
    expect(segmentSentences("El Sr. López llegó tarde.")).toEqual([
      "El Sr. López llegó tarde.",
    ]);
  });

  it("no corta en 'etc.' seguido de la misma frase", () => {
    expect(
      segmentSentences("Compró manzanas, peras, etc. en el mercado."),
    ).toEqual(["Compró manzanas, peras, etc. en el mercado."]);
  });

  it("mantiene la comilla de cierre de un diálogo dentro de su frase", () => {
    expect(
      segmentSentences("Dijo: «Vamos a casa.» Y se fueron."),
    ).toEqual(["Dijo: «Vamos a casa.»", "Y se fueron."]);
  });

  it("colapsa varios signos terminales seguidos en un único corte", () => {
    expect(segmentSentences("¿Qué?! Vale.")).toEqual(["¿Qué?!", "Vale."]);
  });

  it("ignora el texto en blanco final", () => {
    expect(segmentSentences("Una frase.   ")).toEqual(["Una frase."]);
  });
});
