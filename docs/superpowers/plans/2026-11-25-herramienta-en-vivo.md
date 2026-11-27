# Plan: herramienta En Vivo

Spec: `docs/superpowers/specs/2026-11-25-herramienta-en-vivo-design.md`. Rama: `feat/herramienta-en-vivo`.

El plan supone el diseño revisado de la spec:

- Canva por la API REST con una service app; las etiquetas se dibujan en el servidor.
- Facebook con "Iniciar sesión con Facebook" desde Ajustes.
- Tabla `herramienta_conexiones` y bucket `en-vivo`.
- Sólo La Silla Vacía, oculta en el menú mientras se prueba.

Cada fase cierra con su prueba y sigue la regla del repo: un commit con la tarea y la spec, otro con el código.

## Fase 0. Comprobaciones antes de programar (bloquean el resto)

1. **Canva:**
   - Confirmar el plan del equipo y crear la service app en el Developer Portal (Your apps > Outside Canva > "No Canva sign-in required").
   - Ver el precio de los créditos y comprar un paquete de prueba.
   - Marcar como campos de datos el titular y la foto de la plantilla En Vivo (o de una copia como brand template).
2. **Script de prueba en el scratchpad:**
   - Token con client credentials, subida de una foto, autofill con un titular de 4 líneas y export PNG.
   - Ver tres cosas: si la service app ve la plantilla, cómo encaja Canva la foto en el marco y qué pasa con un titular largo.
3. **Meta:**
   - Revisar la app de `envivo-web`: tipo, modo Live, quién tiene rol.
   - Registrar la redirect URI del Hub.
   - Hacer un post de prueba desde la app y verlo con una cuenta sin rol.
4. **Etiquetas:**
   - Conseguir las fuentes de la plantilla (archivos y licencia) y la medida exacta de la caja, la flecha y los colores.
   - Decidir el motor de dibujo: `sharp` con SVG, o `satori` + `@resvg/resvg-js`.

Entregable: una sección "Resultados de la fase 0" en la spec, con lo que se confirmó y lo que cambia.

## Fase 1. Registro de la herramienta (esqueleto visible)

| Archivo | Cambio |
|---|---|
| `lib/proveedores/tipos.ts` | `en-vivo` en `HERRAMIENTAS_CON_PROVEEDORES` y `NOMBRE_HERRAMIENTA` |
| `lib/organizaciones/herramientas.ts` | `en-vivo` en `Herramienta`, en `HERRAMIENTAS_POR_ORGANIZACION["La Silla Vacía"]`, en `RUTA_HERRAMIENTA` y en `HERRAMIENTAS_OCULTAS_EN_NAVEGACION` |
| `components/sidebar.tsx`, `app/dashboard/page.tsx` | `NavItem` y tarjeta, con `seMuestraEnNavegacion` |
| `lib/en-vivo/acceso.ts` | Comprobación de organización en el servidor, como `lib/quien-es-quien/acceso.ts` |
| `app/dashboard/en-vivo/page.tsx`, `layout.tsx` | Página vacía con `useProveedoresActivos("en-vivo")`, `ApiKeyRequiredModal`, `AvisoErrorProveedores` |
| `lib/en-vivo/prompt-base.ts` | Prompts "Foto" (de `envivo-web/lib/foto.ts`), "Resumen" (de `lib/nota.ts`) y "Cambios" (nuevo) |
| Migración `add_en_vivo_default_tools.sql` | Fila en `default_tools` |

Prueba: la tarjeta aparece en Ajustes > Herramientas con su acordeón de proveedores, y la página abre sólo en La Silla.

## Fase 2. Conexiones (Canva y Facebook) en Ajustes

1. Migración `create_herramienta_conexiones.sql`, con RLS sólo `service_role`.
2. `lib/conexiones/configuracion.ts`: leer, guardar, enmascarar, y cifrar con AES-GCM usando `CONEXIONES_CLAVE`.
3. **Canva:**
   - `lib/en-vivo/canva.ts`: token con client credentials (en memoria hasta que vence) y `probarConexion` (lee el dataset de la plantilla).
   - Ruta `app/api/en-vivo/canva/probar`.
4. **Facebook:**
   - `lib/en-vivo/facebook.ts`: login, callback (state, token largo, `/me/permissions`, `/me/accounts`, `debug_token`), `appsecret_proof`.
   - Rutas `app/api/en-vivo/facebook/{login,callback,deauthorize}`.
   - `META_APP_ID` y `META_APP_SECRET` en variables de entorno.
5. Sección "Conexiones" en `components/tools/edit-tool-dialog.tsx`, sólo para `en-vivo` y sólo OWNER/ADMIN (`sesionDeAdministrador`):
   - Canva: client ID, secret enmascarado, plantilla y "Probar".
   - Facebook: "Conectar con Facebook", página conectada, quién y cuándo, "Reconectar".

Prueba: conectar la página desde Ajustes sin pegar tokens; "Probar" de Canva lista los campos de la plantilla.

## Fase 3. Leer la nota y armar el texto

1. `lib/en-vivo/nota.ts`:
   - Valida que el link sea de `lasillavacia.com`.
   - Con WordPress: `/posts?slug=…&_embed=1`, sólo en el servidor.
   - Sin conexión: raspado como `envivo-web`.
   - Devuelve titular, foto en alta, pie de foto, etiquetas y párrafos hasta el primer `h2`.
2. `textoPost`: 3 bloques más el link. Si pasa de 2.000 caracteres, resumen con el prompt "Resumen" (`generateText` + `crearModeloConfigurado` + `MAX_OUTPUT_TOKENS`).

Prueba: con la nota de Sondra Macollins, mismo titular, foto y texto que `envivo-web`.

## Fase 4. Foto, geometría y bucket

1. Migración: bucket `en-vivo` en Storage, lectura pública y escritura sólo desde el servidor.
2. `lib/en-vivo/archivos.ts`: subir foto recortada y PNG final, con nombres aleatorios, y limpiar lo de más de 2 días.
3. `lib/en-vivo/foto.ts`: bajar la foto en alta, corregir la orientación EXIF y la visión con `generateObject` (prompt "Foto").
4. `lib/en-vivo/geometria.ts`: copia de `envivo-web`. El recorte se aplica en el servidor (foco al 32% de la altura, al tamaño exacto del marco de la plantilla) para que Canva no recorte por su cuenta.

Prueba: las cajas de las cabezas y la ubicación de las etiquetas coinciden con las de `envivo-web` para la misma foto.

## Fase 5. Armar la pieza

1. `lib/en-vivo/canva.ts`: subir el asset desde la URL del bucket, autofill con titular y foto, export PNG; cada paso con su consulta del job.
2. `lib/en-vivo/etiquetas.ts`: dibujar las etiquetas (caja de 440x100, flecha arriba o abajo según el grupo, nombre y cargo con sus tamaños y desplazamientos de `geometria.ts`) sobre el PNG, y subir el resultado al bucket.
3. Ruta `app/api/en-vivo/generar`: comprobación de organización y progreso por streaming (nota, foto, Canva, etiquetas, listo).
4. Página: link, foto opcional, progreso, vista previa tipo Facebook, editar texto, cambiar foto, descartar.

Prueba: la pieza de la nota de prueba, al lado de la de `envivo-web`. Deben verse iguales salvo diferencias mínimas de las etiquetas.

## Fase 6. Pedir cambios

1. `lib/en-vivo/cambios.ts`: `generateObject` con el prompt "Cambios", que recibe los parámetros actuales y el pedido y devuelve los parámetros nuevos (titular, texto, etiquetas, posiciones, foco) más una nota para el periodista.
2. Ruta `app/api/en-vivo/cambios`. Si sólo cambió el texto, no se vuelve a llamar a Canva. Si cambiaron las etiquetas, sólo se redibujan. Si cambió el titular o el foco, se rehace autofill y export.

Prueba: tres pedidos ("acorta el texto", "sube la etiqueta", "cambia el titular por …") y que cada uno toque sólo lo necesario.

## Fase 7. Publicar y descargar

1. Ruta `app/api/en-vivo/publicar`: foto desde el bucket, post con la foto adjunta y permalink. Si Facebook responde 190 o 492, la conexión queda desconectada y se avisa.
2. Descarga desde el bucket.

Prueba: post en la página de prueba (o en la de La Silla, si se acuerda) y que se vea desde una cuenta sin rol.

## Fase 8. Analíticas, costo y logs

1. Migración `create_analytics_en_vivo.sql` más la rama en `vista_analytics_generaciones`.
2. `AnalyticsEnVivoService`. El costo suma el modelo de todas las llamadas con `calcularCosto` y anota los créditos de Canva usados.
3. Contadores (publicada, descargada, cambios) con `actions/update-analytics.ts`.
4. Migración de `logs.tool_identity` (con `en-vivo` y `detector`) y el valor en `ToolTypeSchema`.

Prueba: una pieza completa deja su fila con costo y aparece en la vista.

## Fase 9. Cierre

- Documentación de la herramienta (opcional).
- Mostrarla en el menú.
- PR con las specs y las pruebas.

## Plan B (sólo si la fase 0 falla)

- **Sin service app de Canva:** MCP de Canva llamado directo desde el servidor con `@modelcontextprotocol/sdk`, sin Claude, con app propia y OAuth por usuario. Esto devuelve la posibilidad de mover elementos dentro de Canva, a cambio de depender de operaciones no documentadas.
- **Sin fuentes para dibujar las etiquetas:** variantes de la plantilla con etiquetas en posiciones fijas, rellenadas por autofill, y elegir la más cercana a la calculada.

## Fuera de este plan

- Instagram (mismo login con `instagram_content_publish`).
- Token de System User para no depender de una persona.
