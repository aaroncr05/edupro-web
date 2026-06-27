# 🔐 Sistema de Roles y Permisos - EduPro CRM

## Resumen de Roles

El sistema EduPro utiliza **5 roles diferentes** con permisos específicos para cada función:

---

## 👨‍💼 1. ADMINISTRADOR
**Acceso total al sistema**

### Funciones permitidas:
- ✅ **Gestión de Usuarios**
  - Ver todos los usuarios
  - Crear nuevos usuarios
  - Editar datos de usuarios
  - Eliminar usuarios
  - Activar/Desactivar cuentas
  - Cambiar roles de usuarios

- ✅ **Gestión de Leads/Prospectos** (RF02)
  - Ver todos los leads
  - Crear nuevos leads
  - Editar leads
  - Eliminar leads
  - Asignar a asesores
  - Exportar datos

- ✅ **Gestión de Cotizaciones** (RF03)
  - Ver todas las cotizaciones
  - Crear cotizaciones
  - Editar cotizaciones
  - Eliminar cotizaciones
  - Enviar cotizaciones
  - Exportar cotizaciones

- ✅ **Gestión de Casos de Soporte** (RF05)
  - Ver todos los casos
  - Crear casos
  - Editar casos
  - Cerrar casos
  - Asignar a agentes

- ✅ **Reportes e Analytics**
  - Ver reportes completos
  - Exportar reportes
  - Ver analytics
  - Ver registro de actividades

- ✅ **Configuración**
  - Gestionar configuración del sistema
  - Ver logs de actividad

---

## 💼 2. ASESOR DE VENTAS
**Gestiona leads y cotizaciones**

### Funciones permitidas:
- ✅ **Gestión de Leads** (RF02)
  - Ver leads asignados
  - Crear nuevos leads
  - Editar leads
  - Asignar leads a otros asesores
  - Exportar datos

- ✅ **Gestión de Cotizaciones** (RF03)
  - Ver cotizaciones propias
  - Crear cotizaciones
  - Editar cotizaciones
  - Enviar cotizaciones a clientes
  - Exportar cotizaciones

- ⚠️ **Reportes**
  - Ver reportes (solo lectura)
  - Ver analytics de ventas

- 📋 **Auditoría**
  - Ver registro de actividades

### Funciones NO permitidas:
- ❌ Crear/editar/eliminar otros usuarios
- ❌ Gestionar soporte técnico
- ❌ Acceso a casos de soporte
- ❌ Eliminar cotizaciones

---

## 🎧 3. ATENCIÓN AL CLIENTE / SOPORTE
**Soporte técnico y gestión de casos**

### Funciones permitidas:
- ✅ **Gestión de Casos de Soporte** (RF05)
  - Ver casos asignados
  - Crear nuevos casos
  - Editar casos
  - Cerrar casos
  - Asignar a otros agentes

- 📖 **Información de Leads** (lectura)
  - Ver datos de leads (no editar)

- 📋 **Reportes**
  - Ver reportes (solo lectura)
  - Ver registro de actividades

### Funciones NO permitidas:
- ❌ Crear/editar/eliminar usuarios
- ❌ Crear o modificar cotizaciones
- ❌ Acceso a módulo de ventas
- ❌ Crear leads

---

## 📊 4. GERENTE COMERCIAL
**Supervisión de ventas y reportes**

### Funciones permitidas:
- ✅ **Leads** (supervisión)
  - Ver todos los leads
  - Editar leads
  - Asignar leads a asesores
  - Exportar datos

- ✅ **Cotizaciones** (supervisión)
  - Ver todas las cotizaciones
  - Editar cotizaciones
  - Enviar cotizaciones
  - Exportar cotizaciones

- ✅ **Casos de Soporte**
  - Ver todos los casos
  - Asignar a agentes

- ✅ **Reportes e Analytics**
  - Ver reportes completos
  - Exportar reportes
  - Ver analytics de ventas
  - Ver registro de actividades

### Funciones NO permitidas:
- ❌ Crear/editar/eliminar usuarios
- ❌ Crear leads desde cero (solo editar existentes)
- ❌ Crear cotizaciones desde cero (solo editar existentes)
- ❌ Eliminar leads o cotizaciones

---

## 🔓 5. CLIENTE (Externo)
**Acceso limitado a información propia**

### Funciones permitidas:
- ✅ **Cotizaciones Propias**
  - Ver cotizaciones enviadas a él
  - Aceptar/Rechazar cotizaciones

- ✅ **Casos de Soporte Propios**
  - Ver casos de soporte creados
  - Crear nuevos casos
  - Ver estado del soporte

### Funciones NO permitidas:
- ❌ Ver otros clientes
- ❌ Crear leads
- ❌ Acceso a usuarios
- ❌ Ver reportes del sistema
- ❌ Editar cotizaciones

---

## 📊 Tabla Comparativa de Permisos

| Función | Admin | Asesor Ventas | Soporte | Gerente | Cliente |
|---------|:-----:|:----------:|:-------:|:------:|:------:|
| **USUARIOS** |
| Ver usuarios | ✅ | ❌ | ❌ | ❌ | ❌ |
| Crear usuarios | ✅ | ❌ | ❌ | ❌ | ❌ |
| Editar usuarios | ✅ | ❌ | ❌ | ❌ | ❌ |
| Eliminar usuarios | ✅ | ❌ | ❌ | ❌ | ❌ |
| **LEADS** |
| Ver leads | ✅ | ✅ | 📖 | ✅ | ❌ |
| Crear leads | ✅ | ✅ | ❌ | ❌ | ❌ |
| Editar leads | ✅ | ✅ | ❌ | ✅ | ❌ |
| Eliminar leads | ✅ | ❌ | ❌ | ❌ | ❌ |
| Asignar leads | ✅ | ✅ | ❌ | ✅ | ❌ |
| Exportar leads | ✅ | ✅ | ❌ | ✅ | ❌ |
| **COTIZACIONES** |
| Ver cotizaciones | ✅ | ✅ | ❌ | ✅ | ✅* |
| Crear cotizaciones | ✅ | ✅ | ❌ | ❌ | ❌ |
| Editar cotizaciones | ✅ | ✅ | ❌ | ✅ | ❌ |
| Eliminar cotizaciones | ✅ | ❌ | ❌ | ❌ | ❌ |
| Enviar cotizaciones | ✅ | ✅ | ❌ | ✅ | ❌ |
| **CASOS** |
| Ver casos | ✅ | ❌ | ✅ | ✅ | ✅* |
| Crear casos | ✅ | ❌ | ✅ | ❌ | ✅* |
| Editar casos | ✅ | ❌ | ✅ | ❌ | ❌ |
| Cerrar casos | ✅ | ❌ | ✅ | ❌ | ❌ |
| Asignar casos | ✅ | ❌ | ✅ | ✅ | ❌ |
| **REPORTES** |
| Ver reportes | ✅ | ✅ | ✅ | ✅ | ❌ |
| Exportar reportes | ✅ | ❌ | ❌ | ✅ | ❌ |
| Ver analytics | ✅ | ✅ | ❌ | ✅ | ❌ |
| **AUDITORÍA** |
| Ver registro de actividades | ✅ | ✅ | ✅ | ✅ | ❌ |

*Clientes solo ven información propia

---

## 🛠️ Implementación en Código

### Backend - Middleware de Roles

```typescript
// Proteger ruta solo para administradores
app.post('/api/users', requireRole('administrador'), createUserHandler)

// Permitir múltiples roles
app.get('/api/leads', requireRole(['administrador', 'asesor_ventas', 'gerente_comercial']), getLeadsHandler)

// Por permisos específicos
app.delete('/api/leads/:id', requirePermission(Permission.DELETE_LEADS), deleteLeadHandler)
```

### Frontend - Usar Permisos

```typescript
import { usePermissions } from '@/hooks/usePermissions'

export default function Dashboard() {
  const { permissions, loading } = usePermissions()

  if (loading) return <div>Cargando permisos...</div>

  return (
    <div>
      {permissions?.canCreate.leads && (
        <button>+ Crear Lead</button>
      )}

      {permissions?.canView.reports && (
        <div>Sección de Reportes</div>
      )}

      {permissions?.canEdit.users && (
        <div>Gestión de Usuarios</div>
      )}
    </div>
  )
}
```

---

## 🔄 Flujo de Verificación de Permisos

```
1. Usuario inicia sesión
   ↓
2. JWT token se genera con rol
   ↓
3. Al acceder a recurso, se verifica token
   ↓
4. Backend obtiene rol del token
   ↓
5. Middleware verifica si rol tiene permiso
   ↓
6. Si ✅ → Permite acceso y registra en RegistroActividad
   Si ❌ → Error 403 "Acceso denegado"
```

---

## 📝 Registro de Actividades

Cada acción se registra automáticamente en `RegistroActividad`:

```typescript
{
  idUsuario: 1,
  tipoAccion: 'CREATE',  // CREATE, UPDATE, DELETE, LOGIN, EXPORT
  tipoEntidad: 'Lead',
  idEntidad: 42,
  cambiosDespues: { nombre: 'Juan Pérez', email: '...' },
  timestamp: '2026-05-27T19:10:43Z'
}
```

---

## ✅ Verificación de Cumplimiento RF07

✅ **RF07.1** - Login con usuario/contraseña  
✅ **RF07.2** - Control de acceso por roles (RBAC)  
✅ **RF07.3** - Gestión de usuarios (crear, editar, desactivar)  
✅ **RF07.4** - Registro de acciones (auditoría)
