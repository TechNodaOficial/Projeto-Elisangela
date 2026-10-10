-- CreateEnum
CREATE TYPE "FaixaIdade" AS ENUM ('ADULTO', 'C4A11', 'C0A3');

-- AlterTable
ALTER TABLE "festas" ADD COLUMN     "mesasDemarcadas" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "membros_convite" (
    "id" TEXT NOT NULL,
    "convidadoId" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "faixa" "FaixaIdade" NOT NULL,
    "criadoEm" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membros_convite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "membros_convite_convidadoId_idx" ON "membros_convite"("convidadoId");

-- AddForeignKey
ALTER TABLE "membros_convite" ADD CONSTRAINT "membros_convite_convidadoId_fkey" FOREIGN KEY ("convidadoId") REFERENCES "convidados"("id") ON DELETE CASCADE ON UPDATE CASCADE;
