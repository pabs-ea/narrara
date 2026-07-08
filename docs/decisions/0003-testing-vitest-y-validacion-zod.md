# 0003. Testing con Vitest y tipado/validación con Zod

- **Estado:** Aceptada
- **Fecha:** 2026-07-08
- **Decisores:** Pablo Esteban

## Contexto y problema

NarrARA necesita dos garantías básicas de calidad desde el inicio, independientes de la
arquitectura de la aplicación pero transversales a todo el código:

1. **Pruebas automatizadas** que cubran la lógica de generación/adaptación de cuentos, la
   validación de entrada y los componentes de UI (incluida la accesibilidad).
2. **Tipado y validación de datos fiables** en las fronteras de confianza (peticiones,
   respuestas del proveedor de IA, variables de entorno, datos externos), para evitar que
   datos con forma inesperada se propaguen por el sistema.

Aunque no son decisiones estrictamente arquitectónicas, condicionan cómo se escribe todo
el código, por lo que se registran para dejar constancia y hacerlas de cumplimiento
obligatorio.

## Opciones consideradas

### Testing
- **Vitest** — runner nativo de Vite, compatible con la API de Jest, soporte ESM/TS/JSX.
- **Jest** — estándar histórico, pero configuración más pesada con ESM/TS.
- **node:test** — integrado en Node, pero ecosistema de DX y mocking más limitado.

### Tipado y validación
- **Zod** — esquemas TypeScript-first con inferencia estática de tipos (`z.infer`).
- **Yup / Valibot / io-ts** — alternativas válidas, menor tracción o DX distinta.
- **Solo tipos de TypeScript** — sin validación en runtime; no protege en las fronteras.

## Decisión

- **Testing:** se adopta **Vitest 4** como runner de tests. Los componentes React se
  probarán con Testing Library sobre `jsdom` (o el *browser mode* de Vitest).
- **Tipado y validación:** se adopta **Zod 4** (`zod@^4`) como **fuente única de verdad**.
  Todo objeto de dominio y toda entrada/salida de datos se modela con un esquema Zod, y los
  tipos de TypeScript se **derivan** del esquema con `z.infer<>` (no se declaran por
  duplicado). La validación (`safeParse`) se aplica en todas las fronteras de confianza.

Ambas versiones se han verificado como vigentes con **context7** antes de fijarlas.

## Consecuencias

### Positivas

- Un único origen para esquema + tipo: menos deriva entre tipos y datos reales.
- Validación en runtime que protege las fronteras (API, IA, entorno) frente a datos mal
  formados.
- Vitest ofrece arranque rápido, watch mode y compatibilidad con la API de Jest, con poca
  configuración sobre un stack TypeScript.

### Negativas / compromisos asumidos

- Zod añade una dependencia de runtime y una pequeña sobrecarga de validación (asumible y
  acotable a las fronteras).
- Falta materializar la configuración de Vitest (dependencias de test y script `pnpm test`);
  se hará como trabajo posterior verificando versiones con context7.

## Alternativas descartadas

- **Jest:** mayor fricción de configuración con ESM/TypeScript frente a Vitest.
- **Solo tipos de TypeScript:** no validan en runtime; no cubren las fronteras de confianza.
- **Yup/Valibot/io-ts:** válidas, pero Zod ofrece mejor DX de inferencia y mayor adopción
  en el ecosistema, reduciendo el riesgo del proyecto.

## Referencias

- Regla de gobernanza obligatoria nº5 (uso de Zod) en [`CLAUDE.md`](../../CLAUDE.md).
- Sección de Testing (Vitest) en [`CLAUDE.md`](../../CLAUDE.md).
- Decisión de stack base: [[0001-stack-tecnologico-base]].
