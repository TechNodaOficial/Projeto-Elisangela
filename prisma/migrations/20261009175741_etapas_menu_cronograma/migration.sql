-- AlterTable
ALTER TABLE "itens_cronograma" ADD COLUMN     "etapasMenu" TEXT[] DEFAULT ARRAY[]::TEXT[];
