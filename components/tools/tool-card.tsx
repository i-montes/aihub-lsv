"use client"

import { Button } from "@/components/ui/button"
import { Star, Edit } from "lucide-react"
import type { Tool } from "@/types/tool"
import { NOMBRE_PROVEEDOR } from "@/lib/proveedores/tipos"

interface ToolCardProps {
  tool: Tool
  onEdit: (tool: Tool) => void
}

/**
 * Card component for displaying a tool
 */
export function ToolCard({ tool, onEdit }: ToolCardProps) {
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
            ? tool.prompts[0]?.content || ""
            : ""}
        </p>
        <div className="flex flex-wrap gap-1 mb-3">
          {(tool.proveedores ?? []).length === 0 ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Sin proveedor</span>
          ) : (
            tool.proveedores!.map((p, i) => (
              <span
                key={p.proveedor}
                className={`text-xs px-2 py-0.5 rounded-full ${i === 0 ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}
                title={i === 0 ? "Por defecto" : undefined}
              >
                {NOMBRE_PROVEEDOR[p.proveedor]} · {p.modelo}
              </span>
            ))
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
