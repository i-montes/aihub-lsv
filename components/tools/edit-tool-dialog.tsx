"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { BarChart2, Edit2 } from "lucide-react"
import { ToolEditor } from "@/components/tools/tool-editor"
import { ToolConfig } from "@/components/tools/tool-config"
import type { Tool } from "@/types/tool"

interface EditToolDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  tool: Tool | null
  onSave: (tool: Tool) => void
}

/**
 * Dialog for editing an existing tool
 */
export function EditToolDialog({ isOpen, onOpenChange, tool, onSave }: EditToolDialogProps) {
  const [activeTab, setActiveTab] = useState("editor")
  const [toolText, setToolText] = useState(
    tool?.description ||
      "Analiza esta noticia y proporciona un resumen de los puntos clave, posibles sesgos y contexto histórico relevante.",
  )

  if (!tool) return null

  const handleSave = () => {
    if (tool) {
      onSave({
        ...tool,
        description: toolText,
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] lg:max-w-[900px] w-[90vw] max-h-[85vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="h-5 w-5 text-sidebar" />
            <div>
              <span className="text-sidebar font-medium">{tool.title}</span>
              <span className="text-xs text-gray-500 block">Última edición: hace 2 días</span>
            </div>
          </DialogTitle>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
              <BarChart2 className="h-4 w-4 text-sidebar" />
              <span className="text-sm font-medium">{tool.usageCount}</span>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="editor" value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <TabsList className="mb-4">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="config">Configuración</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="editor" className="h-full mt-0 data-[state=active]:flex-1">
              <ToolEditor promptText={toolText} onPromptChange={setToolText} lastEdited="hace 2 días" />
            </TabsContent>

            <TabsContent value="config" className="h-full mt-0 data-[state=active]:flex-1">
              <div className="h-full overflow-y-auto pr-2">
                <ToolConfig />
              </div>
            </TabsContent>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Guardar cambios</Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
