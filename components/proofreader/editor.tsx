"use client"

import type React from "react"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, ChevronRight, ChevronLeft } from "lucide-react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Highlight from "@tiptap/extension-highlight"
import Placeholder from "@tiptap/extension-placeholder"
import type { Suggestion } from "@/types/proofreader"
import {
  ProofreaderHighlight,
  proofreaderHighlightKey,
} from "@/lib/proofreader/highlight-plugin"
import {
  applyCorrectionToEditor,
  findRangeInEditor,
  getPlainTextFromEditor,
  type CorrectionResult,
} from "@/lib/proofreader/document-corrections"

/**
 * API que la página usa para operar sobre el documento. Todo pasa por el
 * documento de ProseMirror: no hay strings de HTML ni manipulación del DOM.
 */
export interface ProofreaderEditorHandle {
  getHTML: () => string
  getJSON: () => Record<string, any>
  /** Texto plano que se envía al modelo */
  getPlainText: () => string
  setContent: (content: string) => void
  restoreDoc: (doc: Record<string, any>) => void
  setEditable: (editable: boolean) => void
  applySuggestion: (suggestion: Suggestion, cursor: number) => CorrectionResult
  highlightSuggestion: (
    suggestion: Suggestion,
    options?: { cursor?: number; className?: string; scroll?: boolean }
  ) => boolean
  clearHighlight: () => void
}

interface ProofreaderEditorProps {
  onTextChange: (html: string) => void
  onAnalyzeText: () => void
  isAnalyzing: boolean
  isAnalyzed?: boolean
  suggestions: Suggestion[]
  activeSuggestion: Suggestion | null
  setActiveSuggestion: (suggestion: Suggestion | null) => void
  navigateSuggestions: (direction: "next" | "prev") => void
  editorRef?: React.RefObject<ProofreaderEditorHandle | null>
}

export function ProofreaderEditor({
  onTextChange,
  onAnalyzeText,
  isAnalyzing,
  isAnalyzed = false,
  suggestions,
  activeSuggestion,
  setActiveSuggestion,
  navigateSuggestions,
  editorRef,
}: ProofreaderEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        bulletList: {},
        orderedList: {},
        listItem: {},
        blockquote: {},
        codeBlock: {},
        code: {},
        horizontalRule: {},
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800 transition-colors",
        },
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: "bg-yellow-200 px-1 rounded",
        },
      }),
      Placeholder.configure({
        placeholder: "Escribe o pega tu texto aquí para analizarlo",
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:text-gray-400 before:float-left before:pointer-events-none",
      }),
      ProofreaderHighlight,
    ],
    content: "",
    onUpdate: ({ editor }) => {
      onTextChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none prose-lg max-w-none",
      },
    },
    immediatelyRender: false,
  })

  // Mientras se revisan las correcciones el documento es de solo lectura,
  // para que el texto no cambie bajo los pies de las sugerencias.
  useEffect(() => {
    editor?.setEditable(!isAnalyzed)
  }, [editor, isAnalyzed])

  const setHighlight = (range: { from: number; to: number } | null, className?: string) => {
    if (!editor) return
    const { tr } = editor.state
    tr.setMeta(
      proofreaderHighlightKey,
      range ? { ...range, className } : null
    )
    editor.view.dispatch(tr)
  }

  // Exponer la API del editor
  useEffect(() => {
    if (!editor || !editorRef || !("current" in editorRef)) return

    editorRef.current = {
      getHTML: () => editor.getHTML(),
      getJSON: () => editor.getJSON(),
      getPlainText: () => getPlainTextFromEditor(editor),
      setContent: (content) => editor.commands.setContent(content),
      restoreDoc: (doc) => editor.commands.setContent(doc as any),
      setEditable: (editable) => editor.setEditable(editable),
      applySuggestion: (suggestion, cursor) =>
        applyCorrectionToEditor(editor, suggestion, cursor),
      highlightSuggestion: (suggestion, options) => {
        const range = findRangeInEditor(
          editor,
          suggestion.original,
          options?.cursor ?? 0
        )
        if (!range) {
          setHighlight(null)
          return false
        }

        setHighlight(range, options?.className)

        if (options?.scroll !== false) {
          const dom = editor.view.domAtPos(range.from).node as HTMLElement
          const element =
            dom.nodeType === Node.TEXT_NODE ? dom.parentElement : dom
          element?.scrollIntoView({ behavior: "smooth", block: "center" })
        }

        return true
      },
      clearHighlight: () => setHighlight(null),
    }
  }, [editor, editorRef])

  // Resaltar la sugerencia activa. Antes esto hacía
  // setTextSelection({ from: 0, to: 0 }) porque el backend siempre devolvía
  // startIndex 0, así que no seleccionaba nada útil.
  useEffect(() => {
    if (!editor) return

    if (!activeSuggestion) {
      setHighlight(null)
      return
    }

    const range = findRangeInEditor(editor, activeSuggestion.original)
    setHighlight(range)
  }, [editor, activeSuggestion])

  return (
    <div className="relative flex-1 overflow-hidden">
      <div className="tiptap-editor-container h-full overflow-auto">
        <EditorContent editor={editor} className="prose max-w-none h-full focus:outline-none" />
        <style jsx global>{`
          .tiptap-editor-container .ProseMirror {
            padding: 1.5rem;
            min-height: 100%;
            outline: none;
            font-family: 'Georgia', serif;
            line-height: 1.6;
          }
          .tiptap-editor-container .ProseMirror p {
            margin-bottom: 1rem;
          }
          .tiptap-editor-container .ProseMirror h1,
          .tiptap-editor-container .ProseMirror h2,
          .tiptap-editor-container .ProseMirror h3 {
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            font-weight: bold;
          }
          .tiptap-editor-container .ProseMirror h1 {
            font-size: 1.8rem;
          }
          .tiptap-editor-container .ProseMirror h2 {
            font-size: 1.5rem;
          }
          .tiptap-editor-container .ProseMirror h3 {
            font-size: 1.25rem;
          }
          .tiptap-editor-container .ProseMirror a {
            color: #2563eb;
            text-decoration: underline;
          }
          .tiptap-editor-container .ProseMirror ul,
          .tiptap-editor-container .ProseMirror ol {
            padding-left: 1.5rem;
            margin-bottom: 1rem;
          }
          .tiptap-editor-container .ProseMirror li {
            margin-bottom: 0.25rem;
          }
          .tiptap-editor-container .ProseMirror blockquote {
            border-left: 3px solid #e5e7eb;
            padding-left: 1rem;
            font-style: italic;
            color: #4b5563;
          }
          .tiptap-editor-container .ProseMirror .proofreader-highlight {
            background-color: #fef08a;
            border-radius: 2px;
            box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
            transition: background-color 0.2s ease;
          }
          .tiptap-editor-container .ProseMirror .proofreader-highlight-hover {
            background-color: #dbeafe;
            border-radius: 2px;
            box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3);
          }
          .tiptap-editor-container .ProseMirror .applied-suggestion {
            background-color: #e3f2fd;
            border-radius: 2px;
          }
        `}</style>
      </div>

      <div className="absolute bottom-4 right-4 flex space-x-2">
        {suggestions.length > 0 && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 rounded-full shadow-sm hover:shadow-md transition-all"
              onClick={() => navigateSuggestions("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Anterior</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 rounded-full shadow-sm hover:shadow-md transition-all"
              onClick={() => navigateSuggestions("next")}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Siguiente</span>
            </Button>
          </>
        )}

        {!isAnalyzed && (
          <Button
            size="sm"
            className="shadow-sm hover:shadow-md transition-all bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:opacity-90"
            onClick={onAnalyzeText}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Analizar texto
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
