// @vitest-environment node
//
// Ejemplo de test de backend en entorno Node (sin DOM): valida un esquema Zod,
// tal como se hará con la lógica de servidor y los objetos de dominio.
// Sirve como plantilla y verificación; puedes eliminarlo.
import { z } from "zod";

const CuentoSchema = z.object({
  titulo: z.string().min(1),
  contenido: z.string().min(1),
});

describe("Test de backend (node) con Zod", () => {
  it("valida un objeto de dominio correcto", () => {
    const result = CuentoSchema.safeParse({
      titulo: "El zorro y las uvas",
      contenido: "Había una vez...",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un objeto de dominio inválido", () => {
    const result = CuentoSchema.safeParse({ titulo: "", contenido: "" });
    expect(result.success).toBe(false);
  });
});
