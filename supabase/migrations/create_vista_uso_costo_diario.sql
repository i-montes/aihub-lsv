-- Vistas para el dashboard de uso y costo por herramienta.
--
-- Las cinco tablas de analytics no comparten esquema (detector y quien_es_quien
-- tienen organization_id/user_id como uuid; corrector, hilos y resúmenes los
-- tienen como text; detector reparte el costo en costo_1/costo_2/costo_total;
-- quien_es_quien lo llama costo_usd). Esta vista normaliza las cinco a una
-- sola fila por generación, y la segunda vista hace el conteo diario sobre esa.

-- ── Una fila por generación, sin importar de qué tabla salga ────────────────
create or replace view public.vista_analytics_generaciones as
select
  id,
  'corrector' as herramienta,
  created_at,
  organization_id,
  user_id,
  costo,
  'completado' as estado -- esta tabla nunca registró fallos, sólo éxitos
from public.analytics_corrector_de_textos

union all

select
  id,
  'hilos' as herramienta,
  created_at,
  organization_id,
  user_id,
  costo,
  'completado' as estado
from public.analytics_generador_de_hilos

union all

select
  id,
  'resumen' as herramienta,
  created_at,
  organization_id,
  user_id,
  costo,
  'completado' as estado
from public.analytics_generador_de_resumenes

union all

select
  id,
  'detector' as herramienta,
  created_at,
  organization_id::text,
  user_id::text,
  costo_total as costo, -- ya es costo_1 + costo_2, NULL si costo_1 no se pudo calcular
  estado
from public.analytics_detector

union all

select
  id,
  -- 'quien_es_quien-nombre' vs 'quien_es_quien-perfil': valen la pena separados,
  -- un perfil cuesta ~70 veces más que una verificación de nombre.
  'quien_es_quien-' || tipo as herramienta,
  created_at,
  organization_id::text,
  user_id::text,
  costo_usd as costo,
  coalesce(estado, 'completado') as estado
from public.analytics_quien_es_quien;

comment on view public.vista_analytics_generaciones is
  'Una fila por generación de cualquier herramienta. Base de vista_uso_costo_diario; útil también para filtrar por organización o por rango de fechas directo.';

-- ── Uso y costo por día y por herramienta ────────────────────────────────────
create or replace view public.vista_uso_costo_diario as
select
  date_trunc('day', created_at)::date as fecha,
  herramienta,
  count(*) as usos,
  count(*) filter (where estado = 'fallido') as usos_fallidos,
  sum(costo) as costo_total_usd,
  round(avg(costo), 6) as costo_promedio_usd,
  count(*) filter (where costo is null) as usos_sin_costo_calculado
from public.vista_analytics_generaciones
group by 1, 2
order by 1 desc, 2;

comment on view public.vista_uso_costo_diario is
  'Uso (conteo) y costo (USD) por día y por herramienta. usos_sin_costo_calculado avisa cuándo el promedio/total quedaron cortos porque algún modelo no está en lib/costos.ts.';
