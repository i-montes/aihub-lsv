"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Suggestion, WordPressPost, WordPressConnection } from "@/types/proofreader"
import { ProofreaderEditor } from "@/components/proofreader/editor"
import { Statistics } from "@/components/proofreader/statistics"
import { SuggestionsPanel } from "@/components/proofreader/suggestions-panel"
import { WordPressSearchDialog } from "@/components/proofreader/wordpress-search-dialog"
import { ProofreaderHeader } from "@/components/proofreader/header"
import { ApiKeyRequiredModal } from "@/components/proofreader/api-key-required-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const sampleSuggestions: Suggestion[] = [
  {
    id: "1",
    type: "grammar",
    original: "from 9 a.m. in the morning until 12 noon",
    suggestion: "from 9 a.m. until noon",
    explanation:
      "Redundant time references. '9 a.m.' already indicates morning, and '12 noon' can be simplified to 'noon'.",
    startIndex: 67,
    endIndex: 106,
    severity: 1,
  },
  {
    id: "2",
    type: "style",
    original: "had just given birth to a baby girl",
    suggestion: "had recently given birth to a girl",
    explanation: "Redundant wording. A birth is always for a baby, so 'baby' is unnecessary.",
    startIndex: 184,
    endIndex: 219,
    severity: 2,
  },
  {
    id: "3",
    type: "grammar",
    original: "kinda a handful",
    suggestion: "kind of a handful",
    explanation: "The informal 'kinda' should be 'kind of' in formal writing.",
    startIndex: 245,
    endIndex: 259,
    severity: 1,
  },
  {
    id: "4",
    type: "style",
    original: "the intense fury in his eyes",
    suggestion: "the anger in his eyes",
    explanation: "Overuse of adjectives. 'Intense fury' is redundant as fury is already intense.",
    startIndex: 358,
    endIndex: 385,
    severity: 2,
  },
  {
    id: "5",
    type: "spelling",
    original: "spelled out",
    suggestion: "spelt out",
    explanation: "In British English, 'spelt' is the preferred past tense form.",
    startIndex: 478,
    endIndex: 489,
    severity: 1,
  },
  {
    id: "6",
    type: "style",
    original: "may possibly have been",
    suggestion: "may have been",
    explanation: "'May' and 'possibly' are redundant together. Use one or the other.",
    startIndex: 584,
    endIndex: 605,
    severity: 1,
  },
  {
    id: "7",
    type: "grammar",
    original: "Slowly realising and imagining that",
    suggestion: "She slowly realized that",
    explanation: "Sentence fragment. Add a subject to make this a complete sentence.",
    startIndex: 615,
    endIndex: 649,
    severity: 3,
  },
]

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
  const [text, setText] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>(sampleSuggestions)
  const [activeSuggestion, setActiveSuggestion] = useState<Suggestion | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [searchResults, setSearchResults] = useState<WordPressPost[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [stats, setStats] = useState({
    readabilityScore: 85,
    grammarScore: 92,
    styleScore: 78,
  })
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
  const [dialogOpen, setDialogOpen] = useState(false)
  const [connectionVerified, setConnectionVerified] = useState(false)
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState<{ model: string; provider: string }>({ model: "", provider: "" })
  const [modelProviderMap, setModelProviderMap] = useState<Record<string, string>>({})

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

  // Hooks
  const router = useRouter()

  // Effects
  useEffect(() => {
    if (dialogOpen && !connectionVerified) {
      checkWordPressConnection()
    }
  }, [dialogOpen, connectionVerified])

  useEffect(() => {
    setHasSearched(false)
  }, [])

  // Verificar si existe alguna API key al cargar la página
  useEffect(() => {
    checkApiKeyExists()
  }, [])

  // Functions
  const checkApiKeyExists = async () => {
    try {
      setApiKeyStatus((prev) => ({ ...prev, isLoading: true }))
      const supabase = getSupabaseClient()

      // Obtener la sesión del usuario actual
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setApiKeyStatus({ isLoading: false, hasApiKey: false, isAdmin: false })
        return
      }

      // Obtener el ID de la organización y el rol del usuario
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("organizationId, role")
        .eq("id", session.user.id)
        .single()

      if (userError || !userData?.organizationId) {
        setApiKeyStatus({ isLoading: false, hasApiKey: false, isAdmin: false })
        return
      }

      // Verificar si el usuario es admin o propietario
      const isAdmin = userData.role === "OWNER" || userData.role === "ADMIN"

      // Verificar si existe alguna API key para esta organización y obtener sus modelos
      const { data: apiKeys, error: apiKeyError } = await supabase
        .from("api_key_table")
        .select("id, models, provider")
        .eq("organizationId", userData.organizationId)
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

  const checkWordPressConnection = async () => {
    try {
      setWordpressConnection((prev) => ({ ...prev, isLoading: true }))
      const supabase = getSupabaseClient()

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setWordpressConnection({ exists: false, isLoading: false })
        setConnectionVerified(true)
        return
      }

      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("organizationId, role")
        .eq("id", session.user.id)
        .single()

      if (userError || !userData?.organizationId) {
        setWordpressConnection({ exists: false, isLoading: false })
        setConnectionVerified(true)
        return
      }

      const { data: wpConnection, error: wpError } = await supabase
        .from("wordpress_integration_table")
        .select("*")
        .eq("organizationId", userData.organizationId)
        .eq("active", true)
        .single()

      if (wpError || !wpConnection || !wpConnection.site_url) {
        setWordpressConnection({
          exists: false,
          isLoading: false,
          userRole: userData.role,
        })
        setConnectionVerified(true)
        return
      }

      setWordpressConnection({
        exists: true,
        isLoading: false,
        userRole: userData.role,
        connectionData: wpConnection as WordPressConnection,
      })
      setConnectionVerified(true)
    } catch (error) {
      console.error("Error al verificar la conexión a WordPress:", error)
      setWordpressConnection({ exists: false, isLoading: false })
      setConnectionVerified(true)
    }
  }

  const handleTextChange = (html: string) => {
    setText(html)
  }

  const analyzeText = async () => {
    setIsAnalyzing(true)

    // Cambiar a la pestaña de texto corregido
    const tabsElement = document.querySelector('[data-value="corrected"]') as HTMLElement
    if (tabsElement) {
      tabsElement.click()
    }

    try {
      // Obtener el ID de la organización
      const supabase = getSupabaseClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("No hay sesión activa")
      }

      const { data: userData } = await supabase
        .from("profiles")
        .select("organizationId")
        .eq("id", session.user.id)
        .single()

      if (!userData?.organizationId) {
        throw new Error("No se pudo obtener el ID de la organización")
      }

      // Obtener el texto del editor
      const textContent = editorRef.current?.getText() || ""

      if (!textContent.trim()) {
        toast.error("El texto está vacío", {
          description: "Por favor, escribe algo para analizar.",
        })
        setIsAnalyzing(false)
        return
      }

      // Llamar al server action
      const result = await analyzeText(textContent, selectedModel, userData.organizationId)

      if (!result.success) {
        toast.error("Error al analizar el texto", {
          description: result.error || "Ocurrió un error inesperado.",
        })
        setIsAnalyzing(false)
        return
      }

      // Actualizar las sugerencias
      setSuggestions(result.correcciones)

      // Actualizar estadísticas basadas en las correcciones
      const totalErrors = result.correcciones.length
      const spellingErrors = result.correcciones.filter((c) => c.type === "spelling").length
      const grammarErrors = result.correcciones.filter((c) => c.type === "grammar").length
      const styleErrors = result.correcciones.filter((c) => c.type === "style").length

      // Calcular puntuaciones basadas en la cantidad de errores
      const baseScore = 100
      const grammarScore = Math.max(0, baseScore - grammarErrors * 5)
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

  const handleSearch = async (query: string) => {
    if (!query.trim() || !wordpressConnection.exists || !wordpressConnection.connectionData?.site_url) {
      setSearchError("No se pudo acceder a la URL de WordPress. Por favor, verifica la configuración de integración.")
      return
    }

    setIsSearching(true)
    setSearchError(null)
    setSearchResults([])
    setHasSearched(true)

    try {
      const { site_url: url } = wordpressConnection.connectionData

      const baseUrl = url.endsWith("/") ? url : `${url}/`
      const searchUrl = `${baseUrl}wp-json/wp/v2/posts?search=${encodeURIComponent(query)}&_embed&_fields=id,title,excerpt,content,link,date`

      const response = await fetch(searchUrl)

      if (!response.ok) {
        throw new Error(`Error al buscar en WordPress: ${response.status} ${response.statusText}`)
      }

      const posts = await response.json()
      const formattedResults = posts.map((post: any) => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        link: post.link,
        date: post.date,
      }))

      setSearchResults(formattedResults)
    } catch (error) {
      console.error("Error al buscar en WordPress:", error)
      setSearchError(error instanceof Error ? error.message : "Error desconocido al buscar en WordPress")
    } finally {
      setIsSearching(false)
    }
  }

  const navigateToWordPressSettings = () => {
    router.push("/dashboard/settings/wordpress")
    setDialogOpen(false)
  }

  const copyText = async () => {
    if (!editorRef.current || !text) return

    try {
      const htmlContent = text

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
      navigator.clipboard.writeText(text)
      toast.warning("Contenido copiado como texto plano", {
        description: "Es posible que se pierda el formato al pegar.",
      })
    }
  }

  const scrollToSuggestion = (suggestion: Suggestion) => {
    setActiveSuggestion(suggestion)
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

  const applySuggestion = (suggestion: Suggestion) => {
    setSuggestions(suggestions.filter((s) => s.id !== suggestion.id))
    setActiveSuggestion(null)
  }

  const ignoreSuggestion = (suggestionId: string) => {
    setSuggestions(suggestions.filter((s) => s.id !== suggestionId))
    setActiveSuggestion(null)
  }

  const insertPostContent = (post: WordPressPost) => {
    console.log("Intentando insertar contenido de WordPress:", post)

    if (editorRef.current) {
      console.log("Editor ref encontrada, insertando contenido...")

      // Obtener el título y contenido con formato HTML
      const title = post.title.rendered
      const content = post.content.rendered

      console.log("Título:", title)
      console.log("Contenido (primeros 100 caracteres):", content.substring(0, 100))

      try {
        // Insertar en el editor manteniendo el formato HTML completo
        editorRef.current.setContent(`<h1>${title}</h1>\n${content}`)
        console.log("Contenido insertado en el editor")

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
          <ProofreaderHeader onCopyText={copyText} hasText={!!text} />
          <WordPressSearchDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            wordpressConnection={wordpressConnection}
            onSearch={handleSearch}
            onNavigateToSettings={navigateToWordPressSettings}
            onInsertContent={insertPostContent}
            searchResults={searchResults}
            isSearching={isSearching}
            searchError={searchError}
            hasSearched={hasSearched}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
          <div className="lg:col-span-2 overflow-hidden flex flex-col">
            <Tabs defaultValue="original" className="w-full h-full flex flex-col">
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
                      onAnalyzeText={analyzeText}
                      isAnalyzing={isAnalyzing}
                      suggestions={suggestions}
                      activeSuggestion={activeSuggestion}
                      setActiveSuggestion={setActiveSuggestion}
                      navigateSuggestions={navigateSuggestions}
                      editorRef={editorRef}
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
                    ) : text ? (
                      <div className="tiptap-editor-container h-full overflow-auto p-6">
                        <div className="prose max-w-none">
                          <div dangerouslySetInnerHTML={{ __html: text }} />
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
