"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Check,
  X,
  History,
  Save,
  FileUp,
  FileDown,
  HelpCircle,
  Settings,
} from "lucide-react"
import { FitnessLayout } from "@/components/fitness-layout"
import TiptapEditor from "@/components/tiptap-editor"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Primero, añadir el import del componente Select
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Types for corrections
interface Correction {
  id: string
  original: string
  suggestion: string
  type: "grammar" | "spelling" | "style"
  explanation: string
  position: { start: number; end: number }
  accepted: boolean | null
}

export default function CorrectionsPage() {
  const [originalText, setOriginalText] = useState("<p>Escribe o pega tu texto aquí para corregirlo...</p>")
  const [correctedText, setCorrectedText] = useState("<p>El texto corregido aparecerá aquí...</p>")
  const [isLoading, setIsLoading] = useState(false)
  const [corrections, setCorrections] = useState<Correction[]>([])
  const [activeCorrection, setActiveCorrection] = useState<string | null>(null)
  const [realTimeCorrection, setRealTimeCorrection] = useState(false)
  const [correctionHistory, setCorrectionHistory] = useState<{ timestamp: Date; count: number }[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [apiKeyExists, setApiKeyExists] = useState(true)

  // Añadir un nuevo estado para el modelo seleccionado después de los otros estados
  const [selectedModel, setSelectedModel] = useState("gpt-4")

  const correctionTimeout = useRef<NodeJS.Timeout | null>(null)

  // Effect to handle real-time correction
  useEffect(() => {
    if (
      realTimeCorrection &&
      originalText &&
      originalText !== "<p>Escribe o pega tu texto aquí para corregirlo...</p>"
    ) {
      if (correctionTimeout.current) {
        clearTimeout(correctionTimeout.current)
      }

      correctionTimeout.current = setTimeout(() => {
        handleCorrect()
      }, 1000)
    }

    return () => {
      if (correctionTimeout.current) {
        clearTimeout(correctionTimeout.current)
      }
    }
  }, [originalText, realTimeCorrection])

  // Function to generate a unique ID
  const generateId = () => {
    return Math.random().toString(36).substring(2, 9)
  }

  // Function to handle text correction
  const handleCorrect = async () => {
    if (!originalText.trim() || originalText === "<p>Escribe o pega tu texto aquí para corregirlo...</p>") return

    setIsLoading(true)
    setActiveCorrection(null)

    // Simulamos un proceso de corrección
    setTimeout(() => {
      // Extraemos el texto plano del HTML para buscar errores
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = originalText
      const plainText = tempDiv.textContent || tempDiv.innerText || ""

      // Ejemplo de correcciones detectadas
      const sampleCorrections = [
        {
          original: "aver",
          suggestion: "a ver",
          type: "spelling" as const,
          explanation: 'La expresión correcta es "a ver" (vamos a ver), no "aver".',
        },
        {
          original: "haci",
          suggestion: "así",
          type: "spelling" as const,
          explanation: 'La palabra correcta es "así", no "haci".',
        },
        {
          original: "Yo y mi amigo",
          suggestion: "Mi amigo y yo",
          type: "grammar" as const,
          explanation: "Es más correcto mencionar primero a la otra persona y luego a uno mismo.",
        },
        {
          original: "hubieron muchas personas",
          suggestion: "hubo muchas personas",
          type: "grammar" as const,
          explanation: 'El verbo "haber" cuando significa existencia es impersonal y debe usarse en singular.',
        },
        {
          original: "a grosso modo",
          suggestion: "grosso modo",
          type: "style" as const,
          explanation: 'La expresión latina correcta es "grosso modo" sin la preposición "a".',
        },
      ]

      // Filtrar correcciones que existen en el texto
      const detectedCorrections = sampleCorrections
        .filter((correction) => plainText.toLowerCase().includes(correction.original.toLowerCase()))
        .map((correction) => {
          // Encontrar la posición en el texto plano
          const lowerText = plainText.toLowerCase()
          const lowerOriginal = correction.original.toLowerCase()
          const startPos = lowerText.indexOf(lowerOriginal)

          return {
            id: generateId(),
            ...correction,
            position: {
              start: startPos,
              end: startPos + correction.original.length,
            },
            accepted: null,
          }
        })

      // Actualizar el texto corregido
      let newCorrectedText = originalText

      // Aplicar correcciones al texto
      if (detectedCorrections.length > 0) {
        newCorrectedText = highlightCorrections(originalText, detectedCorrections)
      }

      setCorrections(detectedCorrections)
      setCorrectedText(newCorrectedText)
      setIsLoading(false)

      // Actualizar historial
      if (detectedCorrections.length > 0) {
        setCorrectionHistory((prev) => [
          { timestamp: new Date(), count: detectedCorrections.length },
          ...prev.slice(0, 9), // Mantener solo los últimos 10 registros
        ])
      }
    }, 1500)
  }

  // Function to handle accepting a correction
  const handleAcceptCorrection = (id: string) => {
    const correction = corrections.find((c) => c.id === id)
    if (!correction) return

    // Marcar como aceptada
    setCorrections((prev) => prev.map((c) => (c.id === id ? { ...c, accepted: true } : c)))

    // Aplicar la corrección al texto
    let newCorrectedText = correctedText

    // Reemplazar el texto original con la sugerencia
    const regex = new RegExp(`<mark [^>]*?data-correction-id="${id}"[^>]*?>${correction.original}</mark>`, "g")

    newCorrectedText = newCorrectedText.replace(
      regex,
      `<mark class="bg-green-200 px-0.5 rounded" data-correction-id="${id}">${correction.suggestion}</mark>`,
    )

    setCorrectedText(newCorrectedText)
  }

  // Function to handle rejecting a correction
  const handleRejectCorrection = (id: string) => {
    const correction = corrections.find((c) => c.id === id)
    if (!correction) return

    // Marcar como rechazada
    setCorrections((prev) => prev.map((c) => (c.id === id ? { ...c, accepted: false } : c)))

    // Mantener el texto original pero cambiar el color del marcado
    let newCorrectedText = correctedText

    const regex = new RegExp(`<mark [^>]*?data-correction-id="${id}"[^>]*?>${correction.original}</mark>`, "g")

    newCorrectedText = newCorrectedText.replace(
      regex,
      `<mark class="bg-gray-200 px-0.5 rounded" data-correction-id="${id}">${correction.original}</mark>`,
    )

    setCorrectedText(newCorrectedText)
  }

  // Function to highlight corrections in text
  const highlightCorrections = (htmlContent: string, corrections: Correction[]) => {
    let highlightedText = htmlContent

    // Extraemos el texto plano del HTML
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = htmlContent
    const plainText = tempDiv.textContent || tempDiv.innerText || ""

    // Ordenamos las correcciones de la última a la primera para no afectar las posiciones
    const sortedCorrections = [...corrections].sort((a, b) => b.position.start - a.position.start)

    // Reemplazamos las ocurrencias con spans marcados
    sortedCorrections.forEach((correction) => {
      const regex = new RegExp(correction.original, "gi")
      let match

      // Buscamos todas las ocurrencias en el texto plano
      while ((match = regex.exec(plainText)) !== null) {
        const startPos = match.index
        const endPos = startPos + correction.original.length

        // Creamos un marcador para esta posición con atributos de datos para el tooltip
        const marker = `<mark 
        class="bg-yellow-200 px-0.5 rounded relative group cursor-help" 
        data-correction-id="${correction.id}" 
        data-original="${correction.original}"
        data-suggestion="${correction.suggestion}"
        data-type="${correction.type}"
        data-explanation="${correction.explanation}"
      >${correction.original}</mark>`

        // Intentamos insertar el marcador en el HTML
        // Nota: Esta es una implementación simplificada que podría no funcionar perfectamente con HTML complejo
        const beforeMatch = plainText.substring(0, startPos)
        const beforeMatchLength = beforeMatch.length

        // Buscamos la posición aproximada en el HTML
        let htmlPos = 0
        let plainPos = 0

        for (let i = 0; i < highlightedText.length; i++) {
          if (highlightedText[i] === "<") {
            // Saltamos las etiquetas HTML
            while (i < highlightedText.length && highlightedText[i] !== ">") i++
          } else {
            if (plainPos === startPos) {
              htmlPos = i
              break
            }
            plainPos++
          }
        }

        // Insertamos el marcador
        if (htmlPos > 0) {
          highlightedText =
            highlightedText.substring(0, htmlPos) +
            marker +
            highlightedText.substring(htmlPos + correction.original.length)
        }
      }
    })

    return highlightedText
  }

  // Function to get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "grammar":
        return <AlertCircle className="text-amber-500" size={16} />
      case "spelling":
        return <AlertCircle className="text-red-500" size={16} />
      case "style":
        return <AlertCircle className="text-blue-500" size={16} />
      default:
        return <AlertCircle className="text-gray-500" size={16} />
    }
  }

  // Function to get type label
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "grammar":
        return "Gramática"
      case "spelling":
        return "Ortografía"
      case "style":
        return "Estilo"
      default:
        return "Otro"
    }
  }

  // Function to export corrected text
  const handleExport = () => {
    // Crear un elemento temporal para extraer el texto sin marcas
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = correctedText

    // Reemplazar todas las marcas con su contenido
    const marks = tempDiv.querySelectorAll("mark")
    marks.forEach((mark) => {
      const textNode = document.createTextNode(mark.textContent || "")
      mark.parentNode?.replaceChild(textNode, mark)
    })

    const cleanText = tempDiv.innerHTML

    // Crear un blob y descargar
    const element = document.createElement("a")
    const file = new Blob([cleanText], { type: "text/html" })
    element.href = URL.createObjectURL(file)
    element.download = `texto_corregido_${new Date().toISOString().slice(0, 10)}.html`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <FitnessLayout>
      <div className="container mx-auto p-4 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Corrector de Texto</h1>

          {/* Modificar el div que contiene los controles en la barra superior */}
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Select defaultValue={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Seleccionar modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>OpenAI</SelectLabel>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                          <SelectItem value="gpt-3.5">GPT-3.5 Turbo</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Anthropic</SelectLabel>
                          <SelectItem value="claude-3">Claude 3 Opus</SelectItem>
                          <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                          <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Google</SelectLabel>
                          <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                          <SelectItem value="gemini-ultra">Gemini Ultra</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Meta</SelectLabel>
                          <SelectItem value="llama-3">Llama 3</SelectItem>
                          <SelectItem value="llama-3-70b">Llama 3 70B</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Mistral</SelectLabel>
                          <SelectItem value="mistral-large">Mistral Large</SelectItem>
                          <SelectItem value="mistral-medium">Mistral Medium</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Seleccionar modelo de IA</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Switch id="api-key" checked={apiKeyExists} onCheckedChange={setApiKeyExists} />
                    <Label htmlFor="api-key" className="text-sm cursor-pointer">
                      API Key
                    </Label>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Simular existencia de API Key</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Switch id="real-time" checked={realTimeCorrection} onCheckedChange={setRealTimeCorrection} />
                    <Label htmlFor="real-time" className="text-sm cursor-pointer">
                      Corrección en tiempo real
                    </Label>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Corrige automáticamente mientras escribes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                    className={showHistory ? "bg-gray-100" : ""}
                  >
                    <History size={16} className="mr-1" />
                    Historial
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ver historial de correcciones</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    disabled={!correctedText || correctedText === "<p>El texto corregido aparecerá aquí...</p>"}
                  >
                    <FileDown size={16} className="mr-1" />
                    Exportar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Descargar texto corregido</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {showHistory && correctionHistory.length > 0 && (
          <Card className="p-4 mb-4 bg-gray-50">
            <h3 className="text-sm font-medium mb-2">Historial de correcciones</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {correctionHistory.map((entry, index) => (
                <div key={index} className="text-xs p-2 bg-white rounded border">
                  <div className="flex justify-between items-center">
                    <span>{entry.timestamp.toLocaleTimeString()}</span>
                    <span className="font-medium">{entry.count} correcciones</span>
                  </div>
                  <div className="text-gray-500 text-[10px]">{entry.timestamp.toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {!apiKeyExists ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center justify-center gap-4">
              <AlertCircle size={48} className="text-amber-500" />
              <h2 className="text-xl font-semibold text-gray-800">API Key no configurada</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Para utilizar el corrector de texto, es necesario configurar una API Key válida. Por favor, contacta al
                administrador del sistema para solicitar la configuración.
              </p>
              <Button variant="outline" className="mt-2">
                Contactar al administrador
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Columna izquierda: Texto original */}
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-medium">Texto Original</h2>
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <FileUp size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Importar texto</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Save size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Guardar borrador</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <Card className="flex-1 overflow-hidden border shadow-sm">
                <div className="h-full flex flex-col">
                  <TiptapEditor
                    content={originalText}
                    onChange={setOriginalText}
                    placeholder="Escribe o pega tu texto aquí para corregirlo..."
                    className="flex-1"
                  />

                  <div className="p-3 border-t bg-gray-50 flex justify-end">
                    <Button
                      onClick={handleCorrect}
                      disabled={
                        !originalText.trim() ||
                        originalText === "<p>Escribe o pega tu texto aquí para corregirlo...</p>" ||
                        isLoading
                      }
                      className="bg-sidebar hover:bg-sidebar/90 text-white"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Corrigiendo...
                        </>
                      ) : (
                        <>
                          Corregir Texto
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Columna derecha: Texto corregido y sugerencias */}
            <div className="flex flex-col h-full">
              <Tabs defaultValue="corrected" className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <TabsList>
                    <TabsTrigger value="corrected" className="text-sm">
                      Texto Corregido
                    </TabsTrigger>
                    <TabsTrigger value="suggestions" className="text-sm">
                      Sugerencias {corrections.length > 0 && `(${corrections.length})`}
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <HelpCircle size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ayuda sobre correcciones</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Settings size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Configuración del corrector</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <TabsContent value="corrected" className="flex-1 mt-0">
                  <Card className="h-full flex flex-col overflow-hidden border shadow-sm">
                    <div className="flex-1 overflow-auto p-3">
                      <div
                        className="prose prose-sm max-w-none h-full relative"
                        dangerouslySetInnerHTML={{ __html: correctedText }}
                        onClick={(e) => {
                          // Manejar clics en las marcas
                          const target = e.target as HTMLElement
                          if (target.tagName === "MARK") {
                            const correctionId = target.getAttribute("data-correction-id")
                            if (correctionId) {
                              setActiveCorrection(correctionId)
                            }
                          }
                        }}
                        ref={(el) => {
                          // Añadir tooltips interactivos a las marcas después de que el contenido se renderice
                          if (el) {
                            const marks = el.querySelectorAll("mark")
                            marks.forEach((mark) => {
                              // Añadir evento de mouseenter para mostrar tooltip
                              mark.addEventListener("mouseenter", (e) => {
                                const target = e.target as HTMLElement
                                const correctionId = target.getAttribute("data-correction-id")
                                const original = target.getAttribute("data-original")
                                const suggestion = target.getAttribute("data-suggestion")
                                const explanation = target.getAttribute("data-explanation")
                                const type = target.getAttribute("data-type")

                                if (correctionId) {
                                  // Crear tooltip
                                  const tooltip = document.createElement("div")
                                  tooltip.className = "absolute z-50 bg-white p-3 rounded-md shadow-lg border max-w-xs"
                                  tooltip.style.top = `${target.offsetTop + target.offsetHeight}px`
                                  tooltip.style.left = `${target.offsetLeft}px`
                                  tooltip.id = `tooltip-${correctionId}`

                                  // Contenido del tooltip
                                  tooltip.innerHTML = `
                                    <div class="text-xs font-medium mb-1 flex items-center gap-1">
                                      <span class="px-2 py-0.5 rounded-full bg-gray-100">${getTypeLabel(type || "other")}</span>
                                    </div>
                                    <div class="grid grid-cols-1 gap-2 mb-2">
                                      <div class="p-2 bg-red-50 rounded text-xs">
                                        <span class="block text-[10px] text-gray-500 mb-1">Original:</span>
                                        <span class="font-medium text-red-600">${original}</span>
                                      </div>
                                      <div class="p-2 bg-green-50 rounded text-xs">
                                        <span class="block text-[10px] text-gray-500 mb-1">Sugerencia:</span>
                                        <span class="font-medium text-green-600">${suggestion}</span>
                                      </div>
                                    </div>
                                    <p class="text-xs text-gray-600 mb-2">${explanation}</p>
                                    <div class="flex justify-end gap-2">
                                      <button class="reject-btn px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded" data-id="${correctionId}">
                                        Rechazar
                                      </button>
                                      <button class="accept-btn px-2 py-1 text-xs bg-green-100 hover:bg-green-200 rounded" data-id="${correctionId}">
                                        Aceptar
                                      </button>
                                    </div>
                                  `

                                  // Añadir tooltip al DOM
                                  el.appendChild(tooltip)

                                  // Añadir eventos a los botones
                                  const acceptBtn = tooltip.querySelector(".accept-btn")
                                  const rejectBtn = tooltip.querySelector(".reject-btn")

                                  if (acceptBtn) {
                                    acceptBtn.addEventListener("click", (e) => {
                                      e.stopPropagation()
                                      handleAcceptCorrection(correctionId)
                                      tooltip.remove()
                                    })
                                  }

                                  if (rejectBtn) {
                                    rejectBtn.addEventListener("click", (e) => {
                                      e.stopPropagation()
                                      handleRejectCorrection(correctionId)
                                      tooltip.remove()
                                    })
                                  }
                                }
                              })

                              // Añadir evento de mouseleave para ocultar tooltip
                              mark.addEventListener("mouseleave", (e) => {
                                const target = e.target as HTMLElement
                                const correctionId = target.getAttribute("data-correction-id")
                                if (correctionId) {
                                  setTimeout(() => {
                                    const tooltip = document.getElementById(`tooltip-${correctionId}`)
                                    if (tooltip) {
                                      tooltip.remove()
                                    }
                                  }, 300) // Pequeño retraso para permitir mover el cursor al tooltip
                                }
                              })
                            })
                          }
                        }}
                      />
                    </div>

                    <div className="p-3 border-t bg-gray-50 flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        {corrections.length > 0
                          ? `${corrections.filter((c) => c.accepted === true).length} de ${corrections.length} correcciones aplicadas`
                          : "No hay correcciones disponibles"}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        disabled={!correctedText || correctedText === "<p>El texto corregido aparecerá aquí...</p>"}
                      >
                        <FileDown size={16} className="mr-1" />
                        Exportar
                      </Button>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="suggestions" className="flex-1 mt-0">
                  <Card className="h-full flex flex-col overflow-hidden border shadow-sm">
                    <div className="flex-1 overflow-auto p-3">
                      {corrections.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <CheckCircle size={36} strokeWidth={1.5} />
                          <p className="mt-2 text-center text-sm">
                            {isLoading
                              ? "Analizando el texto..."
                              : "No se encontraron errores o aún no has corregido el texto"}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {corrections.map((correction) => (
                            <div
                              key={correction.id}
                              className={`p-3 border rounded-lg transition-colors ${
                                activeCorrection === correction.id ? "border-sidebar bg-gray-50" : ""
                              } ${
                                correction.accepted === true
                                  ? "border-green-200 bg-green-50"
                                  : correction.accepted === false
                                    ? "border-gray-200 bg-gray-50"
                                    : ""
                              }`}
                              onClick={() => setActiveCorrection(correction.id)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {getTypeIcon(correction.type)}
                                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100">
                                    {getTypeLabel(correction.type)}
                                  </span>
                                </div>

                                <div className="flex gap-1">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleAcceptCorrection(correction.id)
                                          }}
                                          disabled={correction.accepted === true}
                                        >
                                          <Check size={14} />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Aceptar corrección</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleRejectCorrection(correction.id)
                                          }}
                                          disabled={correction.accepted === false}
                                        >
                                          <X size={14} />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Rechazar corrección</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 mb-2">
                                <div className="p-2 bg-red-50 rounded text-xs">
                                  <span className="block text-[10px] text-gray-500 mb-1">Original:</span>
                                  <span className="font-medium text-red-600">{correction.original}</span>
                                </div>
                                <div className="p-2 bg-green-50 rounded text-xs">
                                  <span className="block text-[10px] text-gray-500 mb-1">Sugerencia:</span>
                                  <span className="font-medium text-green-600">{correction.suggestion}</span>
                                </div>
                              </div>

                              <p className="text-xs text-gray-600">{correction.explanation}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-3 border-t bg-gray-50 flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        {corrections.length > 0
                          ? `${corrections.filter((c) => c.accepted !== null).length} de ${corrections.length} revisadas`
                          : "No hay sugerencias disponibles"}
                      </div>

                      {corrections.length > 0 && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Rechazar todas las correcciones
                              corrections.forEach((c) => {
                                if (c.accepted === null) {
                                  handleRejectCorrection(c.id)
                                }
                              })
                            }}
                          >
                            Rechazar todas
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Aceptar todas las correcciones
                              corrections.forEach((c) => {
                                if (c.accepted === null) {
                                  handleAcceptCorrection(c.id)
                                }
                              })
                            }}
                          >
                            Aceptar todas
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}

        {/* Atajos de teclado */}
        <div className="mt-4 text-xs text-gray-500 flex justify-center">
          <div className="flex gap-4">
            <span>Ctrl+Z: Deshacer</span>
            <span>Ctrl+Y: Rehacer</span>
            <span>Ctrl+B: Negrita</span>
            <span>Ctrl+I: Cursiva</span>
            <span>Ctrl+U: Subrayado</span>
          </div>
        </div>
      </div>
    </FitnessLayout>
  )
}
