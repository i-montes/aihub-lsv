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
type AnalyticsType = "corrector_de_textos" | "generador_de_hilos" | "generador_resumen";

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
      case "generador_de_hilos":
        analyticsService = new AnalyticsGeneradorHilosService({ session_id: "" }, analyticsId);
        break;
      case "generador_resumen":
        analyticsService = new AnalyticsGeneradorResumenService({ session_id: "" }, analyticsId);
        break;
      default:
        return { success: false, error: `Tipo de analytics no válido: ${analyticsType}` };
    }
    
    // Primero cargar los datos actuales para manejar incrementos
    await analyticsService.ensureLoaded();
    
    // Procesar incrementos para campos numéricos
    const processedUpdate = { ...schemaUpdate };
    
    // Para generador_de_hilos, manejar incrementos específicos
    if (analyticsType === "generador_de_hilos") {
      const hilosUpdate = processedUpdate as Partial<AnalyticsGeneradorHilos>;
      if (hilosUpdate.tweets_copiados_individualmente) {
        const currentValue = analyticsService.schema.tweets_copiados_individualmente || 0;
        hilosUpdate.tweets_copiados_individualmente = currentValue + 1;
      }
    }
    
    // Llamar al método updateSchema de la clase madre
    const result = await analyticsService.updateSchema(processedUpdate);
    
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
 * Helper específico para incrementar contadores numéricos en analytics
 * @param analyticsType - Tipo de analytics
 * @param analyticsId - ID del registro de analytics existente  
 * @param fieldName - Nombre del campo numérico a incrementar
 * @param incrementBy - Cantidad a incrementar (por defecto 1)
 */
export async function incrementAnalyticsCounter(
  analyticsType: AnalyticsType,
  analyticsId: string | number,
  fieldName: string,
  incrementBy: number = 1
): Promise<{ success: boolean; error?: string }> {
    console.log('incrementAnalyticsCounter', analyticsType, analyticsId, fieldName, incrementBy);
  try {
    let analyticsService: any;
    
    // Crear la instancia apropiada según el tipo
    switch (analyticsType) {
      case "corrector_de_textos":
        analyticsService = new AnalyticsCorrectorDeTextosService({}, analyticsId);
        break;
      case "generador_de_hilos":
        analyticsService = new AnalyticsGeneradorHilosService({ session_id: "" }, analyticsId);
        break;
      case "generador_resumen":
        analyticsService = new AnalyticsGeneradorResumenService({ session_id: "" }, analyticsId);
        break;
      default:
        return { success: false, error: `Tipo de analytics no válido: ${analyticsType}` };
    }
    
    // Cargar los datos actuales
    await analyticsService.ensureLoaded();
    
    // Obtener el valor actual del campo
    const currentValue = analyticsService.schema[fieldName] || 0;
    
    // Crear el objeto de actualización
    const updateData = {
      [fieldName]: currentValue + incrementBy
    };
    
    // Llamar al método updateSchema
    const result = await analyticsService.updateSchema(updateData);
    
    return result;
  } catch (error) {
    console.error("Error en incrementAnalyticsCounter:", error);
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