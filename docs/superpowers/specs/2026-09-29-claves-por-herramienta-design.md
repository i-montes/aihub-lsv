# Claves de API por herramienta

Fecha: 29 de septiembre de 2026. Estado: aprobado en conversación, pendiente de revisión escrita.

## Qué se quiere

Cada herramienta del kit pasa a tener sus propias claves de API, una por proveedor, configuradas desde Ajustes > Herramientas. La sección de Integraciones desaparece: las claves de la organización que viven ahí dejan de usarse.

En el diálogo de cada herramienta, los checkboxes de modelos se reemplazan por un acordeón por proveedor (OpenAI, Anthropic, Google). Dentro de cada acordeón:

- La clave de API. Su presencia enciende el proveedor; sin clave, el proveedor está apagado.
- El modelo, elegido de la lista real del proveedor cuando se puede consultar, o escrito a mano cuando no.
- Sugerencias de modelos ya usados en otras herramientas de la organización, para elegir con un clic.
- Esfuerzo de razonamiento y verbosidad, según lo que soporte cada proveedor.

Los proveedores de cada herramienta se ordenan con flechas. En el momento de usar la herramienta, el periodista elige entre los encendidos; el primero del orden es el que viene seleccionado por defecto.

Cada herramienta lleva una clave distinta: el guardado rechaza una clave que ya esté en otra herramienta de la misma organización.

Al desplegar, todas las herramientas empiezan sin claves. No se migran las de Integraciones.

## Por qué así

Hoy las claves son de la organización, una por proveedor, en `api_key_table`. Cada herramienta guarda en `tools.models` una lista de modelos marcados con checkbox, y la lista de modelos "disponibles" es un arreglo de texto en la fila de la clave que en la práctica sólo trae el modelo por defecto. La página de Integraciones lee la clave en texto plano desde el navegador, y seis páginas más consultan `api_key_table` desde el cliente.

Se eligió una tabla nueva, sólo accesible desde el servidor, por encima de guardar la clave dentro de `tools.models` (cualquier miembro la vería en el navegador) y de reutilizar `api_key_table` agregándole la herramienta (hereda políticas que no están en el repo y rutas que hay que borrar igual).

## Identidades de herramienta

Son las que ya usa la tabla `tools`:

| Herramienta | Identidad |
|---|---|
| Corrector | `proofreader` |
| Hilos | `threads_generator` |
| Resúmenes | `resume` |
| Detector | `detector` |
| Quién es quién | `quien-es-quien` |
| Preguntas a SillaIA | `preguntas-chatbot` |

Hilos usa `thread-generator` en algunos registros de depuración; la identidad válida es la que se consulta en la tabla, `threads_generator`.

## Datos

Tabla nueva `herramienta_proveedores`:

| Columna | Tipo | Qué guarda |
|---|---|---|
| `organization_id` | uuid, FK a `organization` | Parte de la clave primaria. |
| `herramienta` | text | Identidad de la herramienta. Parte de la clave primaria. |
| `proveedor` | text, check en `OPENAI`, `ANTHROPIC`, `GOOGLE` | Parte de la clave primaria. |
| `api_key` | text, no nulo | La clave. Su presencia es el encendido: sin fila, el proveedor está apagado. |
| `modelo` | text, no nulo | El modelo elegido o escrito. |
| `reasoning_effort` | text, nulo | Valores por proveedor, ver abajo. |
| `verbosity` | text, nulo | Sólo OpenAI: `low`, `medium`, `high`. |
| `posicion` | integer, no nulo | Orden dentro de la herramienta. La posición 0 corre por defecto. |
| `created_at`, `updated_at` | timestamptz | |

Índice único sobre `(organization_id, api_key)`: una clave no se repite entre herramientas de la misma organización.

Políticas: RLS activado, una sola política para `service_role`. El navegador no puede leer ni escribir la tabla.

Valores de esfuerzo por proveedor:

| Proveedor | Esfuerzo | Verbosidad |
|---|---|---|
| OpenAI | `low`, `medium`, `high`, `xhigh` | `low`, `medium`, `high` |
| Anthropic | `low`, `medium`, `high` | no |
| Google | `minimal`, `low`, `medium`, `high` | no |

Google no tiene verbosidad. Su esfuerzo se aplica como `thinkingLevel` del proveedor `@ai-sdk/google`, que ya expone esa opción en la versión instalada.

`tools.models`, `tools.reasoning_effort`, `tools.verbosity` y sus equivalentes en `default_tools` dejan de leerse y escribirse. Se retiran en la segunda migración (ver "Orden de salida").

## Rutas de API

Todas las rutas de configuración usan el cliente con rol de servicio y exigen sesión con rol OWNER o ADMIN de la organización. Ninguna devuelve una clave completa.

### `GET /api/herramientas/[identidad]/proveedores`

Devuelve los proveedores configurados de la herramienta en orden: proveedor, modelo, esfuerzo, verbosidad y la clave enmascarada (sólo los últimos cuatro caracteres). También devuelve, para las sugerencias, los modelos en uso por las demás herramientas de la organización agrupados por proveedor.

### `PUT /api/herramientas/[identidad]/proveedores`

Recibe la lista ordenada de proveedores. Para cada uno: proveedor, modelo, esfuerzo, verbosidad y una de dos: `apiKey` con la clave nueva, o `conservarClave: true` para dejar la que hay. Un proveedor que no viene en la lista se apaga y su fila se borra.

Validaciones, con mensaje claro en cada caso:

- Al menos un proveedor con clave y modelo.
- Esfuerzo y verbosidad dentro de los valores del proveedor.
- `conservarClave` sólo vale si ya hay fila para ese proveedor.
- Ninguna clave nueva puede estar en otra herramienta de la organización. El mensaje nombra la herramienta que la tiene. El índice único respalda la validación por si dos guardados compiten.

Escribe las filas en una sola operación (upsert de las presentes, borrado de las ausentes) para que la herramienta no quede a medias.

### `POST /api/herramientas/modelos`

Recibe proveedor y una de dos: `apiKey` o `herramienta` para usar la clave guardada de esa herramienta. Consulta la lista real del proveedor:

- OpenAI: `GET /v1/models`, filtrado a `gpt-*` sin variantes `instruct` ni fechas viejas.
- Anthropic: `GET /v1/models`, filtrado a `claude*`.
- Google: `GET v1beta/models`, filtrado a `gemini*`.

Los filtros son los que hoy tiene `app/api/integrations/verify/route.ts`; se mueven a `lib/proveedores/listar-modelos.ts` y la ruta vieja se borra. Si el proveedor no responde o rechaza la clave, la ruta devuelve el error con su mensaje y la interfaz cae al campo de texto. Es también la validación de la clave: si la lista llega, la clave funciona.

### `GET /api/herramientas/[identidad]/proveedores-activos`

Para cualquier miembro con sesión de la organización. Devuelve sólo proveedor y modelo en orden, sin claves ni ajustes. Es lo que consultan las páginas de uso para armar el selector y preseleccionar el primero. Reemplaza las lecturas de `api_key_table` que hoy hacen desde el navegador el Corrector, Hilos, Resúmenes, el Detector (hook y sección de modelos) y el selector de modelos del diálogo.

### Helper de servidor

`lib/proveedores/configuracion.ts` exporta `obtenerProveedorDeHerramienta(organizationId, herramienta, proveedor)`, que devuelve clave, modelo, esfuerzo y verbosidad, o lanza un error tipado "la herramienta no tiene ese proveedor configurado" que cada ruta convierte en su mensaje al usuario. También `listarProveedoresActivos(organizationId, herramienta)` para la ruta de proveedores activos y para las herramientas sin selector.

## Diálogo de Herramientas

`components/tools/edit-tool-dialog.tsx` conserva las pestañas de prompt y formato de respuesta. `components/tools/tool-config.tsx` se reescribe:

- Tres acordeones, uno por proveedor, en el orden guardado. Los proveedores sin configurar van al final, apagados. El encabezado muestra el nombre del proveedor, un indicador de encendido, el modelo elegido y flechas para subir y bajar. El primero encendido lleva la etiqueta "Por defecto".
- Campo de clave. Con clave guardada aparece enmascarada y un botón "Cambiar" la limpia para escribir otra. Un botón "Apagar" quita la clave y el proveedor deja de estar encendido; el diálogo pide confirmación.
- Al escribir o pegar una clave, el diálogo consulta la ruta de modelos con un retardo corto para no consultar en cada tecla. Mientras carga, un indicador. Si responde, un selector con la lista; si falla, el mensaje del error y un campo de texto para escribir el modelo. Con clave guardada y sin cambiar, la consulta usa la clave guardada.
- Sugerencias: encima del selector o del campo, chips con los modelos que ya usan las otras herramientas de la organización para ese proveedor. Un clic selecciona el modelo.
- Esfuerzo con los valores del proveedor. Verbosidad sólo en OpenAI.
- Guardar exige al menos un proveedor encendido con modelo. Si el servidor rechaza una clave repetida, el error aparece dentro del acordeón de ese proveedor.

El guardado del prompt y del formato sigue yendo a `tools` como hoy; el de proveedores va a la ruta nueva. Se hacen en ese orden y, si el segundo falla, el diálogo lo dice y deja el primero guardado.

Las tarjetas de `app/dashboard/configuracion/herramientas/page.tsx` muestran los proveedores encendidos en orden con su modelo, en lugar de las etiquetas actuales. Para eso la página pide los proveedores activos de cada herramienta.

Quién es quién y Preguntas a SillaIA no tienen fila en `tools` hasta que se edita su prompt; la configuración de proveedores va por identidad, así que no la necesitan.

## Cómo corre cada herramienta

Regla común: la página de uso pide los proveedores activos de su herramienta, arma el selector en ese orden y preselecciona el primero. Al ejecutar manda el proveedor elegido. El servidor obtiene con el helper la clave, el modelo, el esfuerzo y la verbosidad, y los aplica al llamar al modelo: `reasoningEffort` y `textVerbosity` en OpenAI, `effort` en Anthropic, `thinkingLevel` en Google. Hoy sólo el Detector aplica el esfuerzo; en el rediseño lo aplican todas.

- **Corrector** (`actions/analyze-text.ts`, `lib/proofreader/correccion-por-frase.ts`). El paso por frase, que hoy usa un modelo fijo de OpenAI si la organización tiene clave de OpenAI, pasa a usarlo si el Corrector tiene OpenAI encendido, con la clave del Corrector. El chequeo con Jev sigue con `TYPESAFE_API_KEY`.
- **Hilos** (`actions/generate-threads/index.ts`). Clave y modelo del proveedor elegido.
- **Resúmenes** (`app/api/tools/generate-resume/route.ts`). La selección de artículos usa el modelo pequeño (`MINI_MODELS`) del proveedor elegido con la clave de Resúmenes; el resumen final usa el modelo configurado.
- **Detector** (`app/api/detector/route.ts`). El modo comparar ofrece como segundo modelo cualquiera de los otros proveedores encendidos del Detector. Los ajustes por proveedor reemplazan la búsqueda actual en `toolConfig.models`.
- **Preguntas a SillaIA** (`app/api/preguntas-chatbot/route.ts`). Sin selector: corre con el primer proveedor del orden. Desaparecen la lectura de `tools.models` que se agregó el 29 de septiembre de 2026 y la validación contra la lista de modelos de la clave.
- **Quién es quién** (`app/api/internal/llm-keys/route.ts`). El servicio externo pide las claves con el token de organización. La ruta pasa a devolver los proveedores de `quien-es-quien` con la misma forma de respuesta que hoy (`provider`, `key`, `models` con el modelo configurado, `status: ACTIVE`), para no tocar el servicio externo. El generador de token manual (`components/modals/org-token-modal.tsx`) queda sólo en la página de administración de organizaciones.
- **Aviso de "falta clave"** (`components/proofreader/api-key-required-modal.tsx`). Pasa a decir que la herramienta no tiene proveedor configurado y enlaza a Herramientas. Se muestra cuando la ruta de proveedores activos devuelve una lista vacía.
- **Costos.** `lib/costos.ts` no cambia. Un modelo escrito a mano que no esté en la tabla de tarifas queda con costo vacío en analíticas, como hoy cualquier modelo desconocido.

## Qué se quita

En el mismo cambio:

- `app/dashboard/configuracion/integraciones/**`, su entrada en `app/dashboard/configuracion/layout.tsx` y `app/dashboard/configuracion/documentacion/configuraciones/integraciones/**`.
- `app/api/integrations/**`, el servicio de claves del cliente, `components/modals/add-api-key-modal.tsx`, el modal de activar y desactivar, y `app/dashboard/detector-de-mentiras/hooks/useApiKeyStatus.ts`.
- En `app/api/organization/create/route.ts` y en `app/dashboard/admin/organizaciones/page.tsx` deja de pedirse proveedor y clave: una organización nueva nace sin claves.
- `lib/utils.ts` conserva `DEFAULT_MODELS` para el valor por defecto de Preguntas a SillaIA y `MINI_MODELS` para Resúmenes; `MODELS` (etiquetas) deja de usarse porque el modelo se muestra por su nombre.

## Orden de salida

1. **Con el despliegue.** Migración `create_herramienta_proveedores.sql`: la tabla, el índice único y la política. Nada se borra. Las herramientas quedan sin proveedores hasta que se configuren.
2. **Una semana después**, cuando La Silla Vacía ya haya configurado sus herramientas. Migración `drop_api_key_table_y_columnas_models.sql`: borra `api_key_table` y las columnas `models`, `reasoning_effort` y `verbosity` de `tools` y `default_tools`. Hasta entonces el código nuevo no las lee, y si algo sale mal se puede volver a la versión anterior sin perder datos.

## Verificación

El repo no tiene pruebas. Se agrega Vitest, con un script `test` en `package.json`, y se cubre sólo lógica pura:

- Enmascarado de claves.
- Validación del cuerpo de guardado: valores de esfuerzo y verbosidad por proveedor, `conservarClave` sin fila, lista vacía.
- Normalización del orden de proveedores (posiciones consecutivas desde 0).
- Filtros de la lista de modelos por proveedor, con respuestas de ejemplo de cada API.

Rutas y páginas se verifican con `tsc --noEmit` y eslint contra la línea base, más esta lista manual en el entorno con datos:

1. Abrir Herramientas como OWNER, entrar al Corrector, pegar una clave de OpenAI y otra de Anthropic, ver que cargan sus listas de modelos, elegir uno en cada una, reordenar con las flechas y guardar.
2. Volver a abrir: las claves aparecen enmascaradas, el orden se conserva, la etiqueta "Por defecto" está en el primero.
3. Entrar a Hilos: las chips sugieren los modelos del Corrector. Pegar la misma clave del Corrector y confirmar que el guardado la rechaza nombrando al Corrector.
4. Usar el Corrector con cada proveedor. Usar el Detector en modo comparar con dos proveedores.
5. Apagar un proveedor y confirmar que desaparece del selector de la página de uso.
6. Quitar todos los proveedores de una herramienta y confirmar que aparece el aviso que manda a Herramientas.
7. Configurar Quién es quién y generar un perfil.
8. Confirmar que Integraciones ya no aparece en Ajustes y que crear una organización desde administración no pide clave.
