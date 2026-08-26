// Persistencia de cuentos (ADR-003: interfaz async desde el día uno; ADR-008:
// anclada a la sesión anónima, no a una cuenta). El adaptador in-memory de
// INC-00 la implementa como stub; Postgres llega en INC-05.
export interface StoryRepository {
  save(story: unknown): Promise<void>;
  findById(id: string): Promise<unknown | null>;
  findBySessionId(sessionId: string): Promise<unknown[]>;
  delete(id: string): Promise<void>;
}
