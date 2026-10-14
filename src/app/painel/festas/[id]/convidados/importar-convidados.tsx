"use client";

import { ClipboardPaste, FileSpreadsheet } from "lucide-react";
import {
  useDeferredValue,
  useMemo,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
} from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { lerLista, MAXIMO_LINHAS } from "@/lib/convidados/importar";
import { formatarTelefone } from "@/lib/convidados/telefone";
import { cn } from "@/lib/utils";

import { importarConvidados } from "./actions";

const EXEMPLO =
  "Família Silva\t4\t(19) 99876-5432\nAna Souza\t1\nCarlos Lima; 2; 43 99938-6569; Mesa 3";

// Modelo de croqui que ela manda para a noiva quando as mesas são demarcadas: a noiva
// preenche as mesas na Plan1 e a Plan2 já sai no formato desta lista colada.
function BaixarModelo() {
  return (
    <Button asChild variant="ghost" className="h-10 px-2.5 font-medium">
      <a href="/modelos/modelo-croqui.xlsx" download="Modelo de Croqui.xlsx">
        <FileSpreadsheet aria-hidden strokeWidth={1.75} />
        Baixar planilha modelo
      </a>
    </Button>
  );
}

// "Adicionar vários": cola a lista inteira, confere a prévia e adiciona de uma vez.
export function ImportarConvidados({
  festaId,
  jaCadastrados,
}: {
  festaId: string;
  jaCadastrados: { nome: string; telefone: string | null }[];
}) {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string }>();
  const [enviando, iniciar] = useTransition();
  // Depois de um Esc, o próximo Tab sai do campo (para não prender quem usa só o teclado).
  const soltarTab = useRef(false);

  const adiado = useDeferredValue(texto);
  const linhas = useMemo(() => lerLista(adiado, jaCadastrados), [adiado, jaCadastrados]);
  const prontas = linhas.filter((l) => !l.problema);
  const comProblema = linhas.length - prontas.length;
  const novas = prontas.filter((l) => l.jaCadastrado === undefined);
  const mudam = prontas.length - novas.length;
  const pessoas = novas.reduce((s, l) => s + l.pessoas, 0);
  const temMesa = linhas.some((l) => l.mesa);

  if (!aberto) {
    return (
      <div className="mt-2">
        <div className="flex flex-wrap items-center gap-x-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setAberto(true)}
            className="-ml-2.5 h-10 px-2.5 font-medium"
          >
            <ClipboardPaste aria-hidden strokeWidth={1.75} />
            Adicionar vários de uma vez
          </Button>
          <BaixarModelo />
        </div>
        {mensagem && (
          <p
            role="status"
            className={cn("text-sm", mensagem.tipo === "erro" && "text-destructive")}
          >
            {mensagem.texto}
          </p>
        )}
      </div>
    );
  }

  // Tab separa as colunas, como no Excel: escreve a tabulação em vez de pular de campo.
  function teclaNaLista(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape") {
      soltarTab.current = true;
      return;
    }
    if (e.key !== "Tab" || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey || soltarTab.current) {
      soltarTab.current = false;
      return;
    }
    e.preventDefault();
    const campo = e.currentTarget;
    campo.setRangeText("\t", campo.selectionStart, campo.selectionEnd, "end");
    setTexto(campo.value);
  }

  function adicionar() {
    setMensagem(undefined);
    iniciar(async () => {
      const r = await importarConvidados(festaId, texto);
      if ("erro" in r) {
        setMensagem({ tipo: "erro", texto: r.erro });
        return;
      }
      setTexto("");
      setAberto(false);
      setMensagem({
        tipo: "ok",
        texto:
          `${r.adicionados} ${r.adicionados === 1 ? "convite adicionado" : "convites adicionados"}` +
          (r.mudaramDeMesa > 0
            ? ` · ${r.mudaramDeMesa} ${r.mudaramDeMesa === 1 ? "mudou" : "mudaram"} de mesa`
            : "") +
          (r.mesasCriadas > 0
            ? ` · ${r.mesasCriadas} ${r.mesasCriadas === 1 ? "mesa criada" : "mesas criadas"}`
            : "") +
          (r.ignorados > 0
            ? ` · ${r.ignorados} ${r.ignorados === 1 ? "linha ficou" : "linhas ficaram"} de fora`
            : "") +
          ".",
      });
    });
  }

  return (
    <div className="bg-card border-border mt-3 flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lista-convidados">Cole a lista: um convite por linha</Label>
        <p id="ajuda-lista" className="text-tinta-suave text-sm leading-snug">
          Nome e, se quiser, quantas pessoas, o WhatsApp e a mesa (&quot;Mesa 3&quot;). Dá para
          copiar direto do Excel, do Google Planilhas, de uma nota ou do WhatsApp. Separe com
          tabulação (tecla Tab), ponto e vírgula ou vírgula. Quem já está na lista só muda de mesa;
          mesa que ainda não existe é criada. Para sair do campo pelo teclado, aperte Esc e depois
          Tab.
        </p>
        <Textarea
          id="lista-convidados"
          aria-describedby="ajuda-lista"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={teclaNaLista}
          rows={8}
          placeholder={EXEMPLO}
          className="bg-card font-mono text-sm"
        />
      </div>

      {linhas.length > 0 && (
        <div>
          <p className="text-sm" aria-live="polite">
            <strong>{novas.length}</strong> {novas.length === 1 ? "convite novo" : "convites novos"}{" "}
            ({pessoas} {pessoas === 1 ? "pessoa" : "pessoas"})
            {mudam > 0 && (
              <>
                {" · "}
                <strong>{mudam}</strong> já na lista, só {mudam === 1 ? "muda" : "mudam"} de mesa
              </>
            )}
            {comProblema > 0 && (
              <>
                {" · "}
                <strong className="text-destructive">{comProblema}</strong> com problema (ficam de
                fora)
              </>
            )}
          </p>
          <div className="border-border mt-2 max-h-72 overflow-y-auto rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-tinta-suave sticky top-0 text-xs">
                <tr>
                  <th scope="col" className="px-2 py-1.5 font-medium">
                    Linha
                  </th>
                  <th scope="col" className="px-2 py-1.5 font-medium">
                    Nome
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-right font-medium">
                    Pessoas
                  </th>
                  <th scope="col" className="px-2 py-1.5 font-medium">
                    WhatsApp
                  </th>
                  {temMesa && (
                    <th scope="col" className="px-2 py-1.5 font-medium">
                      Mesa
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr
                    key={l.linha}
                    className={cn("border-border border-t", l.problema && "bg-pendente/60")}
                  >
                    <td className="text-tinta-suave px-2 py-1 font-mono text-xs">{l.linha}</td>
                    <td className="px-2 py-1">
                      {l.nome || "—"}
                      {l.problema && (
                        <span className="text-destructive block text-xs font-medium">
                          {l.problema}
                        </span>
                      )}
                      {l.jaCadastrado !== undefined && (
                        <span className="text-tinta-suave block text-xs">
                          Já está na lista: só muda de mesa
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-1 text-right font-mono">{l.pessoas}</td>
                    <td className="px-2 py-1 font-mono text-xs">
                      {l.telefone ? formatarTelefone(l.telefone) : "—"}
                    </td>
                    {temMesa && <td className="px-2 py-1 whitespace-nowrap">{l.mesa ?? "—"}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {linhas.length > MAXIMO_LINHAS && (
            <p className="text-destructive mt-1 text-sm">
              No máximo {MAXIMO_LINHAS} convites por vez. Cole em partes.
            </p>
          )}
        </div>
      )}

      {mensagem?.tipo === "erro" && (
        <p role="alert" className="text-destructive text-sm">
          {mensagem.texto}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={adicionar}
          disabled={enviando || prontas.length === 0 || linhas.length > MAXIMO_LINHAS}
          className="h-10 px-4"
        >
          {enviando
            ? "Adicionando…"
            : novas.length > 0
              ? `Adicionar ${novas.length} ${novas.length === 1 ? "convite" : "convites"}`
              : `Mudar ${mudam} de mesa`}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setAberto(false);
            setTexto("");
          }}
          className="h-10"
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
