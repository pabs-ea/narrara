// Validación de la entrada del motor (SPEC-01 §3). Se apoya en el esquema Zod
// del contrato (T02) mediante `safeParse`. Ante cualquier fallo lanza
// `InvalidVerificationInputError` (NO devuelve un veredicto). Además de las
// reglas del esquema, exige que la narrativa no sea vacía ni solo espacios.

import type { z } from "zod";

import {
  InvalidVerificationInputError,
  VerificationInputSchema,
  type VerificationInput,
} from "./contract";

// Mensaje legible que identifica el campo que falla (ruta Zod → mensaje).
function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join(".") || "(raíz)";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}

export function validateInput(input: unknown): VerificationInput {
  const parsed = VerificationInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new InvalidVerificationInputError(formatIssues(parsed.error));
  }

  if (parsed.data.narrative.trim().length === 0) {
    throw new InvalidVerificationInputError(
      "narrative: la narrativa no puede estar vacía.",
    );
  }

  return parsed.data;
}
