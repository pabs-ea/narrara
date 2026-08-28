// Value object: moraleja del cuento. Cadena no vacía.

import { assertNonBlank } from "./text-invariants";

export interface Moral {
  readonly value: string;
}

export function createMoral(value: string): Moral {
  assertNonBlank(value, "La moraleja");
  return { value };
}
