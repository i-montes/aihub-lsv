"use client"

import type React from "react"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { toast } from "sonner"

interface WordPressPost {
  id: number
  title: { rendered: string }
  excerpt: { rendered: string }
  link: string
  date: string
  content: { rendered: string }
}

interface WordPressSearchProps {
  onSelectContent: (content: string, title: string) => void
}

export function WordPressSearch({ onSelectContent }: WordPressSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<WordPressPost[]>([])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      // Aquí iría la llamada real a la API de WordPress
      const response = await fetch(`https://example.com/wp-json/wp/v2/posts?search=${encodeURIComponent(searchQuery)}`)

      if (!response.ok) {
        throw new Error("Error al buscar en WordPress")
      }

      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al buscar en WordPress")
      // Datos de ejemplo para mostrar la interfaz
      setSearchResults([
        {
          id: 1,
          title: { rendered: "Cómo mejorar tu estrategia de contenido" },
          excerpt: {
            rendered:
              "Descubre las mejores prácticas para optimizar tu estrategia de contenido y aumentar el engagement...",
          },
          link: "https://example.com/post-1",
          date: "2023-05-15T14:30:00",
          content: {
            rendered:
              "<h2>Cómo mejorar tu estrategia de contenido</h2><p>El contenido es el rey en el mundo digital actual. Para destacar entre la multitud, necesitas una estrategia sólida.</p><h3>1. Conoce a tu audiencia</h3><p>Antes de crear contenido, debes entender a quién le hablas. Investiga a tu público objetivo, sus intereses, problemas y necesidades.</p><h3>2. Establece objetivos claros</h3><p>¿Quieres aumentar el tráfico, generar leads o mejorar la conversión? Tus objetivos determinarán el tipo de contenido que creas.</p><h3>3. Crea un calendario editorial</h3><p>La consistencia es clave. Planifica tu contenido con anticipación para mantener un flujo constante.</p>",
          },
        },
        {
          id: 2,
          title: { rendered: "Las tendencias de marketing digital para 2023" },
          excerpt: {
            rendered: "Explora las tendencias emergentes en marketing digital que dominarán el panorama en 2023...",
          },
          link: "https://example.com/post-2",
          date: "2023-05-10T09:15:00",
          content: {
            rendered:
              "<h2>Las tendencias de marketing digital para 2023</h2><p>El marketing digital evoluciona constantemente. Estas son las tendencias que debes conocer este año.</p><h3>1. Contenido generado por IA</h3><p>La inteligencia artificial está revolucionando la creación de contenido, permitiendo mayor personalización y eficiencia.</p><h3>2. Marketing conversacional</h3><p>Los chatbots y asistentes virtuales están transformando la manera en que las marcas interactúan con sus clientes.</p><h3>3. Video marketing</h3><p>El contenido en video sigue dominando, especialmente los formatos cortos y verticales para móviles.</p>",
          },
        },
      ])
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const insertPostContent = (post: WordPressPost) => {
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = post.content.rendered
    const textContent = tempDiv.textContent || tempDiv.innerText

    onSelectContent(textContent, post.title.rendered)
    setOpen(false)
    toast.success("Contenido importado correctamente")
  }

  const stripHtml = (html: string) => {
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = html
    return tempDiv.textContent || tempDiv.innerText
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Image src="/wordpress-logo.png" alt="WordPress" width={20} height={20} />
          Buscar en WordPress
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image src="/wordpress-logo.png" alt="WordPress" width={24} height={24} />
            Buscar contenido en WordPress
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center space-x-2 my-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar artículos..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button onClick={handleSearch} disabled={isSearching}>
            Buscar
          </Button>
        </div>

        <div className="overflow-y-auto flex-1 pr-2">
          {isSearching ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col space-y-2 p-4 border rounded-md">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex justify-between items-center mt-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((post) => (
                <div key={post.id} className="p-4 border rounded-md hover:bg-muted/50 transition-colors">
                  <h3 className="font-medium">{post.title.rendered}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{stripHtml(post.excerpt.rendered)}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">{formatDate(post.date)}</span>
                    <Button size="sm" onClick={() => insertPostContent(post)}>
                      Seleccionar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron resultados para "{searchQuery}"</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Busca artículos de WordPress para generar hilos</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
