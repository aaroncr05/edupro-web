ALTER TABLE "clientes_leads"
ADD COLUMN "habilitado_marketing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "segmento_marketing" TEXT,
ADD COLUMN "fecha_ingreso_marketing" TIMESTAMP(3),
ADD COLUMN "ultimo_envio_marketing" TIMESTAMP(3);

UPDATE "clientes_leads"
SET "habilitado_marketing" = true,
    "segmento_marketing" = 'cliente_acepto',
    "fecha_ingreso_marketing" = COALESCE("convertido_cliente_en", "updatedAt", "createdAt")
WHERE "estado_lead" = 'convertido';

UPDATE "clientes_leads"
SET "habilitado_marketing" = true,
    "segmento_marketing" = 'lead_rechazo',
    "fecha_ingreso_marketing" = COALESCE("updatedAt", "createdAt")
WHERE "estado_lead" = 'rechazado';

CREATE INDEX "clientes_leads_habilitado_marketing_idx" ON "clientes_leads"("habilitado_marketing");
CREATE INDEX "clientes_leads_segmento_marketing_idx" ON "clientes_leads"("segmento_marketing");
