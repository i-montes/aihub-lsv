-- Costo exacto por generación, para las cuatro herramientas restantes.
--
-- El detector ya tenía columnas de costo (migración add_costos_analytics_detector.sql).
-- Esto extiende lo mismo a corrector, hilos y resúmenes, y crea la tabla nueva
-- para Quién es quién — que es un caso distinto: no llama modelos directo, así
-- que no hay tokens que multiplicar por precio. Ver más abajo.

-- ── Corrector de textos, Hilos, Resúmenes ────────────────────────────────────
--
-- Las tres ya tenían columnas `reasoning_tokens`/`cached_input_tokens`, pero
-- el código nunca las llenaba (hilos y resumen las mandaban en NULL a mano; el
-- corrector ni siquiera las tenía en el objeto que arma). Ninguna tenía
-- `cache_write_tokens`: en Anthropic la escritura de caché cuesta un 25% MÁS
-- que el input normal, así que sin esa columna el costo de cualquier llamada
-- que escriba caché habría salido subestimado — el mismo hueco que se cerró
-- para el detector.

alter table public.analytics_corrector_de_textos
  add column if not exists cache_write_tokens integer,
  add column if not exists costo numeric(12,6);

alter table public.analytics_generador_de_hilos
  add column if not exists cache_write_tokens integer,
  add column if not exists costo numeric(12,6);

alter table public.analytics_generador_de_resumenes
  add column if not exists cache_write_tokens integer,
  add column if not exists costo numeric(12,6);

comment on column public.analytics_corrector_de_textos.costo is
  'USD calculados con lib/costos.ts (tokens × precio). NULL si el modelo no está en la tabla de precios.';
comment on column public.analytics_generador_de_hilos.costo is
  'USD calculados con lib/costos.ts (tokens × precio). NULL si el modelo no está en la tabla de precios.';
comment on column public.analytics_generador_de_resumenes.costo is
  'USD calculados con lib/costos.ts (tokens × precio). NULL si el modelo no está en la tabla de precios.';

-- ── Quién es quién ───────────────────────────────────────────────────────────
--
-- Esta herramienta no llama modelos directo: es un proxy a un servicio externo
-- (quienai.vercel.app) que factura por llamada, no por token visible para esta
-- app. Por eso el costo no se calcula, se CAPTURA de dos formas distintas
-- según el endpoint:
--
--   POST /api/nombre  -> el upstream no devuelve costo en su respuesta.
--                        Se usa un estimado fijo (~$0.003, documentado en el
--                        comentario del propio route.ts) y se marca
--                        `costo_estimado = true`.
--
--   POST /api/perfil  -> el evento SSE `fin` sí trae el costo real que cobró
--                        el upstream (`metricas.costo_usd.total`). Ese valor
--                        se guarda tal cual y `costo_estimado = false` — es
--                        más exacto que cualquier cálculo por tokens que
--                        pudiéramos hacer nosotros, porque es lo que el
--                        upstream realmente cobró.
--
-- No tiene RLS, igual que corrector/hilos/resúmenes: las tres escriben siempre
-- desde una sesión de usuario autenticada vía getSupabaseRouteHandler(), que
-- ya tiene permiso de tabla por defecto para el rol `authenticated` (grant
-- automático del esquema, no depende de políticas). Habilitar RLS aquí sin
-- necesitarlo fue justo lo que causó el problema de permisos del detector.

create table if not exists public.analytics_quien_es_quien (
  id text primary key,
  session_id text,
  user_id uuid,
  organization_id uuid,

  -- 'nombre' (POST /api/nombre) o 'perfil' (POST /api/perfil)
  tipo text not null,
  nombre_consultado text,
  -- Para 'nombre': confirmar|elegir|sin_resultados (EstadoNombre).
  -- Para 'perfil': completado|fallido.
  estado text,

  -- Sólo se llenan para 'perfil', tal como vienen en PerfilResultado/PerfilMetricas.
  modelo text,
  effort text,
  segundos integer,
  pasos integer,
  busquedas integer,
  consultas_leyes integer,
  leyes_encontradas integer,
  caracteres integer,
  stop_reason text,
  citas_totales integer,
  citas_links_unicos integer,

  costo_usd numeric(12,6),
  -- true en 'nombre' (estimado fijo); false en 'perfil' (viene del upstream).
  costo_estimado boolean not null default false,

  error_mensaje text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.analytics_quien_es_quien
  drop constraint if exists analytics_quien_es_quien_tipo_check,
  add constraint analytics_quien_es_quien_tipo_check
    check (tipo in ('nombre', 'perfil'));

create index if not exists idx_analytics_quien_es_quien_organization
  on public.analytics_quien_es_quien(organization_id);

create index if not exists idx_analytics_quien_es_quien_created_at
  on public.analytics_quien_es_quien(created_at desc);

comment on table public.analytics_quien_es_quien is
  'Una fila por llamada a /api/nombre o /api/perfil. costo_usd es real para perfil (viene del upstream) y estimado para nombre (el upstream no lo reporta ahí).';
