// TTS por página. Dos adaptadores (Web Speech API y nube) cubren RNF-08 al
// demostrar la intercambiabilidad de una misma interfaz (ADR-006).
export interface SpeechSynthesizer {
  synthesizePageAudio(pageText: string): Promise<unknown>;
}
