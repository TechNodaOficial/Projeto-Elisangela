-- CreateEnum
CREATE TYPE "PapelCortejo" AS ENUM ('PADRINHO', 'PAJEM_DAMINHA');

-- AlterTable
ALTER TABLE "padrinhos" ADD COLUMN     "papel" "PapelCortejo" NOT NULL DEFAULT 'PADRINHO';
