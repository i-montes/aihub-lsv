-- Crear tabla useful_links para gestionar enlaces útiles dinámicamente
CREATE TABLE IF NOT EXISTS useful_links (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  link TEXT NOT NULL,
  organization_id BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para mejorar el rendimiento de consultas por organization_id
CREATE INDEX IF NOT EXISTS idx_useful_links_organization_id ON useful_links(organization_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE useful_links ENABLE ROW LEVEL SECURITY;

-- Crear política para que los usuarios solo puedan ver enlaces de su organización
CREATE POLICY "Users can view useful_links from their organization" ON useful_links
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Crear política para que los usuarios puedan insertar enlaces en su organización
CREATE POLICY "Users can insert useful_links in their organization" ON useful_links
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Crear política para que los usuarios puedan actualizar enlaces de su organización
CREATE POLICY "Users can update useful_links from their organization" ON useful_links
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Crear política para que los usuarios puedan eliminar enlaces de su organización
CREATE POLICY "Users can delete useful_links from their organization" ON useful_links
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Otorgar permisos a los roles anon y authenticated
GRANT ALL PRIVILEGES ON useful_links TO authenticated;
GRANT SELECT ON useful_links TO anon;

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_useful_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_useful_links_updated_at_trigger
  BEFORE UPDATE ON useful_links
  FOR EACH ROW
  EXECUTE FUNCTION update_useful_links_updated_at();