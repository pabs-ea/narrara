// Contrato del motor de verificación (SPEC-01 v1.2.0 §3), expresado con
// esquemas Zod como fuente única de verdad (regla de gobernanza nº5). Los
// tipos de TypeScript se derivan con z.infer; nunca se declaran a mano.

import { z } from "zod";

import { PageSchema } from "../story/page";

// --- Entrada -------------------------------------------------------------

// Parámetros de verificación, derivados del perfil y de la tabla maestra.
// readabilityRange en unidades IFSZ (ADR-012): min inclusivo; max EXCLUSIVO;
// max = null significa "sin techo".
export const VerificationParametersSchema = z
  .object({
    readabilityRange: z.object({ min: z.number(), max: z.number().nullable() }),
    maxLengthPerPage: z.number().int().positive(), // palabras por página
    maxSentenceLength: z.number().int().positive(), // palabras por frase (máximo)
    allowedFrequencyList: z
      .set(z.string())
      .refine((s) => s.size > 0, {
        error: "allowedFrequencyList no puede estar vacía.",
      }),
    maxPercentageWordsOutsideList: z.number().min(0).max(100), // porcentaje 0-100
  })
  .refine(
    (p) =>
      p.readabilityRange.max === null ||
      p.readabilityRange.min <= p.readabilityRange.max,
    {
      error:
        "readabilityRange.min no puede ser mayor que readabilityRange.max.",
      path: ["readabilityRange"],
    },
  );

export type VerificationParameters = z.infer<
  typeof VerificationParametersSchema
>;

// Entrada completa del motor: narrativa continua (sin moraleja, sin paginar),
// nombres propios de personajes (excluidos del vocabulario, R02) y parámetros.
export const VerificationInputSchema = z.object({
  narrative: z.string(),
  characterNames: z.set(z.string()),
  parameters: VerificationParametersSchema,
});

export type VerificationInput = z.infer<typeof VerificationInputSchema>;

// --- Salida --------------------------------------------------------------

export const SeveritySchema = z.enum(["error", "warning"]);
export type Severity = z.infer<typeof SeveritySchema>;

export const FindingSchema = z.object({
  dimension: z.enum([
    "readability",
    "vocabulary",
    "sentenceLength",
    "pageLength",
  ]),
  severity: SeveritySchema,
  message: z.string(),
  pageIndex: z.number().int().nonnegative().optional(), // si aplica a una página
});
export type Finding = z.infer<typeof FindingSchema>;

export const VerificationVerdictSchema = z.object({
  passes: z.boolean(),
  details: z.object({
    readability: z.object({ value: z.number(), passes: z.boolean() }), // IFSZ obtenido
    vocabulary: z.object({
      percentageOutside: z.number(),
      passes: z.boolean(),
    }),
    sentenceLength: z.object({ maxFound: z.number(), passes: z.boolean() }), // frase más larga
    pageLength: z.object({
      passes: z.boolean(),
      offendingPages: z.array(z.number().int()),
    }),
  }),
});
export type VerificationVerdict = z.infer<typeof VerificationVerdictSchema>;

export const VerificationResultSchema = z.object({
  verdict: VerificationVerdictSchema,
  pages: z.array(PageSchema), // resultado de la paginación (siempre presente)
  warnings: z.array(FindingSchema),
});
export type VerificationResult = z.infer<typeof VerificationResultSchema>;

// --- Errores -------------------------------------------------------------

// Entrada inválida (SPEC-01 §3): no produce veredicto, se lanza esta excepción.
export class InvalidVerificationInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidVerificationInputError";
  }
}
