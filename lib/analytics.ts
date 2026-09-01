import { getSupabaseServer, getSupabaseRouteHandler } from "@/lib/supabase/server";

// Tipos de datos para cada analytics
export type AnalyticsCorrectorDeTextos = {
  id?: number | string;
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
  id?: number | string;
  session_id?: string;
  user_id?: string | null;
  organization_id?: number | null;
  contenido_original?: string | null;
  numero_tweets_generados?: number | null;
  longitud_total_caracteres?: number | null;
  longitud_promedio_por_tweet?: number | null;
  modelo_utilizado?: string | null;
  formato_salida?: string | null;
  timestamp?: Date | null;
  tweets_copiados_individualmente?: number | null;
  uso_copiar_todo?: boolean | null;
  uso_buscar_wordpress?: boolean | null;
  feedback_like?: boolean | null;
  feedback_rank_like?: number | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
  total_tokens?: number | null;
  reasoning_tokens?: number | null;
  cached_input_tokens?: number | null;
  tiempo_generacion?: number | null;
  reintentos_necesarios?: number | null;
  tweets_exceden_limite?: number | null;
  created_at?: Date | null;
  updated_at?: Date | null;
};

export type AnalyticsGeneradorResumen = {
  id?: number | string;
  session_id: string;
  user_id?: string | null;
  organization_id?: number | null;
  metodo_seleccion?: string | null;
  fuente_contenido?: string | null;
  articulos_seleccionados_manual?: string[] | null;
  fecha_desde?: Date | null;
  fecha_hasta?: Date | null;
  rango_dias?: number | null;
  modelo_utilizado?: string | null;
  numero_articulos_procesados?: number | null;
  tags_en_articulos?: string[] | null;
  noticias_finalistas?: string[] | null;
  uso_copiar_resumen?: boolean | null;
  feedback_like?: boolean | null;
  feedback_rank_like?: number | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
  total_tokens?: number | null;
  reasoning_tokens?: number | null;
  cached_input_tokens?: number | null;
  tiempo_procesamiento?: number | null;
  tiempo_respuesta_api?: number | null;
  created_at?: Date | null;
  updated_at?: Date | null;
};

/**
 * Analytics del Detector de mentiras.
 *
 * A diferencia de las otras tres herramientas, el detector puede correr dos
 * modelos en paralelo sobre el mismo insumo. Por eso todo lo que depende del
 * modelo —salida, tiempo y tokens— va duplicado con sufijo _1 y _2, y las
 * columnas _2 quedan nulas cuando sólo corrió uno.
 */
export type AnalyticsDetector = {
  id?: number | string;
  session_id?: string;
  user_id?: string | null;
  organization_id?: string | null;

  /** "simple" (un modelo) o "comparacion" (dos en paralelo) */
  modo?: "simple" | "comparacion" | null;
  proveedor_1?: string | null;
  modelo_1?: string | null;
  proveedor_2?: string | null;
  modelo_2?: string | null;
  /** Legible: "gpt-5.6-terra" o "gpt-5.6-terra + claude-opus-4-8" */
  modelos_resumen?: string | null;

  output_1?: string | null;
  output_2?: string | null;
  longitud_output_1?: number | null;
  longitud_output_2?: number | null;

  /**
   * Los dos modelos corren en paralelo, así que `tiempo_total` no es la suma:
   * es el tiempo de pared del request completo.
   */
  tiempo_modelo_1?: number | null;
  tiempo_modelo_2?: number | null;
  tiempo_total?: number | null;

  input_tokens_1?: number | null;
  output_tokens_1?: number | null;
  total_tokens_1?: number | null;
  reasoning_tokens_1?: number | null;
  cached_input_tokens_1?: number | null;
  input_tokens_2?: number | null;
  output_tokens_2?: number | null;
  total_tokens_2?: number | null;
  reasoning_tokens_2?: number | null;
  cached_input_tokens_2?: number | null;
  total_tokens?: number | null;

  /** Formulario completo, sin los data URL de los adjuntos */
  input_completo?: Record<string, any> | null;
  prompt_usuario?: string | null;
  calificacion?: string | null;
  numero_imagenes?: number | null;
  numero_pdfs?: number | null;
  numero_enlaces?: number | null;
  numero_transcripciones?: number | null;

  /** Documento de revisión en Drive; llega unos segundos después del resto */
  documento_url?: string | null;
  documento_id?: string | null;
  documento_error?: string | null;

  uso_copiar?: boolean | null;
  /** En comparación, cuál salida copió el periodista: "1" o "2" */
  modelo_copiado?: "1" | "2" | null;
  feedback_like?: boolean | null;
  feedback_rank_like?: number | null;

  estado?: "completado" | "fallido" | null;
  error_mensaje?: string | null;

  created_at?: Date | null;
  updated_at?: Date | null;
};

// Clase madre Analytics
abstract class Analytics<T extends { id?: any } = any> {
  protected supabasePromise = getSupabaseRouteHandler();
  public readonly type: string;
  public readonly table_name: string;
  public schema: T;
  private _existingId?: string | number;
  private _schemaOverrides?: T;
  private _needsLoad: boolean = false;

  constructor(type: string, schema: T, existingId?: string | number) {
    this.type = type;
    this.table_name = "analytics_" + this.type;
    
    if (existingId) {
      // Si se proporciona un ID existente, inicializar con ese ID
      this.schema = { ...schema, id: existingId } as T;
      this._existingId = existingId;
      this._schemaOverrides = schema;
      this._needsLoad = true;
    } else {
      // Si no se proporciona ID, generar uno nuevo
      this.schema = { ...schema, id: this.generateId() } as T;
      this._needsLoad = false;
    }
  }
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  public async ensureLoaded(): Promise<void> {
    if (!this._needsLoad) return;

    try {
      const supabase = await this.supabasePromise;
      const { data, error } = await supabase
        .from(this.table_name)
        .select()
        .eq('id', this._existingId)
        .single();

      if (error) {
        console.log(`No existing record found for ID ${this._existingId}, using provided schema`);
        this._needsLoad = false;
        return;
      }

      if (data) {
        // Combinar el registro existente con los cambios del schema
        // El schema pasado al constructor tiene prioridad sobre los datos existentes
        this.schema = { ...data, ...this._schemaOverrides, id: this._existingId } as T;
        console.log(`Loaded existing record for ID ${this._existingId} and applied schema overrides`);
      }
      
      this._needsLoad = false;
    } catch (error) {
      console.error(`Error loading existing record for ID ${this._existingId}:`, error);
      this._needsLoad = false;
    }
  }
  async save() {
    console.log('save', this.schema)
    try {
      // Cargar datos existentes si es necesario
      await this.ensureLoaded();
      
      console.log('save', this.schema);
      
      // Usar upsert con id como clave única
      const supabase = await this.supabasePromise;
      const { data: result, error } = await supabase
        .from(this.table_name)
        .upsert({
          ...this.schema,
          updated_at: new Date()
        }, {
          onConflict: 'id'
        })
        .select()
        .single();
      if (error) {
        console.error(`Error upserting ${this.type}:`, error);
        return null;
      }

      // Actualizar el schema local con los datos guardados
      Object.assign(this.schema, result);
      return result;
    } catch (error) {
      console.error(`Error in save method for ${this.type}:`, error);
      return null;
    }
  }

  async findById(id: number): Promise<T | null> {
    try {
      const supabase = await this.supabasePromise;
      const { data, error } = await supabase
        .from(this.table_name)
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
        .from(this.table_name)
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

  /**
   * Método genérico para actualizar el schema de forma inteligente
   * @param schemaUpdate - Objeto parcial con los campos a actualizar
   */
  async updateSchema(schemaUpdate: Partial<T>): Promise<{ success: boolean; error?: string }> {
    try {
      // Cargar datos existentes si es necesario
      await this.ensureLoaded();
      
      // Para cada campo en schemaUpdate
      Object.entries(schemaUpdate).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        
        const currentValue = this.schema[key as keyof T];
        
        // Si el valor actual es un array y el nuevo valor también es un array
        if (Array.isArray(currentValue) && Array.isArray(value)) {
          // Merge inteligente: agregar solo elementos que no existan
          const mergedArray = [...currentValue];
          value.forEach(item => {
            if (!mergedArray.includes(item)) {
              mergedArray.push(item);
            }
          });
          (this.schema as any)[key] = mergedArray;
        } else {
          // Para campos que no son arrays, simplemente reemplazar
          (this.schema as any)[key] = value;
        }
      });
      
      // Actualizar timestamp
      (this.schema as any).updated_at = new Date();
      
      // Guardar cambios
      const result = await this.save();
      
      if (result) {
        console.log(`${this.type} schema actualizado:`, schemaUpdate);
        return { success: true };
      } else {
        return { success: false, error: "Error al guardar en la base de datos" };
      }
    } catch (error) {
      console.error(`Error al actualizar ${this.type} schema:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Error desconocido" 
      };
    }
  }
}

// Clases hijas que extienden Analytics
class AnalyticsCorrectorDeTextosService extends Analytics<AnalyticsCorrectorDeTextos> {
  constructor(schema: AnalyticsCorrectorDeTextos = {} as AnalyticsCorrectorDeTextos, existingId?: string | number) {
    super('corrector_de_textos', schema, existingId);
  }

  /**
   * Agrega una corrección a la lista de sugerencias aceptadas o ignoradas
   * @param correccion - La corrección que se procesó
   * @param esAceptada - true si fue aceptada, false si fue negada/ignorada
   */
  async agregarCorreccion(correccion: string, esAceptada: boolean): Promise<void> {
    console.log('agregarCorreccion', correccion, esAceptada);
    try {
      // Cargar datos existentes si es necesario
      await this.ensureLoaded();
      
      // Obtener los datos actuales
      const supabase = await this.supabasePromise;
      const { data: currentData, error: fetchError } = await supabase
        .from(this.table_name)
        .select('sugerencias_aceptadas, sugerencias_ignoradas')
        .eq('id', this.schema.id)
        .single();

      if (fetchError) {
        console.error('Error fetching current data:', fetchError);
        return;
      }

      // Preparar las listas actualizadas
      const sugerenciasAceptadas = currentData?.sugerencias_aceptadas || [];
      const sugerenciasIgnoradas = currentData?.sugerencias_ignoradas || [];

      if (esAceptada) {
        // Agregar a aceptadas si no está ya incluida
        if (!sugerenciasAceptadas.includes(correccion)) {
          sugerenciasAceptadas.push(correccion);
        }
        // Remover de ignoradas si estaba ahí
        const indexIgnoradas = sugerenciasIgnoradas.indexOf(correccion);
        if (indexIgnoradas > -1) {
          sugerenciasIgnoradas.splice(indexIgnoradas, 1);
        }
      } else {
        // Agregar a ignoradas si no está ya incluida
        if (!sugerenciasIgnoradas.includes(correccion)) {
          sugerenciasIgnoradas.push(correccion);
        }
        // Remover de aceptadas si estaba ahí
        const indexAceptadas = sugerenciasAceptadas.indexOf(correccion);
        if (indexAceptadas > -1) {
          sugerenciasAceptadas.splice(indexAceptadas, 1);
        }
      }

      // Actualizar en la base de datos
      const { error: updateError } = await supabase
        .from(this.table_name)
        .update({
          sugerencias_aceptadas: sugerenciasAceptadas,
          sugerencias_ignoradas: sugerenciasIgnoradas,
          updated_at: new Date()
        })
        .eq('id', this.schema.id);

      if (updateError) {
        console.error('Error updating correction data:', updateError);
        return;
      }

      // Actualizar el schema local
      this.schema.sugerencias_aceptadas = sugerenciasAceptadas;
      this.schema.sugerencias_ignoradas = sugerenciasIgnoradas;
      this.schema.updated_at = new Date();

      console.log(`Corrección ${esAceptada ? 'aceptada' : 'ignorada'} agregada:`, correccion);
    } catch (error) {
      console.error('Error in agregarCorreccion:', error);
    }
  }
}

class AnalyticsGeneradorHilosService extends Analytics<AnalyticsGeneradorHilos> {
  constructor(schema: AnalyticsGeneradorHilos = {} as AnalyticsGeneradorHilos, existingId?: string | number) {
    super('generador_de_hilos', schema, existingId);
  }
}

class AnalyticsGeneradorResumenService extends Analytics<AnalyticsGeneradorResumen> {
  constructor(schema: AnalyticsGeneradorResumen = {} as AnalyticsGeneradorResumen, existingId?: string | number) {
    super('generador_de_resumenes', schema, existingId);
  }
}

class AnalyticsDetectorService extends Analytics<AnalyticsDetector> {
  constructor(schema: AnalyticsDetector = {} as AnalyticsDetector, existingId?: string | number) {
    super('detector', schema, existingId);
  }

  /**
   * Guarda el enlace al documento de revisión.
   *
   * Se llama después de haber respondido al usuario (Next `after()`), así que
   * nunca debe tumbar nada: si Drive falló, se registra el motivo en la misma
   * fila en vez de propagarlo.
   */
  async registrarDocumento(
    resultado: { id: string; url: string } | { error: string }
  ): Promise<void> {
    const cambios: Partial<AnalyticsDetector> =
      'error' in resultado
        ? { documento_error: resultado.error.slice(0, 1000) }
        : { documento_id: resultado.id, documento_url: resultado.url };

    await this.updateSchema(cambios);
  }
}

// Exportar las clases por si se necesitan crear instancias personalizadas
export { AnalyticsCorrectorDeTextosService, AnalyticsGeneradorHilosService, AnalyticsGeneradorResumenService, AnalyticsDetectorService };