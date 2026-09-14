-- Etiquetas legibles para las herramientas en las vistas de uso/costo.
--
-- `create or replace view` funciona porque sólo cambian los literales de la
-- columna `herramienta`, no la lista ni el tipo de columnas — Postgres exige
-- eso para reemplazar una vista sin borrarla.

create or replace view public.vista_analytics_generaciones as
select
  id,
  'Franbot' as herramienta, -- nombre real del producto, no "corrector"
  created_at,
  organization_id,
  user_id,
  costo,
  'completado' as estado
from public.analytics_corrector_de_textos

union all

select
  id,
  'Hilos' as herramienta,
  created_at,
  organization_id,
  user_id,
  costo,
  'completado' as estado
from public.analytics_generador_de_hilos

union all

select
  id,
  'Resumen' as herramienta,
  created_at,
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
  -- 'nombre' es la búsqueda barata (paso 1), 'perfil' la generación cara
  -- (paso 2) — separados porque un perfil cuesta ~70 veces más y mezclarlos
  -- en un promedio no diría nada útil.
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
from public.analytics_quien_es_quien;

comment on view public.vista_analytics_generaciones is
  'Una fila por generación de cualquier herramienta. Base de vista_uso_costo_diario; útil también para filtrar por organización o por rango de fechas directo.';
