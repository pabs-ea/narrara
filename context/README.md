# Contexto del proyecto

Esta carpeta es la **fuente de verdad** del conocimiento estructural del proyecto:
modelo de datos, contratos de API y vocabulario de dominio. Sirve tanto al equipo como
al agente de IA (Claude Code) para trabajar con información fiable y actualizada, sin
tener que deducirla del código.

## Qué guardar aquí

| Subcarpeta   | Contenido                                                                 |
| ------------ | ------------------------------------------------------------------------- |
| `database/`  | Modelo de datos, esquema, entidades y relaciones.                         |
| `apis/`      | Contratos de las APIs internas (Route Handlers) y de servicios externos.  |
| `domain/`    | Glosario y reglas del dominio (cuentos, accesibilidad, adaptación).       |

## Cómo mantenerla

- Mantén estos documentos **sincronizados con la realidad**: si cambia el esquema o un
  endpoint, actualiza el fichero correspondiente en el mismo cambio.
- Las decisiones sobre *por qué* algo es así van en un
  [ADR](../docs/decisions/README.md), no aquí. Aquí se describe *qué* es, no *por qué*.
- Cuando se defina el stack de backend (proveedor de IA y base de datos), rellena los
  placeholders de `database/` y `apis/` y registra la elección con un ADR.
