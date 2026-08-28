// Paginación determinista de texto continuo (SPEC-01 R04-R08, ADR-014). Reparte
// la narrativa en páginas de hasta `maxLengthPerPage` PALABRAS, cortando siempre
// por frase completa (nunca a mitad de palabra ni de frase). El número de
// páginas emerge del reparto. Función pura y determinista (sin aleatoriedad);
// reutiliza el mismo criterio de frase que R01/R03.
//
// Caso límite (R07): una frase única más larga que el máximo no puede partirse
// sin romperla → se acepta su página sobredimensionada y se emite un `Finding`
// de severidad `warning` (dimensión `pageLength`, con `pageIndex`). Esa página
// NO hace fallar `pageLength.passes`; la decisión de regenerar es del
// orquestador (INC-02).

import type { Finding } from "../contract";
import { createPage, type Page } from "../../story/page";
import { segmentSentences } from "../text/segment-sentences";
import { tokenize } from "../text/tokenize";

export interface PaginationResult {
  readonly pages: Page[];
  readonly warnings: Finding[];
}

export function paginate(
  narrative: string,
  maxLengthPerPage: number,
): PaginationResult {
  const sentences = segmentSentences(narrative);
  const pages: Page[] = [];
  const warnings: Finding[] = [];

  let current: string[] = [];
  let currentWords = 0;

  const flush = (): void => {
    if (current.length === 0) return;
    pages.push(createPage(current.join(" ")));
    current = [];
    currentWords = 0;
  };

  for (const sentence of sentences) {
    const words = tokenize(sentence).length;

    // Frase única sobredimensionada: página propia aceptada + warning (R07).
    if (words > maxLengthPerPage) {
      flush();
      pages.push(createPage(sentence));
      warnings.push({
        dimension: "pageLength",
        severity: "warning",
        message: `Frase única de ${words} palabras supera el máximo de ${maxLengthPerPage} por página; página aceptada como sobredimensionada.`,
        pageIndex: pages.length - 1,
      });
      continue;
    }

    // Si añadir la frase excede el máximo, cierra la página actual (R05).
    if (currentWords + words > maxLengthPerPage && current.length > 0) {
      flush();
    }

    current.push(sentence);
    currentWords += words;
  }

  flush();

  return { pages, warnings };
}
