"use client"

import { Button } from "@/components/ui/button"
import { X, ExternalLink, FileText } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export type WordPressPost = {
  id: number
  title: {
    rendered: string
  }
  excerpt: {
    rendered: string
  }
  content: {
    rendered: string
  }
  link: string
  date: string
}

interface SelectedContentModalProps {
  selectedContent: WordPressPost[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onRemovePost: (postId: number) => void
  onClearAll: () => void
  onAddMore: () => void
}

export function SelectedContentModal({
  selectedContent,
  open,
  onOpenChange,
  onRemovePost,
  onClearAll,
  onAddMore,
}: SelectedContentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Artículos Seleccionados ({selectedContent.length})
          </DialogTitle>
          <DialogDescription>
            Gestiona los artículos seleccionados para generar el resumen
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 mt-4">
          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddMore}
              >
                <FileText className="h-3 w-3 mr-1" />
                Agregar más
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-3 w-3 mr-1" />
              Limpiar todo
            </Button>
          </div>
          
          {/* Selected articles list */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {selectedContent.map((post, index) => (
              <div
                key={post.id}
                className="p-4 bg-gray-50 rounded-lg border flex items-start justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      #{index + 1}
                    </span>
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {post.title.rendered.replace(/<[^>]*>/g, '')}
                    </h4>
                  </div>
                  {post.excerpt.rendered && (
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {post.excerpt.rendered.replace(/<[^>]*>/g, '')}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(post.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-1 ml-3">
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 p-1"
                    title="Ver artículo"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemovePost(post.id)}
                    className="text-red-500 hover:text-red-700 p-1 h-auto"
                    title="Eliminar artículo"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer */}
          <div className="border-t pt-4 flex justify-end">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
