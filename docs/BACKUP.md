# Backup e restauração do banco

## Como funciona

Todo dia às 04:00 (São Paulo), o GitHub Actions roda `.github/workflows/backup.yml`:
copia o banco de produção com `pg_dump`, criptografa com AES-256 usando a senha
`BACKUP_SENHA` e guarda o arquivo por **30 dias** em _Actions → Backup do banco_.

Além disso, o próprio Neon (plano grátis) consegue voltar o banco até **6 horas** no tempo
(_Restore_ no painel do Neon). Para um erro percebido na hora, isso é o mais rápido.

## Configurar (uma vez)

No GitHub: _Settings → Secrets and variables → Actions → New repository secret_.

| Segredo               | Valor                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------ |
| `BACKUP_DATABASE_URL` | A URL **sem pooler** do Neon (`DATABASE_URL_UNPOOLED`, o host sem `-pooler`).                          |
| `BACKUP_SENHA`        | Uma senha longa, só para os backups. **Guarde num gerenciador de senhas:** sem ela, o backup não abre. |

Depois, em _Actions → Backup do banco → Run workflow_, rode uma vez e confira que terminou
verde e gerou o arquivo.

> **Atenção:** o GitHub desliga tarefas agendadas de repositórios públicos depois de
> 60 dias sem nenhum commit. Se o repositório ficar parado, confira uma vez por mês em
> _Actions_ se o backup continua rodando (e reative se aparecer o aviso).

## Restaurar

1. Em _Actions → Backup do banco_, abra a execução do dia desejado e baixe o arquivo
   (vem dentro de um `.zip`).
2. Descriptografe:

   ```sh
   gpg --decrypt --output banco.dump backup-AAAA-MM-DD.dump.gpg
   ```

3. **Restaure primeiro num banco de teste**, nunca direto na produção: no Neon, crie um
   _branch_ e use a URL dele.

   ```sh
   pg_restore --clean --if-exists --no-owner --no-privileges -d "URL_DO_BRANCH" banco.dump
   ```

4. Confira os dados. Se estiver certo, repita o passo 3 com a URL de produção (ou promova o
   branch a principal no Neon).
