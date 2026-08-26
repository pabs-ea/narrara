import type { StoryRepository } from "@application/ports/repositories/StoryRepository";

// Anclado a globalThis: el hot reload de Next.js en desarrollo reinicia los
// módulos pero no globalThis, así que el stub no perdería datos entre
// recargas. En producción serverless (ADR-005) cada invocación puede partir
// de una instancia distinta: es un límite conocido del adaptador, no un
// fallo de la arquitectura (INC-00 §9, nota T08).
const globalForStore = globalThis as unknown as {
  __narraraStoryStore?: Map<string, unknown>;
};

const store = globalForStore.__narraraStoryStore ?? new Map<string, unknown>();
globalForStore.__narraraStoryStore = store;

export class InMemoryStoryRepository implements StoryRepository {
  async save(story: unknown): Promise<void> {
    // El id es responsabilidad del llamante hasta que INC-01 defina Story.
    const { id } = story as { id: string };
    store.set(id, story);
  }

  async findById(id: string): Promise<unknown | null> {
    return store.get(id) ?? null;
  }

  async findBySessionId(_sessionId: string): Promise<unknown[]> {
    return Array.from(store.values());
  }

  async delete(id: string): Promise<void> {
    store.delete(id);
  }
}
