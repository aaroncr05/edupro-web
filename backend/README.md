# Backend - Plataforma CRM + Ventas

## 📋 Descripción

Backend API para la plataforma de gestión de ventas y post-venta de Digitales Edupro. Construido con Express.js, Prisma ORM y TypeScript.

## 🏗️ Arquitectura

El backend implementa **Clean Architecture** con separación clara de capas:

```
src/
├── config/           # Configuración (BD, env, CORS)
├── modules/          # Módulos de dominio (auth, leads, quotations, etc)
├── common/           # Código compartido (guards, DTOs, middleware)
├── database/         # Seeds y migraciones
└── main.ts           # Entrada de la aplicación
```

## 🚀 Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 3. Ejecutar migraciones
npm run prisma:migrate

# 4. Generar cliente Prisma
npm run prisma:generate

# 5. Ejecutar en desarrollo
npm run dev
```

## 📦 Módulos

### Auth
- Login / Logout
- Registro de usuarios
- Generación de tokens JWT
- Autenticación y autorización

### Users
- CRUD de usuarios
- Gestión de roles
- Permisos y asignaciones

### Leads
- Gestión de prospectos
- Clasificación de leads
- Historial de seguimiento

### Quotations
- Generación de cotizaciones
- Estados de cotización
- Exportación a PDF

### Cases
- Gestión de casos post-venta
- Historial de atención
- Resolución de tickets

### Forms
- Formularios dinámicos
- Recopilación de respuestas
- Integración con leads

### Reports
- Dashboards y KPIs
- Reportes de ventas
- Análisis de rendimiento

### Webhooks
- Integración con n8n
- Triggers de automatización

## 🔐 Variables de Entorno

Ver `.env.example` para todas las opciones disponibles.

## 📚 Documentación

- [ARCHITECTURE.md](../docs/ARCHITECTURE.md) - Detalles de arquitectura
- [API_ENDPOINTS.md](../docs/API_ENDPOINTS.md) - Endpoints disponibles
- [DATABASE_SCHEMA.md](../docs/DATABASE_SCHEMA.md) - Esquema de BD

## 🧪 Tests

```bash
npm run test
```

## 📝 Linting y Formato

```bash
npm run lint
npm run format
```

## 🚢 Deployment

Ver [DEPLOYMENT.md](../docs/DEPLOYMENT.md)

## 👨‍💼 Autor

ENKI Digital S.A.C.S

## 📄 Licencia

MIT
