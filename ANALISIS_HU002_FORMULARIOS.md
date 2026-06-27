# 🔍 ANÁLISIS: HU-002 Módulo de Formularios de Contacto
**Fecha**: 31 de mayo de 2026  
**Estado**: INCOMPLETO - Implementación Parcial

---

## 📋 RESUMEN EJECUTIVO

**Conclusión**: El módulo de formularios de contacto **CUMPLE PARCIALMENTE** con los requisitos de HU-002.

- ✅ **COMPLETADO**: Captura de formularios públicos (frontend + lead)
- ❌ **FALTA IMPLEMENTAR**: Panel CRUD administrativo para gestionar formularios
- ⚠️ **PARCIAL**: Modelo de datos existe, pero sin endpoints backend

---

## 1️⃣ MÓDULO FORMS EN BACKEND

### Ubicación
```
backend/src/modules/forms/
├── ❌ forms.controller.ts (NO EXISTE)
├── ❌ forms.service.ts (NO EXISTE)
├── ❌ forms.routes.ts (NO EXISTE)
└── ❌ dto/ (NO EXISTE)
```

**Estado**: 🔴 **DIRECTORIO VACÍO** - Sin implementación

### Rutas Registradas en main.ts
```typescript
// backend/src/main.ts - Línea 5-10
import authRoutes from '@/modules/auth/auth.routes'
import usersRoutes from '@/modules/users/users.routes'
import leadsRoutes from '@/modules/leads/leads.routes'
import quotationsRoutes from '@/modules/quotations/quotations.routes'
import casesRoutes from '@/modules/cases/cases.routes'
import cmsRoutes from '@/modules/cms/cms.routes'

// ❌ NO HAY: import formsRoutes
```

**Estado**: 🔴 **NO REGISTRADO** - Módulo forms no está montado en la aplicación

---

## 2️⃣ ENDPOINTS REST PARA FORMULARIOS

### Documentación Esperada (API_ENDPOINTS.md)
En el archivo [docs/API_ENDPOINTS.md](docs/API_ENDPOINTS.md) se define:

```typescript
// frontend/src/services/api/endpoints.ts (línea ~60)
FORMS: {
  LIST: '/forms',           // ❌ NO IMPLEMENTADO
  CREATE: '/forms',         // ❌ NO IMPLEMENTADO
  GET: (id: number) => `/forms/${id}`,        // ❌ NO IMPLEMENTADO
  SUBMIT: '/forms/submit'   // ✅ PARCIAL (solo captura)
}
```

### Endpoints que FALTAN Implementar
```
❌ GET    /api/forms              - Listar formularios
❌ POST   /api/forms              - Crear formulario
❌ GET    /api/forms/:id          - Obtener formulario
❌ PATCH  /api/forms/:id          - Editar formulario
❌ DELETE /api/forms/:id          - Eliminar formulario
✅ POST   /api/forms/submit       - PARCIAL: Registra como Lead (no como formulario)
```

**Estado**: 🔴 **95% INCOMPLETO**

---

## 3️⃣ PÁGINA FRONTEND PARA ADMINISTRAR FORMULARIOS

### Búsqueda en src/app
```
src/app/
├── (auth)/
├── dashboard/
├── ✅ users/              ← Gestión de usuarios IMPLEMENTADA
├── ✅ leads/              ← Gestión de leads IMPLEMENTADA
├── quotations/
├── reports/
├── ✅ contacto/           ← Página pública de contacto
└── ❌ forms/              ← NO EXISTE
    └── ❌ page.tsx        ← NO EXISTE
```

**Ubicación que debería existir**: [src/app/dashboard/forms/page.tsx](src/app/dashboard/forms/page.tsx)  
**Estado**: 🔴 **NO EXISTE**

### Comparación con Módulo de Usuarios Implementado
[src/app/users/page.tsx](src/app/users/page.tsx) - 348 líneas:
- ✅ Tabla con búsqueda/filtro
- ✅ Modal Crear, Editar, Eliminar
- ✅ Paginación
- ✅ Estados y validaciones

**Análoga debería existir para formularios**: [src/app/dashboard/forms/page.tsx](src/app/dashboard/forms/page.tsx) ❌

---

## 4️⃣ MODELO PRISMA PARA FORMULARIOS

### ✅ MODELOS DEFINIDOS EN schema.prisma (Línea ~258-278)

#### Tabla: `formularios`
```prisma
model Formulario {
  id          Int      @id @default(autoincrement())
  nombre      String
  descripcion String?
  campos      Json                    // Estructura dinámica JSON
  activo      Boolean  @default(true)
  createdBy   Int?     @map("created_by")
  createdAt   DateTime @default(now())

  creador    Usuario?              @relation(fields: [createdBy], references: [id])
  respuestas RespuestaFormulario[]
  
  @@map("formularios")
}
```

#### Tabla: `respuestas_formulario`
```prisma
model RespuestaFormulario {
  id           Int      @id @default(autoincrement())
  idFormulario Int      @map("id_formulario")
  respuestas   Json                    // Almacena respuestas dinámicamente
  idLead       Int?     @map("id_lead")
  createdAt    DateTime @default(now())

  formulario Formulario   @relation(fields: [idFormulario], references: [id])
  lead       ClienteLead? @relation(fields: [idLead], references: [id], onDelete: SetNull)
  
  @@index([idFormulario])
  @@index([idLead])
  @@map("respuestas_formulario")
}
```

**Estado**: ✅ **COMPLETO** - Modelo bien diseñado con campos JSON dinámicos

---

## 5️⃣ INTEGRACIÓN CON LEADS

### Capa de Formulario Público (ContactSection.tsx)

**Archivo**: [src/components/home/ContactSection.tsx](src/components/home/ContactSection.tsx)  
**Líneas**: 1-280

#### Flujo de Datos:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // 1. Captura datos del formulario de contacto
  const formData = {
    nombre: form.nombre,
    email: form.email,
    telefono: form.telefono,
    empresa: form.servicio,  // Usa 'empresa' para servicio de interés
    notas: `Origen: Página Web\nMensaje: ${form.mensaje}`
  };

  // 2. ✅ CREA LEAD EN LA BD (NO FORMULARIO)
  await leadsService.createPublicLead({
    ...formData
  });

  // 3. Resultado: Lead registrado en tabla 'clientes_leads'
  //    ❌ NO se registra en tabla 'formularios'
  //    ❌ NO se vincula con tabla 'respuestas_formulario'
}
```

#### Datos Capturados:
- ✅ Nombre
- ✅ Email
- ✅ Teléfono
- ✅ Servicio de interés
- ✅ Mensaje adicional
- ✅ Se almacena en BD (como Lead)

**Estado**: ✅ **CAPTURA FUNCIONA** pero se guarda como Lead, no como Formulario

---

## 6️⃣ CONTROL DE ACCESO POR ROL

### Verificación de Permisos

#### En Backend
```typescript
// backend/src/common/constants/roles.permissions.ts
// NO existen permisos específicos para formularios:
Permission.MANAGE_FORMS      // ❌ NO DEFINIDO
Permission.CREATE_FORMS      // ❌ NO DEFINIDO
Permission.DELETE_FORMS      // ❌ NO DEFINIDO
```

#### En Frontend
```typescript
// src/shared/constants/roles.ts
// Roles reconocen solo permisos que existen:
'view_users', 'create_users', 'edit_users', 'delete_users',
'view_leads', 'create_leads', 'edit_leads', 'delete_leads',
// ❌ NO hay: 'manage_forms'
```

**Estado**: 🔴 **NO DEFINIDO** - Sin control de acceso específico

---

## 7️⃣ REQUISITOS DE HU-002 vs IMPLEMENTACIÓN

### Comparativa contra Requerimientos Funcionales (pdf_content.txt)

```
┌────────────────────────────────────────┬───────┬─────────────────────┐
│ REQUERIMIENTO                          │ STATUS│ OBSERVACIÓN         │
├────────────────────────────────────────┼───────┼─────────────────────┤
│ RF01.2: Crear/Editar formularios admin │ ❌    │ Sin panel CRUD      │
│ RF01.3: Almacenar datos BD             │ ⚠️    │ Se guarda como Lead │
│ RF01.4: Notificar asesor               │ ⚠️    │ Solo a través leads │
│ Formularios dinámicos con campos JSON  │ ✅    │ Modelo preparado    │
│ Gestión de respuestas                  │ ⚠️    │ Solo captura        │
│ Control de acceso admin                │ ❌    │ Sin permisos        │
│ Listado de formularios                 │ ❌    │ Sin frontend        │
│ Eliminar/Archivar formularios          │ ❌    │ Sin funcionalidad   │
└────────────────────────────────────────┴───────┴─────────────────────┘
```

---

## 📊 MATRIZ DE IMPLEMENTACIÓN

### Backend
```
✅ Modelo Prisma              2/2   (100%)
❌ Controller                 0/1   (0%)
❌ Service                    0/1   (0%)
❌ Routes                     0/1   (0%)
❌ DTOs                       0/4   (0%)
❌ Endpoints REST             0/6   (0%)
────────────────────────────────────
   BACKEND TOTAL             2/15  (13%)
```

### Frontend
```
✅ Página pública contacto    1/1   (100%)
❌ Página admin dashboard     0/1   (0%)
❌ Componentes CRUD           0/4   (0%)
❌ Tabla interactiva          0/1   (0%)
❌ Modales (crear/editar)     0/2   (0%)
────────────────────────────────────
   FRONTEND TOTAL            1/9   (11%)
```

### Base de Datos
```
✅ Tabla formularios          1/1   (100%)
✅ Tabla respuestas_formulario 1/1  (100%)
✅ Índices                    1/1   (100%)
────────────────────────────────────
   DATABASE TOTAL            3/3   (100%)
```

### **PROMEDIO GENERAL**: 6/27 = **22% COMPLETADO**

---

## 🔴 ESTADO ACTUAL

### ✅ COMPLETADO
1. Página pública de contacto [src/app/contacto/page.tsx](src/app/contacto/page.tsx)
2. Componente ContactSection para captura
3. Modelos de BD (Formulario, RespuestaFormulario)
4. Integración con Leads (crea Lead desde formulario)

### ⚠️ PARCIAL
1. Almacenamiento de datos (se guarda como Lead, no como Formulario)
2. Notificación de asesor (solo a través del módulo de Leads)
3. Captura de respuestas (sin estructura de formulario dinámico)

### ❌ FALTA IMPLEMENTAR
1. **Backend - Módulo Forms completo** (controller, service, routes)
2. **Backend - Endpoints REST** (GET, POST, PATCH, DELETE)
3. **Frontend - Panel administrativo** para CRUD de formularios
4. **Frontend - Diseño de formularios dinámicos** (builder)
5. **Frontend - Página de respuestas** de formularios
6. **Backend - Permisos y control de roles** para formularios
7. **Backend - Validaciones** de campos dinámicos
8. **Frontend - Estadísticas** de respuestas

---

## 📁 ARCHIVOS RELEVANTES

### Documentación
- [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md#8-formularios) - Modelos de BD ✅
- [docs/API_ENDPOINTS.md](docs/API_ENDPOINTS.md) - Sin endpoints de formularios ❌
- [pdf_content.txt](pdf_content.txt) (línea ~832) - RF01.2 definición ✅
- [README_SPRINT4.md](README_SPRINT4.md) - Sprint 4 completado (sin Forms) ✅

### Backend
- [backend/src/modules/forms/](backend/src/modules/forms/) - **Vacío** ❌
- [backend/src/main.ts](backend/src/main.ts) - Sin rutas de forms ❌
- [backend/prisma/schema.prisma](backend/prisma/schema.prisma) - Modelos ✅

### Frontend
- [src/components/home/ContactSection.tsx](src/components/home/ContactSection.tsx) - Captura ✅
- [src/app/contacto/page.tsx](src/app/contacto/page.tsx) - Página pública ✅
- [src/app/users/page.tsx](src/app/users/page.tsx) - Ejemplo de CRUD a replicar ✅
- [frontend/src/services/api/endpoints.ts](frontend/src/services/api/endpoints.ts) - Endpoints define forms ⚠️

---

## 🎯 CONCLUSIÓN FINAL

### ¿CUMPLE HU-002?

**Respuesta: NO** ❌

El proyecto **CUMPLE PARCIALMENTE** con HU-002:

| Aspecto | Estado | Evidencia |
|---------|--------|-----------|
| Formulario público de contacto | ✅ 100% | [ContactSection.tsx](src/components/home/ContactSection.tsx) funcional |
| Almacenamiento en BD | ⚠️ 50% | Se guarda como Lead, no como Formulario |
| Panel admin CRUD | ❌ 0% | No existe dashboard |
| Endpoints REST | ❌ 0% | Sin implementación backend |
| Control de roles | ❌ 0% | Sin permisos definidos |
| Gestión dinámica | ❌ 0% | Sin builder de formularios |

### Score de Implementación
```
Requerimiento: HU-002 "Gestión de Formularios de Contacto"
Completitud: 22%  [██░░░░░░░░░░░░░░░░]
Funcional:   ⚠️  PARCIAL - Captura sí, CRUD administrativo no
Producción:  ❌   NO APTO - Falta 78% de implementación
```

---

## 💡 RECOMENDACIONES

### Prioridad ALTA (Para completar HU-002)
1. Implementar controller/service/routes en [backend/src/modules/forms/](backend/src/modules/forms/)
2. Crear dashboard administrativo [src/app/dashboard/forms/page.tsx](src/app/dashboard/forms/page.tsx)
3. Agregar endpoints en [docs/API_ENDPOINTS.md](docs/API_ENDPOINTS.md)
4. Definir permisos de formularios en roles

### Prioridad MEDIA
5. Validar estructura JSON dinámico
6. Implementar búsqueda y filtrado de respuestas
7. Agregar exportación de respuestas (CSV/Excel)

### Prioridad BAJA
8. Builder visual de formularios
9. Análisis y estadísticas de respuestas
10. Integración con webhooks n8n

---

**Análisis completado**: 31/05/2026 - 2:30 PM  
**Realizado por**: GitHub Copilot  
**Workspace**: edupro-web
