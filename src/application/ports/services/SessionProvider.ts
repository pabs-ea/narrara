// Identidad de la sesión anónima (ADR-008: sin cuentas). Ancla la propiedad
// de cuentos y perfiles a un identificador opaco de sesión, no a un usuario.
export interface SessionProvider {
  getOrCreateSessionId(): Promise<string>;
}
