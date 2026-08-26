# ADR-011 — Testing con Vitest y tipado/validación con Zod

- **Versión:** v1.1.0
- **Fecha:** 2026-08-26 (v1.0.0: 2026-07-08, registrada como ADR-0003 en el esquema MADR previo)
- **Estado:** ✅ **Aceptada** · **Fecha de aceptación:** 2026-07-08
- **Decisores:** autor del TFM
- **Relacionado con:** ADR-009 (stack base); ADR-003 (persistencia diferida, contrato async testeable); CLAUDE.md (regla de gobernanza nº5, Zod; sección de testing)

> **Nota de reconciliación (v1.1.0).** Migración del antiguo **ADR-0003** (formato MADR, numeración `0003`) al esquema unificado `ADR-NNN`. El contenido no cambia de fondo.

---

## Contexto

NarrARA necesita dos garantías básicas de calidad desde el inicio, transversales a todo el código:

1. **Pruebas automatizadas** que cubran la lógica de generación/adaptación de cuentos, la validación de entrada y los componentes de UI (incluida la accesibilidad).
2. **Tipado y validación de datos fiables** en las fronteras de confianza (peticiones, respuestas del proveedor de IA, variables de entorno, datos externos), para evitar que datos con forma inesperada se propaguen por el sistema.

Aunque no son decisiones estrictamente arquitectónicas, condicionan cómo se escribe todo el código, por lo que se registran para dejar constancia y hacerlas de cumplimiento obligatorio.

---

## Decisión

- **Testing:** se adopta **Vitest 4** como runner de tests. Los componentes React se prueban con Testing Library sobre `jsdom` (o el *browser mode* de Vitest).
- **Tipado y validación:** se adopta **Zod 4** (`zod@^4`) como **fuente única de verdad**. Todo objeto de dominio y toda entrada/salida de datos se modela con un esquema Zod, y los tipos de TypeScript se **derivan** del esquema con `z.infer<>` (no se declaran por duplicado). La validación (`safeParse`) se aplica en todas las fronteras de confianza.

Ambas versiones se han verificado como vigentes con **context7** antes de fijarlas.

---

## Justificación

- **Un único origen para esquema + tipo:** menos deriva entre tipos declarados y datos reales.
- **Validación en runtime** que protege las fronteras (API, IA, entorno) frente a datos mal formados.
- **DX de Vitest:** arranque rápido, watch mode y compatibilidad con la API de Jest, con poca configuración sobre un stack TypeScript.

---

## Alternativas consideradas

### Testing
- **Jest** — estándar histórico, pero mayor fricción de configuración con ESM/TypeScript frente a Vitest.
- **node:test** — integrado en Node, pero ecosistema de DX y mocking más limitado.

### Tipado y validación
- **Solo tipos de TypeScript** — no validan en runtime; no cubren las fronteras de confianza.
- **Yup / Valibot / io-ts** — válidas, pero Zod ofrece mejor DX de inferencia y mayor adopción en el ecosistema, reduciendo el riesgo del proyecto.

---

## Consecuencias

**Positivas:**
- Un único origen para esquema + tipo: menos deriva entre tipos y datos reales.
- Validación en runtime que protege las fronteras (API, IA, entorno).
- Vitest ofrece arranque rápido, watch mode y compatibilidad con la API de Jest.

**Negativas / riesgos:**
- Zod añade una dependencia de runtime y una pequeña sobrecarga de validación (asumible y acotable a las fronteras).
- El contrato `Promise<T>` de la persistencia diferida (**ADR-003**) exige tests conscientes de la asincronía desde el día uno.

---

## Notas de trazabilidad

- Migra el antiguo **ADR-0003** (`0003-testing-vitest-y-validacion-zod.md`) al esquema unificado `ADR-NNN`.
- Materializa la **regla de gobernanza obligatoria nº5** (uso de Zod) y la sección de testing de **CLAUDE.md**.
- Se apoya en el stack base de **ADR-009** y complementa el contrato async de **ADR-003**.
