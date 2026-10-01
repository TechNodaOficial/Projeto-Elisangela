# Plano do projeto — Painel de Festas

Painel para a Elisangela (organizadora de casamentos) gerenciar festas e convidados, com
confirmação de presença por link e check-in por QR Code no dia da festa.

## Decisões

| Tema              | Decisão                                                      | Motivo                                                                                                                                 |
| ----------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Arquitetura       | Next.js full-stack, sem backend separado                     | Escopo cabe num app só; um deploy, tipos compartilhados                                                                                |
| Banco             | Postgres no Neon, acesso via Prisma 7 + `@prisma/adapter-pg` | Só Postgres, sem API automática para proteger; não pausa no plano grátis. O adapter `pg` mantém a portabilidade (Supabase, local etc.) |
| Autenticação      | Auth.js com e-mail e senha, sem cadastro                     | Só a Elisangela acessa; usuário criado via seed                                                                                        |
| Hospedagem        | Vercel (plano Pro em produção)                               | Carga baixa, HTTPS e proteção DDoS inclusos. O Hobby proíbe uso comercial                                                              |
| Região            | Função e banco na mesma região, de preferência São Paulo     | Latência e LGPD                                                                                                                        |
| Link do convite   | Um link por convidado                                        | Só convidados confirmam; QR ligado à pessoa                                                                                            |
| Status da festa   | Calculado pela data                                          | Ela não precisa marcar como concluída                                                                                                  |
| Internet no local | Assume-se que haverá internet                                | Modo offline fica fora do MVP                                                                                                          |
| PDF               | Só dados da festa (convite)                                  | —                                                                                                                                      |

## Entidades

```
Usuario
  id, email, senhaHash, nome

Festa
  id, titulo, data, horario, localNome, endereco, traje, observacoes, criadoEm
  status → calculado pela data (passou = concluída)

Convidado
  id, festaId, nome, telefone
  tokenConvite    → aleatório, vai no link /c/[token]
  codigoCheckin   → aleatório, vai dentro do QR Code
  rsvp            → PENDENTE | CONFIRMADO | RECUSADO
  confirmadoEm, presenteEm (vazio = ainda não chegou)
  titularId?      → reservado para acompanhantes (não usado no MVP)
```

Os tokens são separados para que uma foto do QR de alguém não permita alterar a confirmação dessa pessoa.

## Telas

**Painel (com login)**

1. Login
2. Festas: abas Pendentes e Concluídas, cards com data e confirmados, botão "Nova festa"
3. Criar/editar festa
4. Detalhe da festa: dados, botão Gerar PDF, contadores, lista de convidados (adicionar, editar, remover), copiar link e enviar no WhatsApp
5. Check-in: câmera lê o QR, resultado em tela cheia (verde/vermelho), alertas (já entrou, outra festa, não confirmou), busca manual por nome

**Público (sem login)**

6. Convite `/c/[token]`: dados da festa, botões Confirmar e Não poderei ir
7. QR Code: exibido depois da confirmação, com download; reabrir o link mostra o QR de novo

## Etapas

- [x] **0. Setup:** Next.js + TypeScript + Tailwind + shadcn/ui, ESLint + Prettier, Prisma, health check em `/api/health`. _Falta:_ GitHub, Vercel e Neon (contas da dona do projeto)
- [ ] **1. Banco:** schema Prisma, primeira migration, seed com o usuário da Elisangela, geração de tokens
- [ ] **2. Autenticação:** Auth.js (bcrypt), proteção de `/painel`, rate limit no login
- [ ] **3. Festas:** layout do painel, lista com abas, criar/editar/excluir com Zod
- [ ] **4. Convidados:** detalhe da festa, contadores, CRUD de convidados, copiar link e WhatsApp
- [ ] **5. Convite + QR:** `/c/[token]`, confirmar/recusar (pode mudar até a data da festa), QR com download, rate limit
- [ ] **6. Check-in:** leitor pela câmera, validações, busca manual, testes Vitest, teste num celular real
- [ ] **7. PDF:** modelo com `@react-pdf/renderer`, botão de download
- [ ] **8. Produção:** domínio, Vercel Pro, backups, revisão de segurança, aviso LGPD, ensaio completo

## Segurança (vale para todas as etapas)

- Tokens com `crypto.randomBytes` de pelo menos 128 bits
- Rotas do painel e do check-in sempre exigem login
- Rate limit no login e no link do convite
- Validação com Zod em toda entrada
- `DATABASE_URL` só no servidor (nunca `NEXT_PUBLIC_`); `src/lib/prisma.ts` importa `server-only`
- LGPD: guardar só o necessário, backups, apagar dados de festas antigas depois de um tempo

## Fora do MVP

Acompanhantes, importação de convidados por planilha, prazo limite de confirmação, modo offline.
