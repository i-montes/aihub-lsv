# Post redes: arreglos de la revisión del PR #27

Fecha: 27 de noviembre de 2026. Rama: `feat/post-redes` (PR #27).

La revisión del PR encontró ocho puntos. Esta spec dice qué se cambia en cada uno y cómo se probó. El 8 queda pendiente de decisión.

## 1. El mismo post podía salir dos veces

**Problema.**
- Después de publicar, nada marcaba la pieza como publicada en el servidor.
- Si la función se cortaba esperando a Instagram, el editor veía un error y volvía a intentar. Facebook ya había publicado, así que salía otra vez.
- La espera de Instagram (hasta 120 s por imagen más el carrusel) podía pasar el límite de 180 s de la ruta.
- En la pantalla, agregar la segunda foto después de publicar volvía a mostrar el botón "Publicar".

**Cambio.**
- **Marca por publicación** (`lib/en-vivo/publicaciones.ts`). Antes de publicar en una red se reserva una marca en el almacén (bucket o `.data`). La marca depende de la organización, la red, la imagen y la segunda foto.
  - La reserva es atómica: el bucket sube sin `upsert`, y en el disco se escribe con la bandera `wx`. Si dos pedidos llegan a la vez, sólo uno publica.
  - Si la marca dice "publicada", no se publica otra vez: se devuelve el link de la primera.
  - Si dice "publicando", no se publica. Eso pasa si hay una publicación en curso o si una anterior se cortó y no se sabe si salió. Se le pide al editor que revise la página antes de volver a intentar. Para publicar de nuevo tiene que cambiar la pieza o generarla otra vez.
  - Si Meta responde con un error, la marca se borra y se puede reintentar: en ese caso no salió nada.
  - Las marcas se borran a los dos días, con el resto del almacén. El bucket acepta `application/json` para guardarlas.
- **Instagram con un plazo total.** Todas sus esperas comparten un tiempo límite: 240 s desde que empieza el pedido. La ruta sube a `maxDuration = 300`, como `generar` y `cambios`.
  - Si se acaba el plazo, no se llamó a `media_publish` y no sale nada en Instagram. La marca se borra para poder reintentar.
- **En la pantalla:**
  - Cada red publicada queda marcada y no se puede volver a elegir.
  - Agregar la segunda foto o pedir cambios ya no borra ese estado. Sólo se limpia con "Hacer otro".
  - Si una red falló, se puede reintentar sólo esa.

## 2. Los tokens podían quedar sin cifrar en la base

**Problema.** Sin `CONEXIONES_CLAVE`, `cifrar()` devolvía el texto tal cual. El token de la página y el secreto de Canva se habrían guardado en claro en Supabase.

**Cambio.**
- El cifrado se hace en `guardar()`, según dónde va el dato:
  - **Base de datos:** sin clave, falla con un mensaje claro y no escribe nada.
  - **Archivo local** (`.data/en-vivo/conexiones.json`, sólo fuera de Vercel): sin clave guarda en claro, como antes.
- Sin clave en local se va directo al archivo, aunque la tabla exista. Así, un `.env` local que apunte a producción no deja tokens en claro.
- Lo que ya está cifrado no se vuelve a cifrar. Por eso marcar como desconectado reescribe lo que había sin tocarlo.

## 3. Podía conectarse la página equivocada

**Problema.** Sin `META_PAGE_ID`, se tomaba la primera página que administrara quien conectaba.

**Cambio.**
- **En Vercel**, `META_PAGE_ID` es obligatoria. Si falta, el callback no guarda nada y lo dice.
- **En local**, si falta y la persona administra más de una página, no se elige ninguna: se muestran los nombres y los ids para que defina la variable. Si administra una sola, se usa esa.
- `META_PAGE_ID` entra a la lista de variables del despliegue.

## 4. Analíticas abiertas a cualquier usuario autenticado, y Post redes visible para otras organizaciones

**Problema.**
- `analytics_en_vivo` no tenía RLS y daba permisos de escritura a `authenticated`. Un usuario de Orza podía leerla y cambiarla directo por PostgREST.
- Las rutas actualizaban cualquier fila con el `analyticsId` que mandara el navegador.
- La tarjeta de Post redes en Ajustes > Herramientas salía para todas las organizaciones.

**Cambio.**
- **Migración:** RLS activado, sin políticas para `anon` ni `authenticated`, `revoke all` a esos dos roles y permisos sólo para `service_role`, como `herramienta_conexiones`.
- **`AnalyticsEnVivoService`** usa el cliente de servicio. Ya no depende de la sesión del navegador para escribir.
- **Las rutas sólo tocan filas propias.** Antes de actualizar una fila, `cambios`, `publicar` y `archivo` comprueban con `analyticsPropia(id, organización, usuario)` que sea de la organización y del usuario de la sesión. Si no, la ignoran.
- **Acceso a las rutas:** sólo entra La Silla Vacía (`verificarAccesoEnVivo` y `HERRAMIENTAS_POR_ORGANIZACION`). Esto no cambia.
- **Ajustes > Herramientas** sólo muestra la tarjeta de Post redes si la organización tiene la herramienta (`puedeVerHerramienta`).

**Fuera de alcance:** `vista_analytics_generaciones` es una vista que existía antes. Lee las tablas de analíticas como su dueño, igual que con las otras herramientas, y la fila de Post redes sólo agrega id, organización, usuario, costo y estado. Cambiar la seguridad de esa vista afecta a todas las herramientas y va aparte.

## 5. Una palabra muy larga en el titular rompía la generación

**Problema.** Una palabra sin espacios más ancha que el renglón daba el error de sharp "Image to composite must have same dimensions or smaller". Pasaba con un link o con "Anticonstitucionalisimamente".

**Cambio** (`lib/en-vivo/plantilla.ts`).
- La letra baja de tamaño mientras haya más de 4 renglones **o** un renglón más ancho que el espacio.
- Si con la letra más pequeña una palabra sigue sin caber, ese renglón se angosta al ancho y se avisa en la pantalla.
- El ancho se mide sin el puntal invisible.
- La imagen de cada renglón se recorta al borde del lienzo; lo que se corta es sólo el puntal.
- Con los nombres y cargos de las etiquetas pasa lo mismo: si no caben en el recuadro, se angostan.

## 6. /cambios confiaba en la pieza del navegador

**Problema.** Con medidas de foto falsas, sharp daba errores raros.

**Cambio.** `piezaConfiable` (`lib/en-vivo/pieza.ts`) limpia la pieza antes de usarla:
- Los ids de archivo tienen que ser válidos.
- El tamaño de la foto se lee del archivo guardado, no del navegador.
- Las cabezas quedan entre 0 y 1, y los corrimientos acotados.
- Los textos tienen un largo máximo, y las listas un máximo de elementos.
- Una etiqueta que apunta a una cabeza que no existe se descarta.

## 7. La foto de la nota se bajaba sin límites

**Cambio** (`lib/en-vivo/foto.ts`).
- Hay un timeout de 20 s.
- Sólo se aceptan respuestas `image/*`.
- El tope es 25 MB: se deja de leer apenas lo pasa, aunque el servidor no mande `Content-Length`.

## 8. Cualquier miembro puede publicar

Por ahora cualquier miembro de La Silla con acceso a Post redes puede publicar. Sólo conectar Facebook está limitado a administradores. Está pendiente de decisión: si se limita, `publicar` tiene que exigir `esAdministrador(role)`, y la pantalla tiene que esconder el botón a quien no lo es.

## Cómo se probó

- `tsc`: no aparecen errores nuevos; los que salen ya estaban antes.
- **Marcas de publicación**, con un script contra el almacén local y la función de publicar simulada:
  - Un segundo intento devuelve el mismo link sin volver a publicar.
  - Dos intentos a la vez publican una sola vez.
  - Un error borra la marca.
  - Una marca "publicando" bloquea.
- **Cifrado:** en Vercel y sin clave, guardar la conexión de Facebook falla antes de escribir en la base.
- **Sin prueba automática**, revisados en el código: la elección de página, el cifrado con clave y que no se cifre dos veces. Se prueban al conectar Facebook de nuevo con `CONEXIONES_CLAVE` y `META_PAGE_ID` puestas.
- **Titulares** con un link, "Anticonstitucionalisimamente" y una palabra de 80 letras: todos dan 1080x1350. Un titular normal no avisa nada.
- **Etiqueta** con un nombre y un cargo larguísimos: se dibuja.
- **Pieza falsa:** medidas 99999999 x -5, cabezas con NaN, una etiqueta a una cabeza inexistente y una base `../../etc/passwd`. Queda con las medidas reales (1600x1000), los valores acotados y sin base, y se arma bien.
