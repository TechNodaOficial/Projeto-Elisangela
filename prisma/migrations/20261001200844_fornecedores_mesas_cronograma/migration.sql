-- AlterTable
ALTER TABLE "convidados" ADD COLUMN     "mesaId" TEXT;

-- CreateTable
CREATE TABLE "fornecedores" (
    "id" TEXT NOT NULL,
    "festaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "servico" TEXT NOT NULL,
    "telefone" TEXT,
    "valorCentavos" INTEGER,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "fornecedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mesas" (
    "id" TEXT NOT NULL,
    "festaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "lugares" INTEGER NOT NULL,
    "criadoEm" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "mesas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_cronograma" (
    "id" TEXT NOT NULL,
    "festaId" TEXT NOT NULL,
    "hora" TEXT NOT NULL,
    "atividade" TEXT NOT NULL,
    "fornecedorId" TEXT,
    "responsavelTexto" TEXT,
    "criadoEm" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "itens_cronograma_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fornecedores_festaId_idx" ON "fornecedores"("festaId");

-- CreateIndex
CREATE INDEX "mesas_festaId_idx" ON "mesas"("festaId");

-- CreateIndex
CREATE INDEX "itens_cronograma_festaId_idx" ON "itens_cronograma"("festaId");

-- CreateIndex
CREATE INDEX "convidados_mesaId_idx" ON "convidados"("mesaId");

-- AddForeignKey
ALTER TABLE "convidados" ADD CONSTRAINT "convidados_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES "mesas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fornecedores" ADD CONSTRAINT "fornecedores_festaId_fkey" FOREIGN KEY ("festaId") REFERENCES "festas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesas" ADD CONSTRAINT "mesas_festaId_fkey" FOREIGN KEY ("festaId") REFERENCES "festas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_cronograma" ADD CONSTRAINT "itens_cronograma_festaId_fkey" FOREIGN KEY ("festaId") REFERENCES "festas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_cronograma" ADD CONSTRAINT "itens_cronograma_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
