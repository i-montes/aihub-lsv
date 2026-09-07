-- Permite que `authenticated` también escriba en analytics_detector.
--
-- getSupabaseRouteHandler() crea el cliente con la key de service_role, pero
-- también le pasa las cookies de sesión del usuario. @supabase/ssr, al ver una
-- sesión válida en las cookies, tiende a usar el JWT del usuario para las
-- queries en vez de la key que se le pasó al constructor — así que el request
-- termina corriendo como `authenticated`, no como `service_role`.
--
-- Las otras tres tablas de analytics (corrector, hilos, resúmenes) nunca
-- lo notaron porque no tienen RLS habilitado. analytics_detector sí, y su
-- única política de escritura era sólo para service_role — de ahí que el
-- insert fallara en silencio (save() traga el error de RLS).
--
-- Se limita a la propia organización, igual que la política de lectura que ya
-- existía: un usuario autenticado sólo puede escribir filas de su organización.

drop policy if exists "escritura por organizacion en analytics_detector" on public.analytics_detector;
create policy "escritura por organizacion en analytics_detector"
  on public.analytics_detector
  for all
  to authenticated
  using (
    organization_id = (
      select p."organizationId" from public.profiles p where p.id = auth.uid()
    )
  )
  with check (
    organization_id = (
      select p."organizationId" from public.profiles p where p.id = auth.uid()
    )
  );

-- Verificación: ahora debe aparecer una tercera política, ALL para authenticated.
select policyname, cmd, roles from pg_policies where tablename = 'analytics_detector';
