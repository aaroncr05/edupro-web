-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('administrador', 'asesor_ventas', 'atencion_cliente', 'gerente_comercial', 'cliente');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('nuevo', 'contactado', 'interesado', 'calificado', 'propuesta_enviada', 'negociacion', 'convertido', 'rechazado', 'perdido');

-- CreateEnum
CREATE TYPE "QuotationStatus" AS ENUM ('borrador', 'enviada', 'vista', 'aceptada', 'rechazada', 'expirada');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('abierto', 'en_progreso', 'en_espera', 'resuelto', 'cerrado', 'reabierto');

-- CreateEnum
CREATE TYPE "CasePriority" AS ENUM ('bajo', 'medio', 'alto', 'critico');

-- CreateEnum
CREATE TYPE "FollowupType" AS ENUM ('llamada_telefonica', 'email', 'reunion', 'visita_sitio', 'propuesta_enviada', 'negociacion');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT');

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "permisos" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "contraseña_hash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "id_rol" INTEGER NOT NULL,
    "foto_perfil" TEXT,
    "telefono" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_acceso" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes_leads" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "empresa" TEXT,
    "cargo" TEXT,
    "presupuesto" DECIMAL(10,2),
    "estado_lead" "LeadStatus" NOT NULL DEFAULT 'nuevo',
    "probabilidad" INTEGER NOT NULL DEFAULT 30,
    "id_asesor" INTEGER,
    "notas" TEXT,
    "fecha_contacto" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotizaciones" (
    "id" SERIAL NOT NULL,
    "numero_cotizacion" TEXT NOT NULL,
    "id_lead" INTEGER NOT NULL,
    "monto_total" DECIMAL(10,2) NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'USD',
    "estado_cotizacion" "QuotationStatus" NOT NULL DEFAULT 'borrador',
    "pdf_url" TEXT,
    "fecha_vencimiento" TIMESTAMP(3),
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "enviado_en" TIMESTAMP(3),
    "aceptado_en" TIMESTAMP(3),
    "rechazado_en" TIMESTAMP(3),

    CONSTRAINT "cotizaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotizacion_items" (
    "id" SERIAL NOT NULL,
    "id_cotizacion" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "cotizacion_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seguimiento_leads" (
    "id" SERIAL NOT NULL,
    "id_lead" INTEGER NOT NULL,
    "id_usuario" INTEGER,
    "tipo_seguimiento" "FollowupType" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "resultado" TEXT,
    "proxima_accion" TEXT,
    "fecha_proxima_accion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seguimiento_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "casos_postventa" (
    "id" SERIAL NOT NULL,
    "numero_caso" TEXT NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_cotizacion" INTEGER,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado_caso" "CaseStatus" NOT NULL DEFAULT 'abierto',
    "prioridad" "CasePriority" NOT NULL DEFAULT 'medio',
    "id_responsable" INTEGER,
    "fecha_vencimiento" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cerrado_en" TIMESTAMP(3),

    CONSTRAINT "casos_postventa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formularios" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "campos" JSONB NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_by" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "formularios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "respuestas_formulario" (
    "id" SERIAL NOT NULL,
    "id_formulario" INTEGER NOT NULL,
    "respuestas" JSONB NOT NULL,
    "id_lead" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "respuestas_formulario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "enlace" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tareas_automatizadas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "workflow_id" TEXT NOT NULL,
    "tipo_trigger" TEXT NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "ultima_ejecucion" TIMESTAMP(3),
    "proxima_ejecucion" TIMESTAMP(3),
    "createdBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tareas_automatizadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantillas_email" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "asunto" TEXT NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "variables" JSONB,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_by" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plantillas_email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro_actividades" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER,
    "tabla_afectada" TEXT NOT NULL,
    "id_registro" INTEGER NOT NULL,
    "tipo_accion" "ActionType" NOT NULL,
    "valores_anteriores" JSONB,
    "valores_nuevos" JSONB,
    "ip_usuario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registro_actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contenidos_web" (
    "id" SERIAL NOT NULL,
    "pagina" TEXT NOT NULL,
    "seccion" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "updated_by" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contenidos_web_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_email_idx" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_id_rol_idx" ON "usuarios"("id_rol");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_leads_email_key" ON "clientes_leads"("email");

-- CreateIndex
CREATE INDEX "clientes_leads_email_idx" ON "clientes_leads"("email");

-- CreateIndex
CREATE INDEX "clientes_leads_estado_lead_idx" ON "clientes_leads"("estado_lead");

-- CreateIndex
CREATE INDEX "clientes_leads_id_asesor_idx" ON "clientes_leads"("id_asesor");

-- CreateIndex
CREATE INDEX "clientes_leads_createdAt_idx" ON "clientes_leads"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "cotizaciones_numero_cotizacion_key" ON "cotizaciones"("numero_cotizacion");

-- CreateIndex
CREATE INDEX "cotizaciones_id_lead_idx" ON "cotizaciones"("id_lead");

-- CreateIndex
CREATE INDEX "cotizaciones_estado_cotizacion_idx" ON "cotizaciones"("estado_cotizacion");

-- CreateIndex
CREATE INDEX "cotizaciones_numero_cotizacion_idx" ON "cotizaciones"("numero_cotizacion");

-- CreateIndex
CREATE INDEX "cotizacion_items_id_cotizacion_idx" ON "cotizacion_items"("id_cotizacion");

-- CreateIndex
CREATE INDEX "seguimiento_leads_id_lead_idx" ON "seguimiento_leads"("id_lead");

-- CreateIndex
CREATE INDEX "seguimiento_leads_id_usuario_idx" ON "seguimiento_leads"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "casos_postventa_numero_caso_key" ON "casos_postventa"("numero_caso");

-- CreateIndex
CREATE INDEX "casos_postventa_id_cliente_idx" ON "casos_postventa"("id_cliente");

-- CreateIndex
CREATE INDEX "casos_postventa_estado_caso_idx" ON "casos_postventa"("estado_caso");

-- CreateIndex
CREATE INDEX "casos_postventa_prioridad_idx" ON "casos_postventa"("prioridad");

-- CreateIndex
CREATE INDEX "casos_postventa_id_responsable_idx" ON "casos_postventa"("id_responsable");

-- CreateIndex
CREATE INDEX "respuestas_formulario_id_formulario_idx" ON "respuestas_formulario"("id_formulario");

-- CreateIndex
CREATE INDEX "respuestas_formulario_id_lead_idx" ON "respuestas_formulario"("id_lead");

-- CreateIndex
CREATE INDEX "notificaciones_id_usuario_idx" ON "notificaciones"("id_usuario");

-- CreateIndex
CREATE INDEX "notificaciones_leida_idx" ON "notificaciones"("leida");

-- CreateIndex
CREATE INDEX "registro_actividades_id_usuario_idx" ON "registro_actividades"("id_usuario");

-- CreateIndex
CREATE INDEX "registro_actividades_tabla_afectada_idx" ON "registro_actividades"("tabla_afectada");

-- CreateIndex
CREATE INDEX "contenidos_web_pagina_idx" ON "contenidos_web"("pagina");

-- CreateIndex
CREATE INDEX "contenidos_web_seccion_idx" ON "contenidos_web"("seccion");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes_leads" ADD CONSTRAINT "clientes_leads_id_asesor_fkey" FOREIGN KEY ("id_asesor") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_id_lead_fkey" FOREIGN KEY ("id_lead") REFERENCES "clientes_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizacion_items" ADD CONSTRAINT "cotizacion_items_id_cotizacion_fkey" FOREIGN KEY ("id_cotizacion") REFERENCES "cotizaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguimiento_leads" ADD CONSTRAINT "seguimiento_leads_id_lead_fkey" FOREIGN KEY ("id_lead") REFERENCES "clientes_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguimiento_leads" ADD CONSTRAINT "seguimiento_leads_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos_postventa" ADD CONSTRAINT "casos_postventa_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes_leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos_postventa" ADD CONSTRAINT "casos_postventa_id_cotizacion_fkey" FOREIGN KEY ("id_cotizacion") REFERENCES "cotizaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos_postventa" ADD CONSTRAINT "casos_postventa_id_responsable_fkey" FOREIGN KEY ("id_responsable") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formularios" ADD CONSTRAINT "formularios_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respuestas_formulario" ADD CONSTRAINT "respuestas_formulario_id_formulario_fkey" FOREIGN KEY ("id_formulario") REFERENCES "formularios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respuestas_formulario" ADD CONSTRAINT "respuestas_formulario_id_lead_fkey" FOREIGN KEY ("id_lead") REFERENCES "clientes_leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas_automatizadas" ADD CONSTRAINT "tareas_automatizadas_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantillas_email" ADD CONSTRAINT "plantillas_email_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_actividades" ADD CONSTRAINT "registro_actividades_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contenidos_web" ADD CONSTRAINT "contenidos_web_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
