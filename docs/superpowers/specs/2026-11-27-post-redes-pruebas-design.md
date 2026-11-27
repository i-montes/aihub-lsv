# Post redes: pruebas automáticas

Fecha: 27 de noviembre de 2026. Rama: `feat/post-redes` (PR #27).

## Qué se hizo

Se agregaron 130 pruebas con vitest para Post redes. Cubren cómo funciona la herramienta y los arreglos de la revisión del PR (ver `2026-11-27-post-redes-revision-pr-design.md`). Corren con `pnpm test`, junto con las que ya había, y no llaman a la red, a Supabase ni a Meta:
- **Supabase:** el almacén, `herramienta_conexiones` y `analytics_en_vivo` se simulan en memoria o en una carpeta temporal.
- **Meta y la red:** se simulan `fetch` y las llamadas a Graph.

`lib/en-vivo/__tests__/almacen-memoria.ts` es el almacén en memoria que comparten las pruebas.

| Archivo | Qué prueba |
| --- | --- |
| `lib/en-vivo/__tests__/almacen.test.ts` | Guardar y leer archivos; ids inválidos (`../`). Reservar una marca es atómico (de 8 a la vez pasa uno). Nombres de marca inválidos. En Vercel sin bucket falla. |
| `lib/en-vivo/__tests__/publicaciones.test.ts` | No publicar dos veces: segundo intento, dos a la vez, reintento después de un error, intento cortado. La marca depende de la red, la organización, la imagen y la segunda foto. |
| `lib/en-vivo/__tests__/conexiones.test.ts` | Tokens de Facebook y Canva cifrados en la base, sin cifrar dos veces. Sin clave: en Vercel falla sin escribir; en local va sólo al archivo. Instagram va sin clave. El estado que ve el navegador no trae el token. Comportamiento sin la tabla. |
| `lib/en-vivo/__tests__/plantilla.test.ts` | Titular normal (se dibuja y no toca la foto). Palabras larguísimas y links (no rompe, avisa si se achicó). Titular de más de 4 renglones. Etiquetas con nombres largos. Que se use MARTIN. |
| `lib/en-vivo/__tests__/pieza.test.ts` | `piezaConfiable` con una pieza falsa: medidas reales, números acotados, ids inválidos fuera. `armar` con foto, sin foto, y moviendo sólo una etiqueta (reutiliza la base). |
| `lib/en-vivo/__tests__/foto.test.ts` | Foto de la nota: timeout, no imagen, más de 25 MB con y sin `Content-Length`, error de red. Foto subida: formatos y tamaño. |
| `lib/en-vivo/__tests__/evidencia.test.ts` | Diseño de la segunda foto (fondo morado, logo, foto centrada). Links a la red interna, `localhost`, la IP de metadatos de la nube, IPv6 y ftp se rechazan sin bajarlos. Link que no es imagen. Foto de más de 10 MB. |
| `lib/en-vivo/__tests__/instagram.test.ts` | Una imagen y carrusel (orden y texto). Plazo vencido o imagen con error: no publica. Permalink de respaldo. |
| `lib/en-vivo/__tests__/facebook.test.ts` | Fotos sin publicar adjuntas en orden. Token vencido pide reconectar. Origen público del túnel. URL de login con los permisos de Instagram. |
| `lib/en-vivo/__tests__/textos-y-links.test.ts` | Texto de Instagram (sin link, 2.200 caracteres, emojis). Links públicos firmados (otro archivo, firma falsa, vencido). Links de nota. Sólo La Silla Vacía ve Post redes; Orza no. |
| `lib/en-vivo/__tests__/acceso-y-analytics.test.ts` | Acceso: La Silla entra, Orza no, sin sesión. Roles de administrador. Analíticas con el cliente de servicio; `analyticsPropia` rechaza filas de otra organización o de otro usuario, ids raros e ids que no existen. |
| `app/api/en-vivo/publicar/__tests__/route.test.ts` | La ruta de publicar: acceso, una vez por red, dos clics a la vez, segunda foto en las dos redes, plazo de Instagram, una red falla y la otra no, token vencido, errores de pedido, analíticas sólo propias. |
| `app/api/en-vivo/facebook/login/__tests__/route.test.ts` | Cualquier miembro (USER, ADMIN, OWNER) va al diálogo de Facebook con un `state`. Otra organización no. |
| `app/api/en-vivo/facebook/callback/__tests__/route.test.ts` | Elección de página con y sin `META_PAGE_ID`, en Vercel y en local. Cualquier miembro conecta, no sólo los administradores. `state` inválido. Otra organización no llega a canjear el código. |

## Cómo se probó que las pruebas sirven

Se puso la versión anterior a los arreglos de `plantilla.ts`, `conexiones.ts`, `foto.ts`, `analytics.ts` y las rutas de publicar y de la vuelta de Facebook. Fallaron 26 pruebas, al menos una por cada problema de la revisión. Con los arreglos pasan todas: 171, contando las 41 que ya había.

## Fuera de alcance

- **La pantalla** (`app/dashboard/en-vivo/page.tsx`): el repo no tiene pruebas de componentes de React.
- **Leer la nota por WordPress, la visión con el modelo y los cambios con el modelo:** dependen de servicios externos y se probaron a mano en local.
