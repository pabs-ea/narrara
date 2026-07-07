# Contratos de API

> **Estado:** pendiente de definir. Se irá completando a medida que se creen los
> endpoints y se integren servicios externos.

## Propósito

Documentar los contratos de las APIs que usa NarrARA, tanto las **internas** (Route
Handlers de Next.js en `app/`) como las **externas** (proveedor de IA generativa y
otros servicios de terceros).

## APIs internas (Route Handlers)

<!-- Ejemplo de formato a seguir:

### `POST /api/cuentos`
Genera un cuento a partir de un prompt y un perfil de accesibilidad.

- **Request** (`application/json`):
  | Campo   | Tipo   | Req. | Descripción                          |
  | ------- | ------ | ---- | ------------------------------------ |
  | tema    | string | sí   | Tema del cuento                      |
  | perfil  | object | no   | Parámetros de adaptación/accesibilidad |

- **Response 200** (`application/json`): `{ id, titulo, contenido }`
- **Errores:** 400 (validación), 429 (límite de proveedor), 500.
-->

## Servicios externos

<!-- Proveedor de IA generativa, almacenamiento, email, etc.:
     endpoint base, autenticación, límites de uso, variable de entorno con la clave
     (ver .env.example). -->
