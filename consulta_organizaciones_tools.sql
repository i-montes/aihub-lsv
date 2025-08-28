-- Consulta para obtener las organizaciones y la cantidad de herramientas que tiene cada una
SELECT 
    o.id as organization_id,
    o.name as organization_name,
    COUNT(t.id) as total_tools
FROM 
    organization o
LEFT JOIN 
    tools t ON o.id = t.organization_id
GROUP BY 
    o.id, o.name
ORDER BY 
    total_tools DESC, o.name ASC;

-- Consulta alternativa que solo muestra organizaciones que tienen herramientas
-- SELECT 
--     o.id as organization_id,
--     o.name as organization_name,
--     COUNT(t.id) as total_tools
-- FROM 
--     organization o
-- INNER JOIN 
--     tools t ON o.id = t.organization_id
-- GROUP BY 
--     o.id, o.name
-- ORDER BY 
--     total_tools DESC, o.name ASC;