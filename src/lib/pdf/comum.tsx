import "server-only";

import { Text, View } from "@react-pdf/renderer";

import { FUSO, partesData } from "@/lib/datas";

import { base, cor } from "./tema";

export type DadosFesta = {
  titulo: string;
  dataHora: Date;
  localNome: string;
  endereco: string;
  traje: string | null;
  observacoes: string | null;
  // Link do documento com a fala do cerimonial (só os PDFs que mostram a cerimônia).
  cerimonialLink?: string | null;
};

export function dataDaFesta(dataHora: Date) {
  const p = partesData(dataHora);
  const mesLongo = new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, month: "long" }).format(
    dataHora,
  );
  const semana = p.extenso.split(",")[0];
  return {
    dia: p.dia,
    mesAno: `${mesLongo} ${p.ano}`,
    semana: semana.charAt(0).toUpperCase() + semana.slice(1),
    hora: p.hora,
    extenso: p.extenso,
  };
}

// Rótulo à esquerda, valor à direita, com o fio da pauta embaixo.
export function LinhaDado({
  rotulo,
  valor,
  largura = 78,
}: {
  rotulo: string;
  valor: string | null;
  largura?: number;
}) {
  return (
    <View
      wrap={false}
      style={{
        flexDirection: "row",
        paddingVertical: 5,
        borderBottomWidth: 0.5,
        borderBottomColor: cor.pauta,
      }}
    >
      <Text style={[base.suave, { width: largura, fontSize: 9, paddingTop: 0.5 }]}>{rotulo}</Text>
      <Text style={[{ flex: 1 }, valor ? {} : base.suave]}>{valor ?? "—"}</Text>
    </View>
  );
}

// Dados da festa que aparecem nos PDFs (traje e observações só quando existem).
// As observações podem ser anotações internas, por isso o convite não as mostra.
export function linhasDaFesta(festa: DadosFesta, { observacoes = true } = {}) {
  return [
    { rotulo: "Local", valor: festa.localNome },
    { rotulo: "Endereço", valor: festa.endereco },
    ...(festa.traje ? [{ rotulo: "Traje", valor: festa.traje }] : []),
    ...(observacoes && festa.observacoes
      ? [{ rotulo: "Observações", valor: festa.observacoes }]
      : []),
  ];
}
