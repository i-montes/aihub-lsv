# Resúmenes: fuente de entrada válida en el log de generación

Fecha: 6 de octubre de 2026. Estado: verificado con `tsc`.

## El problema

`tsc` falla en `app/api/tools/generate-resume/route.ts`:

> Type '"wordpress_api"' is not assignable to type '"text" | "html" | "pdf" | "image" | "wordpress_post" | "custom_content" | "mixed"'.

Viene desde que se creó la herramienta de resúmenes (`bde324a`, 27 de octubre de 2025). Al cerrar el log de generación, `debugLogger.finalize` recibe `inputSources: ["wordpress_api"]`, y ese valor no está en `ContentTypeSchema` (`types/log-schema.ts`).

## Impacto

Es un error de tipos, no de ejecución. `inputSources` se guarda en `generation_input_sources`, una columna `TEXT[]` sin restricción, y el logger no la valida con Zod, así que los logs de resúmenes se guardaban igual. Lo que sí pasaba es que el valor quedaba fuera del vocabulario que usan las demás herramientas, y que el error ensuciaba la salida de `tsc` y escondía errores nuevos entre los viejos.

## El cambio

`inputSources` pasa a `["wordpress_post"]`. Es el valor del enum que describe lo que entra: los resúmenes se hacen con posts de WordPress.

No se agrega `"wordpress_api"` al enum. El mismo enum define las restricciones `CHECK` de `content_type` y `analysis_input_type` en `sql/create-logs-table.sql`, y ampliarlo pediría una migración para describir lo mismo que `wordpress_post`.

No se toca `fuente_contenido: "wordpress_api"` en las analíticas de resúmenes. Es otro campo, de tipo texto libre, que distingue la selección automática por la API (`wordpress_api`) de la manual (`manual_selection`), y los datos guardados ya usan esos valores.

## Prueba

`tsc --noEmit` ya no reporta errores en `generate-resume/route.ts`.

Quedan unos 80 errores de `tsc` en 22 archivos que no son de esta tarea. Los que más se repiten están en `app/dashboard/actividad/page.tsx`, `lib/logger.ts`, `app/dashboard/perfil/page.tsx` y `app/api/content/[id]/route.ts`; además, los tests no compilan porque `vitest` no está instalado.
