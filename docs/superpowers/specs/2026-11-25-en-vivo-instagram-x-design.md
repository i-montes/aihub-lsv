# En Vivo: publicar también en Instagram y en X

Fecha: 25 de noviembre de 2026. Estado: Instagram implementado en local (ver «Implementación de Instagram»); X sigue en propuesta, pendiente de decidir el costo.

## Qué se quiere

Que la pieza de En Vivo se publique, con el mismo "iniciar sesión" que ya usa Facebook, también en:

- el Instagram de La Silla;
- la cuenta de X de La Silla.

El admin conecta cada cuenta una vez desde Ajustes > Herramientas > En Vivo, y el periodista elige en qué redes publica.

## Instagram: el mismo login de Facebook

La cuenta profesional de Instagram de La Silla está vinculada a su página de Facebook. Con la "Instagram API with Facebook Login" no hace falta otro login: basta con pedir más permisos en el "Conectar con Facebook" que ya funciona (https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/get-started).

Se descartó la otra opción, "Instagram API with Instagram Login" (graph.instagram.com), por tres razones (https://developers.facebook.com/docs/instagram-platform/overview):

- es un segundo flujo de login;
- su token vence a los 60 días si no se refresca;
- no aporta nada para este caso.

### Cambios

1. **Permisos.** Al `scope` del login de Facebook se suman `instagram_basic`, `instagram_content_publish` y `pages_read_engagement`, que ya estaba. El admin tiene que volver a pulsar "Conectar con Facebook" una vez, para conceder los permisos nuevos.
2. **Callback.** Después de guardar la página, se pide `GET /{page-id}?fields=instagram_business_account`. Si trae un id, se guarda una conexión `INSTAGRAM` con ese id; usa el mismo token de página. Si no trae, Ajustes avisa que la página no tiene un Instagram profesional vinculado.
3. **Publicar** (https://developers.facebook.com/docs/instagram-platform/content-publishing):
   1. Convertir el PNG a **JPEG** sRGB, porque Instagram no acepta PNG. 1080x1350 (4:5) está dentro de lo permitido, y el máximo es 8 MB.
   2. `POST /{ig-user-id}/media` con `image_url` y `caption`.
   3. Consultar `status_code` hasta `FINISHED`, con un tope de pocos minutos.
   4. `POST /{ig-user-id}/media_publish` con el `creation_id`.
4. **La imagen tiene que estar en una URL pública.** Meta la baja; no hay subida binaria para imágenes, sólo para video. El almacén de En Vivo es privado, así que se agrega una ruta pública con firma, `/api/en-vivo/publico/[id]?vence=…&firma=…`: un HMAC con vencimiento de una hora, sin sesión, que sólo sirve ese archivo. En local, la URL sale por el túnel (`META_REDIRECT_BASE`).
5. **El texto.** El caption admite hasta 2.200 caracteres, 30 hashtags y 20 menciones. Los links no son clickeables en Instagram, así que el texto cambia "link de la nota" por "link en la bio". Va en una pestaña de prompt nueva, "Instagram", o se hace con una regla fija; se decide al implementar.

### Requisitos

- **Sin App Review.** Con Standard Access alcanza si quien conecta tiene rol en la app (https://developers.facebook.com/docs/instagram-platform/overview).
- **Page Publishing Authorization (PPA).** Si la página la exige, Instagram no publica hasta completarla. Meta recomienda completarla de antemano. Hay que revisarla en la página de La Silla.
- **Límite.** 100 publicaciones por API cada 24 horas; la misma documentación dice 50 en otra sección. Se puede consultar con `GET /{ig-user-id}/content_publishing_limit`.

### Por confirmar en la prueba

- Si el token de página sirve para `/media`. La documentación se contradice: en un lugar dice token de página y en otro token de usuario.
- Si Meta acepta la URL firmada.

## Implementación de Instagram (25 de noviembre de 2026)

Hecho en la rama `feat/herramienta-en-vivo`, sólo en local.

- **Permisos** (`lib/en-vivo/facebook.ts`): el login de Facebook pide además `instagram_basic` e `instagram_content_publish`. `cuentaInstagram()` lee `instagram_business_account{id,username}` de la página.
- **Callback de Facebook:** si se concedió `instagram_content_publish`, guarda la conexión `INSTAGRAM` (`ig_user_id`, usuario y página). No guarda token propio: usa el de la página. El mensaje de vuelta dice qué cuenta quedó o por qué no.
- **Conexiones** (`lib/en-vivo/conexiones.ts`): servicio `INSTAGRAM`. El estado sólo la da por conectada si Facebook sigue conectado a la misma página.
- **Enlace público** (`lib/en-vivo/publico.ts` y `app/api/en-vivo/publico/[id]`): HMAC del id y el vencimiento, válido una hora, sin sesión. La clave es `EN_VIVO_FIRMA_CLAVE`, o una derivada de `SUPABASE_SERVICE_ROLE_KEY`. `proxy.ts` no toca `/api`, así que la ruta queda abierta.
- **Publicar** (`lib/en-vivo/instagram.ts`):
  1. Pasa el PNG a JPEG sRGB y lo guarda.
  2. Le da a Meta la URL firmada.
  3. Crea el contenedor y consulta `status_code` cada 2 segundos, hasta 2 minutos.
  4. Hace `media_publish` y trae el `permalink`.
- **Texto** (`lib/en-vivo/texto-instagram.ts`): el del post sin el link de la nota y sin agregar nada más, hasta 2.200 caracteres. Al principio llevaba el cierre "Lee la nota completa en el link de nuestra bio."; se quitó por decisión editorial. La pantalla lo muestra en «Texto para Instagram».
- **Ruta `publicar`:** recibe `redes: ["facebook", "instagram"]` y devuelve el resultado de cada red por separado; si una falla, la otra sigue. Su `maxDuration` sube a 180 segundos.
- **Pantalla:** casillas de Facebook e Instagram junto a «Publicar». Instagram aparece sólo si está conectado, y apagado por defecto. Al publicar sale un «Ver en …» por red.
- **Analíticas:** `publicada_instagram` y `permalink_instagram`, en el tipo y en la migración `create_analytics_en_vivo.sql`. La migración `create_herramienta_conexiones.sql` suma `INSTAGRAM` al `check`. Ninguna está aplicada todavía.

**Probado:**

- La firma válida abre, y la alterada o vencida se rechaza.
- El texto de Instagram sale bien.
- Con la conexión actual de Facebook, hecha sin los permisos de Instagram, la página no devuelve cuenta de Instagram. Hay que reconectar para saber si tiene una vinculada.

**No probado:** publicar en Instagram. Para hacerlo en local hace falta:

1. Agregar `instagram_basic` e `instagram_content_publish` en el caso de uso de la app de Meta.
2. Reconectar Facebook desde Ajustes.
3. Poner el túnel de VS Code como **público** (Puertos > Visibilidad del puerto > Pública), porque Meta tiene que bajar la imagen sin iniciar sesión en el túnel.
4. Revisar la Page Publishing Authorization de la página.

## X: login propio y pago por uso

### Costo

**Esto hay que decidirlo antes de construir.**

- Desde el 6 de febrero de 2026 la API de X es **de pago por uso**: sin plan gratis, con créditos comprados por adelantado en console.x.com (https://docs.x.com/x-api/getting-started/pricing, https://docs.x.com/changelog).
- Publicar un post cuesta **0,015 dólares**, y **0,20 dólares si lleva una URL**. Un post de En Vivo lleva el link de la nota, así que serían unos 20 centavos de dólar por post.
- Sin créditos, la API no responde.
- Al guardar una tarjeta dan 20 dólares de crédito.

### Login

Se usa OAuth 2.0 con PKCE en contexto de usuario (https://docs.x.com/fundamentals/authentication/oauth-2-0/authorization-code). El flujo:

1. `/api/en-vivo/x/login`:
   - Genera `state` y `code_verifier` y los guarda en una cookie, como el state de Facebook.
   - Redirige a `https://x.com/i/oauth2/authorize` con los scopes `tweet.read tweet.write users.read media.write offline.access`.
2. `/api/en-vivo/x/callback`:
   - Canjea el código de inmediato, porque dura 30 segundos, en `POST https://api.x.com/2/oauth2/token` con Basic auth (client ID y secret).
   - Lee `GET /2/users/me` para mostrar la cuenta.
   - Guarda una conexión `X` con el access token y el refresh token cifrados.
3. **Tokens.** El access token dura 2 horas.
   - Antes de publicar, si le quedan menos de 5 minutos, se refresca con el refresh token.
   - El refresh token se trata como de un solo uso: el nuevo se guarda antes de usar el access token.
   - Si el refresh falla, la conexión queda en "reconectar".

Variables: `X_CLIENT_ID` y `X_CLIENT_SECRET`, de una app de tipo "Web App" en console.x.com con permisos "Read and write". El callback se registra exacto ahí. En local se usa la URL del túnel, que es https; X tampoco acepta `localhost`.

### Publicar

1. `POST https://api.x.com/2/media/upload` (multipart, `media_category=tweet_image`). El PNG sirve tal cual, hasta 5 MB (https://docs.x.com/x-api/media/upload-media).
2. `POST https://api.x.com/2/tweets` con `{ text, media: { media_ids: [id] } }` (https://docs.x.com/x-api/posts/create-post).

### Texto

Un post admite 280 caracteres, y cada URL cuenta como 23 (https://docs.x.com/fundamentals/counting-characters). El texto de Facebook no cabe, así que hace falta un texto corto para X. Va en una pestaña de prompt nueva, "X": el modelo lo saca del texto del post, sin inventar, y termina con el link. Se valida el largo antes de publicar.

## Qué se reusa

- La tabla `herramienta_conexiones`: su `check` pasa a `('CANVA', 'FACEBOOK', 'INSTAGRAM', 'X')`.
- El cifrado de los tokens.
- La cookie de `state` y `origenPublico` para el túnel.
- `estadoConexiones` y la sección "Conexiones" de Ajustes, que suma Instagram y X.
- Las analíticas: `analytics_en_vivo` suma `publicada_instagram`, `publicada_x` y sus permalinks.

## Pantalla

- Junto a "Publicar en Facebook" aparecen casillas para Facebook, Instagram y X, encendidas sólo si la red está conectada, y un botón "Publicar".
- Para X se muestra el texto corto, editable, con el contador de caracteres y el aviso de costo.
- Cada red devuelve su link, o su error, por separado: si una falla, las otras no se deshacen.

## Preguntas para decidir

1. **X.** ¿La Silla acepta pagar créditos de la API de X, unos 20 centavos de dólar por post con link? Si no, X se hace sólo como "copiar texto y descargar imagen".
2. ~~Instagram: ¿"link en la bio"?~~ Decidido: sólo el texto, sin el link y sin cierre.
3. **¿Por defecto se publica en las tres redes o sólo en Facebook?**
