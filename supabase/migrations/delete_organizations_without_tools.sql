-- Consulta SQL para eliminar organizaciones que no tienen registros en la tabla tools
-- Primero identificamos las organizaciones que no tienen herramientas asociadas

-- Paso 1: Mostrar las organizaciones que serán eliminadas
SELECT 
    o.id,
    o.name,
    o.description,
    o."createdAt",
    o.state
FROM organization o
LEFT JOIN tools t ON o.id = t.organization_id
WHERE t.organization_id IS NULL;

-- Paso 2: Eliminar las organizaciones que no tienen herramientas asociadas
-- NOTA: Esta operación eliminará permanentemente los registros
-- Asegúrate de revisar los resultados del paso 1 antes de ejecutar esta parte

/*
DELETE FROM organization 
WHERE id IN (
    SELECT o.id
    FROM organization o
    LEFT JOIN tools t ON o.id = t.organization_id
    WHERE t.organization_id IS NULL
);
*/

-- Para obtener el conteo de organizaciones que serán eliminadas:
SELECT COUNT(*) as organizaciones_a_eliminar
FROM organization o
LEFT JOIN tools t ON o.id = t.organization_id
WHERE t.organization_id IS NULL;

-- Para verificar el resultado después de la eliminación:
-- SELECT COUNT(*) as total_organizaciones_restantes FROM organization;