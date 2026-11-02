-- CreateTable
CREATE TABLE "anexos" (
    "id" TEXT NOT NULL,
    "festaId" TEXT NOT NULL,
    "secao" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "criadoEm" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anexos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "anexos_festaId_secao_idx" ON "anexos"("festaId", "secao");

-- AddForeignKey
ALTER TABLE "anexos" ADD CONSTRAINT "anexos_festaId_fkey" FOREIGN KEY ("festaId") REFERENCES "festas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
