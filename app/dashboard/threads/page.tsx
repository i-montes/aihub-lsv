"use client"

import { useState, useEffect, useRef } from "react"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  MoreHorizontal,
  Trash2,
  Edit,
  Copy,
  ArrowUp,
  ArrowDown,
  MessageSquarePlus,
  Sparkles,
  RefreshCw,
  Link2,
  Share2,
  Check,
  Loader2,
  Globe,
  Search,
  Calendar,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

export default function ThreadsPage() {
  const { toast } = useToast()
  const [newsUrl, setNewsUrl] = useState("")
  const [newsContent, setNewsContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)
  const [threadLength, setThreadLength] = useState(5)
  const [activeTab, setActiveTab] = useState("url")
  const [generatedThread, setGeneratedThread] = useState<string[]>([])
  const [tone, setTone] = useState("informativo")
  const [addEmojis, setAddEmojis] = useState(true)
  const [addHashtags, setAddHashtags] = useState(true)
  const [customHashtags, setCustomHashtags] = useState("")
  const [hashtagPosition, setHashtagPosition] = useState("end")
  const [addNumbering, setAddNumbering] = useState(true)
  const [addCTA, setAddCTA] = useState(false)
  const [ctaType, setCtaType] = useState("follow")
  const [customCTA, setCustomCTA] = useState("")
  const [addSources, setAddSources] = useState(true)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Array<{ id: number; title: string; date: string }>>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedWordpressPost, setSelectedWordpressPost] = useState<number | null>(null)
  const [wordpressPostList, setWordpressPostList] = useState<Array<{ id: number; title: string; excerpt: string }>>([])
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Efecto para manejar clics fuera del dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Efecto para manejar la búsqueda asíncrona
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.length >= 3) {
      setIsSearching(true)
      searchTimeoutRef.current = setTimeout(() => {
        // Simulación de búsqueda asíncrona
        const mockResults = [
          { id: 1, title: "La nueva política energética y su impacto", date: "12 Abr 2023" },
          { id: 2, title: "10 consejos para reducir tu huella de carbono", date: "05 Mar 2023" },
          { id: 3, title: "Entrevista: El futuro de las energías renovables", date: "28 Feb 2023" },
          { id: 4, title: "Análisis: ¿Es viable la transición energética?", date: "15 Ene 2023" },
        ].filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))

        setSearchResults(mockResults)
        setIsSearching(false)
        setShowDropdown(true)
      }, 500)
    } else {
      setShowDropdown(false)
      setSearchResults([])
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  // Simular la generación de un hilo
  const generateThread = () => {
    setIsGenerating(true)

    // Simular carga
    setTimeout(() => {
      const mockThread = [
        "🔥 ÚLTIMA HORA: La nueva política energética ha sido aprobada por el congreso tras meses de debate. Esto cambiará significativamente cómo las empresas operan en el sector. Abro hilo para explicar los detalles y su impacto. 👇 #Energía #NuevaPolítica",
        "1️⃣ La política incluye un aumento del 20% en inversiones para energías renovables, especialmente solar y eólica. Esto podría generar 15.000 nuevos empleos en los próximos 3 años y reducir la dependencia de combustibles fósiles.",
        "2️⃣ Se establece un sistema de incentivos fiscales para empresas que reduzcan su huella de carbono. Las compañías podrán obtener deducciones de hasta el 15% si implementan tecnologías limpias en sus operaciones.",
        "3️⃣ Un aspecto controvertido es el nuevo impuesto sobre emisiones que afectará a las industrias más contaminantes. Los críticos argumentan que esto podría aumentar los precios para los consumidores, pero los defensores señalan los beneficios ambientales.",
        "4️⃣ La transición estará supervisada por una nueva comisión independiente que reportará directamente al ministerio. Esto busca garantizar transparencia y evitar conflictos de interés en la implementación.",
      ]

      setGeneratedThread(mockThread)
      setIsGenerating(false)
      setIsGenerated(true)
    }, 2000)
  }

  const handleEditTweet = (index: number, newContent: string) => {
    const newThread = [...generatedThread]
    newThread[index] = newContent
    setGeneratedThread(newThread)
  }

  const handleDeleteTweet = (index: number) => {
    const newThread = generatedThread.filter((_, i) => i !== index)
    setGeneratedThread(newThread)
  }

  const handleMoveTweet = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === generatedThread.length - 1)) return

    const newThread = [...generatedThread]
    const temp = newThread[index]

    if (direction === "up") {
      newThread[index] = newThread[index - 1]
      newThread[index - 1] = temp
    } else {
      newThread[index] = newThread[index + 1]
      newThread[index + 1] = temp
    }

    setGeneratedThread(newThread)
  }

  const handleAddTweet = (index: number) => {
    const newThread = [...generatedThread]
    newThread.splice(index + 1, 0, "Nuevo tweet... (Edita este contenido)")
    setGeneratedThread(newThread)
  }

  // Función para copiar el texto al portapapeles
  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)

      toast({
        title: "Copiado al portapapeles",
        description: "El texto ha sido copiado correctamente",
      })

      // Resetear el estado después de 2 segundos
      setTimeout(() => {
        setCopiedIndex(null)
      }, 2000)
    } catch (err) {
      toast({
        title: "Error al copiar",
        description: "No se pudo copiar el texto al portapapeles",
        variant: "destructive",
      })
    }
  }

  // Función para seleccionar un post de WordPress
  const selectWordpressPost = (postId: number) => {
    setSelectedWordpressPost(postId)
    const post = searchResults.find((p) => p.id === postId)

    if (post) {
      // Simular la extracción del contenido completo
      setIsSearching(true)
      setShowDropdown(false)

      setTimeout(() => {
        const mockFullContent = `${post.title}\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.\n\nNullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.`

        setNewsContent(mockFullContent)
        setActiveTab("texto")
        setIsSearching(false)

        toast({
          title: "Contenido extraído",
          description: "El contenido del artículo ha sido cargado correctamente",
        })
      }, 1000)
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Generador de Hilos</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Powered by</span>
            <div className="bg-black text-white px-2 py-1 rounded-md text-xs font-medium">AI</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Panel izquierdo: Entrada de datos */}
          <div className="md:col-span-1">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Fuente de la noticia</h2>

                <Tabs defaultValue="url" value={activeTab} onValueChange={setActiveTab} className="mb-4">
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="url">URL</TabsTrigger>
                    <TabsTrigger value="texto">Texto</TabsTrigger>
                    <TabsTrigger value="wordpress">WordPress</TabsTrigger>
                  </TabsList>

                  <TabsContent value="url" className="space-y-4 pt-2">
                    <div>
                      <Label htmlFor="news-url">URL de la noticia</Label>
                      <div className="flex mt-1.5">
                        <Input
                          id="news-url"
                          placeholder="https://ejemplo.com/noticia"
                          value={newsUrl}
                          onChange={(e) => setNewsUrl(e.target.value)}
                        />
                        <Button variant="outline" size="icon" className="ml-2">
                          <Link2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="texto" className="space-y-4 pt-2">
                    <div>
                      <Label htmlFor="news-content">Contenido de la noticia</Label>
                      <Textarea
                        id="news-content"
                        placeholder="Pega aquí el texto de la noticia..."
                        className="mt-1.5 min-h-[150px]"
                        value={newsContent}
                        onChange={(e) => setNewsContent(e.target.value)}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="wordpress" className="space-y-4 pt-2">
                    <div className="relative">
                      <Label htmlFor="wordpress-search">Buscar artículos</Label>
                      <div className="flex mt-1.5">
                        <Input
                          id="wordpress-search"
                          ref={searchInputRef}
                          placeholder="Escribe para buscar artículos..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onFocus={() => {
                            if (searchQuery.length >= 3) {
                              setShowDropdown(true)
                            }
                          }}
                        />
                        <div className="ml-2 flex items-center">
                          {isSearching ? (
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                          ) : (
                            <Search className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Escribe al menos 3 caracteres para buscar artículos</p>

                      {/* Dropdown de resultados */}
                      {showDropdown && searchResults.length > 0 && (
                        <div
                          ref={dropdownRef}
                          className="absolute z-10 mt-1 w-full bg-white rounded-md border border-gray-200 shadow-lg max-h-[200px] overflow-y-auto"
                        >
                          {searchResults.map((result) => (
                            <div
                              key={result.id}
                              className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                              onClick={() => selectWordpressPost(result.id)}
                            >
                              <div className="flex justify-between items-center">
                                <div className="font-medium text-sm truncate max-w-[80%]">{result.title}</div>
                                <div className="flex items-center text-xs text-gray-500">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {result.date}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {showDropdown && searchResults.length === 0 && !isSearching && searchQuery.length >= 3 && (
                        <div className="absolute z-10 mt-1 w-full bg-white rounded-md border border-gray-200 shadow-lg p-4 text-center">
                          <p className="text-sm text-gray-500">No se encontraron resultados</p>
                        </div>
                      )}
                    </div>

                    {selectedWordpressPost !== null && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-sm">
                              {searchResults.find((p) => p.id === selectedWordpressPost)?.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {searchResults.find((p) => p.id === selectedWordpressPost)?.date}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setSelectedWordpressPost(null)}
                          >
                            Cambiar
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center mt-4">
                      <Globe className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-xs text-gray-500">
                        Compatible con WordPress.com y sitios WordPress autohospedados
                      </span>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Configuración del hilo</h2>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label htmlFor="thread-length">Longitud del hilo</Label>
                      <span className="text-sm text-gray-500">{threadLength} tweets</span>
                    </div>
                    <Slider
                      id="thread-length"
                      min={2}
                      max={10}
                      step={1}
                      value={[threadLength]}
                      onValueChange={(value) => setThreadLength(value[0])}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tone-select" className="mb-2 block">
                      Tono
                    </Label>
                    <select
                      id="tone-select"
                      className="w-full p-2 border rounded-md"
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                    >
                      <option value="informativo">Informativo</option>
                      <option value="analítico">Analítico</option>
                      <option value="conversacional">Conversacional</option>
                      <option value="profesional">Profesional</option>
                      <option value="persuasivo">Persuasivo</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="add-emojis">Incluir emojis</Label>
                    <Switch id="add-emojis" checked={addEmojis} onCheckedChange={setAddEmojis} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="add-hashtags">Incluir hashtags automáticos</Label>
                    <Switch id="add-hashtags" checked={addHashtags} onCheckedChange={setAddHashtags} />
                  </div>

                  {addHashtags && (
                    <div className="pl-6 border-l-2 border-gray-200">
                      <div className="mb-3">
                        <Label htmlFor="custom-hashtags" className="text-sm">
                          Hashtags personalizados
                        </Label>
                        <Input
                          id="custom-hashtags"
                          placeholder="#periodismo #noticias"
                          value={customHashtags}
                          onChange={(e) => setCustomHashtags(e.target.value)}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">Separados por espacios</p>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="hashtag-position" className="text-sm">
                          Posición de hashtags
                        </Label>
                        <select
                          id="hashtag-position"
                          className="text-xs p-1 border rounded"
                          value={hashtagPosition}
                          onChange={(e) => setHashtagPosition(e.target.value)}
                        >
                          <option value="end">Al final</option>
                          <option value="start">Al inicio</option>
                          <option value="both">Ambos</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Label htmlFor="add-numbering">Numerar tweets</Label>
                    <Switch id="add-numbering" checked={addNumbering} onCheckedChange={setAddNumbering} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="add-cta">Incluir llamada a la acción</Label>
                    <Switch id="add-cta" checked={addCTA} onCheckedChange={setAddCTA} />
                  </div>

                  {addCTA && (
                    <div className="pl-6 border-l-2 border-gray-200">
                      <div>
                        <Label htmlFor="cta-type" className="text-sm">
                          Tipo de CTA
                        </Label>
                        <select
                          id="cta-type"
                          className="w-full p-2 border rounded-md mt-1"
                          value={ctaType}
                          onChange={(e) => setCtaType(e.target.value)}
                        >
                          <option value="follow">Seguir cuenta</option>
                          <option value="share">Compartir hilo</option>
                          <option value="comment">Pedir opiniones</option>
                          <option value="subscribe">Suscribirse a newsletter</option>
                          <option value="custom">Personalizado</option>
                        </select>
                      </div>

                      {ctaType === "custom" && (
                        <div className="mt-2">
                          <Label htmlFor="custom-cta" className="text-sm">
                            CTA personalizado
                          </Label>
                          <Input
                            id="custom-cta"
                            placeholder="¡Suscríbete a mi newsletter!"
                            value={customCTA}
                            onChange={(e) => setCustomCTA(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Label htmlFor="add-sources">Citar fuentes</Label>
                    <Switch id="add-sources" checked={addSources} onCheckedChange={setAddSources} />
                  </div>

                  <Button
                    className="w-full"
                    onClick={generateThread}
                    disabled={
                      isGenerating ||
                      (activeTab === "url" ? !newsUrl : activeTab === "texto" ? !newsContent : !selectedWordpressPost)
                    }
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generar hilo
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel derecho: Visualización del hilo */}
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardContent className="pt-6 h-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Vista previa del hilo</h2>

                  {isGenerated && (
                    <Button variant="default">
                      <Share2 className="mr-2 h-4 w-4" />
                      Exportar hilo
                    </Button>
                  )}
                </div>

                {!isGenerated ? (
                  <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <MessageSquarePlus className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Crea tu primer hilo</h3>
                    <p className="text-gray-500 max-w-md">
                      Ingresa la URL o el contenido de una noticia y haz clic en "Generar hilo" para crear
                      automáticamente un hilo informativo.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[70vh] overflow-y-auto pr-2">
                    {/* Tweet principal */}
                    {generatedThread.length > 0 && (
                      <div className="border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow mb-1">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                            <div>
                              <div className="font-medium">Tu Nombre</div>
                              <div className="text-gray-500 text-sm">@usuario</div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditTweet(0, generatedThread[0])}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAddTweet(0)}>
                                <MessageSquarePlus className="h-4 w-4 mr-2" />
                                Añadir tweet
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteTweet(0)}
                                className="text-red-500"
                                disabled={generatedThread.length <= 1}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <Textarea
                          value={generatedThread[0]}
                          onChange={(e) => handleEditTweet(0, e.target.value)}
                          className="w-full mt-2 bg-transparent resize-none border-none focus:ring-0 p-0 text-base font-medium"
                          rows={Math.min(6, Math.ceil(generatedThread[0].length / 50))}
                        />

                        <div className="mt-3 flex justify-between text-gray-500 text-sm">
                          <span className="font-medium text-gray-700">Tweet principal</span>
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => copyToClipboard(generatedThread[0], 0)}
                            >
                              {copiedIndex === 0 ? (
                                <Check className="h-3.5 w-3.5 text-green-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Línea conectora entre el tweet principal y las respuestas */}
                    {generatedThread.length > 1 && (
                      <div className="flex">
                        <div className="ml-5 w-0.5 bg-gray-300 h-3"></div>
                        <div className="flex-1"></div>
                      </div>
                    )}

                    {/* Tweets de respuesta */}
                    <div className="space-y-1 pl-5 border-l border-gray-300 ml-5">
                      {generatedThread.slice(1).map((tweet, index) => {
                        const actualIndex = index + 1 // El índice real en generatedThread
                        return (
                          <div
                            key={actualIndex}
                            className="border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow relative"
                          >
                            {/* Línea horizontal conectora */}
                            <div className="absolute -left-5 top-6 w-4 h-0.5 bg-gray-300"></div>

                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                                <div>
                                  <div className="font-medium">Tu Nombre</div>
                                  <div className="text-gray-500 text-sm">@usuario</div>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditTweet(actualIndex, tweet)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAddTweet(actualIndex)}>
                                    <MessageSquarePlus className="h-4 w-4 mr-2" />
                                    Añadir tweet
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleMoveTweet(actualIndex, "up")}>
                                    <ArrowUp className="h-4 w-4 mr-2" />
                                    Mover arriba
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleMoveTweet(actualIndex, "down")}
                                    disabled={actualIndex === generatedThread.length - 1}
                                  >
                                    <ArrowDown className="h-4 w-4 mr-2" />
                                    Mover abajo
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteTweet(actualIndex)}
                                    className="text-red-500"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <Textarea
                              value={tweet}
                              onChange={(e) => handleEditTweet(actualIndex, e.target.value)}
                              className="w-full mt-2 bg-transparent resize-none border-none focus:ring-0 p-0 text-base"
                              rows={Math.min(6, Math.ceil(tweet.length / 50))}
                            />

                            <div className="mt-3 flex justify-between text-gray-500 text-sm">
                              <span>
                                {actualIndex}/{generatedThread.length - 1} respuestas
                              </span>
                              <div className="flex items-center space-x-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2"
                                  onClick={() => copyToClipboard(tweet, actualIndex)}
                                >
                                  {copiedIndex === actualIndex ? (
                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
