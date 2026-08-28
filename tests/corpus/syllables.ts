// Corpus de recuento silábico conocido para validar el silabeador del español
// (ADR-015). Cubre los casos que "mueven" el conteo de sílabas (S) y, con él,
// el IFSZ: hiato, diptongo, triptongo, «h» muda y «y» semivocal. Se usa en
// INC-01-T05 (validación del adaptador `silabajs`) y es reutilizable por el
// fallback propio si hiciera falta. Activo del capítulo de evaluación (T14).

export interface SyllableCase {
  readonly word: string;
  readonly syllables: number;
  /** Fenómeno silábico que ilustra el caso. */
  readonly phenomenon: string;
}

export const SYLLABLE_CORPUS: ReadonlyArray<SyllableCase> = [
  { word: "ríe", syllables: 2, phenomenon: "hiato acentual (rí-e)" },
  { word: "cielo", syllables: 2, phenomenon: "diptongo creciente (cie-lo)" },
  { word: "buey", syllables: 1, phenomenon: "triptongo (buey)" },
  { word: "ahora", syllables: 3, phenomenon: "h muda (a-ho-ra)" },
  { word: "rey", syllables: 1, phenomenon: "y como semivocal (rey)" },
];
