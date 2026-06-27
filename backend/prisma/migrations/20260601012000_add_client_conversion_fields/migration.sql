ALTER TABLE "clientes_leads"
ADD COLUMN "es_cliente" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "convertido_cliente_en" TIMESTAMP(3);

UPDATE "clientes_leads"
SET "es_cliente" = true,
    "convertido_cliente_en" = COALESCE("fecha_contacto", "updatedAt", "createdAt")
WHERE "estado_lead" = 'convertido'
  AND "es_cliente" = false;

CREATE INDEX "clientes_leads_es_cliente_idx" ON "clientes_leads"("es_cliente");
