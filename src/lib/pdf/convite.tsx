import "server-only";

import { Document, Page, renderToBuffer, Text, View } from "@react-pdf/renderer";

import { dataDaFesta, LinhaDado, LinhaDeMargem, linhasDaFesta, type DadosFesta } from "./comum";
import { base, cor } from "./tema";

// Convite para os convidados: só os dados da festa, em A5 (meia folha A4),
// bom para imprimir ou mandar pelo WhatsApp. Nada de fornecedores, valores ou mesas.
function Convite({ festa }: { festa: DadosFesta }) {
  const data = dataDaFesta(festa.dataHora);
  return (
    <Document title={`Convite · ${festa.titulo}`} author="Elisangela Eventos" language="pt-BR">
      <Page
        size="A5"
        style={[
          base.pagina,
          { paddingTop: 48, paddingRight: 36, paddingBottom: 48, paddingLeft: 64 },
        ]}
      >
        <LinhaDeMargem x={44} />
        <View style={base.conteudo}>
          <Text style={base.rotulo}>Convite</Text>

          <View style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 18 }}>
            <Text
              style={[
                base.mono,
                { fontSize: 64, fontWeight: 500, lineHeight: 1, letterSpacing: -2.5 },
              ]}
            >
              {data.dia}
            </Text>
            <View style={{ marginLeft: 12, paddingTop: 6 }}>
              <Text
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                }}
              >
                {data.mesAno}
              </Text>
              <Text style={[base.suave, { fontSize: 10.5 }]}>{data.semana}</Text>
              <View style={{ flexDirection: "row", marginTop: 2 }}>
                <Text
                  style={[
                    base.mono,
                    {
                      fontSize: 10.5,
                      backgroundColor: cor.grifo,
                      paddingHorizontal: 3,
                      paddingVertical: 0.5,
                    },
                  ]}
                >
                  {data.hora}
                </Text>
              </View>
            </View>
          </View>

          <Text
            style={{
              fontSize: 22,
              fontWeight: 600,
              lineHeight: 1.2,
              letterSpacing: -0.4,
              marginTop: 22,
              marginBottom: 22,
            }}
          >
            {festa.titulo}
          </Text>

          <View style={{ borderTopWidth: 0.5, borderTopColor: cor.pauta }}>
            {linhasDaFesta(festa, { observacoes: false }).map((l) => (
              <LinhaDado key={l.rotulo} rotulo={l.rotulo} valor={l.valor} largura={70} />
            ))}
          </View>
        </View>

        <Text
          fixed
          style={[
            base.suave,
            { position: "absolute", left: 64, right: 36, bottom: 26, fontSize: 8 },
          ]}
        >
          Elisangela Eventos
        </Text>
      </Page>
    </Document>
  );
}

export function gerarPdfConvite(festa: DadosFesta) {
  return renderToBuffer(<Convite festa={festa} />);
}
