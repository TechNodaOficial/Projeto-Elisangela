-- CreateEnum
CREATE TYPE "SecaoCronograma" AS ENUM ('FESTA', 'CERIMONIA');

-- AlterTable
ALTER TABLE "itens_cronograma" ADD COLUMN     "secao" "SecaoCronograma" NOT NULL DEFAULT 'FESTA';

-- CreateTable
CREATE TABLE "itens_menu" (
    "id" TEXT NOT NULL,
    "festaId" TEXT NOT NULL,
    "etapa" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "criadoEm" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itens_menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entradas_cerimonia" (
    "id" TEXT NOT NULL,
    "festaId" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "quem" TEXT NOT NULL,
    "musica" TEXT,
    "criadoEm" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entradas_cerimonia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "padrinhos" (
    "id" TEXT NOT NULL,
    "festaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "ordem" INTEGER NOT NULL,
    "criadoEm" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "padrinhos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_padrinho" (
    "id" TEXT NOT NULL,
    "padrinhoId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "feito" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL,
    "criadoEm" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itens_padrinho_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "itens_menu_festaId_idx" ON "itens_menu"("festaId");

-- CreateIndex
CREATE INDEX "entradas_cerimonia_festaId_idx" ON "entradas_cerimonia"("festaId");

-- CreateIndex
CREATE INDEX "padrinhos_festaId_idx" ON "padrinhos"("festaId");

-- CreateIndex
CREATE INDEX "itens_padrinho_padrinhoId_idx" ON "itens_padrinho"("padrinhoId");

-- AddForeignKey
ALTER TABLE "itens_menu" ADD CONSTRAINT "itens_menu_festaId_fkey" FOREIGN KEY ("festaId") REFERENCES "festas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entradas_cerimonia" ADD CONSTRAINT "entradas_cerimonia_festaId_fkey" FOREIGN KEY ("festaId") REFERENCES "festas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "padrinhos" ADD CONSTRAINT "padrinhos_festaId_fkey" FOREIGN KEY ("festaId") REFERENCES "festas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_padrinho" ADD CONSTRAINT "itens_padrinho_padrinhoId_fkey" FOREIGN KEY ("padrinhoId") REFERENCES "padrinhos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

