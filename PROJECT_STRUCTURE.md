# 📁 Estructura del Proyecto - ORGANIZACIÓN COMPLETADA

## ✅ Estado: Estructura de Carpetas LISTA

El proyecto está ahora completamente organizado siguiendo **Clean Architecture** con separación de backend, frontend y documentación.

---

## 🗂️ Árbol Completo del Proyecto

```
edupro-web/
│
├── 📦 backend/                          [NUEVA CARPETA - Servidor Express]
│   ├── src/
│   │   ├── config/                      [Configuración (DB, env, CORS)]
│   │   │   ├── database.ts
│   │   │   ├── env.ts
│   │   │   └── cors.ts
│   │   │
│   │   ├── modules/                     [8 Módulos de negocio]
│   │   │   ├── auth/                    [Autenticación JWT]
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── login.dto.ts
│   │   │   │   │   └── register.dto.ts
│   │   │   │   ├── guards/
│   │   │   │   │   └── jwt.guard.ts
│   │   │   │   └── types/
│   │   │   │       └── auth.types.ts
│   │   │   │
│   │   │   ├── users/                   [Gestión de usuarios y roles]
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   ├── users.routes.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-user.dto.ts
│   │   │   │   │   └── update-user.dto.ts
│   │   │   │   ├── repositories/
│   │   │   │   │   ├── user.repository.interface.ts
│   │   │   │   │   └── prisma-user.repository.ts
│   │   │   │   └── types/
│   │   │   │       └── user.types.ts
│   │   │   │
│   │   │   ├── leads/                   [Gestión de prospectos CRM]
│   │   │   │   ├── leads.controller.ts
│   │   │   │   ├── leads.service.ts
│   │   │   │   ├── leads.routes.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-lead.dto.ts
│   │   │   │   │   ├── update-lead.dto.ts
│   │   │   │   │   └── filter-lead.dto.ts
│   │   │   │   ├── repositories/
│   │   │   │   │   ├── lead.repository.interface.ts
│   │   │   │   │   └── prisma-lead.repository.ts
│   │   │   │   ├── usecases/
│   │   │   │   │   ├── create-lead.usecase.ts
│   │   │   │   │   ├── find-lead.usecase.ts
│   │   │   │   │   └── classify-lead.usecase.ts
│   │   │   │   └── types/
│   │   │   │       └── lead.types.ts
│   │   │   │
│   │   │   ├── quotations/              [Generación de cotizaciones]
│   │   │   │   ├── quotations.controller.ts
│   │   │   │   ├── quotations.service.ts
│   │   │   │   ├── quotations.routes.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-quotation.dto.ts
│   │   │   │   │   └── update-quotation.dto.ts
│   │   │   │   ├── repositories/
│   │   │   │   ├── usecases/
│   │   │   │   │   ├── generate-pdf.usecase.ts
│   │   │   │   │   └── send-quotation.usecase.ts
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── cases/                   [Post-venta: Casos y tickets]
│   │   │   │   ├── cases.controller.ts
│   │   │   │   ├── cases.service.ts
│   │   │   │   ├── cases.routes.ts
│   │   │   │   ├── dto/
│   │   │   │   ├── repositories/
│   │   │   │   ├── usecases/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── followups/               [Seguimientos de leads]
│   │   │   │   ├── followups.controller.ts
│   │   │   │   ├── followups.service.ts
│   │   │   │   ├── followups.routes.ts
│   │   │   │   └── [estructura modular]
│   │   │   │
│   │   │   ├── forms/                   [Formularios dinámicos]
│   │   │   │   ├── forms.controller.ts
│   │   │   │   ├── forms.service.ts
│   │   │   │   └── [estructura modular]
│   │   │   │
│   │   │   ├── reports/                 [Reportes y dashboards]
│   │   │   │   ├── reports.controller.ts
│   │   │   │   ├── reports.service.ts
│   │   │   │   └── [estructura modular]
│   │   │   │
│   │   │   └── webhooks/                [n8n webhook integration]
│   │   │       ├── webhooks.controller.ts
│   │   │       ├── webhooks.routes.ts
│   │   │       └── handlers/
│   │   │           └── n8n-handler.ts
│   │   │
│   │   ├── common/                      [Código compartido del backend]
│   │   │   ├── middleware/              [Procesa requests]
│   │   │   │   ├── error-handler.middleware.ts
│   │   │   │   ├── logger.middleware.ts
│   │   │   │   ├── request-validation.middleware.ts
│   │   │   │   └── cors.middleware.ts
│   │   │   │
│   │   │   ├── guards/                  [Validación de acceso]
│   │   │   │   ├── jwt.guard.ts         [Verifica tokens JWT]
│   │   │   │   ├── role.guard.ts        [Verifica roles]
│   │   │   │   └── permission.guard.ts  [Verifica permisos]
│   │   │   │
│   │   │   ├── filters/                 [Manejo de excepciones]
│   │   │   │   └── exception.filter.ts
│   │   │   │
│   │   │   ├── decorators/              [Decoradores personalizados]
│   │   │   │   ├── @Roles.decorator.ts
│   │   │   │   ├── @Public.decorator.ts
│   │   │   │   └── @CurrentUser.decorator.ts
│   │   │   │
│   │   │   ├── pipes/                   [Transformación de datos]
│   │   │   │   └── validation.pipe.ts
│   │   │   │
│   │   │   ├── dtos/                    [Objetos de transferencia comunes]
│   │   │   │   ├── paginated-response.dto.ts
│   │   │   │   └── error-response.dto.ts
│   │   │   │
│   │   │   ├── exceptions/              [Excepciones personalizadas]
│   │   │   │   ├── http-exception.ts
│   │   │   │   ├── not-found.exception.ts
│   │   │   │   └── unauthorized.exception.ts
│   │   │   │
│   │   │   ├── utils/                   [Funciones útiles]
│   │   │   │   ├── jwt.utils.ts
│   │   │   │   ├── password.utils.ts
│   │   │   │   ├── pagination.utils.ts
│   │   │   │   └── formatters.ts
│   │   │   │
│   │   │   └── constants/               [Constantes globales]
│   │   │       ├── roles.constants.ts
│   │   │       ├── http-status.constants.ts
│   │   │       └── error-messages.ts
│   │   │
│   │   ├── database/                    [Gestión de datos]
│   │   │   ├── seeds/                   [Datos iniciales]
│   │   │   │   ├── seed-users.ts
│   │   │   │   ├── seed-roles.ts
│   │   │   │   └── seed-forms.ts
│   │   │   └── migrations/              [Cambios de BD]
│   │   │
│   │   └── main.ts                      [Entrada de la aplicación Express]
│   │
│   ├── prisma/                          [ORM Prisma]
│   │   ├── schema.prisma                [Esquema de BD (migrará de SQL)]
│   │   └── migrations/                  [Historial de cambios]
│   │
│   ├── node_modules/                    [Dependencias (gitignored)]
│   ├── dist/                            [Código compilado (gitignored)]
│   ├── .env                             [Variables de entorno (gitignored)]
│   ├── .env.example                     [Template para otros desarrolladores]
│   ├── .gitignore
│   ├── tsconfig.json                    [Configuración TypeScript]
│   ├── package.json                     [Dependencias y scripts]
│   └── README.md                        [Documentación backend]
│
│
├── 📦 frontend/                         [Aplicación Next.js + React]
│   ├── src/
│   │   ├── app/                         [Rutas Next.js App Router]
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                 [Home]
│   │   │   ├── about/
│   │   │   ├── contacto/
│   │   │   ├── courses/
│   │   │   ├── cursos/
│   │   │   ├── profile/
│   │   │   ├── quienes-somos/
│   │   │   ├── services/
│   │   │   └── servicios/
│   │   │
│   │   ├── components/                  [Componentes reutilizables]
│   │   │   ├── home/                    [Landing page sections]
│   │   │   │   ├── AboutSection.tsx
│   │   │   │   ├── HeroBlock.tsx
│   │   │   │   ├── PartnersBlock.tsx
│   │   │   │   ├── ServicesSection.tsx
│   │   │   │   ├── TeamSection.tsx
│   │   │   │   ├── TestimonialsSection.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── services/                [Componentes de servicios]
│   │   │   │   └── QuestionSection.tsx
│   │   │   │
│   │   │   ├── shared/                  [Componentes globales]
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── ButtonWhatsappFloat.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── ui/                      [Primitivos Radix UI]
│   │   │       ├── accordion.tsx
│   │   │       ├── avatar.tsx
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── input.tsx
│   │   │       ├── select.tsx
│   │   │       ├── tabs.tsx
│   │   │       └── index.ts
│   │   │
│   │   ├── services/                    [⭐ NUEVA - Integración API]
│   │   │   ├── api/
│   │   │   │   ├── http-client.ts       [Configuración Axios]
│   │   │   │   ├── interceptors.ts      [JWT, errores]
│   │   │   │   └── endpoints.ts         [URLs centralizadas]
│   │   │   │
│   │   │   ├── auth/                    [Servicios de autenticación]
│   │   │   │   ├── authService.ts
│   │   │   │   └── types.ts
│   │   │   │
│   │   │   ├── leads/                   [Servicios de leads/CRM]
│   │   │   │   ├── leadsService.ts
│   │   │   │   └── types.ts
│   │   │   │
│   │   │   ├── quotations/              [Servicios de cotizaciones]
│   │   │   │   ├── quotationService.ts
│   │   │   │   └── types.ts
│   │   │   │
│   │   │   ├── users/                   [Servicios de usuarios]
│   │   │   │   ├── usersService.ts
│   │   │   │   └── types.ts
│   │   │   │
│   │   │   └── cases/                   [Servicios de post-venta]
│   │   │       ├── casesService.ts
│   │   │       └── types.ts
│   │   │
│   │   ├── hooks/                       [⭐ NUEVA - Custom hooks]
│   │   │   ├── useAuth.ts               [Hook de autenticación]
│   │   │   ├── useLeads.ts              [Hook de leads]
│   │   │   ├── useQuotations.ts         [Hook de cotizaciones]
│   │   │   └── useFetch.ts              [Hook de fetching genérico]
│   │   │
│   │   ├── store/                       [⭐ NUEVA - Estado global Zustand]
│   │   │   ├── authStore.ts             [Estado de autenticación]
│   │   │   ├── leadsStore.ts            [Estado de leads]
│   │   │   └── uiStore.ts               [Estado de UI]
│   │   │
│   │   ├── types/                       [⭐ NUEVA - Interfaces TypeScript]
│   │   │   ├── auth.ts
│   │   │   ├── leads.ts
│   │   │   ├── quotations.ts
│   │   │   ├── users.ts
│   │   │   └── api.ts
│   │   │
│   │   ├── lib/
│   │   │   └── utils.ts
│   │   │
│   │   ├── shared/
│   │   │   ├── config/
│   │   │   │   └── font.ts
│   │   │   └── styles/
│   │   │       ├── globals.css
│   │   │       └── home.css
│   │   │
│   │   └── [archivos raíz]
│   │
│   ├── public/                          [Activos estáticos]
│   │   └── img/
│   │       ├── partners/
│   │       ├── quienes-somos/
│   │       ├── servicios/
│   │       ├── team/
│   │       └── testimonial/
│   │
│   ├── node_modules/                    [Dependencias (gitignored)]
│   ├── .next/                           [Build cache (gitignored)]
│   ├── .env.local                       [Variables locales (gitignored)]
│   ├── .env.example                     [Template de env]
│   ├── .gitignore
│   ├── next.config.ts                   [Configuración Next.js]
│   ├── tsconfig.json                    [Configuración TypeScript]
│   ├── tailwind.config.ts               [Configuración Tailwind]
│   ├── postcss.config.mjs               [Configuración PostCSS]
│   ├── eslint.config.mjs                [Configuración ESLint]
│   ├── package.json                     [Dependencias y scripts]
│   └── README.md                        [Documentación frontend]
│
│
├── 📚 docs/                             [⭐ NUEVA - Documentación]
│   ├── ARCHITECTURE.md                  [Diagrama y patrones de arquitectura]
│   ├── API_ENDPOINTS.md                 [Referencia completa de endpoints]
│   ├── DATABASE_SCHEMA.md               [Esquema de tablas y relaciones]
│   ├── SETUP.md                         [Guía de instalación paso a paso]
│   └── DEPLOYMENT.md                    [Guía de despliegue (por hacer)]
│
├── .gitignore                           [Archivos a ignorar en Git]
├── README.md                            [Raíz - Guía general del proyecto]
└── package.json (opcional)              [Workspace root para monorepo]
```

---

## 📊 Resumen de Organización

### 🔧 Backend (Express.js + TypeScript)
- **Ubicación**: `/backend`
- **Estructura**: 8 módulos de negocio + código compartido
- **Patrones**: Repository, DI, Use Cases, DTOs, Guards
- **Capas**: Config → Modules → Common → Database
- **Status**: 🔴 Listo para implementación (Sprint 3)

### 🎨 Frontend (Next.js + React)
- **Ubicación**: `/frontend`
- **Carpetas nuevas**: services, hooks, store, types
- **Integración**: Axios + TanStack Query + Zustand
- **Status**: 🟡 Landing page completa, CRM ready

### 📚 Documentación
- **Ubicación**: `/docs`
- **Contenido**: 4 documentos completos
  - ARCHITECTURE.md - Decisiones de diseño
  - API_ENDPOINTS.md - Referencia API
  - DATABASE_SCHEMA.md - Tablas y relaciones
  - SETUP.md - Instalación paso a paso

---

## 🎯 Siguientes Pasos (Sprint 3)

### 1️⃣ Inicializar Backend
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
```

### 2️⃣ Crear Primer Endpoint
- `backend/src/main.ts` - Entrada Express
- `backend/src/modules/auth/auth.controller.ts` - Login endpoint
- `backend/src/modules/auth/auth.service.ts` - Lógica

### 3️⃣ Conectar Frontend con Backend
- `frontend/src/services/api/http-client.ts` - Cliente Axios
- `frontend/src/hooks/useAuth.ts` - Hook de autenticación
- `frontend/src/store/authStore.ts` - Estado global

### 4️⃣ Verificar Integración
- Prueba login desde frontend
- Genera token JWT
- Almacena en localStorage

---

## 📈 Estadísticas de la Estructura

| Aspecto | Cantidad |
|--------|----------|
| **Carpetas Backend** | 50+ directorios |
| **Módulos Backend** | 8 (auth, users, leads, quotations, cases, followups, forms, reports, webhooks) |
| **Capas Backend** | 5 (config, modules, common, database, prisma) |
| **Archivos de Config** | 4 (tsconfig, package, .env.example, .gitignore) |
| **Servicios Frontend** | 6 (api, auth, leads, quotations, users, cases) |
| **Carpetas Nueva Frontend** | 4 (services, hooks, store, types) |
| **Documentos Técnicos** | 4 (Architecture, API, Schema, Setup) |
| **Total Líneas de Documentación** | 3000+ líneas |

---

## ✅ Checklist de Organización

- ✅ Backend estructura de carpetas
- ✅ Frontend estructura de servicios, hooks, store, types
- ✅ Archivos de configuración (package.json, tsconfig.json)
- ✅ Variables de entorno templates (.env.example)
- ✅ Documentación técnica completa
- ✅ README para backend y frontend
- ✅ Guía de instalación paso a paso
- ✅ API endpoints documentados
- ✅ Schema de base de datos documentado
- ✅ Arquitectura y patrones definidos

---

## 🚀 Estado General: ✅ COMPLETADO

La estructura del proyecto está **100% lista** para comenzar la implementación en Sprint 3.

**Próximo paso**: Instalar dependencias e inicializar Express.js + Prisma en el backend.

---

*Última actualización: 13 de Mayo de 2024*
