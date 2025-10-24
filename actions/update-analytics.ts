"use server";

import { 
  AnalyticsCorrectorDeTextosService, 
  AnalyticsGeneradorHilosService, 
  AnalyticsGeneradorResumenService,
  type AnalyticsCorrectorDeTextos,
  type AnalyticsGeneradorHilos,
  type AnalyticsGeneradorResumen
} from "@/lib/analytics";

// Tipos de analytics disponibles
type AnalyticsType = "corrector_de_textos" | "generador_hilos" | "generador_resumen";

// Union type para los schemas
type AnalyticsSchema = AnalyticsCorrectorDeTextos | AnalyticsGeneradorHilos | AnalyticsGeneradorResumen;

/**
 * Action genérica para actualizar cualquier tipo de analytics
 * @param analyticsType - Tipo de analytics ("corrector_de_textos", "generador_hilos", "generador_resumen")
 * @param analyticsId - ID del registro de analytics existente
 * @param schemaUpdate - Objeto parcial con los campos a actualizar
 */
export async function updateAnalytics(
  analyticsType: AnalyticsType,
  analyticsId: string | number,
  schemaUpdate: Partial<AnalyticsSchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    let analyticsService: any;
    
    // Crear la instancia apropiada según el tipo
    switch (analyticsType) {
      case "corrector_de_textos":
        analyticsService = new AnalyticsCorrectorDeTextosService({}, analyticsId);
        break;
      case "generador_hilos":
        analyticsService = new AnalyticsGeneradorHilosService({ session_id: "" }, analyticsId);
        break;
      case "generador_resumen":
        analyticsService = new AnalyticsGeneradorResumenService({ session_id: "" }, analyticsId);
        break;
      default:
        return { success: false, error: `Tipo de analytics no válido: ${analyticsType}` };
    }
    
    // Llamar al método updateSchema de la clase madre
    const result = await analyticsService.updateSchema(schemaUpdate);
    
    return result;
  } catch (error) {
    console.error("Error en updateAnalytics:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error desconocido" 
    };
  }
}

/**
 * Helper específico para agregar correcciones al corrector de textos
 */
export async function agregarCorreccionAnalytics(
  analyticsId: string | number,
  suggestion: any,
  esAceptada: boolean
): Promise<{ success: boolean; error?: string }> {
  // Convertir la sugerencia a JSON string
  const suggestionJson = JSON.stringify(suggestion);
  
  const updateData: Partial<AnalyticsCorrectorDeTextos> = {};
  
  if (esAceptada) {
    updateData.sugerencias_aceptadas = [suggestionJson];
  } else {
    updateData.sugerencias_ignoradas = [suggestionJson];
  }
  
  return updateAnalytics("corrector_de_textos", analyticsId, updateData);
}