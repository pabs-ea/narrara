// Guardarraíl de seguridad: pasada única sobre cuento + moraleja (RF-07).
export interface ContentModerator {
  moderate(content: string): Promise<unknown>;
}
