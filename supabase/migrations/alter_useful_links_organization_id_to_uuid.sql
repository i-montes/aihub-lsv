-- Migración para cambiar organization_id de BIGINT a UUID en la tabla useful_links

-- Primero, eliminar el índice existente
DROP INDEX IF EXISTS idx_useful_links_organization_id;

-- Eliminar las políticas RLS existentes que dependen de la columna
DROP POLICY IF EXISTS "Users can view useful_links from their organization" ON useful_links;
DROP POLICY IF EXISTS "Users can insert useful_links in their organization" ON useful_links;
DROP POLICY IF EXISTS "Users can update useful_links from their organization" ON useful_links;
DROP POLICY IF EXISTS "Users can delete useful_links from their organization" ON useful_links;

-- Cambiar el tipo de dato de organization_id de BIGINT a UUID
ALTER TABLE useful_links 
ALTER COLUMN organization_id TYPE UUID USING organization_id::text::uuid;

-- Recrear el índice con el nuevo tipo de dato
CREATE INDEX IF NOT EXISTS idx_useful_links_organization_id ON useful_links(organization_id);

-- Recrear las políticas RLS con el nuevo tipo de dato
CREATE POLICY "Users can view useful_links from their organization" ON useful_links
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert useful_links in their organization" ON useful_links
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update useful_links from their organization" ON useful_links
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete useful_links from their organization" ON useful_links
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );