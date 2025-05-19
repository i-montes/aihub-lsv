"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  const [activeTab, setActiveTab] = useState("editor")
  const [title, setTitle] = useState("")
  const [toolText, setToolText] = useState("")

  const handleSubmit = () => {
    onSubmit({
      title,
      description: toolText,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] lg:max-w-[900px] w-[90vw] max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sidebar" />
            <span className="text-sidebar font-medium">Nueva Herramienta</span>
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ingresa un título para tu herramienta"
          />
        </div>

        <Tabs defaultValue="editor" value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <TabsList className="mb-4">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="config">Configuración</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="editor" className="h-full mt-0 data-[state=active]:flex-1">
              <ToolEditor promptText={toolText} onPromptChange={setToolText} lastEdited="" />
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
            <Button onClick={handleSubmit} disabled={!title || !toolText}>
              Crear herramienta
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
