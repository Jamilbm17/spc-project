# Sistema de Prevención Comunitaria (SPC)

Aplicación web full-stack para la gestión de actividades de prevención comunitaria.

## Tecnologías

| Capa | Framework / Librería |
|------|----------------------|
| Backend | NestJS 10 + TypeORM + SQLite |
| Frontend | React 19 + Vite + Tailwind CSS v3 |
| Base de datos | SQLite (archivo local, sin instalación extra) |

---

## Requisitos previos

- **Node.js** v18 o superior → https://nodejs.org  
  *(el proyecto fue probado con Node.js v24)*
- **npm** v9 o superior (viene incluido con Node.js)

Verificá las versiones instaladas:

```bash
node --version
npm --version
```

---

## Estructura del proyecto

```
PROYECTO PROGRAMA SPC/
├── back/     ← Backend NestJS (puerto 3001)
└── front/    ← Frontend React + Vite (puerto 5173)
```

---

## 1. Backend (NestJS)

### Instalación

```bash
cd back
npm install
```

### Ejecutar en modo desarrollo (con recarga automática)

```bash
npm run start:dev
```

El servidor arranca en **http://localhost:3001/api**

La base de datos SQLite se crea automáticamente en `back/spc_database.sqlite` la primera vez que se inicia el servidor.

### Otros comandos

```bash
npm run start        # Ejecutar sin modo watch
npm run build        # Compilar a /dist
npm run start:prod   # Ejecutar compilado (requiere build previo)
```

### Credenciales por defecto

Al iniciar por primera vez se crea automáticamente un usuario administrador:

| Campo | Valor |
|-------|-------|
| Email | `admin@spc.com` |
| Contraseña | `Admin123!` |

### Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| GET/POST | `/api/activities` | Actividades |
| GET | `/api/activities/calendar?year=&month=` | Vista calendario |
| GET/POST | `/api/institutions` | Instituciones |
| GET/POST | `/api/participants` | Participantes |
| GET/POST | `/api/topics` | Temas |

Todos los endpoints excepto `/api/auth/login` requieren el header:
```
Authorization: Bearer <token>
```

---

## 2. Frontend (React + Vite)

### Instalación

```bash
cd front
npm install
```

### Ejecutar en modo desarrollo

```bash
npm run dev
```

La aplicación abre en **http://localhost:5173**

Las llamadas a `/api/*` se redirigen automáticamente al backend en `localhost:3001` gracias al proxy configurado en `vite.config.ts`. Por eso el backend **debe estar corriendo** para que el frontend funcione.

### Otros comandos

```bash
npm run build    # Compilar para producción (salida en /dist)
npm run preview  # Previsualizar el build de producción localmente
```

---

## Ejecución completa (pasos rápidos)

Abrí dos terminales separadas:

**Terminal 1 — Backend:**
```bash
cd "PROYECTO PROGRAMA SPC/back"
npm install
npm run start:dev
```

**Terminal 2 — Frontend:**
```bash
cd "PROYECTO PROGRAMA SPC/front"
npm install
npm run dev
```

Luego abrí el navegador en **http://localhost:5173** e iniciá sesión con `admin@spc.com` / `Admin123!`

---

## Módulos disponibles

| Módulo | Descripción |
|--------|-------------|
| **Actividades** | CRUD completo de actividades de prevención |
| **Instituciones** | Escuelas, centros comunitarios y otros |
| **Participantes** | Registro de participantes por institución |
| **Temas** | Catálogo de temas para las actividades |
| **Calendario** | Vista mensual de actividades programadas |
