-- Tabla principal de logs que soporta todos los tipos de eventos del schema
CREATE TABLE logs (
    -- Identificación única del log
    id BIGSERIAL PRIMARY KEY,
    
    -- Información base del evento
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN (
        'auth', 'api_key', 'tool_config', 'processing', 
        'analysis', 'generation', 'validation', 'system'
    )),
    level VARCHAR(10) NOT NULL CHECK (level IN (
        'debug', 'info', 'warn', 'error', 'fatal'
    )),
    message TEXT NOT NULL,
    
    -- Metadata base
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    session_id VARCHAR(255),
    request_id VARCHAR(255),
    user_id UUID,
    organization_id UUID,
    tool_identity VARCHAR(20) CHECK (tool_identity IN (
        'proofreader', 'newsletter', 'resume', 'thread-generator', 'analyzer', 'custom'
    )),
    duration_ms INTEGER CHECK (duration_ms >= 0),
    
    -- Estados específicos por tipo de evento
    auth_status VARCHAR(20) CHECK (auth_status IN (
        'authenticating', 'authenticated', 'failed', 'missing_session', 'missing_organization'
    )),
    api_key_status VARCHAR(20) CHECK (api_key_status IN (
        'fetching', 'found', 'not_found', 'invalid', 'empty', 'active'
    )),
    tool_config_status VARCHAR(20) CHECK (tool_config_status IN (
        'fetching', 'found_custom', 'using_default', 'not_found', 'invalid'
    )),
    tool_status VARCHAR(20) CHECK (tool_status IN (
        'initializing', 'processing', 'completed', 'failed', 'cancelled'
    )),
    validation_status VARCHAR(20) CHECK (validation_status IN (
        'validating', 'valid', 'invalid', 'schema_error'
    )),
    system_status VARCHAR(20) CHECK (system_status IN (
        'startup', 'shutdown', 'health_check', 'maintenance'
    )),
    
    -- Información de usuario (desnormalizada para consultas rápidas)
    user_role VARCHAR(50),
    user_email VARCHAR(255),
    
    -- Información del modelo de IA
    ai_provider VARCHAR(20) CHECK (ai_provider IN ('openai', 'anthropic', 'google')),
    ai_model VARCHAR(100),
    ai_temperature DECIMAL(3,2) CHECK (ai_temperature >= 0 AND ai_temperature <= 2),
    ai_top_p DECIMAL(3,2) CHECK (ai_top_p >= 0 AND ai_top_p <= 1),
    ai_max_tokens INTEGER CHECK (ai_max_tokens > 0),
    
    -- Métricas de procesamiento
    input_length INTEGER CHECK (input_length >= 0),
    output_length INTEGER CHECK (output_length >= 0),
    tokens_used INTEGER CHECK (tokens_used >= 0),
    processing_time_ms INTEGER CHECK (processing_time_ms >= 0),
    batch_size INTEGER CHECK (batch_size > 0),
    items_processed INTEGER CHECK (items_processed >= 0),
    
    -- Información de contenido procesado
    content_type VARCHAR(20) CHECK (content_type IN (
        'text', 'html', 'pdf', 'image', 'wordpress_post', 'custom_content', 'mixed'
    )),
    content_count INTEGER CHECK (content_count >= 0),
    content_total_size BIGINT CHECK (content_total_size >= 0),
    content_formats TEXT[], -- Array de formatos
    content_sources TEXT[], -- Array de fuentes
    
    -- Información de error
    error_code VARCHAR(100),
    error_message TEXT,
    error_stack TEXT,
    error_retryable BOOLEAN,
    error_provider VARCHAR(20) CHECK (error_provider IN ('openai', 'anthropic', 'google')),
    
    -- Configuración de herramienta
    config_is_custom BOOLEAN,
    config_temperature DECIMAL(3,2),
    config_top_p DECIMAL(3,2),
    config_prompts_count INTEGER CHECK (config_prompts_count >= 0),
    config_has_schema BOOLEAN,
    config_prompt_titles TEXT[], -- Array de títulos de prompts
    
    -- Información de API key
    api_key_provider VARCHAR(20) CHECK (api_key_provider IN ('openai', 'anthropic', 'google')),
    api_key_has_value BOOLEAN,
    api_key_last_used TIMESTAMPTZ,
    
    -- Resultados de análisis
    analysis_results JSONB, -- Array de objetos con type, count, severity, categories
    analysis_input_type VARCHAR(20) CHECK (analysis_input_type IN (
        'text', 'html', 'pdf', 'image', 'wordpress_post', 'custom_content', 'mixed'
    )),
    analysis_input_length INTEGER CHECK (analysis_input_length >= 0),
    analysis_input_language VARCHAR(10),
    
    -- Generación
    generation_template VARCHAR(255),
    generation_input_sources TEXT[], -- Array de tipos de contenido
    
    -- Validación
    validation_schema VARCHAR(255),
    validation_errors JSONB, -- Array de objetos con path, message, value
    
    -- Sistema
    system_resource VARCHAR(255),
    system_performance JSONB, -- Objeto con memory, cpu, storage
    
    -- Contexto adicional y datos específicos del evento (flexible)
    context JSONB,
    additional_data JSONB,
    
    -- Información de entorno y versión
    environment VARCHAR(20) CHECK (environment IN ('development', 'staging', 'production')),
    version VARCHAR(50),
    source VARCHAR(255),
    
    -- Índices de timestamps para consultas de rango
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para optimizar consultas comunes
CREATE INDEX idx_logs_timestamp ON logs (timestamp);
CREATE INDEX idx_logs_event_type ON logs (event_type);
CREATE INDEX idx_logs_level ON logs (level);
CREATE INDEX idx_logs_user_id ON logs (user_id);
CREATE INDEX idx_logs_organization_id ON logs (organization_id);
CREATE INDEX idx_logs_tool_identity ON logs (tool_identity);
CREATE INDEX idx_logs_session_id ON logs (session_id);
CREATE INDEX idx_logs_request_id ON logs (request_id);
CREATE INDEX idx_logs_created_at ON logs (created_at);

-- Índice compuesto para consultas de filtrado común
CREATE INDEX idx_logs_org_event_level_timestamp ON logs (organization_id, event_type, level, timestamp);

-- Índice para búsquedas de error
CREATE INDEX idx_logs_error_code ON logs (error_code) WHERE error_code IS NOT NULL;

-- Índice para consultas de rendimiento
CREATE INDEX idx_logs_processing_metrics ON logs (processing_time_ms, tokens_used) WHERE processing_time_ms IS NOT NULL;

-- Índice GIN para búsquedas en campos JSONB
CREATE INDEX idx_logs_context_gin ON logs USING GIN (context);
CREATE INDEX idx_logs_additional_data_gin ON logs USING GIN (additional_data);
CREATE INDEX idx_logs_analysis_results_gin ON logs USING GIN (analysis_results);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_logs_updated_at 
    BEFORE UPDATE ON logs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Vista para consultas simplificadas de logs recientes
CREATE VIEW recent_logs AS
SELECT 
    id,
    event_type,
    level,
    message,
    timestamp,
    user_id,
    organization_id,
    tool_identity,
    duration_ms,
    error_code,
    error_message,
    context
FROM logs 
WHERE timestamp >= NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;

-- Vista para métricas de error
CREATE VIEW error_metrics AS
SELECT 
    event_type,
    tool_identity,
    error_code,
    COUNT(*) as error_count,
    MAX(timestamp) as last_occurrence,
    AVG(duration_ms) as avg_duration_ms
FROM logs 
WHERE level IN ('error', 'fatal')
  AND timestamp >= NOW() - INTERVAL '7 days'
GROUP BY event_type, tool_identity, error_code
ORDER BY error_count DESC;

-- Vista para métricas de rendimiento
CREATE VIEW performance_metrics AS
SELECT 
    tool_identity,
    ai_provider,
    ai_model,
    COUNT(*) as total_requests,
    AVG(processing_time_ms) as avg_processing_time,
    AVG(tokens_used) as avg_tokens_used,
    AVG(input_length) as avg_input_length,
    AVG(output_length) as avg_output_length,
    DATE_TRUNC('hour', timestamp) as hour_bucket
FROM logs 
WHERE event_type = 'processing'
  AND tool_status = 'completed'
  AND timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY tool_identity, ai_provider, ai_model, DATE_TRUNC('hour', timestamp)
ORDER BY hour_bucket DESC;

-- Función para limpiar logs antiguos (opcional)
CREATE OR REPLACE FUNCTION cleanup_old_logs(retention_days INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM logs 
    WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comentarios en la tabla para documentación
COMMENT ON TABLE logs IS 'Tabla principal para almacenar todos los eventos de log del sistema de herramientas de IA';
COMMENT ON COLUMN logs.event_type IS 'Tipo de evento: auth, api_key, tool_config, processing, analysis, generation, validation, system';
COMMENT ON COLUMN logs.level IS 'Nivel de severidad del log: debug, info, warn, error, fatal';
COMMENT ON COLUMN logs.context IS 'Contexto adicional específico del evento en formato JSON';
COMMENT ON COLUMN logs.additional_data IS 'Datos adicionales flexibles en formato JSON';
COMMENT ON COLUMN logs.duration_ms IS 'Duración del evento en milisegundos';
COMMENT ON COLUMN logs.tokens_used IS 'Número de tokens utilizados en llamadas a IA';
COMMENT ON COLUMN logs.processing_time_ms IS 'Tiempo de procesamiento específico en milisegundos';

-- Ejemplo de inserción para testing (opcional - comentar en producción)
/*
INSERT INTO logs (
    event_type, level, message, user_id, organization_id, tool_identity,
    tool_status, ai_provider, ai_model, input_length, output_length,
    tokens_used, processing_time_ms
) VALUES (
    'processing', 'info', 'Análisis de texto completado exitosamente',
    '123e4567-e89b-12d3-a456-426614174000', '456e7890-e12c-34d5-b678-539625285001',
    'proofreader', 'completed', 'openai', 'gpt-4', 1500, 800, 2300, 3500
);
*/