CREATE TABLE "whatsapp_lead_conversations" (
  "id" SERIAL NOT NULL,
  "phone" TEXT NOT NULL,
  "profile_name" TEXT,
  "step" TEXT NOT NULL DEFAULT 'nombre',
  "data" JSONB NOT NULL DEFAULT '{}',
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "lead_id" INTEGER,
  "last_message_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "whatsapp_lead_conversations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "whatsapp_lead_conversations_phone_key" ON "whatsapp_lead_conversations"("phone");
CREATE INDEX "whatsapp_lead_conversations_phone_idx" ON "whatsapp_lead_conversations"("phone");
CREATE INDEX "whatsapp_lead_conversations_completed_idx" ON "whatsapp_lead_conversations"("completed");
