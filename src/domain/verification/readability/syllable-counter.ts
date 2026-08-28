// Contrato de dominio para contar sílabas (la S del IFSZ, ADR-012). El dominio
// depende SOLO de este tipo función; la implementación concreta (silabajs) vive
// en un adaptador (`src/adapters/text/`) y se INYECTA en el cálculo de
// legibilidad. Así el motor sigue siendo puro (SPEC-01-R11) y el silabeador es
// sustituible por el fallback propio sin tocar el dominio (ADR-015).

export type SyllableCounter = (word: string) => number;
