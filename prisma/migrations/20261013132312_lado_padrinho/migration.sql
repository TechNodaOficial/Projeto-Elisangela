-- CreateEnum
CREATE TYPE "LadoPadrinho" AS ENUM ('NOIVO', 'NOIVA');

-- AlterTable
ALTER TABLE "padrinhos" ADD COLUMN     "lado" "LadoPadrinho";
