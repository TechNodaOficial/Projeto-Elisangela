# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Elisangela, organizadora de festas de casamento, é a única usuária do painel. Ela usa no
computador para cadastrar e consultar festas e convidados, e no celular para consultas rápidas e
para o check-in na porta da festa.

Os convidados das festas são um público secundário: não entram no painel, só abrem o link
pessoal do convite (sem login), confirmam ou recusam a presença e apresentam o QR Code na entrada.

## Product Purpose

Centralizar as festas da Elisangela: ver o que está pendente e o que já aconteceu, mandar a cada
convidado um link único de confirmação, gerar um PDF com os dados da festa para enviar aos
convidados e, no dia, registrar quem chegou lendo o QR Code de cada um.

Sucesso: ela organiza uma festa inteira sem planilhas e faz o check-in na porta sem fila.

## Operating Context

- Painel: computador no dia a dia, celular nas consultas rápidas.
- Check-in: celular na entrada do salão, câmera lendo QR Codes em sequência, muitas vezes com
  pouca luz e pressa. Assume-se que há internet no local.
- Convidados: abrem o link no celular, geralmente vindo do WhatsApp.

## Capabilities and Constraints

- Painel com login de usuária única (sem cadastro).
- Festas: pendentes ou concluídas, conforme a data (`dataHora`).
- Navegação do painel definida pela dona do projeto: logo no canto superior esquerdo (corrigido pela dona; antes estava à direita); à esquerda,
  "Festas pendentes", "Festas concluídas" e "Leitor QR Code"; ao centro, cards clicáveis das festas
  com os detalhes e um botão para adicionar nova festa.
- Interface toda em português do Brasil; datas no fuso de São Paulo.
- Fora do MVP: acompanhantes, importação por planilha, prazo de confirmação, modo offline.

## Brand Commitments

Ainda não existe logo. Até haver uma, o nome do negócio em texto ocupa o lugar da logo
(provisório: "Elisangela Eventos" — nome definitivo ainda não informado).

## Evidence on Hand

Nenhum material de marca, foto ou depoimento. Não inventar nome definitivo, logo ou conteúdo
de festas reais.

## Product Principles

1. Clareza operacional antes de enfeite: ela precisa achar a festa certa em segundos.
2. O check-in não pode travar a fila: respostas grandes, imediatas e inequívocas.
3. Os dados são de pessoas reais (LGPD): mostrar e guardar só o necessário.
4. Funciona igualmente bem no computador e no celular.
