// @vitest-environment node
import { describe, expect, it } from "vitest";

import { tokenize } from "../../text/tokenize";
import { paginate } from "../paginate";

describe("paginate", () => {
  it("deja todo en una página cuando cabe bajo el máximo", () => {
    const { pages, warnings } = paginate("Uno dos tres. Cuatro cinco.", 10);
    expect(pages).toHaveLength(1);
    expect(pages[0]?.text).toBe("Uno dos tres. Cuatro cinco.");
    expect(warnings).toHaveLength(0);
  });

  it("corta por frase completa y reparte en varias páginas (R04, R05)", () => {
    const { pages } = paginate("Uno dos tres. Cuatro cinco seis siete.", 5);
    expect(pages.map((p) => p.text)).toEqual([
      "Uno dos tres.",
      "Cuatro cinco seis siete.",
    ]);
    // Ninguna página supera el máximo y ninguna palabra queda partida.
    for (const page of pages) {
      expect(tokenize(page.text).length).toBeLessThanOrEqual(5);
    }
  });

  it("genera tantas páginas como haga falta para el sobrante (R06)", () => {
    const { pages } = paginate("Uno dos. Tres cuatro. Cinco seis. Siete ocho.", 3);
    expect(pages).toHaveLength(4);
    for (const page of pages) {
      expect(tokenize(page.text).length).toBeLessThanOrEqual(3);
    }
  });

  it("acepta una frase única sobredimensionada con un warning (R07)", () => {
    const { pages, warnings } = paginate(
      "Hola. Uno dos tres cuatro cinco.",
      3,
    );
    expect(pages.map((p) => p.text)).toEqual([
      "Hola.",
      "Uno dos tres cuatro cinco.",
    ]);
    // La página sobredimensionada se acepta (supera el máximo).
    expect(tokenize(pages[1]?.text ?? "").length).toBe(5);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.dimension).toBe("pageLength");
    expect(warnings[0]?.severity).toBe("warning");
    expect(warnings[0]?.pageIndex).toBe(1);
  });

  it("es determinista: dos ejecuciones dan el mismo resultado (R08)", () => {
    const narrative = "Uno dos tres. Cuatro cinco seis siete. Ocho nueve.";
    const first = paginate(narrative, 5);
    const second = paginate(narrative, 5);
    expect(first).toEqual(second);
  });
});
