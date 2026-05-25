# SPC Backend — API REST

Backend del **Sistema de Prevención Comunitaria (SPC)**, construido con NestJS y TypeORM sobre SQLite.

---

## Tecnologías utilizadas

| Tecnología | Versión | Rol |
|---|---|---|
| **NestJS** | 10.x | Framework principal (controladores, servicios, módulos, guards) |
| **TypeORM** | 0.3.x | ORM para acceso a base de datos con decoradores TypeScript |
| **SQLite** | 5.x | Base de datos local embebida (archivo `spc_database.sqlite`) |
| **Passport + JWT** | — | Autenticación stateless mediante JSON Web Tokens |
| **bcryptjs** | 2.x | Hash seguro de contraseñas |
| **class-validator** | 0.14.x | Validación declarativa de DTOs con decoradores |
| **class-transformer** | 0.5.x | Serialización/deserialización de objetos |
| **Jest + ts-jest** | 29.x | Framework de pruebas unitarias |
| **pnpm** | — | Gestor de paquetes |

---

## Arranque rápido

```bash
cd back
pnpm install
pnpm run start:dev     # modo desarrollo con hot-reload
pnpm run start:prod    # modo producción
pnpm run build         # compilar a dist/
```

La API queda disponible en **`http://localhost:3001/api`**

---

## Pruebas unitarias

```bash
pnpm test              # ejecutar todos los tests
pnpm test:watch        # modo watch (re-ejecuta al guardar)
pnpm test:cov          # generar reporte de cobertura en /coverage
```

Los archivos de test se ubican junto al código con sufijo `.spec.ts`:
- `src/auth/auth.service.spec.ts` — 9 tests sobre autenticación y registro
- `src/topics/topics.service.spec.ts` — 10 tests sobre CRUD de temas

---

## Estructura de carpetas

```
back/src/
├── app.module.ts              # Módulo raíz, importa todos los submódulos
├── main.ts                    # Bootstrap de la aplicación (puerto 3001, prefijo /api)
│
├── auth/                      # Autenticación (admin y estudiante)
│   ├── auth.controller.ts     # Rutas: POST /auth/login, /auth/register, /auth/student/*
│   ├── auth.service.ts        # Lógica: signIn, registerAdmin, signInStudent, registerStudent
│   ├── auth.module.ts
│   ├── dto/
│   │   ├── sign-in.dto.ts
│   │   ├── register-admin.dto.ts
│   │   └── register-student.dto.ts
│   ├── entities/
│   │   └── user.entity.ts     # Tabla `users` (admin/teacher)
│   └── guards/
│       └── jwt-auth.guard.ts  # Guard que valida Bearer token en headers
│
├── activities/                # Gestión de actividades comunitarias
│   ├── activities.controller.ts
│   ├── activities.service.ts
│   ├── dto/
│   └── entities/activity.entity.ts
│
├── institutions/              # Instituciones educativas
│   ├── institutions.controller.ts
│   ├── institutions.service.ts
│   ├── dto/
│   └── entities/institution.entity.ts
│
├── topics/                    # Temas de las actividades
│   ├── topics.controller.ts
│   ├── topics.service.ts
│   ├── topics.service.spec.ts ← TESTS
│   ├── dto/
│   └── entities/topic.entity.ts
│
├── participants/              # Participantes externos (no estudiantes)
│   └── ...
│
├── students/                  # Portal estudiantil
│   ├── students.controller.ts
│   ├── students.service.ts
│   └── entities/student.entity.ts
│
├── enrollments/               # Inscripciones de estudiantes a actividades
│   ├── enrollments.controller.ts
│   ├── enrollments.service.ts
│   └── entities/enrollment.entity.ts
│
└── seed/                      # Datos iniciales de prueba
    ├── seed.service.ts        # Inserta 15 temas, 10 instituciones, 10 actividades, 30 estudiantes
    └── seed.module.ts
```

---

## Base de datos

TypeORM está configurado con `synchronize: true`, lo que significa que **las tablas se crean/actualizan automáticamente** al arrancar según las entidades definidas. No se necesitan migraciones en desarrollo.

**Archivo**: `back/spc_database.sqlite`

### Tablas

| Tabla | Descripción |
|---|---|
| `users` | Administradores y facilitadores del sistema |
| `students` | Estudiantes registrados en el portal |
| `institutions` | Instituciones educativas (colegios, escuelas) |
| `activities` | Actividades y talleres programados |
| `topics` | Temas temáticos de las actividades |
| `participants` | Participantes externos a las actividades |
| `enrollments` | Relación estudiante ↔ actividad (inscripciones) |

---

## Autenticación

El sistema maneja **dos tipos de tokens JWT** distintos:

| Tipo | Endpoint | Token | Payload |
|---|---|---|---|
| Admin/Facilitador | `POST /api/auth/login` | `spc_token` | `{ sub, email, role, name, type: 'admin' }` |
| Estudiante | `POST /api/auth/student/login` | `spc_student_token` | `{ sub, email, name, type: 'student' }` |

Todos los endpoints protegidos requieren el header:
```
Authorization: Bearer <token>
```

### Usuario administrador por defecto

Al iniciar por primera vez, se crea automáticamente:
- **Email**: `admin@spc.com`
- **Contraseña**: `Admin123!`

---

## Endpoints principales

### Autenticación
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Login de admin/facilitador |
| POST | `/api/auth/register` | Registro de admin/facilitador (protegido) |
| POST | `/api/auth/student/login` | Login de estudiante |
| POST | `/api/auth/student/register` | Registro de estudiante (público) |

### Actividades
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/activities` | Listar actividades (soporta `?query=`) |
| GET | `/api/activities/calendar` | Actividades por mes (`?year=&month=`) |
| POST | `/api/activities` | Crear actividad |
| PUT | `/api/activities/:id` | Actualizar actividad |
| DELETE | `/api/activities/:id` | Eliminar actividad |

### Instituciones, Temas, Participantes
Todos siguen el mismo patrón CRUD:
- `GET /api/{recurso}` — listar (con búsqueda por `?query=`)
- `POST /api/{recurso}` — crear
- `GET /api/{recurso}/:id` — obtener uno
- `PUT /api/{recurso}/:id` — actualizar
- `DELETE /api/{recurso}/:id` — eliminar

### Estudiantes
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/students` | Listar estudiantes |
| PATCH | `/api/students/:id/toggle` | Activar/desactivar cuenta |
| DELETE | `/api/students/:id` | Eliminar estudiante |

### Inscripciones (estudiantes)
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/enrollments` | Inscribirse a una actividad |
| DELETE | `/api/enrollments/:id` | Cancelar inscripción |
| GET | `/api/enrollments/my` | Mis inscripciones |
| GET | `/api/enrollments/check/:activityId` | Verificar si ya estoy inscrito |
| GET | `/api/enrollments/activity/:activityId` | Participantes de una actividad |

---

## Datos semilla (Seed)

Al iniciar, `SeedService` comprueba si los datos semilla ya fueron insertados. Si no, inserta automáticamente:

- **15 temas**: Prevención de drogas, Salud mental, Bullying, Seguridad vial, etc.
- **10 instituciones**: Colegios e institutos de Honduras
- **10 actividades**: Talleres programados entre mayo y junio 2026
- **30 estudiantes de prueba**: Con variedad de datos (con/sin DNI, teléfono, grado)

> El seed **no duplica** datos. Usa `findOne` por nombre/email específico como marcador.

---

## Variables de entorno (producción)

Para producción se recomienda mover a `.env`:

```env
JWT_SECRET=tu_secreto_seguro_aqui
DB_PATH=./spc_database.sqlite
PORT=3001
```
