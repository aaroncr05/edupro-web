-- CreateTable
CREATE TABLE "cursos_academicos" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "imagen" TEXT NOT NULL,
    "objetivos" TEXT[],
    "dirigido_a" TEXT NOT NULL,
    "contenido" TEXT[],
    "precio" DECIMAL(10,2) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "link_inscripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cursos_academicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicios_digitales" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "icono" TEXT NOT NULL DEFAULT 'Layout',
    "imagen" TEXT NOT NULL,
    "caracteristicas" TEXT[],
    "precio_base" DECIMAL(10,2) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servicios_digitales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_global" (
    "id" SERIAL NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descripcion" TEXT,
    "grupo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'text',

    CONSTRAINT "configuracion_global_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cursos_academicos_slug_key" ON "cursos_academicos"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "servicios_digitales_slug_key" ON "servicios_digitales"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_global_clave_key" ON "configuracion_global"("clave");
