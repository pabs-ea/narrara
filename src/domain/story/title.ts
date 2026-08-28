// Value object: título del cuento. Cadena no vacía.

import { assertNonBlank } from "./text-invariants";

export interface Title {
  readonly value: string;
}

export function createTitle(value: string): Title {
  assertNonBlank(value, "El título");
  return { value };
}
