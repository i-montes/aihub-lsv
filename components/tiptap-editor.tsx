"use client"

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Code,
  Quote,
  Undo,
  Redo,
} from "lucide-react"
import { useState } from "react"

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  readOnly?: boolean
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder = "Escribe o pega tu texto aquí...",
  className = "",
  readOnly = false,
}: TiptapEditorProps) {
  const [linkUrl, setLinkUrl] = useState("")
  const [showLinkInput, setShowLinkInput] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose focus:outline-none min-h-[250px] max-w-none",
      },
    },
    editable: !readOnly,
  })

  if (!editor) {
    return null
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run()
      setLinkUrl("")
      setShowLinkInput(false)
    }
  }

  return (
    <div className={`border rounded-md bg-white ${className}`}>
      {!readOnly && (
        <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50">
          {/* Texto */}
          <div className="flex items-center space-x-1 border-r pr-2 mr-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive("bold") ? "bg-gray-200 text-sidebar" : ""}`}
              title="Negrita (Ctrl+B)"
              aria-label="Negrita"
            >
              <Bold size={16} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive("italic") ? "bg-gray-200 text-sidebar" : ""}`}
              title="Cursiva (Ctrl+I)"
              aria-label="Cursiva"
            >
              <Italic size={16} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive("underline") ? "bg-gray-200 text-sidebar" : ""}`}
              title="Subrayado (Ctrl+U)"
              aria-label="Subrayado"
            >
              <UnderlineIcon size={16} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive("strike") ? "bg-gray-200 text-sidebar" : ""}`}
              title="Tachado"
              aria-label="Tachado"
            >
              <Strikethrough size={16} />
            </button>
          </div>

          {/* Encabezados */}
          <div className="flex items-center space-x-1 border-r pr-2 mr-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive("heading", { level: 1 }) ? "bg-gray-200 text-sidebar" : ""}`}
              title="Encabezado 1"
              aria-label="Encabezado 1"
            >
              <Heading1 size={16} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive("heading", { level: 2 }) ? "bg-gray-200 text-sidebar" : ""}`}
              title="Encabezado 2"
              aria-label="Encabezado 2"
            >
              <Heading2 size={16} />
            </button>
          </div>

          {/* Listas */}
          <div className="flex items-center space-x-1 border-r pr-2 mr-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive("bulletList") ? "bg-gray-200 text-sidebar" : ""}`}
              title="Lista con viñetas"
              aria-label="Lista con viñetas"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive("orderedList") ? "bg-gray-200 text-sidebar" : ""}`}
              title="Lista numerada"
              aria-label="Lista numerada"
            >
              <ListOrdered size={16} />
            </button>
          </div>

          {/* Alineación */}
          <div className="flex items-center space-x-1 border-r pr-2 mr-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: "left" }) ? "bg-gray-200 text-sidebar" : ""}`}
              title="Alinear a la izquierda"
              aria-label="Alinear a la izquierda"
            >
              <AlignLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: "center" }) ? "bg-gray-200 text-sidebar" : ""}`}
              title="Centrar"
              aria-label="Centrar"
            >
              <AlignCenter size={16} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: "right" }) ? "bg-gray-200 text-sidebar" : ""}`}
              title="Alinear a la derecha"
              aria-label="Alinear a la derecha"
            >
              <AlignRight size={16} />
            </button>
          </div>

          {/* Otros */}
          <div className="flex items-center space-x-1 border-r pr-2 mr-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive("codeBlock") ? "bg-gray-200 text-sidebar" : ""}`}
              title="Bloque de código"
              aria-label="Bloque de código"
            >
              <Code size={16} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive("blockquote") ? "bg-gray-200 text-sidebar" : ""}`}
              title="Cita"
              aria-label="Cita"
            >
              <Quote size={16} />
            </button>
          </div>

          {/* Enlaces */}
          <div className="flex items-center space-x-1 border-r pr-2 mr-1">
            {!showLinkInput ? (
              <button
                type="button"
                onClick={() => setShowLinkInput(true)}
                className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive("link") ? "bg-gray-200 text-sidebar" : ""}`}
                title="Añadir enlace"
                aria-label="Añadir enlace"
              >
                <LinkIcon size={16} />
              </button>
            ) : (
              <div className="flex items-center">
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://ejemplo.com"
                  className="text-sm border rounded px-2 py-1 w-40"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addLink()
                    }
                    if (e.key === "Escape") {
                      e.preventDefault()
                      setShowLinkInput(false)
                      setLinkUrl("")
                    }
                  }}
                  autoFocus
                  aria-label="URL del enlace"
                />
                <button
                  type="button"
                  onClick={addLink}
                  className="ml-1 p-1 rounded bg-sidebar text-white text-xs"
                  aria-label="Añadir enlace"
                >
                  Añadir
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLinkInput(false)
                    setLinkUrl("")
                  }}
                  className="ml-1 p-1 rounded bg-gray-200 text-xs"
                  aria-label="Cancelar"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          {/* Deshacer/Rehacer */}
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Deshacer (Ctrl+Z)"
              aria-label="Deshacer"
            >
              <Undo size={16} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Rehacer (Ctrl+Y)"
              aria-label="Rehacer"
            >
              <Redo size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="p-3">
        <EditorContent editor={editor} className="min-h-[250px] focus:outline-none" />
      </div>

      {/* Menú flotante */}
      {editor && !readOnly && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex bg-white shadow-lg rounded-md border overflow-hidden">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1.5 ${editor.isActive("bold") ? "bg-gray-200" : ""}`}
              aria-label="Negrita"
            >
              <Bold size={14} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1.5 ${editor.isActive("italic") ? "bg-gray-200" : ""}`}
              aria-label="Cursiva"
            >
              <Italic size={14} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-1.5 ${editor.isActive("underline") ? "bg-gray-200" : ""}`}
              aria-label="Subrayado"
            >
              <UnderlineIcon size={14} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleLink({ href: "" }).run()}
              className={`p-1.5 ${editor.isActive("link") ? "bg-gray-200" : ""}`}
              aria-label="Enlace"
            >
              <LinkIcon size={14} />
            </button>
          </div>
        </BubbleMenu>
      )}
    </div>
  )
}
