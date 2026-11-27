-- Analytics de "En Vivo": de una nota de La Silla a la pieza para Facebook.
--
-- Una fila por pieza. Los cambios pedidos, la publicación y la descarga
-- actualizan la misma fila (ver app/api/en-vivo/*).
--
-- Sólo el rol de servicio la lee y escribe, como herramienta_conexiones: RLS
-- activado, sin políticas para anon ni authenticated, y sin permisos para esos
-- dos roles. Así ningún usuario con sesión (de La Silla ni de otra organización,
-- como Orza) la lee o la cambia directo por PostgREST. AnalyticsEnVivoService
-- escribe con el cliente de servicio, y las rutas sólo tocan filas de la
-- organización y el usuario de la sesión (analyticsPropia en lib/analytics.ts).

create table if not exists public.analytics_en_vivo (
  id text primary key,
  session_id text not null,
  user_id uuid,
  organization_id uuid,

  url_nota text,
  titular text,
  personas jsonb,
  -- 'plantilla' (armada en el servidor) o 'canva' (plan B con service app)
  motor text,
  -- Cada autofill gasta 10 créditos de la API de Canva; no van en `costo`.
  autofills_canva integer not null default 0,
  cambios_pedidos integer not null default 0,
  publicada boolean not null default false,
  permalink text,
  publicada_instagram boolean not null default false,
  permalink_instagram text,
  descargada boolean not null default false,

  modelo_utilizado text,
  input_tokens integer,
  output_tokens integer,
  total_tokens integer,
  reasoning_tokens integer,
  cached_input_tokens integer,
  cache_write_tokens integer,
  -- USD de las llamadas al modelo, con lib/costos.ts. NULL si el modelo no está ahí.
  costo numeric(12,6),
  tiempo_procesamiento numeric(10,2),
  error_mensaje text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.analytics_en_vivo enable row level security;

-- Supabase da permisos por defecto a anon y authenticated en las tablas nuevas
-- de public: se quitan.
revoke all on public.analytics_en_vivo from anon, authenticated;
grant select, insert, update, delete on public.analytics_en_vivo to service_role;

drop policy if exists "service_role_todo" on public.analytics_en_vivo;
create policy "service_role_todo"
  on public.analytics_en_vivo
  for all
  to service_role
  using (true)
  with check (true);

-- La vista de uso/costo: la definición completa de
-- add_preguntas_chatbot_vista_uso_costo.sql más la rama de En Vivo.
-- `create or replace view` sirve porque sólo se agrega una rama al UNION.

create or replace view public.vista_analytics_generaciones as
select
  id,
  'Franbot' as herramienta, -- nombre real del producto, no "corrector"
  created_at at time zone 'UTC' as created_at,
  organization_id,
  user_id,
  costo,
  'completado' as estado
from public.analytics_corrector_de_textos

union all

select
  id,
  'Hilos' as herramienta,
  created_at at time zone 'UTC' as created_at,
  organization_id,
  user_id,
  costo,
  'completado' as estado
from public.analytics_generador_de_hilos

union all

select
  id,
  'Resumen' as herramienta,
  created_at at time zone 'UTC' as created_at,
  organization_id,
  user_id,
  costo,
  'completado' as estado
from public.analytics_generador_de_resumenes

union all

select
  id,
  'Detector' as herramienta,
  created_at,
  organization_id::text,
  user_id::text,
  costo_total as costo,
  estado
from public.analytics_detector

union all

select
  id,
  case tipo
    when 'nombre' then 'QuienAI Búsqueda'
    when 'perfil' then 'QuienAI Generación'
    else 'QuienAI ' || tipo
  end as herramienta,
  created_at,
  organization_id::text,
  user_id::text,
  costo_usd as costo,
  coalesce(estado, 'completado') as estado
from public.analytics_quien_es_quien

union all

select
  id,
  'Preguntas a SillaIA' as herramienta,
  created_at,
  organization_id::text,
  user_id::text,
  costo,
  case when error_mensaje is not null and comentario_agente is null then 'fallido' else 'completado' end as estado
from public.analytics_preguntas_chatbot

union all

select
  id,
  'En Vivo' as herramienta,
  created_at,
  organization_id::text,
  user_id::text,
  costo,
  case when error_mensaje is not null then 'fallido' else 'completado' end as estado
from public.analytics_en_vivo;

comment on view public.vista_analytics_generaciones is
  'Una fila por generación de cualquier herramienta (en Preguntas a SillaIA, una por turno; en En Vivo, una por pieza). Base de vista_uso_costo_diario.';
