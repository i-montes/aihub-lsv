"use client"

import type React from "react"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, StarOff, Edit } from "lucide-react"
import type { Tool } from "@/types/tool"

interface ToolCardProps {
  tool: Tool
  tagColors: Record<string, string>
  onEdit: (tool: Tool) => void
  onDelete: (tool: Tool) => void
  getCategoryColor: (categoryId: string) => string
}

/**
 * Card component for displaying a tool
 */
export function ToolCard({ tool, tagColors, onEdit, onDelete, getCategoryColor }: ToolCardProps) {
  const categoryColor = getCategoryColor(tool.category)

  // Función para manejar el clic en la tarjeta
  const handleCardClick = () => {
    onEdit(tool)
  }

  // Función para detener la propagación de eventos
  const handleInnerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
      title="Haz clic para editar esta herramienta"
      role="article"
      aria-labelledby={`tool-title-${tool.id}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleCardClick()
        }
      }}
    >
      <CardHeader className="p-0">
        <div
          className={`h-2 w-full ${
            categoryColor === "blue"
              ? "bg-blue-500"
              : categoryColor === "green"
                ? "bg-green-500"
                : categoryColor === "purple"
                  ? "bg-purple-500"
                  : categoryColor === "red"
                    ? "bg-red-500"
                    : "bg-gray-500"
          }`}
          aria-hidden="true"
        />
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <h3 id={`tool-title-${tool.id}`} className="font-semibold text-lg line-clamp-1" role="heading" aria-level={3}>
            {tool.title}
          </h3>
          <div className="flex items-center gap-2" onClick={handleInnerClick}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={tool.favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
              aria-pressed={tool.favorite}
            >
              {tool.favorite ? <Star className="h-4 w-4 text-yellow-500" /> : <StarOff className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 flex items-center gap-1"
              onClick={() => onEdit(tool)}
              aria-label={`Editar herramienta ${tool.title}`}
            >
              <Edit className="h-4 w-4" />
              <span>Editar</span>
            </Button>
          </div>
        </div>
        <p
          id={`tool-desc-${tool.id}`}
          className="text-sm text-gray-500 mt-2 line-clamp-2"
          aria-describedby={`tool-title-${tool.id}`}
        >
          {tool.description}
        </p>
        <div className="flex flex-wrap gap-1 mt-3" aria-label="Etiquetas">
          {tool.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className={`text-xs px-2 py-1 rounded-full ${tagColors[tag] || "bg-gray-100 text-gray-800"}`}
            >
              {tag}
            </span>
          ))}
          {tool.tags.length > 3 && (
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">+{tool.tags.length - 3}</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 border-t border-gray-100 flex justify-between text-xs text-gray-500">
        <span aria-label={`${tool.usageCount} usos totales`}>{tool.usageCount} usos</span>
        <span aria-label={`Último uso: ${tool.lastUsed}`}>Último uso: {tool.lastUsed}</span>
      </CardFooter>
    </Card>
  )
}
