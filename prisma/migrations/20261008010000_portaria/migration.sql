-- AlterTable
ALTER TABLE "festas" ADD COLUMN     "portariaPin" TEXT,
ADD COLUMN     "portariaToken" TEXT;

-- CreateTable
CREATE TABLE "sessoes_portaria" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "festaId" TEXT NOT NULL,
    "expiraEm" TIMESTAMPTZ(3) NOT NULL,
    "criadoEm" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessoes_portaria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sessoes_portaria_tokenHash_key" ON "sessoes_portaria"("tokenHash");

-- CreateIndex
CREATE INDEX "sessoes_portaria_festaId_idx" ON "sessoes_portaria"("festaId");

-- CreateIndex
CREATE UNIQUE INDEX "festas_portariaToken_key" ON "festas"("portariaToken");

-- AddForeignKey
ALTER TABLE "sessoes_portaria" ADD CONSTRAINT "sessoes_portaria_festaId_fkey" FOREIGN KEY ("festaId") REFERENCES "festas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

