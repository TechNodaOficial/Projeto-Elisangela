import "server-only";

import { Text, View } from "@react-pdf/renderer";

import { base, cor } from "./tema";

// Converte a folha de observações (JSON do editor Tiptap) em blocos do PDF: parágrafos,
// títulos, listas (com marcador, numeradas e de tarefas), citação e linha divisória.
// Negrito, sublinhado e riscado viram estilo; itálico fica normal (a fonte não tem itálico).

type No = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type?: string }[];
  content?: No[];
};

function Trechos({ nos }: { nos: No[] | undefined }) {
  return (
    <>
      {(nos ?? []).map((n, i) => {
        if (n.type === "hardBreak") return <Text key={i}>{"\n"}</Text>;
        if (n.type !== "text" || !n.text) return null;
        const marcas = new Set((n.marks ?? []).map((m) => m.type));
        const decoracao = [
          marcas.has("underline") && "underline",
          marcas.has("strike") && "line-through",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <Text
            key={i}
            style={{
              fontWeight: marcas.has("bold") ? 600 : undefined,
              textDecoration: (decoracao || undefined) as "underline" | undefined,
            }}
          >
            {n.text}
          </Text>
        );
      })}
    </>
  );
}

// Caixinha da lista de tarefas, desenhada (a fonte não tem os símbolos ☐ ☑).
export function Caixinha({ marcada }: { marcada: boolean }) {
  return (
    <View
      style={{
        width: 8,
        height: 8,
        marginTop: 2,
        marginRight: 6,
        borderWidth: 0.75,
        borderColor: cor.tinta,
        borderRadius: 1.5,
        backgroundColor: marcada ? cor.tinta : undefined,
      }}
    />
  );
}

function Blocos({ nos, nivel = 0 }: { nos: No[] | undefined; nivel?: number }) {
  return (
    <>
      {(nos ?? []).map((n, i) => {
        switch (n.type) {
          case "paragraph":
            return (
              <Text key={i} style={{ marginBottom: 4, lineHeight: 1.45 }}>
                <Trechos nos={n.content} />
              </Text>
            );
          case "heading":
            return (
              <Text
                key={i}
                minPresenceAhead={30}
                style={{
                  fontSize: n.attrs?.level === 1 ? 13 : 11.5,
                  fontWeight: 600,
                  marginTop: 6,
                  marginBottom: 4,
                }}
              >
                <Trechos nos={n.content} />
              </Text>
            );
          case "bulletList":
          case "orderedList":
          case "taskList": {
            const inicio = Number(n.attrs?.start ?? 1);
            return (
              <View key={i} style={{ marginBottom: 4, marginLeft: nivel ? 12 : 0 }}>
                {(n.content ?? []).map((item, j) => (
                  <View key={j} style={{ flexDirection: "row" }} wrap={false}>
                    {n.type === "taskList" ? (
                      <Caixinha marcada={item.attrs?.checked === true} />
                    ) : (
                      <Text style={{ width: 14 }}>
                        {n.type === "orderedList" ? `${inicio + j}.` : "•"}
                      </Text>
                    )}
                    <View style={{ flex: 1 }}>
                      <Blocos nos={item.content} nivel={nivel + 1} />
                    </View>
                  </View>
                ))}
              </View>
            );
          }
          case "blockquote":
            return (
              <View
                key={i}
                style={{
                  borderLeftWidth: 2,
                  borderLeftColor: cor.borda,
                  paddingLeft: 8,
                  marginBottom: 4,
                }}
              >
                <View style={base.suave}>
                  <Blocos nos={n.content} nivel={nivel} />
                </View>
              </View>
            );
          case "horizontalRule":
            return (
              <View
                key={i}
                style={{ borderTopWidth: 0.5, borderTopColor: cor.borda, marginVertical: 8 }}
              />
            );
          default:
            // Algo que o PDF não conhece: mostra pelo menos o texto de dentro.
            return n.content ? <Blocos key={i} nos={n.content} nivel={nivel} /> : null;
        }
      })}
    </>
  );
}

export function DocumentoPdf({ doc }: { doc: unknown }) {
  const raiz = doc as No;
  return <Blocos nos={raiz?.content} />;
}

// Linha de checklist: caixinha + texto.
export function ItemMarcavel({ texto, feito }: { texto: string; feito: boolean }) {
  return (
    <View style={{ flexDirection: "row", paddingVertical: 1.5 }} wrap={false}>
      <Caixinha marcada={feito} />
      <Text style={[{ flex: 1, fontSize: 9 }, feito ? base.suave : {}]}>{texto}</Text>
    </View>
  );
}
