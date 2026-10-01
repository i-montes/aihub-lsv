-- SEGUNDA MIGRACIÓN de las claves por herramienta. NO aplicar con el
-- despliegue: aplicar una semana después, cuando La Silla Vacía ya haya
-- configurado sus herramientas en Ajustes > Herramientas. Hasta entonces el
-- código nuevo no lee nada de esto, y si algo sale mal se puede volver a la
-- versión anterior sin perder datos.
--
-- Ver docs/superpowers/specs/2026-09-29-claves-por-herramienta-design.md.

drop table if exists public.api_key_table;

alter table public.tools
  drop column if exists models,
  drop column if exists reasoning_effort,
  drop column if exists verbosity;

alter table public.default_tools
  drop column if exists models,
  drop column if exists reasoning_effort,
  drop column if exists verbosity;
