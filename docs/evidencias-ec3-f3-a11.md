# Evidencias EC3 F3 A11

## Entorno
- Rama:
- React:
- React Router:
- URL local del Frontend:
- URL local del Backend:

## Casos
| Caso | HTTP | Resultado | Evidencia |
|---|---:|---|---|
| Registro válido | 201 | | |
| Correo duplicado | 409 | | |
| Login inválido | 401 | | |
| Login válido | 200 | | |
| /auth/me | 200 | | |
| /tasks sin token | 401 | | |
| CRUD con user | 2xx | | |
| DELETE con user | 403 | | |
| DELETE con admin | 204 | | |
| Token alterado | 401 | | |

## Rutas y sesión
- Redirección a login:
- Recuperación de la ruta intentada:
- Restauración después de recargar:
- Cierre y botón Atrás:

## Calidad
- pnpm lint:
- pnpm build:
- Consola del navegador:

## Protección de datos
Confirmo que las evidencias no muestran contraseñas, tokens completos, JWT_SECRET ni MONGODB_URI.
