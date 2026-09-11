-- Corrige dos problemas de zona horaria en las vistas de uso/costo, ambos
-- reales y verificados contra datos en producción.
--
-- 1) NO DETERMINISMO: el UNION ALL mezcla `timestamp` (corrector/hilos/
--    resúmenes, sin zona) con `timestamptz` (detector/quien_es_quien, con
--    zona). Postgres promueve el tipo naive a timestamptz para que el UNION
--    tenga una sola columna — y esa conversión usa la zona horaria de LA
--    SESIÓN QUE CONSULTA, no un valor fijo. Confirmado con una fila real: la
--    misma fila mostraba `created_at` con 5 horas de diferencia según se
--    leyera de la tabla original o de la vista. Dos personas corriendo la
--    misma consulta en clientes con zona horaria de sesión distinta verían
--    números distintos — exactamente el síntoma reportado ("no me cuadra").
--
--    Se arregla convirtiendo cada rama explícitamente con
--    `created_at at time zone 'UTC'`, que interpreta el valor naive como UTC
--    (así es como se escribe: `new Date()` serializado siempre es UTC) sin
--    importar la sesión.
--
-- 2) DÍA UTC vs DÍA BOGOTÁ: `vista_uso_costo_diario` agrupaba con
--    `date_trunc('day', created_at)`, que trunca en UTC. Para un medio
--    colombiano "hoy" es el día de Bogotá (UTC-5), no el día UTC — son días
--    distintos entre la medianoche y las 5 a.m. UTC (7 p.m.-medianoche en
--    Bogotá). Verificado: hoy 2026-09-09 daba 28 usos por día UTC y 24 por
--    día Bogotá para Franbot — 4 filas de anoche (Bogotá) que un día UTC le
--    asigna al día siguiente.

create or replace view public.vista_analytics_generaciones as
select
  id,
  'Franbot' as herramienta,
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
  created_at, -- ya es timestamptz: un instante real, no depende de sesión
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
  created_at, -- ya es timestamptz
  organization_id::text,
  user_id::text,
  costo_usd as costo,
  coalesce(estado, 'completado') as estado
from public.analytics_quien_es_quien;

comment on view public.vista_analytics_generaciones is
  'Una fila por generación de cualquier herramienta. created_at siempre es timestamptz explícito (no depende de la zona horaria de la sesión que consulta). Base de vista_uso_costo_diario.';

-- ── Uso y costo por día y por herramienta, en horario de Bogotá ─────────────
create or replace view public.vista_uso_costo_diario as
select
  date_trunc('day', created_at at time zone 'America/Bogota')::date as fecha,
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
  'Uso (conteo) y costo (USD) por día y por herramienta. fecha es el día calendario de Bogotá (UTC-5), no UTC. usos_sin_costo_calculado avisa cuándo el promedio/total quedaron cortos porque algún modelo no está en lib/costos.ts.';
