// Cupo de generación por sesión con autoridad en servidor (ADR-006): borrar
// y regenerar no devuelve cupo; el cliente nunca decide su propio límite.
export interface QuotaCounter {
  getRemainingQuota(sessionId: string): Promise<number>;
  consumeGeneration(sessionId: string): Promise<void>;
}
