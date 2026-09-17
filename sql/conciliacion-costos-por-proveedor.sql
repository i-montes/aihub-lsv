-- Gasto por proveedor y por mes según la base de datos, para comparar contra
-- la consola de cada proveedor.
--
-- Suma las cinco herramientas. Cada una guarda el costo de su generación:
-- las cuatro que llaman modelos lo calculan con tokens × precio (lib/costos.ts)
-- y Quién es quién lo captura del servicio externo.
--
-- La columna `generaciones_sin_costo` es la clave para leer el resultado: son
-- filas que consumieron tokens y quedaron en NULL, o sea gasto que el
-- proveedor facturó y que este total NO incluye. Mientras no sea cero, la
-- diferencia contra la consola está explicada al menos en parte por ahí.
--
-- Diferencias que van a quedar aunque todo esté bien:
--   - Quién es quién va aparte: no es un proveedor de modelos, es un servicio
--     externo que cobra por consulta, y sus consultas de tipo "nombre" llevan
--     un estimado fijo porque el upstream no reporta el cobro.
--   - Generaciones fallidas: el proveedor cobra lo que alcanzó a consumir y la
--     fila queda sin tokens.
--   - Reintentos internos del SDK: los intentos fallidos se facturan y no
--     aparecen en el `usage` del intento que sí salió.
--   - Cualquier otro uso de la misma API key fuera de este hub.

with por_llamada as (
  -- Detector: hasta dos modelos por fila (modo comparación)
  select
    created_at,
    lower(proveedor_1) as proveedor,
    costo_1 as costo,
    (costo_1 is null and input_tokens_1 is not null) as sin_costo
  from public.analytics_detector
  where proveedor_1 is not null

  union all

  select
    created_at,
    lower(proveedor_2),
    costo_2,
    (costo_2 is null and input_tokens_2 is not null)
  from public.analytics_detector
  where proveedor_2 is not null

  union all

  -- Corrector, hilos y resúmenes no guardan el proveedor: se deduce del
  -- modelo. Hilos además guarda "proveedor:modelo", de ahí el split.
  select created_at, proveedor, costo, sin_costo from (
    select
      created_at,
      case
        when modelo like 'gpt-%' then 'openai'
        when modelo like 'claude-%' then 'anthropic'
        when modelo like 'gemini-%' then 'google'
        else 'desconocido'
      end as proveedor,
      costo,
      (costo is null and input_tokens is not null) as sin_costo
    from (
      select
        created_at, costo, input_tokens,
        case when position(':' in modelo_utilizado) > 0
          then split_part(modelo_utilizado, ':', 2)
          else modelo_utilizado
        end as modelo
      from public.analytics_corrector_de_textos
      union all
      select
        created_at, costo, input_tokens,
        case when position(':' in modelo_utilizado) > 0
          then split_part(modelo_utilizado, ':', 2)
          else modelo_utilizado
        end
      from public.analytics_generador_de_hilos
      union all
      select
        created_at, costo, input_tokens,
        case when position(':' in modelo_utilizado) > 0
          then split_part(modelo_utilizado, ':', 2)
          else modelo_utilizado
        end
      from public.analytics_generador_de_resumenes
    ) con_modelo
  ) clasificado

  union all

  -- Quién es quién: servicio externo, sin tokens
  select
    created_at,
    'quien-es-quien (externo)',
    costo_usd,
    (costo_usd is null)
  from public.analytics_quien_es_quien
)
select
  date_trunc('month', created_at)::date as mes,
  proveedor,
  count(*) as llamadas,
  round(sum(coalesce(costo, 0)), 4) as costo_en_la_base,
  count(*) filter (where sin_costo) as generaciones_sin_costo
from por_llamada
group by 1, 2
order by 1 desc, costo_en_la_base desc;
