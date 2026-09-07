-- Costos exactos por generación del Detector de mentiras.
--
-- Ningún proveedor devuelve el costo en dólares en la respuesta del API
-- (verificado: OpenAI, Anthropic y Google sólo devuelven conteos de tokens).
-- La única forma de tener un costo exacto por fila es tokens × precio, con una
-- tabla de precios mantenida a mano en el código (lib/costos.ts).
--
-- Además de input/output ya guardados, hacía falta cache_write_tokens: Anthropic
-- cobra la escritura de caché un 25% MÁS caro que el input normal (no más
-- barato como la lectura), y esa columna nunca se estaba capturando — el costo
-- de cualquier llamada que escribiera caché habría salido subestimado.

alter table public.analytics_detector
  add column if not exists cache_write_tokens_1 integer,
  add column if not exists cache_write_tokens_2 integer,
  -- numeric(12,6): seis decimales alcanzan para precisión de fracción de
  -- centavo incluso en llamadas de pocos tokens con un modelo mini.
  add column if not exists costo_1 numeric(12,6),
  add column if not exists costo_2 numeric(12,6),
  add column if not exists costo_total numeric(12,6);

comment on column public.analytics_detector.costo_1 is
  'Costo en USD del modelo principal, calculado como tokens × precio de lib/costos.ts. NULL si el modelo no está en la tabla de precios.';
comment on column public.analytics_detector.costo_2 is
  'Igual que costo_1, para el modelo de comparación. NULL en modo simple.';
comment on column public.analytics_detector.costo_total is
  'costo_1 + costo_2. NULL si costo_1 es NULL (nunca se suma un costo parcial sin avisar).';
