"use client";

import { Pencil, X } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { descreverFaixas, faixasDe, type FaixaIdade } from "@/lib/convidados/contagem";
import { erroDoNome, TAMANHO_MAXIMO_NOME } from "@/lib/convites/membros";
import type { FaseConvite } from "@/lib/convites/prazo";
import { cn } from "@/lib/utils";

import { responderConvite, type PessoaResposta } from "./actions";

type Estado = "aberto" | "confirmado" | "recusado";

// Botões grandes, para o polegar: o convidado quase sempre está no celular.
// 48px + 4px acima e abaixo = duas pautas, para a folha seguir alinhada.
const grande = "my-1 h-12 rounded-lg text-[0.9375rem]";

function Nota({ children }: { children: React.ReactNode }) {
  return <p className="text-tinta-suave text-sm leading-(--linha)">{children}</p>;
}

// Família: quantas pessoas vão, de 1 até `pessoas` (o tamanho do convite, ou o já
// confirmado quando só dá para diminuir). Botões grandes, um por número.
function Quantas({
  pessoas,
  valor,
  aoMudar,
}: {
  pessoas: number;
  valor: number;
  aoMudar: (n: number) => void;
}) {
  return (
    <div role="group" aria-labelledby="quantas" className="mt-1">
      <p id="quantas" className="text-sm leading-(--linha)">
        Quantas pessoas vão?
      </p>
      <div className="flex flex-wrap gap-2 py-1">
        {Array.from({ length: pessoas }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={n === valor}
            onClick={() => aoMudar(n)}
            className={cn(
              "focus-visible:outline-ring size-12 rounded-lg border font-mono text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-2",
              n === valor ? "bg-primary text-primary-foreground border-primary" : "bg-card",
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

const OPCOES_IDADE: { faixa: FaixaIdade; rotulo: string }[] = [
  { faixa: "adulto", rotulo: "Adulto" },
  { faixa: "4a11", rotulo: "4 a 11" },
  { faixa: "0a3", rotulo: "0 a 3" },
];

const ROTULO_CURTO: Record<FaixaIdade, string> = { adulto: "", "4a11": "4 a 11", "0a3": "0 a 3" };

const pessoaNova = (faixa: FaixaIdade = "adulto"): PessoaResposta => ({ faixa, nome: "" });

// Faixas guardadas (quantas crianças de cada) → uma pessoa por lugar: adultos primeiro.
function pessoasDasContagens(n: number, criancas4a11: number | null, criancas0a3: number | null) {
  const c0a3 = Math.min(criancas0a3 ?? 0, n);
  const c4a11 = Math.min(criancas4a11 ?? 0, n - c0a3);
  return [
    ...Array.from({ length: n - c4a11 - c0a3 }, () => pessoaNova("adulto")),
    ...Array.from({ length: c4a11 }, () => pessoaNova("4a11")),
    ...Array.from({ length: c0a3 }, () => pessoaNova("0a3")),
  ];
}

// Mudou o número de pessoas: mantém quem continua e completa com adultos sem nome.
const ajustarPessoas = (lista: PessoaResposta[], n: number) =>
  lista.length >= n
    ? lista.slice(0, n)
    : [...lista, ...Array.from({ length: n - lista.length }, () => pessoaNova())];

// Cada pessoa da família: a idade, pela faixa que o buffet cobra (três botões grandes, que
// funcionam como opções de rádio) e, com mesas demarcadas, o nome completo para a plaquinha.
function Pessoas({
  lista,
  pedirNomes,
  aoMudar,
}: {
  lista: PessoaResposta[];
  pedirNomes: boolean;
  aoMudar: (l: PessoaResposta[]) => void;
}) {
  const mudar = (i: number, p: Partial<PessoaResposta>) =>
    aoMudar(lista.map((atual, j) => (j === i ? { ...atual, ...p } : atual)));

  return (
    <fieldset className="mt-1">
      <legend className="text-sm leading-(--linha)">
        {pedirNomes ? "Nome completo e idade de cada pessoa" : "Idade de cada pessoa"}
      </legend>
      <p className="text-tinta-suave text-xs leading-snug">
        {pedirNomes && "As mesas têm lugar marcado com o nome de cada um. "}
        Para crianças, escolha 4 a 11 anos ou 0 a 3 anos.
      </p>
      <div className={cn("flex flex-col py-1.5", pedirNomes ? "gap-3" : "gap-1.5")}>
        {lista.map((pessoa, i) => {
          const botoes = (
            <div
              role="radiogroup"
              aria-label={`Idade da pessoa ${i + 1}`}
              className="grid flex-1 grid-cols-3 gap-1.5"
            >
              {OPCOES_IDADE.map((o) => (
                <button
                  key={o.faixa}
                  type="button"
                  role="radio"
                  aria-checked={pessoa.faixa === o.faixa}
                  onClick={() => mudar(i, { faixa: o.faixa })}
                  className={cn(
                    "focus-visible:outline-ring h-11 rounded-lg border text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2",
                    pessoa.faixa === o.faixa
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card",
                  )}
                >
                  {o.rotulo}
                </button>
              ))}
            </div>
          );
          return pedirNomes ? (
            <div key={i} className="flex flex-col gap-1.5">
              <label htmlFor={`pessoa-${i}`} className="text-tinta-suave text-sm">
                Pessoa {i + 1}
              </label>
              <Input
                id={`pessoa-${i}`}
                value={pessoa.nome}
                onChange={(e) => mudar(i, { nome: e.target.value })}
                placeholder="Nome e sobrenome"
                autoComplete="off"
                autoCapitalize="words"
                maxLength={TAMANHO_MAXIMO_NOME}
                aria-invalid={!!pessoa.nome.trim() && !!erroDoNome(pessoa.nome)}
                className="h-11 text-base"
              />
              {botoes}
            </div>
          ) : (
            <div key={i} className="flex items-center gap-2">
              <span className="text-tinta-suave w-16 shrink-0 text-sm">Pessoa {i + 1}</span>
              {botoes}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

// "Ana Silva · João Silva (4 a 11) · Pedro Silva (0 a 3)"
const listarNomes = (lista: PessoaResposta[]) =>
  lista
    .map((p) => (p.faixa === "adulto" ? p.nome : `${p.nome} (${ROTULO_CURTO[p.faixa]})`))
    .join(" · ");

export function Resposta({
  token,
  estado,
  pessoas,
  confirmadas,
  criancas4a11,
  criancas0a3,
  membros,
  pedirNomes: mesasDemarcadas,
  fase,
  prazo,
}: {
  token: string;
  estado: Estado;
  pessoas: number;
  confirmadas: number;
  // Crianças já informadas (vazio: confirmou antes de o convite perguntar as idades).
  criancas4a11: number | null;
  criancas0a3: number | null;
  // Nomes já informados, pessoa por pessoa (só com mesas demarcadas).
  membros: PessoaResposta[];
  // Mesas com lugar marcado: pede o nome completo de cada pessoa da família.
  pedirNomes: boolean;
  // Ver src/lib/convites/prazo.ts. "encerrado" não chega aqui (a página não mostra a resposta).
  fase: FaseConvite;
  // Último dia para responder ou mudar, como "10/12".
  prazo: string;
}) {
  const [enviando, iniciar] = useTransition();
  const [erro, setErro] = useState<string>();
  const [confirmandoRecusa, setConfirmandoRecusa] = useState(false);
  const familia = pessoas > 1;
  const pedirNomes = familia && mesasDemarcadas;
  const quantasSalvas = estado === "confirmado" ? confirmadas : pessoas;
  const [quantas, setQuantasSo] = useState(quantasSalvas);
  const temNomes = estado === "confirmado" && membros.length === confirmadas;
  const pessoasSalvas = () =>
    temNomes
      ? membros
      : estado === "confirmado"
        ? pessoasDasContagens(confirmadas, criancas4a11, criancas0a3)
        : pessoasDasContagens(pessoas, 0, 0);
  const [lista, setLista] = useState<PessoaResposta[]>(pessoasSalvas);
  const [mudandoQuantas, setMudandoQuantas] = useState(false);
  // Confirmou antes de o convite perguntar idades (ou nomes, se a mesa virou demarcada).
  const semIdades = familia && estado === "confirmado" && criancas4a11 === null;
  const semNomes = pedirNomes && estado === "confirmado" && !temNomes;
  const falta = semNomes || semIdades;

  function setQuantas(n: number) {
    setQuantasSo(n);
    setLista((l) => ajustarPessoas(l, n));
  }

  // Quantos, idades e nomes, como estavam salvos (botão Voltar).
  function desfazer() {
    setQuantasSo(quantasSalvas);
    setLista(pessoasSalvas());
  }

  const perguntas = (maximo: number) => (
    <>
      <Quantas pessoas={maximo} valor={quantas} aoMudar={setQuantas} />
      <Pessoas lista={lista} pedirNomes={pedirNomes} aoMudar={setLista} />
    </>
  );
  // Últimos 10 dias: quem confirmou só pode desistir ou diminuir.
  const travado = fase === "travado";

  function responder(resposta: "CONFIRMADO" | "RECUSADO") {
    setErro(undefined);
    // Nome faltando: avisa aqui mesmo, sem ir ao servidor.
    const erroNome =
      resposta === "CONFIRMADO" && pedirNomes
        ? lista.map((p) => erroDoNome(p.nome)).find(Boolean)
        : null;
    if (erroNome) {
      setErro(erroNome);
      return;
    }
    iniciar(async () => {
      const r = await responderConvite(
        token,
        resposta,
        resposta === "CONFIRMADO" ? quantas : 1,
        familia && resposta === "CONFIRMADO" ? lista : [],
      );
      if (r.erro) setErro(r.erro);
      else {
        setConfirmandoRecusa(false);
        setMudandoQuantas(false);
      }
    });
  }

  const mensagemErro = erro && (
    <p role="alert" className="text-destructive text-sm leading-(--linha)">
      {erro}
    </p>
  );

  if (estado === "aberto" && fase !== "aberto") {
    return (
      <section aria-labelledby="prazo-encerrado" className="mt-(--linha)">
        <h2 id="prazo-encerrado" className="text-lg font-semibold">
          Prazo para responder encerrado
        </h2>
        <Nota>A confirmação ia até {prazo}. Se ainda quiser ir, fale com a Elisangela.</Nota>
      </section>
    );
  }

  if (estado === "aberto") {
    return (
      <section aria-labelledby="pergunta" className="mt-(--linha)">
        <h2 id="pergunta" className="text-lg font-semibold">
          {familia ? "Vocês vão?" : "Você vai?"}
        </h2>
        <Nota>Responda até {prazo}.</Nota>
        {familia && perguntas(pessoas)}
        <div className="grid grid-cols-2 gap-3">
          <Button className={grande} disabled={enviando} onClick={() => responder("CONFIRMADO")}>
            {familia ? `Vamos (${quantas})` : "Vou"}
          </Button>
          <Button
            variant="outline"
            className={cn(grande, "bg-card")}
            disabled={enviando}
            onClick={() => responder("RECUSADO")}
          >
            {familia ? "Não poderemos ir" : "Não poderei ir"}
          </Button>
        </div>
        {enviando && (
          <p role="status" className="text-tinta-suave text-sm leading-(--linha)">
            Enviando resposta…
          </p>
        )}
        {mensagemErro}
      </section>
    );
  }

  if (estado === "recusado" && travado) {
    return (
      <section aria-label="Mudar resposta" className="mt-(--linha)">
        <Nota>
          O prazo para mudar a resposta terminou em {prazo}. Se precisar, fale com a Elisangela.
        </Nota>
      </section>
    );
  }

  if (estado === "recusado") {
    return (
      // Quem recusou vê só o convite para mudar de ideia; o formulário (quantos e idades)
      // abre quando ele pede, para não dominar a tela de quem não vai.
      <section aria-label="Mudar resposta" className="mt-(--linha)">
        <Nota>Mudou de ideia? Dá para confirmar até {prazo}.</Nota>
        {familia && !mudandoQuantas ? (
          <Button
            variant="outline"
            className={cn(grande, "bg-card w-full")}
            onClick={() => setMudandoQuantas(true)}
          >
            Quero confirmar presença
          </Button>
        ) : (
          <>
            {familia && perguntas(pessoas)}
            <div className={cn("grid gap-3", familia && "grid-cols-2")}>
              {familia && (
                <Button
                  variant="outline"
                  className={cn(grande, "bg-card")}
                  disabled={enviando}
                  onClick={() => {
                    desfazer();
                    setMudandoQuantas(false);
                  }}
                >
                  Voltar
                </Button>
              )}
              <Button
                className={grande}
                disabled={enviando}
                onClick={() => responder("CONFIRMADO")}
              >
                {enviando ? "Enviando…" : familia ? `Vamos (${quantas})` : "Vou à festa"}
              </Button>
            </div>
          </>
        )}
        {mensagemErro}
      </section>
    );
  }

  // Confirmado: desistir apaga o QR, então pede uma segunda confirmação na própria folha.
  return (
    <section aria-label="Mudar resposta" className="mt-(--linha)">
      {familia && mudandoQuantas ? (
        <div>
          {perguntas(travado ? confirmadas : pessoas)}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className={cn(grande, "bg-card")}
              disabled={enviando}
              onClick={() => {
                desfazer();
                setMudandoQuantas(false);
              }}
            >
              Voltar
            </Button>
            <Button className={grande} disabled={enviando} onClick={() => responder("CONFIRMADO")}>
              {enviando ? "Enviando…" : "Salvar"}
            </Button>
          </div>
        </div>
      ) : confirmandoRecusa ? (
        <div role="group" aria-labelledby="aviso-recusa">
          <p id="aviso-recusa" className="text-sm leading-(--linha)">
            Seu QR Code de entrada deixa de valer. Confirma que não vai?
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className={cn(grande, "bg-card")}
              disabled={enviando}
              onClick={() => setConfirmandoRecusa(false)}
            >
              Voltar
            </Button>
            <Button
              className={cn(
                grande,
                "bg-destructive hover:bg-destructive/90 text-primary-foreground",
              )}
              disabled={enviando}
              onClick={() => responder("RECUSADO")}
            >
              {enviando ? "Enviando…" : "Não vou"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-start">
          {familia && !falta && (
            <Nota>
              <span className="text-foreground font-medium">Quem vai:</span>{" "}
              {pedirNomes
                ? listarNomes(membros)
                : descreverFaixas(
                    faixasDe({
                      rsvp: "CONFIRMADO",
                      pessoas,
                      confirmadas,
                      criancas4a11,
                      criancas0a3,
                    }),
                  )}
            </Nota>
          )}
          {falta && (
            <p className="mt-1 text-sm leading-(--linha) font-medium">
              <span className="grifo">
                {semNomes
                  ? "Falta o nome completo de cada pessoa (as mesas têm lugar marcado)."
                  : "Falta dizer a idade de cada pessoa."}
              </span>
            </p>
          )}
          {/* Mudar a resposta: um bloco à parte, com botões de verdade (não links miúdos),
              para quem volta ao convite justamente para mudar algo. */}
          <div className="bg-muted/70 mt-(--linha) w-full rounded-lg px-4 py-3">
            <h2 className="font-semibold">Mudou alguma coisa?</h2>
            <p className="text-tinta-suave text-sm leading-snug">
              {travado
                ? "Faltam menos de 10 dias: dá só para diminuir o número de pessoas, corrigir idades ou avisar que não vai."
                : `Dá para mudar a resposta até ${prazo}.`}
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {familia && (
                <Button
                  variant={falta ? "default" : "outline"}
                  className={cn("h-12 w-full rounded-lg text-[0.9375rem]", !falta && "bg-card")}
                  onClick={() => setMudandoQuantas(true)}
                >
                  <Pencil aria-hidden strokeWidth={1.75} />
                  {falta
                    ? semNomes
                      ? "Informar os nomes"
                      : "Informar as idades"
                    : travado
                      ? "Diminuir pessoas ou corrigir idades"
                      : pedirNomes
                        ? "Alterar pessoas, nomes ou idades"
                        : "Alterar pessoas ou idades"}
                </Button>
              )}
              <Button
                variant="outline"
                className="bg-card text-destructive hover:text-destructive h-12 w-full rounded-lg text-[0.9375rem]"
                onClick={() => setConfirmandoRecusa(true)}
              >
                <X aria-hidden strokeWidth={1.75} />
                {familia ? "Não vamos mais poder ir" : "Não vou mais poder ir"}
              </Button>
            </div>
          </div>
        </div>
      )}
      {mensagemErro}
    </section>
  );
}
