-- Conexiones de las herramientas con servicios externos que no son proveedores
-- de modelos: por ahora Canva, Facebook e Instagram, para En Vivo.
--
-- herramienta_proveedores sólo admite OPENAI, ANTHROPIC y GOOGLE, y la tabla de
-- integraciones se borró (commit 9d4f757). Ésta es genérica a propósito: otra
-- red (X, LinkedIn) es un valor más en el check, no otra tabla.
--
-- Mismo modelo de seguridad que herramienta_proveedores: sólo el rol de
-- servicio la lee y escribe; el navegador nunca la ve. Los secretos dentro de
-- `datos` (client secret de Canva, token de página de Facebook) van cifrados
-- con AES-256-GCM y la clave de CONEXIONES_CLAVE (ver lib/en-vivo/conexiones.ts).
-- Ver docs/superpowers/specs/2026-11-25-herramienta-en-vivo-design.md.

create table if not exists public.herramienta_conexiones (
  organization_id uuid not null references public.organization (id) on delete cascade,
  herramienta text not null,
  servicio text not null check (servicio in ('CANVA', 'FACEBOOK', 'INSTAGRAM')),
  -- CANVA:    client_id, client_secret (cifrado), plantilla_id, campo_titular, campo_foto
  -- FACEBOOK: page_id, page_name, page_token (cifrado), scopes, conectado_por,
  --           conectado_en, estado ('conectado' | 'desconectado')
  -- INSTAGRAM: ig_user_id, usuario, page_id (publica con el token de la página)
  datos jsonb not null,
  actualizado_por uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, herramienta, servicio)
);

alter table public.herramienta_conexiones enable row level security;

revoke all on public.herramienta_conexiones from anon, authenticated;
grant select, insert, update, delete on public.herramienta_conexiones to service_role;

drop policy if exists "service_role_todo" on public.herramienta_conexiones;
create policy "service_role_todo"
  on public.herramienta_conexiones
  for all
  to service_role
  using (true)
  with check (true);
