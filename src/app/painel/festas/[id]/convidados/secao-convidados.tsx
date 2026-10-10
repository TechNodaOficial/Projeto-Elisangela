"use client";

import { FileSpreadsheet, Search, UserPlus, Users } from "lucide-react";
import { Fragment, useDeferredValue, useMemo, useOptimistic, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { ConvidadoResumo } from "@/lib/convidados/consultas";
import { somarFaixas } from "@/lib/convidados/contagem";
import { resumoDoEnvio } from "@/lib/convidados/envio";
import { FILTROS, passaNoFiltro, type Filtro } from "@/lib/convidados/etapa";
import { BANDEJA, COR_RAIA, LINHA_ALTERNADA } from "@/lib/pasteis";
import { semAcento } from "@/lib/texto";
import { cn } from "@/lib/utils";

import { adicionarConvidado, definirMesasDemarcadas } from "./actions";
import { EnvioEmSequencia } from "./envio-em-sequencia";
import { FormConvidado } from "./form-convidado";
import { ImportarConvidados } from "./importar-convidados";
import { CabecalhoLista, LinhaConvidado, type DadosFesta } from "./linha-convidado";

// A partir daqui vale mostrar a busca.
const MOSTRAR_BUSCA_A_PARTIR_DE = 8;

type Contagem = {
  total: number;
  confirmados: number;
  recusados: number;
  aguardando: number;
  presentes: number;
};

// Família confirmada que ainda não disse o nome de cada pessoa (mesas demarcadas).
export const faltamNomes = (c: ConvidadoResumo) =>
  c.rsvp === "CONFIRMADO" && c.pessoas > 1 && c.membros.length < (c.confirmadas ?? c.pessoas);

const plural = (q: number, um: string, varios: string) => (q === 1 ? um : varios);

// Números de uma linha da ficha: "168 convidados · 115 confirmaram…", cada item inteiro
// (a linha quebra depois do "·", nunca no meio de um item).
function Numeros({ itens }: { itens: (readonly [number, string] | false)[] }) {
  const visiveis = itens.filter((i): i is readonly [number, string] => i !== false);
  return visiveis.map(([valor, rotulo], i) => (
    <Fragment key={rotulo}>
      <span className="whitespace-nowrap">
        <strong className="text-foreground font-semibold tabular-nums">{valor}</strong> {rotulo}
        {i < visiveis.length - 1 && " ·"}
      </span>{" "}
    </Fragment>
  ));
}

function LinhaFicha({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="border-pauta grid grid-cols-[4.75rem_minmax(0,1fr)] gap-x-3 border-b py-1.5 @md:grid-cols-[6rem_minmax(0,1fr)]">
      <dt className="text-tinta-suave text-sm leading-6">{rotulo}</dt>
      <dd className="text-tinta-suave text-sm leading-6">{children}</dd>
    </div>
  );
}

// Ficha do topo da aba: tudo o que ela confere de relance, uma linha por assunto.
// Respostas, o que passar para o buffet, como vai o envio e a demarcação das mesas.
function Ficha({
  festaId,
  convidados,
  contagem,
  mesasDemarcadas,
}: {
  festaId: string;
  convidados: ConvidadoResumo[];
  contagem: Contagem;
  mesasDemarcadas: boolean;
}) {
  const f = somarFaixas(convidados);
  const criancas = f.criancas4a11 + f.criancas0a3;
  const envio = resumoDoEnvio(convidados);
  const semNomes = convidados.filter(faltamNomes).length;
  const [demarcadas, setDemarcadas] = useOptimistic(mesasDemarcadas);
  const [, iniciar] = useTransition();

  return (
    <dl className="border-pauta mt-3 border-t">
      {contagem.total > 0 && (
        <LinhaFicha rotulo="Respostas">
          <Numeros
            itens={[
              [contagem.total, plural(contagem.total, "convidado", "convidados")],
              [
                contagem.confirmados,
                criancas > 0
                  ? `confirmaram (${criancas} ${plural(criancas, "criança", "crianças")})`
                  : "confirmaram",
              ],
              [contagem.recusados, "não vão"],
              [contagem.aguardando, "aguardando"],
              contagem.presentes > 0 && [contagem.presentes, "chegaram"],
            ]}
          />
        </LinhaFicha>
      )}
      {contagem.confirmados > 0 && (
        <LinhaFicha rotulo="Buffet">
          <Numeros
            itens={[
              [f.adultos, plural(f.adultos, "adulto", "adultos")],
              [f.criancas4a11, "de 4 a 11 anos"],
              [f.criancas0a3, "de 0 a 3 anos"],
            ]}
          />
          {f.semIdade > 0 && (
            <span className="whitespace-nowrap">
              · <span className="grifo text-foreground">{f.semIdade} sem idade informada</span>
            </span>
          )}
        </LinhaFicha>
      )}
      {(envio.enviados > 0 || envio.semWhatsApp > 0) && (
        <LinhaFicha rotulo="Envio">
          <Numeros
            itens={[
              [envio.enviados, plural(envio.enviados, "enviado", "enviados")],
              [envio.abriram, "abriram o link"],
              [envio.responderam, "responderam"],
              envio.semWhatsApp > 0 && [
                envio.semWhatsApp,
                plural(envio.semWhatsApp, "sem WhatsApp", "sem WhatsApp"),
              ],
            ]}
          />
          {envio.semWhatsApp > 0 && (
            <span className="block text-xs leading-snug">
              Sem WhatsApp: copie o link no menu ⋯ do convidado e mande por onde preferir.
            </span>
          )}
        </LinhaFicha>
      )}
      <LinhaFicha rotulo="Mesas">
        <span className="flex items-start justify-between gap-3">
          <label htmlFor="mesas-demarcadas" className="cursor-pointer">
            <span className="text-foreground">Lugar marcado</span>
            {" · "}
            {demarcadas
              ? "o convite pede o nome completo de cada pessoa"
              : "ligue se houver plaquinha com o nome"}
          </label>
          <Switch
            id="mesas-demarcadas"
            className="mt-0.5"
            checked={demarcadas}
            onCheckedChange={(v) =>
              iniciar(async () => {
                setDemarcadas(v);
                await definirMesasDemarcadas(festaId, v);
              })
            }
          />
        </span>
        {demarcadas && semNomes > 0 && (
          <span className="block">
            <span className="grifo text-foreground">
              {semNomes} {plural(semNomes, "família confirmou", "famílias confirmaram")} sem os
              nomes
            </span>{" "}
            · ao abrir o convite de novo, aparece o pedido para completar.
          </span>
        )}
      </LinhaFicha>
    </dl>
  );
}

// Filtros por etapa ("Não enviados", "Confirmaram"…), com quantos convites há em cada um.
// Os vazios somem, menos "Todos" e o que estiver escolhido.
function Filtros({
  convidados,
  filtro,
  aoEscolher,
}: {
  convidados: ConvidadoResumo[];
  filtro: Filtro;
  aoEscolher: (f: Filtro) => void;
}) {
  const opcoes = FILTROS.map((f) => ({
    ...f,
    quantos: convidados.filter((c) => passaNoFiltro(c, f.id)).length,
  })).filter((f) => f.id === "todos" || f.id === filtro || f.quantos > 0);
  return (
    <div
      role="group"
      aria-label="Mostrar convidados"
      className="-mx-1 min-w-0 overflow-x-auto px-1 pb-1"
    >
      <div className="bg-muted flex w-max gap-0.5 rounded-lg p-0.5">
        {opcoes.map((f) => {
          const ativo = f.id === filtro;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={ativo}
              onClick={() => aoEscolher(f.id)}
              className={cn(
                "focus-visible:outline-ring flex h-9 items-center gap-1.5 rounded-md px-3 text-sm whitespace-nowrap focus-visible:outline-2",
                ativo
                  ? "bg-card text-foreground font-semibold shadow-sm"
                  : "text-tinta-suave hover:text-foreground hover:bg-card/60",
              )}
            >
              {f.rotulo}
              <span className="font-mono text-xs">{f.quantos}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SecaoConvidados({
  festaId,
  festa,
  mesasDemarcadas,
  convidados,
  contagem,
  origem,
  aviso,
  avisoPlanilha,
}: {
  festaId: string;
  festa: DadosFesta;
  mesasDemarcadas: boolean;
  convidados: ConvidadoResumo[];
  contagem: Contagem;
  origem: string;
  // Ex.: quando os dados serão apagados (LGPD), em festas concluídas.
  aviso?: string;
  // Volta do Google Planilhas quando não deu certo (?planilha=...).
  avisoPlanilha?: string;
}) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [adicionando, setAdicionando] = useState(false);
  const recolherForm = convidados.length > 0 && !adicionando;
  // Para a lista colada avisar quem já está cadastrado.
  const cadastrados = useMemo(
    () => convidados.map((c) => ({ nome: c.nome, telefone: c.telefone })),
    [convidados],
  );
  const termo = semAcento(useDeferredValue(busca).trim());
  const visiveis = convidados.filter(
    (c) =>
      passaNoFiltro(c, filtro) &&
      (!termo || semAcento(c.nome).includes(termo) || c.telefone?.includes(termo)),
  );

  return (
    <section
      id="convidados"
      aria-labelledby="titulo-convidados"
      className="folha @container pt-(--linha) pr-5 pb-(--linha) pl-[calc(var(--margem)+0.875rem)] leading-(--linha)"
    >
      {/* Cabeçalho: título e a exportação, que é uma ação de consulta (não do dia a dia). */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <h2 id="titulo-convidados" className="text-lg font-semibold">
          Convidados
        </h2>
        {convidados.length > 0 && (
          // Abre noutra aba: a autorização do Google e a planilha pronta, sem tirar ela daqui.
          <Button
            asChild
            variant="ghost"
            className="bg-pastel-menta hover:bg-pastel-menta h-9 px-3 text-sm font-medium transition-[filter] hover:brightness-95"
          >
            <a
              href={`/painel/festas/${festaId}/convidados/planilha`}
              target="_blank"
              rel="noopener"
            >
              <FileSpreadsheet aria-hidden strokeWidth={1.75} />
              Abrir no Google Planilhas
            </a>
          </Button>
        )}
      </div>
      {avisoPlanilha && (
        <p role="alert" className="text-destructive text-sm leading-snug">
          {avisoPlanilha}
        </p>
      )}
      {aviso && <p className="text-tinta-suave text-sm leading-(--linha)">{aviso}</p>}

      <Ficha
        festaId={festaId}
        convidados={convidados}
        contagem={contagem}
        mesasDemarcadas={mesasDemarcadas}
      />

      {convidados.length > 0 && (
        <EnvioEmSequencia convidados={convidados} festa={festa} origem={origem} />
      )}

      {/* No celular, com a lista já começada, o formulário (três campos empilhados) fica
          atrás de um botão, para a lista aparecer logo. No computador ele é uma linha só. */}
      {recolherForm && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setAdicionando(true)}
          className="bg-card mt-(--linha) h-11 w-full font-medium @xl:hidden"
        >
          <UserPlus aria-hidden strokeWidth={1.75} />
          Adicionar convidado
        </Button>
      )}
      <FormConvidado
        acao={adicionarConvidado.bind(null, festaId)}
        rotuloEnviar="Adicionar"
        rotuloEnviando="Adicionando…"
        prefixo="novo"
        className={cn("mt-(--linha)", recolherForm && "hidden @xl:flex")}
      />
      <ImportarConvidados festaId={festaId} jaCadastrados={cadastrados} />

      {convidados.length === 0 ? (
        <div className="text-tinta-suave mt-(--linha) flex items-start gap-3 text-sm">
          <Users aria-hidden className="mt-1.5 size-4 shrink-0" strokeWidth={1.75} />
          <p className="leading-(--linha)">
            Nenhum convidado ainda. Cada convite (uma pessoa ou uma família inteira) recebe um link
            próprio para confirmar a presença e um QR Code só; envie pelo botão de WhatsApp ou copie
            o link.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-(--linha) flex flex-col gap-2">
            <Filtros convidados={convidados} filtro={filtro} aoEscolher={setFiltro} />
            {convidados.length >= MOSTRAR_BUSCA_A_PARTIR_DE && (
              <div className="relative @md:max-w-xs">
                <Search
                  aria-hidden
                  className="text-tinta-suave pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                  strokeWidth={1.75}
                />
                <Input
                  type="search"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por nome ou telefone"
                  aria-label="Buscar convidado"
                  className="bg-card h-9 pl-9"
                />
              </div>
            )}
          </div>

          <div className="mt-3">
            <CabecalhoLista />
            <ul className={cn(BANDEJA, COR_RAIA.recepcao)} aria-label="Lista de convidados">
              {visiveis.map((convidado) => (
                <LinhaConvidado
                  className={cn(LINHA_ALTERNADA, "px-2")}
                  key={convidado.id}
                  convidado={convidado}
                  festa={festa}
                  origem={origem}
                />
              ))}
            </ul>
          </div>
          {visiveis.length === 0 && (
            <p className="text-tinta-suave text-sm">
              {termo
                ? `Nenhum convidado com “${busca.trim()}”${filtro !== "todos" ? " neste filtro" : ""}.`
                : "Nenhum convidado neste filtro."}{" "}
              {filtro !== "todos" && (
                <button
                  type="button"
                  onClick={() => setFiltro("todos")}
                  className="text-foreground focus-visible:outline-ring rounded-sm underline underline-offset-4 focus-visible:outline-2"
                >
                  Ver todos
                </button>
              )}
            </p>
          )}
        </>
      )}
    </section>
  );
}
