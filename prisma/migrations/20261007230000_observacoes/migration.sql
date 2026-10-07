-- CreateTable
CREATE TABLE "observacoes" (
    "id" TEXT NOT NULL,
    "festaId" TEXT NOT NULL,
    "secao" TEXT NOT NULL,
    "conteudo" JSONB NOT NULL,
    "atualizadoEm" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "observacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "observacoes_festaId_secao_key" ON "observacoes"("festaId", "secao");

-- AddForeignKey
ALTER TABLE "observacoes" ADD CONSTRAINT "observacoes_festaId_fkey" FOREIGN KEY ("festaId") REFERENCES "festas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

