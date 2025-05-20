"use client"

import { Search, SlidersHorizontal, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface SearchBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  sortOptions: string[]
  selectedSort?: string
  onSortChange?: (option: string) => void
  onCreateNew?: () => void
}

/**
 * Search bar component with filters and sorting options
 */
export function SearchBar({
  searchTerm,
  onSearchChange,
  sortOptions,
  selectedSort,
  onSortChange,
  onCreateNew,
}: SearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Buscar herramientas..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 w-full"
        />
      </div>
      <div className="flex gap-2 self-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Ordenar</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option}
                onClick={() => onSortChange && onSortChange(option)}
                className={selectedSort === option ? "bg-gray-100" : ""}
              >
                {option}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {onCreateNew && (
          <Button size="sm" className="gap-1.5" onClick={onCreateNew}>
            <Plus className="h-4 w-4" />
            <span>Nueva</span>
          </Button>
        )}
      </div>
    </div>
  )
}
