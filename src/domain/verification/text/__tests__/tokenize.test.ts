// @vitest-environment node
import { describe, expect, it } from "vitest";

import { tokenize } from "../tokenize";

describe("tokenize", () => {
  it("separa el texto en palabras", () => {
    expect(tokenize("Había una vez un zorro")).toEqual([
      "había",
      "una",
      "vez",
      "un",
      "zorro",
    ]);
  });

  it("conserva tildes y la ñ dentro de las palabras", () => {
    expect(tokenize("El niño miró la cigüeña")).toEqual([
      "el",
      "niño",
      "miró",
      "la",
      "cigüeña",
    ]);
  });

  it("normaliza a minúsculas para comparar sin distinguir mayúsculas", () => {
    expect(tokenize("Casa CASA casa")).toEqual(["casa", "casa", "casa"]);
  });

  it("ignora los signos de puntuación", () => {
    expect(tokenize("¡Hola, mundo! ¿Qué tal?")).toEqual([
      "hola",
      "mundo",
      "qué",
      "tal",
    ]);
  });

  it("ignora los números sueltos", () => {
    expect(tokenize("Hay 3 casas y 12 patos")).toEqual([
      "hay",
      "casas",
      "y",
      "patos",
    ]);
  });

  it("trata un guion interno entre letras como un único token", () => {
    expect(tokenize("Un análisis físico-químico")).toEqual([
      "un",
      "análisis",
      "físico-químico",
    ]);
  });

  it("devuelve una lista vacía para un texto sin palabras", () => {
    expect(tokenize("   123 !!! ")).toEqual([]);
  });
});
