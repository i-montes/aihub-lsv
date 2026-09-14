-- Otorga a service_role los permisos de tabla sobre analytics_quien_es_quien.
--
-- Mismo bug que tuvo analytics_detector (ver
-- grant_service_role_analytics_detector.sql): esta tabla no tiene RLS a
-- propósito, así que el permiso de tabla (GRANT) es lo único que la protege.
-- `authenticated` ya lo tiene por default ACL del esquema, pero `service_role`
-- no — y a diferencia de las otras cuatro escrituras de analytics de esta app,
-- `AnalyticsQuienEsQuienService` en `/api/perfil` se construye DENTRO de
-- `after()`, no antes de responder. Ahí `getSupabaseRouteHandler()` no
-- conserva la sesión del usuario que hizo la petición, así que el cliente cae
-- a service_role para autenticarse — y sin este grant, la fila nunca se
-- guardaba: reproducido en vivo, error 42501 "permission denied for table".

grant select, insert, update, delete on public.analytics_quien_es_quien to service_role;

-- Verificación: debe devolver "t" (true) en las tres filas.
select
  has_table_privilege('service_role', 'public.analytics_quien_es_quien', 'INSERT') as puede_insertar,
  has_table_privilege('service_role', 'public.analytics_quien_es_quien', 'SELECT') as puede_leer,
  has_table_privilege('service_role', 'public.analytics_quien_es_quien', 'UPDATE') as puede_actualizar;
