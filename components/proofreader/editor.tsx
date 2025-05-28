"use client"

import type React from "react"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, ChevronRight, ChevronLeft, Copy } from "lucide-react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Highlight from "@tiptap/extension-highlight"
import Placeholder from "@tiptap/extension-placeholder"
import { toast } from "sonner"
import type { Suggestion } from "@/types/proofreader"

interface ProofreaderEditorProps {
  onTextChange: (html: string) => void
  onAnalyzeText: () => void
  isAnalyzing: boolean
  suggestions: Suggestion[]
  activeSuggestion: Suggestion | null
  setActiveSuggestion: (suggestion: Suggestion | null) => void
  navigateSuggestions: (direction: "next" | "prev") => void
  editorRef?: React.RefObject<{
    getHTML: () => string
    getText: () => string
    setContent: (content: string) => void
  }>
}

export function ProofreaderEditor({
  onTextChange,
  onAnalyzeText,
  isAnalyzing,
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
        placeholder: "Escribe o pega tu texto aquí para analizarlo...",
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:text-gray-400 before:float-left before:pointer-events-none",
      }),
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
  })

  // Exponer métodos del editor a través de la ref
  useEffect(() => {
    if (editor && editorRef && "current" in editorRef) {
      editorRef.current = {
        getHTML: () => editor.getHTML(),
        getText: () => editor.getText(),
        setContent: (content) => {
          editor.commands.setContent(content)
          console.log("Contenido establecido en el editor:", content)
        },
      }
    }
  }, [editor, editorRef])

  // Manejar la selección de texto cuando cambia la sugerencia activa
  useEffect(() => {
    if (editor && activeSuggestion) {
      editor.commands.setTextSelection({
        from: activeSuggestion.startIndex,
        to: activeSuggestion.endIndex,
      })
      editor.commands.focus()
    }
  }, [editor, activeSuggestion])

  const copyTextWithFormat = async () => {
    if (!editor) return

    try {
      // Obtener el HTML del editor
      const htmlContent = editor.getHTML()

      // Crear un elemento temporal para manipular el HTML
      const container = document.createElement("div")
      container.innerHTML = htmlContent

      // Asegurarse de que los estilos estén incrustados para Google Docs
      const styledHtml = `
        <html>
          <head>
            <style>
              body { font-family: 'Georgia', serif; line-height: 1.6; }
              h1 { font-size: 1.8rem; margin-top: 1.5rem; margin-bottom: 0.75rem; font-weight: bold; }
              h2 { font-size: 1.5rem; margin-top: 1.5rem; margin-bottom: 0.75rem; font-weight: bold; }
              h3 { font-size: 1.25rem; margin-top: 1.5rem; margin-bottom: 0.75rem; font-weight: bold; }
              p { margin-bottom: 1rem; }
              a { color: #2563eb; text-decoration: underline; }
              ul, ol { padding-left: 1.5rem; margin-bottom: 1rem; }
              li { margin-bottom: 0.25rem; }
              blockquote { border-left: 3px solid #e5e7eb; padding-left: 1rem; font-style: italic; color: #4b5563; }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `

      // Usar la API moderna del portapapeles para copiar HTML
      try {
        const blob = new Blob([styledHtml], { type: "text/html" })
        const plainTextBlob = new Blob([editor.getText()], { type: "text/plain" })

        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": blob,
            "text/plain": plainTextBlob,
          }),
        ])

        toast.success("Contenido copiado con formato", {
          description: "Ahora puedes pegarlo en Google Docs manteniendo el estilo.",
        })
      } catch (clipboardError) {
        console.error("Error al usar Clipboard API moderna:", clipboardError)

        // Fallback para navegadores que no soportan la API moderna
        const tempElement = document.createElement("div")
        tempElement.innerHTML = htmlContent
        document.body.appendChild(tempElement)

        const selection = window.getSelection()
        if (selection) {
          const range = document.createRange()
          range.selectNodeContents(tempElement)
          selection.removeAllRanges()
          selection.addRange(range)
          document.execCommand("copy")
          selection.removeAllRanges()
        }

        document.body.removeChild(tempElement)

        toast.success("Contenido copiado", {
          description: "El contenido ha sido copiado al portapapeles.",
        })
      }
    } catch (error) {
      console.error("Error al copiar con formato:", error)
      toast.error("Error al copiar", {
        description: "No se pudo copiar el contenido con formato.",
      })
    }
  }

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
          <Button
            size="sm"
            variant="secondary"
            className="shadow-sm hover:shadow-md transition-all"
            onClick={copyTextWithFormat}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copiar texto
          </Button>
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
        </div>
    </div>
  )
}
