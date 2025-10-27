"use server";

import { AnalyticsCorrectorDeTextosService } from "@/lib/analytics";
import type { Suggestion } from "@/types/proofreader";

/**
 * Action para agregar una corrección al analytics desde el cliente
 * @param analyticsId - ID del registro de analytics
 * @param suggestion - Objeto completo de la sugerencia con original, propuesta, razón y tipo
 * @param esAceptada - true si fue aceptada, false si fue ignorada
 */
export async function agregarCorreccionAnalytics(
  analyticsId: string | number,
  suggestion: Suggestion,
  esAceptada: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    // Crear instancia del servicio de analytics con el ID existente
    const analyticsService = new AnalyticsCorrectorDeTextosService({}, analyticsId);
    
    // Convertir la sugerencia completa a JSON string
    const suggestionJson = JSON.stringify({
      id: suggestion.id,
      original: suggestion.original,
      suggestion: suggestion.suggestion,
      explanation: suggestion.explanation,
      type: suggestion.type,
      startIndex: suggestion.startIndex,
      endIndex: suggestion.endIndex
    });
    
    // Agregar la corrección con toda la información
    await analyticsService.agregarCorreccion(suggestionJson, esAceptada);
    
    console.log(`Analytics actualizado: ${esAceptada ? 'aceptada' : 'ignorada'} - ${suggestion.original} -> ${suggestion.suggestion}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error al agregar corrección a analytics:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error desconocido" 
    };
  }
}