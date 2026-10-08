import { PESSOAS_MAXIMO } from "./schema";
import { normalizarTelefone } from "./telefone";

// Lista de convidados colada de uma vez (do Excel, Google Planilhas, notas ou WhatsApp):
// um convite por linha, com nome e, se quiser, quantas pessoas e o WhatsApp, separados
// por tabulação (como vem do Excel), ponto e vírgula ou vírgula, em qualquer ordem.
//   Ana Souza
//   Família Silva	4	(19) 99876-5432
//   Carlos; 2

export const MAXIMO_LINHAS = 1000;

export type LinhaImportada = {
  linha: number; // número da linha no texto colado, para a prévia
  nome: string;
  pessoas: number;
  telefone: string | null;
  // Motivo de a linha não entrar (telefone inválido, nome repetido...).
  problema?: string;
};

const chaveNome = (nome: string) =>
  nome.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

// Número copiado do WhatsApp vem cercado de marcas invisíveis de direção (U+202A…U+202C,
// U+200E…) e com espaço e hífen não separáveis; aqui viram texto comum.
const limpar = (texto: string) =>
  texto
    .replace(/[‎‏‪-‮⁦-⁩﻿]/g, "")
    .replace(/[   ]/g, " ")
    .replace(/[‐-―−]/g, "-");

function separar(linha: string): string[] {
  const sep = linha.includes("\t") ? "\t" : linha.includes(";") ? ";" : ",";
  return limpar(linha)
    .split(sep)
    .map((c) => c.trim())
    .filter(Boolean);
}

const ehTelefone = (c: string) => c.replace(/\D/g, "").length >= 8 && /^[\d\s()+.-]+$/.test(c);

// Linha escrita só com espaços ("Ana Souza 2 19 99876-5432"): o WhatsApp e a quantidade
// de pessoas vêm no fim, depois do nome.
const TELEFONE_NO_FIM = /^(.*\p{L}.*?)\s+(\+?[\d\s().-]*\d)$/u;
const PESSOAS_NO_FIM = /^(.*\p{L}.*?)\s+(\d{1,2})$/u;

// A quantidade só sai do fim quando veio junto um WhatsApp ou a linha não tem separador.
function desmembrar(celula: string, linhaSemSeparador: boolean): string[] {
  const partes: string[] = [];
  let resto = celula;
  const tel = resto.match(TELEFONE_NO_FIM);
  if (tel && ehTelefone(tel[2])) {
    // "4 (19) 99876-5432": o trecho numérico pode trazer a quantidade na frente; o telefone
    // é o maior final que forma um número válido (sem nenhum válido, vai inteiro).
    const pedacos = tel[2].trim().split(/\s+/);
    const inicio = pedacos.findIndex((_, i) => normalizarTelefone(pedacos.slice(i).join(" ")));
    const corte = inicio === -1 ? 0 : inicio;
    partes.unshift(pedacos.slice(corte).join(" "));
    resto = [tel[1], ...pedacos.slice(0, corte)].join(" ");
  }
  const qtd = resto.match(PESSOAS_NO_FIM);
  if (qtd && (partes.length > 0 || linhaSemSeparador)) {
    partes.unshift(qtd[2]);
    resto = qtd[1];
  }
  return [resto.trim(), ...partes];
}

// Primeira linha com cara de cabeçalho ("Nome", "Pessoas", "Telefone") é ignorada.
const ehCabecalho = (celulas: string[]) =>
  celulas.some((c) =>
    /^(nome|convidados?|pessoas|qtd|quantidade|telefone|whats(app)?|celular)$/i.test(c),
  );

// Mesmo convite = mesmo nome e mesmo WhatsApp (ou os dois sem). Duas "Mariana Costa"
// com números diferentes são pessoas diferentes.
type Cadastrado = { nome: string; telefone: string | null };
const chaveConvite = (c: Cadastrado) => `${chaveNome(c.nome)}|${c.telefone ?? ""}`;

export function lerLista(texto: string, jaCadastrados: Cadastrado[] = []): LinhaImportada[] {
  const existentes = new Set(jaCadastrados.map(chaveConvite));
  const vistos = new Set<string>();
  const resultado: LinhaImportada[] = [];

  texto.split(/\r?\n/).forEach((bruta, i) => {
    const separadas = separar(bruta);
    const celulas = separadas.flatMap((c) =>
      /\p{L}/u.test(c) ? desmembrar(c, separadas.length === 1) : [c],
    );
    if (celulas.length === 0) return;
    if (resultado.length === 0 && ehCabecalho(celulas)) return;

    let nome = "";
    let pessoas = 1;
    let telefone: string | null = null;
    let problema: string | undefined;

    for (const c of celulas) {
      if (/^\d{1,2}$/.test(c)) {
        pessoas = Number(c);
      } else if (ehTelefone(c) || (!/\p{L}/u.test(c) && /\d{3}/.test(c))) {
        // Só números (e símbolos): é o WhatsApp, mesmo curto demais ("12345" = inválido).
        telefone = normalizarTelefone(c);
        if (!telefone) problema = `WhatsApp inválido: ${c}`;
      } else if (!nome) {
        nome = c.replace(/\s+/g, " ").slice(0, 120);
      } else {
        nome = `${nome} ${c}`.slice(0, 120);
      }
    }

    const chave = chaveConvite({ nome, telefone });
    if (!nome) problema ??= "Sem nome";
    else if (pessoas < 1 || pessoas > PESSOAS_MAXIMO)
      problema ??= `De 1 a ${PESSOAS_MAXIMO} pessoas`;
    else if (existentes.has(chave)) problema ??= "Já está na lista (mesmo nome e WhatsApp)";
    else if (vistos.has(chave)) problema ??= "Repetido na lista colada (mesmo nome e WhatsApp)";
    if (nome) vistos.add(chave);

    resultado.push({ linha: i + 1, nome, pessoas, telefone, ...(problema ? { problema } : {}) });
  });

  return resultado;
}
