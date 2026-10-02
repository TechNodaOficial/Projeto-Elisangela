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
| PDF               | Convite (só dados da festa) e roteiro completo                             | —                                                                                                                                                                |

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
- [x] **4. Convidados:** rol de convidados na folha da festa (adicionar em sequência, editar, remover, busca), contagens, copiar link pessoal e enviar convite pelo WhatsApp com mensagem pronta. O link `/c/[token]` passa a funcionar na Etapa 5
- [x] **4b. Página da festa em 4 colunas:** (1) dados + convidados, (2) fornecedores (nome, serviço, WhatsApp, valor contratado, pago/pendente, totais), (3) mesas (nome, lugares, convidados distribuídos; o check-in mostrará a mesa), (4) cronograma (horário, atividade, responsável: fornecedor cadastrado ou texto). Celular: uma coluna; telas médias: 2×2
- [x] **4c. Planta do salão e PDFs:** imagem do salão visto de cima (Blob store **privado**, servida por `/painel/festas/[id]/planta` com login; o navegador reduz para até 3000px e 4 MB, JPG/PNG conferidos pelos bytes no servidor), abaixo das colunas; no fim da página, dois PDFs gerados no servidor com `@react-pdf/renderer` e as fontes Geist: convite A5 (dados da festa, sem as observações, que podem ser internas) e roteiro A4 (dados, fornecedores, mesas, cronograma, planta)
- [x] **5. Convite + QR:** `/c/[token]` no visual da prancheta, confirmar/recusar (pode mudar até o dia da festa; trava depois da entrada registrada), QR com o `codigoCheckin` impresso num canhoto na folha e imagem para baixar (`/c/[token]/qr`, PNG com festa e nome), rate limit só para links inválidos (20 por IP em 15 min, na tabela `tentativas_login`), `noindex` e `no-referrer`. Observações da festa não aparecem
- [x] **6. Check-in:** `/painel/checkin` escolhe a festa (vai direto se só houver uma hoje; festas desde 20h atrás, para a madrugada), câmera traseira lendo QR com `barcode-detector` (ZXing em WebAssembly servido pelo próprio site, `scripts/copiar-zxing.mjs`), veredito em tela cheia colorida (verde "Pode entrar", vermelho já entrou / outra festa / QR desconhecido, âmbar "Não confirmou" com "Deixar entrar"), som e vibração, "Desfazer", registro atômico (dois celulares na porta não registram duas vezes), busca manual pelo nome, regras em `src/lib/checkin/avaliar.ts` com testes Vitest. **Falta:** teste num celular real (iPhone e Android) antes da primeira festa
- [ ] **7. PDF:** incorporada à etapa 4c
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
