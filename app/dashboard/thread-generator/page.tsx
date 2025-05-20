"use client"

import type React from "react"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Copy, Loader2, Share } from "lucide-react"
import { toast } from "sonner"
import { WordPressSearch } from "@/components/thread-generator/wordpress-search"
import { ThreadPreview } from "@/components/thread-generator/thread-preview"

export default function ThreadGenerator() {
  const [sourceContent, setSourceContent] = useState("")
  const [sourceTitle, setSourceTitle] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedThread, setGeneratedThread] = useState<{ content: string; imageUrl?: string }[]>([])

  const handleWordPressContent = (content: string, title: string) => {
    setSourceContent(content)
    setSourceTitle(title)
  }

  const generateThread = async () => {
    if (!sourceContent.trim()) {
      toast.error("Por favor, añade contenido para generar el hilo")
      return
    }

    setIsGenerating(true)

    try {
      // Aquí iría la llamada a la API para generar el hilo
      // Por ahora, simulamos una respuesta
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Ejemplo de hilo generado
      const exampleImages = ["/digital-marketing-concept.png", "/social-media-strategy.png"]

      const hashtags = " #MarketingDigital #Contenido"

      const generatedTweets = []

      if (sourceTitle) {
        // Primer tweet con título
        generatedTweets.push({
          content: `🧵 ${sourceTitle}${hashtags}\n\nAbro hilo con las claves principales 👇`,
          imageUrl: exampleImages[0],
        })
      } else {
        // Primer tweet sin título específico
        generatedTweets.push({
          content: `🧵 Estrategias efectivas de marketing de contenidos${hashtags}\n\nAbro hilo con las claves principales 👇`,
          imageUrl: exampleImages[0],
        })
      }

      // Generar tweets intermedios (5 por defecto)
      for (let i = 1; i < 5; i++) {
        let tweetContent = ""

        switch (i) {
          case 1:
            tweetContent = `1️⃣ Conoce a tu audiencia\n\nAntes de crear contenido, debes entender a quién le hablas. Investiga a tu público objetivo, sus intereses y necesidades.${hashtags}`
            break
          case 2:
            tweetContent = `2️⃣ Establece objetivos claros\n\n¿Quieres aumentar el tráfico, generar leads o mejorar la conversión? Tus objetivos determinarán el tipo de contenido que creas.${hashtags}`
            break
          case 3:
            tweetContent = `3️⃣ Crea un calendario editorial\n\nLa consistencia es clave. Planifica tu contenido con anticipación para mantener un flujo constante.${hashtags}`
            break
          case 4:
            tweetContent = `4️⃣ Optimiza para SEO\n\nInvestiga palabras clave relevantes y optimiza tu contenido para mejorar su visibilidad en los motores de búsqueda.${hashtags}`
            break
          default:
            tweetContent = `${i}️⃣ Punto clave adicional\n\nEste es otro punto importante para tu estrategia de contenido que no debes pasar por alto.${hashtags}`
        }

        generatedTweets.push({
          content: tweetContent,
          imageUrl: i === 3 ? exampleImages[1] : undefined,
        })
      }

      // Último tweet
      generatedTweets.push({
        content: `Y eso es todo por hoy! Espero que estas estrategias te ayuden a mejorar tu marketing de contenidos.\n\n¿Qué estrategia te ha funcionado mejor? Cuéntame en los comentarios 👇${hashtags}`,
      })

      setGeneratedThread(generatedTweets)
      toast.success("¡Hilo generado con éxito!")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al generar el hilo")
    } finally {
      setIsGenerating(false)
    }
  }

  const copyThread = () => {
    if (generatedThread.length === 0) return

    const threadText = generatedThread.map((tweet) => tweet.content).join("\n\n---\n\n")

    navigator.clipboard
      .writeText(threadText)
      .then(() => toast.success("Hilo copiado al portapapeles"))
      .catch(() => toast.error("Error al copiar el hilo"))
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-accent bg-clip-text text-transparent">
            Generador de Hilos
          </h1>
          {generatedThread.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyThread} className="gap-1.5">
                <Copy className="h-4 w-4" />
                Copiar
              </Button>
              <Button size="sm" className="gap-1.5">
                <Share className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Panel de entrada */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
              <div className="p-5 border-b bg-muted/30 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Contenido fuente</h2>
                <div>
                  <WordPressSearch onSelectContent={handleWordPressContent} />
                </div>
              </div>
              <div className="p-5 space-y-4">
                {sourceTitle && (
                  <div className="p-3 bg-muted rounded-md">
                    <h3 className="font-medium">{sourceTitle}</h3>
                  </div>
                )}
                <Textarea
                  placeholder="Pega aquí el contenido para generar el hilo o utiliza la búsqueda de WordPress..."
                  className="min-h-[300px] resize-none"
                  value={sourceContent}
                  onChange={(e) => setSourceContent(e.target.value)}
                />
                <Button
                  onClick={generateThread}
                  disabled={isGenerating || !sourceContent.trim()}
                  className="w-full gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generar hilo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Panel de vista previa */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden h-full flex flex-col">
              <div className="p-5 border-b bg-muted/30">
                <h2 className="text-xl font-semibold">Vista previa del hilo</h2>
              </div>
              <div className="overflow-y-auto flex-1 p-1">
                {generatedThread.length > 0 ? (
                  <ThreadPreview
                    tweets={generatedThread}
                    profileName="AI Hub"
                    profileUsername="ai_hub_oficial"
                    profileImage="/professional-woman-journalist.png"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                      <div className="bg-muted/50 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Genera tu hilo</h3>
                      <p className="text-muted-foreground text-sm">
                        Pega tu contenido o busca en WordPress y haz clic en "Generar hilo" para crear un hilo
                        optimizado para redes sociales.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Sparkles(props: React.ComponentProps<typeof Loader2>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  )
}
