// Adaptador del silabeador: implementa el contrato de dominio `SyllableCounter`
// envolviendo la librería `silabajs` (ADR-015). Es el ÚNICO punto que importa
// `silabajs`; el dominio no la conoce. Se cablea en el composition root
// (INC-01-T13). Si el corpus de validación revelara errores de cálculo, este
// adaptador se sustituye por una implementación propia por reglas sin tocar el
// tipo `SyllableCounter` ni el dominio (fallback de ADR-015).

import { getSyllables } from "silabajs";

import type { SyllableCounter } from "@domain/verification/readability/syllable-counter";

export const silabajsSyllableCounter: SyllableCounter = (word) =>
  getSyllables(word).syllableCount;
