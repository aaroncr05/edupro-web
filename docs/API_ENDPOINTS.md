# API Endpoints - Plataforma CRM + Ventas

## 🔌 Base URL

```
Development: http://localhost:3001/api
Production: https://api.edupro.com/api
```

## 🔐 Autenticación

Todos los endpoints protegidos requieren header:

```
Authorization: Bearer <JWT_TOKEN>
```

## 📝 Auth Module

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response 200:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nombre": "John Doe",
    "rol": "asesor_ventas"
  }
}
```

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "nombre": "Jane Doe",
  "rol": "asesor_ventas"
}

Response 201:
{
  "id": 2,
  "email": "newuser@example.com",
  "nombre": "Jane Doe",
  "rol": "asesor_ventas",
  "createdAt": "2024-05-13T10:30:00Z"
}
```

### Refresh Token
```http
POST /auth/refresh
Authorization: Bearer <JWT_TOKEN>

Response 200:
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <JWT_TOKEN>

Response 200:
{
  "message": "Logout successful"
}
```

## 👥 Users Module

### Get All Users (Admin)
```http
GET /users?page=1&limit=10
Authorization: Bearer <JWT_TOKEN>

Response 200:
{
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "nombre": "John Doe",
      "rol": "asesor_ventas",
      "activo": true,
      "createdAt": "2024-05-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

### Get User by ID
```http
GET /users/:id
Authorization: Bearer <JWT_TOKEN>

Response 200:
{
  "id": 1,
  "email": "user@example.com",
  "nombre": "John Doe",
  "rol": "asesor_ventas",
  "activo": true
}
```

### Update User
```http
PATCH /users/:id
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "nombre": "John Updated",
  "email": "newemail@example.com"
}

Response 200:
{
  "id": 1,
  "email": "newemail@example.com",
  "nombre": "John Updated",
  "rol": "asesor_ventas"
}
```

### Delete User
```http
DELETE /users/:id
Authorization: Bearer <JWT_TOKEN>

Response 204: (No Content)
```

## 🎯 Leads Module

### Create Lead
```http
POST /leads
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "nombre": "Empresa ABC",
  "email": "contact@abc.com",
  "telefono": "555-1234",
  "empresa": "ABC Corp",
  "cargo": "Gerente",
  "presupuesto": 5000,
  "estado_lead": "nuevo",
  "probabilidad": 30
}

Response 201:
{
  "id": 1,
  "nombre": "Empresa ABC",
  "email": "contact@abc.com",
  "estado_lead": "nuevo",
  "id_asesor": 1,
  "createdAt": "2024-05-13T10:30:00Z"
}
```

### Get All Leads
```http
GET /leads?estado=nuevo&page=1&limit=20
Authorization: Bearer <JWT_TOKEN>

Response 200:
{
  "data": [
    {
      "id": 1,
      "nombre": "Empresa ABC",
      "email": "contact@abc.com",
      "estado_lead": "nuevo",
      "probabilidad": 30,
      "id_asesor": 1,
      "createdAt": "2024-05-13T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42
  }
}
```

### Get Lead by ID
```http
GET /leads/:id
Authorization: Bearer <JWT_TOKEN>

Response 200:
{
  "id": 1,
  "nombre": "Empresa ABC",
  "email": "contact@abc.com",
  "estado_lead": "nuevo",
  "presupuesto": 5000,
  "probabilidad": 30,
  "id_asesor": 1,
  "seguimientos": [
    {
      "id": 1,
      "tipo_seguimiento": "email",
      "descripcion": "Envío propuesta inicial",
      "createdAt": "2024-05-13T11:00:00Z"
    }
  ]
}
```

### Update Lead
```http
PATCH /leads/:id
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "estado_lead": "contactado",
  "probabilidad": 50,
  "presupuesto": 7500
}

Response 200:
{
  "id": 1,
  "nombre": "Empresa ABC",
  "estado_lead": "contactado",
  "probabilidad": 50,
  "presupuesto": 7500
}
```

### Classify Lead
```http
POST /leads/:id/classify
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "estado_lead": "calificado",
  "probabilidad": 75,
  "razon_clasificacion": "Presupuesto confirmado"
}

Response 200:
{
  "id": 1,
  "estado_lead": "calificado",
  "probabilidad": 75,
  "clasificado_en": "2024-05-13T12:00:00Z"
}
```

### Delete Lead
```http
DELETE /leads/:id
Authorization: Bearer <JWT_TOKEN>

Response 204: (No Content)
```

## 📄 Quotations Module

### Create Quotation
```http
POST /quotations
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "id_lead": 1,
  "monto_total": 5000,
  "moneda": "USD",
  "items": [
    {
      "descripcion": "Servicio Web",
      "cantidad": 1,
      "precio_unitario": 2500
    },
    {
      "descripcion": "SEO",
      "cantidad": 1,
      "precio_unitario": 2500
    }
  ],
  "notas": "Incluye hosting primer año"
}

Response 201:
{
  "id": 1,
  "id_lead": 1,
  "numero_cotizacion": "COT-001",
  "monto_total": 5000,
  "estado_cotizacion": "borrador",
  "createdAt": "2024-05-13T13:00:00Z"
}
```

### Get All Quotations
```http
GET /quotations?estado=enviada&page=1
Authorization: Bearer <JWT_TOKEN>

Response 200:
{
  "data": [
    {
      "id": 1,
      "numero_cotizacion": "COT-001",
      "id_lead": 1,
      "lead": {
        "nombre": "Empresa ABC",
        "email": "contact@abc.com"
      },
      "monto_total": 5000,
      "estado_cotizacion": "enviada",
      "createdAt": "2024-05-13T13:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12
  }
}
```

### Get Quotation by ID
```http
GET /quotations/:id
Authorization: Bearer <JWT_TOKEN>

Response 200:
{
  "id": 1,
  "numero_cotizacion": "COT-001",
  "id_lead": 1,
  "monto_total": 5000,
  "estado_cotizacion": "enviada",
  "items": [
    {
      "id": 1,
      "descripcion": "Servicio Web",
      "cantidad": 1,
      "precio_unitario": 2500,
      "subtotal": 2500
    }
  ],
  "notas": "Incluye hosting primer año",
  "enviado_en": "2024-05-13T14:00:00Z"
}
```

### Generate PDF
```http
POST /quotations/:id/generate-pdf
Authorization: Bearer <JWT_TOKEN>

Response 200:
{
  "pdf_url": "https://storage.edupro.com/quotations/COT-001.pdf",
  "mensaje": "PDF generado exitosamente"
}
```

### Send Quotation
```http
POST /quotations/:id/send
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "email_destinatario": "contact@abc.com",
  "mensaje_personalizado": "Adjunto encontrará nuestra propuesta..."
}

Response 200:
{
  "id": 1,
  "estado_cotizacion": "enviada",
  "enviado_en": "2024-05-13T14:30:00Z",
  "email_enviado_a": "contact@abc.com"
}
```

## 📋 Cases Module (Post-Venta)

### Create Case
```http
POST /cases
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "id_cliente": 1,
  "titulo": "Problema con página web",
  "descripcion": "El sitio no carga en dispositivos móviles",
  "prioridad": "alto",
  "tipo_caso": "soporte_tecnico"
}

Response 201:
{
  "id": 1,
  "numero_caso": "CASO-001",
  "titulo": "Problema con página web",
  "estado_caso": "abierto",
  "prioridad": "alto",
  "createdAt": "2024-05-13T15:00:00Z"
}
```

### Get All Cases
```http
GET /cases?estado=abierto&prioridad=alto
Authorization: Bearer <JWT_TOKEN>

Response 200:
{
  "data": [
    {
      "id": 1,
      "numero_caso": "CASO-001",
      "titulo": "Problema con página web",
      "estado_caso": "abierto",
      "prioridad": "alto",
      "id_cliente": 1,
      "createdAt": "2024-05-13T15:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}
```

### Add Comment
```http
POST /cases/:id/comments
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "mensaje": "Ya hemos identificado el problema. Trabajando en solución."
}

Response 201:
{
  "id": 1,
  "caso_id": 1,
  "usuario_id": 1,
  "mensaje": "Ya hemos identificado el problema...",
  "createdAt": "2024-05-13T16:00:00Z"
}
```

### Close Case
```http
PATCH /cases/:id/close
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "resolucion": "Problema solucionado - caché limpiada",
  "solucion_exitosa": true
}

Response 200:
{
  "id": 1,
  "numero_caso": "CASO-001",
  "estado_caso": "cerrado",
  "cerrado_en": "2024-05-13T17:00:00Z"
}
```

## 🎯 Webhooks (n8n Integration)

### Lead Created Webhook
```http
POST /webhooks/n8n/lead-created
Content-Type: application/json
X-N8N-Token: <n8n_token>

{
  "leadId": 1,
  "leadName": "Empresa ABC",
  "email": "contact@abc.com",
  "timestamp": "2024-05-13T10:30:00Z"
}

Response 200:
{
  "success": true,
  "workflowTriggered": "lead-new-notification"
}
```

## 📊 Reports Module

### Get Sales Summary
```http
GET /reports/sales-summary?mes=mayo&ano=2024
Authorization: Bearer <JWT_TOKEN>

Response 200:
{
  "periodo": "mayo 2024",
  "leads_nuevos": 15,
  "leads_calificados": 8,
  "cotizaciones_enviadas": 6,
  "monto_total_cotizado": 35000,
  "conversion_rate": 40,
  "promedio_ciclo_venta_dias": 12
}
```

### Get Advisor Performance
```http
GET /reports/advisor-performance?id_asesor=1
Authorization: Bearer <JWT_TOKEN>

Response 200:
{
  "asesor": "John Doe",
  "leads_gestionados": 20,
  "conversion_rate": 45,
  "ingresos_generados": 47500,
  "casos_resueltos": 8,
  "satisfaccion_cliente": 4.8
}
```

## 🔍 Error Responses

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Email is required",
  "statusCode": 400
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token",
  "statusCode": 401
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions",
  "statusCode": 403
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Lead not found",
  "statusCode": 404
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "statusCode": 500
}
```

## 📚 Documentación Interactiva

Para explorar interactivamente los endpoints:

1. **Postman Collection**
   - Importar `docs/postman-collection.json` en Postman

2. **Swagger UI**
   - Acceder a `http://localhost:3001/api-docs` (cuando esté configurado)

3. **Insomnia**
   - Importar workspace desde `docs/insomnia-workspace.json`
