-- Convite por família/grupo: quantas pessoas, quantas confirmaram e quantas já entraram.
-- Convidados que já existem viram grupos de 1 pessoa.
ALTER TABLE "convidados" ADD COLUMN "pessoas" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "confirmadas" INTEGER,
ADD COLUMN "entraram" INTEGER NOT NULL DEFAULT 0;

UPDATE "convidados" SET "confirmadas" = 1 WHERE "rsvp" = 'CONFIRMADO';
UPDATE "convidados" SET "entraram" = 1 WHERE "presenteEm" IS NOT NULL;
