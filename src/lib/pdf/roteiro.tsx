import "server-only";

import { Document, Image, Page, renderToBuffer, Text, View } from "@react-pdf/renderer";

import { formatarTelefone } from "@/lib/convidados/telefone";
import type { Colunas } from "@/lib/festas/consultas";
import { formatarReais } from "@/lib/festas/formatos";
import { valorPago } from "@/lib/festas/parcelas";
import { lugaresDe } from "@/lib/convidados/contagem";
import type { InfoImagem } from "@/lib/planta/imagem";

import { dataDaFesta, LinhaDado, linhasDaFesta, type DadosFesta } from "./comum";
import { base, cor, LOGO, PROPORCAO_LOGO } from "./tema";

export type DadosRoteiro = {
  festa: DadosFesta;
  colunas: Colunas;
  contagem: { total: number; confirmados: number; recusados: number; aguardando: number };
  semMesa: number;
  planta: { bytes: Uint8Array; info: InfoImagem } | null;
};

// Margens da folha A4 (em pontos), iguais dos dois lados.
export const M = { topo: 44, direita: 40, base: 52, esquerda: 40 };

export function Secao({
  titulo,
  resumo,
  children,
}: {
  titulo: string;
  resumo?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginTop: 26 }}>
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

export function Fornecedores({ contratacoes }: { contratacoes: Colunas["contratacoes"] }) {
  const fornecedores = contratacoes.map((c) => ({
    id: c.id,
    servico: c.servico.nome,
    nome: c.fornecedor?.nome ?? "A escolher",
    telefone: c.fornecedor?.telefone ?? null,
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
          <View style={[linha, { paddingVertical: 3 }]}>
            <Text style={[base.rotulo, { width: "24%" }]}>Serviço</Text>
            <Text style={[base.rotulo, { flex: 1 }]}>Fornecedor</Text>
            <Text style={[base.rotulo, { width: 92 }]}>WhatsApp</Text>
            <Text style={[base.rotulo, { width: 78, textAlign: "right" }]}>Valor</Text>
            <Text style={[base.rotulo, { width: 56, textAlign: "right" }]}>Situação</Text>
          </View>
          {fornecedores.map((f) => (
            <View key={f.id} style={linha} wrap={false}>
              <Text style={[base.suave, { width: "24%", paddingRight: 8 }]}>{f.servico}</Text>
              <Text style={{ flex: 1, paddingRight: 8 }}>{f.nome}</Text>
              <Text style={[base.mono, { width: 92, fontSize: 8.5 }]}>
                {f.telefone ? formatarTelefone(f.telefone) : "—"}
              </Text>
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
            </View>
          ))}
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
        </>
      )}
    </Secao>
  );
}

// Em pessoas: a Família Silva confirmada com 4 ocupa 4 lugares.
const ocupados = (m: Colunas["mesas"][number]) =>
  m.convidados.reduce((s, c) => s + lugaresDe(c), 0);

export function Mesas({ mesas, semMesa }: { mesas: Colunas["mesas"]; semMesa: number }) {
  const lugares = mesas.reduce((s, m) => s + m.lugares, 0);
  const sentados = mesas.reduce((s, m) => s + ocupados(m), 0);
  const resumo =
    mesas.length === 0
      ? undefined
      : `${sentados} de ${lugares} lugares ocupados` +
        (semMesa > 0 ? ` · ${semMesa} ${semMesa === 1 ? "pessoa" : "pessoas"} sem mesa` : "");

  return (
    <Secao titulo="Mesas" resumo={resumo}>
      {mesas.length === 0 ? (
        <Vazio>Nenhuma mesa cadastrada.</Vazio>
      ) : (
        mesas.map((m) => (
          <View key={m.id} style={[linha, { flexDirection: "column" }]} wrap={false}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={base.forte}>{m.nome}</Text>
              <Text
                style={[
                  base.mono,
                  { fontSize: 8.5 },
                  ocupados(m) > m.lugares
                    ? { backgroundColor: cor.grifo, paddingHorizontal: 2 }
                    : base.suave,
                ]}
              >
                {ocupados(m)}/{m.lugares}
              </Text>
            </View>
            <Text style={[{ fontSize: 9 }, m.convidados.length ? {} : base.suave]}>
              {m.convidados.length
                ? m.convidados
                    .map((c) => (lugaresDe(c) > 1 ? `${c.nome} (${lugaresDe(c)})` : c.nome))
                    .join(" · ")
                : "Ninguém sentado ainda."}
            </Text>
          </View>
        ))
      )}
    </Secao>
  );
}

export function Cronograma({
  itens,
  titulo = "Cronograma",
}: {
  itens: Colunas["cronograma"];
  titulo?: string;
}) {
  return (
    <Secao titulo={titulo}>
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
            <View key={item.id} style={linha} wrap={false}>
              <Text style={[base.mono, { width: 48, fontWeight: 500 }]}>{item.hora}</Text>
              <Text style={{ flex: 1, paddingRight: 10 }}>{item.atividade}</Text>
              <Text style={[base.suave, { width: "34%", fontSize: 9, textAlign: "right" }]}>
                {responsavel ?? ""}
              </Text>
            </View>
          );
        })
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

function Roteiro({ festa, colunas, contagem, semMesa, planta }: DadosRoteiro) {
  const data = dataDaFesta(festa.dataHora);
  const pagina = [
    base.pagina,
    { paddingTop: M.topo, paddingRight: M.direita, paddingBottom: M.base, paddingLeft: M.esquerda },
  ];
  // Planta larga vai numa página deitada, para aproveitar a folha.
  const deitada = planta ? planta.info.largura > planta.info.altura : false;

  return (
    <Document title={`Roteiro · ${festa.titulo}`} author="Elisangela Schubert" language="pt-BR">
      <Page size="A4" style={pagina}>
        <View style={base.conteudo}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={base.rotulo}>Roteiro da festa</Text>
            {/* Image do PDF, não um <img>: não existe alt aqui. */}
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={LOGO} style={{ width: 96, height: 96 * PROPORCAO_LOGO }} />
          </View>

          <View style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 14 }}>
            <Text
              style={[
                base.mono,
                { fontSize: 46, fontWeight: 500, lineHeight: 1, letterSpacing: -1.8 },
              ]}
            >
              {data.dia}
            </Text>
            <View style={{ marginLeft: 10, paddingTop: 3 }}>
              <Text
                style={{
                  fontSize: 9.5,
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                {data.mesAno}
              </Text>
              <Text style={[base.suave, { fontSize: 9.5 }]}>{data.semana}</Text>
              <Text style={[base.mono, { fontSize: 9.5 }]}>{data.hora}</Text>
            </View>
          </View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 600,
              lineHeight: 1.2,
              letterSpacing: -0.3,
              marginTop: 12,
              marginBottom: 14,
            }}
          >
            {festa.titulo}
          </Text>

          <View style={{ borderTopWidth: 0.5, borderTopColor: cor.pauta }}>
            {linhasDaFesta(festa).map((l) => (
              <LinhaDado key={l.rotulo} rotulo={l.rotulo} valor={l.valor} />
            ))}
            <LinhaDado
              rotulo="Convidados"
              valor={
                contagem.total === 0
                  ? "Nenhum cadastrado"
                  : `${contagem.total} no total · ${contagem.confirmados} confirmados · ` +
                    `${contagem.aguardando} aguardando · ${contagem.recusados} não vão`
              }
            />
          </View>

          {/* Mesma ordem das colunas da página. */}
          <Fornecedores contratacoes={colunas.contratacoes} />
          <Mesas mesas={colunas.mesas} semMesa={semMesa} />
          <Cronograma itens={colunas.cronograma} />
        </View>
        <Rodape titulo={festa.titulo} />
      </Page>

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
          <Rodape titulo={festa.titulo} />
        </Page>
      )}
    </Document>
  );
}

export function gerarPdfRoteiro(dados: DadosRoteiro) {
  return renderToBuffer(<Roteiro {...dados} />);
}
