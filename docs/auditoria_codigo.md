# Estatus del proyecto — auditoría completa

Revisé todo el proyecto con tres pasadas en paralelo (FranBot a fondo, código muerto, y el resto de herramientas). Verifiqué personalmente los hallazgos más graves. El resumen ejecutivo: **FranBot tiene dos bugs de código que explican la mayoría de sus fallas de estilo conocidas**, hay **tres problemas de seguridad serios** en el resto del proyecto, y hay una cantidad considerable de código muerto y duplicado. Todo lo de abajo está verificado con archivo y línea.

---

## 🔴 FranBot (corrector de estilo) — la causa raíz de sus fallas

Las fallas documentadas en `docs/prompt_auditoria_franbot_fable.md` ("gobierno" en mayúscula, siglas tipo FARC sin convertir a Farc, sobre-corrección de cifras) tienen origen en el **código**, no solo en el prompt:

1. **La guía de estilo puede estar entrando vacía al prompt.** En `actions/analyze-text.ts:337-340` el ensamblado busca prompts por título exacto y sensible a mayúsculas/acentos: `"Principal"` y `"Guia de estilo"` (sin tilde). Si en la tabla de tools el prompt se llama "Guía de estilo", "Manual de estilo" o cualquier variante, la sección de guía queda vacía **sin ningún aviso**, y el modelo cae en español estándar RAE — exactamente el comportamiento que están viendo. Además, el diálogo de configuración (`components/tools/edit-tool-dialog.tsx:76-84`) crea tools solo con el prompt "Principal". *Vale la pena revisar ya mismo en Supabase cómo se llama ese prompt.*

2. **Se envía el HTML completo al modelo, no texto plano.** En `app/dashboard/corrector/page.tsx:515-516` la línea que extraía texto plano está comentada y se manda `getHTML()`, aunque el prompt exige texto plano. Esto infla tokens, hace que el modelo devuelva fragmentos con markup en `original`, y rompe el paso siguiente:

3. **Resaltar/aplicar sugerencias falla en silencio.** `findAndHighlightText` busca con `indexOf` dentro de un solo nodo de texto (`page.tsx:146-197`). Si la corrección cruza una negrita/enlace o difiere en un espacio, no pasa nada al hacer clic — sin error, sin toast. El usuario percibe la app como rota.

4. **Parsing frágil de la respuesta de la IA.** Se usa `generateText` + regex `\{[\s\S]*\}` (`analyze-text.ts:450-471`) en vez de `generateObject` con el schema Zod que ya existe en el mismo archivo. Y no se fija `maxOutputTokens`, así que artículos largos truncan el JSON a la mitad → el usuario recibe "Error al procesar la respuesta del modelo" sin correcciones.

5. **Menores pero visibles:** el tipo `punctuation` que el backend emite no existe en la UI (se muestra como "Estilo" con badge sin color — `types/proofreader.ts:1`, `suggestion-item.tsx:18-22`); el panel "Texto Corregido" muestra en realidad el texto original (`page.tsx:555`); los puntajes de gramática/legibilidad son inventados (`100 − errores×k`, `page.tsx:573-585`); y todos los errores (key inválida, rate limit, JSON malo) colapsan en el mismo mensaje genérico.

**Orden de arreglo sugerido:** (1) garantizar que la guía de estilo entra al prompt, (2) enviar texto plano, (3) `generateObject` + `maxOutputTokens`, (4) normalizar la búsqueda de texto al resaltar/aplicar.

---

## 🔴 Seguridad (resto del proyecto) — atender pronto

1. **`getSupabaseRouteHandler` usa la SERVICE ROLE KEY** (`lib/supabase/server.ts:63`), es decir, todas las rutas que lo usan (`/api/detector`, `/api/tools/generate-resume`, analytics) **saltan Row Level Security** por completo.
2. **Cualquier usuario autenticado puede unirse a cualquier organización**: `/api/profile/update-organization` acepta el `organizationId` del body sin validar invitación (`route.ts:9-61`). Con eso accede a las API keys y credenciales de WordPress de otra organización.
3. **SSRF sin autenticación** en `/api/url-metadata` (`route.ts:52-124`): cualquiera puede hacer que el servidor consulte URLs internas y devuelva el contenido.
4. **XSS potencial** en el generador de resúmenes: `dangerouslySetInnerHTML` con `marked()` sin sanitizar (`generador-resumen/page.tsx:895`).
5. El borrado de usuarios admin no valida que el objetivo sea de la misma organización, y borra en auth antes que el perfil (`app/api/admin/users/delete/route.ts`).

---

## 🟠 Bugs funcionales que afectan output de usuarios hoy

- **`/api/content` está roto siempre**: falta un `await` en `getSupabaseServer()` (`app/api/content/route.ts:9,50`) → 500 en listar/crear contenido.
- **El detector de mentiras ignora las imágenes subidas**: se envían en formato de la API cruda de Anthropic, que el AI SDK descarta silenciosamente (`app/api/detector/route.ts:340-371`). El análisis se hace sin las imágenes y nadie se entera.
- **Editar "enlaces útiles" siempre devuelve 404**: el PUT consulta la columna inexistente `organization_id` en profiles (`app/api/useful-links/route.ts:155,197`).
- **Generador de hilos**: race condition al cargar la API key — el `useEffect` corre antes de que el perfil esté disponible y muestra el modal "API key requerida" erróneamente (`generador-hilos/page.tsx:301-303`).
- **Generador de resúmenes**: la página 1 se pide con una categoría (`"4932"`) y las siguientes con tres (`generador-resumen/page.tsx:122` vs `:182`) → corpus incompleto/inconsistente.
- **Boletín**: si la generación falla, el usuario ve una vista previa vacía sin mensaje (`boletin/page.tsx:236-272`); además cada página del PDF se manda como PNG base64 en el body del server action, que revienta el límite de ~1MB con PDFs de varias páginas.
- **Analytics de tokens siempre en null**: el código lee `usage.promptTokens`/`completionTokens`, pero AI SDK v6 usa `inputTokens`/`outputTokens` (en `generate-threads/index.ts:342`, `analyze-text.ts:563`, `generate-resume/route.ts:944`). Igual con `maxTokens` vs `maxOutputTokens` en el boletín — los límites se ignoran.
- **⚠️ `vercel.json` reescribe TODO a `/index.html`** — lo verifiqué: `{"rewrites":[{"source":"/(.*)","destination":"/index.html"}]}`. Es un residuo del scaffolding de v0, contradictorio con Next.js. Si Vercel lo está aplicando, es una bomba; hay que revisarlo y casi seguro borrarlo junto con `index.html`.

---

## 🟡 Código muerto y huérfano

**Seguro borrar (0 referencias, verificado):**
`lib/supabase/auth.ts`, `types/prompt.ts`, `utils/pdf-converter.ts`, `components/modals/delete-api-key-modal.tsx`, `components/proofreader/statistics.tsx`, `components/proofreader/wordpress-search-dialog.tsx`, `components/theme-provider.tsx`, `components/thread-generator/thread-options.tsx`, `components/tools/usage-stats.tsx`, `components/ui/progress.tsx`, `actions/analytics-corrector.ts` (duplicado del de `update-analytics.ts`), y `actions/generate-resume.ts` (server action muerta — el frontend usa la API route; la versión muerta además tiene bugs propios).

**Rutas API sin consumidores:** `api/profile/get`, `api/tools/models` (además tiene un `return` prematuro que deja todo su código de auth inalcanzable), `api/wordpress/oauth/disconnect` y `api/wordpress/oauth/token`.

**Páginas huérfanas de navegación** (existen pero nada las enlaza — confirmar si se quieren reconectar o borrar): `dashboard/actividad`, `dashboard/contenido`, `dashboard/organizacion`, `dashboard/perfil`, `dashboard/analiticas`.

**Duplicaciones:** `hooks/use-toast.ts` y `components/ui/use-toast.ts` son idénticos byte a byte; y hay dos árboles de documentación paralelos (`app/documentacion/**` vs `app/dashboard/configuracion/documentacion/**`) con el mismo contenido.

**No tocar aunque parezcan sospechosos:** `proxy.ts` (es el middleware de Next 16), `actions/generate-threads/examples/*` (sí se usan), `api/wordpress/oauth/callback` (destino de redirección OAuth).

---

## 🔵 Deuda estructural

Cada herramienta reimplementa el mismo bloque de ~150 líneas (auth → perfil → API key → tool config), por eso los mismos bugs (tokens v6, service role) están copiados en cinco sitios — extraerlo a un helper compartido arreglaría todos de una vez. Los nombres de modelos están hardcodeados en `lib/utils.ts` y se desincronizan con la BD (UI muestra `undefined`). Y quedaron varios `console.log` de depuración en producción, incluyendo uno que vuelca el prompt completo con el texto del usuario.

---

**Mi recomendación de prioridades:** (1) los dos fixes de FranBot (guía de estilo + texto plano) porque explican las quejas actuales de usuarios; (2) el `vercel.json` y los tres huecos de seguridad; (3) los bugs funcionales rotos hoy (`/api/content`, imágenes del detector, enlaces útiles); (4) la limpieza de código muerto como PR aparte. Si quieres, arranco con los fixes de FranBot.