# Arquitectura - Plataforma CRM + Ventas

## 🏗️ Visión General

La plataforma implementa **Clean Architecture** con separación clara de capas:

```
┌─────────────────────────────────────────┐
│   Frontend (Next.js 15 + React 19)      │
│   - Landing page                        │
│   - CRM Dashboard                       │
│   - Formularios                         │
└────────────────┬────────────────────────┘
                 │ HTTP/REST (Axios)
                 ▼
┌─────────────────────────────────────────┐
│  Backend (Express.js + TypeScript)      │
│  - Controllers                          │
│  - Services (Use Cases)                 │
│  - Repositories                         │
│  - Guards & Middleware                  │
└────────────────┬────────────────────────┘
                 │ SQL (Prisma ORM)
                 ▼
┌─────────────────────────────────────────┐
│  Database (PostgreSQL 18)               │
│  - 16 tablas                            │
│  - Índices para performance             │
│  - Vistas agregadas                     │
└─────────────────────────────────────────┘
```

## 📦 Backend - Estructura Modular

### 1. **Capas por Módulo**

Cada módulo (auth, users, leads, etc) contiene:

```
modules/auth/
├── auth.controller.ts       # Maneja requests HTTP
├── auth.service.ts          # Lógica de negocio
├── auth.routes.ts           # Definición de rutas
├── dto/                      # Data Transfer Objects
│   ├── login.dto.ts
│   └── register.dto.ts
├── guards/                   # Validación (JWT, etc)
│   └── jwt.guard.ts
└── types/                    # TypeScript interfaces
    └── auth.types.ts
```

### 2. **Patrones Implementados**

#### **Repository Pattern**
Abstrae acceso a datos:

```typescript
// repositories/user.repository.interface.ts
interface IUserRepository {
  create(data: CreateUserDTO): Promise<User>
  findById(id: number): Promise<User | null>
  update(id: number, data: UpdateUserDTO): Promise<User>
  delete(id: number): Promise<void>
}

// repositories/prisma-user.repository.ts
class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}
  
  async create(data: CreateUserDTO): Promise<User> {
    return this.prisma.usuarios.create({ data })
  }
}
```

#### **Dependency Injection**
Inyecta dependencias en servicios:

```typescript
// services/auth.service.ts
class AuthService {
  constructor(
    private userRepository: IUserRepository,
    private jwtUtils: JwtUtils,
    private passwordUtils: PasswordUtils,
    private emailService: IEmailService
  ) {}
  
  async login(email: string, password: string) {
    // Lógica...
  }
}
```

#### **Use Cases**
Lógica pura de negocio separada del transport:

```typescript
// usecases/create-lead.usecase.ts
class CreateLeadUseCase {
  constructor(
    private leadRepository: ILeadRepository,
    private emailService: IEmailService
  ) {}
  
  async execute(input: CreateLeadInput): Promise<LeadOutput> {
    // Validar
    // Crear entity Lead
    // Persistir en BD
    // Notificar al asesor
    // Retornar DTO
  }
}
```

### 3. **Flow de una Solicitud**

```
1. Cliente HTTP → POST /api/leads
   │
2. Express Route → leads.routes.ts
   │
3. Controller → leads.controller.ts
   ├─ Valida request (ValidationPipe)
   ├─ Verifica autenticación (AuthGuard)
   ├─ Verifica rol (RoleGuard)
   │
4. Service → leads.service.ts
   ├─ Aplica reglas de negocio
   ├─ Usa repositories
   │
5. Repository → prisma-lead.repository.ts
   │
6. Database → PostgreSQL
   │
7. Response → DTO → Cliente
```

## 🗄️ Database - PostgreSQL

### Tablas Principales

```
usuarios          → Usuarios del sistema
roles             → Roles (Admin, Asesor, etc)
clientes_leads    → Prospectos de venta
cotizaciones      → Cotizaciones generadas
casos_postventa   → Tickets de post-venta
formularios       → Formularios dinámicos
seguimiento_leads → Historial de interacciones
```

### Relaciones

```
usuarios (1) ──→ (N) clientes_leads
           ├──→ (N) cotizaciones
           └──→ (N) casos_postventa

clientes_leads (1) ──→ (N) cotizaciones
              └──→ (N) seguimiento_leads

cotizaciones (1) ──→ (N) cotizacion_items
            └──→ (N) casos_postventa
```

### Índices de Performance

```sql
-- Queries frecuentes optimizadas
CREATE INDEX idx_leads_email ON clientes_leads(email);
CREATE INDEX idx_leads_estado ON clientes_leads(estado_lead);
CREATE INDEX idx_leads_asesor ON clientes_leads(id_asesor);
CREATE INDEX idx_quotations_status ON cotizaciones(estado_cotizacion);
```

## 🔐 Autenticación y Autorización

### JWT Tokens

```typescript
// Guards verifican tokens
@UseGuards(AuthGuard)
@UseGuards(RoleGuard)
@Post('/admin-only')
adminOnlyRoute() { }
```

### Roles

```typescript
enum UserRole {
  ADMINISTRADOR = 'administrador',
  ASESOR_VENTAS = 'asesor_ventas',
  ATENCION_CLIENTE = 'atencion_cliente',
  GERENTE_COMERCIAL = 'gerente_comercial',
  CLIENTE = 'cliente'
}
```

## 📡 Integración con n8n

Webhooks para automatización:

```typescript
// modules/webhooks/webhooks.controller.ts
@Post('/n8n/lead-created')
async onLeadCreated(body: LeadCreatedEvent) {
  // Trigger flujo n8n
  // Registrar actividad
  // Notificar asesor
}
```

## 🧩 Frontend - Integración con API

### Service Layer

```typescript
// services/api/http-client.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptores para JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### Custom Hooks

```typescript
// hooks/useLeads.ts
export function useLeads() {
  const query = useQuery({
    queryKey: ['leads'],
    queryFn: () => leadsService.getAll()
  })
  
  return {
    leads: query.data,
    isLoading: query.isLoading,
    error: query.error
  }
}
```

### State Management

```typescript
// store/leadsStore.ts
export const useLeadsStore = create((set) => ({
  leads: [],
  selectedLead: null,
  
  setLeads: (leads) => set({ leads }),
  selectLead: (lead) => set({ selectedLead: lead })
}))
```

## 📊 Sprint Mapping

### Sprint 1-2: Analysis ✅
- Análisis de requisitos
- Diseño de BD
- Validación con stakeholders

### Sprint 3: Backend Setup 🔄
- Express + TypeScript
- Prisma ORM setup
- JWT Authentication

### Sprint 4: Users & Forms 🔲
- CRUD usuarios
- Formularios dinámicos
- Integración frontend

### Sprint 5: Leads 🔲
- Módulo CRM completo
- Gestión de prospectos
- Dashboard básico

### Sprint 6: Quotations 🔲
- Generación cotizaciones
- n8n automation
- PDF export

### Sprint 7: Post-venta 🔲
- Casos y tickets
- Historial cliente
- Resolución tracking

### Sprint 8: Reports + Deploy 🔲
- Dashboards y KPIs
- Testing integral
- Deployment

## 🚀 Stack Tecnológico

| Aspecto | Tecnología | Versión |
|--------|-----------|---------|
| **Backend Runtime** | Node.js | 20+ |
| **Framework** | Express.js | 4.18+ |
| **Lenguaje** | TypeScript | 5.0+ |
| **ORM** | Prisma | 5.0+ |
| **Base de Datos** | PostgreSQL | 18+ |
| **Autenticación** | JWT + bcrypt | - |
| **Validación** | Zod | 3.22+ |
| **Frontend** | Next.js | 15.3+ |
| **UI Framework** | React | 19.1+ |
| **Styling** | Tailwind CSS | 4.0+ |
| **HTTP Client** | Axios | 1.5+ |
| **State** | Zustand | 4.4+ |
| **Queries** | TanStack Query | 5.0+ |
| **Componentes** | Radix UI | 1.0+ |
| **Automatización** | n8n | Latest |

## 📝 Convenciones

### Nombres de Archivos

```
// Controllers
leads.controller.ts       // camelCase

// Services
leads.service.ts          // camelCase

// DTOs
create-lead.dto.ts        // kebab-case

// Interfaces
user.repository.interface.ts  // kebab-case + interface suffix

// Tipos
auth.types.ts             // camelCase

// Módulos (carpetas)
/modules/leads/           // kebab-case
/common/guards/           // kebab-case
```

### Estructura de DTOs

```typescript
// Para requests
class CreateLeadDTO {
  @IsEmail()
  email: string
  
  @IsString()
  nombre: string
}

// Para responses
class LeadResponseDTO {
  id: number
  email: string
  nombre: string
  estadoLead: string
  createdAt: Date
}
```

## ⚙️ Variables de Entorno

Ver `.env.example` en backend y `.env.local.example` en frontend.

## 📚 Referencias

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
