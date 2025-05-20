"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RefreshCw, Search, AlertCircle, ExternalLink } from "lucide-react"
import type { WordPressPost, WordPressConnection } from "@/types/proofreader"

interface WordPressSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wordpressConnection: {
    exists: boolean
    isLoading: boolean
    userRole?: string
    connectionData?: WordPressConnection
  }
  onSearch: (query: string) => Promise<void>
  onNavigateToSettings: () => void
  onInsertContent: (post: WordPressPost) => void
  searchResults: WordPressPost[]
  isSearching: boolean
  searchError: string | null
  hasSearched: boolean
}

// Función para limpiar el HTML de los excerpts de WordPress
const stripHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(html, "text/html")
  return doc.body.textContent || ""
}

export function WordPressSearchDialog({
  open,
  onOpenChange,
  wordpressConnection,
  onSearch,
  onNavigateToSettings,
  onInsertContent,
  searchResults,
  isSearching,
  searchError,
  hasSearched,
}: WordPressSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const isAdmin = wordpressConnection.userRole === "OWNER" || wordpressConnection.userRole === "ADMIN"

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="shadow-sm hover:shadow-md transition-all bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:opacity-90"
        >
          <div className="flex items-center">
            <Image src="/wordpress-logo.png" alt="WordPress Logo" width={20} height={20} className="mr-2" />
            Buscar en WordPress
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Image src="/wordpress-logo.png" alt="WordPress Logo" width={24} height={24} className="mr-2" />
            Buscar en WordPress
            {wordpressConnection.connectionData?.siteName && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({wordpressConnection.connectionData.siteName})
              </span>
            )}
          </DialogTitle>
          <DialogDescription>Busca artículos y contenido en tu sitio de WordPress</DialogDescription>
        </DialogHeader>

        {wordpressConnection.isLoading ? (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        ) : wordpressConnection.exists ? (
          <>
            <form onSubmit={handleSearch} className="mt-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Escribe tu búsqueda..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>
            </form>
            <div className="mt-4 max-h-[300px] overflow-y-auto">
              {searchError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-700">{searchError}</p>
                </div>
              )}

              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((post) => (
                    // Modificar el div del resultado de búsqueda para que al hacer clic se inserte el contenido con formato
                    <div
                      key={post.id}
                      className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => onInsertContent(post)}
                      title="Haz clic para insertar este contenido en el editor manteniendo el formato"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">
                          {post.title.rendered ? stripHtml(post.title.rendered) : `Post #${post.id}`}
                        </h3>
                        <a
                          href={post.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                          onClick={(e) => e.stopPropagation()} // Evitar que el clic en el enlace active la inserción
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      {post.excerpt.rendered && (
                        <p className="text-sm text-gray-600 mt-1">
                          {post.excerpt.rendered ? stripHtml(post.excerpt.rendered) : ""}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{new Date(post.date).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : hasSearched && !isSearching ? (
                <div className="text-center py-8 text-gray-500">No se encontraron resultados para "{searchQuery}"</div>
              ) : null}
            </div>
          </>
        ) : (
          <div className="mt-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 font-medium">No hay conexión a WordPress</p>
                <p className="text-sm text-amber-700 mt-1">
                  {isAdmin
                    ? "Como administrador, puedes configurar la conexión a WordPress para tu organización."
                    : "Contacta al administrador para configurar la conexión a WordPress."}
                </p>
                {isAdmin && (
                  <Button
                    onClick={onNavigateToSettings}
                    className="mt-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:opacity-90"
                    size="sm"
                  >
                    Configurar ahora
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
