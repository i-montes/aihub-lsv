-- Revierte el corte de día a UTC (como estaba antes de
-- fix_zona_horaria_vista_uso_costo.sql), a pedido del usuario para volver a
-- revisar el caso con el corte original mientras se investiga más.
--
-- Se mantiene a propósito el cast explícito `created_at at time zone 'UTC'`
-- en cada rama del UNION en vista_analytics_generaciones — eso no es lo que
-- se está revirtiendo. Sin él, la misma fila se lee con una hora distinta
-- según la zona horaria de la sesión que consulta la vista (verificado con
-- una fila real: 5 horas de diferencia entre dos sesiones). Quitarlo
-- reintroduciría ese bug.

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
  'Uso (conteo) y costo (USD) por día y por herramienta. fecha es el día UTC (no Bogotá — revertido a pedido, ver revertir_dia_bogota_vista_uso_costo.sql). usos_sin_costo_calculado avisa cuándo el promedio/total quedaron cortos porque algún modelo no está en lib/costos.ts.';
