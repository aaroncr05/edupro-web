# 📋 GUÍA RÁPIDA - Funciones por Rol en EduPro

## 🎯 Resumen Ejecutivo

Tu sistema ahora tiene **5 roles diferentes** con permisos y funciones específicas:

---

## 1️⃣ **ADMINISTRADOR** 🔑
- **Color**: Naranja (#FF7101)
- **Acceso**: Sistema completo
- **Funciones clave**:
  - ✅ Crear, editar, eliminar usuarios
  - ✅ Activar/desactivar cuentas
  - ✅ Cambiar roles de usuarios
  - ✅ Acceso a TODOS los módulos
  - ✅ Ver reportes y analytics
  - ✅ Gestionar configuración
  - ✅ Ver historial de actividades

**Módulos accesibles**:
- Dashboard | Leads | Cotizaciones | Casos | Usuarios | Reportes | Configuración

---

## 2️⃣ **ASESOR DE VENTAS** 💼
- **Color**: Azul (#0740E4)
- **Acceso**: Módulo de ventas
- **Funciones clave**:
  - ✅ Crear y editar leads
  - ✅ Crear y enviar cotizaciones
  - ✅ Ver reportes
  - ✅ Ver historial de actividades
  - ❌ NO puede eliminar leads/cotizaciones
  - ❌ NO puede crear usuarios
  - ❌ NO puede ver casos de soporte

**Módulos accesibles**:
- Dashboard | Leads | Cotizaciones | Reportes

---

## 3️⃣ **SOPORTE TÉCNICO** 🎧
- **Color**: Verde (#34A853)
- **Acceso**: Módulo de soporte
- **Funciones clave**:
  - ✅ Crear y cerrar casos de soporte
  - ✅ Asignar casos a otros agentes
  - ✅ Ver datos de leads (no editar)
  - ✅ Ver reportes
  - ❌ NO puede crear/editar leads
  - ❌ NO puede gestionar cotizaciones
  - ❌ NO puede crear usuarios

**Módulos accesibles**:
- Dashboard | Casos | Reportes

---

## 4️⃣ **GERENTE COMERCIAL** 📊
- **Color**: Púrpura (#9333EA)
- **Acceso**: Supervisión de ventas
- **Funciones clave**:
  - ✅ Ver y editar leads (sin crear desde cero)
  - ✅ Ver y editar cotizaciones
  - ✅ Asignar leads/casos
  - ✅ Ver reportes y analytics
  - ✅ Exportar datos
  - ❌ NO puede crear nuevos leads
  - ❌ NO puede eliminar datos
  - ❌ NO puede crear usuarios

**Módulos accesibles**:
- Dashboard | Leads | Cotizaciones | Casos | Reportes

---

## 5️⃣ **CLIENTE** 👤
- **Color**: Gris (#808080)
- **Acceso**: Información propia
- **Funciones clave**:
  - ✅ Ver cotizaciones recibidas
  - ✅ Crear y ver casos de soporte
  - ❌ NO puede crear leads
  - ❌ NO puede editar cotizaciones
  - ❌ NO puede ver usuarios

**Módulos accesibles**:
- Cotizaciones (propias) | Casos (propios)

---

## 📊 MATRIZ DE PERMISOS RÁPIDA

| Acción | Admin | Asesor | Soporte | Gerente | Cliente |
|--------|:-----:|:------:|:-------:|:------:|:-------:|
| **Usuarios** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Leads - Crear** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Leads - Editar** | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Leads - Eliminar** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Cotizaciones - Crear** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Cotizaciones - Ver** | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Casos - Crear** | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Casos - Cerrar** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Reportes** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Exportar datos** | ✅ | ✅ | ❌ | ✅ | ❌ |

---

## 🔄 FLUJO DE VERIFICACIÓN

```
Usuario intenta acceder a función
        ↓
1. ¿Tiene sesión válida? (JWT Token)
   ├─ NO → Error 401 "No autenticado"
   └─ SÍ → Siguiente
        ↓
2. ¿Tiene rol asignado?
   ├─ NO → Error 403 "Sin rol"
   └─ SÍ → Siguiente
        ↓
3. ¿Su rol tiene permiso para esta acción?
   ├─ NO → Error 403 "Acceso denegado"
   └─ SÍ → Ejecuta acción ✅
        ↓
4. Registra en RegistroActividad (Auditoría)
```

---

## 🛠️ CÓMO USAR EN EL CÓDIGO

### Backend - Proteger rutas

```typescript
// Solo administrador
app.post('/api/users', requireRole('administrador'), createUserHandler)

// Múltiples roles
app.get('/api/leads', 
  requireRole(['administrador', 'asesor_ventas', 'gerente_comercial']), 
  getLeadsHandler
)

// Por permiso específico
app.delete('/api/leads/:id', 
  requirePermission(Permission.DELETE_LEADS), 
  deleteLeadHandler
)
```

### Frontend - Mostrar según rol

```typescript
import { usePermissions } from '@/hooks/usePermissions'

export default function Dashboard() {
  const { permissions } = usePermissions()

  return (
    <div>
      {/* Solo mostrar si puede crear leads */}
      {permissions?.canCreate.leads && (
        <button>+ Crear Lead</button>
      )}

      {/* Solo mostrar reportes si tiene acceso */}
      {permissions?.canView.reports && (
        <div>Sección Reportes</div>
      )}

      {/* Solo admin ve gestión de usuarios */}
      {permissions?.canEdit.users && (
        <div>Administración de Usuarios</div>
      )}
    </div>
  )
}
```

---

## ✅ VERIFICACIÓN RF07

| Requisito | ¿Cumple? | Detalles |
|-----------|:--------:|----------|
| **RF07.1** - Login | ✅ | JWT con email/contraseña |
| **RF07.2** - Control por roles | ✅ | 5 roles con permisos específicos |
| **RF07.3** - Gestión usuarios | ✅ | Crear, editar, desactivar |
| **RF07.4** - Auditoría | ✅ | RegistroActividad con ActionType |

---

## 📁 Archivos Implementados

- ✅ `/backend/src/common/constants/roles.permissions.ts` - Configuración de permisos
- ✅ `/backend/src/common/middleware/roles.middleware.ts` - Middleware de verificación
- ✅ `/backend/src/modules/auth/controllers/permissions.controller.ts` - Endpoint de permisos
- ✅ `/src/hooks/usePermissions.ts` - Hook para frontend
- ✅ `/src/shared/constants/roles.ts` - Constantes en frontend
- ✅ `/docs/ROLES_Y_PERMISOS.md` - Documentación completa

---

## 🚀 Próximos Pasos (Opcional)

1. Implementar guards en rutas principales
2. Crear página de auditoría (RegistroActividad)
3. Agregar filtros en reportes por rol del usuario
4. Crear dashboard personalizado por rol
5. Implementar exportación de datos (si tiene permiso)
