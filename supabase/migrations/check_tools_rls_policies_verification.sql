-- Verificar las políticas RLS actuales de la tabla 'tools'
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

-- También verificar si RLS está habilitado en la tabla
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'tools';