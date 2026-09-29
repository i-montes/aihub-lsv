"use client";

import { Button } from "@/components/ui/button";
import { MoreHorizontal, Star, Edit, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Tool } from "@/types/tool";
import { NOMBRE_PROVEEDOR } from "@/lib/proveedores/tipos";

interface ToolListItemProps {
  tool: Tool;
  onEdit: (tool: Tool) => void;
}

/**
 * List item component for displaying a tool
 */
export function ToolListItem({ tool, onEdit }: ToolListItemProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{tool.title}</h3>
            {tool.favorite && <Star className="h-4 w-4 text-yellow-500" />}
            {tool.isDefault && (
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                Predeterminada
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 line-clamp-1">
            {tool.prompts && Array.isArray(tool.prompts)
              ? tool.prompts.find((prompt) => prompt.title === "Principal")
                  ?.content || ""
              : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex gap-1">
          {(tool.proveedores ?? []).length === 0 ? (
            <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800">
              Sin proveedor
            </span>
          ) : (
            <>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800" title="Por defecto">
                {NOMBRE_PROVEEDOR[tool.proveedores![0].proveedor]} · {tool.proveedores![0].modelo}
              </span>
              {tool.proveedores!.length > 1 && (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                  +{tool.proveedores!.length - 1}
                </span>
              )}
            </>
          )}
        </div>
        <div className="text-xs text-gray-500 hidden md:block">
          {tool.usageCount} usos
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 md:hidden">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(tool)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          size="sm"
          className="h-8 flex items-center gap-1 hidden md:flex"
          onClick={() => onEdit(tool)}
          aria-label={`Editar herramienta ${tool.title}`}
        >
          <Edit className="h-4 w-4" />
          <span>Editar</span>
        </Button>
      </div>
    </div>
  );
}
