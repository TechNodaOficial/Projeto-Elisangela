"use client";

import { TaskItem, TaskList } from "@tiptap/extension-list";
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
  type JSONContent,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading1,
  Heading2,
  Italic,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { FUSO } from "@/lib/datas";
import type { Documento } from "@/lib/festas/observacoes";
import { cn } from "@/lib/utils";

import { salvarObservacao } from "./actions";

// Espera esta pausa na digitação antes de salvar.
const PAUSA_MS = 800;

const hora = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, timeStyle: "short" }).format(new Date(iso));

type Estado =
  { tipo: "salvo"; em: string | null } | { tipo: "salvando" } | { tipo: "erro"; msg: string };

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

  const salvar = useCallback(async () => {
    clearTimeout(timer.current);
    const doc = pendente.current;
    if (!doc) return;
    pendente.current = null;
    setEstado({ tipo: "salvando" });
    try {
      const r = await salvarObservacao(festaId, secao, doc);
      setEstado(r.ok ? { tipo: "salvo", em: r.salvoEm } : { tipo: "erro", msg: r.erro });
    } catch {
      pendente.current ??= doc;
      setEstado({
        tipo: "erro",
        msg: "Sem conexão. Tentando de novo quando você voltar a digitar.",
      });
    }
  }, [festaId, secao]);

  const editor = useEditor({
    // Renderizado no servidor pelo Next: o editor só monta no navegador.
    immediatelyRender: false,
    extensions: [
      // Sem links: é uma folha de anotações, e assim nenhum link estranho é salvo.
      StarterKit.configure({ link: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: (inicial as JSONContent | null) ?? "",
    editorProps: {
      attributes: {
        class: "documento min-h-[60vh] px-6 py-8 outline-none sm:px-12 sm:py-10",
        "aria-label": "Observações",
      },
    },
    onUpdate: ({ editor: e }) => {
      pendente.current = e.getJSON() as Documento;
      clearTimeout(timer.current);
      timer.current = setTimeout(salvar, PAUSA_MS);
    },
    onBlur: () => void salvar(),
  });

  // Salva o que faltar ao sair da página ou trocar de aba.
  useEffect(() => {
    const aoEsconder = () => document.visibilityState === "hidden" && void salvar();
    document.addEventListener("visibilitychange", aoEsconder);
    return () => {
      document.removeEventListener("visibilitychange", aoEsconder);
      void salvar();
    };
  }, [salvar]);

  return (
    <div className="bg-card rounded-xl shadow-[0_1px_1px_oklch(0.2_0.01_250/6%),0_6px_16px_-8px_oklch(0.2_0.01_250/22%)]">
      {editor && <Barra editor={editor} />}
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
      </p>
    </div>
  );
}
