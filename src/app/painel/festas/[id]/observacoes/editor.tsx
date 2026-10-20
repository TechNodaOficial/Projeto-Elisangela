"use client";

import { TaskItem, TaskList } from "@tiptap/extension-list";
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
  type JSONContent,
} from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  ExternalLink,
  Heading1,
  Heading2,
  Italic,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  Unlink,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import { FUSO } from "@/lib/datas";
import {
  documentoValido,
  linkPermitido,
  normalizarLink,
  type Documento,
} from "@/lib/festas/observacoes";
import { cn } from "@/lib/utils";

import { salvarObservacao } from "./actions";

// Espera esta pausa na digitação antes de salvar.
const PAUSA_MS = 800;

const hora = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, timeStyle: "short" }).format(new Date(iso));

// Se a chamada falhar, tenta de novo depois destas esperas; esgotadas, pede para recarregar.
const RETENTATIVAS_MS = [2_000, 5_000, 15_000];

type Estado =
  | { tipo: "salvo"; em: string | null }
  | { tipo: "salvando" }
  | { tipo: "erro"; msg: string; recarregar?: boolean };

// Cópia do texto no navegador enquanto ele não chega ao servidor: se a página fechar ou
// recarregar no meio de um erro, o texto volta ao abrir de novo. Sem acesso ao
// localStorage (aba anônima, bloqueado), segue sem cópia.
const chaveCopia = (festaId: string, secao: string) => `observacoes:${festaId}:${secao}`;

function guardarCopia(chave: string, doc: Documento) {
  try {
    localStorage.setItem(chave, JSON.stringify(doc));
  } catch {}
}

function lerCopia(chave: string): Documento | null {
  try {
    const doc: unknown = JSON.parse(localStorage.getItem(chave) ?? "null");
    return documentoValido(doc) ? doc : null;
  } catch {
    return null;
  }
}

function apagarCopia(chave: string) {
  try {
    localStorage.removeItem(chave);
  } catch {}
}

type Acao = {
  rotulo: string;
  icone: LucideIcon;
  ativo?: (e: Editor) => boolean;
  podeFazer?: (e: Editor) => boolean;
  fazer: (e: Editor) => void;
};

// Barra como a do Word: grupos separados por um fio.
const GRUPOS: Acao[][] = [
  [
    {
      rotulo: "Título",
      icone: Heading1,
      ativo: (e) => e.isActive("heading", { level: 1 }),
      fazer: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      rotulo: "Subtítulo",
      icone: Heading2,
      ativo: (e) => e.isActive("heading", { level: 2 }),
      fazer: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
    },
  ],
  [
    {
      rotulo: "Negrito",
      icone: Bold,
      ativo: (e) => e.isActive("bold"),
      fazer: (e) => e.chain().focus().toggleBold().run(),
    },
    {
      rotulo: "Itálico",
      icone: Italic,
      ativo: (e) => e.isActive("italic"),
      fazer: (e) => e.chain().focus().toggleItalic().run(),
    },
    {
      rotulo: "Sublinhado",
      icone: Underline,
      ativo: (e) => e.isActive("underline"),
      fazer: (e) => e.chain().focus().toggleUnderline().run(),
    },
    {
      rotulo: "Riscado",
      icone: Strikethrough,
      ativo: (e) => e.isActive("strike"),
      fazer: (e) => e.chain().focus().toggleStrike().run(),
    },
    {
      rotulo: "Link (Ctrl+K)",
      icone: Link2,
      ativo: (e) => e.isActive("link"),
      fazer: (e) => abrirCampoDoLink(e),
    },
  ],
  [
    {
      rotulo: "Lista com marcadores",
      icone: List,
      ativo: (e) => e.isActive("bulletList"),
      fazer: (e) => e.chain().focus().toggleBulletList().run(),
    },
    {
      rotulo: "Lista numerada",
      icone: ListOrdered,
      ativo: (e) => e.isActive("orderedList"),
      fazer: (e) => e.chain().focus().toggleOrderedList().run(),
    },
    {
      rotulo: "Lista de tarefas",
      icone: ListChecks,
      ativo: (e) => e.isActive("taskList"),
      fazer: (e) => e.chain().focus().toggleTaskList().run(),
    },
    {
      rotulo: "Citação",
      icone: Quote,
      ativo: (e) => e.isActive("blockquote"),
      fazer: (e) => e.chain().focus().toggleBlockquote().run(),
    },
    {
      rotulo: "Linha divisória",
      icone: Minus,
      fazer: (e) => e.chain().focus().setHorizontalRule().run(),
    },
  ],
  [
    {
      rotulo: "Desfazer",
      icone: Undo2,
      podeFazer: (e) => e.can().undo(),
      fazer: (e) => e.chain().focus().undo().run(),
    },
    {
      rotulo: "Refazer",
      icone: Redo2,
      podeFazer: (e) => e.can().redo(),
      fazer: (e) => e.chain().focus().redo().run(),
    },
  ],
];

// O campo do link abre num balão sobre o texto. A barra e o Ctrl+K avisam o balão por
// este evento do editor, para ele abrir já no modo de digitar o endereço.
const EVENTO_LINK = "abrir-campo-do-link";
const CHAVE_BALAO = "balaoDoLink";
function abrirCampoDoLink(editor: Editor) {
  editor.chain().focus().extendMarkRange("link").run();
  editor.view.dom.dispatchEvent(new CustomEvent(EVENTO_LINK));
}

// "https://www.buffet.com.br/cardapio" → "buffet.com.br/cardapio", para caber no balão.
const linkCurto = (href: string) =>
  href.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/^(mailto|tel):/, "");

// Balão do link, como no Google Docs: com o cursor num link, mostra o endereço e os botões
// Abrir, Editar e Remover; ao criar ou editar, mostra o campo para colar o endereço.
function BalaoDoLink({ editor }: { editor: Editor }) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState("");
  const [erro, setErro] = useState(false);
  const campo = useRef<HTMLInputElement>(null);
  const href = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e.isActive("link") ? (e.getAttributes("link").href as string | undefined) : undefined,
  });

  useEffect(() => {
    const abrir = () => {
      setValor((editor.getAttributes("link").href as string | undefined) ?? "");
      setErro(false);
      setEditando(true);
      requestAnimationFrame(() => campo.current?.select());
    };
    const dom = editor.view.dom;
    dom.addEventListener(EVENTO_LINK, abrir);
    return () => dom.removeEventListener(EVENTO_LINK, abrir);
  }, [editor]);

  // O balão só se reavalia quando o texto ou a seleção mudam: ao abrir ou fechar o campo,
  // avisa ele (fechando sem cursor num link, some; senão volta a mostrar o link).
  useEffect(() => {
    if (editor.isDestroyed) return;
    const mostrar = editando || editor.isActive("link");
    editor.view.dispatch(editor.state.tr.setMeta(CHAVE_BALAO, mostrar ? "show" : "hide"));
  }, [editor, editando]);

  function fechar() {
    setEditando(false);
    editor.commands.focus();
  }

  function aplicar(ev: FormEvent) {
    ev.preventDefault();
    if (!valor.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setEditando(false);
      return;
    }
    const url = normalizarLink(valor);
    if (!url) {
      setErro(true);
      return;
    }
    const { empty } = editor.state.selection;
    if (empty && !editor.isActive("link")) {
      // Nada selecionado: escreve o próprio endereço, já como link.
      editor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text: linkCurto(url),
          marks: [{ type: "link", attrs: { href: url } }],
        })
        .unsetMark("link")
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
    setEditando(false);
  }

  const botao =
    "text-tinta-suave hover:bg-muted hover:text-foreground focus-visible:outline-ring flex size-8 items-center justify-center rounded-md focus-visible:outline-2";

  return (
    <BubbleMenu
      editor={editor}
      pluginKey={CHAVE_BALAO}
      // Aparece no link onde está o cursor, ou enquanto ela digita o endereço.
      shouldShow={({ editor: e }) => editando || e.isActive("link")}
      options={{ placement: "bottom-start", offset: 6 }}
      className="papel-solto border-border z-20 flex items-center gap-1 rounded-lg border p-1 text-sm"
    >
      {editando ? (
        <form onSubmit={aplicar} className="flex items-center gap-1">
          <label htmlFor="endereco-link" className="sr-only">
            Endereço do link
          </label>
          <input
            ref={campo}
            id="endereco-link"
            value={valor}
            onChange={(e) => {
              setValor(e.target.value);
              setErro(false);
            }}
            onKeyDown={(e) => e.key === "Escape" && fechar()}
            placeholder="Cole o link (site, e-mail…)"
            aria-invalid={erro || undefined}
            aria-describedby={erro ? "erro-link" : undefined}
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive h-8 w-64 rounded-md border bg-transparent px-2 outline-none focus-visible:ring-3"
          />
          <button
            type="submit"
            className="bg-primary text-primary-foreground h-8 rounded-md px-3 font-medium"
          >
            Aplicar
          </button>
          {erro && (
            <span id="erro-link" role="alert" className="text-destructive px-1 text-xs">
              Link inválido
            </span>
          )}
        </form>
      ) : href && linkPermitido(href) ? (
        <>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link flex max-w-64 items-center gap-1.5 truncate px-2 underline underline-offset-2"
          >
            <ExternalLink aria-hidden className="size-3.5 shrink-0" />
            <span className="truncate">{linkCurto(href)}</span>
          </a>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => abrirCampoDoLink(editor)}
            className="text-tinta-suave hover:bg-muted hover:text-foreground focus-visible:outline-ring h-8 rounded-md px-2 font-medium focus-visible:outline-2"
          >
            Editar
          </button>
          <button
            type="button"
            title="Remover link"
            aria-label="Remover link"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}
            className={botao}
          >
            <Unlink aria-hidden className="size-4" />
          </button>
        </>
      ) : null}
    </BubbleMenu>
  );
}

function Barra({ editor }: { editor: Editor }) {
  // Re-renderiza a barra quando a seleção ou a formatação mudam.
  const estados = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      GRUPOS.flat().map((a) => ({
        ativo: a.ativo?.(e) ?? false,
        pode: a.podeFazer?.(e) ?? true,
      })),
  });

  let i = 0;
  return (
    <div
      role="toolbar"
      aria-label="Formatação"
      className="bg-card/95 border-border sticky top-14 z-10 flex flex-wrap items-center gap-0.5 rounded-t-xl border-b px-2 py-1.5 backdrop-blur-sm"
    >
      {GRUPOS.map((grupo, g) => (
        <div
          key={g}
          className="border-border flex items-center gap-0.5 pr-1 [&:not(:last-child)]:mr-1 [&:not(:last-child)]:border-r"
        >
          {grupo.map((acao) => {
            const { ativo, pode } = estados[i++];
            const Icone = acao.icone;
            return (
              <button
                key={acao.rotulo}
                type="button"
                title={acao.rotulo}
                aria-label={acao.rotulo}
                aria-pressed={acao.ativo ? ativo : undefined}
                disabled={!pode}
                // Não tira o foco do texto ao clicar.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => acao.fazer(editor)}
                className={cn(
                  "focus-visible:outline-ring flex size-9 items-center justify-center rounded-md focus-visible:outline-2 disabled:opacity-35",
                  ativo
                    ? "bg-pastel-lilas text-foreground"
                    : "text-tinta-suave hover:bg-muted hover:text-foreground",
                )}
              >
                <Icone aria-hidden className="size-4.5" strokeWidth={1.9} />
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// Folha livre como um documento do Word: formatação básica e salvamento automático.
export function EditorObservacoes({
  festaId,
  secao,
  inicial,
  salvoEm,
}: {
  festaId: string;
  secao: string;
  inicial: Documento | null;
  salvoEm: string | null;
}) {
  const [estado, setEstado] = useState<Estado>({ tipo: "salvo", em: salvoEm });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pendente = useRef<Documento | null>(null);
  const enviando = useRef(false);
  const falhas = useRef(0);
  const retentativa = useRef<ReturnType<typeof setTimeout>>(undefined);
  const salvarDeNovo = useRef<() => Promise<void>>(undefined);
  const chave = chaveCopia(festaId, secao);

  const salvar = useCallback(async () => {
    clearTimeout(timer.current);
    clearTimeout(retentativa.current);
    const doc = pendente.current;
    if (!doc) return;
    pendente.current = null;
    enviando.current = true;
    setEstado({ tipo: "salvando" });
    try {
      const r = await salvarObservacao(festaId, secao, doc);
      falhas.current = 0;
      if (r.ok) {
        // Só apaga a cópia se ela não escreveu mais nada enquanto salvava.
        if (!pendente.current) apagarCopia(chave);
        setEstado({ tipo: "salvo", em: r.salvoEm });
      } else {
        // Recusado pelo servidor (texto inválido, festa apagada): repetir não adianta.
        setEstado({ tipo: "erro", msg: r.erro });
      }
    } catch {
      // A chamada nem chegou a responder: internet caiu, servidor fora do ar ou o
      // sistema foi atualizado com a página aberta. O texto segue na cópia do navegador.
      pendente.current ??= doc;
      const n = falhas.current++;
      if (!navigator.onLine) {
        setEstado({
          tipo: "erro",
          msg: "Sem internet. O texto está guardado neste aparelho e salva quando a conexão voltar.",
        });
      } else if (n < RETENTATIVAS_MS.length) {
        retentativa.current = setTimeout(() => void salvarDeNovo.current?.(), RETENTATIVAS_MS[n]);
        setEstado({ tipo: "erro", msg: "Não consegui salvar. Tentando de novo…" });
      } else {
        setEstado({
          tipo: "erro",
          msg: "Não consegui salvar. O texto está guardado neste aparelho: recarregue a página.",
          recarregar: true,
        });
      }
    } finally {
      enviando.current = false;
    }
  }, [festaId, secao, chave]);

  useEffect(() => {
    salvarDeNovo.current = salvar;
  }, [salvar]);

  const editor = useEditor({
    // Renderizado no servidor pelo Next: o editor só monta no navegador.
    immediatelyRender: false,
    extensions: [
      // Links: site, e-mail e telefone. O que ela digita ou cola com cara de endereço vira
      // link sozinho. Clique comum só põe o cursor (para editar o texto); abre pelo balão
      // ou com Ctrl+clique, sempre em outra aba.
      StarterKit.configure({
        link: {
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
          defaultProtocol: "https",
          isAllowedUri: (url) => linkPermitido(url),
          HTMLAttributes: { target: "_blank", rel: "noopener noreferrer nofollow" },
        },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: (inicial as JSONContent | null) ?? "",
    editorProps: {
      attributes: {
        class: "documento min-h-[60vh] px-6 py-8 outline-none sm:px-12 sm:py-10",
        "aria-label": "Observações",
      },
      handleKeyDown: (view, ev) => {
        if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "k") {
          ev.preventDefault();
          view.dom.dispatchEvent(new CustomEvent(EVENTO_LINK));
          return true;
        }
        return false;
      },
      handleClick: (_view, _pos, ev) => {
        if (!(ev.ctrlKey || ev.metaKey)) return false;
        const a = (ev.target as HTMLElement).closest("a");
        if (!a || !linkPermitido(a.getAttribute("href"))) return false;
        window.open(a.href, "_blank", "noopener,noreferrer");
        return true;
      },
    },
    onUpdate: ({ editor: e }) => {
      // O ProseMirror cria os attrs (link, título, lista...) com Object.create(null), e o
      // React não manda objeto sem protótipo para a server action: chegaria como referência
      // temporária e o Prisma quebraria ao gravar. A cópia por JSON vira objeto comum.
      const doc = JSON.parse(JSON.stringify(e.getJSON())) as Documento;
      pendente.current = doc;
      guardarCopia(chave, doc);
      clearTimeout(timer.current);
      timer.current = setTimeout(salvar, PAUSA_MS);
    },
    onBlur: () => void salvar(),
  });

  // Texto que não chegou ao servidor da última vez (recarregou ou fechou com erro):
  // volta para a folha e tenta salvar de novo.
  const restaurou = useRef(false);
  useEffect(() => {
    if (!editor || restaurou.current) return;
    restaurou.current = true;
    const copia = lerCopia(chave);
    if (!copia) return;
    if (JSON.stringify(copia) === JSON.stringify(inicial)) {
      apagarCopia(chave);
      return;
    }
    editor.commands.setContent(copia as JSONContent, { emitUpdate: false });
    pendente.current = copia;
    void salvar();
  }, [editor, chave, inicial, salvar]);

  // Salva o que faltar ao trocar de aba, ao sair da página e quando a internet volta.
  useEffect(() => {
    const aoEsconder = () => document.visibilityState === "hidden" && void salvar();
    const aoVoltarInternet = () => {
      falhas.current = 0;
      void salvar();
    };
    document.addEventListener("visibilitychange", aoEsconder);
    window.addEventListener("online", aoVoltarInternet);
    return () => {
      document.removeEventListener("visibilitychange", aoEsconder);
      window.removeEventListener("online", aoVoltarInternet);
      clearTimeout(retentativa.current);
      void salvar();
    };
  }, [salvar]);

  // Avisa antes de fechar ou recarregar com texto ainda não salvo.
  useEffect(() => {
    const aoSair = (ev: BeforeUnloadEvent) => {
      if (pendente.current || enviando.current) ev.preventDefault();
    };
    window.addEventListener("beforeunload", aoSair);
    return () => window.removeEventListener("beforeunload", aoSair);
  }, []);

  return (
    <div className="bg-card rounded-xl shadow-[0_1px_1px_oklch(0.2_0.01_250/6%),0_6px_16px_-8px_oklch(0.2_0.01_250/22%)]">
      {editor && <Barra editor={editor} />}
      {editor && <BalaoDoLink editor={editor} />}
      <EditorContent editor={editor} />
      <p
        role="status"
        className={cn(
          "border-border border-t px-6 py-2 text-right text-xs sm:px-12",
          estado.tipo === "erro" ? "text-destructive" : "text-tinta-suave",
        )}
      >
        {estado.tipo === "salvando"
          ? "Salvando…"
          : estado.tipo === "erro"
            ? estado.msg
            : estado.em
              ? `Salvo às ${hora(estado.em)}`
              : "Escreva à vontade: salva sozinho."}
        {estado.tipo === "erro" && estado.recarregar && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-foreground focus-visible:outline-ring ml-2 rounded-sm font-medium underline underline-offset-2 focus-visible:outline-2"
          >
            Recarregar
          </button>
        )}
      </p>
    </div>
  );
}
