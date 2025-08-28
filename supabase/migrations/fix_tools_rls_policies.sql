-- Eliminar políticas RLS existentes para la tabla 'tools'
DROP POLICY IF EXISTS "service_role_select_tools" ON tools;
DROP POLICY IF EXISTS "service_role_insert_tools" ON tools;
DROP POLICY IF EXISTS "service_role_update_tools" ON tools;
DROP POLICY IF EXISTS "service_role_delete_tools" ON tools;

-- Crear nuevas políticas RLS para permitir al service_role realizar todas las operaciones
CREATE POLICY "service_role_all_access_tools" ON tools
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Verificar que RLS esté habilitado en la tabla
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- Otorgar permisos explícitos al service_role
GRANT ALL PRIVILEGES ON tools TO service_role;

-- Verificar las políticas creadas
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'tools'
ORDER BY policyname;