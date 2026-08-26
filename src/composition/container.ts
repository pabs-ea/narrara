import { InMemoryStoryRepository } from "@adapters/persistence/in-memory/InMemoryStoryRepository";
import type { StoryRepository } from "@application/ports/repositories/StoryRepository";

// Único punto autorizado a instanciar adaptadores concretos (ADR-004).
export interface Container {
  storyRepository: StoryRepository;
}

export function createContainer(): Container {
  return {
    storyRepository: new InMemoryStoryRepository(),
  };
}
