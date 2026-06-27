# Guía de Instalación - Plataforma CRM + Ventas

## 📋 Requisitos Previos

- Node.js 20+ ([descargar](https://nodejs.org/))
- PostgreSQL 18+ ([descargar](https://www.postgresql.org/download/))
- Git ([descargar](https://git-scm.com/))
- Código editor (VS Code recomendado)

## 🚀 Instalación Paso a Paso

### 1. Clonar o Descargar Proyecto

```bash
# Si está en GitHub:
git clone https://github.com/tu-repo/edupro-web.git
cd edupro-web

# O si ya tienes los archivos:
cd edupro-web
```

### 2. Crear Base de Datos PostgreSQL

```bash
# Abrir psql
psql -U postgres

# Crear BD
CREATE DATABASE edupro_db;

# Conectarse a la BD
\c edupro_db

# Salir
\q
```

### 3. Instalar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# EDITAR .env con tus valores:
# DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/edupro_db"
# JWT_SECRET="tu_secret_aqui"
# etc
```

### 4. Setup Prisma

```bash
# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones (crea tablas)
npm run prisma:migrate

# Opcional: Cargar datos iniciales
npm run prisma:seed
```

### 5. Instalar Frontend

```bash
# Volver a raíz
cd ../frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# EDITAR .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 6. Ejecutar en Desarrollo

#### Terminal 1 - Backend

```bash
cd backend
npm run dev

# Deberías ver:
# Server running on http://localhost:3001
```

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev

# Deberías ver:
# ▲ Local:        http://localhost:3000
```

### 7. Verificar Instalación

- Abre http://localhost:3000 en el navegador
- Verifica que la landing page carga
- Abre http://localhost:3001/api/health (debe devolver 200 si existe el endpoint)

## 🔧 Troubleshooting

### Error: "Cannot find module 'express'"

```bash
# Solución: Instalar dependencias nuevamente
npm install
```

### Error: "CONNECTION REFUSED postgresql://..."

```bash
# Verificar que PostgreSQL está corriendo:

# En Windows:
# 1. Abrir Services (services.msc)
# 2. Buscar "PostgreSQL"
# 3. Verificar que está "Running"

# En Mac:
brew services list

# En Linux:
sudo systemctl status postgresql
```

### Error: "Port 3001 is already in use"

```bash
# Encontrar qué proceso usa el puerto
lsof -i :3001

# Matar proceso
kill -9 <PID>

# O cambiar puerto en backend/.env
PORT=3002
```

### Error: "PRISMA: authentication failed"

```bash
# Verificar credenciales en DATABASE_URL
# Formato correcto:
# postgresql://usuario:contraseña@localhost:5432/edupro_db
```

## 📁 Estructura después de Instalación

```
edupro-web/
├── backend/               # API Express
│   ├── src/
│   ├── prisma/
│   ├── node_modules/
│   ├── .env               # ← IMPORTANTE: no compartir
│   └── package.json
│
├── frontend/              # Next.js
│   ├── src/
│   ├── node_modules/
│   ├── .env.local         # ← IMPORTANTE: no compartir
│   └── package.json
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API_ENDPOINTS.md
│   └── SETUP.md
│
└── README.md
```

## 🔒 Seguridad

### Proteger `.env`

```bash
# Agregar a .gitignore
echo ".env" >> backend/.gitignore
echo ".env.local" >> frontend/.gitignore

# Verificar que no está commitido
git status
```

### Cambiar JWT_SECRET

```bash
# Generar secret seguro:
# En Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copiar output a backend/.env
JWT_SECRET="<tu_nuevo_secret>"
```

## 📊 Próximos Pasos

1. **Explorar Base de Datos**
   ```bash
   psql -U postgres -d edupro_db
   \dt  # Listar tablas
   ```

2. **Ver Estructura del Backend**
   ```bash
   cd backend
   tree src/modules/  # Para ver estructura
   ```

3. **Revisar Componentes Frontend**
   ```bash
   cd frontend
   ls src/components/
   ```

4. **Crear Primer Endpoint**
   - Ver [ARCHITECTURE.md](./ARCHITECTURE.md)
   - Crear ruta en `backend/src/modules/leads/`

5. **Conectar Frontend a Backend**
   - Ver ejemplo en `frontend/src/services/api/`
   - Crear servicio para nuevo endpoint

## 🆘 Soporte

En caso de problemas:

1. Revisar archivos `.log` si existen
2. Verificar que todas las dependencias están instaladas: `npm ls`
3. Limpiar cachés:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```
4. Consultar documentación oficial de las herramientas

## 📚 Documentación Adicional

- [Backend README](../backend/README.md)
- [Frontend README](../frontend/README.md)
- [API Endpoints](./API_ENDPOINTS.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Architecture](./ARCHITECTURE.md)
