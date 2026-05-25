# SPC Frontend — Interfaz de Usuario

Frontend del **Sistema de Prevención Comunitaria (SPC)**, construido con React, TypeScript y Vite.

---

## Tecnologías utilizadas

| Tecnología | Versión | Rol |
|---|---|---|
| **React** | 19.x | Biblioteca UI basada en componentes |
| **TypeScript** | 5.x | Tipado estático sobre JavaScript |
| **Vite** | 6.x | Bundler y servidor de desarrollo ultrarrápido |
| **React Router v7** | — | Enrutamiento SPA con rutas anidadas y protegidas |
| **TanStack Query (React Query)** | 5.x | Fetching, caché y sincronización de datos del servidor |
| **React Hook Form** | 7.x | Manejo de formularios con validación de rendimiento |
| **Zod** | 3.x | Validación de esquemas y tipado de formularios |
| **Axios** | 1.x | Cliente HTTP para comunicarse con la API |
| **Tailwind CSS** | 3.x | Estilos utilitarios inline |
| **shadcn/ui** | — | Componentes accesibles construidos sobre Radix UI |
| **Radix UI** | — | Primitivas de UI accesibles y sin estilos |
| **Lucide React** | — | Iconografía SVG |
| **Sonner** | — | Notificaciones toast |
| **Vitest** | 4.x | Framework de pruebas unitarias integrado con Vite |
| **Testing Library** | 16.x | Utilidades para testear componentes React |
| **pnpm** | — | Gestor de paquetes |

---

## Arranque rápido

```bash
cd front
pnpm install
pnpm run dev       # servidor de desarrollo en http://localhost:5173
pnpm run build     # compilar para producción
pnpm run preview   # previsualizar build de producción
```

> Requiere el backend corriendo en `http://localhost:3001`. El proxy de Vite redirige `/api/*` automáticamente.

---

## Pruebas unitarias

```bash
pnpm test          # modo watch interactivo
pnpm test:run      # ejecutar una vez (para CI)
pnpm test:cov      # con reporte de cobertura
```

### Archivos de test

```
src/test/
├── setup.ts                              # Configura @testing-library/jest-dom
├── lib/
│   └── error.test.ts                     # Tests de getHttpErrorMessage (4 casos)
├── services/
│   └── activity.service.test.ts          # Tests de activityStatusLabels (2 casos)
└── components/
    └── SearchableSelect.test.tsx         # Tests del componente (6 casos)
```

---

## Estructura de carpetas

```
front/src/
├── App.tsx                    # Raíz de la app con QueryClientProvider y AuthProvider
├── main.tsx                   # Punto de entrada, monta React en #root
│
├── components/
│   ├── common/
│   │   ├── FormDialog.tsx         # Diálogo modal reutilizable para formularios
│   │   ├── SearchEngine.tsx       # Input de búsqueda con debounce
│   │   ├── SearchableSelect.tsx   # Combobox buscable con selección/limpieza
│   │   └── WarningDialog.tsx      # Diálogo de confirmación de acciones peligrosas
│   └── ui/                        # Componentes shadcn/ui (button, input, badge, etc.)
│
├── layouts/
│   ├── AppLayout.tsx          # Layout del panel admin: sidebar + header + outlet
│   └── AuthLayout.tsx         # Layout centrado para páginas de login
│
├── lib/
│   ├── api.ts                 # Instancias Axios: `api` (admin) y `studentApi` (estudiante)
│   ├── error.ts               # getHttpErrorMessage: extrae mensajes de errores HTTP
│   └── utils.ts               # cn(): combina clases Tailwind con clsx + tailwind-merge
│
├── pages/
│   ├── activities/
│   │   └── ActivitiesPage.tsx     # CRUD de actividades + filtro por institución
│   ├── calendar/
│   │   └── CalendarPage.tsx       # Vista de calendario mensual de actividades
│   ├── institutions/
│   │   └── InstitutionsPage.tsx   # CRUD de instituciones educativas
│   ├── login/
│   │   ├── LoginPage.tsx          # Selector de portal (admin vs estudiante)
│   │   ├── AdminLoginPage.tsx     # Formulario de login admin
│   │   └── StudentLoginPage.tsx   # Formulario de login/registro de estudiante
│   ├── participants/
│   │   └── ParticipantsPage.tsx   # CRUD de participantes externos
│   └── topics/
│       └── TopicsPage.tsx         # CRUD de temas — diseño en tarjetas (grid)
│
├── providers/
│   └── AuthProvider.tsx       # Context de autenticación admin (token, usuario, logout)
│
├── router/
│   ├── AppRoutes.tsx          # Árbol de rutas con protección por tipo de usuario
│   ├── menu.ts                # Ítems del menú lateral del panel admin
│   └── paths.ts               # Constantes de todas las rutas de la app
│
├── services/                  # Capa de acceso a la API (llama a api.ts)
│   ├── activity.service.ts
│   ├── auth.service.ts
│   ├── institution.service.ts
│   ├── participant.service.ts
│   └── topic.service.ts
│
└── styles/
    └── globals.css            # Variables CSS de shadcn/ui + directivas Tailwind
```

---

## Autenticación y rutas protegidas

### Dos portales independientes

#### Portal Administrador / Facilitador
- Login en `/login/admin`
- Token `spc_token` guardado en `localStorage`
- Contexto: `AuthProvider` + `useAuth()`
- Rutas protegidas: verifican `spc_token` antes de renderizar

#### Portal Estudiantil
- Login/registro en `/login`
- Token `spc_student_token` guardado en `localStorage`
- No usa Context (manejo directo de localStorage + navigate)
- Rutas protegidas: `/student/*`

### Instancias Axios (`src/lib/api.ts`)
```
api          → Authorization: Bearer spc_token        (admin)
studentApi   → Authorization: Bearer spc_student_token (estudiante)
```
Ambas instancias incluyen un interceptor de respuesta que retorna `response.data` directamente, evitando el wrapper de Axios.

---

## Páginas del sistema

### Panel Administrativo

| Página | Ruta | Descripción |
|---|---|---|
| Actividades | `/activities` | Lista de talleres/charlas con filtro por institución y búsqueda. Formulario con combobox buscable para institución y tema. |
| Instituciones | `/institutions` | CRUD de colegios e institutos. Muestra tipo, ciudad y estado activo/inactivo. |
| Temas | `/topics` | CRUD de temas temáticos. Diseño en tarjetas tipo grid (3 columnas). |
| Participantes | `/participants` | CRUD de participantes externos (no estudiantes). |
| Estudiantes | `/students-admin` | Listado de estudiantes registrados con opción de activar/desactivar. |
| Inscripciones | `/enrollments` | Gestión de inscripciones de estudiantes a actividades. |
| Calendario | `/calendar` | Vista mensual de actividades con navegación de meses. |

### Portal Estudiantil

| Página | Ruta | Descripción |
|---|---|---|
| Dashboard | `/student/dashboard` | Panel principal del estudiante con actividades disponibles. |
| Calendario | `/student/calendar` | Vista del calendario mensual para estudiantes. |
| Mis clases | `/student/my-classes` | Inscripciones activas del estudiante autenticado. |

---

## Componentes reutilizables

### `SearchableSelect`
Combobox con campo de búsqueda integrado. Útil para listas largas (instituciones, temas).

```tsx
<SearchableSelect
  options={[{ value: 1, label: 'Instituto Nacional' }]}
  value={selectedId}
  onValueChange={(v) => setSelectedId(v as number)}
  placeholder="Buscar institución..."
  clearable
/>
```

### `FormDialog`
Modal con formulario que incluye botones Cancelar / Guardar y estado de carga.

```tsx
<FormDialog
  open={open}
  onOpenChange={setOpen}
  title="Nueva actividad"
  onSubmit={handleSubmit}
  isPending={isCreating}
>
  {/* campos del formulario */}
</FormDialog>
```

### `WarningDialog`
Diálogo de confirmación antes de acciones destructivas (eliminar).

```tsx
<WarningDialog
  description="¿Eliminar esta actividad? Esta acción no se puede deshacer."
  onSubmit={() => deleteActivity(id)}
>
  <Button variant="destructive">Eliminar</Button>
</WarningDialog>
```

### `SearchEngine`
Input con debounce que llama a `onSearch` solo cuando el usuario deja de escribir.

---

## Datos y estado

- **React Query** gestiona el caché de todos los datos remotos. Al crear/editar/eliminar se invalida el query correspondiente con `queryClient.invalidateQueries`.
- **React Hook Form + Zod** valida los formularios en el cliente antes de enviar. Los errores se muestran bajo cada campo.
- No se usa ningún estado global (Redux, Zustand) — solo Context para autenticación y React Query para datos del servidor.
