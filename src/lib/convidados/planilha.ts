import { paraCampos } from "@/lib/datas";

import { confirmadasDe, faixasDe, somarFaixas } from "./contagem";
import { etapaDoConvite, type Etapa } from "./etapa";
import { formatarTelefone } from "./telefone";

// Lista de convidados como planilha: uma linha por convite, com o cabeçalho em cima e os
// totais embaixo. Números ficam como número (para a planilha somar e filtrar); o resto é
// texto puro, nunca fórmula (um nome começando com "=" não vira conta).

export type Celula = string | number;

type ConvidadoPlanilha = {
  nome: string;
  telefone: string | null;
  pessoas: number;
  rsvp: "PENDENTE" | "CONFIRMADO" | "RECUSADO";
  confirmadas: number | null;
  criancas4a11: number | null;
  criancas0a3: number | null;
  enviadoEm: Date | null;
  abertoEm: Date | null;
  respondidoEm: Date | null;
  entraram: number;
  presenteEm: Date | null;
  mesa: { nome: string } | null;
  membros: { nome: string }[];
  mensagem: string | null;
};

const SITUACAO: Record<Etapa, string> = {
  nao_enviado: "Não enviado",
  enviado: "Enviado",
  abriu: "Abriu o convite",
  confirmou: "Confirmou",
  nao_vai: "Não vai",
  chegou: "Chegou",
};

export const CABECALHO = [
  "Convite",
  "WhatsApp",
  "Pessoas no convite",
  "Situação",
  "Confirmadas",
  "Adultos",
  "Crianças 4 a 11",
  "Crianças 0 a 3",
  "Sem idade informada",
  "Nomes de quem vai",
  "Mesa",
  "Entraram",
  "Hora da entrada",
  "Respondeu em",
  "Recado",
] as const;

// "21/09/2026 19:30", no fuso de São Paulo.
const dataHora = (d: Date | null) => {
  if (!d) return "";
  const { data, hora } = paraCampos(d);
  return `${data.split("-").reverse().join("/")} ${hora}`;
};

export function linhasDaPlanilha(convidados: ConvidadoPlanilha[]): Celula[][] {
  const linhas: Celula[][] = convidados.map((c) => {
    const f = faixasDe(c);
    const vai = c.rsvp === "CONFIRMADO";
    return [
      c.nome,
      c.telefone ? formatarTelefone(c.telefone) : "",
      c.pessoas,
      SITUACAO[etapaDoConvite(c)],
      vai ? confirmadasDe(c) : "",
      vai ? f.adultos : "",
      vai ? f.criancas4a11 : "",
      vai ? f.criancas0a3 : "",
      vai && f.semIdade ? f.semIdade : "",
      vai
        ? c.membros
            .slice(0, confirmadasDe(c))
            .map((m) => m.nome)
            .join(", ")
        : "",
      c.mesa?.nome ?? "",
      c.entraram || "",
      c.presenteEm ? paraCampos(c.presenteEm).hora : "",
      dataHora(c.respondidoEm),
      c.mensagem ?? "",
    ];
  });

  const t = somarFaixas(convidados);
  const total = (f: (c: ConvidadoPlanilha) => number) => convidados.reduce((s, c) => s + f(c), 0);
  const rodape: Celula[] = [
    "Total",
    "",
    total((c) => c.pessoas),
    "",
    total(confirmadasDe),
    t.adultos,
    t.criancas4a11,
    t.criancas0a3,
    t.semIdade,
    "",
    "",
    total((c) => c.entraram),
    "",
    "",
    "",
  ];

  return [[...CABECALHO], ...linhas, rodape];
}

// Largura de cada coluna em pixels, pelo texto mais longo dela (o cabeçalho conta, em
// negrito). O ajuste automático do Google não mede o cabeçalho direito, por isso a conta
// é feita aqui. Colunas longas param no teto e quebram a linha; o recado é sempre largo.
const PX_LETRA = 7.5;
const PX_LETRA_NEGRITO = 8.5;
const FOLGA = 24;
const MINIMA = 64;
const MAXIMA = 280;
const RECADO = 360;

export function larguraDasColunas(linhas: Celula[][]): number[] {
  const [cabecalho, ...resto] = linhas;
  return cabecalho.map((titulo, coluna) => {
    if (coluna === cabecalho.length - 1) return RECADO;
    const maior = Math.max(
      String(titulo).length * PX_LETRA_NEGRITO,
      ...resto.map((l) => String(l[coluna] ?? "").length * PX_LETRA),
    );
    return Math.round(Math.min(MAXIMA, Math.max(MINIMA, maior + FOLGA)));
  });
}

// Cor de fundo da linha pela situação do convite, nos tons claros da paleta do Google:
// verde = confirmou (ou já chegou), vermelho = não vai, amarelo = ainda sem resposta.
type Cor = { red: number; green: number; blue: number };
const rgb = (hex: string): Cor => ({
  red: parseInt(hex.slice(1, 3), 16) / 255,
  green: parseInt(hex.slice(3, 5), 16) / 255,
  blue: parseInt(hex.slice(5, 7), 16) / 255,
});
export const COR_SITUACAO = {
  confirmou: rgb("#d9ead3"),
  pendente: rgb("#fff2cc"),
  naoVai: rgb("#f4cccc"),
};

const COLUNA_SITUACAO = CABECALHO.indexOf("Situação");

export function corDaLinha(linha: Celula[]): Cor {
  const situacao = linha[COLUNA_SITUACAO];
  if (situacao === SITUACAO.confirmou || situacao === SITUACAO.chegou) {
    return COR_SITUACAO.confirmou;
  }
  if (situacao === SITUACAO.nao_vai) return COR_SITUACAO.naoVai;
  return COR_SITUACAO.pendente;
}
