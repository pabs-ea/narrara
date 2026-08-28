// Invariante de texto compartida por los value objects/entidades del cuento:
// una cadena que, tras recortar espacios, no queda vacía. Centraliza el
// chequeo para que los mensajes de error sean coherentes.

export function assertNonBlank(value: string, label: string): void {
  if (value.trim().length === 0) {
    throw new Error(`${label} no puede estar vacío.`);
  }
}
