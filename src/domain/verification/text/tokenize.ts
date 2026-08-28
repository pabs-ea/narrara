// Tokenización de palabras del español para las métricas del motor (P en el
// IFSZ, vocabulario, longitud de frase). Función pura y determinista.
//
// Una palabra es una secuencia maximal de letras Unicode (tildes y ñ incluidas)
// que puede llevar guiones internos entre grupos de letras (p. ej.
// "físico-químico"). Se ignoran los signos de puntuación y los números sueltos.
// Los tokens se normalizan a minúsculas para comparar sin distinguir
// mayúsculas.

const WORD_PATTERN = /\p{L}+(?:-\p{L}+)*/gu;

export function tokenize(text: string): string[] {
  const matches = text.toLowerCase().match(WORD_PATTERN);
  return matches ?? [];
}
