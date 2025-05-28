"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { getSupabaseClient } from "@/lib/supabase/client"

interface WordPressSearchDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSearch?: (query: string) => Promise<void>
  onNavigateToSettings?: () => void
  onInsertContent: (post: WordPressPost) => void
  searchResults?: WordPressPost[]
  isSearching?: boolean
  searchError?: string | null
  hasSearched?: boolean
  buttonLabel?: string
  buttonClassName?: string
  buttonSize?: "default" | "sm" | "lg" | "icon"
  dialogTitle?: string
  dialogDescription?: string
  placeholder?: string
  noConnectionMessage?: string
  noResultsMessage?: string
}

// Función para limpiar el HTML de los excerpts de WordPress
const stripHtml = (html: string) => {
  if (typeof window !== "undefined") {
    const doc = new DOMParser().parseFromString(html, "text/html")
    return doc.body.textContent || ""
  }
  return html.replace(/<[^>]*>?/gm, "")
}

export function WordPressSearchDialog({
  open,
  onOpenChange,
  onSearch: externalOnSearch,
  onNavigateToSettings: externalOnNavigateToSettings,
  onInsertContent,
  searchResults: externalSearchResults,
  isSearching: externalIsSearching,
  searchError: externalSearchError,
  hasSearched: externalHasSearched,
  buttonLabel = "Buscar en WordPress",
  buttonClassName = "shadow-sm hover:shadow-md transition-all bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:opacity-90",
  buttonSize = "sm",
  dialogTitle = "Buscar en WordPress",
  dialogDescription = "Busca artículos y contenido en tu sitio de WordPress",
  placeholder = "Escribe tu búsqueda...",
  noConnectionMessage = "No hay conexión a WordPress",
  noResultsMessage = "No se encontraron resultados para",
}: WordPressSearchDialogProps) {
  // Estado interno para la conexión a WordPress
  const [wordpressConnection, setWordpressConnection] = useState<{
    exists: boolean
    isLoading: boolean
    userRole?: string
    connectionData?: WordPressConnection
  }>({
    exists: false,
    isLoading: true,
    userRole: undefined,
    connectionData: undefined,
  })

  // Estados internos para la búsqueda
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(open || false)
  const [internalSearchResults, setInternalSearchResults] = useState<WordPressPost[]>([])
  const [internalIsSearching, setInternalIsSearching] = useState(false)
  const [internalSearchError, setInternalSearchError] = useState<string | null>(null)
  const [internalHasSearched, setInternalHasSearched] = useState(false)

  // Usar estados externos si se proporcionan, de lo contrario usar los internos
  const searchResults = externalSearchResults || internalSearchResults
  const isSearching = externalIsSearching !== undefined ? externalIsSearching : internalIsSearching
  const searchError = externalSearchError !== undefined ? externalSearchError : internalSearchError
  const hasSearched = externalHasSearched !== undefined ? externalHasSearched : internalHasSearched

  const isAdmin = wordpressConnection.userRole === "OWNER" || wordpressConnection.userRole === "ADMIN"

  // Función para verificar la conexión a WordPress
  const checkWordPressConnection = async () => {
    try {
      setWordpressConnection((prev) => ({ ...prev, isLoading: true }))
      const supabase = getSupabaseClient()

      // Obtener la sesión del usuario
      const { data: userData } = await supabase.auth.getUser()

      if (!userData?.user) {
        setWordpressConnection({ exists: false, isLoading: false })
        return
      }

      // Obtener el perfil del usuario
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("organizationId, role")
        .eq("id", userData.user.id)
        .single()

      if (profileError || !profileData?.organizationId) {
        setWordpressConnection({ exists: false, isLoading: false })
        return
      }

      // Verificar si existe una conexión a WordPress
      const { data: wpConnection, error: wpError } = await supabase
        .from("wordpress_integration_table")
        .select("*")
        .eq("organizationId", profileData.organizationId)
        .eq("active", true)
        .single()

      if (wpError || !wpConnection || !wpConnection.site_url) {
        setWordpressConnection({
          exists: false,
          isLoading: false,
          userRole: profileData.role,
        })
        return
      }

      // Conexión exitosa
      setWordpressConnection({
        exists: true,
        isLoading: false,
        userRole: profileData.role,
        connectionData: wpConnection as WordPressConnection,
      })
    } catch (error) {
      console.error("Error al verificar la conexión a WordPress:", error)
      setWordpressConnection({ exists: false, isLoading: false })
    }
  }

  // Función interna para buscar en WordPress
  const internalOnSearch = async (query: string) => {
    if (!wordpressConnection.exists || !wordpressConnection.connectionData) {
      setInternalSearchError("No hay conexión a WordPress configurada")
      return
    }

    try {
      setInternalIsSearching(true)
      setInternalSearchError(null)

      const response = await fetch(`/api/wordpress/search?query=${encodeURIComponent(query)}`)

      // Verificar si la respuesta es JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.warn("La respuesta no es JSON:", await response.text())
        setInternalSearchError("Error en la respuesta del servidor")
        setInternalIsSearching(false)
        setInternalHasSearched(true)
        return
      }

      const data = await response.json()

      if (!response.ok) {
        setInternalSearchError(data.message || "Error al buscar en WordPress")
        setInternalSearchResults([])
      } else {
        setInternalSearchResults(data)
      }
    } catch (error) {
      console.error("Error al buscar en WordPress:", error)
      setInternalSearchError("Error al conectar con WordPress")
      setInternalSearchResults([])
    } finally {
      setInternalIsSearching(false)
      setInternalHasSearched(true)
    }
  }

  // Función para navegar a la configuración
  const internalOnNavigateToSettings = () => {
    setDialogOpen(false)
    // Navegar a la página de configuración de WordPress
    window.location.href = "/dashboard/settings/wordpress"
  }

  // Usar la función de búsqueda externa si se proporciona, de lo contrario usar la interna
  const onSearch = externalOnSearch || internalOnSearch

  // Usar la función de navegación externa si se proporciona, de lo contrario usar la interna
  const onNavigateToSettings = externalOnNavigateToSettings || internalOnNavigateToSettings

  const handleOpenChange = (newOpen: boolean) => {
    setDialogOpen(newOpen)
    if (onOpenChange) {
      onOpenChange(newOpen)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  // Verificar la conexión a WordPress al montar el componente
  useEffect(() => {
    checkWordPressConnection()
  }, [])

  return (
    <Dialog open={open !== undefined ? open : dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size={buttonSize} className={buttonClassName}>
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
            {dialogTitle}
            {wordpressConnection.connectionData?.siteName && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({wordpressConnection.connectionData.siteName})
              </span>
            )}
          </DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
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
                  placeholder={placeholder}
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
                <div className="text-center py-8 text-gray-500">
                  {noResultsMessage} "{searchQuery}"
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <div className="mt-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 font-medium">{noConnectionMessage}</p>
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
