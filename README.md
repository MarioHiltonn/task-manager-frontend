# Administrador de tareas - Frontend

SPA con React, TypeScript, Vite y React Router 7.18.4.
Consume una API REST protegida mediante JWT Bearer (Express + MongoDB Atlas).

## Funciones

- Registro, inicio de sesión, restauración de sesión (`GET /api/auth/me`) y cierre de sesión.
- Rutas públicas (`/`, `/login`, `/register`) y protegidas (`/tasks`, `/tasks/:taskId`).
- Después del login se regresa a la ruta que el visitante intentó abrir.
- CRUD remoto de tareas con búsqueda, filtro, ordenamiento y paginación del servidor.
- Detalle por identificador (funciona al recargar) y página 404.
- Estados de carga, vacío y error con **Reintentar**; cancelación con `AbortController`.
- Permisos: `user` consulta, crea y actualiza; solo `admin` ve y puede usar **Eliminar**.
- 401 con token cierra la sesión local; 403 conserva la sesión y muestra el permiso faltante.
- Pruebas con Vitest y Testing Library; despliegue estático en Render.

## Rutas

| Ruta | Acceso |
|---|---|
| `/` | Pública |
| `/login`, `/register` | Solo visitantes |
| `/tasks`, `/tasks/:taskId` | Protegidas |
| `*` | Página 404 |

## Instalación

```bash
pnpm install
```

> Para el despliegue (`--frozen-lockfile`) el archivo `pnpm-lock.yaml` debe estar versionado.
> Se genera la primera vez que ejecutas `pnpm install`.

## Desarrollo

1. Copiar `.env.example` como `.env.local` (`VITE_API_URL=/api`).
2. Iniciar el backend en `http://localhost:3000` (con el parche de `/api/auth/me`).
3. Ejecutar `pnpm dev` y abrir `http://localhost:5173`.

Vite reenvía `/api` al backend durante `pnpm dev` (proxy de `vite.config.ts`).
El backend debe tener `CORS_ORIGIN=http://localhost:5173`.

## Roles

Las cuentas nuevas tienen rol `user`. Para probar la eliminación, en el backend:

```bash
pnpm role:set tu-correo@ejemplo.com admin
```

y vuelve a iniciar sesión (el rol viaja dentro del token).

## Verificación

```bash
pnpm lint
pnpm test
pnpm build
pnpm verify   # los tres anteriores en orden
```

## Producción

- `render.yaml` define el sitio estático, el rewrite SPA hacia `/index.html` y los encabezados.
- `VITE_API_URL` (en Render) debe ser `https://TU-API.onrender.com/api`. Se incorpora al
  bundle durante el build, por lo que cambiarla exige un nuevo despliegue. **No es un secreto.**
- En el backend, `CORS_ORIGIN` debe ser el origen HTTPS exacto del frontend (sin ruta ni `/` final).
- Prueba de humo después de desplegar:

```bash
FRONTEND_URL=https://FRONTEND.onrender.com \
BACKEND_URL=https://BACKEND.onrender.com \
pnpm smoke:production
```

Consulta `docs/deployment-configuration.md` y `docs/release-checklist.md`.

## Seguridad (alcance didáctico)

El access token se conserva en `sessionStorage` para practicar la restauración de sesión.
No se guardan contraseñas ni el usuario. Es accesible para JavaScript, por lo que un XSS podría
leerlo; HTTPS protege el transporte pero no elimina ese riesgo. La autenticación y la
autorización reales viven en la API: ocultar un botón o redirigir una ruta solo mejora la experiencia.

## Estructura

```
src/
  components/   componentes visuales (AppNavigation, TaskItem, ...)
  config/       VITE_API_URL
  context/      auth-context.ts
  hooks/        useAuth, useTaskList
  layouts/      AppLayout
  models/       tipos de tareas, API y autenticación
  pages/        Home, Login, Register, Tasks, TaskDetail, NotFound
  providers/    AuthProvider
  routes/       ProtectedRoute, PublicOnlyRoute
  services/     http, auth.api, task.api, session
  test/         pruebas (sesión, guardas y cliente HTTP)
  styles/       index.css
  utils/        date, task-validation
docs/           evidencias, preguntas de cierre, checklist y despliegue
scripts/        smoke-production.mjs
```
