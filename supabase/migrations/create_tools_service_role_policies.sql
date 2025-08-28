-- Crear políticas RLS para permitir a la cuenta de servicio realizar operaciones en la tabla 'tools'

-- Política para SELECT (consultar)
CREATE POLICY "service_role_select_tools" ON "public"."tools"
AS PERMISSIVE FOR SELECT
TO service_role
USING (true);

-- Política para INSERT (insertar)
CREATE POLICY "service_role_insert_tools" ON "public"."tools"
AS PERMISSIVE FOR INSERT
TO service_role
WITH CHECK (true);

-- Política para UPDATE (actualizar)
CREATE POLICY "service_role_update_tools" ON "public"."tools"
AS PERMISSIVE FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Política para DELETE (eliminar)
CREATE POLICY "service_role_delete_tools" ON "public"."tools"
AS PERMISSIVE FOR DELETE
TO service_role
USING (true);

-- Verificar que las políticas se crearon correctamente
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd 
FROM pg_policies 
WHERE tablename = 'tools' AND 'service_role' = ANY(roles);