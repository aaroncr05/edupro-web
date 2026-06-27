# Database Schema - Plataforma CRM + Ventas

## 📊 Diagrama Entidad-Relación

```
┌─────────────┐
│   usuarios  │
├─────────────┤
│ id (PK)     │
│ email       │
│ nombre      │
│ rol_id (FK) │
└─────────────┘
      │
      ├─────────────┬──────────────┬───────────────┐
      │             │              │               │
      ▼             ▼              ▼               ▼
┌──────────────┐  ┌────────────┐  ┌──────────┐  ┌──────────┐
│clientes_leads│  │cotizaciones│  │ casos   │  │ seguimientos│
└──────────────┘  └────────────┘  └──────────┘  └──────────┘
```

## 📋 Tablas Principales

### 1. **usuarios**
Usuarios del sistema con diferentes roles.

```sql
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  contraseña_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  id_rol INTEGER NOT NULL,
  foto_perfil VARCHAR(255),
  telefono VARCHAR(20),
  activo BOOLEAN DEFAULT true,
  ultimo_acceso TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_rol) REFERENCES roles(id)
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(id_rol);
```

**Campos:**
- `id` - Identificador único
- `email` - Email del usuario (único)
- `contraseña_hash` - Contraseña encriptada con bcrypt
- `nombre` - Nombre completo
- `id_rol` - FK a tabla roles
- `activo` - Estado del usuario
- `ultimo_acceso` - Último login
- `created_at` / `updated_at` - Timestamps

---

### 2. **roles**
Roles disponibles en el sistema.

```sql
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  descripcion TEXT,
  permisos JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles VALUES
  (1, 'administrador', 'Acceso total al sistema', '{"create": true, "read": true, "update": true, "delete": true}'),
  (2, 'asesor_ventas', 'Gestión de leads y cotizaciones', '{"create": true, "read": true, "update": true}'),
  (3, 'atencion_cliente', 'Gestión de casos post-venta', '{"create": true, "read": true, "update": true}'),
  (4, 'gerente_comercial', 'Reportes y análisis', '{"read": true}'),
  (5, 'cliente', 'Acceso limitado a sus cotizaciones', '{"read": true}');
```

**Roles:**
- **administrador** - Control total
- **asesor_ventas** - Gestión de leads y ventas
- **atencion_cliente** - Soporte post-venta
- **gerente_comercial** - Reportes y KPIs
- **cliente** - Lectura de propias cotizaciones

---

### 3. **clientes_leads**
Prospectos de ventas (leads).

```sql
CREATE TABLE clientes_leads (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  telefono VARCHAR(20),
  empresa VARCHAR(255),
  cargo VARCHAR(100),
  presupuesto DECIMAL(10, 2),
  estado_lead lead_status DEFAULT 'nuevo',
  probabilidad SMALLINT DEFAULT 30,
  id_asesor INTEGER,
  notas TEXT,
  fecha_contacto TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_asesor) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Índices para queries frecuentes
CREATE INDEX idx_clientes_leads_email ON clientes_leads(email);
CREATE INDEX idx_clientes_leads_estado ON clientes_leads(estado_lead);
CREATE INDEX idx_clientes_leads_asesor ON clientes_leads(id_asesor);
CREATE INDEX idx_clientes_leads_created_at ON clientes_leads(created_at);

-- Enum
CREATE TYPE lead_status AS ENUM (
  'nuevo',
  'contactado',
  'interesado',
  'calificado',
  'propuesta_enviada',
  'negociacion',
  'convertido',
  'rechazado',
  'perdido'
);
```

**Estados:**
- `nuevo` - Lead recién creado
- `contactado` - Se hizo contacto inicial
- `interesado` - Lead mostró interés
- `calificado` - Lead está listo para cotización
- `propuesta_enviada` - Cotización enviada
- `negociacion` - En fase de negociación
- `convertido` - Se hizo cliente
- `rechazado` - Lead rechazó propuesta
- `perdido` - No continúa el proceso

---

### 4. **cotizaciones**
Cotizaciones generadas para leads.

```sql
CREATE TABLE cotizaciones (
  id SERIAL PRIMARY KEY,
  numero_cotizacion VARCHAR(50) UNIQUE NOT NULL,
  id_lead INTEGER NOT NULL,
  monto_total DECIMAL(10, 2) NOT NULL,
  moneda VARCHAR(3) DEFAULT 'USD',
  estado_cotizacion quotation_status DEFAULT 'borrador',
  pdf_url VARCHAR(500),
  fecha_vencimiento DATE,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  enviado_en TIMESTAMP,
  aceptado_en TIMESTAMP,
  rechazado_en TIMESTAMP,
  FOREIGN KEY (id_lead) REFERENCES clientes_leads(id) ON DELETE CASCADE
);

CREATE INDEX idx_cotizaciones_lead ON cotizaciones(id_lead);
CREATE INDEX idx_cotizaciones_estado ON cotizaciones(estado_cotizacion);
CREATE INDEX idx_cotizaciones_numero ON cotizaciones(numero_cotizacion);

CREATE TYPE quotation_status AS ENUM (
  'borrador',
  'enviada',
  'vista',
  'aceptada',
  'rechazada',
  'expirada'
);
```

**Estados:**
- `borrador` - Cotización sin enviar
- `enviada` - Enviada al cliente
- `vista` - Cliente la vio
- `aceptada` - Cliente aceptó
- `rechazada` - Cliente rechazó
- `expirada` - Fuera de fecha vencimiento

---

### 5. **cotizacion_items**
Items individuales de una cotización.

```sql
CREATE TABLE cotizacion_items (
  id SERIAL PRIMARY KEY,
  id_cotizacion INTEGER NOT NULL,
  descripcion VARCHAR(500) NOT NULL,
  cantidad DECIMAL(10, 2) NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (id_cotizacion) REFERENCES cotizaciones(id) ON DELETE CASCADE
);

CREATE INDEX idx_cotizacion_items_cotizacion ON cotizacion_items(id_cotizacion);
```

---

### 6. **seguimiento_leads**
Historial de interacciones con leads.

```sql
CREATE TABLE seguimiento_leads (
  id SERIAL PRIMARY KEY,
  id_lead INTEGER NOT NULL,
  id_usuario INTEGER NOT NULL,
  tipo_seguimiento VARCHAR(50) NOT NULL,
  descripcion TEXT NOT NULL,
  resultado TEXT,
  proxima_accion TEXT,
  fecha_proxima_accion DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_lead) REFERENCES clientes_leads(id) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_seguimiento_leads_lead ON seguimiento_leads(id_lead);
CREATE INDEX idx_seguimiento_leads_usuario ON seguimiento_leads(id_usuario);
```

**Tipos de seguimiento:**
- `llamada_telefonica` - Llamada al lead
- `email` - Envío de email
- `reunion` - Reunión presencial/virtual
- `visita_sitio` - Lead visitó el sitio web
- `propuesta_enviada` - Se envió propuesta
- `negociacion` - Fase de negociación

---

### 7. **casos_postventa**
Casos o tickets post-venta.

```sql
CREATE TABLE casos_postventa (
  id SERIAL PRIMARY KEY,
  numero_caso VARCHAR(50) UNIQUE NOT NULL,
  id_cliente INTEGER NOT NULL,
  id_cotizacion INTEGER,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  estado_caso case_status DEFAULT 'abierto',
  prioridad case_priority DEFAULT 'medio',
  id_responsable INTEGER,
  fecha_vencimiento DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cerrado_en TIMESTAMP,
  FOREIGN KEY (id_cliente) REFERENCES clientes_leads(id),
  FOREIGN KEY (id_cotizacion) REFERENCES cotizaciones(id) ON DELETE SET NULL,
  FOREIGN KEY (id_responsable) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_casos_cliente ON casos_postventa(id_cliente);
CREATE INDEX idx_casos_estado ON casos_postventa(estado_caso);
CREATE INDEX idx_casos_prioridad ON casos_postventa(prioridad);

CREATE TYPE case_status AS ENUM (
  'abierto',
  'en_progreso',
  'en_espera',
  'resuelto',
  'cerrado',
  'reabierto'
);

CREATE TYPE case_priority AS ENUM (
  'bajo',
  'medio',
  'alto',
  'critico'
);
```

---

### 8. **formularios**
Formularios dinámicos para captura de leads.

```sql
CREATE TABLE formularios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  campos JSONB NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES usuarios(id)
);

-- Ejemplo de estructura de campos:
-- {"fields": [
--   {"id": "name", "label": "Nombre", "type": "text", "required": true},
--   {"id": "email", "label": "Email", "type": "email", "required": true},
--   {"id": "budget", "label": "Presupuesto", "type": "number", "required": false}
-- ]}
```

---

### 9. **respuestas_formulario**
Respuestas enviadas a través de formularios.

```sql
CREATE TABLE respuestas_formulario (
  id SERIAL PRIMARY KEY,
  id_formulario INTEGER NOT NULL,
  respuestas JSONB NOT NULL,
  id_lead INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_formulario) REFERENCES formularios(id),
  FOREIGN KEY (id_lead) REFERENCES clientes_leads(id) ON DELETE SET NULL
);

CREATE INDEX idx_respuestas_formulario ON respuestas_formulario(id_formulario);
```

---

### 10. **notificaciones**
Sistema de notificaciones.

```sql
CREATE TABLE notificaciones (
  id SERIAL PRIMARY KEY,
  id_usuario INTEGER NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT false,
  enlace VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_notificaciones_usuario ON notificaciones(id_usuario);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);
```

---

### 11. **registro_actividades**
Auditoría de acciones en el sistema.

```sql
CREATE TABLE registro_actividades (
  id SERIAL PRIMARY KEY,
  id_usuario INTEGER,
  tabla_afectada VARCHAR(100) NOT NULL,
  id_registro INTEGER NOT NULL,
  tipo_accion VARCHAR(50) NOT NULL,
  valores_anteriores JSONB,
  valores_nuevos JSONB,
  ip_usuario VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_registro_actividades_usuario ON registro_actividades(id_usuario);
CREATE INDEX idx_registro_actividades_tabla ON registro_actividades(tabla_afectada);
```

**Tipos de acción:**
- `CREATE` - Creación de registro
- `UPDATE` - Modificación de registro
- `DELETE` - Eliminación de registro
- `LOGIN` - Acceso al sistema
- `EXPORT` - Exportación de datos

---

### 12. **tareas_automatizadas**
Tareas programadas/automatizadas (n8n).

```sql
CREATE TABLE tareas_automatizadas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  workflow_id VARCHAR(100) NOT NULL,
  tipo_trigger VARCHAR(50) NOT NULL,
  estado BOOLEAN DEFAULT true,
  ultima_ejecucion TIMESTAMP,
  proxima_ejecucion TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES usuarios(id)
);
```

---

### 13. **plantillas_email**
Plantillas de email para automatizaciones.

```sql
CREATE TABLE plantillas_email (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  asunto VARCHAR(255) NOT NULL,
  cuerpo TEXT NOT NULL,
  variables JSONB,
  activa BOOLEAN DEFAULT true,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES usuarios(id)
);
```

---

### 14. **contenidos_web**
Contenidos gestionables de la web.

```sql
CREATE TABLE contenidos_web (
  id SERIAL PRIMARY KEY,
  pagina VARCHAR(100) NOT NULL,
  seccion VARCHAR(100) NOT NULL,
  contenido TEXT NOT NULL,
  seo_title VARCHAR(255),
  seo_description VARCHAR(500),
  updated_by INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES usuarios(id)
);

CREATE INDEX idx_contenidos_pagina ON contenidos_web(pagina, seccion);
```

---

## 📈 Views (Vistas Agregadas)

### Resumen de Ventas por Asesor

```sql
CREATE VIEW resumen_ventas_asesor AS
SELECT 
  u.id,
  u.nombre,
  COUNT(DISTINCT cl.id) as leads_totales,
  COUNT(DISTINCT CASE WHEN cl.estado_lead = 'convertido' THEN cl.id END) as leads_convertidos,
  SUM(cot.monto_total) as ingresos_totales,
  AVG(cot.monto_total) as ingreso_promedio,
  COUNT(DISTINCT cp.id) as casos_post_venta,
  COUNT(DISTINCT CASE WHEN cp.estado_caso = 'cerrado' THEN cp.id END) as casos_resueltos
FROM usuarios u
LEFT JOIN clientes_leads cl ON u.id = cl.id_asesor
LEFT JOIN cotizaciones cot ON cl.id = cot.id_lead
LEFT JOIN casos_postventa cp ON cl.id = cp.id_cliente
GROUP BY u.id, u.nombre;
```

### Estado de Cotizaciones

```sql
CREATE VIEW estado_cotizaciones AS
SELECT 
  estado_cotizacion,
  COUNT(*) as cantidad,
  SUM(monto_total) as monto_total,
  AVG(monto_total) as monto_promedio
FROM cotizaciones
GROUP BY estado_cotizacion;
```

### Casos Pendientes

```sql
CREATE VIEW casos_pendientes AS
SELECT 
  cp.*,
  cl.nombre as cliente_nombre,
  u.nombre as responsable_nombre,
  EXTRACT(DAY FROM CURRENT_DATE - cp.created_at) as dias_abierto
FROM casos_postventa cp
LEFT JOIN clientes_leads cl ON cp.id_cliente = cl.id
LEFT JOIN usuarios u ON cp.id_responsable = u.id
WHERE cp.estado_caso IN ('abierto', 'en_progreso', 'en_espera')
ORDER BY cp.prioridad DESC, cp.created_at ASC;
```

---

## 🔑 Índices de Performance

```sql
-- Índices por tabla

-- usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(id_rol);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

-- clientes_leads
CREATE INDEX idx_clientes_leads_email ON clientes_leads(email);
CREATE INDEX idx_clientes_leads_estado ON clientes_leads(estado_lead);
CREATE INDEX idx_clientes_leads_asesor ON clientes_leads(id_asesor);
CREATE INDEX idx_clientes_leads_created ON clientes_leads(created_at);

-- cotizaciones
CREATE INDEX idx_cotizaciones_lead ON cotizaciones(id_lead);
CREATE INDEX idx_cotizaciones_estado ON cotizaciones(estado_cotizacion);
CREATE INDEX idx_cotizaciones_numero ON cotizaciones(numero_cotizacion);

-- casos_postventa
CREATE INDEX idx_casos_cliente ON casos_postventa(id_cliente);
CREATE INDEX idx_casos_estado ON casos_postventa(estado_caso);
CREATE INDEX idx_casos_responsable ON casos_postventa(id_responsable);

-- seguimiento_leads
CREATE INDEX idx_seguimiento_lead ON seguimiento_leads(id_lead);
CREATE INDEX idx_seguimiento_usuario ON seguimiento_leads(id_usuario);

-- notificaciones
CREATE INDEX idx_notificaciones_usuario ON notificaciones(id_usuario);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);
```

---

## 📊 Cardinality

| Relación | Tipo | Ejemplo |
|----------|------|---------|
| usuarios ← clientes_leads | 1:N | 1 asesor gestiona N leads |
| clientes_leads ← cotizaciones | 1:N | 1 lead recibe N cotizaciones |
| clientes_leads ← casos_postventa | 1:N | 1 cliente genera N casos |
| clientes_leads ← seguimiento_leads | 1:N | 1 lead tiene N seguimientos |
| usuarios ← seguimiento_leads | 1:N | 1 usuario realiza N seguimientos |
| cotizaciones ← cotizacion_items | 1:N | 1 cotización tiene N items |

---

## 🚀 Próximos Pasos

1. Migrar este esquema a Prisma:
   ```bash
   npm run prisma:migrate
   ```

2. Generar tipos TypeScript:
   ```bash
   npm run prisma:generate
   ```

3. Cargar datos iniciales (seeds):
   ```bash
   npm run prisma:seed
   ```

4. Validar índices están creados:
   ```sql
   SELECT indexname FROM pg_indexes WHERE tablename = 'usuarios';
   ```
