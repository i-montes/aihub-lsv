"use client"

import { Button } from "@/components/ui/button"
import { MoreHorizontal, Star, Edit, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Tool } from "@/types/tool"

interface ToolListItemProps {
  tool: Tool
  tagColors: Record<string, string>
  onEdit: (tool: Tool) => void
  onDelete: (tool: Tool) => void
  getCategoryColor: (categoryId: string) => string
}

/**
 * List item component for displaying a tool
 */
export function ToolListItem({ tool, tagColors, onEdit, onDelete, getCategoryColor }: ToolListItemProps) {
  const categoryColor = getCategoryColor(tool.category)

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
      <div className="flex items-center gap-3">
        <div
          className={`h-10 w-1 rounded-full ${
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
        />
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{tool.title}</h3>
            {tool.favorite && <Star className="h-4 w-4 text-yellow-500" />}
          </div>
          <p className="text-sm text-gray-500 line-clamp-1">{tool.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex gap-1">
          {tool.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className={`text-xs px-2 py-1 rounded-full ${tagColors[tag] || "bg-gray-100 text-gray-800"}`}
            >
              {tag}
            </span>
          ))}
          {tool.tags.length > 2 && (
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">+{tool.tags.length - 2}</span>
          )}
        </div>
        <div className="text-xs text-gray-500 hidden md:block">{tool.usageCount} usos</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(tool)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(tool)} className="text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
