"use client";

import { Check } from "lucide-react";
import { SuggestionItem } from "./suggestion-item";
import type { Suggestion } from "@/types/proofreader";

interface SuggestionsPanelProps {
  haveLogs?: boolean;
  suggestions: Suggestion[];
  activeSuggestion: Suggestion | null;
  onSuggestionClick: (suggestion: Suggestion) => void;
  onApplySuggestion: (suggestion: Suggestion) => void;
  onIgnoreSuggestion: (suggestionId: string) => void;
  onSuggestionHover?: (suggestion: Suggestion) => void;
  onSuggestionHoverEnd?: () => void;
}

export function SuggestionsPanel({
  haveLogs = false,
  suggestions,
  activeSuggestion,
  onSuggestionClick,
  onApplySuggestion,
  onIgnoreSuggestion,
  onSuggestionHover,
  onSuggestionHoverEnd,
}: SuggestionsPanelProps) {
  return (
    <div className="flex-1 overflow-auto">
      {suggestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-gray-50 rounded-xl">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          {haveLogs ? (
            <>
              <h3 className="text-lg font-medium text-gray-800">
                ¡Sin sugerencias!
              </h3>
              <p className="text-gray-500 mt-2 max-w-xs">
                Tu texto no tiene errores o has aplicado todas las correcciones.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-800">
                Aquí sucederá la magia{" "}
              </h3>
              <p className="text-gray-500 mt-2 max-w-xs">
                Cuando analicemos tu texto, en esta columna aparecerán las
                sugerencias basadas en la guía de estilos de La Silla Vacía.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <SuggestionItem
              key={suggestion.id}
              suggestion={suggestion}
              isActive={activeSuggestion?.id === suggestion.id}
              onApply={onApplySuggestion}
              onIgnore={onIgnoreSuggestion}
              onClick={onSuggestionClick}
              onHover={onSuggestionHover}
              onHoverEnd={onSuggestionHoverEnd}
            />
          ))}
        </div>
      )}
    </div>
  );
}
