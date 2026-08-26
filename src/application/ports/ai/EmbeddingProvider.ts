// Deduplicación de cuentos por similitud (RF-12), sobre pgvector en INC-05.
export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
}
