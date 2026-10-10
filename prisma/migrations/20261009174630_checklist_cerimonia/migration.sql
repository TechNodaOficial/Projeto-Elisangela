-- CreateTable
CREATE TABLE "itens_cerimonia" (
    "id" TEXT NOT NULL,
    "festaId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "feito" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL,
    "criadoEm" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itens_cerimonia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "itens_cerimonia_festaId_idx" ON "itens_cerimonia"("festaId");

-- AddForeignKey
ALTER TABLE "itens_cerimonia" ADD CONSTRAINT "itens_cerimonia_festaId_fkey" FOREIGN KEY ("festaId") REFERENCES "festas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
