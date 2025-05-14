"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TrashIcon } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteResource } from "./resource-actions"
import { useToast } from "@/components/ui/use-toast"

interface DeleteResourceButtonProps {
  resourceId: string
  resourceTitle: string
}

export function DeleteResourceButton({ resourceId, resourceTitle }: DeleteResourceButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  async function handleDelete() {
    setIsDeleting(true)

    try {
      const result = await deleteResource(resourceId)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Recurso eliminado",
          description: "El recurso ha sido eliminado exitosamente",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el recurso",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará el recurso <strong>{resourceTitle}</strong> y no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
