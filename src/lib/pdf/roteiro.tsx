import "server-only";

import { Document, Image, Page, renderToBuffer, Text, View } from "@react-pdf/renderer";

import { formatarTelefone } from "@/lib/convidados/telefone";
import { ETAPAS_MENU } from "@/lib/festas/colunas-schema";
import { documentoVazio } from "@/lib/festas/observacoes";
import type { Colunas } from "@/lib/festas/consultas";
import { formatarReais } from "@/lib/festas/formatos";
import { valorPago } from "@/lib/festas/parcelas";
import {
  criancasPorIdade,
  descreverFaixas,
  faixasDe,
  lugaresDe,
  ROTULO_FAIXA,
  somarFaixas,
  type Faixas,
} from "@/lib/convidados/contagem";
import { DO_BANCO } from "@/lib/convites/membros";
import { paraCampos } from "@/lib/datas";
import type { InfoImagem } from "@/lib/planta/imagem";

import { dataDaFesta, linhasDaFesta, type DadosFesta } from "./comum";
import { DocumentoPdf, ItemMarcavel } from "./documento";
import { base, cor, LOGO, PROPORCAO_LOGO } from "./tema";

export type DadosRoteiro = {
  festa: DadosFesta;
  colunas: Colunas;
  contagem: { total: number; confirmados: number; recusados: number; aguardando: number };
  semMesa: number;
  // Confirmados por faixa de idade, para o buffet. Vazio em festa já limpa (LGPD).
  buffet: Faixas | null;
  // Texto do cerimonial (a fala): o escrito no painel (documento do editor) e o link.
  fala: { texto: unknown; link: string | null };
  planta: { bytes: Uint8Array; info: InfoImagem } | null;
  // false: roteiro impresso para o dia da festa, que circula pela equipe e pelos fornecedores,
  // então sai sem valor, situação de pagamento e totais. true: checklist com os noivos.
  comValores: boolean;
};

// Margens da folha A4 (em pontos), iguais dos dois lados.
export const M = { topo: 44, direita: 40, base: 52, esquerda: 40 };

export function Secao({
  titulo,
  resumo,
  novaPagina = false,
  children,
}: {
  titulo: string;
  resumo?: string;
  // Primeira seção da página: sem a margem de cima (cada categoria do roteiro é uma
  // página própria do documento, ver Folha).
  novaPagina?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginTop: novaPagina ? 0 : 26 }}>
      {/* minPresenceAhead: o título não fica sozinho no pé da página. */}
      <View
        minPresenceAhead={60}
        style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 6 }}
      >
        <Text style={{ fontSize: 13, fontWeight: 600 }}>{titulo}</Text>
        {resumo && <Text style={[base.suave, { fontSize: 9, marginLeft: 8 }]}>{resumo}</Text>}
      </View>
      <View style={{ borderTopWidth: 0.5, borderTopColor: cor.pauta }}>{children}</View>
    </View>
  );
}

export function Vazio({ children }: { children: string }) {
  return <Text style={[base.suave, { paddingVertical: 5 }]}>{children}</Text>;
}

export const linha = {
  flexDirection: "row" as const,
  paddingVertical: 4.5,
  borderBottomWidth: 0.5,
  borderBottomColor: cor.pauta,
};

// Espaço embaixo de cada fornecedor, para ela anotar à mão no dia da festa:
// uns dois dedos (~3,5 cm), com pautas leves para a letra não entortar.
const ESPACO_ANOTACAO = 96;
const PAUTA_ANOTACAO = 22;

type FornecedorPdf = {
  servico: string;
  nome: string;
  telefone: string | null;
  checklist: Colunas["contratacoes"][number]["checklist"];
  valorCentavos: number | null;
  situacao: string;
};

// Um fornecedor por bloco: quem é e como falar com ele, o que falta resolver e onde anotar.
// O bloco inteiro fica na mesma página.
function FornecedorDetalhado({ f, comValores }: { f: FornecedorPdf; comValores: boolean }) {
  return (
    <View wrap={false} style={{ paddingTop: 10, paddingBottom: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={base.rotulo}>{f.servico}</Text>
          <Text style={{ fontSize: 11.5, fontWeight: 600, marginTop: 1 }}>{f.nome}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[base.mono, { fontSize: 9 }]}>
            {f.telefone ? formatarTelefone(f.telefone) : "Sem WhatsApp"}
          </Text>
          {comValores && f.valorCentavos !== null && (
            <Text style={{ fontSize: 8.5 }}>
              <Text style={base.mono}>{formatarReais(f.valorCentavos)}</Text>
              <Text style={base.suave}> · {f.situacao}</Text>
            </Text>
          )}
        </View>
      </View>

      {/* Checklist em duas colunas: os itens são curtos e a folha é larga. */}
      {f.checklist.length > 0 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 6 }}>
          {f.checklist.map((i) => (
            <View key={i.id} style={{ width: "50%", paddingRight: 10 }}>
              <ItemMarcavel texto={i.texto} feito={i.feito} />
            </View>
          ))}
        </View>
      )}

      <View
        style={{
          height: ESPACO_ANOTACAO,
          marginTop: 8,
          paddingHorizontal: 8,
          paddingTop: 4,
          borderWidth: 0.5,
          borderColor: cor.borda,
          borderRadius: 3,
        }}
      >
        <Text style={[base.rotulo, { fontSize: 6.5 }]}>Anotações</Text>
        {Array.from({ length: Math.floor(ESPACO_ANOTACAO / PAUTA_ANOTACAO) - 1 }, (_, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              left: 8,
              right: 8,
              top: PAUTA_ANOTACAO * (i + 1) + 4,
              borderBottomWidth: 0.5,
              borderBottomColor: cor.pauta,
              borderBottomStyle: "dotted",
            }}
          />
        ))}
      </View>
    </View>
  );
}

export function Fornecedores({
  contratacoes,
  comValores = true,
  detalhado = false,
}: {
  contratacoes: Colunas["contratacoes"];
  comValores?: boolean;
  // Roteiro e checklist: cada fornecedor com o seu checklist embaixo e espaço para anotar.
  // O PDF completo tem os checklists numa seção própria, então lá fica a tabela simples.
  detalhado?: boolean;
}) {
  const fornecedores = contratacoes.map((c) => ({
    id: c.id,
    servico: c.servico.nome,
    nome: c.fornecedor?.nome ?? "A escolher",
    telefone: c.fornecedor?.telefone ?? null,
    checklist: c.checklist,
    valorCentavos: c.valorCentavos,
    pago: valorPago(c.valorCentavos ?? 0, c.parcelas, c.parcelasPagas),
    situacao:
      c.valorCentavos === null
        ? ""
        : c.parcelasPagas >= c.parcelas
          ? "Pago"
          : c.parcelas > 1
            ? `${c.parcelasPagas}/${c.parcelas} pagas`
            : "A pagar",
  }));
  const comValor = fornecedores.filter((f) => f.valorCentavos !== null);
  const total = comValor.reduce((s, f) => s + f.valorCentavos!, 0);
  const pago = comValor.reduce((s, f) => s + f.pago, 0);
  const n = fornecedores.length;

  return (
    <Secao titulo="Fornecedores" resumo={`${n} ${n === 1 ? "fornecedor" : "fornecedores"}`}>
      {n === 0 ? (
        <Vazio>Nenhum fornecedor cadastrado.</Vazio>
      ) : (
        <>
          {detalhado ? (
            fornecedores.map((f) => (
              <FornecedorDetalhado key={f.id} f={f} comValores={comValores} />
            ))
          ) : (
            <>
              <View style={[linha, { paddingVertical: 3 }]}>
                <Text style={[base.rotulo, { width: "24%" }]}>Serviço</Text>
                <Text style={[base.rotulo, { flex: 1 }]}>Fornecedor</Text>
                <Text style={[base.rotulo, { width: 92 }]}>WhatsApp</Text>
                {comValores && (
                  <>
                    <Text style={[base.rotulo, { width: 78, textAlign: "right" }]}>Valor</Text>
                    <Text style={[base.rotulo, { width: 56, textAlign: "right" }]}>Situação</Text>
                  </>
                )}
              </View>
              {fornecedores.map((f) => (
                <View key={f.id} style={linha} wrap={false}>
                  <Text style={[base.suave, { width: "24%", paddingRight: 8 }]}>{f.servico}</Text>
                  <Text style={{ flex: 1, paddingRight: 8 }}>{f.nome}</Text>
                  <Text style={[base.mono, { width: 92, fontSize: 8.5 }]}>
                    {f.telefone ? formatarTelefone(f.telefone) : "—"}
                  </Text>
                  {comValores && (
                    <>
                      <Text style={[base.mono, { width: 78, fontSize: 8.5, textAlign: "right" }]}>
                        {f.valorCentavos !== null ? formatarReais(f.valorCentavos) : "—"}
                      </Text>
                      <Text
                        style={[
                          { width: 56, fontSize: 9, textAlign: "right" },
                          f.situacao === "Pago" ? {} : base.suave,
                        ]}
                      >
                        {f.situacao}
                      </Text>
                    </>
                  )}
                </View>
              ))}
            </>
          )}
          {comValores && (
            <View
              style={{ flexDirection: "row", justifyContent: "flex-end", gap: 18, paddingTop: 6 }}
              wrap={false}
            >
              {[
                ["Contratado", total],
                ["Pago", pago],
                ["A pagar", total - pago],
              ].map(([rotulo, valor]) => (
                <View key={rotulo} style={{ alignItems: "flex-end" }}>
                  <Text style={base.rotulo}>{rotulo}</Text>
                  <Text style={[base.mono, { fontSize: 10, fontWeight: 500 }]}>
                    {formatarReais(valor as number)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </Secao>
  );
}

// Em pessoas: a Família Silva confirmada com 4 ocupa 4 lugares.
const ocupados = (m: Colunas["mesas"][number]) =>
  m.convidados.reduce((s, c) => s + lugaresDe(c), 0);

// Como o convite aparece na mesa: com os nomes de cada pessoa, quando a família informou
// (mesas demarcadas, para as plaquinhas); senão, o nome do convite e quantos lugares ocupa.
// A idade das crianças sai em marca-texto: ao lado do nome de cada uma, ou quantas são
// de cada idade no convite.
const grifado = { backgroundColor: cor.grifo, fontWeight: 600 } as const;

function NomeNaMesa({ c }: { c: Colunas["mesas"][number]["convidados"][number] }) {
  const lugares = lugaresDe(c);
  if (c.rsvp === "CONFIRMADO" && c.membros.length >= lugares && lugares > 1) {
    return (
      <>
        {c.nome} (
        {c.membros.slice(0, lugares).map((m, i) => (
          <Text key={i}>
            {i > 0 && ", "}
            {m.nome}
            {m.faixa !== "ADULTO" && (
              <>
                {" "}
                <Text style={grifado}> {ROTULO_FAIXA[DO_BANCO[m.faixa]]} </Text>
              </>
            )}
          </Text>
        ))}
        )
      </>
    );
  }
  const idades = criancasPorIdade(faixasDe(c));
  return (
    <>
      {lugares > 1 ? `${c.nome} (${lugares})` : c.nome}
      {idades.map((i) => (
        <Text key={i.idade}>
          {" "}
          <Text style={grifado}>
            {" "}
            {i.n} de {i.idade}{" "}
          </Text>
        </Text>
      ))}
    </>
  );
}

const plural = (n: number) => (n === 1 ? "criança" : "crianças");

export function Mesas({
  mesas,
  semMesa,
  novaPagina,
}: {
  mesas: Colunas["mesas"];
  semMesa: number;
  novaPagina?: boolean;
}) {
  const lugares = mesas.reduce((s, m) => s + m.lugares, 0);
  const sentados = mesas.reduce((s, m) => s + ocupados(m), 0);
  const total = somarFaixas(mesas.flatMap((m) => m.convidados));
  const criancas = criancasPorIdade(total)
    .map((c) => ` · ${c.n} ${plural(c.n)} de ${c.idade}`)
    .join("");
  const resumo =
    mesas.length === 0
      ? undefined
      : `${sentados} de ${lugares} lugares ocupados` +
        criancas +
        (semMesa > 0 ? ` · ${semMesa} ${semMesa === 1 ? "pessoa" : "pessoas"} sem mesa` : "");

  return (
    <Secao titulo="Mesas" resumo={resumo} novaPagina={novaPagina}>
      {mesas.length === 0 ? (
        <Vazio>Nenhuma mesa cadastrada.</Vazio>
      ) : (
        mesas.map((m) => {
          const ocupa = ocupados(m);
          const livres = m.lugares - ocupa;
          const faixas = somarFaixas(m.convidados);
          const criancasDaMesa = criancasPorIdade(faixas);
          return (
            // Lugares em destaque à esquerda: é o que ela confere de relance ao montar o salão.
            <View
              key={m.id}
              style={[linha, { alignItems: "flex-start", paddingVertical: 6 }]}
              wrap={false}
            >
              <View
                style={{
                  width: 44,
                  marginRight: 12,
                  paddingVertical: 3,
                  alignItems: "center",
                  borderWidth: 0.75,
                  borderColor: cor.tinta,
                  borderRadius: 3,
                }}
              >
                <Text style={[base.mono, { fontSize: 15, fontWeight: 500, lineHeight: 1.1 }]}>
                  {m.lugares}
                </Text>
                <Text style={[base.rotulo, { fontSize: 5.5, letterSpacing: 0.5 }]}>lugares</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={base.forte}>{m.nome}</Text>
                  <Text
                    style={[
                      { fontSize: 8.5 },
                      livres < 0
                        ? { backgroundColor: cor.grifo, paddingHorizontal: 2, fontWeight: 600 }
                        : base.suave,
                    ]}
                  >
                    {livres < 0
                      ? `${-livres} a mais que os lugares`
                      : livres === 0
                        ? "Completa"
                        : `${ocupa} ${ocupa === 1 ? "sentado" : "sentados"} · ${livres} ${livres === 1 ? "livre" : "livres"}`}
                  </Text>
                </View>
                {/* Crianças da mesa: só de quem já disse as idades. */}
                {(criancasDaMesa.length > 0 || faixas.semIdade > 0) && (
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      alignItems: "center",
                      marginTop: 1,
                      marginBottom: 3,
                    }}
                  >
                    {criancasDaMesa.map((c) => (
                      <Text
                        key={c.idade}
                        style={[
                          grifado,
                          { fontSize: 10, paddingHorizontal: 4, marginRight: 5, borderRadius: 2 },
                        ]}
                      >
                        {c.n} {plural(c.n)} de {c.idade}
                      </Text>
                    ))}
                    {faixas.semIdade > 0 && (
                      <Text style={[base.suave, { fontSize: 9 }]}>
                        {faixas.semIdade} sem idade informada
                      </Text>
                    )}
                  </View>
                )}
                <Text style={[{ fontSize: 9 }, m.convidados.length ? {} : base.suave]}>
                  {m.convidados.length
                    ? m.convidados.map((c, i) => (
                        <Text key={c.id}>
                          {i > 0 && " · "}
                          <NomeNaMesa c={c} />
                        </Text>
                      ))
                    : "Ninguém sentado ainda."}
                </Text>
              </View>
            </View>
          );
        })
      )}
    </Secao>
  );
}

// A fala da cerimônia: o texto escrito no painel, como foi formatado. Sem texto, mas com
// o link do documento, o link sai como referência (para achar o arquivo).
export function TextoDoCerimonial({
  texto,
  link,
  novaPagina,
}: {
  texto: unknown;
  link: string | null;
  novaPagina?: boolean;
}) {
  const escrito = texto !== null && !documentoVazio(texto);
  if (!escrito && !link) return null;
  return (
    <Secao titulo="Texto do cerimonial" novaPagina={novaPagina}>
      <View style={{ paddingTop: 6 }}>
        {escrito ? (
          <DocumentoPdf doc={texto} />
        ) : (
          <Text style={[base.suave, { fontSize: 9 }]}>
            O texto está no documento: <Text style={{ color: cor.tinta }}>{link}</Text>
          </Text>
        )}
      </View>
    </Secao>
  );
}

// Cortejo: quem entra, em ordem, com a música. No fim, o checklist da cerimônia (lapelas,
// buquês, porta-alianças…) com caixinhas grandes para marcar à caneta; o que ela já marcou
// no painel sai com a caixinha cheia.
export function EntradasCerimonia({
  entradas,
  checklist,
  novaPagina,
}: {
  entradas: Colunas["entradas"];
  checklist: Colunas["checklistCerimonia"];
  novaPagina?: boolean;
}) {
  return (
    <Secao
      novaPagina={novaPagina}
      titulo="Entradas da cerimônia"
      resumo={entradas.length ? `${entradas.length}` : undefined}
    >
      {entradas.length === 0 ? (
        <Vazio>Nenhuma entrada no cortejo.</Vazio>
      ) : (
        entradas.map((e, i) => (
          <View key={e.id} style={[linha, { alignItems: "flex-start" }]} wrap={false}>
            <Text style={[base.mono, { width: 22, fontWeight: 500 }]}>{i + 1}.</Text>
            <View style={{ flex: 1 }}>
              <Text style={base.forte}>{e.quem}</Text>
              {e.musica && <Text style={[base.suave, { fontSize: 9 }]}>Música: {e.musica}</Text>}
            </View>
          </View>
        ))
      )}

      {checklist.length > 0 && (
        <View style={{ marginTop: 14 }} wrap={false}>
          <Text style={[base.rotulo, { marginBottom: 4 }]}>Checklist da cerimônia</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {checklist.map((item) => (
              <View
                key={item.id}
                style={{
                  width: "50%",
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 4,
                  paddingRight: 10,
                }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    marginRight: 7,
                    borderWidth: 0.75,
                    borderColor: cor.tinta,
                    borderRadius: 2,
                    backgroundColor: item.feito ? cor.tinta : undefined,
                  }}
                />
                <Text style={{ flex: 1 }}>{item.texto}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Secao>
  );
}

// Lista de presença para marcar à caneta no dia: caixinha grande, nome e a hora de chegada.
// Quem já foi marcado no painel sai com a caixinha cheia e a hora preenchida.
// "98 adultos · 10 de 4 a 11 · 4 de 0 a 3 (não pagam)": quem confirmou, como o buffet cobra.
export const textoBuffet = (f: Faixas) =>
  [
    descreverFaixas({ ...f, criancas0a3: 0, semIdade: 0 }),
    f.criancas0a3 && `${f.criancas0a3} de 0 a 3 (não pagam)`,
    f.semIdade && `${f.semIdade} sem idade informada`,
  ]
    .filter(Boolean)
    .join(" · ");

export function PresencaPadrinhos({
  padrinhos,
  novaPagina,
}: {
  padrinhos: Colunas["padrinhos"];
  novaPagina?: boolean;
}) {
  const n = padrinhos.length;
  return (
    <Secao
      titulo="Padrinhos"
      resumo={n ? `${n} ${n === 1 ? "padrinho" : "padrinhos"}` : undefined}
      novaPagina={novaPagina}
    >
      {n === 0 ? (
        <Vazio>Nenhum padrinho cadastrado.</Vazio>
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {padrinhos.map((p, i) => (
            <View
              key={p.id}
              wrap={false}
              style={[
                linha,
                {
                  width: "50%",
                  alignItems: "center",
                  paddingVertical: 7,
                  paddingRight: i % 2 === 0 ? 14 : 0,
                  paddingLeft: i % 2 === 1 ? 14 : 0,
                },
              ]}
            >
              <View
                style={{
                  width: 11,
                  height: 11,
                  marginRight: 8,
                  borderWidth: 0.75,
                  borderColor: cor.tinta,
                  borderRadius: 2,
                  backgroundColor: p.presenteEm ? cor.tinta : undefined,
                }}
              />
              <View style={{ flex: 1, paddingRight: 6 }}>
                <Text style={base.forte}>{p.nome}</Text>
                {p.telefone && (
                  <Text style={[base.mono, base.suave, { fontSize: 7.5 }]}>
                    {formatarTelefone(p.telefone)}
                  </Text>
                )}
              </View>
              <View style={{ width: 52, alignItems: "flex-end" }}>
                <Text style={[base.rotulo, { fontSize: 5.5 }]}>Chegou</Text>
                <Text
                  style={[
                    base.mono,
                    {
                      width: 44,
                      fontSize: 9,
                      textAlign: "center",
                      borderBottomWidth: 0.5,
                      borderBottomColor: cor.suave,
                      minHeight: 12,
                    },
                  ]}
                >
                  {p.presenteEm ? paraCampos(p.presenteEm).hora : " "}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </Secao>
  );
}

// Itens do menu de uma etapa, numa linha: "Filé ao molho… · Opção vegetariana…".
const itensDaEtapa = (menu: Colunas["menu"], etapa: string) =>
  menu
    .filter((m) => m.etapa === etapa)
    .map((m) => m.texto)
    .join(" · ");

export function Cronograma({
  itens,
  titulo = "Cronograma",
  novaPagina,
  menu,
}: {
  itens: Colunas["cronograma"];
  titulo?: string;
  novaPagina?: boolean;
  // Com o menu: cada horário ligado a etapas mostra o que é servido embaixo dele, e as
  // etapas que nenhum horário pegou saem num bloco "Menu" no fim, para nada ficar de fora.
  menu?: Colunas["menu"];
}) {
  const etapasComItens = ETAPAS_MENU.filter((e) => menu?.some((m) => m.etapa === e));
  const servidas = (etapas: string[]) => etapasComItens.filter((e) => etapas.includes(e));
  const soltas = etapasComItens.filter((e) => !itens.some((i) => i.etapasMenu.includes(e)));

  return (
    <Secao titulo={titulo} novaPagina={novaPagina}>
      {itens.length === 0 ? (
        <Vazio>Nenhum horário cadastrado.</Vazio>
      ) : (
        itens.map((item) => {
          const c = item.contratacao;
          const responsavel = c
            ? c.fornecedor
              ? `${c.fornecedor.nome} (${c.servico.nome})`
              : c.servico.nome
            : item.responsavelTexto;
          return (
            <View key={item.id} style={[linha, { flexDirection: "column" }]} wrap={false}>
              <View style={{ flexDirection: "row" }}>
                <Text style={[base.mono, { width: 48, fontWeight: 500 }]}>{item.hora}</Text>
                <Text style={{ flex: 1, paddingRight: 10 }}>{item.atividade}</Text>
                <Text style={[base.suave, { width: "34%", fontSize: 9, textAlign: "right" }]}>
                  {responsavel ?? ""}
                </Text>
              </View>
              {menu &&
                servidas(item.etapasMenu).map((etapa) => (
                  <Text key={etapa} style={{ marginLeft: 48, fontSize: 9, lineHeight: 1.35 }}>
                    <Text style={base.forte}>{etapa}: </Text>
                    <Text style={base.suave}>{itensDaEtapa(menu, etapa)}</Text>
                  </Text>
                ))}
            </View>
          );
        })
      )}
      {menu && soltas.length > 0 && (
        <View style={{ marginTop: 14 }} wrap={false}>
          <Text style={[base.rotulo, { marginBottom: 2 }]}>
            {itens.some((i) => i.etapasMenu.length) ? "Menu (sem horário)" : "Menu"}
          </Text>
          {soltas.map((etapa) => (
            <Text key={etapa} style={{ fontSize: 9, lineHeight: 1.45 }}>
              <Text style={base.forte}>{etapa}: </Text>
              <Text style={base.suave}>{itensDaEtapa(menu, etapa)}</Text>
            </Text>
          ))}
        </View>
      )}
    </Secao>
  );
}

// Dois textos soltos, cada um preso ao pé da página (um View absoluto com filhos sumia no render).
export function Rodape({ titulo, rotulo = "Roteiro" }: { titulo: string; rotulo?: string }) {
  const estilo = {
    position: "absolute" as const,
    bottom: 24,
    fontSize: 7.5,
    color: cor.suave,
  };
  return (
    <>
      <Text fixed style={[estilo, { left: M.esquerda, right: M.direita + 60 }]}>
        {rotulo} · {titulo}
      </Text>
      <Text
        fixed
        style={[estilo, { right: M.direita, width: 60, textAlign: "right" }]}
        render={({ pageNumber, totalPages }) => `${pageNumber} de ${totalPages}`}
      />
    </>
  );
}

// Página A4 em pé com o rodapé do roteiro; se o conteúdo passar, continua na seguinte.
const PAGINA = [
  base.pagina,
  { paddingTop: M.topo, paddingRight: M.direita, paddingBottom: M.base, paddingLeft: M.esquerda },
];

function Folha({
  titulo,
  rotulo,
  children,
}: {
  titulo: string;
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <Page size="A4" style={PAGINA}>
      <View style={base.conteudo}>{children}</View>
      <Rodape titulo={titulo} rotulo={rotulo} />
    </Page>
  );
}

function Roteiro({
  festa,
  colunas,
  contagem,
  semMesa,
  buffet,
  fala,
  planta,
  comValores,
}: DadosRoteiro) {
  const nome = comValores ? "Checklist" : "Roteiro";
  const data = dataDaFesta(festa.dataHora);
  const pagina = [
    base.pagina,
    { paddingTop: M.topo, paddingRight: M.direita, paddingBottom: M.base, paddingLeft: M.esquerda },
  ];
  // Planta larga vai numa página deitada, para aproveitar a folha.
  const deitada = planta ? planta.info.largura > planta.info.altura : false;
  const temFala = (fala.texto !== null && !documentoVazio(fala.texto)) || !!fala.link;

  return (
    <Document title={`${nome} · ${festa.titulo}`} author="Elisangela Schubert" language="pt-BR">
      <Page size="A4" style={pagina}>
        <View style={base.conteudo}>
          {/* Topo compacto: no dia, o que importa são fornecedores, mesas e horários. */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={base.rotulo}>
                {comValores ? "Checklist da festa" : "Roteiro da festa"}
              </Text>
              <Text style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.25, marginTop: 3 }}>
                {festa.titulo}
              </Text>
              <Text style={{ fontSize: 9 }}>
                {data.semana}, {Number(data.dia)} de {data.mesAno.toLowerCase()} ·{" "}
                <Text style={base.mono}>{data.hora}</Text>
              </Text>
            </View>
            {/* Image do PDF, não um <img>: não existe alt aqui. */}
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={LOGO} style={{ width: 72, height: 72 * PROPORCAO_LOGO }} />
          </View>

          <View
            style={{
              marginTop: 8,
              paddingTop: 4,
              borderTopWidth: 0.5,
              borderTopColor: cor.pauta,
              fontSize: 8,
              lineHeight: 1.4,
            }}
          >
            {[
              ...linhasDaFesta(festa),
              {
                rotulo: "Convidados",
                valor:
                  contagem.total === 0
                    ? "Nenhum cadastrado"
                    : `${contagem.total} no total · ${contagem.confirmados} confirmados · ` +
                      `${contagem.aguardando} aguardando · ${contagem.recusados} não vão`,
              },
              ...(buffet && contagem.confirmados > 0
                ? [{ rotulo: "Buffet", valor: textoBuffet(buffet) }]
                : []),
            ].map((l) => (
              <Text key={l.rotulo}>
                <Text style={base.suave}>{l.rotulo}: </Text>
                {l.valor ?? "—"}
              </Text>
            ))}
          </View>

          <Fornecedores contratacoes={colunas.contratacoes} comValores={comValores} detalhado />
        </View>
        <Rodape titulo={festa.titulo} rotulo={nome} />
      </Page>

      {/* Uma categoria por página (páginas próprias do documento), para ela separar as
          folhas no dia. As da cerimônia só saem quando têm conteúdo. */}
      <Folha titulo={festa.titulo} rotulo={nome}>
        <Mesas mesas={colunas.mesas} semMesa={semMesa} novaPagina />
      </Folha>
      <Folha titulo={festa.titulo} rotulo={nome}>
        <Cronograma
          itens={colunas.cronograma}
          titulo="Cronograma da festa"
          menu={colunas.menu}
          novaPagina
        />
      </Folha>
      {colunas.cerimonial.length > 0 && (
        <Folha titulo={festa.titulo} rotulo={nome}>
          <Cronograma itens={colunas.cerimonial} titulo="Cerimônia" novaPagina />
        </Folha>
      )}
      {temFala && (
        <Folha titulo={festa.titulo} rotulo={nome}>
          <TextoDoCerimonial texto={fala.texto} link={fala.link} novaPagina />
        </Folha>
      )}
      {(colunas.entradas.length > 0 || colunas.checklistCerimonia.length > 0) && (
        <Folha titulo={festa.titulo} rotulo={nome}>
          <EntradasCerimonia
            entradas={colunas.entradas}
            checklist={colunas.checklistCerimonia}
            novaPagina
          />
        </Folha>
      )}
      {colunas.padrinhos.length > 0 && (
        <Folha titulo={festa.titulo} rotulo={nome}>
          <PresencaPadrinhos padrinhos={colunas.padrinhos} novaPagina />
        </Folha>
      )}

      {planta && (
        <Page size="A4" orientation={deitada ? "landscape" : "portrait"} style={pagina}>
          <View style={[base.conteudo, { flex: 1 }]}>
            <Text style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Planta do salão</Text>
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              {/* Image do PDF, não um <img>: não existe alt aqui. */}
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image
                src={{
                  data: Buffer.from(planta.bytes),
                  format: planta.info.tipo === "png" ? "png" : "jpg",
                }}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              />
            </View>
          </View>
          <Rodape titulo={festa.titulo} rotulo={nome} />
        </Page>
      )}
    </Document>
  );
}

export function gerarPdfRoteiro(dados: DadosRoteiro) {
  return renderToBuffer(<Roteiro {...dados} />);
}
