# Painel de Festas

Painel para gestão de festas de casamento: convidados, confirmação de presença por link e
check-in por QR Code. O plano completo está em [`docs/PLANO.md`](docs/PLANO.md).

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui · Prisma 7 · PostgreSQL

## Rodando localmente

Requisitos: Node.js 20+.

```bash
npm install

# Sobe um Postgres local (deixe rodando em segundo plano)
npx prisma dev -n painel-festas --detach

# Copie o exemplo e coloque a URL TCP (postgres://...) exibida pelo comando acima
cp .env.example .env

npm run dev
```

Confira em http://localhost:3000/api/health — deve responder `{"status":"ok","database":"ok"}`.

## Scripts

| Script               | O que faz                                      |
| -------------------- | ---------------------------------------------- |
| `npm run dev`        | Servidor de desenvolvimento                    |
| `npm run build`      | Gera o Prisma Client e faz o build de produção |
| `npm run lint`       | ESLint                                         |
| `npm run typecheck`  | Checagem de tipos                              |
| `npm run format`     | Formata o código com Prettier                  |
| `npm run db:migrate` | Cria/aplica migrations (`prisma migrate dev`)  |
| `npm run db:studio`  | Abre o Prisma Studio                           |

## Variáveis de ambiente

Veja [`.env.example`](.env.example). Em produção (Neon + Vercel), `DATABASE_URL` deve ser a URL com
pooler e `DATABASE_URL_UNPOOLED` a conexão direta usada pelas migrations.
