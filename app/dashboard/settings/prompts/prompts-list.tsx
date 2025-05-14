"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SharePromptDialog } from "./share-prompt-dialog"
import { unsharePrompt, deletePrompt } from "@/lib/supabase/prompts"
import { Share, Edit, Trash, Globe, Users } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PromptsListProps {
  prompts: any[] // Tipo de los prompts
}

export function PromptsList({ prompts }: PromptsListProps) {
  const [sharingPrompt, setSharingPrompt] = useState<any>(null)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [promptToDelete, setPromptToDelete] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSharePrompt = (prompt: any) => {
    setSharingPrompt(prompt)
    setIsShareDialogOpen(true)
  }

  const handleUnsharePrompt = async (prompt: any) => {
    if (!prompt.sharingId) return
    setIsLoading(true)

    try {
      const result = await unsharePrompt(prompt.sharingId)
      if (result.success) {
        toast({
          title: "Prompt descompartido",
          description: "El prompt ya no está compartido con tu organización",
        })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo descompartir el prompt",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error al descompartir prompt:", err)
      toast({
        title: "Error",
        description: "Ocurrió un error al descompartir el prompt",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePrompt = async () => {
    if (!promptToDelete) return
    setIsLoading(true)

    try {
      const result = await deletePrompt(promptToDelete.id)
      if (result.success) {
        toast({
          title: "Prompt eliminado",
          description: "El prompt ha sido eliminado correctamente",
        })
        setIsDeleteDialogOpen(false)
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo eliminar el prompt",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error al eliminar prompt:", err)
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el prompt",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (prompts.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-500">No hay prompts disponibles</h3>
        <p className="text-sm text-gray-400 mt-1">Crea tu primer prompt para comenzar</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {prompts.map((prompt) => (
        <div key={prompt.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{prompt.title}</h3>
                {prompt.is_public && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Globe size={12} />
                    Público
                  </Badge>
                )}
                {prompt.isShared && (
                  <Badge variant="outline" className="flex items-center gap-1 bg-blue-50">
                    <Users size={12} />
                    Compartido contigo
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">{prompt.description || "Sin descripción"}</p>
            </div>
            <div className="flex items-center gap-2">
              {!prompt.isShared && (
                <Button variant="ghost" size="sm" onClick={() => handleSharePrompt(prompt)} title="Compartir prompt">
                  <Share size={16} />
                </Button>
              )}
              {prompt.isShared && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUnsharePrompt(prompt)}
                  title="Dejar de compartir"
                  disabled={isLoading}
                >
                  <Users size={16} className="text-blue-500" />
                </Button>
              )}
              {!prompt.isShared && (
                <Link href={`/dashboard/settings/prompts/${prompt.id}`}>
                  <Button variant="ghost" size="sm" title="Editar prompt">
                    <Edit size={16} />
                  </Button>
                </Link>
              )}
              {!prompt.isShared && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  title="Eliminar prompt"
                  onClick={() => {
                    setPromptToDelete(prompt)
                    setIsDeleteDialogOpen(true)
                  }}
                  disabled={isLoading}
                >
                  <Trash size={16} />
                </Button>
              )}
            </div>
          </div>
          <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm whitespace-pre-line">
            {prompt.content?.length > 200 ? `${prompt.content.substring(0, 200)}...` : prompt.content}
          </div>
        </div>
      ))}

      {sharingPrompt && (
        <SharePromptDialog
          isOpen={isShareDialogOpen}
          onClose={() => {
            setIsShareDialogOpen(false)
            router.refresh()
          }}
          prompt={sharingPrompt}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El prompt será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeletePrompt()
              }}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              {isLoading ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
