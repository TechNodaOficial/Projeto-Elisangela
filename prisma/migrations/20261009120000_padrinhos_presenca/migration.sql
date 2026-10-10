-- Padrinhos: o checklist por padrinho vira uma lista de presença no dia da festa.
ALTER TABLE "padrinhos" ADD COLUMN "presenteEm" TIMESTAMPTZ(3);

-- Itens antigos ("Confirmou presença", "Chegou no dia"...) saem junto com a tabela.
DROP TABLE "itens_padrinho";
