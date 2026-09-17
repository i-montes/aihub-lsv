-- Rellena el costo de las generaciones anteriores al 2026-09-07.
--
-- Las columnas de costo se agregaron ese día (add_costos_analytics_detector.sql
-- y add_costos_todas_las_herramientas.sql), así que toda fila anterior quedó
-- con `costo` en NULL. El gasto sí existió y el proveedor sí lo facturó: por
-- eso sumar la columna de costo da menos que la consola del proveedor. En el
-- Detector, por ejemplo, la mitad de las llamadas a Anthropic son anteriores a
-- esa fecha — $0,65 de $1,48 reales quedaban invisibles.
--
-- Los tokens de esas filas sí se guardaron, así que el costo se puede
-- reconstruir exactamente igual que lo hace `lib/costos.ts`: tokens × precio.
--
-- Es idempotente: sólo toca filas con costo NULL y tokens presentes. Correrlo
-- dos veces no cambia nada la segunda vez.
--
-- La función auxiliar se crea y se BORRA al final a propósito: la tabla de
-- precios vive en lib/costos.ts y tener una segunda copia viva en la base de
-- datos es la forma segura de que dentro de seis meses digan cosas distintas.

create or replace function pg_temp.costo_generacion(
  p_modelo text,
  p_input integer,
  p_output integer,
  p_cache_read integer,
  p_cache_write integer
) returns numeric
language plpgsql
immutable
as $$
declare
  -- Hilos guarda "proveedor:modelo"; corrector y resúmenes sólo el modelo.
  modelo text := case
    when position(':' in coalesce(p_modelo, '')) > 0
      then split_part(p_modelo, ':', 2)
    else p_modelo
  end;
  input integer := coalesce(p_input, 0);
  salida integer := coalesce(p_output, 0);
  cache_read integer := coalesce(p_cache_read, 0);
  cache_write integer := coalesce(p_cache_write, 0);
  -- El input "normal" es el total menos lo que ya se cobra aparte como caché.
  input_normal integer := greatest(0, input - cache_read - cache_write);
  -- Las tarifas escalonadas dependen del tamaño del prompt completo.
  prompt_largo boolean;
  precio_input numeric;
  precio_cache_read numeric;
  -- NULL cuando el proveedor no cobra aparte por escribir caché: esos tokens
  -- se cobran como input normal (OpenAI y el cacheo automático de Google).
  precio_cache_write numeric;
  precio_output numeric;
begin
  if modelo is null then
    return null;
  end if;

  case modelo
    when 'gpt-5.6-terra' then
      prompt_largo := input > 272000;
      precio_input := case when prompt_largo then 4.0 else 2.0 end;
      precio_cache_read := case when prompt_largo then 0.4 else 0.2 end;
      precio_cache_write := null;
      precio_output := case when prompt_largo then 18.0 else 12.0 end;

    when 'gpt-4o-mini-2024-07-18' then
      precio_input := 0.15;
      precio_cache_read := 0.075;
      precio_cache_write := null;
      precio_output := 0.6;

    when 'claude-opus-4-8' then
      precio_input := 5.0;
      precio_cache_read := 0.5;
      -- En Anthropic escribir caché cuesta MÁS que el input normal.
      precio_cache_write := 6.25;
      precio_output := 25.0;

    when 'claude-haiku-4-5-20251001' then
      precio_input := 1.0;
      precio_cache_read := 0.1;
      precio_cache_write := 1.25;
      precio_output := 5.0;

    when 'gemini-3.1-pro-preview' then
      prompt_largo := input > 200000;
      precio_input := case when prompt_largo then 4.0 else 2.0 end;
      precio_cache_read := case when prompt_largo then 0.4 else 0.2 end;
      precio_cache_write := null;
      precio_output := case when prompt_largo then 18.0 else 12.0 end;

    when 'gemini-3-flash-preview' then
      precio_input := 0.5;
      precio_cache_read := 0.05;
      precio_cache_write := null;
      precio_output := 3.0;

    else
      -- Modelo que no está en la tabla de precios: se deja en NULL, igual que
      -- hace calcularCosto(), en vez de guardar un cero engañoso.
      return null;
  end case;

  return round(
    (
      input_normal * precio_input
      + cache_read * precio_cache_read
      + cache_write * coalesce(precio_cache_write, precio_input)
      + salida * precio_output
    ) / 1000000.0,
    6
  );
end;
$$;

-- ── Detector ────────────────────────────────────────────────────────────────
-- Dos modelos por fila en modo comparación: cada uno con su costo, y el total
-- sólo cuando el primero se pudo calcular (misma regla que el código).
update public.analytics_detector
set
  costo_1 = coalesce(
    costo_1,
    pg_temp.costo_generacion(
      modelo_1, input_tokens_1, output_tokens_1,
      cached_input_tokens_1, cache_write_tokens_1
    )
  ),
  costo_2 = coalesce(
    costo_2,
    pg_temp.costo_generacion(
      modelo_2, input_tokens_2, output_tokens_2,
      cached_input_tokens_2, cache_write_tokens_2
    )
  )
where (costo_1 is null and input_tokens_1 is not null)
   or (costo_2 is null and input_tokens_2 is not null);

update public.analytics_detector
set costo_total = costo_1 + coalesce(costo_2, 0)
where costo_total is null
  and costo_1 is not null;

-- ── Corrector, hilos y resúmenes ────────────────────────────────────────────
-- OJO con los resúmenes: esta reconstrucción es del último modelo, que es lo
-- único que se guardó hasta hoy. Un resumen también corre el modelo mini una
-- vez por lote de noticias, y esos tokens nunca se registraron, así que no hay
-- de dónde recuperarlos: las filas viejas de esta tabla quedan por debajo de
-- lo que facturó el proveedor incluso después de este relleno. De aquí en
-- adelante sí se guarda la generación completa (lib/uso-acumulado.ts).
update public.analytics_corrector_de_textos
set costo = pg_temp.costo_generacion(
  modelo_utilizado, input_tokens, output_tokens,
  cached_input_tokens, cache_write_tokens
)
where costo is null and input_tokens is not null;

update public.analytics_generador_de_hilos
set costo = pg_temp.costo_generacion(
  modelo_utilizado, input_tokens, output_tokens,
  cached_input_tokens, cache_write_tokens
)
where costo is null and input_tokens is not null;

update public.analytics_generador_de_resumenes
set costo = pg_temp.costo_generacion(
  modelo_utilizado, input_tokens, output_tokens,
  cached_input_tokens, cache_write_tokens
)
where costo is null and input_tokens is not null;

drop function pg_temp.costo_generacion(text, integer, integer, integer, integer);

-- Qué quedó sin costo después del relleno (modelos que no están en la tabla de
-- precios, o filas sin tokens porque la generación falló). Lo que salga aquí
-- es gasto que el proveedor puede haber facturado y que la base de datos no
-- tiene cómo reconstruir.
select 'detector' as tabla, count(*) as filas_sin_costo
from public.analytics_detector
where costo_1 is null and input_tokens_1 is not null
union all
select 'corrector', count(*)
from public.analytics_corrector_de_textos
where costo is null and input_tokens is not null
union all
select 'hilos', count(*)
from public.analytics_generador_de_hilos
where costo is null and input_tokens is not null
union all
select 'resumenes', count(*)
from public.analytics_generador_de_resumenes
where costo is null and input_tokens is not null;
