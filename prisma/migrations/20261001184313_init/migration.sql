-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "StatusRsvp" AS ENUM ('PENDENTE', 'CONFIRMADO', 'RECUSADO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "criadoEm" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "festas" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "dataHora" TIMESTAMPTZ(3) NOT NULL,
    "localNome" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "traje" TEXT,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "festas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "convidados" (
    "id" TEXT NOT NULL,
    "festaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "tokenConvite" TEXT NOT NULL,
    "codigoCheckin" TEXT NOT NULL,
    "rsvp" "StatusRsvp" NOT NULL DEFAULT 'PENDENTE',
    "respondidoEm" TIMESTAMPTZ(3),
    "presenteEm" TIMESTAMPTZ(3),
    "titularId" TEXT,
    "criadoEm" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "convidados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "festas_dataHora_idx" ON "festas"("dataHora");

-- CreateIndex
CREATE UNIQUE INDEX "convidados_tokenConvite_key" ON "convidados"("tokenConvite");

-- CreateIndex
CREATE UNIQUE INDEX "convidados_codigoCheckin_key" ON "convidados"("codigoCheckin");

-- CreateIndex
CREATE INDEX "convidados_festaId_idx" ON "convidados"("festaId");

-- CreateIndex
CREATE INDEX "convidados_titularId_idx" ON "convidados"("titularId");

-- AddForeignKey
ALTER TABLE "convidados" ADD CONSTRAINT "convidados_festaId_fkey" FOREIGN KEY ("festaId") REFERENCES "festas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convidados" ADD CONSTRAINT "convidados_titularId_fkey" FOREIGN KEY ("titularId") REFERENCES "convidados"("id") ON DELETE CASCADE ON UPDATE CASCADE;
