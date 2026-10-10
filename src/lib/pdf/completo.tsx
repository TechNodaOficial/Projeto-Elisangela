import "server-only";

import { Document, Image, Page, renderToBuffer, Text, View } from "@react-pdf/renderer";

import type { ConvidadoResumo } from "@/lib/convidados/consultas";
import { confirmadasDe, descreverFaixas, faixasDe, somarFaixas } from "@/lib/convidados/contagem";
import { formatarTelefone } from "@/lib/convidados/telefone";
import { FUSO, paraCampos } from "@/lib/datas";
import type { Colunas } from "@/lib/festas/consultas";
import { ETAPAS_MENU } from "@/lib/festas/colunas-schema";
import {
  documentoVazio,
  ehSecaoObservacao,
  SECAO_FALA,
  type SecaoObservacao,
  SECOES_OBSERVACAO,
} from "@/lib/festas/observacoes";
import type { InfoImagem } from "@/lib/planta/imagem";

import { dataDaFesta, LinhaDado, linhasDaFesta, type DadosFesta } from "./comum";
import { Caixinha, DocumentoPdf, ItemMarcavel } from "./documento";
import {
  Cronograma,
  EntradasCerimonia,
  Fornecedores,
  linha,
  M,
  Mesas,
  Rodape,
  Secao,
  textoBuffet,
  TextoDoCerimonial,
  Vazio,
} from "./roteiro";
import { base, LOGO, PROPORCAO_LOGO } from "./tema";

// Arquivo completo da festa, para guardar: tudo o que existe no painel, inclusive
// convidados, padrinhos, checklists e observações. Gerado nas festas concluídas, antes da
// limpeza apagar os dados (ver src/lib/retencao).

type Imagem = { bytes: Uint8Array; info: InfoImagem };

export type DadosCompletos = {
  festa: DadosFesta;
  colunas: Colunas;
  convidados: ConvidadoResumo[];
  contagem: {
    total: number;
    confirmados: number;
    recusados: number;
    aguardando: number;
    presentes: number;
  };
  observacoes: { secao: string; conteudo: unknown }[];
  planta: Imagem | null;
  foto: Imagem | null;
  geradoEm: Date;
};

const dataHoraCurta = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO,
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);

const imagem = (img: Imagem) => ({
  data: Buffer.from(img.bytes),
  format: (img.info.tipo === "png" ? "png" : "jpg") as "png" | "jpg",
});

function ChecklistsServicos({ contratacoes }: { contratacoes: Colunas["contratacoes"] }) {
  const comItens = contratacoes.filter((c) => c.checklist.length > 0 || c.contratoNome);
  if (comItens.length === 0) return null;
  return (
    <Secao titulo="Checklists e contratos dos serviços">
      {comItens.map((c) => (
        <View key={c.id} style={[linha, { flexDirection: "column" }]} wrap={false}>
          <Text style={base.forte}>
            {c.servico.nome}
            {c.fornecedor ? ` · ${c.fornecedor.nome}` : ""}
          </Text>
          {c.contratoNome && (
            <Text style={[base.suave, { fontSize: 8.5 }]}>Contrato: {c.contratoNome}</Text>
          )}
          {c.checklist.map((i) => (
            <ItemMarcavel key={i.id} texto={i.texto} feito={i.feito} />
          ))}
        </View>
      ))}
    </Secao>
  );
}

function Menu({ menu }: { menu: Colunas["menu"] }) {
  return (
    <Secao titulo="Menu">
      {menu.length === 0 ? (
        <Vazio>Nenhum item no menu.</Vazio>
      ) : (
        ETAPAS_MENU.map((etapa) => {
          const itens = menu.filter((i) => i.etapa === etapa);
          if (itens.length === 0) return null;
          return (
            <View key={etapa} style={linha} wrap={false}>
              <Text style={[base.suave, { width: 100, fontSize: 9 }]}>{etapa}</Text>
              <Text style={{ flex: 1 }}>{itens.map((i) => i.texto).join(" · ")}</Text>
            </View>
          );
        })
      )}
    </Secao>
  );
}

// Recados que os convidados deixaram no convite, para entregar a quem fez a festa.
function Recados({ convidados }: { convidados: ConvidadoResumo[] }) {
  const comRecado = convidados.filter((c) => c.mensagem);
  if (comRecado.length === 0) return null;
  return (
    <Secao titulo="Recados dos convidados" resumo={`${comRecado.length}`}>
      {comRecado.map((c) => (
        <View key={c.id} style={[linha, { flexDirection: "column" }]} wrap={false}>
          <Text style={base.forte}>
            {c.nome}
            <Text style={[base.suave, { fontWeight: 400, fontSize: 8.5 }]}>
              {c.rsvp === "RECUSADO" ? "  ·  não foi" : ""}
            </Text>
          </Text>
          <Text style={{ fontSize: 9.5 }}>{c.mensagem}</Text>
        </View>
      ))}
    </Secao>
  );
}

function Convidados({ convidados }: { convidados: ConvidadoResumo[] }) {
  const resposta = (c: ConvidadoResumo) =>
    c.rsvp === "CONFIRMADO"
      ? `Confirmou ${confirmadasDe(c)}` +
        (c.pessoas > 1 ? ` (${descreverFaixas(faixasDe(c))})` : "")
      : c.rsvp === "RECUSADO"
        ? "Não vai"
        : "Sem resposta";
  return (
    <Secao titulo="Lista de convidados" resumo={`${convidados.length} convites`}>
      {convidados.length === 0 ? (
        <Vazio>Nenhum convidado.</Vazio>
      ) : (
        <>
          <View style={[linha, { paddingVertical: 3 }]}>
            <Text style={[base.rotulo, { flex: 1 }]}>Nome</Text>
            <Text style={[base.rotulo, { width: 38, textAlign: "right" }]}>Pessoas</Text>
            <Text style={[base.rotulo, { width: 78, paddingLeft: 8 }]}>Resposta</Text>
            <Text style={[base.rotulo, { width: 44, textAlign: "right" }]}>Entraram</Text>
            <Text style={[base.rotulo, { width: 70, paddingLeft: 8 }]}>Mesa</Text>
            <Text style={[base.rotulo, { width: 86 }]}>WhatsApp</Text>
          </View>
          {convidados.map((c) => (
            <View key={c.id} style={linha} wrap={false}>
              <Text style={{ flex: 1, paddingRight: 6, fontSize: 9 }}>{c.nome}</Text>
              <Text style={[base.mono, { width: 38, fontSize: 8.5, textAlign: "right" }]}>
                {c.pessoas}
              </Text>
              <Text style={{ width: 78, paddingLeft: 8, fontSize: 9 }}>{resposta(c)}</Text>
              <Text style={[base.mono, { width: 44, fontSize: 8.5, textAlign: "right" }]}>
                {c.entraram || "—"}
              </Text>
              <Text style={{ width: 70, paddingLeft: 8, fontSize: 9 }}>{c.mesa?.nome ?? "—"}</Text>
              <Text style={[base.mono, { width: 86, fontSize: 8 }]}>
                {c.telefone ? formatarTelefone(c.telefone) : "—"}
              </Text>
            </View>
          ))}
        </>
      )}
    </Secao>
  );
}

function Padrinhos({ padrinhos }: { padrinhos: Colunas["padrinhos"] }) {
  return (
    <Secao titulo="Padrinhos">
      {padrinhos.length === 0 ? (
        <Vazio>Nenhum padrinho.</Vazio>
      ) : (
        padrinhos.map((p) => (
          <View key={p.id} style={linha} wrap={false}>
            <Caixinha marcada={p.presenteEm !== null} />
            <Text style={[base.forte, { flex: 1 }]}>
              {p.nome}
              {p.telefone ? `  ·  ${formatarTelefone(p.telefone)}` : ""}
            </Text>
            <Text style={[base.suave, { fontSize: 9 }]}>
              {p.presenteEm ? `Chegou às ${paraCampos(p.presenteEm).hora}` : "Não marcado"}
            </Text>
          </View>
        ))
      )}
    </Secao>
  );
}

function Observacoes({ observacoes }: { observacoes: DadosCompletos["observacoes"] }) {
  const ordem = Object.keys(SECOES_OBSERVACAO) as SecaoObservacao[];
  const comTexto = observacoes
    .filter((o) => ehSecaoObservacao(o.secao) && !documentoVazio(o.conteudo))
    .sort(
      (a, b) =>
        ordem.indexOf(a.secao as SecaoObservacao) - ordem.indexOf(b.secao as SecaoObservacao),
    );
  if (comTexto.length === 0) return null;
  return (
    <Secao titulo="Observações gerais">
      {comTexto.map((o) => (
        <View key={o.secao} style={{ paddingTop: 8 }}>
          <Text style={[base.rotulo, { marginBottom: 4 }]}>
            {SECOES_OBSERVACAO[o.secao as SecaoObservacao].titulo}
          </Text>
          <DocumentoPdf doc={o.conteudo} />
        </View>
      ))}
    </Secao>
  );
}

function PaginaImagem({ titulo, img, festa }: { titulo: string; img: Imagem; festa: string }) {
  const deitada = img.info.largura > img.info.altura;
  return (
    <Page
      size="A4"
      orientation={deitada ? "landscape" : "portrait"}
      style={[
        base.pagina,
        {
          paddingTop: M.topo,
          paddingRight: M.direita,
          paddingBottom: M.base,
          paddingLeft: M.esquerda,
        },
      ]}
    >
      <View style={[base.conteudo, { flex: 1 }]}>
        <Text style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{titulo}</Text>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          {/* Image do PDF, não um <img>: não existe alt aqui. */}
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image
            src={imagem(img)}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
          />
        </View>
      </View>
      <Rodape titulo={festa} rotulo="Arquivo completo" />
    </Page>
  );
}

function Completo(d: DadosCompletos) {
  const { festa, colunas, contagem } = d;
  const data = dataDaFesta(festa.dataHora);
  const semMesa = d.convidados
    .filter((c) => !c.mesaId && c.rsvp === "CONFIRMADO")
    .reduce((s, c) => s + confirmadasDe(c), 0);

  return (
    <Document
      title={`Arquivo completo · ${festa.titulo}`}
      author="Elisangela Schubert"
      language="pt-BR"
    >
      <Page
        size="A4"
        style={[
          base.pagina,
          {
            paddingTop: M.topo,
            paddingRight: M.direita,
            paddingBottom: M.base,
            paddingLeft: M.esquerda,
          },
        ]}
      >
        <View style={base.conteudo}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
          >
            <View>
              <Text style={base.rotulo}>Arquivo completo da festa</Text>
              <Text style={[base.suave, { fontSize: 8 }]}>
                Gerado em {dataHoraCurta(d.geradoEm)}
              </Text>
            </View>
            {/* Image do PDF, não um <img>: não existe alt aqui. */}
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={LOGO} style={{ width: 96, height: 96 * PROPORCAO_LOGO }} />
          </View>

          <Text style={{ fontSize: 20, fontWeight: 600, marginTop: 14 }}>{festa.titulo}</Text>
          <Text style={[base.suave, { marginBottom: 8 }]}>
            {data.semana}, {Number(data.dia)} de {data.mesAno} · {data.hora}
          </Text>

          {linhasDaFesta(festa).map((l) => (
            <LinhaDado key={l.rotulo} rotulo={l.rotulo} valor={l.valor} />
          ))}
          <LinhaDado
            rotulo="Convidados"
            valor={
              `${contagem.total} pessoas · ${contagem.confirmados} confirmadas · ` +
              `${contagem.presentes} entraram · ${contagem.aguardando} sem resposta · ` +
              `${contagem.recusados} não foram`
            }
          />
          {contagem.confirmados > 0 && d.convidados.length > 0 && (
            <LinhaDado rotulo="Buffet" valor={textoBuffet(somarFaixas(d.convidados))} />
          )}

          <Fornecedores contratacoes={colunas.contratacoes} />
          <ChecklistsServicos contratacoes={colunas.contratacoes} />
          <Cronograma itens={colunas.cronograma} />
          <Menu menu={colunas.menu} />
          <Convidados convidados={d.convidados} />
          <Recados convidados={d.convidados} />
          <Mesas mesas={colunas.mesas} semMesa={semMesa} />
          <Cronograma itens={colunas.cerimonial} titulo="Cerimonial" />
          <TextoDoCerimonial
            texto={d.observacoes.find((o) => o.secao === SECAO_FALA)?.conteudo ?? null}
            link={festa.cerimonialLink ?? null}
          />
          <EntradasCerimonia entradas={colunas.entradas} checklist={colunas.checklistCerimonia} />
          <Padrinhos padrinhos={colunas.padrinhos} />
          <Observacoes observacoes={d.observacoes} />
        </View>
        <Rodape titulo={festa.titulo} rotulo="Arquivo completo" />
      </Page>

      {d.planta && <PaginaImagem titulo="Croqui do salão" img={d.planta} festa={festa.titulo} />}
      {d.foto && <PaginaImagem titulo="Foto da festa" img={d.foto} festa={festa.titulo} />}
    </Document>
  );
}

export function gerarPdfCompleto(dados: DadosCompletos) {
  return renderToBuffer(<Completo {...dados} />);
}
