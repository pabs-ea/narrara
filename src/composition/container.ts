import { InMemoryStoryRepository } from "@adapters/persistence/in-memory/InMemoryStoryRepository";
import { silabajsSyllableCounter } from "@adapters/text/silabajs-syllable-counter";
import type { StoryRepository } from "@application/ports/repositories/StoryRepository";
import {
  createVerificationEngine,
  type VerificationEngine,
} from "@domain/verification/verification-engine";

// Único punto autorizado a instanciar adaptadores concretos (ADR-004). Aquí se
// inyecta el silabeador real (silabajs) en el motor de verificación puro, único
// punto de contacto del dominio con la librería externa (SPEC-01-R11, ADR-015).
export interface Container {
  storyRepository: StoryRepository;
  verificationEngine: VerificationEngine;
}

export function createContainer(): Container {
  return {
    storyRepository: new InMemoryStoryRepository(),
    verificationEngine: createVerificationEngine(silabajsSyllableCounter),
  };
}
