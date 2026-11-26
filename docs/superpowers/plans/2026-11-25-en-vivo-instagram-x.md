# Plan: En Vivo en Instagram y X

Spec: `docs/superpowers/specs/2026-11-25-en-vivo-instagram-x-design.md`. Va en la misma rama, `feat/herramienta-en-vivo`, después de la plantilla sin Canva. Cada fase lleva su commit de spec y su commit de código.

## Fase 1. Instagram

1. **Migración** `add_instagram_x_herramienta_conexiones.sql`: el `check` de `servicio` pasa a `('CANVA', 'FACEBOOK', 'INSTAGRAM', 'X')`. Columnas nuevas en `analytics_en_vivo`: `publicada_instagram`, `permalink_instagram`, `publicada_x` y `permalink_x`.
2. **`lib/en-vivo/facebook.ts`:**
   - `PERMISOS` suma `instagram_basic` e `instagram_content_publish`.
   - `cuentaInstagram(pageId, token)` lee `instagram_business_account`.
3. **Callback de Facebook:** después de guardar la página, guarda la conexión `INSTAGRAM`, o un aviso si la página no tiene Instagram vinculado.
4. **`lib/en-vivo/publico.ts`:** firmar y verificar URLs con HMAC y vencimiento. La ruta `app/api/en-vivo/publico/[id]` sirve el archivo sin sesión si la firma vale.
5. **`lib/en-vivo/instagram.ts`:**
   - Convierte el PNG a JPEG y lo guarda.
   - Arma la URL firmada.
   - Crea el contenedor, consulta su estado hasta que esté listo y publica.
   - Ante un 190 o 492, deja la conexión en "reconectar".
6. **Ruta `app/api/en-vivo/publicar`:** recibe `redes: ["facebook", "instagram", "x"]` y responde con el resultado de cada red por separado.
7. **Pantalla:** casillas por red y estado de Instagram en "Conexiones".

Prueba: reconectar Facebook y ver que aparece la cuenta de Instagram. Publicar una pieza en Instagram por el túnel; acordar antes si va a la cuenta real.

## Fase 2. X (sólo si se aprueba el costo)

1. **`lib/en-vivo/x.ts`:**
   - Login con PKCE y canje del código.
   - `/2/users/me`.
   - Refresco del token con el refresh de un solo uso, guardado antes de usarlo.
   - Subida de media y creación del post.
2. **Rutas** `app/api/en-vivo/x/login` y `callback`, con las variables `X_CLIENT_ID` y `X_CLIENT_SECRET`.
3. **Texto corto:**
   - Pestaña de prompt "X" en `prompt-base.ts`.
   - Generarlo en `generar` y en `cambios`.
   - Validar 280 caracteres con cada URL contada como 23.
4. **Pantalla:** texto corto editable con contador, aviso de costo y estado de X en "Conexiones".

Prueba:

- conectar la cuenta de X por el túnel;
- comprobar que el token se refresca solo, cambiando el vencimiento guardado a mano;
- publicar un post de prueba, acordado antes.

## Fuera de este plan

- Carruseles y stories.
- Programar publicaciones.
- LinkedIn, Threads y Bluesky. Serían un valor más en `servicio` y su propio módulo.
