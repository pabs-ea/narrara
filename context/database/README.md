# Modelo de datos

> **Estado:** pendiente de definir. La base de datos aún no está decidida; cuando se
> elija, se registrará con un [ADR](../../docs/decisions/README.md) y se rellenará este
> documento.

## Propósito

Describir el modelo de datos de NarrARA: entidades, atributos, relaciones e índices.
Es la referencia rápida para entender qué se persiste y cómo, sin leer migraciones.

## Estructura esperada (a completar)

### Entidades

<!-- Ejemplo de formato a seguir una vez definido el esquema:

#### `usuario`
| Campo        | Tipo         | Notas                              |
| ------------ | ------------ | ---------------------------------- |
| id           | uuid (PK)    |                                    |
| email        | text         | único                              |
| creado_en    | timestamptz  | por defecto now()                  |

#### `cuento`
| Campo        | Tipo         | Notas                              |
| ------------ | ------------ | ---------------------------------- |
| id           | uuid (PK)    |                                    |
| autor_id     | uuid (FK)    | -> usuario.id                      |
| titulo       | text         |                                    |
| perfil       | jsonb        | parámetros de accesibilidad/adaptación |
-->

### Relaciones

<!-- Diagrama entidad-relación o descripción textual. -->

### Notas de migración / seed

<!-- Cómo se crean y pueblan las tablas. -->
