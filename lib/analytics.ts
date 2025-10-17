export type AnalyticsCorrectorDeTextos = {
  id: number;
  session_id: string;
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

class Analytics {

  constructor() {
    this.init();
  }

  init() {
    
    console.log('Analytics init');
  }
}
