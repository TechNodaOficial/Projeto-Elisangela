# Plano do projeto — Painel de Festas

Painel para a Elisangela (organizadora de casamentos) gerenciar festas e convidados, com
confirmação de presença por link e check-in por QR Code no dia da festa.

## Decisões

| Tema              | Decisão                                                                    | Motivo                                                                                                                                                           |
| ----------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Arquitetura       | Next.js full-stack, sem backend separado                                   | Escopo cabe num app só; um deploy, tipos compartilhados                                                                                                          |
| Banco             | Postgres no Neon, acesso via Prisma 7 + `@prisma/adapter-pg`               | Só Postgres, sem API automática para proteger; não pausa no plano grátis. O adapter `pg` mantém a portabilidade (Supabase, local etc.)                           |
| Autenticação      | Sessões no banco (padrão do guia do Next 16), e-mail e senha, sem cadastro | Só a Elisangela acessa. Auth.js v5 segue em beta e desaconselha login por senha. Sessão revogável: o cookie leva um token de 256 bits e o banco guarda só o hash |
| Hospedagem        | Vercel (plano Pro em produção)                                             | Carga baixa, HTTPS e proteção DDoS inclusos. O Hobby proíbe uso comercial                                                                                        |
| Região            | Função e banco na mesma região, de preferência São Paulo                   | Latência e LGPD                                                                                                                                                  |
| Link do convite   | Um link por convidado                                                      | Só convidados confirmam; QR ligado à pessoa                                                                                                                      |
| Status da festa   | Calculado pela data                                                        | Ela não precisa marcar como concluída                                                                                                                            |
| Internet no local | Assume-se que haverá internet                                              | Modo offline fica fora do MVP                                                                                                                                    |
| PDF               | Só dados da festa (convite)                                                | —                                                                                                                                                                |

## Entidades

```
Usuario
  id, email, senhaHash, nome

Festa
  id, titulo, dataHora, localNome, endereco, traje?, observacoes?, criadoEm, atualizadoEm
  status → calculado pela data (passou = concluída)

Convidado
  id, festaId, nome, telefone?
  tokenConvite    → aleatório, vai no link /c/[token]
  codigoCheckin   → aleatório, vai dentro do QR Code
  rsvp            → PENDENTE | CONFIRMADO | RECUSADO
  respondidoEm    → quando confirmou ou recusou
  presenteEm      → vazio = ainda não chegou
  titularId?      → reservado para acompanhantes (não usado no MVP)
```

Todas as datas são `timestamptz` (instante absoluto); a exibição converte para o fuso de São Paulo.
`dataHora` junta data e horário num campo só.

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

- [x] **0. Setup:** Next.js + TypeScript + Tailwind + shadcn/ui, ESLint + Prettier, Prisma, health check em `/api/health`, GitHub, Vercel + Neon
- [x] **1. Banco:** schema Prisma, primeira migration, seed com o usuário da Elisangela, geração de tokens
- [x] **2. Autenticação:** sessões no banco (bcrypt + cookie HttpOnly), `proxy.ts` + DAL protegendo `/painel`, rate limit no Postgres (5 falhas por e-mail / 20 por IP em 15 min)
- [x] **3. Festas:** layout do painel (visual "Prancheta da Cerimonialista", ver `PRODUCT.md` e `.impeccable/surfaces/`), listas de pendentes e concluídas, detalhe, criar/editar/excluir com Zod; datas sempre no fuso de São Paulo
- [ ] **4. Convidados:** detalhe da festa, contadores, CRUD de convidados, copiar link e WhatsApp
- [ ] **5. Convite + QR:** `/c/[token]`, confirmar/recusar (pode mudar até a data da festa), QR com download, rate limit
- [ ] **6. Check-in:** leitor pela câmera, validações, busca manual, testes Vitest, teste num celular real
- [ ] **7. PDF:** modelo com `@react-pdf/renderer`, botão de download
- [ ] **8. Produção:** domínio, Vercel Pro, backups, revisão de segurança, aviso LGPD, ensaio completo

## Segurança (vale para todas as etapas)

- Tokens com `crypto.randomBytes` de pelo menos 128 bits
- Rotas do painel e do check-in sempre exigem login
- Rate limit no login e no link do convite (tabela `tentativas_login`, sem serviço externo)
- Toda página, server action e route handler do painel chama `exigirUsuario()` (`src/lib/dal.ts`); o proxy é só a primeira barreira
- Validação com Zod em toda entrada
- `DATABASE_URL` só no servidor (nunca `NEXT_PUBLIC_`); `src/lib/prisma.ts` importa `server-only`
- LGPD: guardar só o necessário, backups, apagar dados de festas antigas depois de um tempo

## Fora do MVP

Acompanhantes, importação de convidados por planilha, prazo limite de confirmação, modo offline.
