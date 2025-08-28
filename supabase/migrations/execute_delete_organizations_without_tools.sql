-- Eliminación de organizaciones que no tienen registros en la tabla tools
-- Esta consulta eliminará permanentemente las organizaciones sin herramientas asociadas

DELETE FROM organization 
WHERE id IN (
    SELECT o.id
    FROM organization o
    LEFT JOIN tools t ON o.id = t.organization_id
    WHERE t.organization_id IS NULL
);

-- Verificar el resultado después de la eliminación
SELECT COUNT(*) as total_organizaciones_restantes FROM organization;

-- Mostrar las organizaciones que quedaron (con herramientas)
SELECT 
    o.id,
    o.name,
    o.description,
    COUNT(t.id) as cantidad_herramientas
FROM organization o
INNER JOIN tools t ON o.id = t.organization_id
GROUP BY o.id, o.name, o.description
ORDER BY cantidad_herramientas DESC;