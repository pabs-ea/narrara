// Página de un cuento: un fragmento de texto no en blanco. Es una entidad del
// dominio puro (sin I/O). El esquema Zod es la fuente única de verdad de su
// forma (regla de gobernanza nº5); el tipo se deriva con z.infer.

import { z } from "zod";

export const PageSchema = z.object({
  text: z.string().refine((t) => t.trim().length > 0, {
    error: "El texto de una página no puede estar vacío.",
  }),
});

export type Page = z.infer<typeof PageSchema>;

export function createPage(text: string): Page {
  return PageSchema.parse({ text });
}
