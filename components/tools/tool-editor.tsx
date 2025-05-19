"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ToolEditorProps {
  promptText: string
  onPromptChange: (text: string) => void
  lastEdited: string
}

/**
 * Editor component for tool prompts with tabs for different prompt types
 */
export function ToolEditor({ promptText, onPromptChange, lastEdited }: ToolEditorProps) {
  const { toast } = useToast()
  const [activePrompt, setActivePrompt] = useState("main")
  const [prompts, setPrompts] = useState({
    main: promptText || "",
    followup: "Genera preguntas de seguimiento relevantes basadas en la respuesta anterior.",
    summary: "Resume los puntos clave de la conversación en formato de lista con viñetas.",
  })

  // Update the main prompt when promptText prop changes
  useEffect(() => {
    if (promptText !== prompts.main) {
      setPrompts((prev) => ({ ...prev, main: promptText }))
    }
  }, [promptText])

  // Update parent component when active prompt changes
  useEffect(() => {
    if (activePrompt === "main") {
      onPromptChange(prompts.main)
    }
  }, [prompts.main, activePrompt, onPromptChange])

  const handlePromptChange = (type: string, value: string) => {
    setPrompts((prev) => ({ ...prev, [type]: value }))
    if (type === "main") {
      onPromptChange(value)
    }
  }

  const copyActivePromptContent = () => {
    const content = prompts[activePrompt as keyof typeof prompts]
    navigator.clipboard
      .writeText(content)
      .then(() => {
        toast({
          title: "Contenido copiado",
          description: "El contenido ha sido copiado al portapapeles",
          duration: 3000,
        })
      })
      .catch((err) => {
        toast({
          title: "Error al copiar",
          description: "No se pudo copiar el contenido",
          variant: "destructive",
          duration: 3000,
        })
        console.error("Error al copiar:", err)
      })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="relative rounded-lg border border-gray-200 bg-gray-50 p-1 shadow-inner flex flex-col h-full">
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-3 py-2 rounded-t-md">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-sidebar" />
            <span className="text-sm font-medium">Editor Avanzado</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={copyActivePromptContent}
              title="Copiar contenido"
            >
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col h-full overflow-hidden">
          <Tabs
            defaultValue="main"
            value={activePrompt}
            onValueChange={setActivePrompt}
            className="flex flex-col h-full"
          >
            <div className="bg-white border-b border-gray-200 px-3 py-1">
              <TabsList className="h-8 bg-gray-100">
                <TabsTrigger value="main" className="text-xs h-6">
                  Principal
                </TabsTrigger>
                <TabsTrigger value="followup" className="text-xs h-6">
                  Seguimiento
                </TabsTrigger>
                <TabsTrigger value="summary" className="text-xs h-6">
                  Resumen
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <TabsContent
                value="main"
                className="h-full mt-0 data-[state=active]:flex flex-col data-[state=inactive]:hidden"
              >
                <Textarea
                  value={prompts.main}
                  onChange={(e) => handlePromptChange("main", e.target.value)}
                  placeholder="Escribe tu prompt principal aquí..."
                  className="flex-1 resize-none border-0 bg-transparent p-3 focus-visible:ring-0 focus-visible:ring-offset-0 h-full"
                />
              </TabsContent>

              <TabsContent
                value="followup"
                className="h-full mt-0 data-[state=active]:flex flex-col data-[state=inactive]:hidden"
              >
                <Textarea
                  value={prompts.followup}
                  onChange={(e) => handlePromptChange("followup", e.target.value)}
                  placeholder="Escribe tu prompt de seguimiento aquí..."
                  className="flex-1 resize-none border-0 bg-transparent p-3 focus-visible:ring-0 focus-visible:ring-offset-0 h-full"
                />
              </TabsContent>

              <TabsContent
                value="summary"
                className="h-full mt-0 data-[state=active]:flex flex-col data-[state=inactive]:hidden"
              >
                <Textarea
                  value={prompts.summary}
                  onChange={(e) => handlePromptChange("summary", e.target.value)}
                  placeholder="Escribe tu prompt de resumen aquí..."
                  className="flex-1 resize-none border-0 bg-transparent p-3 focus-visible:ring-0 focus-visible:ring-offset-0 h-full"
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
