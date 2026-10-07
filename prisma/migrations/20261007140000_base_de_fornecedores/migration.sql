-- DropForeignKey
ALTER TABLE "fornecedores" DROP CONSTRAINT "fornecedores_festaId_fkey";

-- DropForeignKey
ALTER TABLE "itens_cronograma" DROP CONSTRAINT "itens_cronograma_fornecedorId_fkey";

-- Os fornecedores antigos eram texto livre dentro de cada festa; não há dados a manter.
DELETE FROM "fornecedores";

-- DropIndex
DROP INDEX "fornecedores_festaId_idx";

-- AlterTable
ALTER TABLE "fornecedores" DROP COLUMN "festaId",
DROP COLUMN "pago",
DROP COLUMN "servico",
DROP COLUMN "valorCentavos",
ADD COLUMN     "servicoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "itens_cronograma" DROP COLUMN "fornecedorId",
ADD COLUMN     "contratacaoId" TEXT;

-- CreateTable
CREATE TABLE "servicos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "criadoEm" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "servicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_modelo" (
    "id" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "criadoEm" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itens_modelo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contratacoes" (
    "id" TEXT NOT NULL,
    "festaId" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,
    "fornecedorId" TEXT,
    "valorCentavos" INTEGER,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "contratacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_checklist" (
    "id" TEXT NOT NULL,
    "contratacaoId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "feito" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL,
    "criadoEm" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itens_checklist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "servicos_nome_key" ON "servicos"("nome");

-- CreateIndex
CREATE INDEX "itens_modelo_servicoId_idx" ON "itens_modelo"("servicoId");

-- CreateIndex
CREATE INDEX "contratacoes_festaId_idx" ON "contratacoes"("festaId");

-- CreateIndex
CREATE INDEX "contratacoes_fornecedorId_idx" ON "contratacoes"("fornecedorId");

-- CreateIndex
CREATE INDEX "itens_checklist_contratacaoId_idx" ON "itens_checklist"("contratacaoId");

-- CreateIndex
CREATE INDEX "fornecedores_servicoId_idx" ON "fornecedores"("servicoId");

-- AddForeignKey
ALTER TABLE "itens_modelo" ADD CONSTRAINT "itens_modelo_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fornecedores" ADD CONSTRAINT "fornecedores_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratacoes" ADD CONSTRAINT "contratacoes_festaId_fkey" FOREIGN KEY ("festaId") REFERENCES "festas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratacoes" ADD CONSTRAINT "contratacoes_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratacoes" ADD CONSTRAINT "contratacoes_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_checklist" ADD CONSTRAINT "itens_checklist_contratacaoId_fkey" FOREIGN KEY ("contratacaoId") REFERENCES "contratacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_cronograma" ADD CONSTRAINT "itens_cronograma_contratacaoId_fkey" FOREIGN KEY ("contratacaoId") REFERENCES "contratacoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Serviços mais comuns, com checklist inicial. A Elisangela pode editar tudo no painel.
INSERT INTO "servicos" ("id", "nome", "atualizadoEm") VALUES (gen_random_uuid()::text, 'Buffet', CURRENT_TIMESTAMP);
INSERT INTO "itens_modelo" ("id", "servicoId", "texto", "ordem")
SELECT gen_random_uuid()::text, s."id", i.texto, i.ordem
FROM "servicos" s, (VALUES
  ('Cardápio definido', 0),
  ('Número de convidados confirmado', 1),
  ('Tipo de prato e louça', 2),
  ('Talheres', 3),
  ('Copos e taças', 4),
  ('Bebidas', 5),
  ('Número de garçons', 6),
  ('Horário de montagem', 7)
) AS i(texto, ordem)
WHERE s."nome" = 'Buffet';
INSERT INTO "servicos" ("id", "nome", "atualizadoEm") VALUES (gen_random_uuid()::text, 'Decoração', CURRENT_TIMESTAMP);
INSERT INTO "itens_modelo" ("id", "servicoId", "texto", "ordem")
SELECT gen_random_uuid()::text, s."id", i.texto, i.ordem
FROM "servicos" s, (VALUES
  ('Tema e paleta de cores', 0),
  ('Arranjos de mesa', 1),
  ('Toalhas e sousplat', 2),
  ('Horário de montagem e desmontagem', 3)
) AS i(texto, ordem)
WHERE s."nome" = 'Decoração';
INSERT INTO "servicos" ("id", "nome", "atualizadoEm") VALUES (gen_random_uuid()::text, 'Bolo e doces', CURRENT_TIMESTAMP);
INSERT INTO "itens_modelo" ("id", "servicoId", "texto", "ordem")
SELECT gen_random_uuid()::text, s."id", i.texto, i.ordem
FROM "servicos" s, (VALUES
  ('Sabor e recheio do bolo', 0),
  ('Tamanho do bolo', 1),
  ('Quantidade de doces', 2),
  ('Forminhas', 3),
  ('Horário de entrega', 4)
) AS i(texto, ordem)
WHERE s."nome" = 'Bolo e doces';
INSERT INTO "servicos" ("id", "nome", "atualizadoEm") VALUES (gen_random_uuid()::text, 'DJ e som', CURRENT_TIMESTAMP);
INSERT INTO "itens_modelo" ("id", "servicoId", "texto", "ordem")
SELECT gen_random_uuid()::text, s."id", i.texto, i.ordem
FROM "servicos" s, (VALUES
  ('Músicas especiais', 0),
  ('Equipamento de som e luz', 1),
  ('Horário de montagem', 2),
  ('Tempo de serviço', 3)
) AS i(texto, ordem)
WHERE s."nome" = 'DJ e som';
INSERT INTO "servicos" ("id", "nome", "atualizadoEm") VALUES (gen_random_uuid()::text, 'Fotografia e vídeo', CURRENT_TIMESTAMP);
INSERT INTO "itens_modelo" ("id", "servicoId", "texto", "ordem")
SELECT gen_random_uuid()::text, s."id", i.texto, i.ordem
FROM "servicos" s, (VALUES
  ('Pacote contratado', 0),
  ('Momentos que não podem faltar', 1),
  ('Prazo de entrega do material', 2)
) AS i(texto, ordem)
WHERE s."nome" = 'Fotografia e vídeo';
INSERT INTO "servicos" ("id", "nome", "atualizadoEm") VALUES (gen_random_uuid()::text, 'Local', CURRENT_TIMESTAMP);
INSERT INTO "itens_modelo" ("id", "servicoId", "texto", "ordem")
SELECT gen_random_uuid()::text, s."id", i.texto, i.ordem
FROM "servicos" s, (VALUES
  ('Contrato assinado', 0),
  ('Horário de acesso para montagem', 1),
  ('Mesas e cadeiras', 2)
) AS i(texto, ordem)
WHERE s."nome" = 'Local';
