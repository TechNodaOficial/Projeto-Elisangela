-- AlterTable
ALTER TABLE "festas" ADD COLUMN     "convidadosApagadosEm" TIMESTAMPTZ(3),
ADD COLUMN     "resumoConfirmados" INTEGER,
ADD COLUMN     "resumoConvidados" INTEGER,
ADD COLUMN     "resumoPresentes" INTEGER;
