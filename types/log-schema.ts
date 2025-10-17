import { z } from "zod";

// Niveles de log
export const LogLevelSchema = z.enum(["debug", "info", "warn", "error", "fatal"]);

// Proveedores de IA soportados
export const AIProviderSchema = z.enum(["openai", "anthropic", "google"]);

// Estados de herramientas
export const ToolStatusSchema = z.enum([
  "initializing",
  "processing", 
  "completed",
  "failed",
  "cancelled"
]);

// Estados de autenticación
export const AuthStatusSchema = z.enum([
  "authenticating",
  "authenticated", 
  "failed",
  "missing_session",
  "missing_organization"
]);

// Estados de API keys
export const ApiKeyStatusSchema = z.enum([
  "fetching",
  "found",
  "not_found",
  "invalid",
  "empty",
  "active"
]);

// Estados de configuración de herramientas
export const ToolConfigStatusSchema = z.enum([
  "fetching",
  "found_custom",
  "using_default",
  "not_found",
  "invalid"
]);

// Tipos de herramientas
export const ToolTypeSchema = z.enum([
  "proofreader",
  "newsletter", 
  "resume",
  "thread-generator",
  "analyzer",
  "custom",
  "detector"
]);

// Tipos de contenido procesado
export const ContentTypeSchema = z.enum([
  "text",
  "html", 
  "pdf",
  "image",
  "wordpress_post",
  "custom_content",
  "mixed"
]);

// Schema base para timestamp y metadata común
export const BaseLogMetadataSchema = z.object({
  timestamp: z.string().datetime(),
  sessionId: z.string().optional(),
  requestId: z.string().optional(),
  userId: z.string().optional(),
  organizationId: z.string().optional(),
  toolIdentity: ToolTypeSchema.optional(),
  duration: z.number().optional(), // en millisegundos
});

// Schema para información de usuario
export const UserInfoSchema = z.object({
  userId: z.string(),
  organizationId: z.string(),
  role: z.string().optional(),
  email: z.string().email().optional(),
});

// Schema para información de modelo de IA
export const AIModelInfoSchema = z.object({
  provider: AIProviderSchema,
  model: z.string(),
  temperature: z.number().min(0).max(2).optional(),
  topP: z.number().min(0).max(1).optional(),
  maxTokens: z.number().positive().optional(),
});

// Schema para métricas de procesamiento
export const ProcessingMetricsSchema = z.object({
  inputLength: z.number().nonnegative().optional(),
  outputLength: z.number().nonnegative().optional(),
  tokensUsed: z.number().nonnegative().optional(),
  processingTime: z.number().nonnegative().optional(), // en millisegundos
  batchSize: z.number().positive().optional(),
  itemsProcessed: z.number().nonnegative().optional(),
});

// Schema para contenido procesado
export const ProcessedContentSchema = z.object({
  type: ContentTypeSchema,
  count: z.number().nonnegative(),
  totalSize: z.number().nonnegative().optional(), // en bytes
  formats: z.array(z.string()).optional(),
  sources: z.array(z.string()).optional(),
});

// Schema para errores
export const ErrorInfoSchema = z.object({
  code: z.string().optional(),
  message: z.string(),
  stack: z.string().optional(),
  context: z.record(z.any()).optional(),
  retryable: z.boolean().optional(),
  provider: AIProviderSchema.optional(),
});

// Schema para configuración de herramientas
export const ToolConfigSchema = z.object({
  identity: ToolTypeSchema,
  isCustom: z.boolean(),
  temperature: z.number().optional(),
  topP: z.number().optional(),
  promptsCount: z.number().nonnegative(),
  hasSchema: z.boolean().optional(),
  promptTitles: z.array(z.string()).optional(),
});

// Schema para información de API key
export const ApiKeyInfoSchema = z.object({
  provider: AIProviderSchema,
  status: ApiKeyStatusSchema,
  hasValue: z.boolean(),
  lastUsed: z.string().datetime().optional(),
});

// Schema para resultados de análisis/correcciones
export const AnalysisResultSchema = z.object({
  type: z.enum(["spelling", "grammar", "style", "punctuation", "general"]),
  count: z.number().nonnegative(),
  categories: z.array(z.string()).optional(),
});

// Schema para eventos específicos por categoría
export const AuthEventSchema = z.object({
  event: z.literal("auth"),
  level: LogLevelSchema,
  status: AuthStatusSchema,
  user: UserInfoSchema.optional(),
  metadata: BaseLogMetadataSchema,
  message: z.string(),
  error: ErrorInfoSchema.optional(),
});

export const ApiKeyEventSchema = z.object({
  event: z.literal("api_key"),
  level: LogLevelSchema,
  status: ApiKeyStatusSchema,
  apiKey: ApiKeyInfoSchema.optional(),
  metadata: BaseLogMetadataSchema,
  message: z.string(),
  error: ErrorInfoSchema.optional(),
});

export const ToolConfigEventSchema = z.object({
  event: z.literal("tool_config"),
  level: LogLevelSchema,
  status: ToolConfigStatusSchema,
  config: ToolConfigSchema.optional(),
  metadata: BaseLogMetadataSchema,
  message: z.string(),
  error: ErrorInfoSchema.optional(),
});

export const ProcessingEventSchema = z.object({
  event: z.literal("processing"),
  level: LogLevelSchema,
  status: ToolStatusSchema,
  content: ProcessedContentSchema.optional(),
  model: AIModelInfoSchema.optional(),
  metrics: ProcessingMetricsSchema.optional(),
  metadata: BaseLogMetadataSchema,
  message: z.string(),
  error: ErrorInfoSchema.optional(),
});

export const AnalysisEventSchema = z.object({
  event: z.literal("analysis"),
  level: LogLevelSchema,
  status: ToolStatusSchema,
  results: z.array(AnalysisResultSchema).optional(),
  inputData: z.object({
    type: ContentTypeSchema,
    length: z.number().nonnegative(),
    language: z.string().optional(),
  }).optional(),
  metadata: BaseLogMetadataSchema,
  message: z.string(),
  error: ErrorInfoSchema.optional(),
});

export const GenerationEventSchema = z.object({
  event: z.literal("generation"),
  level: LogLevelSchema,
  status: ToolStatusSchema,
  model: AIModelInfoSchema.optional(),
  template: z.string().optional(),
  inputSources: z.array(ContentTypeSchema).optional(),
  metrics: ProcessingMetricsSchema.optional(),
  metadata: BaseLogMetadataSchema,
  message: z.string(),
  error: ErrorInfoSchema.optional(),
});

export const ValidationEventSchema = z.object({
  event: z.literal("validation"),
  level: LogLevelSchema,
  status: z.enum(["validating", "valid", "invalid", "schema_error"]),
  schema: z.string().optional(),
  validationErrors: z.array(z.object({
    path: z.string(),
    message: z.string(),
    value: z.any().optional(),
  })).optional(),
  metadata: BaseLogMetadataSchema,
  message: z.string(),
  error: ErrorInfoSchema.optional(),
});

export const SystemEventSchema = z.object({
  event: z.literal("system"),
  level: LogLevelSchema,
  status: z.enum(["startup", "shutdown", "health_check", "maintenance"]),
  resource: z.string().optional(),
  performance: z.object({
    memory: z.number().optional(),
    cpu: z.number().optional(),
    storage: z.number().optional(),
  }).optional(),
  metadata: BaseLogMetadataSchema,
  message: z.string(),
  error: ErrorInfoSchema.optional(),
});

// Schema general que unifica todos los tipos de eventos
export const LogEventSchema = z.discriminatedUnion("event", [
  AuthEventSchema,
  ApiKeyEventSchema,
  ToolConfigEventSchema,
  ProcessingEventSchema,
  AnalysisEventSchema,
  GenerationEventSchema,
  ValidationEventSchema,
  SystemEventSchema,
]);

// Schema para lotes de logs
export const LogBatchSchema = z.object({
  batchId: z.string(),
  timestamp: z.string().datetime(),
  source: z.string(),
  version: z.string().optional(),
  environment: z.enum(["development", "staging", "production"]).optional(),
  logs: z.array(LogEventSchema),
  metadata: z.object({
    totalEvents: z.number().nonnegative(),
    levels: z.record(LogLevelSchema, z.number().nonnegative()),
    duration: z.number().nonnegative().optional(),
    errors: z.number().nonnegative().optional(),
  }),
});

// Schema para respuesta de logs con paginación
export const LogResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    logs: z.array(LogEventSchema),
    pagination: z.object({
      total: z.number().nonnegative(),
      page: z.number().positive(),
      limit: z.number().positive(),
      totalPages: z.number().nonnegative(),
    }).optional(),
    filters: z.object({
      level: LogLevelSchema.optional(),
      event: z.string().optional(),
      dateFrom: z.string().datetime().optional(),
      dateTo: z.string().datetime().optional(),
      userId: z.string().optional(),
      organizationId: z.string().optional(),
    }).optional(),
  }),
  error: ErrorInfoSchema.optional(),
  timestamp: z.string().datetime(),
});

// Schema para configuración de logging
export const LogConfigSchema = z.object({
  level: LogLevelSchema,
  enableConsole: z.boolean().default(true),
  enableFile: z.boolean().default(false),
  enableDatabase: z.boolean().default(false),
  enableRemote: z.boolean().default(false),
  retention: z.object({
    days: z.number().positive().default(30),
    maxSize: z.number().positive().optional(), // en MB
    compress: z.boolean().default(true),
  }).optional(),
  format: z.enum(["json", "text", "structured"]).default("json"),
  destinations: z.array(z.object({
    type: z.enum(["console", "file", "database", "webhook", "elasticsearch"]),
    config: z.record(z.any()),
    enabled: z.boolean().default(true),
  })).optional(),
});

// Tipos TypeScript exportados
export type LogLevel = z.infer<typeof LogLevelSchema>;
export type AIProvider = z.infer<typeof AIProviderSchema>;
export type ToolStatus = z.infer<typeof ToolStatusSchema>;
export type AuthStatus = z.infer<typeof AuthStatusSchema>;
export type ApiKeyStatus = z.infer<typeof ApiKeyStatusSchema>;
export type ToolConfigStatus = z.infer<typeof ToolConfigStatusSchema>;
export type ToolType = z.infer<typeof ToolTypeSchema>;
export type ContentType = z.infer<typeof ContentTypeSchema>;

export type BaseLogMetadata = z.infer<typeof BaseLogMetadataSchema>;
export type UserInfo = z.infer<typeof UserInfoSchema>;
export type AIModelInfo = z.infer<typeof AIModelInfoSchema>;
export type ProcessingMetrics = z.infer<typeof ProcessingMetricsSchema>;
export type ProcessedContent = z.infer<typeof ProcessedContentSchema>;
export type ErrorInfo = z.infer<typeof ErrorInfoSchema>;
export type ToolConfig = z.infer<typeof ToolConfigSchema>;
export type ApiKeyInfo = z.infer<typeof ApiKeyInfoSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export type AuthEvent = z.infer<typeof AuthEventSchema>;
export type ApiKeyEvent = z.infer<typeof ApiKeyEventSchema>;
export type ToolConfigEvent = z.infer<typeof ToolConfigEventSchema>;
export type ProcessingEvent = z.infer<typeof ProcessingEventSchema>;
export type AnalysisEvent = z.infer<typeof AnalysisEventSchema>;
export type GenerationEvent = z.infer<typeof GenerationEventSchema>;
export type ValidationEvent = z.infer<typeof ValidationEventSchema>;
export type SystemEvent = z.infer<typeof SystemEventSchema>;

export type LogEvent = z.infer<typeof LogEventSchema>;
export type LogBatch = z.infer<typeof LogBatchSchema>;
export type LogResponse = z.infer<typeof LogResponseSchema>;
export type LogConfig = z.infer<typeof LogConfigSchema>;

// Utilidades para crear eventos de log
export const createLogEvent = {
  auth: (data: Omit<AuthEvent, "event">): AuthEvent => ({
    event: "auth" as const,
    ...data,
  }),

  apiKey: (data: Omit<ApiKeyEvent, "event">): ApiKeyEvent => ({
    event: "api_key" as const,
    ...data,
  }),

  toolConfig: (data: Omit<ToolConfigEvent, "event">): ToolConfigEvent => ({
    event: "tool_config" as const,
    ...data,
  }),

  processing: (data: Omit<ProcessingEvent, "event">): ProcessingEvent => ({
    event: "processing" as const,
    ...data,
  }),

  analysis: (data: Omit<AnalysisEvent, "event">): AnalysisEvent => ({
    event: "analysis" as const,
    ...data,
  }),

  generation: (data: Omit<GenerationEvent, "event">): GenerationEvent => ({
    event: "generation" as const,
    ...data,
  }),

  validation: (data: Omit<ValidationEvent, "event">): ValidationEvent => ({
    event: "validation" as const,
    ...data,
  }),

  system: (data: Omit<SystemEvent, "event">): SystemEvent => ({
    event: "system" as const,
    ...data,
  }),
};

// Utilidades para validar logs
export const validateLogEvent = (data: unknown): LogEvent => {
  return LogEventSchema.parse(data);
};

export const validateLogBatch = (data: unknown): LogBatch => {
  return LogBatchSchema.parse(data);
};

export const validateLogResponse = (data: unknown): LogResponse => {
  return LogResponseSchema.parse(data);
};