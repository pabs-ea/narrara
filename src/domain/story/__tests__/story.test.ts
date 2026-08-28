// @vitest-environment node
import { describe, expect, it } from "vitest";

import { createMoral } from "../moral";
import { createPage } from "../page";
import { createStory } from "../story";
import { createTitle } from "../title";

describe("Page", () => {
  it("se construye con texto válido y expone su contenido", () => {
    const page = createPage("Había una vez un zorro que soñaba.");
    expect(page.text).toBe("Había una vez un zorro que soñaba.");
  });

  it("rechaza texto vacío", () => {
    expect(() => createPage("")).toThrow();
  });

  it("rechaza texto que solo contiene espacios", () => {
    expect(() => createPage("   \n\t  ")).toThrow();
  });
});

describe("Title", () => {
  it("se construye con un valor válido", () => {
    const title = createTitle("El zorro que soñaba");
    expect(title.value).toBe("El zorro que soñaba");
  });

  it("rechaza un valor vacío o solo espacios", () => {
    expect(() => createTitle("")).toThrow();
    expect(() => createTitle("   ")).toThrow();
  });
});

describe("Moral", () => {
  it("se construye con un valor válido", () => {
    const moral = createMoral("Soñar en grande abre caminos.");
    expect(moral.value).toBe("Soñar en grande abre caminos.");
  });

  it("rechaza un valor vacío o solo espacios", () => {
    expect(() => createMoral("")).toThrow();
    expect(() => createMoral("   ")).toThrow();
  });
});

describe("Story", () => {
  const title = createTitle("El zorro que soñaba");
  const moral = createMoral("Soñar en grande abre caminos.");
  const pages = [createPage("Había una vez un zorro."), createPage("Y fue feliz.")];

  it("se construye con título, moraleja y al menos una página", () => {
    const story = createStory({ title, moral, pages });
    expect(story.title).toBe(title);
    expect(story.moral).toBe(moral);
    expect(story.pages).toHaveLength(2);
  });

  it("expone las páginas como colección de solo lectura", () => {
    const story = createStory({ title, moral, pages });
    expect(story.pages[0]?.text).toBe("Había una vez un zorro.");
  });

  it("rechaza un cuento sin páginas", () => {
    expect(() => createStory({ title, moral, pages: [] })).toThrow();
  });
});
