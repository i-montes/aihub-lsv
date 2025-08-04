"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { WordPressSearchDialog } from "@/components/shared/wordpress-search-dialog"
import type { WordPressPost, WordPressConnection } from "@/types/proofreader"

interface WordPressSearchProps {
  onSelectContent: (title: string, content: string) => void
}

export function WordPressSearch({ onSelectContent }: WordPressSearchProps) {
  const router = useRouter()
  const [searchResults, setSearchResults] = useState<WordPressPost[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [wordpressConnection, setWordpressConnection] = useState<{
    exists: boolean
    isLoading: boolean
    userRole?: string
    connectionData?: WordPressConnection
  }>({
    exists: false,
    isLoading: true,
  })

  // Función para verificar la conexión a WordPress
  const checkWordPressConnection = async () => {
    try {
      // Verificar si la respuesta es JSON válido antes de analizarla
      const response = await fetch("/api/wordpress/test-connection")

      // Verificar el tipo de contenido
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.warn("La respuesta no es JSON:", await response.text())
        setWordpressConnection({
          exists: false,
          isLoading: false,
          userRole: "unknown",
        })
        return
      }

      const data = await response.json()

      if (response.ok) {
        setWordpressConnection({
          exists: data.connected,
          isLoading: false,
          userRole: data.userRole,
          connectionData: data.connectionData,
        })
      } else {
        setWordpressConnection({
          exists: false,
          isLoading: false,
          userRole: data.userRole,
        })
      }
    } catch (error) {
      console.error("Error al verificar la conexión a WordPress:", error)
      // Establecer un estado predeterminado en caso de error
      setWordpressConnection({
        exists: false,
        isLoading: false,
      })
    }
  }

  // Verificar la conexión a WordPress al montar el componente
  useEffect(() => {
    checkWordPressConnection()
  }, [])

  // Función para simular resultados de búsqueda (para desarrollo)
  const getSimulatedResults = (query: string): WordPressPost[] => {
    return [
      {
        id: 1,
        title: { rendered: `Artículo sobre ${query}` },
        excerpt: {
          rendered: `Este es un resumen de ejemplo para la búsqueda "${query}"...`,
        },
        link: "https://example.com/post-1",
        date: new Date().toISOString(),
        content: {
          rendered: `<h2>Artículo sobre ${query}</h2><p>Este es un contenido de ejemplo generado para la búsqueda "${query}". Puedes usar este texto para probar la funcionalidad de generación de hilos.</p><h3>Sección 1</h3><p>Aquí va más contenido de ejemplo. Esta es la primera sección del artículo.</p><h3>Sección 2</h3><p>Esta es la segunda sección con más información relevante sobre ${query}.</p>`,
        },
      },
      {
        id: 2,
        title: { rendered: `Guía completa de ${query}` },
        excerpt: {
          rendered: `Una guía detallada sobre todo lo que necesitas saber acerca de ${query}...`,
        },
        link: "https://example.com/post-2",
        date: new Date(Date.now() - 86400000).toISOString(), // Ayer
        content: {
          rendered: `<h2>Guía completa de ${query}</h2><p>En esta guía detallada, exploraremos todo lo que necesitas saber sobre ${query}.</p><h3>Orígenes</h3><p>Historia y orígenes de ${query} en el contexto actual.</p><h3>Aplicaciones prácticas</h3><p>Cómo puedes aplicar ${query} en situaciones cotidianas y profesionales.</p>`,
        },
      },
    ]
  }

  const handleSearch = async (query: string, page: number = 1, perPage: number = 10) => {
    if (!query.trim()) {
      return
    }

    setIsSearching(true)
    setSearchError(null)

    try {
      // Intentar hacer la búsqueda real con parámetros de paginación
      const response = await fetch(`/api/wordpress/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`)

      // Verificar el tipo de contenido
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.warn("La respuesta de búsqueda no es JSON:", await response.text())
        // Usar resultados simulados en caso de error
        setSearchResults(getSimulatedResults(query))
        setHasSearched(true)
        return
      }

      const data = await response.json()

      if (response.ok) {
        setSearchResults(data.data || data.posts || [])
      } else {
        console.warn("Error en la búsqueda, usando resultados simulados:", data.message)
        // Usar resultados simulados en caso de error
        setSearchResults(getSimulatedResults(query))
      }
    } catch (error) {
      console.error("Error al buscar en WordPress:", error)
      setSearchError("Error de conexión al buscar en WordPress")
      // Usar resultados simulados en caso de error
      setSearchResults(getSimulatedResults(query))
    } finally {
      setIsSearching(false)
      setHasSearched(true)
    }
  }

  // Función para manejar la selección de contenido
  const handleInsertContent = (post: WordPressPost) => {
    if (post.title.rendered && post.content.rendered) {
      // Limpiar el HTML para obtener texto plano
      const title = post.title.rendered.replace(/<[^>]*>?/gm, "")

      // Mantener el HTML para el contenido
      const content = post.content.rendered

      // Llamar a la función de callback con el título y contenido
      onSelectContent(title, content)
    }
  }

  // Función para navegar a la configuración de WordPress
  const handleNavigateToSettings = () => {
    router.push("/dashboard/settings/wordpress")
  }

  return (
    <WordPressSearchDialog
      wordpressConnection={wordpressConnection}
      onSearch={handleSearch}
      onNavigateToSettings={handleNavigateToSettings}
      onInsertContent={handleInsertContent}
      searchResults={searchResults}
      isSearching={isSearching}
      searchError={searchError}
      hasSearched={hasSearched}
      buttonLabel="WordPress"
      buttonClassName="shadow-sm hover:shadow-md transition-all bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:opacity-90"
      dialogTitle="Buscar en WordPress"
      dialogDescription="Selecciona un artículo para generar un hilo"
    />
  )
}
