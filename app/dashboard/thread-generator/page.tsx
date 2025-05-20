"use client"

import type React from "react"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WordPressSearch } from "@/components/thread-generator/wordpress-search"
import { ThreadPreview } from "@/components/thread-generator/thread-preview"
import { ThreadOptions } from "@/components/thread-generator/thread-options"
import { Copy, Loader2, PenLine, Share } from "lucide-react"
import { toast } from "sonner"

export default function ThreadGenerator() {
  const [sourceContent, setSourceContent] = useState("")
  const [sourceTitle, setSourceTitle] = useState("")
  const [tweetCount, setTweetCount] = useState(5)
  const [tone, setTone] = useState("conversational")
  const [includeHashtags, setIncludeHashtags] = useState(true)
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

      const hashtags = includeHashtags ? " #MarketingDigital #Contenido" : ""

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

      // Generar tweets intermedios
      for (let i = 1; i < tweetCount - 1; i++) {
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
          case 5:
            tweetContent = `5️⃣ Analiza y ajusta\n\nMide el rendimiento de tu contenido y realiza ajustes basados en los datos para mejorar continuamente tu estrategia.${hashtags}`
            break
          case 6:
            tweetContent = `6️⃣ Diversifica formatos\n\nUtiliza diferentes formatos como blogs, videos, infografías y podcasts para llegar a más audiencia.${hashtags}`
            break
          case 7:
            tweetContent = `7️⃣ Promociona estratégicamente\n\nNo basta con crear contenido, necesitas promocionarlo en los canales adecuados para maximizar su alcance.${hashtags}`
            break
          case 8:
            tweetContent = `8️⃣ Colabora con influencers\n\nLas colaboraciones pueden amplificar tu mensaje y ayudarte a llegar a nuevas audiencias.${hashtags}`
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
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Generador de Hilos</h1>
        {generatedThread.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyThread}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar hilo
            </Button>
            <Button size="sm">
              <Share className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Contenido fuente</h2>
            <div className="flex gap-2">
              <WordPressSearch onSelectContent={handleWordPressContent} />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSourceContent("")
                  setSourceTitle("")
                }}
              >
                <PenLine className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">Contenido</TabsTrigger>
              <TabsTrigger value="options">Opciones</TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="space-y-4">
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
            </TabsContent>
            <TabsContent value="options">
              <ThreadOptions
                tweetCount={tweetCount}
                setTweetCount={setTweetCount}
                tone={tone}
                setTone={setTone}
                includeHashtags={includeHashtags}
                setIncludeHashtags={setIncludeHashtags}
                onGenerate={generateThread}
                isGenerating={isGenerating}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button onClick={generateThread} disabled={isGenerating || !sourceContent.trim()} className="gap-2">
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

        <div className="border rounded-lg overflow-hidden bg-card">
          <div className="p-4 border-b bg-muted/50">
            <h2 className="text-xl font-semibold">Vista previa del hilo</h2>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            <ThreadPreview
              tweets={generatedThread}
              profileName="AI Hub"
              profileUsername="ai_hub_oficial"
              profileImage="/professional-woman-journalist.png"
            />
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
