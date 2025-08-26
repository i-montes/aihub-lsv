-- Migración para agregar campos OAuth2 a la tabla wordpress_integration_table
-- Fecha: 2025-01-20
-- Propósito: Soportar autenticación OAuth2 para WordPress.com además de WordPress autohospedado

-- Agregar nuevos campos para OAuth2
ALTER TABLE wordpress_integration_table 
ADD COLUMN access_token TEXT,
ADD COLUMN refresh_token TEXT,
ADD COLUMN expires_at TIMESTAMP WITHOUT TIME ZONE,
ADD COLUMN token_type TEXT DEFAULT 'Bearer',
ADD COLUMN connection_type TEXT NOT NULL DEFAULT 'self_hosted';

-- Modificar campos existentes para que sean opcionales en conexiones OAuth2
ALTER TABLE wordpress_integration_table 
ALTER COLUMN username DROP NOT NULL,
ALTER COLUMN password DROP NOT NULL;

-- Agregar constraint para validar connection_type
ALTER TABLE wordpress_integration_table 
ADD CONSTRAINT check_connection_type 
CHECK (connection_type IN ('self_hosted', 'wordpress_com'));

-- Agregar índice para mejorar consultas por tipo de conexión
CREATE INDEX idx_wordpress_integration_connection_type 
ON wordpress_integration_table(connection_type);

-- Agregar índice para mejorar consultas por organización y tipo de conexión
CREATE INDEX idx_wordpress_integration_org_connection 
ON wordpress_integration_table("organizationId", connection_type);

-- Comentarios para documentar los nuevos campos
COMMENT ON COLUMN wordpress_integration_table.access_token IS 'Token de acceso OAuth2 para WordPress.com';
COMMENT ON COLUMN wordpress_integration_table.refresh_token IS 'Token de renovación OAuth2 para WordPress.com';
COMMENT ON COLUMN wordpress_integration_table.expires_at IS 'Fecha y hora de expiración del access_token';
COMMENT ON COLUMN wordpress_integration_table.token_type IS 'Tipo de token OAuth2 (generalmente Bearer)';
COMMENT ON COLUMN wordpress_integration_table.connection_type IS 'Tipo de conexión: self_hosted para WordPress autohospedado, wordpress_com para WordPress.com';