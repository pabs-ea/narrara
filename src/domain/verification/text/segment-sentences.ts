// Segmentación de frases del español. Función pura y determinista. Su criterio
// de fin de frase es ÚNICO y lo comparten el IFSZ (conteo de frases F, R01), la
// longitud de frase (R03) y la paginación (R04-R08).
//
// Reglas:
// - Corta en los signos terminales `.`, `!`, `?` (y `…`), colapsando varios
//   seguidos en un único corte (p. ej. "?!").
// - No corta si el punto pertenece a una abreviatura conocida ("Sr.", "etc."…).
// - Mantiene las comillas/paréntesis de cierre inmediatos dentro de la frase
//   (diálogos: `«… .»`).

const TERMINALS = new Set([".", "!", "?", "…"]);
const CLOSERS = new Set(["»", '"', "”", "'", "’", ")", "]"]);

// Abreviaturas frecuentes cuyo punto no cierra frase. Ampliable vía opciones.
export const DEFAULT_ABBREVIATIONS: ReadonlySet<string> = new Set([
  "sr",
  "sra",
  "srta",
  "dr",
  "dra",
  "d",
  "dña",
  "ud",
  "uds",
  "etc",
  "ej",
  "vs",
  "art",
  "núm",
  "pág",
  "vol",
  "cap",
]);

export interface SegmentOptions {
  readonly abbreviations?: ReadonlySet<string>;
}

// Palabra (secuencia de letras) inmediatamente anterior a la posición dada.
function precedingWord(text: string, dotIndex: number): string {
  let start = dotIndex;
  while (start > 0 && /\p{L}/u.test(text.charAt(start - 1))) {
    start -= 1;
  }
  return text.slice(start, dotIndex);
}

export function segmentSentences(
  text: string,
  options?: SegmentOptions,
): string[] {
  const abbreviations = options?.abbreviations ?? DEFAULT_ABBREVIATIONS;
  const sentences: string[] = [];
  const length = text.length;
  let start = 0;
  let i = 0;

  while (i < length) {
    const char = text.charAt(i);
    if (!TERMINALS.has(char)) {
      i += 1;
      continue;
    }

    // Colapsa signos terminales consecutivos y absorbe cierres inmediatos.
    let end = i + 1;
    while (end < length && TERMINALS.has(text.charAt(end))) end += 1;
    while (end < length && CLOSERS.has(text.charAt(end))) end += 1;

    // El punto de una abreviatura conocida no cierra frase (`!`/`?` sí cortan).
    const isAbbreviation =
      char === "." &&
      abbreviations.has(precedingWord(text, i).toLowerCase());

    if (!isAbbreviation) {
      const sentence = text.slice(start, end).trim();
      if (sentence.length > 0) sentences.push(sentence);
      start = end;
    }

    i = end;
  }

  const tail = text.slice(start).trim();
  if (tail.length > 0) sentences.push(tail);

  return sentences;
}
