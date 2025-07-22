"use client"

import { Button } from "@/components/ui/button"
import { Star, Edit } from "lucide-react"
import type { Tool } from "@/types/tool"

interface ToolCardProps {
  tool: Tool
  tagColors: Record<string, string>
  onEdit: (tool: Tool) => void
}

/**
 * Card component for displaying a tool
 */
export function ToolCard({ tool, tagColors, onEdit }: ToolCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden group hover:shadow-sm transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">{tool.title}</h3>
            {tool.favorite && <Star className="h-4 w-4 text-yellow-500" />}
          </div>
        </div>
        <p className="text-sm text-gray-500 line-clamp-3 mb-3">
          {tool.prompts && Array.isArray(tool.prompts)
            ? tool.prompts.find((prompt) => prompt.title === "Principal")?.content || ""
            : ""}
        </p>
        <div className="flex flex-wrap gap-1 mb-3">
          {tool.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className={`text-xs px-2 py-0.5 rounded-full ${tagColors[tag] || "bg-gray-100 text-gray-800"}`}
            >
              {tag}
            </span>
          ))}
          {tool.tags.length > 3 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">+{tool.tags.length - 3}</span>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <span>{tool.usageCount} usos</span>
          </div>
          <div className="flex items-center gap-1">
            {tool.isDefault && (
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">Predeterminada</span>
            )}
            <span>Última: {tool.lastUsed}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 bg-gray-50 p-2 flex justify-end">
        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => onEdit(tool)}>
          <Edit className="h-3.5 w-3.5 mr-1" />
          Editar
        </Button>
      </div>
    </div>
  )
}
