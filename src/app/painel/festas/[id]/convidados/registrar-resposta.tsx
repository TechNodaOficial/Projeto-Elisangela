"use client";

import { useState, useTransition } from "react";

import { ConfirmarExclusao } from "@/components/confirmar-exclusao";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ConvidadoResumo } from "@/lib/convidados/consultas";
import type { FaixaIdade } from "@/lib/convidados/contagem";
import { DO_BANCO, erroDoNome, TAMANHO_MAXIMO_NOME } from "@/lib/convites/membros";
import { ajustarPessoas, pessoasDasContagens, type PessoaResposta } from "@/lib/convites/resposta";
import { cn } from "@/lib/utils";

import { registrarResposta } from "./actions";

const OPCOES_IDADE: { faixa: FaixaIdade; rotulo: string }[] = [
  { faixa: "adulto", rotulo: "Adulto" },
  { faixa: "4a11", rotulo: "4 a 11" },
  { faixa: "0a3", rotulo: "0 a 3" },
];

// Botão de escolha (vai/não vai, quantas, idade): preenchido quando escolhido.
const escolha = (ativo: boolean) =>
  cn(
    "focus-visible:outline-ring rounded-md border text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2",
    ativo ? "bg-primary text-primary-foreground border-primary" : "bg-background",
  );

// Resposta que o convidado deu a ela por telefone (ou pessoalmente), registrada na própria
// linha. Pergunta o mesmo que o convite (quantos, idades, nomes), mas sem os prazos dele.
export function RegistrarResposta({
  convidado,
  mesasDemarcadas,
  aoFechar,
}: {
  convidado: ConvidadoResumo;
  mesasDemarcadas: boolean;
  aoFechar: () => void;
}) {
  const { pessoas, rsvp, confirmadas, criancas4a11, criancas0a3, membros } = convidado;
  const familia = pessoas > 1;
  const pedirNomes = familia && mesasDemarcadas;
  const confirmou = rsvp === "CONFIRMADO";
  const quantasSalvas = confirmou ? (confirmadas ?? pessoas) : pessoas;

  const [resposta, setResposta] = useState<"CONFIRMADO" | "RECUSADO" | null>(
    rsvp === "PENDENTE" ? null : rsvp,
  );
  const [quantas, setQuantasSo] = useState(quantasSalvas);
  const [lista, setLista] = useState<PessoaResposta[]>(() =>
    confirmou && membros.length === quantasSalvas
      ? membros.map((m) => ({ nome: m.nome, faixa: DO_BANCO[m.faixa] }))
      : confirmou
        ? pessoasDasContagens(quantasSalvas, criancas4a11, criancas0a3)
        : pessoasDasContagens(pessoas, 0, 0),
  );
  const [erro, setErro] = useState<string>();
  const [apagando, setApagando] = useState(false);
  const [salvando, iniciar] = useTransition();
  const id = `resposta-${convidado.id}`;

  function setQuantas(n: number) {
    setQuantasSo(n);
    setLista((l) => ajustarPessoas(l, n));
  }
  const mudar = (i: number, p: Partial<PessoaResposta>) =>
    setLista((l) => l.map((atual, j) => (j === i ? { ...atual, ...p } : atual)));

  function salvar(r: "CONFIRMADO" | "RECUSADO") {
    setErro(undefined);
    const erroNome =
      r === "CONFIRMADO" && pedirNomes ? lista.map((p) => erroDoNome(p.nome)).find(Boolean) : null;
    if (erroNome) {
      setErro(erroNome);
      return;
    }
    iniciar(async () => {
      const resultado = await registrarResposta(
        convidado.id,
        r,
        r === "CONFIRMADO" ? quantas : 1,
        familia && r === "CONFIRMADO" ? lista : [],
      );
      if (resultado.erro) setErro(resultado.erro);
      else aoFechar();
    });
  }

  return (
    <div
      role="group"
      aria-labelledby={`${id}-titulo`}
      className="bg-card col-span-full flex flex-col gap-3 rounded-lg px-3 py-3"
    >
      <div>
        <p id={`${id}-titulo`} className="font-semibold">
          Resposta de {convidado.nome}
        </p>
        <p className="text-tinta-suave text-sm leading-snug">
          Para quem respondeu por telefone ou pessoalmente. Fica marcado que foi você; se o
          convidado responder pelo link depois, vale a resposta dele.
        </p>
      </div>

      <div role="radiogroup" aria-label="Resposta" className="grid max-w-sm grid-cols-2 gap-2">
        {(
          [
            ["CONFIRMADO", familia ? "Vão" : "Vai"],
            ["RECUSADO", familia ? "Não vão" : "Não vai"],
          ] as const
        ).map(([valor, rotulo]) => (
          <button
            key={valor}
            type="button"
            role="radio"
            aria-checked={resposta === valor}
            onClick={() => setResposta(valor)}
            className={cn("h-10", escolha(resposta === valor))}
          >
            {rotulo}
          </button>
        ))}
      </div>

      {resposta === "CONFIRMADO" && familia && (
        <>
          <div role="radiogroup" aria-labelledby={`${id}-quantas`}>
            <p id={`${id}-quantas`} className="text-sm">
              Quantas pessoas vão?
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {Array.from({ length: pessoas }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={n === quantas}
                  onClick={() => setQuantas(n)}
                  className={cn("size-10 font-mono", escolha(n === quantas))}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <fieldset>
            <legend className="text-sm">
              {pedirNomes ? "Nome completo e idade de cada pessoa" : "Idade de cada pessoa"}
            </legend>
            <div className="flex flex-col gap-2 pt-1">
              {lista.map((pessoa, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2">
                  {pedirNomes ? (
                    <Input
                      aria-label={`Nome da pessoa ${i + 1}`}
                      value={pessoa.nome}
                      onChange={(e) => mudar(i, { nome: e.target.value })}
                      placeholder={`Pessoa ${i + 1}: nome e sobrenome`}
                      autoComplete="off"
                      autoCapitalize="words"
                      maxLength={TAMANHO_MAXIMO_NOME}
                      aria-invalid={!!pessoa.nome.trim() && !!erroDoNome(pessoa.nome)}
                      className="bg-background h-10 min-w-48 flex-1"
                    />
                  ) : (
                    <span className="text-tinta-suave w-16 shrink-0 text-sm">Pessoa {i + 1}</span>
                  )}
                  <div
                    role="radiogroup"
                    aria-label={`Idade da pessoa ${i + 1}`}
                    className="grid w-full max-w-64 grid-cols-3 gap-1.5 @md:w-64"
                  >
                    {OPCOES_IDADE.map((o) => (
                      <button
                        key={o.faixa}
                        type="button"
                        role="radio"
                        aria-checked={pessoa.faixa === o.faixa}
                        onClick={() => mudar(i, { faixa: o.faixa })}
                        className={cn("h-10", escolha(pessoa.faixa === o.faixa))}
                      >
                        {o.rotulo}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </fieldset>
        </>
      )}

      {erro && (
        <p role="alert" className="text-destructive text-sm leading-snug">
          {erro}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={() => resposta && salvar(resposta)}
          disabled={salvando || !resposta}
          className="h-10 px-4"
        >
          {salvando ? "Salvando…" : "Salvar resposta"}
        </Button>
        <Button type="button" variant="ghost" onClick={aoFechar} className="h-10">
          Cancelar
        </Button>
        {/* Marcou errado: o convite volta a esperar a resposta do convidado. */}
        {rsvp !== "PENDENTE" && convidado.entraram === 0 && (
          <Button
            type="button"
            onClick={() => setApagando(true)}
            disabled={salvando}
            className="bg-destructive hover:bg-destructive/90 text-primary-foreground ml-auto h-10 px-4"
          >
            Apagar resposta
          </Button>
        )}
      </div>

      {/* Apagar leva junto os nomes de quem vai: confirma antes, como ao remover o convidado. */}
      <ConfirmarExclusao
        aberto={apagando}
        aoMudar={setApagando}
        titulo="Apagar esta resposta?"
        descricao={
          <>
            O convite de {convidado.nome} volta a esperar a resposta
            {membros.length > 0 && ", e os nomes de quem vai saem da lista"}.
          </>
        }
        rotuloConfirmar="Apagar resposta"
        rotuloEnviando="Apagando…"
        acao={async () => {
          const resultado = await registrarResposta(convidado.id, "PENDENTE");
          setApagando(false);
          if (resultado.erro) setErro(resultado.erro);
          else aoFechar();
        }}
      />
    </div>
  );
}
