# Herramienta En Vivo: de una nota de La Silla a un post de Facebook

Fecha: 25 de noviembre de 2026. Estado: implementado en local (ver «Estado de la implementación»); faltan credenciales de Canva y Meta, aplicar las migraciones y las decisiones del final.

## Qué se quiere

Una herramienta nueva en el Hub que hace lo mismo que la app `envivo-web` (`C:\migracion-entrada\py\posts insta diego\envivo-web`, hoy en https://envivo-facebook.vercel.app):

1. El periodista pega el link de una nota de La Silla Vacía.
2. La herramienta lee la nota y arma el texto del post con los primeros párrafos.
3. Arma la pieza En Vivo (1080x1350) a partir de la plantilla de la casa en Canva: foto recortada sobre la cara, titular y etiquetas con nombre y cargo de quien sale en la foto.
4. El periodista puede pedir cambios en lenguaje natural ("sube la etiqueta", "acorta el titular", "cambia el texto").
5. Publica directo en la página de Facebook de La Silla, o descarga el PNG.

La regla para todo el diseño: reusar lo que el Hub ya tiene (auth, organizaciones, Ajustes > Herramientas, claves por herramienta, conexión de WordPress, analíticas y costos) y crear algo nuevo sólo donde no hay nada que sirva.

## Cómo funciona hoy `envivo-web`

Ya es una app de Next.js en Vercel.

| Paso | Cómo lo hace | Dónde |
|---|---|---|
| Acceso | Una sola contraseña compartida (`APP_PASSWORD`) | `lib/sesion.ts` |
| Leer la nota | Raspa el HTML con cheerio: `og:title`, `og:image`, pie de foto, `parsely-tags`, párrafos hasta el primer `h2` | `lib/nota.ts` |
| Texto del post | Los 3 primeros bloques más el link; si pasa de 2.000 caracteres, Claude lo resume conservando las palabras de la nota | `lib/nota.ts` |
| Quién sale en la foto | Claude con visión devuelve las cajas de las cabezas y hasta 2 etiquetas (nombre como está en la nota, cargo de hasta 22 caracteres). Nunca reconoce caras: sólo usa el texto de la nota y lo que se lee en la foto | `lib/foto.ts` |
| Recorte y etiquetas | Geometría propia: centra la cara al 32% de la altura y ubica cada etiqueta debajo o encima de la cabeza sin tapar logo, etiqueta enVivo ni titular | `lib/geometria.ts` |
| Pieza en Canva | Claude usa el conector MCP de la API de Anthropic contra el servidor MCP de Canva: copia la plantilla, sube la foto, edita y exporta. Unos 90 segundos por pieza | `lib/agente.ts`, `skills/envivo-canva.md` |
| Pedir cambios | La misma llamada a Claude + Canva | `lib/agente.ts` |
| Conexión con Canva | OAuth del servidor MCP. Sólo redirige a `localhost`, así que fuera de local se pega la URL de vuelta a mano | `lib/canva.ts` |
| Publicar | Graph API: sube la foto sin publicar, crea el post con la foto adjunta. El token de página se genera aparte, con un script de Python, y va en una variable de entorno | `lib/facebook.ts`, `publicar_facebook.py` |
| Descargar | El navegador baja el PNG del link de Canva, que vence | `app/page.tsx` |
| Guardar cosas | Upstash Redis: tokens de Canva y fotos subidas | `lib/almacen.ts` |
| Analíticas | Ninguna | — |

No existe un botón de "pedir recomendación": lo que hay es "Pedir cambios". Lo único parecido a una recomendación es el paso automático que decide quién sale en la foto y escribe las etiquetas.

## Decisión de diseño: Canva y Facebook por sus APIs, sin el MCP

El camino de `envivo-web` (Claude manejando Canva por MCP) tiene cuatro problemas:

- Es lento: unos 90 segundos.
- Es caro: varias vueltas de Opus con herramientas.
- Es frágil: depende de betas de Anthropic, de operaciones de edición que Canva no documenta y de reintentos porque el MCP se cae.
- Pide pegar URLs a mano para conectar Canva.

Se investigaron las alternativas oficiales.

### Canva: REST API con una service app

Canva tiene una API REST oficial y versionada (antes "Connect API"): https://www.canva.dev/docs/apps/rest-apis/. Con una **service app** ("No Canva sign-in required") se autentica con client credentials: nadie inicia sesión, no hay redirect ni URL que pegar. Se anunció el 6 de noviembre de 2026: https://www.canva.dev/blog/developers/canva-service-accounts/.

Flujo determinista, sin LLM:

1. `POST /v1/url-asset-uploads` con la foto, ya recortada por nosotros al tamaño del marco, desde el bucket. Es un job asíncrono que se consulta hasta que termina.
2. `POST /v1/autofills` sobre la plantilla de marca, con `{ titular: text, foto: image(asset_id) }`.
3. `POST /v1/exports` en PNG a 1080 de ancho. La URL de descarga vale 24 horas; se copia al bucket enseguida.
4. Las etiquetas de nombre y cargo se dibujan encima en nuestro servidor, en las posiciones que calcula `geometria.ts`.

El último paso es así porque **ninguna API REST de Canva mueve ni redimensiona elementos**. El autofill sólo reemplaza el contenido de los campos (texto, imagen). Las etiquetas son lo único que cambia de lugar en cada pieza, así que se componen después, con la misma caja de 440x100 y la flecha de la plantilla.

Requisitos y costos (https://www.canva.dev/docs/apps/rest-apis/authentication/, https://www.canva.dev/docs/apps/rest-apis/credit-rates/):

- Plan de Canva **Business, Teams o Nonprofit**, con MFA o SSO. Una sola service app por equipo.
- Créditos de API: **10 por autofill**, que se devuelven si el job falla. Subir assets y exportar no gastan. Los créditos vencen a los 12 meses y los compra un owner o admin del equipo. **El precio no está publicado**: hay que verlo en el Developer Portal.
- Límites: 100 autofills, 100 subidas y 100 exports por minuto por credencial, y 5.000 exports al día por app. Sobra para una redacción.
- El token dura 4 horas. Cuando vence se pide otro con client credentials; no hay refresh que guardar.

Lo que se pierde frente al MCP:

- **Formato del titular.** El autofill no cambia tamaño de letra. `envivo-web` baja el titular a 110 cuando ocupa 4 líneas. Habrá que acortarlo para que quepa, o tener dos variantes de la plantilla (titular corto y titular largo). No está documentado si Canva achica el texto solo: se prueba en la fase 0.
- **El link en el titular y el nombre del diseño.** No importan para el PNG.

Alternativas descartadas:

- **REST con OAuth de usuario:** una app privada exige Canva Enterprise. Una pública pasa por la revisión de Canva y cada periodista tendría que conectarse.
- **MCP de Canva llamado directo desde el servidor**, sin Claude (`https://api.canva.com/connect/v1/mcp`, con app propia). Es lo único que mueve elementos dentro de Canva, pero tiene tres problemas:
  - la autenticación es por usuario, sin cuenta compartida;
  - las operaciones de mover y redimensionar no están documentadas ni versionadas;
  - la política de uso pide una acción explícita del usuario.

  Queda como plan B si las etiquetas dibujadas por nosotros no convencen.
- **Apps SDK:** corre dentro del editor de Canva, no en un servidor.

### Facebook: "Iniciar sesión con Facebook" desde Ajustes

En vez de pegar un token, el admin entra a Ajustes > Herramientas > En Vivo y pulsa "Conectar con Facebook". Usa el flujo de servidor de Facebook Login (https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow):

1. `/api/en-vivo/facebook/login` comprueba que sea OWNER o ADMIN, guarda un `state` en una cookie y redirige al diálogo de Facebook con los permisos `pages_show_list`, `pages_read_engagement`, `pages_manage_posts` y `business_management`.
2. `/api/en-vivo/facebook/callback`:
   1. Valida el `state`.
   2. Cambia el código por un token de usuario y ese por uno de larga duración.
   3. Comprueba que se concedió `pages_manage_posts`.
   4. Pide `/me/accounts` y deja elegir la página si hay más de una; exige permiso de crear contenido.
   5. Verifica con `debug_token` que el token de página no vence.
   6. Lo guarda.

   El token de página que sale de un token de usuario largo **no tiene fecha de vencimiento**, según la documentación: https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived. Es el mismo mecanismo que hoy hace a mano el script de Python.
3. Publicar no cambia: `POST /{page}/photos` sin publicar, luego `POST /{page}/feed` con la foto adjunta. Se firma con `appsecret_proof`.
4. Si Facebook responde 190 o 492 (contraseña cambiada, app quitada, el admin ya no tiene rol en la página), la conexión queda "desconectada" y Ajustes muestra "Reconectar".

Requisitos en Meta (https://developers.facebook.com/docs/graph-api/overview/access-levels, https://developers.facebook.com/docs/development/build-and-test/app-modes):

- **Sin App Review ni verificación del negocio**, siempre que quien conecte tenga rol en la app de Meta (administrador, desarrollador o tester). Con Standard Access alcanza.
- **La app tiene que estar publicada (modo Live).** En modo desarrollo los posts sólo los ve quien tiene rol. Publicarla pide URL de política de privacidad, URL de borrado de datos e ícono.
- La redirect URI se registra exacta en la app: `https://<dominio del Hub>/api/en-vivo/facebook/callback`. Las URLs de preview de Vercel no sirven.
- App ID y App Secret son de la plataforma, no de la organización: van en variables de entorno (`META_APP_ID`, `META_APP_SECRET`).

Pendiente de comprobar en la práctica:

- que un post de una app Live con Standard Access lo vea alguien sin rol;
- si `/me/accounts` muestra la página cuando el rol viene por Business Manager.

Para más adelante, el mismo login puede pedir `instagram_content_publish` y publicar en la cuenta de Instagram vinculada a la página: https://developers.facebook.com/docs/instagram-platform/content-publishing.

### Qué hace el modelo de lenguaje ahora

Sin el MCP, el modelo sólo hace tres cosas, todas con `generateObject` / `generateText` y el proveedor configurado de la herramienta:

1. **Quién sale en la foto:** cajas de las cabezas y etiquetas. Necesita visión.
2. **Resumir el texto** si pasa de 2.000 caracteres.
3. **Pedir cambios:** convierte lo que pide el periodista en cambios a los parámetros de la pieza (titular, texto, nombre y cargo de cada etiqueta, posición de cada etiqueta, punto de foco del recorte). Luego la pieza se vuelve a armar con el mismo flujo determinista.

Consecuencias:

- La herramienta ya no depende de Anthropic: sirve con cualquier proveedor del acordeón que tenga visión (OpenAI, Anthropic o Google).
- Una pieza pasa de unos 90 segundos a unos 15 o 20: autofill, export y una llamada de visión.
- El costo de modelo baja a una llamada de visión por pieza, más una por cada cambio. El autofill suma 10 créditos de Canva.

## Qué se reusa del Hub

| Necesidad | Qué hay en el Hub | Cómo se usa |
|---|---|---|
| Acceso | Auth de Supabase, perfiles y organizaciones | Reemplaza `APP_PASSWORD`. Sólo La Silla Vacía (`HERRAMIENTAS_POR_ORGANIZACION`), con comprobación en el servidor como `lib/quien-es-quien/acceso.ts` |
| Prompts | `tools` / `default_tools` con pestañas, editables en Ajustes > Herramientas | Pestañas "Foto" (quién sale), "Resumen" y "Cambios". Si la organización no los editó, prompt base en código |
| Modelo y clave | `herramienta_proveedores`, `obtenerProveedorDeHerramienta`, `crearModeloConfigurado`, `MAX_OUTPUT_TOKENS` | Igual que en las demás herramientas, con cualquier proveedor |
| Leer la nota | `wordpress_integration_table`, `getWordPressConnection`, `makeWordPressAuthenticatedRequest` | Sólo en el servidor: `/posts?slug=…&_embed=1` da título, contenido (párrafos hasta el primer `h2` con cheerio, que ya está instalado), foto destacada en alta, pie y etiquetas. Sin conexión, cae al raspado de HTML |
| Analíticas y costo | `lib/analytics.ts`, `calcularCosto`, `vista_analytics_generaciones` | Tabla `analytics_en_vivo`, `AnalyticsEnVivoService` y una rama en la vista |
| Logs | `DebugLogger` | Con `tool_identity` propio |
| Archivos | Supabase (el mismo proyecto) | Bucket `en-vivo` en Storage, aprobado |

## Qué hay que crear

### Base de datos y archivos

Agregar una herramienta no necesita migración en `tools`, `default_tools` ni `herramienta_proveedores`: la identidad es texto libre. Sí hacen falta:

1. **`herramienta_conexiones`**: la conexión de Facebook (página y token) y la de Canva no tienen dónde vivir.
   - `herramienta_proveedores` sólo admite OpenAI, Anthropic y Google.
   - La tabla de integraciones se borró (`9d4f757`).

   Mismo modelo de seguridad que `herramienta_proveedores`: sólo `service_role`, nada llega al navegador.

   ```sql
   create table public.herramienta_conexiones (
     organization_id uuid not null references public.organization (id) on delete cascade,
     herramienta text not null,
     servicio text not null check (servicio in ('CANVA', 'FACEBOOK')),
     datos jsonb not null,
     -- CANVA:    client_id, client_secret, plantilla_id, campos (nombres del titular y la foto)
     -- FACEBOOK: page_id, page_name, page_token, scopes, estado ('conectado' | 'desconectado')
     conectado_por uuid references auth.users(id),
     updated_at timestamptz not null default now(),
     primary key (organization_id, herramienta, servicio)
   );
   ```

   Los secretos (token de página, client secret de Canva) se guardan cifrados con AES-GCM y una clave de entorno, como recomienda Meta. Es genérica a propósito: Instagram o X serían un valor más en el `check`.
2. **Bucket `en-vivo`** en Supabase Storage, privado: lo lee y escribe sólo el servidor y los archivos se sirven por una ruta con sesión, porque las subidas a Canva y a Facebook van como binario. Guarda la foto recortada que se sube a Canva y el PNG final. Se limpia a los 2 días.
3. **`analytics_en_vivo`** y su rama en `vista_analytics_generaciones`.
4. ~~`logs.tool_identity`~~: no hace falta. En Vivo no usa `DebugLogger`; los errores van a la consola y a `analytics_en_vivo.error_mensaje`.
5. ~~Fila en `default_tools`~~: no hace falta. Los prompts base viven en `lib/en-vivo/prompt-base.ts` y Ajustes muestra la tarjeta igual que con Preguntas a SillaIA.

### Código

| Pieza | Origen |
|---|---|
| `lib/en-vivo/nota.ts` | Porta `envivo-web/lib/nota.ts`, primero por WordPress |
| `lib/en-vivo/foto.ts` | Porta `lib/foto.ts`. La visión pasa a `generateObject` con el proveedor de la herramienta |
| `lib/en-vivo/geometria.ts` | Copia de `lib/geometria.ts`, con sus constantes de la plantilla |
| `lib/en-vivo/canva.ts` | Nuevo: token con client credentials, subida de asset, autofill, export |
| `lib/en-vivo/etiquetas.ts` | Nuevo: dibuja las etiquetas sobre el PNG, con la caja, la flecha y las fuentes de la plantilla |
| `lib/en-vivo/cambios.ts` | Nuevo: el modelo convierte el pedido en cambios a los parámetros |
| `lib/en-vivo/facebook.ts` | Porta `lib/facebook.ts` y suma login, callback y `debug_token` |
| `lib/conexiones/configuracion.ts` | Nuevo: leer, guardar, cifrar y enmascarar conexiones, en el estilo de `lib/proveedores/configuracion.ts` |
| `app/api/en-vivo/{generar,cambios,publicar}` | Rutas con comprobación de organización |
| `app/api/en-vivo/facebook/{login,callback,deauthorize}` | Conexión de Facebook |
| `app/dashboard/en-vivo/page.tsx` | El flujo de `envivo-web` con los componentes del Hub |
| Sección "Conexiones" en `edit-tool-dialog.tsx` | Sólo para `en-vivo`, sólo OWNER/ADMIN: credenciales de Canva, ID de plantilla y "Probar"; "Conectar con Facebook" con estado |

Se eliminan, frente a `envivo-web`: la contraseña compartida, Redis, el OAuth de Canva con URL pegada, el agente MCP, el prompt de Canva y el script de Python del token.

## Riesgos

1. **Plan y créditos de Canva.** Si La Silla no tiene plan Business, Teams o Nonprofit, la service app no existe. El precio de los créditos no está publicado.
2. **Etiquetas fuera de Canva.** Para que se vean idénticas hacen falta las fuentes de la casa (archivos con licencia de uso en servidor) y el diseño exacto de la caja y la flecha. Si no se puede, plan B: el MCP de Canva directo, sin Claude.
3. **Titular.** Sin control del tamaño de letra, un titular de 4 líneas puede no caber. Se mitiga acortándolo o con dos variantes de la plantilla.
4. **App de Meta.** Tiene que ser de tipo Business, estar Live y tener como rol a quien conecte la página. Hay que revisar cómo está la app que usa hoy `envivo-web`.
5. **Dependencia de una persona.** El token de página depende del admin que conectó. Si pierde el rol o cambia la contraseña, alguien reconecta. La alternativa sin persona es un token de System User de Business Manager, que se pega a mano. Queda como opción, no como camino principal.
6. **Plantilla acoplada.** `geometria.ts` asume la plantilla actual: zonas fijas del logo, la etiqueta enVivo y el titular. Si se cambia la plantilla, hay que ajustar las constantes.

## Estado de la implementación (25 de noviembre de 2026)

Implementado en la rama `feat/herramienta-en-vivo`, sólo en local. Las migraciones están escritas pero **no aplicadas**: el `.env` local apunta a la base de producción.

### Qué hay

| Pieza | Archivos |
|---|---|
| Registro | `en-vivo` en `lib/proveedores/tipos.ts` y `lib/organizaciones/herramientas.ts` (sólo La Silla Vacía), menú lateral, tarjeta del inicio y tarjeta en Ajustes > Herramientas con sus prompts base |
| Lógica | `lib/en-vivo/`: `nota.ts`, `foto.ts`, `geometria.ts`, `canva.ts`, `dibujo.ts`, `pieza.ts`, `cambios.ts`, `facebook.ts`, `conexiones.ts`, `almacen.ts`, `modelo.ts`, `acceso.ts`, `prompt-base.ts`, `flujo.ts`, `tipos.ts` |
| Rutas | `app/api/en-vivo/`: `generar`, `cambios`, `publicar`, `archivo/[id]`, `estado`, `canva`, `facebook/login`, `facebook/callback` |
| Pantallas | `app/dashboard/en-vivo/page.tsx` y la sección "Conexiones" del diálogo de la herramienta (`components/en-vivo/conexiones-en-vivo.tsx`) |
| Analíticas | `AnalyticsEnVivoService` en `lib/analytics.ts` |
| Migraciones (sin aplicar) | `create_herramienta_conexiones.sql`, `create_analytics_en_vivo.sql` (con la rama de la vista), `create_en_vivo_bucket.sql` |
| Dependencia | `sharp` 0.34.5, que ya estaba instalado como dependencia de Next |

Para probar sin las migraciones:

- Las conexiones se guardan en `.data/en-vivo/conexiones.json` y los archivos en `.data/en-vivo/`. La carpeta está en `.gitignore`.
- Sin credenciales de Canva, la imagen es una **vista previa** aproximada de la plantilla (degradado, etiqueta enVivo y titular dibujados en el servidor), marcada como tal. Las etiquetas sí son las definitivas.
- Las analíticas no se guardan hasta que exista la tabla: `save()` sólo avisa en la consola.

### Variables de entorno

| Variable | Para qué | Obligatoria |
|---|---|---|
| `META_APP_ID`, `META_APP_SECRET` | "Conectar con Facebook" y `appsecret_proof` | Para conectar Facebook |
| `META_REDIRECT_BASE` | Dominio del callback si no es el de la petición | No |
| `META_GRAPH_VERSION` | Versión de Graph (por defecto `v24.0`, la de `envivo-web`) | No |
| `META_PAGE_ID` | Página a elegir si el admin administra varias. Con `META_PAGE_TOKEN` sirve de respaldo para probar sin login | No |
| `CONEXIONES_CLAVE` | 32 bytes en base64 para cifrar los secretos guardados | En producción |
| `EN_VIVO_BUCKET` | Nombre del bucket (`en-vivo`). Sin ella se usa el disco local | En producción |
| `CANVA_CLIENT_ID`, `CANVA_CLIENT_SECRET`, `CANVA_PLANTILLA_ID`, `CANVA_CAMPO_TITULAR`, `CANVA_CAMPO_FOTO` | Respaldo de la conexión de Canva si no se guardó en Ajustes | No |
| `EN_VIVO_FUENTE`, `EN_VIVO_COLOR_CARGO` | Tipografía y color de las etiquetas hasta tener las fuentes de la casa | No |

### Pruebas en local

Con la nota de Sondra Macollins y, para la prueba, las claves del Corrector (En Vivo no tenía proveedor propio):

- **Leer la nota:** por la conexión de WordPress de La Silla (`self_hosted`). Salieron el titular, la foto destacada original, el pie, las etiquetas y los 3 primeros párrafos (1.024 caracteres, sin resumen).
- **Generar:**
  - `gpt-6-luna`: 17 segundos, una llamada de visión (2.565 tokens de entrada, 1.211 de salida).
  - `claude-sonnet-5-5`: 10,6 segundos.
  - Los dos ubicaron las cabezas y etiquetaron sólo a Sondra Macollins ("Excandidata"), con la flecha sobre su cabeza.
- **Pedir cambios:**
  - "Sube la etiqueta un poco": subió 45 px y sólo redibujó la etiqueta.
  - "Acorta el texto": no tocó la imagen. Reescribió el párrafo; se ajustó el prompt "Cambios" para que recorte con las palabras de la nota.
  - "Cambia el cargo a Excandidata presidencial": lo abrevió a 22 caracteres y lo explicó.
  - Ningún cambio volvió a pasar por Canva.
- `tsc`: sin errores nuevos (86 antes y después, todos viejos).
- `next dev`: la página, el inicio y Ajustes compilan; las rutas de API responden 401 sin sesión.

**No probado**, porque faltan credenciales:

- Canva real (service app).
- "Conectar con Facebook" y publicar.
- El flujo completo en el navegador con sesión.

### Nombre «Post redes», recuadro y segunda foto (26 de noviembre de 2026)

- **Nombre.** La herramienta se llama **Post redes** en todo lo que se ve: menú, inicio, título, Ajustes y mensajes. La identidad interna sigue siendo `en-vivo` (rutas, base de datos, `HERRAMIENTAS_CON_PROVEEDORES`), para no mover nada más. La pieza sigue diciendo «enVivo», porque es la plantilla.
- **Recuadro.** Todo el contenido de la página va dentro de un recuadro (borde, esquinas redondeadas y sombra), como pidió el editor.
- **Segunda foto (opcional).** Es una «foto de evidencia» (un documento, una captura, otra escena) que va después de la pieza:
  - Pantalla: «Segunda foto (opcional)». Se sube un archivo o se pega el link de la imagen. Se ve debajo de la pieza y se puede quitar o descargar aparte.
  - `lib/en-vivo/evidencia.ts` y `POST /api/en-vivo/evidencia`. Un link sólo se acepta si es http(s), no es de la red interna (localhost ni IPs privadas), responde una imagen y pesa menos de 10 MB. Si no, sale un mensaje claro: se probaron localhost, ftp y el link de una nota, que no es una imagen.
  - Publicar: Facebook la lleva como segunda foto del mismo post (`attached_media[1]`). Instagram arma un carrusel: un contenedor por imagen como ítem, más el contenedor `CAROUSEL` con el texto.
  - **Diseño**, sacado de la página de evidencia que usa la redacción en Canva: la página 4 de «EnVivo – "Toda denuncia debe ser escuchada"…», `DAHaLFLf8yg`, copiada a `DAHcC7t53Bw` para leerla sin tocar el post.
    - Fondo morado `#4a4595`.
    - El logo de La Silla en crema arriba a la derecha (725, 62; 300x46), recortado de la capa fija y sin el degradado.
    - La foto centrada en un marco debajo del logo, con 60 px de margen.
    - En el ejemplo, el documento tapaba el logo y lo habían dejado con opacidad 0; aquí el logo queda visible.
- **MARTIN.** La redacción entregó `MARTIN-Regular.ttf`. Su familia interna es «MARTIN» y sus mayúsculas miden el 58 % del tamaño, como se midió en Canva. Ya está en `lib/en-vivo/plantilla/fuentes` y el titular deja de usar Anton. El archivo no trae texto de licencia: se asume que La Silla la tiene licenciada.
- **Prueba:** la pieza de la nota de Sondra Macollins con MARTIN (`gpt-6-luna`, 14,8 segundos) y la segunda foto con el diseño morado salieron iguales a las de Canva.

### La pieza se arma sin Canva (25 de noviembre de 2026)

Se decidió no depender de Canva: la pieza se arma en el servidor con los elementos de la plantilla real («Plantilla EnVivo – app web v2», `DAHZ_npj944`). Sin plan Business, sin créditos de API y sin configurar nada. La plantilla original no se tocó: se trabajó sobre dos copias.

Qué se sacó de Canva, con el conector:

- **`lib/en-vivo/plantilla/capa.png`**: la capa fija (degradado oscuro, logo y etiqueta enVivo), 1080x1350 con transparencia. Se exportó de una copia a la que se le borraron la foto, el titular y las etiquetas.
- **`lib/en-vivo/plantilla/etiqueta.png`**: el recuadro de la etiqueta de nombre, 440x100, color `#f7f1e1`, flecha hacia arriba en los 18 px de arriba. Para las etiquetas que van encima de la cabeza se gira 180°, como en la plantilla.
- **Las fuentes**, leídas del PDF exportado:
  - Titular: **MARTIN** (Regular).
  - Nombre de la etiqueta: **Manrope ExtraBold**.
  - Cargo: **Manrope Regular**.
- **Las medidas.** El titular va en x 68, desde y 831,6, con 931 de ancho, tamaño 110, interlineado 0,94 y color `#e4dfd1`; cada renglón tiene la línea base un interlineado más abajo que el anterior. Las etiquetas van en `#3d3d3d` y su línea base cae a 0,95 del tamaño bajo la caja de texto. Las medidas salen de la exportación de la plantilla.

Fuentes en el repo (`lib/en-vivo/plantilla/fuentes`):

- **Manrope:** Google Fonts, licencia OFL (`OFL-Manrope.txt`). Instanciada a 400 y 800 desde la fuente variable con fontTools.
- **MARTIN (Vocal Type):** al principio no se incluyó, porque no se encontró una licencia que permita redistribuirla, y el titular usaba **Anton** (OFL, `OFL-Anton.txt`) escalada al 57 % del tamaño. La redacción entregó el archivo el 26 de noviembre (ver abajo); Anton queda sólo de respaldo.

Cómo se dibuja (`lib/en-vivo/plantilla.ts`):

1. Sobre la foto recortada se ponen la capa y el titular. El titular se parte por ancho midiendo cada renglón con la fuente, y baja de tamaño (110 → 76) hasta caber en 4 renglones; si no cabe, avisa.
2. Encima van las etiquetas, en las posiciones de `geometria.ts`.

El texto lo dibuja Pango a través de `sharp`, con el archivo de cada fuente: **no se agregó ninguna dependencia**. Se probó `@resvg/resvg-js` con `opentype.js`, pero al agregarlas pnpm movía más de 40 paquetes declarados como `latest` (Radix, Tiptap, zod); se descartó. Pango recorta cada imagen a la tinta, así que cada renglón lleva un puntal invisible (`ÉgQ,`, con `fgalpha="1"`) que fija su alto y deja la línea base siempre a la misma distancia.

Canva queda como plan B: sólo se usa si una organización configura una service app en Ajustes.

`next.config.mjs` incluye `lib/en-vivo/plantilla/**` en las funciones de `/api/en-vivo/**`, porque los archivos se leen del disco.

**Prueba:** la nota de Sondra Macollins con `claude-sonnet-5-5`, en 9,7 segundos. Salió el titular en 3 renglones a 110, con Anton de respaldo, y la etiqueta encima de la cabeza (grupo C, flecha abajo). Visualmente es igual a la plantilla. `tsc` no tiene errores nuevos.

En la cuenta de Canva quedaron las dos copias de trabajo (`DAHb8fQs5_I` y `DAHb8YKEVqE`); se pueden borrar.

### Arreglos de la primera prueba de "Conectar con Facebook"

El login con Facebook funcionó por el túnel de VS Code (`*.devtunnels.ms`), pero fallaban dos cosas:

- **"No se pudo guardar la conexión: undefined".** Sin la tabla `herramienta_conexiones`, Supabase responde al escribir con estado 404 y un error vacío, sin código; al leer sí trae `42P01`. Ahora el 404 sin código también cuenta como "falta la tabla" y se guarda en el archivo local.
- **Volvía a `https://localhost:3000`.** Detrás del túnel, la petición le llega a Next como `localhost:3000`. La URL de vuelta y el regreso a la página usan ahora la dirección pública: `META_REDIRECT_BASE` o, si no está, el host reenviado (`x-forwarded-host`).

### Arreglo de paso

`getWordPressConnection` (`lib/wordpress-oauth.ts`) imprimía en el log del servidor la fila de la conexión de WordPress con la contraseña. Se quitaron esos `console.log`.

## Preguntas para decidir

1. **Canva.** ¿Qué plan tiene La Silla? ¿Pueden crear la service app y comprar créditos?
2. **Etiquetas dibujadas por nosotros.** ¿Sirve, si quedan iguales a las de la plantilla? Necesito los archivos de las fuentes y el diseño de la caja.
3. **Meta.** ¿Se usa la app que ya tiene `envivo-web` ("mcp") o se crea una nueva para el Hub? ¿Quién conecta la página?
4. **"Pedir recomendación".** ¿Es el "Pedir cambios", o algo más? Por ejemplo, que el modelo sugiera titular o texto antes de armar la pieza.
5. **Nombre.** Propuesta: "En Vivo para Facebook", con identidad `en-vivo`.
6. **Visibilidad.** ¿Sólo La Silla Vacía, y oculta en el menú mientras se prueba?
7. **`envivo-web`.** ¿Se apaga cuando esto esté en el Hub?
