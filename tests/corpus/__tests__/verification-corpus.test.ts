// @vitest-environment node
import { createContainer } from "../../../src/composition/container";
import { InvalidVerificationInputError } from "../../../src/domain/verification/contract";
import { VERIFICATION_CORPUS } from "../verification-cases";

// Valida el corpus de evaluación (INC-01-T14) contra el motor REAL cableado con
// silabajs (composition root). Cada caso referencia su escenario Gherkin de
// SPEC-01 §5 (DoD12); el conjunto cubre al menos un caso que pasa y uno que
// falla por cada dimensión (DoD13).
const { verificationEngine } = createContainer();

function inputOf(index: number) {
  const testCase = VERIFICATION_CORPUS[index]!;
  return {
    narrative: testCase.narrative,
    characterNames: new Set(testCase.characterNames),
    parameters: {
      ...testCase.parameters,
      allowedFrequencyList: new Set(testCase.parameters.allowedFrequencyList),
    },
  };
}

describe("Corpus de verificación (SPEC-01 §5)", () => {
  VERIFICATION_CORPUS.forEach((testCase, index) => {
    describe(`SPEC-01 / escenario: ${testCase.scenario}`, () => {
      it(`[${testCase.id}] produce el veredicto esperado`, () => {
        const { verdict, pages, warnings } =
          verificationEngine.verify(inputOf(index));
        const { expected } = testCase;

        expect(verdict.passes).toBe(expected.verdictPasses);

        if (expected.readabilityPasses !== undefined) {
          expect(verdict.details.readability.passes).toBe(
            expected.readabilityPasses,
          );
        }
        if (expected.vocabularyPasses !== undefined) {
          expect(verdict.details.vocabulary.passes).toBe(
            expected.vocabularyPasses,
          );
        }
        if (expected.sentenceLengthPasses !== undefined) {
          expect(verdict.details.sentenceLength.passes).toBe(
            expected.sentenceLengthPasses,
          );
        }
        if (expected.pageLengthPasses !== undefined) {
          expect(verdict.details.pageLength.passes).toBe(
            expected.pageLengthPasses,
          );
        }
        if (expected.minPages !== undefined) {
          expect(pages.length).toBeGreaterThanOrEqual(expected.minPages);
        }
        if (expected.warnings !== undefined) {
          expect(warnings).toHaveLength(expected.warnings);
        }
      });
    });
  });

  it("SPEC-01 / escenario: Determinismo — dos ejecuciones idénticas", () => {
    const input = inputOf(0);
    expect(verificationEngine.verify(input)).toEqual(
      verificationEngine.verify(input),
    );
  });

  it("SPEC-01 / escenario: Entrada inválida — lanza InvalidVerificationInputError", () => {
    const input = { ...inputOf(0), narrative: "" };
    expect(() => verificationEngine.verify(input)).toThrow(
      InvalidVerificationInputError,
    );
  });
});
