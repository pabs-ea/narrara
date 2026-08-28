// Entidad agregada: un cuento con título, moraleja y al menos una página.
// Entidad del dominio puro; su invariante (≥1 página) se comprueba al construir.

import type { Moral } from "./moral";
import type { Page } from "./page";
import type { Title } from "./title";

export interface Story {
  readonly title: Title;
  readonly moral: Moral;
  readonly pages: readonly Page[];
}

export interface CreateStoryInput {
  readonly title: Title;
  readonly moral: Moral;
  readonly pages: readonly Page[];
}

export function createStory({ title, moral, pages }: CreateStoryInput): Story {
  if (pages.length === 0) {
    throw new Error("Un cuento debe tener al menos una página.");
  }
  return { title, moral, pages };
}
