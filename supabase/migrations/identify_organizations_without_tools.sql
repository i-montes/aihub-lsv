-- Identificar organizaciones que no tienen herramientas asociadas
SELECT 
    o.id,
    o.name,
    o.created_at
FROM organizations o
LEFT JOIN tools t ON o.id = t.organization_id
WHERE t.organization_id IS NULL
ORDER BY o.created_at DESC;