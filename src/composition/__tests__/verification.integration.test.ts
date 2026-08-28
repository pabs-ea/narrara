// @vitest-environment node
import { createContainer } from "../container";

// Integración (T13): el motor CABLEADO con el adaptador real de silabajs
// (silabeador real, no un fake) procesa una narrativa mock de principio a fin.
// Anticipa su uso desde el pipeline (INC-02).
describe("VerificationEngine cableado (composition root)", () => {
  const { verificationEngine } = createContainer();

  const narrative =
    "Había una vez un zorro pequeño. El zorro vivía en un bosque verde. " +
    "Cada mañana buscaba comida entre los árboles.";

  const parameters = {
    readabilityRange: { min: 0, max: null },
    maxLengthPerPage: 30,
    maxSentenceLength: 50,
    allowedFrequencyList: new Set(["x"]),
    maxPercentageWordsOutsideList: 100,
  };

  const input = { narrative, characterNames: new Set<string>(), parameters };

  it("procesa la narrativa y devuelve un VerificationResult coherente", () => {
    const result = verificationEngine.verify(input);

    expect(result.pages.length).toBeGreaterThanOrEqual(1);
    expect(Number.isFinite(result.verdict.details.readability.value)).toBe(true);
    expect(result.verdict.passes).toBe(true);
  });

  it("es determinista con el adaptador real (dos ejecuciones idénticas)", () => {
    expect(verificationEngine.verify(input)).toEqual(
      verificationEngine.verify(input),
    );
  });
});
