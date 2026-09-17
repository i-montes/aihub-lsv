-- Deja registrar las generaciones que fallaron DESPUÉS de que el modelo ya
-- respondió — las que el proveedor sí factura.
--
-- El caso que motivó esto: el 16 de septiembre de 2026, de 39 análisis del
-- corrector con claude-opus-4-8, 20 fallaron. Ninguno dejó fila, porque hasta
-- ahora sólo se guarda el camino feliz. Anthropic facturó $3,30 ese día y la
-- base de datos sólo podía explicar $1,92: la diferencia son, casi exactamente,
-- esos 20 análisis (el faltante da $0,069 por fallo, que es justo lo que cuesta
-- el input promedio de un análisis que sí salió bien).
--
-- No todo fallo se factura: un 429, un 529 o una API key equivocada nunca
-- llegan al modelo. Por eso el código sólo escribe la fila cuando el error trae
-- el `usage` de la llamada (NoObjectGeneratedError del AI SDK), que es la señal
-- de que el modelo sí leyó el prompt y generó algo.
--
-- El detector ya tenía estas dos columnas desde create_analytics_detector.sql;
-- esto las lleva a las otras tres herramientas con el mismo significado.

alter table public.analytics_corrector_de_textos
  add column if not exists estado text,
  add column if not exists error_mensaje text;

alter table public.analytics_generador_de_hilos
  add column if not exists estado text,
  add column if not exists error_mensaje text;

alter table public.analytics_generador_de_resumenes
  add column if not exists estado text,
  add column if not exists error_mensaje text;

-- Las filas que ya existen son todas del camino feliz.
update public.analytics_corrector_de_textos set estado = 'completado' where estado is null;
update public.analytics_generador_de_hilos set estado = 'completado' where estado is null;
update public.analytics_generador_de_resumenes set estado = 'completado' where estado is null;

comment on column public.analytics_corrector_de_textos.estado is
  'completado | fallido. Una fila fallida tiene tokens y costo cuando el modelo alcanzó a responder: ese gasto lo factura el proveedor igual.';
comment on column public.analytics_generador_de_hilos.estado is
  'completado | fallido. Ver el comentario de analytics_corrector_de_textos.estado.';
comment on column public.analytics_generador_de_resumenes.estado is
  'completado | fallido. Ver el comentario de analytics_corrector_de_textos.estado.';
