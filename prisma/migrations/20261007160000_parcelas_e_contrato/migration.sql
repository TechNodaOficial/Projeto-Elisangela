-- Parcelamento: "pago" vira contagem de parcelas pagas (à vista = 1 parcela).
ALTER TABLE "contratacoes" ADD COLUMN "parcelas" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "parcelasPagas" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "contratoUrl" TEXT,
ADD COLUMN "contratoNome" TEXT;

UPDATE "contratacoes" SET "parcelasPagas" = 1 WHERE "pago";

ALTER TABLE "contratacoes" DROP COLUMN "pago";
