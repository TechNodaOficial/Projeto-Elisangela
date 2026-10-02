# Colocar em produção (Etapa 8)

Passos feitos fora do código, nos painéis. Marque conforme for fazendo.

## 1. Vercel

- [ ] **Plano Pro.** _Settings → Billing → Upgrade_. O Hobby é só para uso pessoal e não
      comercial; um sistema que a Elisangela usa para trabalhar é uso comercial.
- [ ] **Região das funções em São Paulo.** _Settings → Functions → Function Region_:
      `São Paulo, Brazil (gru1)`. O banco Neon está em São Paulo (`sa-east-1`); função e
      banco juntos deixam cada página mais rápida.
- [ ] **Variáveis de ambiente** (_Settings → Environment Variables_, ambiente _Production_):
  - `CRON_SECRET`: uma sequência aleatória longa (comando no `.env.example`).
  - `PRIVACIDADE_RESPONSAVEL` e `PRIVACIDADE_CONTATO`: nome e contato que aparecem em
    `/privacidade`. Sem eles, a página diz "fale com quem enviou o convite".
  - Conferir que `DATABASE_URL`, `DATABASE_URL_UNPOOLED` e `BLOB_READ_WRITE_TOKEN` existem.
- [ ] **Cron.** Depois do deploy, _Settings → Cron Jobs_ deve mostrar `/api/cron/limpeza`
      todo dia às 06:00 UTC (03:00 em São Paulo). O botão _Run_ roda na hora; o log deve
      mostrar "Limpeza diária".

## 2. Domínio

- [ ] Comprar o domínio. Um `.com.br` se registra no [Registro.br](https://registro.br)
      (cerca de R$ 40 por ano). No Pro pago a Vercel oferece um domínio grátis no primeiro
      ano, mas confira se a extensão desejada entra na oferta.
- [ ] _Vercel → Settings → Domains → Add_ e seguir as instruções de DNS. O HTTPS é automático.
- [ ] Depois que o domínio funcionar, abrir o painel por ele e reenviar os links de convite
      que já tiverem sido mandados pelo endereço `.vercel.app` (os dois continuam abrindo,
      mas o oficial passa a ser o domínio).

## 3. Banco (Neon) e backups

- [ ] Rodar a migration desta etapa: `npm run db:deploy:prod` (só adiciona colunas).
- [ ] **Backup diário:** seguir [docs/BACKUP.md](BACKUP.md) (dois segredos no GitHub e uma
      execução manual para conferir).
- [ ] Guardar a senha dos backups num gerenciador de senhas.

## 4. Ensaio completo (antes da primeira festa)

Com uma festa de teste marcada para hoje, num celular de verdade:

1. **Painel:** entrar, criar a festa, adicionar 3 convidados (um com seu próprio WhatsApp),
   um fornecedor, uma mesa, um horário no cronograma e a planta.
2. **Convite:** mandar o convite pelo WhatsApp para você mesmo; abrir no celular; confirmar;
   conferir o QR e o botão "Salvar imagem"; abrir "Como seus dados são usados".
3. **Recusa:** com outro convidado, recusar e depois "Vou à festa".
4. **PDFs:** abrir convite e roteiro; conferir a planta na última página do roteiro.
5. **Porta:** em outro celular, _Leitor QR Code_ → abrir câmera:
   - QR do convidado confirmado → verde, com som (e vibração no Android);
   - o mesmo QR de novo → vermelho "Já entrou";
   - QR de quem não respondeu → âmbar → "Deixar entrar";
   - buscar um nome e registrar pela busca;
   - testar no iPhone e no Android, com pouca luz.
6. **Depois:** excluir a festa de teste (apaga também a planta).

## 5. Segurança (revisado nesta etapa)

- Todas as ações e rotas do painel exigem login no servidor; o convite usa o token do link,
  com limite de tentativas para links inválidos.
- Cabeçalhos: CSP com nonce (`src/proxy.ts`), HSTS, `X-Frame-Options: DENY`,
  `Referrer-Policy`, câmera liberada só para o próprio site.
- Senha com bcrypt, sessão em cookie `HttpOnly`/`Secure`/`SameSite=Lax` com o hash no banco,
  limite de tentativas no login.
- Repositório público: nenhum segredo no código ou no histórico; backups criptografados.
- `npm audit` acusa `mysql2` e `deepmerge-ts` vulneráveis, dependências internas da
  **ferramenta** de linha de comando do Prisma (não entram no site e o projeto não usa
  MySQL). A correção sugerida rebaixaria o Prisma para a versão 6; revisitar quando sair
  um Prisma 7.x corrigido.
