// Página de un cuento: un fragmento de texto no vacío. Es una entidad del
// dominio puro (sin I/O); su invariante se comprueba en la construcción.

import { assertNonBlank } from "./text-invariants";

export interface Page {
  readonly text: string;
}

export function createPage(text: string): Page {
  assertNonBlank(text, "El texto de una página");
  return { text };
}
