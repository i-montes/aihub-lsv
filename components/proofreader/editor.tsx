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
    highlightText: (suggestion: Suggestion) => void
    removeHoverHighlight: () => void
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
        placeholder: "Escribe o pega tu texto aquí para analizarlo",
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
    immediatelyRender: false,
  })

  // Funciones para manejar el highlight en hover
  const highlightTextOnHover = (suggestion: Suggestion) => {
    if (!editor) return
    
    // Remover highlights previos de hover
    removeHoverHighlight()
    
    try {
      // Obtener el texto plano del editor
      const editorText = editor.getHTML()
      
      // Buscar el texto de la sugerencia en el contenido del editor
      const textToFind = suggestion.original
      const searchStartIndex = editorText.indexOf(textToFind)
      
      if (searchStartIndex === -1) {
        console.warn('Texto de sugerencia no encontrado en el editor:', textToFind)
        return
      }

      console.log("Highlighting suggestion on hover:", {
        text: textToFind,
        startIndex: searchStartIndex + 1, // +1 porque TipTap usa posiciones basadas en 1
        endIndex: searchStartIndex + 1 + textToFind.length,
        editorLength: editorText.length,
      })
      
      // Definir las constantes de índices basadas en la búsqueda
      const startIndex = searchStartIndex + 1 // +1 porque TipTap usa posiciones basadas en 1
      const endIndex = startIndex + textToFind.length
    
      
      // Verificar que los índices calculados sean válidos
      if (startIndex >= editorText.length + 1 || endIndex > editorText.length + 1) {
        console.warn('Índices calculados fuera de rango:', { startIndex, endIndex, editorLength: editorText.length })
        return
      }
      
      // Guardar la selección actual
      const currentSelection = editor.state.selection
      
      // Aplicar highlight temporal sin cambiar la selección del usuario
      const { tr } = editor.state
      
      // Verificar que tenemos el schema correcto
      if (!editor.schema.marks.highlight) {
        console.warn('Mark highlight no disponible en el schema')
        return
      }
      
      tr.addMark(
        startIndex,
        endIndex,
        editor.schema.marks.highlight.create({ 
          class: 'bg-blue-200 px-1 rounded hover-highlight transition-colors duration-200' 
        })
      )
      
      // Restaurar la selección original
      tr.setSelection(currentSelection)
      
      editor.view.dispatch(tr)
    } catch (error) {
      console.error('Error al aplicar highlight de hover:', error)
    }
  }

  const removeHoverHighlight = () => {
    if (!editor) return
    
    try {
      // Guardar la selección actual
      const currentSelection = editor.state.selection
      const { tr, doc } = editor.state
      
      let modified = false
      doc.descendants((node, pos) => {
        if (node.isText && node.marks) {
          node.marks.forEach((mark) => {
            if (mark.type.name === 'highlight' && mark.attrs.class?.includes('hover-highlight')) {
              tr.removeMark(pos, pos + node.nodeSize, mark.type)
              modified = true
            }
          })
        }
      })
      
      if (modified) {
        // Restaurar la selección original
        tr.setSelection(currentSelection)
        editor.view.dispatch(tr)
      }
    } catch (error) {
      console.error('Error al remover highlight de hover:', error)
    }
  }

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
        highlightText: highlightTextOnHover,
        removeHoverHighlight: removeHoverHighlight,
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
          .tiptap-editor-container .ProseMirror .hover-highlight {
            background-color: #dbeafe !important;
            transition: background-color 0.2s ease;
            box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3);
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
