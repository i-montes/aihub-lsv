"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Suggestion, WordPressPost } from "@/types/proofreader"
import { ProofreaderEditor } from "@/components/proofreader/editor"
import { Statistics } from "@/components/proofreader/statistics"
import { SuggestionsPanel } from "@/components/proofreader/suggestions-panel"
import { WordPressSearchDialog } from "@/components/shared/wordpress-search-dialog"
import { ProofreaderHeader } from "@/components/proofreader/header"
import { ApiKeyRequiredModal } from "@/components/proofreader/api-key-required-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { analyzeText } from "@/actions/analyze-text"

const getProviderDisplayName = (provider: string): string => {
  switch (provider.toLowerCase()) {
    case "openai":
      return "OpenAI"
    case "anthropic":
      return "Anthropic"
    case "google":
      return "Google"
    default:
      return provider
  }
}

export default function ProofreaderPage() {
  // State
  const [originalText, setOriginalText] = useState("")
  const [correctedText, setCorrectedText] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [activeSuggestion, setActiveSuggestion] = useState<Suggestion | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState<{ model: string; provider: string }>({ model: "", provider: "" })
  const [modelProviderMap, setModelProviderMap] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState("original")
  const [appliedSuggestions, setAppliedSuggestions] = useState<Suggestion[]>([])
  const [stats, setStats] = useState<{ readabilityScore: number; grammarScore: number; styleScore: number }>({
    readabilityScore: 0,
    grammarScore: 0,
    styleScore: 0,
  })

  // Estado para el modal de API key requerida
  const [apiKeyStatus, setApiKeyStatus] = useState<{
    isLoading: boolean
    hasApiKey: boolean
    isAdmin: boolean
  }>({
    isLoading: true,
    hasApiKey: false,
    isAdmin: false,
  })

  // Refs
  const editorRef = useRef<{
    getHTML: () => string
    getText: () => string
    setContent: (content: string) => void
  } | null>(null)
  const editorContentRef = useRef<string>("")
  const correctedTextRef = useRef<string>("")

  // Hooks
  const router = useRouter()

  // Verificar si existe alguna API key al cargar la página
  useEffect(() => {
    checkApiKeyExists()
  }, [])

  // Efecto para restaurar el contenido del editor cuando se cambia al tab original
  useEffect(() => {
    if (activeTab === "original" && editorRef.current && editorContentRef.current) {
      // Pequeño retraso para asegurar que el editor esté listo
      const timer = setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.setContent(editorContentRef.current)
        }
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [activeTab])

  // Modificar la función scrollToSuggestion para cambiar al tab correcto y marcar el texto
  const scrollToSuggestion = (suggestion: Suggestion) => {
    setActiveSuggestion(suggestion)
    // Cambiar al tab de texto corregido
    setActiveTab("corrected")
  }

  // Añadir un nuevo efecto para resaltar el texto en el tab de texto corregido
  useEffect(() => {
    if (activeTab === "corrected" && activeSuggestion && correctedText) {
      // Pequeño retraso para asegurar que el DOM esté actualizado
      const timer = setTimeout(() => {
        highlightTextInCorrectedTab(activeSuggestion)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [activeTab, activeSuggestion, correctedText])

  // Añadir esta nueva función para resaltar el texto en el tab de texto corregido
  const highlightTextInCorrectedTab = (suggestion: Suggestion) => {
    try {
      // Obtener el contenedor del texto corregido
      const correctedContainer = document.querySelector(".tiptap-editor-container .prose")
      if (!correctedContainer) return

      // Eliminar cualquier resaltado previo
      const previousHighlights = correctedContainer.querySelectorAll(".suggestion-highlight")
      previousHighlights.forEach((el) => {
        const span = el as HTMLElement
        const parent = span.parentNode
        if (parent) {
          // Reemplazar el span con su contenido
          parent.replaceChild(document.createTextNode(span.textContent || ""), span)
          // Normalizar para combinar nodos de texto adyacentes
          parent.normalize()
        }
      })

      // Función para buscar y resaltar texto en nodos
      const findAndHighlightText = (node: Node, searchText: string): boolean => {
        // Si es un nodo de texto
        if (node.nodeType === Node.TEXT_NODE && node.textContent) {
          const text = node.textContent
          const index = text.indexOf(searchText)

          if (index >= 0) {
            // Dividir el nodo de texto en tres partes: antes, el texto a resaltar y después
            const before = text.substring(0, index)
            const highlight = text.substring(index, index + searchText.length)
            const after = text.substring(index + searchText.length)

            const span = document.createElement("span")
            span.textContent = highlight
            span.className = "suggestion-highlight"
            span.setAttribute("data-suggestion-id", suggestion.id)
            span.style.backgroundColor = "#FFEB3B"
            span.style.padding = "0 2px"
            span.style.borderRadius = "2px"

            const fragment = document.createDocumentFragment()
            if (before) fragment.appendChild(document.createTextNode(before))
            fragment.appendChild(span)
            if (after) fragment.appendChild(document.createTextNode(after))

            // Reemplazar el nodo original con el fragmento
            node.parentNode?.replaceChild(fragment, node)

            // Hacer scroll al elemento resaltado
            setTimeout(() => {
              span.scrollIntoView({ behavior: "smooth", block: "center" })
            }, 100)

            return true
          }
        }
        // Si es un elemento, buscar en sus hijos
        else if (node.nodeType === Node.ELEMENT_NODE) {
          // No buscar en elementos que no deberían contener texto editable
          const tagName = (node as Element).tagName.toLowerCase()
          if (tagName === "script" || tagName === "style") {
            return false
          }

          // Buscar en los hijos
          for (let i = 0; i < node.childNodes.length; i++) {
            if (findAndHighlightText(node.childNodes[i], searchText)) {
              return true
            }
          }
        }

        return false
      }

      // Buscar y resaltar el texto original de la sugerencia
      findAndHighlightText(correctedContainer, suggestion.original)
    } catch (error) {
      console.error("Error al resaltar texto en el tab corregido:", error)
    }
  }

  // Añadir estilos globales para la animación de resaltado
  useEffect(() => {
    // Crear un elemento de estilo
    const styleElement = document.createElement("style")
    styleElement.textContent = `
      @keyframes pulse-highlight {
        0% { background-color: #FFEB3B; }
        50% { background-color: #FFF59D; }
        100% { background-color: #FFEB3B; }
      }
      .suggestion-highlight {
        animation: pulse-highlight 2s infinite;
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
      }
      .applied-suggestion {
        background-color: #E3F2FD;
        padding: 0 2px;
        border-radius: 2px;
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
        transition: background-color 0.3s ease;
      }
    `
    // Añadir al head
    document.head.appendChild(styleElement)

    // Limpiar al desmontar
    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  // Functions
  const checkApiKeyExists = async () => {
    try {
      setApiKeyStatus((prev) => ({ ...prev, isLoading: true }))
      const supabase = getSupabaseClient()

      // Obtener la sesión del usuario actual
      const { data: userData } = await supabase.auth.getUser()

      if (!userData?.user) {
        setApiKeyStatus({ isLoading: false, hasApiKey: false, isAdmin: false })
        return
      }

      // Obtener el ID de la organización y el rol del usuario
      const { data: profileData, error: userError } = await supabase
        .from("profiles")
        .select("organizationId, role")
        .eq("id", userData.user.id)
        .single()

      if (userError || !profileData?.organizationId) {
        setApiKeyStatus({ isLoading: false, hasApiKey: false, isAdmin: false })
        return
      }

      // Verificar si el usuario es admin o propietario
      const isAdmin = profileData.role === "OWNER" || profileData.role === "ADMIN"

      // Verificar si existe alguna API key para esta organización y obtener sus modelos
      const { data: apiKeys, error: apiKeyError } = await supabase
        .from("api_key_table")
        .select("id, models, provider")
        .eq("organizationId", profileData.organizationId)
        .eq("status", "ACTIVE")

      if (apiKeyError) {
        console.error("Error al verificar API keys:", apiKeyError)
        setApiKeyStatus({ isLoading: false, hasApiKey: false, isAdmin })
        return
      }

      // Extraer todos los modelos disponibles de las API keys con su proveedor
      const allModels: string[] = []
      const map: Record<string, string> = {}
      apiKeys.forEach((key) => {
        if (key.models && Array.isArray(key.models)) {
          key.models.forEach((model) => {
            if (!allModels.includes(model)) {
              allModels.push(model)
              map[model] = key.provider || ""
            }
          })
        }
      })

      // Si hay al menos una API key, establecer hasApiKey como true
      setApiKeyStatus({ isLoading: false, hasApiKey: apiKeys.length > 0, isAdmin })

      // Establecer los modelos disponibles
      setAvailableModels(allModels)

      // Establecer el modelo seleccionado por defecto (el primero de la lista o vacío si no hay)
      if (apiKeys.length > 0 && allModels.length > 0) {
        const firstKey = apiKeys[0]
        const firstModel = allModels[0]
        setSelectedModel({
          model: firstModel,
          provider: firstKey.provider || "",
        })
      }

      setModelProviderMap(map)
    } catch (error) {
      console.error("Error al verificar API keys:", error)
      setApiKeyStatus({ isLoading: false, hasApiKey: false, isAdmin: false })
    }
  }

  const handleTextChange = (html: string) => {
    setOriginalText(html)
    // Guardar el contenido en la referencia para restaurarlo cuando sea necesario
    editorContentRef.current = html
  }

  const handleAnalyzeText = async () => {
    setIsAnalyzing(true)

    try {
      // Obtener el texto del editor
      const textContent = editorRef.current?.getText() || ""
      const htmlContent = editorRef.current?.getHTML() || ""

      // Guardar el contenido original
      setOriginalText(htmlContent)
      editorContentRef.current = htmlContent

      if (!textContent.trim()) {
        toast.error("El texto está vacío", {
          description: "Por favor, escribe algo para analizar.",
        })
        setIsAnalyzing(false)
        return
      }

      // Cambiar a la pestaña de texto corregido
      setActiveTab("corrected")

      // Llamar a la función de análisis de texto
      const result = await analyzeText(textContent, selectedModel)

      if (!result.success) {
        toast.error("Error al analizar el texto", {
          description: result.error || "Ocurrió un error inesperado.",
        })
        setIsAnalyzing(false)
        return
      }

      // Actualizar las sugerencias
      setSuggestions(result.correcciones)

      // Establecer el texto corregido (por ahora igual al original)
      setCorrectedText(htmlContent)
      correctedTextRef.current = htmlContent

      // Actualizar estadísticas basadas en las correcciones
      const totalErrors = result.correcciones.length
      const spellingErrors = result.correcciones.filter((c) => c.type === "spelling").length
      const grammarErrors = result.correcciones.filter((c) => c.type === "grammar").length
      const styleErrors = result.correcciones.filter((c) => c.type === "style").length
      const punctuationErrors = result.correcciones.filter((c) => c.type === "punctuation").length

      // Calcular puntuaciones basadas en la cantidad de errores
      const baseScore = 100
      const grammarScore = Math.max(0, baseScore - (grammarErrors + punctuationErrors) * 5)
      const styleScore = Math.max(0, baseScore - styleErrors * 3)
      const readabilityScore = Math.max(0, baseScore - totalErrors * 2)

      setStats({
        readabilityScore,
        grammarScore,
        styleScore,
      })

      // Si hay sugerencias, seleccionar la primera
      if (result.correcciones.length > 0) {
        setActiveSuggestion(result.correcciones[0])
      }

      // Reiniciar las sugerencias aplicadas
      setAppliedSuggestions([])

      toast.success("Análisis completado", {
        description: `Se encontraron ${totalErrors} sugerencias de mejora.`,
      })
    } catch (error) {
      console.error("Error al analizar el texto:", error)
      toast.error("Error al analizar el texto", {
        description: "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const copyText = async () => {
    if (!editorRef.current) return

    // Determinar qué texto copiar basado en el tab activo
    const textToCopy = activeTab === "corrected" ? correctedText : originalText

    if (!textToCopy) return

    try {
      const htmlContent = textToCopy

      const styledHtml = `
      <html>
        <head>
          <style>
            body { font-family: 'Georgia', serif; line-height: 1.6; }
            h1 { font-size: 1.8rem; margin-top: 1.5rem; margin-bottom: 0.75rem; font-weight: bold; }
            h2 { font-size: 1.5rem; margin-top: 1.5rem; margin-bottom: 0.75rem; font-weight: bold; }
            h3 { font-size: 1.25rem; margin-top: 1.5rem; margin-bottom: 0.75rem; font-weight: bold; }
            p { margin-bottom: 1rem; }
            a { color: #2563eb; text-decoration: underline; }
            ul, ol { padding-left: 1.5rem; margin-bottom: 1rem; }
            li { margin-bottom: 0.25rem; }
            blockquote { border-left: 3px solid #e5e7eb; padding-left: 1rem; font-style: italic; color: #4b5563; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `

      const blob = new Blob([styledHtml], { type: "text/html" })
      const plainTextBlob = new Blob([editorRef.current.getText()], { type: "text/plain" })

      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": blob,
          "text/plain": plainTextBlob,
        }),
      ])

      toast.success("Contenido copiado con formato", {
        description: "Ahora puedes pegarlo en Google Docs manteniendo el estilo.",
      })
    } catch (error) {
      console.error("Error al copiar con formato:", error)
      navigator.clipboard.writeText(textToCopy)
      toast.warning("Contenido copiado como texto plano", {
        description: "Es posible que se pierda el formato al pegar.",
      })
    }
  }

  const navigateSuggestions = (direction: "next" | "prev") => {
    if (!activeSuggestion || suggestions.length === 0) {
      setActiveSuggestion(suggestions[0])
      return
    }

    const currentIndex = suggestions.findIndex((s) => s.id === activeSuggestion.id)
    let newIndex

    if (direction === "next") {
      newIndex = (currentIndex + 1) % suggestions.length
    } else {
      newIndex = (currentIndex - 1 + suggestions.length) % suggestions.length
    }

    scrollToSuggestion(suggestions[newIndex])
  }

  // Función para aplicar una sugerencia
  const applySuggestion = (suggestion: Suggestion) => {
    try {
      // Obtener el contenedor del texto corregido
      const correctedContainer = document.querySelector(".tiptap-editor-container .prose")
      if (!correctedContainer) {
        console.error("No se encontró el contenedor del texto corregido")
        return
      }

      // Buscar el elemento resaltado correspondiente a esta sugerencia
      const highlightedElement = correctedContainer.querySelector(
        `.suggestion-highlight[data-suggestion-id="${suggestion.id}"]`,
      ) as HTMLElement

      if (highlightedElement) {
        // Crear un nuevo span para el texto corregido
        const correctedSpan = document.createElement("span")
        correctedSpan.textContent = suggestion.suggestion
        correctedSpan.className = "applied-suggestion"
        correctedSpan.title = `Corrección aplicada: "${suggestion.original}" → "${suggestion.suggestion}"`

        // Reemplazar el elemento resaltado con el texto corregido
        highlightedElement.parentNode?.replaceChild(correctedSpan, highlightedElement)

        // Actualizar el HTML corregido en el estado
        const newCorrectedHtml = correctedContainer.innerHTML
        setCorrectedText(newCorrectedHtml)
        correctedTextRef.current = newCorrectedHtml

        // Añadir a las sugerencias aplicadas
        setAppliedSuggestions((prev) => [...prev, suggestion])

        // Mostrar notificación de éxito
        toast.success("Corrección aplicada", {
          description: `Se ha aplicado la corrección: "${suggestion.original}" → "${suggestion.suggestion}"`,
        })
      } else {
        // Si no se encuentra el elemento resaltado, buscar y reemplazar directamente en el texto
        const parser = new DOMParser()
        const doc = parser.parseFromString(correctedText, "text/html")

        // Función recursiva para buscar y reemplazar texto
        const findAndReplaceText = (node: Node, searchText: string, replaceText: string): boolean => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent) {
            const text = node.textContent
            const index = text.indexOf(searchText)

            if (index >= 0) {
              // Dividir el nodo de texto en tres partes
              const before = text.substring(0, index)
              const after = text.substring(index + searchText.length)

              // Crear los nuevos nodos
              const beforeNode = document.createTextNode(before)
              const afterNode = document.createTextNode(after)
              const replacementSpan = document.createElement("span")
              replacementSpan.textContent = replaceText
              replacementSpan.className = "applied-suggestion"
              replacementSpan.title = `Corrección aplicada: "${searchText}" → "${replaceText}"`

              // Reemplazar el nodo original
              const fragment = document.createDocumentFragment()
              fragment.appendChild(beforeNode)
              fragment.appendChild(replacementSpan)
              fragment.appendChild(afterNode)

              node.parentNode?.replaceChild(fragment, node)
              return true
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            // No buscar en elementos script o style
            const tagName = (node as Element).tagName.toLowerCase()
            if (tagName === "script" || tagName === "style") {
              return false
            }

            // Buscar en los hijos (copia de la lista para evitar problemas al modificar durante la iteración)
            const childNodes = Array.from(node.childNodes)
            for (let i = 0; i < childNodes.length; i++) {
              if (findAndReplaceText(childNodes[i], searchText, replaceText)) {
                return true
              }
            }
          }
          return false
        }

        // Buscar y reemplazar el texto original por la sugerencia
        findAndReplaceText(doc.body, suggestion.original, suggestion.suggestion)

        // Actualizar el HTML corregido
        const newCorrectedHtml = doc.body.innerHTML
        setCorrectedText(newCorrectedHtml)
        correctedTextRef.current = newCorrectedHtml

        // Añadir a las sugerencias aplicadas
        setAppliedSuggestions((prev) => [...prev, suggestion])

        toast.success("Corrección aplicada", {
          description: `Se ha aplicado la corrección: "${suggestion.original}" → "${suggestion.suggestion}"`,
        })
      }
    } catch (error) {
      console.error("Error al aplicar la sugerencia:", error)
      toast.error("Error al aplicar la corrección", {
        description: "No se pudo aplicar la corrección. Por favor, inténtalo de nuevo.",
      })
    } finally {
      // Eliminar la sugerencia de la lista
      setSuggestions(suggestions.filter((s) => s.id !== suggestion.id))
      setActiveSuggestion(null)
    }
  }

  const ignoreSuggestion = (suggestionId: string) => {
    setSuggestions(suggestions.filter((s) => s.id !== suggestionId))
    setActiveSuggestion(null)

    toast.info("Sugerencia ignorada", {
      description: "La sugerencia ha sido eliminada de la lista.",
    })
  }

  const insertPostContent = (post: WordPressPost) => {
    console.log("Insertando contenido de WordPress:", post)

    if (editorRef.current) {
      try {
        // Obtener el título y contenido con formato HTML
        const title = post.title.rendered
        const content = post.content.rendered

        // Crear el contenido HTML completo
        const fullContent = `<h1>${title}</h1>\n${content}`

        // Insertar en el editor manteniendo el formato HTML completo
        editorRef.current.setContent(fullContent)

        // Actualizar el estado del texto original
        setOriginalText(fullContent)
        editorContentRef.current = fullContent

        // Cerrar el modal
        setDialogOpen(false)

        // Mostrar notificación de éxito
        toast.success("Contenido importado con éxito", {
          description: "El contenido de WordPress se ha insertado manteniendo el formato original.",
        })
      } catch (error) {
        console.error("Error al insertar contenido en el editor:", error)
        toast.error("Error al importar contenido", {
          description: "No se pudo insertar el contenido en el editor. Por favor, inténtalo de nuevo.",
        })
      }
    } else {
      console.error("Editor ref no encontrada")
      toast.error("Error al importar contenido", {
        description: "No se pudo acceder al editor. Por favor, recarga la página e inténtalo de nuevo.",
      })
    }
  }

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    const [model, provider] = value.split("|")
    setSelectedModel({ model, provider })
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  // Si está cargando, mostrar un estado de carga
  if (apiKeyStatus.isLoading) {
    return (
      <div className="container mx-auto h-[calc(100vh-122px)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]"></div>
          <p className="mt-4 text-gray-500">Cargando corrector de textos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto h-[calc(100vh-122px)] flex flex-col p-4 max-w-7xl overflow-hidden">
      {/* Modal de API key requerida */}
      <ApiKeyRequiredModal isOpen={!apiKeyStatus.hasApiKey} isAdmin={apiKeyStatus.isAdmin} />

      <div className="flex flex-col h-full space-y-4">
        <div className="flex justify-between items-center">
          <ProofreaderHeader onCopyText={copyText} hasText={!!originalText || !!correctedText} />
          <WordPressSearchDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onInsertContent={insertPostContent}
            buttonLabel="Importar de WordPress"
            dialogTitle="Importar contenido de WordPress"
            dialogDescription="Busca y selecciona un artículo de tu sitio WordPress para corregirlo"
            placeholder="Buscar artículos..."
            noResultsMessage="No se encontraron artículos para"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
          <div className="lg:col-span-2 overflow-hidden flex flex-col">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full h-full flex flex-col">
              <div className="flex items-center justify-between mb-4 bg-gray-50 p-2 rounded-lg shadow-sm border border-gray-100">
                <TabsList className="bg-white shadow-sm rounded-md border border-gray-200 p-1">
                  <TabsTrigger
                    value="original"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200 rounded-md"
                  >
                    Texto Original
                  </TabsTrigger>
                  <TabsTrigger
                    value="corrected"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200 rounded-md"
                  >
                    Texto Corregido
                  </TabsTrigger>
                </TabsList>
                <div className="relative">
                  <select
                    className="appearance-none w-64 h-10 rounded-md border border-gray-200 bg-white pl-4 pr-10 py-2 text-sm font-medium shadow-sm transition-all hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={`${selectedModel.model}|${selectedModel.provider}`}
                    onChange={handleModelChange}
                    disabled={availableModels.length === 0}
                  >
                    {availableModels.length > 0 ? (
                      availableModels.map((model) => (
                        <option key={model} value={`${model}|${modelProviderMap[model]}`}>
                          {model} ({getProviderDisplayName(modelProviderMap[model])})
                        </option>
                      ))
                    ) : (
                      <option value="|">No hay modelos disponibles</option>
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M2.5 4.5L6 8L9.5 4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <TabsContent value="original" className="flex-1 overflow-hidden h-full">
                <Card className="flex-1 overflow-hidden border-0 shadow-lg flex flex-col h-full">
                  <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
                    <ProofreaderEditor
                      onTextChange={handleTextChange}
                      onAnalyzeText={handleAnalyzeText}
                      isAnalyzing={isAnalyzing}
                      suggestions={suggestions}
                      activeSuggestion={activeSuggestion}
                      setActiveSuggestion={setActiveSuggestion}
                      navigateSuggestions={navigateSuggestions}
                      editorRef={editorRef}
                      initialContent={editorContentRef.current}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="corrected" className="flex-1 overflow-hidden h-full">
                <Card className="flex-1 overflow-hidden border-0 shadow-lg flex flex-col h-full">
                  <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
                    {isAnalyzing ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]"></div>
                          <p className="mt-4 text-gray-500">Analizando texto...</p>
                        </div>
                      </div>
                    ) : correctedText ? (
                      <div className="tiptap-editor-container h-full overflow-auto p-6">
                        <div className="prose max-w-none">
                          <div dangerouslySetInnerHTML={{ __html: correctedText }} />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <p>
                          Escribe texto en la pestaña "Texto Original" y haz clic en "Analizar texto" para ver el
                          resultado
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="overflow-hidden flex flex-col">
            <Card className="flex-1 border-0 shadow-lg flex flex-col overflow-hidden">
              <CardContent className="p-6 flex-1 flex flex-col overflow-hidden">
                <Statistics
                  readabilityScore={stats.readabilityScore}
                  grammarScore={stats.grammarScore}
                  styleScore={stats.styleScore}
                />

                <h2 className="text-xl font-semibold mb-4 text-gray-800">Sugerencias</h2>

                <SuggestionsPanel
                  suggestions={suggestions}
                  activeSuggestion={activeSuggestion}
                  onSuggestionClick={scrollToSuggestion}
                  onApplySuggestion={applySuggestion}
                  onIgnoreSuggestion={ignoreSuggestion}
                />

                {appliedSuggestions.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-md font-semibold mb-2 text-gray-700">Correcciones aplicadas</h3>
                    <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                      {appliedSuggestions.map((suggestion) => (
                        <div key={suggestion.id} className="text-xs mb-2 pb-2 border-b border-gray-200 last:border-0">
                          <span className="font-medium text-red-600 line-through">{suggestion.original}</span>
                          <span className="mx-2 text-gray-500">→</span>
                          <span className="font-medium text-green-600">{suggestion.suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
