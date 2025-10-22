import { getSupabaseServer, getSupabaseRouteHandler } from "@/lib/supabase/server";

// Tipos de datos para cada analytics
export type AnalyticsCorrectorDeTextos = {
  id?: number;
  session_id?: string;
  user_id?: string | null;
  organization_id?: number | null;
  texto_original?: string | null;
  texto_final?: string | null;
  longitud_caracteres?: number | null;
  total_sugerencias_generadas?: number | null;
  sugerencias_aceptadas?: string[] | null;
  sugerencias_ignoradas?: string[] | null;
  tiempo_de_analisis?: number | null;
  modelo_utilizado?: string | null;
  uso_copiar_texto?: boolean | null;
  feedback_like?: boolean | null;
  feedback_rank_like?: number | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
  total_tokens?: number | null;
  reasoning_tokens?: number | null;
  cached_input_tokens?: number | null;
  created_at?: Date | null;
  updated_at?: Date | null;
};

export type AnalyticsGeneradorHilos = {
  id?: number;
  session_id: string;
  user_id?: string | null;
  organization_id?: number | null;
  contenido_original?: string | null;
  hilos_generados?: string[] | null;
  numero_hilos?: number | null;
  plataforma_destino?: string | null;
  modelo_utilizado?: string | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
  total_tokens?: number | null;
  created_at?: Date | null;
  updated_at?: Date | null;
};

export type AnalyticsGeneradorResumen = {
  id?: number;
  session_id: string;
  user_id?: string | null;
  organization_id?: number | null;
  contenido_original?: string | null;
  resumen_generado?: string | null;
  longitud_original?: number | null;
  longitud_resumen?: number | null;
  porcentaje_reduccion?: number | null;
  modelo_utilizado?: string | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
  total_tokens?: number | null;
  created_at?: Date | null;
  updated_at?: Date | null;
};

// Clase madre Analytics
abstract class Analytics<T extends { id?: any } = any> {
  protected supabasePromise = getSupabaseRouteHandler();
  public readonly type: string;
  public readonly schema: T;

  constructor(type: string, schema: T) {
    this.type = type;
    this.schema = schema;
    this.schema.id = this.generateId();
  }
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
  async save(data: Partial<T>) {

    console.log('save', data)
    
  }

  async findById(id: number): Promise<T | null> {
    try {
      const supabase = await this.supabasePromise;
      const { data, error } = await supabase
        .from(this.type)
        .select()
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error finding ${this.type} by ID:`, error);
        return null;
      }

      return data;
    } catch (error) {
      console.error(`Error in findById method for ${this.type}:`, error);
      return null;
    }
  }

  async findBySessionId(sessionId: string): Promise<T[]> {
    try {
      const supabase = await this.supabasePromise;
      const { data, error } = await supabase
        .from(this.type)
        .select()
        .eq('session_id', sessionId);

      if (error) {
        console.error(`Error finding ${this.type} by session ID:`, error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error(`Error in findBySessionId method for ${this.type}:`, error);
      return [];
    }
  }
}

// Clases hijas que extienden Analytics
class AnalyticsCorrectorDeTextosService extends Analytics<AnalyticsCorrectorDeTextos> {
  constructor(type: string, schema: AnalyticsCorrectorDeTextos) {
    super(type, schema);
  }
}

class AnalyticsGeneradorHilosService extends Analytics<AnalyticsGeneradorHilos> {
  constructor() {
    super('analytics_generador_hilos', {} as AnalyticsGeneradorHilos);
  }
}

class AnalyticsGeneradorResumenService extends Analytics<AnalyticsGeneradorResumen> {
  constructor() {
    super('analytics_generador_resumen', {} as AnalyticsGeneradorResumen);
  }
}

// Exportar las clases por si se necesitan crear instancias personalizadas
export { AnalyticsCorrectorDeTextosService, AnalyticsGeneradorHilosService, AnalyticsGeneradorResumenService };