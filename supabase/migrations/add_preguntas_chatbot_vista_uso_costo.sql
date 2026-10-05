-- Agrega "Preguntas a SillaIA" a las vistas de uso/costo. Hasta ahora
-- vista_analytics_generaciones sólo unía las otras cinco herramientas, así que
-- el uso y el costo del agente no aparecían en vista_uso_costo_diario.
--
-- Se reescribe la vista completa con las etiquetas de
-- rename_herramientas_vista_uso_costo.sql y el `created_at at time zone 'UTC'`
-- de fix_zona_horaria_vista_uso_costo.sql en las tablas con `timestamp` sin
-- zona (corrector, hilos, resúmenes). Ese cast NO se revirtió
-- (ver revertir_dia_bogota_vista_uso_costo.sql) y sin él la misma fila se lee
-- con horas distintas según la zona de la sesión que consulta.
--
-- `create or replace view` sirve porque sólo se agrega una rama al UNION: la
-- lista y el tipo de columnas no cambian. vista_uso_costo_diario lee de esta
-- vista y no hay que tocarla.
--
-- Una fila del chatbot es un turno (una pregunta), no una conversación. Se
-- marca 'fallido' cuando el agente no entregó respuesta (comentario_agente
-- nulo); un error_mensaje con respuesta suele ser un SQL que el agente
-- corrigió en el mismo turno, y ese turno sí sirvió.

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
from public.analytics_quien_es_quien

union all

select
  id,
  'Preguntas a SillaIA' as herramienta,
  created_at,
  organization_id::text,
  user_id::text,
  costo,
  case when comentario_agente is null then 'fallido' else 'completado' end as estado
from public.analytics_preguntas_chatbot;

comment on view public.vista_analytics_generaciones is
  'Una fila por generación de cualquier herramienta (en Preguntas a SillaIA, una por turno). Base de vista_uso_costo_diario; útil también para filtrar por organización o por rango de fechas directo.';
