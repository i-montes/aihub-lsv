"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import type { Suggestion } from "@/types/proofreader"

interface SuggestionItemProps {
  suggestion: Suggestion
  isActive: boolean
  onApply: (suggestion: Suggestion) => void
  onIgnore: (suggestionId: string) => void
  onClick: (suggestion: Suggestion) => void
}

const typeColors = {
  spelling: "bg-red-50 text-red-700 border-red-200",
  grammar: "bg-amber-50 text-amber-700 border-amber-200",
  style: "bg-blue-50 text-blue-700 border-blue-200",
}

const severityLabels = {
  1: "Sugerencia",
  2: "Recomendación",
  3: "Corrección necesaria",
}

const severityColors = {
  1: "bg-green-50 text-green-700",
  2: "bg-amber-50 text-amber-700",
  3: "bg-red-50 text-red-700",
}

export function SuggestionItem({ suggestion, isActive, onApply, onIgnore, onClick }: SuggestionItemProps) {
  return (
    <div
      className={`border rounded-xl p-4 transition-all cursor-pointer ${
        isActive ? "border-blue-400 bg-blue-50 shadow-md" : "border-gray-200 hover:border-blue-200 hover:shadow-sm"
      }`}
      onClick={(e) => {e.stopPropagation(); onClick(suggestion)}}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <Badge className={`${typeColors[suggestion.type]} border px-2 py-1`} variant="outline">
            {suggestion.type === "spelling" ? "Ortografía" : suggestion.type === "grammar" ? "Gramática" : "Estilo"}
          </Badge>
          <Badge className={`${severityColors[suggestion.severity]} px-2 py-1`}>
            {severityLabels[suggestion.severity]}
          </Badge>
        </div>
      </div>

      <div className="mb-3">
        <div className="text-sm font-medium text-gray-700 mb-1">Original:</div>
        <div className="text-sm bg-gray-100 p-3 rounded-lg">&ldquo;{suggestion.original}&rdquo;</div>
      </div>

      <div className="mb-3">
        <div className="text-sm font-medium text-gray-700 mb-1">Sugerencia:</div>
        <div className="text-sm bg-green-50 p-3 rounded-lg text-green-800">&ldquo;{suggestion.suggestion}&rdquo;</div>
      </div>

      <div className="text-xs text-gray-600 mb-3">{suggestion.explanation}</div>

      <div className="flex justify-end space-x-2 mt-2">
        <Button
          size="sm"
          variant="outline"
          className="border-green-200 hover:bg-green-50 text-green-700"
          onClick={(e) => {
            e.stopPropagation()
            onApply(suggestion)
          }}
        >
          <Check className="h-4 w-4 mr-2" />
          Aplicar
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-gray-200 hover:bg-gray-50 text-gray-700"
          onClick={(e) => {
            e.stopPropagation()
            onIgnore(suggestion.id)
          }}
        >
          <X className="h-4 w-4 mr-2" />
          Ignorar
        </Button>
      </div>
    </div>
  )
}
