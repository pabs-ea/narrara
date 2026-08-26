# ADR-002 — Genkit como framework del adaptador de IA (tras las interfaces de servicio)

- **Versión:** v1.1.0
- **Fecha:** 2026-08-21 (v1.0.0: 2026-07-06)
- **Estado:** ✅ **Aceptada** · **Fecha de aceptación:** 2026-08-25
- **Decisores:** autor del TFM
- **Relacionado con:** NarrARA (principal) §5, §6; Consolidación §3.2, §3.5, §3.6; ADR-001

> **Cambios en v1.1.0:** reconciliación terminológica a **Clean Architecture** (sustituye a «puertos hexagonales»). Los «puertos de IA» pasan a denominarse **interfaces de servicio definidas en la capa de Use Cases** e implementadas por adaptadores en **Interface Adapters**. La decisión y su justificación **no cambian**.

---

## Contexto

El pipeline de generación de cuentos requiere orquestar múltiples llamadas a servicios de IA (LLM para cuento y moraleja, LLM-as-judge para coherencia, moderación, TTS), con parsing de salidas estructuradas, reintentos y observabilidad.

Escribir esta fontanería a mano es costoso y repetitivo. Genkit (framework open-source de Google) ofrece un SDK de TypeScript de primera clase con APIs unificadas para múltiples proveedores, *flows* componibles, structured outputs, tool calling y una Developer UI local para depurar trazas.

La restricción de stack del proyecto (todo JavaScript/TypeScript, nada de Python) se respeta con el SDK de TS de Genkit.

---

## Decisión

**Se adopta Genkit como framework de implementación del adaptador de IA**, situado en la capa **Interface Adapters**, **detrás de las interfaces de servicio de IA** definidas por la capa de Use Cases (`LLMService`, `TTSService`, `ModerationService`, etc.).

Genkit es un **detalle de implementación de la capa de Interface Adapters**, no un componente de arquitectura. Las Entities y los Use Cases **no saben que Genkit existe**: interactúan exclusivamente con las interfaces que ellos mismos definen, respetando la regla de dependencia hacia dentro.

---

## Justificación

- **Interfaz de IA intercambiable resuelta casi gratis:** el diferenciador del proyecto exige demostrar **≥2 adaptadores para una misma interfaz de servicio** (RNF-08). Genkit permite cambiar de proveedor cambiando la referencia de modelo, cubriendo ese requisito con coste mínimo.
- **Encaje directo con el pipeline:** los pasos generar → verificar → moraleja → moderar → entregar se expresan como composición de *flows* con structured outputs y tool calling integrados.
- **Aceleración y legibilidad:** elimina fontanería manual de llamadas, reintentos, parsing y streaming. Menos código propio en la parte "comprada", más legible.
- **Observabilidad para desarrollo y defensa:** la Developer UI local permite depurar y **mostrar trazas de ejecución en el vídeo del TFM**, reforzando la demostración técnica.

---

## Límites y salvaguardas (crítico para la tesis)

- **Genkit NO entra en Entities ni en Use Cases.** La contribución técnica defendible del proyecto es **verificar, moderar y evaluar**, no generar. El motor de verificación, la lógica de rebalanceo en cascada, el LLM-as-judge de la moraleja y los guardarraíles son **código propio del dominio (capa Entities)**, testeables con Vitest **sin Genkit delante**.
- **Regla de aislamiento:** Genkit vive exclusivamente en Interface Adapters, tras las interfaces de servicio de IA. Si Genkit se convirtiera en el centro del proyecto, diluiría justo lo que hace defendible el TFM. La **regla de dependencia impuesta por linter** (INC-00-T06) hace de esta salvaguarda algo verificable automáticamente, no solo una intención.
- **Evitar atadura a Firebase:** el SDK está sesgado hacia el ecosistema Google (Gemini, despliegue en Firebase/Cloud Run). Se usa Genkit como librería del adaptador, **sin** adoptar Firebase como plataforma, para no chocar con PostgreSQL + pgvector.

---

## Alternativas consideradas

### SDKs de proveedor directos (OpenAI SDK, Anthropic SDK, etc.) + orquestación propia
- **A favor:** cero dependencia de framework intermedio; control total.
- **En contra:** mayor volumen de código propio de fontanería; el requisito de ≥2 adaptadores intercambiables hay que construirlo íntegramente a mano.
- **Motivo del descarte:** el coste no aporta valor a la tesis (la generación es la parte "comprada"); Genkit acelera esa capa sin comprometer el dominio.

### Otros frameworks de orquestación (p. ej. LangChain.js)
- **En contra:** mayor peso, curva y superficie de la necesaria para el MVP; menos alineado con el objetivo de "ligero y legible".
- **Motivo del descarte:** Genkit ofrece mejor relación ligereza/DX para el alcance del proyecto y SDK de TS de primera clase.

---

## Consecuencias

**Positivas:**
- Adaptador de IA más rápido de construir y más legible.
- Requisito de ≥2 adaptadores por interfaz prácticamente cubierto.
- Observabilidad aprovechable en desarrollo y en el vídeo de defensa.

**Negativas / riesgos:**
- Dependencia de un framework de terceros en la capa de Interface Adapters (aislada del núcleo, por lo que el riesgo es acotado).
- Sesgo del ecosistema hacia Google; requiere disciplina para no arrastrar Firebase.

---

## Notas de trazabilidad

- Actualiza **NarrARA (principal) §5** (Genkit como librería del adaptador de IA) y **§6** (vive tras las interfaces de servicio) — ✅ aplicado en troncal v1.5.0.
- Actualiza **Consolidación §3.5 y §3.6** — ✅ aplicado en Consolidación v1.1.0.
- Asume la decisión de **ADR-001** (integración sobre Next.js full-stack).
- **Nomenclatura:** identificadores de código en **inglés** en todas las capas; lenguaje natural (prosa, Gherkin, historias de usuario) en español. Decisión aplicada en este ADR, en INC-00 y en SPEC-01 (Especificaciones v1.1.0).
