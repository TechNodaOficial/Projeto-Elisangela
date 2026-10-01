# Painel de Festas

Painel para gestão de festas de casamento: convidados, confirmação de presença por link e
check-in por QR Code. O plano completo está em [`docs/PLANO.md`](docs/PLANO.md).

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui · Prisma 7 · PostgreSQL · Vitest

## Rodando localmente

Requisitos: Node.js 24+.

```bash
npm install

# Sobe um Postgres local (deixe rodando em segundo plano)
npx prisma dev -n painel-festas --detach

# Copie o exemplo, coloque a URL TCP exibida acima e defina SEED_SENHA
cp .env.example .env

npm run db:migrate   # aplica as migrations no banco local
npm run db:seed      # cria o usuário local do painel
npm run dev
```

Confira em http://localhost:3000/api/health — deve responder `{"status":"ok","database":"ok"}`.

## Banco local × produção

| Arquivo         | Usado por                      | Banco         |
| --------------- | ------------------------------ | ------------- |
| `.env`          | `npm run dev` e scripts `db:*` | Local         |
| `.env.producao` | Somente scripts `db:*:prod`    | Neon (Vercel) |

A configuração de produção (`prisma.producao.config.ts`) lê **apenas** o `.env.producao`. Assim,
nenhum comando do dia a dia atinge a produção por engano. Formato dos dois arquivos em
[`.env.example`](.env.example). Os dois são ignorados pelo git.

Para publicar uma mudança de schema em produção:

```bash
npm run db:status:prod   # mostra quais migrations faltam aplicar
npm run db:deploy:prod   # aplica as migrations pendentes no Neon
npm run db:seed:prod     # cria/atualiza o usuário real da Elisangela (também redefine a senha)
```

## Scripts

| Script                   | O que faz                                      |
| ------------------------ | ---------------------------------------------- |
| `npm run dev`            | Servidor de desenvolvimento                    |
| `npm run build`          | Gera o Prisma Client e faz o build de produção |
| `npm test`               | Testes (Vitest)                                |
| `npm run lint`           | ESLint                                         |
| `npm run typecheck`      | Checagem de tipos                              |
| `npm run format`         | Formata o código com Prettier                  |
| `npm run db:migrate`     | Cria/aplica migrations no banco local          |
| `npm run db:seed`        | Cria/atualiza o usuário no banco local         |
| `npm run db:studio`      | Abre o Prisma Studio (banco local)             |
| `npm run db:status:prod` | Status das migrations em produção              |
| `npm run db:deploy:prod` | Aplica migrations pendentes em produção        |
| `npm run db:seed:prod`   | Cria/atualiza o usuário em produção            |
