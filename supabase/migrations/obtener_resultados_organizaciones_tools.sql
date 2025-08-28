-- Consulta para obtener organizaciones y cantidad de herramientas
SELECT 
    o.name AS organizacion,
    COUNT(t.id) AS cantidad_tools
FROM organization o
LEFT JOIN tools t ON o.id = t.organization_id
GROUP BY o.id, o.name
ORDER BY cantidad_tools DESC, o.name ASC;