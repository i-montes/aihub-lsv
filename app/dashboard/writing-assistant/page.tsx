"use client"

import type React from "react"

import { useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Heading from "@tiptap/extension-heading"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  LinkIcon,
  ImageIcon,
  Undo,
  Redo,
  Save,
  Download,
  FileText,
  Sparkles,
  Wand2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Layout } from "@/components/layout"

export default function WritingAssistant() {
  const [content, setContent] = useState<string>("")
  const [title, setTitle] = useState<string>("Documento sin título")
  const [aiAssistEnabled, setAiAssistEnabled] = useState<boolean>(true)
  const [currentTab, setCurrentTab] = useState<string>("editor")
  const [suggestions, setSuggestions] = useState<string[]>([
    "Mejorar la claridad de la introducción",
    "Añadir más detalles sobre el tema principal",
    "Revisar la estructura de los párrafos para mejorar el flujo",
  ])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Comienza a escribir o usa el asistente de IA para generar contenido...",
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML())
    },
  })

  const MenuBar = () => {
    if (!editor) {
      return null
    }

    return (
      <div className="flex flex-wrap items-center gap-1 p-1 border-b border-gray-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-gray-100" : ""}
          aria-label="Negrita"
        >
          <Bold className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-gray-100" : ""}
          aria-label="Cursiva"
        >
          <Italic className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive("heading", { level: 1 }) ? "bg-gray-100" : ""}
          aria-label="Título 1"
        >
          <Heading1 className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "bg-gray-100" : ""}
          aria-label="Título 2"
        >
          <Heading2 className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-gray-100" : ""}
          aria-label="Lista con viñetas"
        >
          <List className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-gray-100" : ""}
          aria-label="Lista numerada"
        >
          <ListOrdered className="size-4" />
        </Button>
        <div className="h-4 w-px bg-gray-200 mx-1"></div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? "bg-gray-100" : ""}
          aria-label="Alinear a la izquierda"
        >
          <AlignLeft className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={editor.isActive({ textAlign: "center" }) ? "bg-gray-100" : ""}
          aria-label="Centrar"
        >
          <AlignCenter className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? "bg-gray-100" : ""}
          aria-label="Alinear a la derecha"
        >
          <AlignRight className="size-4" />
        </Button>
        <div className="h-4 w-px bg-gray-200 mx-1"></div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = window.prompt("URL")
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
          }}
          className={editor.isActive("link") ? "bg-gray-100" : ""}
          aria-label="Insertar enlace"
        >
          <LinkIcon className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = window.prompt("URL de la imagen")
            if (url) {
              editor.chain().focus().setImage({ src: url }).run()
            }
          }}
          aria-label="Insertar imagen"
        >
          <ImageIcon className="size-4" />
        </Button>
        <div className="h-4 w-px bg-gray-200 mx-1"></div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          aria-label="Deshacer"
        >
          <Undo className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          aria-label="Rehacer"
        >
          <Redo className="size-4" />
        </Button>
      </div>
    )
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const handleSave = () => {
    // Aquí iría la lógica para guardar el documento
    console.log("Guardando:", { title, content })
  }

  const handleExport = () => {
    // Lógica para exportar el documento
    const element = document.createElement("a")
    const file = new Blob([content], { type: "text/html" })
    element.href = URL.createObjectURL(file)
    element.download = `${title.replace(/\s+/g, "-").toLowerCase()}.html`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleAIAssist = (prompt: string) => {
    // Aquí iría la integración con la IA para generar o mejorar contenido
    console.log("Solicitando asistencia de IA:", prompt)
    // Simulación de respuesta de IA
    setTimeout(() => {
      if (editor) {
        editor.commands.insertContent("<p>Contenido generado por IA basado en tu solicitud.</p>")
      }
    }, 1000)
  }

  return (
    <Layout>
      <div className="flex flex-col h-full w-full overflow-hidden bg-white rounded-lg shadow">
        {/* Barra superior con título y acciones */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <FileText className="text-primary size-5" />
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-0 w-64"
              aria-label="Título del documento"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="size-4 mr-1" />
              Exportar
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="size-4 mr-1" />
              Guardar
            </Button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex flex-1 overflow-hidden">
          {/* Editor */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <MenuBar />
            <div className="flex-1 overflow-auto p-4">
              <EditorContent editor={editor} className="prose max-w-none h-full" />
            </div>
          </div>

          {/* Panel lateral de asistente */}
          {aiAssistEnabled && (
            <div className="w-80 border-l overflow-auto">
              <Tabs defaultValue="suggestions" className="w-full">
                <div className="px-4 pt-4 pb-2 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Asistente de IA</h3>
                    <div className="flex items-center">
                      <Switch id="ai-toggle" checked={aiAssistEnabled} onCheckedChange={setAiAssistEnabled} size="sm" />
                      <Label htmlFor="ai-toggle" className="ml-2 text-xs">
                        Activado
                      </Label>
                    </div>
                  </div>
                  <TabsList className="w-full">
                    <TabsTrigger value="suggestions" className="flex-1 text-xs">
                      Sugerencias
                    </TabsTrigger>
                    <TabsTrigger value="generate" className="flex-1 text-xs">
                      Generar
                    </TabsTrigger>
                    <TabsTrigger value="improve" className="flex-1 text-xs">
                      Mejorar
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="suggestions" className="p-4 space-y-3">
                  <p className="text-xs text-muted-foreground">Sugerencias basadas en tu contenido actual:</p>
                  {suggestions.map((suggestion, index) => (
                    <Card key={index} className="p-3 cursor-pointer hover:bg-gray-50">
                      <div className="flex items-start gap-2">
                        <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs">{suggestion}</p>
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="generate" className="p-4">
                  <p className="text-xs text-muted-foreground mb-3">Genera nuevo contenido con IA:</p>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Describe el contenido que quieres generar..."
                      className="text-sm resize-none"
                      rows={4}
                    />
                    <Button className="w-full" onClick={() => handleAIAssist("generate")}>
                      <Wand2 className="size-4 mr-1" />
                      Generar contenido
                    </Button>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <Button variant="outline" size="sm" className="text-xs justify-start">
                        Introducción
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs justify-start">
                        Conclusión
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs justify-start">
                        Párrafo explicativo
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs justify-start">
                        Lista de beneficios
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="improve" className="p-4">
                  <p className="text-xs text-muted-foreground mb-3">Mejora tu texto seleccionado:</p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="text-xs justify-start">
                        Mejorar redacción
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs justify-start">
                        Más formal
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs justify-start">
                        Más conciso
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs justify-start">
                        Más detallado
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs justify-start">
                        Corregir gramática
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs justify-start">
                        Simplificar
                      </Button>
                    </div>

                    <Textarea
                      placeholder="O describe cómo quieres mejorar el texto seleccionado..."
                      className="text-sm resize-none mt-2"
                      rows={4}
                    />

                    <Button className="w-full" onClick={() => handleAIAssist("improve")}>
                      <Sparkles className="size-4 mr-1" />
                      Mejorar selección
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
