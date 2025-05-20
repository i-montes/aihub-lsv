"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import type { Tool } from "@/types/tool"

interface DeleteToolDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  tool: Tool | null
  onConfirm: () => void
}

/**
 * Dialog for confirming tool deletion
 */
export function DeleteToolDialog({ isOpen, onOpenChange, tool, onConfirm }: DeleteToolDialogProps) {
  if (!tool) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Eliminar herramienta</span>
          </DialogTitle>
          <DialogDescription>
            {tool.isDefault
              ? "No es posible eliminar una herramienta predeterminada. Estas herramientas son parte del sistema y no pueden ser eliminadas."
              : `¿Estás seguro de que deseas eliminar la herramienta "${tool.title}"? Esta acción no se puede deshacer.`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          {!tool.isDefault && (
            <Button variant="destructive" onClick={onConfirm}>
              Eliminar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
