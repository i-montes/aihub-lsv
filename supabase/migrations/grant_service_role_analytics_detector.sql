-- Otorga a service_role los permisos de tabla sobre analytics_detector.
--
-- La app escribe con service_role (getSupabaseRouteHandler usa
-- SUPABASE_SERVICE_ROLE_KEY). Las políticas RLS de la migración anterior
-- ("service_role hace todo...") sólo gobiernan qué filas puede ver/tocar una
-- vez que ya tiene permiso de tocar la tabla — el permiso de tabla en sí es
-- una capa aparte en Postgres (GRANT), y analytics_detector se creó por
-- conexión directa a Postgres, que no hereda los GRANT automáticos que
-- aplica el flujo normal de Supabase.
--
-- Sin esto, cada insert falla con 42501 "permission denied for table" antes
-- de siquiera evaluar RLS.

grant select, insert, update, delete on public.analytics_detector to service_role;

-- Verificación: debe devolver "t" (true) en las tres filas.
select
  has_table_privilege('service_role', 'public.analytics_detector', 'INSERT') as puede_insertar,
  has_table_privilege('service_role', 'public.analytics_detector', 'SELECT') as puede_leer,
  has_table_privilege('service_role', 'public.analytics_detector', 'UPDATE') as puede_actualizar;
