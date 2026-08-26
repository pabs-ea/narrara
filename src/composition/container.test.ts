// @vitest-environment node
import { createContainer } from "./container";

describe("composition root", () => {
  it("ensambla un StoryRepository cuyos métodos devuelven Promise", async () => {
    const { storyRepository } = createContainer();

    const savePromise = storyRepository.save({ id: "story-1" });
    expect(savePromise).toBeInstanceOf(Promise);
    await savePromise;

    const found = await storyRepository.findById("story-1");
    expect(found).toEqual({ id: "story-1" });
  });

  it("borra un story guardado", async () => {
    const { storyRepository } = createContainer();
    await storyRepository.save({ id: "story-2" });
    await storyRepository.delete("story-2");
    expect(await storyRepository.findById("story-2")).toBeNull();
  });
});
