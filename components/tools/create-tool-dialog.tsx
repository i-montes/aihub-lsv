"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Sparkles } from "lucide-react"
import { ToolEditor } from "@/components/tools/tool-editor"
import { ToolConfig } from "@/components/tools/tool-config"

interface CreateToolDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
}

/**
 * Dialog for creating a new tool
 */
export function CreateToolDialog({ isOpen, onOpenChange, onSubmit }: CreateToolDialogProps) {
  const [title, setTitle] = useState("")
  const [toolText, setToolText] = useState("")
  const [schema, setSchema] = useState<any>({
    type: "object",
    required: ["correcciones"],
    properties: {
      correcciones: {
        type: "array",
        items: {
          type: "object",
          required: ["original", "suggestion", "type", "explanation"],
          properties: {
            type: {
              enum: ["spelling", "grammar", "style"],
              type: "string",
              description: "Tipo de error: spelling | grammar | style",
            },
            original: {
              type: "string",
              description: "Fragmento del texto original con error",
            },
            suggestion: {
              type: "string",
              description: "Corrección sugerida para el error",
            },
            explanation: {
              type: "string",
              description: "Explicación de la corrección",
            },
          },
        },
      },
    },
  })
  const [temperature, setTemperature] = useState(0.7)
  const [topP, setTopP] = useState(1)
  const [category, setCategory] = useState("analysis")

  const handleSubmit = () => {
    onSubmit({
      title,
      description: toolText,
      schema,
      temperature,
      topP,
      category,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] lg:max-w-[1000px] w-[95vw] max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sidebar" />
            <span className="text-sidebar font-medium">Nueva Herramienta</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row h-[calc(90vh-180px)]">
          {/* Left column - Prompt Editor */}
          <div className="flex-1 border-r overflow-hidden">
            <div className="p-4 h-full">
              <div className="h-full">
                <ToolEditor
                  promptText={toolText}
                  onPromptChange={setToolText}
                  title={title}
                  onTitleChange={setTitle}
                  lastEdited=""
                />
              </div>
            </div>
          </div>

          {/* Right column - Configuration */}
          <div className="w-full md:w-[350px] lg:w-[400px] overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium mb-3 text-gray-700">Configuración</h3>

              <div className="mb-4">
                <Label htmlFor="category" className="text-sm font-medium text-gray-700 mb-1 block">
                  Categoría
                </Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                >
                  <option value="analysis">Análisis</option>
                  <option value="headlines">Titulares</option>
                  <option value="factcheck">Fact-checking</option>
                  <option value="summary">Resumen</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <ToolConfig
                schema={schema}
                onSchemaChange={setSchema}
                temperature={temperature}
                onTemperatureChange={setTemperature}
                topP={topP}
                onTopPChange={setTopP}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.05)] sticky bottom-0 z-10">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!title || !toolText}>
            Crear herramienta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
