import { getSupabaseServer, getSupabaseRouteHandler } from "@/lib/supabase/server";
import { 
  LogEvent, 
  LogLevel, 
  ToolType, 
  AIProvider,
  ToolStatus,
  AuthStatus,
  ApiKeyStatus,
  ToolConfigStatus,
  ContentType,
  createLogEvent,
  BaseLogMetadata,
  UserInfo,
  AIModelInfo,
  ProcessingMetrics,
  ProcessedContent,
  ErrorInfo,
  ToolConfig,
  ApiKeyInfo,
  AnalysisResult
} from "@/types/log-schema";

// Interfaz para backwards compatibility
export interface DebugLogTypes {
  timestamp: string;
  level: "info" | "error" | "warn";
  message: string;
  data?: any;
}

// Interfaz para inicializar el logger con contexto
export interface LoggerContext {
  sessionId?: string;
  requestId?: string;
  userId?: string;
  organizationId?: string;
  toolIdentity?: ToolType;
  userInfo?: UserInfo;
  environment?: "development" | "staging" | "production";
  source?: string;
  version?: string;
}

export class DebugLogger {
  private logs: DebugLogTypes[] = [];
  private context: LoggerContext;
  private startTime: number;
  // Usar el cliente apropiado para server actions y route handlers
  private supabasePromise = getSupabaseRouteHandler();

  // Función para mapear providers de minúsculas a mayúsculas
  private mapProviderToUppercase(provider: string): string {
    const providerMap: Record<string, string> = {
      'openai': 'OPENAI',
      'anthropic': 'ANTHROPIC',
      'google': 'GOOGLE'
    };
    const result = providerMap[provider] || provider;
    console.log('🔍 DEBUG - mapProviderToUppercase:', provider, '->', result);
    return result;
  }



  constructor(context: LoggerContext = {}) {
    this.context = {
      sessionId: this.generateId(),
      requestId: this.generateId(),
      environment: process.env.NODE_ENV as any || "development",
      source: "debug-logger",
      version: "1.0.0",
      ...context
    };
    this.startTime = Date.now();
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private getBaseMetadata(): BaseLogMetadata {
    return {
      timestamp: new Date().toISOString(),
      sessionId: this.context.sessionId,
      requestId: this.context.requestId,
      userId: this.context.userId,
      organizationId: this.context.organizationId,
      toolIdentity: this.context.toolIdentity,
      duration: Date.now() - this.startTime
    };
  }

  // Método principal para guardar eventos en la base de datos
  private async saveToDatabase(event: LogEvent): Promise<void> {
    try {
      const dbRecord = {
        event_type: event.event,
        level: event.level,
        message: event.message,
        timestamp: event.metadata.timestamp,
        session_id: event.metadata.sessionId,
        request_id: event.metadata.requestId,
        user_id: event.metadata.userId,
        organization_id: event.metadata.organizationId,
        tool_identity: event.metadata.toolIdentity,
        duration_ms: event.metadata.duration,
        environment: this.context.environment,
        version: this.context.version,
        source: this.context.source,
        
        // Campos específicos por tipo de evento
        ...(event.event === "auth" && {
          auth_status: event.status,
          user_role: event.user?.role,
          user_email: event.user?.email
        }),
        
        ...(event.event === "api_key" && {
          api_key_status: event.status,
          // Solo incluir provider si es válido (no vacío y está en la lista permitida)
          ...(event.apiKey?.provider && 
              ['openai', 'anthropic', 'google'].includes(event.apiKey.provider) && {
            api_key_provider: this.mapProviderToUppercase(event.apiKey.provider)
          }),
          api_key_has_value: event.apiKey?.hasValue,
          api_key_last_used: event.apiKey?.lastUsed
        }),
        
        // Debug logging for api_key provider
        ...(event.event === "api_key" && event.apiKey?.provider && 
            ['openai', 'anthropic', 'google'].includes(event.apiKey.provider) && 
            console.log('🔍 DEBUG - api_key_provider set to:', this.mapProviderToUppercase(event.apiKey.provider))),
        
        ...(event.event === "tool_config" && {
          tool_config_status: event.status,
          config_is_custom: event.config?.isCustom,
          config_temperature: event.config?.temperature,
          config_top_p: event.config?.topP,
          config_prompts_count: event.config?.promptsCount,
          config_has_schema: event.config?.hasSchema,
          config_prompt_titles: event.config?.promptTitles
        }),
        
        ...(event.event === "processing" && {
          tool_status: event.status,
          // Solo incluir ai_provider si es válido
          ...(event.model?.provider && ['openai', 'anthropic', 'google'].includes(event.model.provider) && {
            ai_provider: this.mapProviderToUppercase(event.model.provider)
          }),
          ai_model: event.model?.model,
          ai_temperature: event.model?.temperature,
          ai_top_p: event.model?.topP,
          ai_max_tokens: event.model?.maxTokens,
          input_length: event.metrics?.inputLength,
          output_length: event.metrics?.outputLength,
          tokens_used: event.metrics?.tokensUsed,
          processing_time_ms: event.metrics?.processingTime,
          batch_size: event.metrics?.batchSize,
          items_processed: event.metrics?.itemsProcessed,
          content_type: event.content?.type,
          content_count: event.content?.count,
          content_total_size: event.content?.totalSize,
          content_formats: event.content?.formats,
          content_sources: event.content?.sources
        }),
        
        // Debug logging for processing provider
        ...(event.event === "processing" && (
          event.model?.provider && ['openai', 'anthropic', 'google'].includes(event.model.provider) ?
            console.log('🔍 DEBUG - processing ai_provider set to:', this.mapProviderToUppercase(event.model.provider)) :
            console.log('🔍 DEBUG - processing ai_provider NOT set. Model:', event.model)
        )),
        
        ...(event.event === "analysis" && {
          tool_status: event.status,
          // Solo incluir ai_provider si es válido
          ...(event.model?.provider && ['openai', 'anthropic', 'google'].includes(event.model.provider) && {
            ai_provider: this.mapProviderToUppercase(event.model.provider)
          }),
          ai_model: event.model?.model,
          ai_temperature: event.model?.temperature,
          ai_top_p: event.model?.topP,
          ai_max_tokens: event.model?.maxTokens,
          analysis_results: event.results,
          analysis_input_type: event.inputData?.type,
          analysis_input_length: event.inputData?.length,
          analysis_input_language: event.inputData?.language
        }),
        

        
        ...(event.event === "generation" && {
          tool_status: event.status,
          // Solo incluir ai_provider si es válido
          ...(event.model?.provider && ['openai', 'anthropic', 'google'].includes(event.model.provider) && {
            ai_provider: this.mapProviderToUppercase(event.model.provider)
          }),
          ai_model: event.model?.model,
          ai_temperature: event.model?.temperature,
          ai_top_p: event.model?.topP,
          ai_max_tokens: event.model?.maxTokens,
          generation_template: event.template,
          generation_input_sources: event.inputSources,
          input_length: event.metrics?.inputLength,
          output_length: event.metrics?.outputLength,
          tokens_used: event.metrics?.tokensUsed,
          processing_time_ms: event.metrics?.processingTime
        }),
        
        // Debug logging for generation provider
        ...(event.event === "generation" && (
          event.model?.provider && ['openai', 'anthropic', 'google'].includes(event.model.provider) ?
            console.log('🔍 DEBUG - generation ai_provider set to:', this.mapProviderToUppercase(event.model.provider)) :
            console.log('🔍 DEBUG - generation ai_provider NOT set. Model:', event.model)
        )),
        
        ...(event.event === "validation" && {
          validation_status: event.status,
          validation_schema: event.schema,
          validation_errors: event.validationErrors
        }),
        
        ...(event.event === "system" && {
          system_status: event.status,
          system_resource: event.resource,
          system_performance: event.performance
        }),
        
        // Información de error (común para todos los tipos)
        ...(event.error && {
          error_code: event.error.code,
          error_message: event.error.message,
          error_stack: event.error.stack,
          error_retryable: event.error.retryable,
          // Solo incluir error_provider si es válido
          ...(event.error.provider && ['openai', 'anthropic', 'google'].includes(event.error.provider) && {
            error_provider: this.mapProviderToUppercase(event.error.provider)
          })
        }),
        
        // Debug logging for error provider
        ...(event.error?.provider && ['openai', 'anthropic', 'google'].includes(event.error.provider) && 
            console.log('🔍 DEBUG - error_provider set to:', this.mapProviderToUppercase(event.error.provider))),
        
        // Contexto adicional
        context: {},
        additional_data: {}
      };

      const supabase = await this.supabasePromise;
      const { error } = await supabase
        .from("logs")
        .insert(dbRecord);

      if (error) {
        console.error("❌ [Logger] Error saving to database:", error);
        console.error("❌ Failed record:", dbRecord);
      } else {
        console.log("✅ Successfully saved log to database");
      }
    } catch (error) {
      console.error("❌ [Logger] Exception saving to database:", error);
    }
  }

  // Métodos para eventos de autenticación
  async logAuth(message: string, status: AuthStatus, user?: UserInfo, error?: ErrorInfo): Promise<void> {
    const event = createLogEvent.auth({
      level: error ? "error" : "info",
      status,
      user,
      metadata: this.getBaseMetadata(),
      message,
      error
    });

    await this.saveToDatabase(event);
    this.addToLocalLogs(event.level, message, { status, user, error });
  }

  // Métodos para eventos de API key
  async logApiKey(message: string, status: ApiKeyStatus, apiKey?: ApiKeyInfo, error?: ErrorInfo): Promise<void> {
    const event = createLogEvent.apiKey({
      level: error ? "error" : "info",
      status,
      apiKey,
      metadata: this.getBaseMetadata(),
      message,
      error
    });

    await this.saveToDatabase(event);
    this.addToLocalLogs(event.level, message, { status, apiKey, error });
  }

  // Métodos para eventos de configuración de herramienta
  async logToolConfig(message: string, status: ToolConfigStatus, config?: ToolConfig, error?: ErrorInfo): Promise<void> {
    const event = createLogEvent.toolConfig({
      level: error ? "error" : "info",
      status,
      config,
      metadata: this.getBaseMetadata(),
      message,
      error
    });

    await this.saveToDatabase(event);
    this.addToLocalLogs(event.level, message, { status, config, error });
  }

  // Métodos para eventos de procesamiento
  async logProcessing(
    message: string, 
    status: ToolStatus, 
    options: {
      content?: ProcessedContent;
      model?: AIModelInfo;
      metrics?: ProcessingMetrics;
      error?: ErrorInfo;
    } = {}
  ): Promise<void> {
    const event = createLogEvent.processing({
      level: options.error ? "error" : "info",
      status,
      content: options.content,
      model: options.model,
      metrics: options.metrics,
      metadata: this.getBaseMetadata(),
      message,
      error: options.error
    });

    await this.saveToDatabase(event);
    this.addToLocalLogs(event.level, message, { status, ...options });
  }

  // Métodos para eventos de análisis
  async logAnalysis(
    message: string, 
    status: ToolStatus, 
    options: {
      model?: AIModelInfo;
      results?: AnalysisResult[];
      inputData?: { type: ContentType; length: number; language?: string };
      error?: ErrorInfo;
    } = {}
  ): Promise<void> {
    const event = createLogEvent.analysis({
      level: options.error ? "error" : "info",
      status,
      model: options.model,
      results: options.results,
      inputData: options.inputData,
      metadata: this.getBaseMetadata(),
      message,
      error: options.error
    });

    await this.saveToDatabase(event);
    this.addToLocalLogs(event.level, message, { status, ...options });
  }

  // Métodos para eventos de generación
  async logGeneration(
    message: string, 
    status: ToolStatus, 
    options: {
      model?: AIModelInfo;
      template?: string;
      inputSources?: ContentType[];
      metrics?: ProcessingMetrics;
      error?: ErrorInfo;
    } = {}
  ): Promise<void> {
    const event = createLogEvent.generation({
      level: options.error ? "error" : "info",
      status,
      model: options.model,
      template: options.template,
      inputSources: options.inputSources,
      metrics: options.metrics,
      metadata: this.getBaseMetadata(),
      message,
      error: options.error
    });

    await this.saveToDatabase(event);
    this.addToLocalLogs(event.level, message, { status, ...options });
  }

  async info(message: string, data?: any): Promise<void> {
    const log: DebugLogTypes = {
      timestamp: new Date().toISOString(),
      level: "info",
      message,
      data
    };
    this.logs.push(log);
  }

  async error(message: string, data?: any): Promise<void> {
    const log: DebugLogTypes = {
      timestamp: new Date().toISOString(),
      level: "error",
      message,
      data
    };
    this.logs.push(log);
  }

  async warn(message: string, data?: any): Promise<void> {
    const log: DebugLogTypes = {
      timestamp: new Date().toISOString(),
      level: "warn",
      message,
      data
    };
    this.logs.push(log);
  }

  private addToLocalLogs(level: LogLevel, message: string, data?: any): void {
    const log: DebugLogTypes = {
      timestamp: new Date().toISOString(),
      level: level as any,
      message,
      data
    };
    this.logs.push(log);
  }

  getLogs(): DebugLogTypes[] {
    return this.logs;
  }

  // Método para obtener logs serializables para Server Actions y Client Components
  getSerializableLogs(): DebugLogTypes[] {
    return this.logs.map((log) => ({
      timestamp: log.timestamp,
      level: log.level,
      message: log.message,
      // deep copy JSON-safe; elimina prototipos de clase y métodos
      data: log.data ? JSON.parse(JSON.stringify(log.data)) : undefined,
    }));
  }

  clear(): void {
    this.logs = [];
  }

  updateContext(newContext: Partial<LoggerContext>): void {
    this.context = { ...this.context, ...newContext };
  }

  createChild(additionalContext: Partial<LoggerContext>): DebugLogger {
    return new DebugLogger({ ...this.context, ...additionalContext });
  }

  async finalize(
    finalStatus: ToolStatus,
    options: {
      model?: AIModelInfo;
      metrics?: ProcessingMetrics;
      content?: ProcessedContent;
      error?: ErrorInfo;
      template?: string;
      inputSources?: ContentType[];
      results?: AnalysisResult[];
      inputData?: { type: ContentType; length: number; language?: string };
    } = {}
  ): Promise<void> {
    const modelInfo = options.model || this.extractModelInfo();
    const metrics = options.metrics || this.extractMetrics();
    const contentInfo = options.content || this.extractContentInfo();
    const errorInfo = options.error || this.extractError();

    // Registrar evento de finalización como generación/procesamiento/análisis según el contexto disponible
    if (options.template || this.context.toolIdentity === "thread-generator" || this.context.toolIdentity === "newsletter" || this.context.toolIdentity === "resume") {
      await this.logGeneration(
        errorInfo ? `Finalizado con error: ${errorInfo.message}` : "Finalizado con éxito",
        finalStatus,
        {
          model: modelInfo,
          template: options.template,
          inputSources: options.inputSources,
          metrics,
          error: errorInfo
        }
      );
    } else if (options.results || this.context.toolIdentity === "proofreader") {
      await this.logAnalysis(
        errorInfo ? `Finalizado con error: ${errorInfo.message}` : "Finalizado con éxito",
        finalStatus,
        {
          model: modelInfo,
          results: options.results,
          inputData: options.inputData,
          error: errorInfo
        }
      );
    } else {
      await this.logProcessing(
        errorInfo ? `Finalizado con error: ${errorInfo.message}` : "Finalizado con éxito",
        finalStatus,
        {
          content: contentInfo,
          model: modelInfo,
          metrics,
          error: errorInfo
        }
      );
    }
  }

  // Métodos auxiliares para extraer información de los logs locales si no se proporcionan explícitamente
  extractModelInfo(): AIModelInfo | undefined {
    // Buscar el último modelo registrado en los logs locales
    for (let i = this.logs.length - 1; i >= 0; i--) {
      const log = this.logs[i];
      if (log.data?.model) {
        return log.data.model;
      }
      if (log.data?.status && log.data?.model) {
        return log.data.model;
      }
      if (log.data?.status && log.data?.options?.model) {
        return log.data.options.model;
      }
    }
    return undefined;
  }

  extractMetrics(): ProcessingMetrics | undefined {
    // Buscar las últimas métricas registradas en los logs locales
    for (let i = this.logs.length - 1; i >= 0; i--) {
      const log = this.logs[i];
      if (log.data?.metrics) {
        return log.data.metrics;
      }
      if (log.data?.status && log.data?.metrics) {
        return log.data.metrics;
      }
      if (log.data?.status && log.data?.options?.metrics) {
        return log.data.options.metrics;
      }
    }
    // Si no hay métricas explícitas pero hay tiempos, calcular duración
    const duration = this.getDuration();
    if (duration) {
      return { processingTime: duration } as ProcessingMetrics;
    }
    return undefined;
  }

  extractContentInfo(): ProcessedContent | undefined {
    // Buscar el último contenido procesado registrado en los logs locales
    for (let i = this.logs.length - 1; i >= 0; i--) {
      const log = this.logs[i];
      if (log.data?.content) {
        return log.data.content;
      }
      if (log.data?.status && log.data?.content) {
        return log.data.content;
      }
      if (log.data?.status && log.data?.options?.content) {
        return log.data.options.content;
      }
    }
    return undefined;
  }

  getDuration(): number {
    return Date.now() - this.startTime;
  }

  extractError(): ErrorInfo | undefined {
    // Buscar el último error registrado
    for (let i = this.logs.length - 1; i >= 0; i--) {
      const log = this.logs[i];
      if (log.level === "error" && log.data?.error) {
        return log.data.error;
      }
      if (log.data?.status && log.data?.error) {
        return log.data.error;
      }
      if (log.data?.status && log.data?.options?.error) {
        return log.data.options.error;
      }
    }
    return undefined;
  }
}