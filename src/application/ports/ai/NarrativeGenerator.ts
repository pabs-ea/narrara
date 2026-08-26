// LLM: generación del cuento y de la moraleja (ADR-002: Genkit la implementa
// en Interface Adapters; INC-02 usa un fake, INC-04 conecta el proveedor real).
export interface NarrativeGenerator {
  generateStory(input: unknown): Promise<unknown>;
  generateMoral(story: unknown): Promise<string>;
}
