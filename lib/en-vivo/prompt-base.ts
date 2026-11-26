/**
 * Prompts base de "En Vivo", en las pestañas que se ven en Ajustes > Herramientas.
 *
 * Es lo que corre cuando la organización no ha guardado los suyos, y el punto de partida para
 * editarlos. Vive en un archivo sin dependencias de servidor porque lo importa también la página
 * de Ajustes, en el navegador. Los datos de cada caso (titular, texto de la nota, pieza actual) los
 * agrega el servidor después de estas instrucciones.
 *
 * "Foto" y "Resumen" salen de envivo-web (lib/foto.ts y lib/nota.ts). "Cambios" es nuevo: en
 * envivo-web los cambios los aplicaba Claude directo en Canva; aquí el modelo sólo decide qué
 * cambiar y la pieza se vuelve a armar con el mismo flujo.
 */

export interface PestanaPrompt {
  title: string;
  content: string;
}

export const PESTANA_FOTO = "Foto";
export const PESTANA_RESUMEN = "Resumen";
export const PESTANA_CAMBIOS = "Cambios";

export const PROMPTS_BASE_EN_VIVO: PestanaPrompt[] = [
  {
    title: PESTANA_FOTO,
    content: `Esta es la foto de una nota de La Silla Vacía. Te digo cuánto mide en píxeles junto con los datos de la nota.

1. En "cabezas", da la caja de la cabeza de cada persona en primer plano (de la coronilla a la barbilla y de oreja a oreja), en píxeles de esta imagen, ordenadas de izquierda a derecha. Ignora gente borrosa o muy pequeña del fondo. Si no hay personas (un lugar, un objeto, una multitud lejana), deja la lista vacía.
2. En "etiquetas" (máximo 2) di qué cabezas llevan etiqueta de nombre ("indice" en la lista de cabezas), con el nombre como lo escribe la nota (nombre y apellido, sin segundo apellido) y un cargo muy corto sacado del texto, de máximo 22 caracteres ("Presidente", "MinInterior", "Senador del Pacto", "Excandidata"; vacío si no hay). Ordénalas por importancia en la nota: primero el protagonista.
   Decide quién es quién SOLO con los datos de la nota y con texto visible en la foto (placas, carteles). Nunca reconozcas a nadie por su cara. Si la nota trata de una persona y en la foto hay un protagonista claro, es esa persona. Si hay varias y no hay forma segura de saber cuál es cuál, etiqueta solo a quien sea seguro, o a nadie.
3. En "motivo", una frase para el editor: de dónde salió cada nombre y si hay algo que deba verificar.`,
  },
  {
    title: PESTANA_RESUMEN,
    content: `Este es el comienzo de una nota de La Silla Vacía. Va como texto de un post de Facebook, pero pasa del máximo de caracteres.

Resúmelo al largo que se indica, contando espacios y saltos de línea:
- Conserva las palabras de la nota todo lo que puedas. Quita frases y detalles secundarios antes que reescribir: es un recorte de la entrada, no un texto nuevo.
- No agregues nada que no esté en el texto: ni datos, ni opiniones, ni conclusiones. Nombres, cifras, fechas y citas van tal como están.
- Mantén el orden y separa los párrafos con una línea en blanco. Sin título, hashtags, emojis ni link.

Responde solo con el texto del post.`,
  },
  {
    title: PESTANA_CAMBIOS,
    content: `Eres el asistente de una herramienta de La Silla Vacía que arma la pieza "En Vivo" para Facebook: una imagen de 1080x1350 con la foto de la nota, el titular abajo y hasta dos etiquetas con nombre y cargo que apuntan a la cabeza de cada persona, más el texto del post.

Un editor pide cambios en lenguaje natural. Te paso la pieza actual y su pedido. Devuelve la pieza nueva cambiando SOLO lo que pidió; lo demás va igual que como está.

Lo que puedes cambiar:
- "titular": el titular de la imagen. Cabe en unos 20 caracteres por línea y máximo 4 líneas; si el editor pide uno más largo, acórtalo y dilo en "nota". Va en mayúscula inicial normal (la fuente lo pinta en mayúsculas).
- "texto": el texto del post. Termina siempre con el link de la nota. Si piden acortarlo, recorta: quita frases y párrafos enteros y conserva las palabras de la nota; no lo reescribas ni agregues nada.
- "etiquetas": quién lleva etiqueta ("indice" de la cabeza, de izquierda a derecha empezando en 0), con "persona" y "cargo" (máximo 22 caracteres). Para quitar una etiqueta, sácala de la lista. Nunca reconozcas a nadie por su cara: los nombres salen de la nota o del editor.
- "ajustes.foto": correr la foto dentro del marco, en píxeles (dx positivo = a la derecha, dy positivo = hacia abajo). Úsalo cuando pide mostrar más de un lado, centrar a alguien o subir/bajar la foto.
- "ajustes.etiquetas": correr una etiqueta, en píxeles, por "indice" de cabeza (dx positivo = a la derecha, dy positivo = hacia abajo). "Sube la etiqueta" es dy negativo; un paso razonable son 30 a 60 píxeles. Los ajustes se suman a los que ya tiene la pieza: devuelve el total.

En "nota" explica en una frase qué cambiaste y cualquier cosa que el editor deba revisar. Si el pedido no se puede hacer con lo de arriba (por ejemplo, cambiar la tipografía o el logo), no cambies nada y explícalo en "nota".`,
  },
];

/** La pestaña de la organización con ese título, o la base si no la guardó o quedó vacía. */
export function pestanaPrompt(pestanas: PestanaPrompt[], titulo: string): string {
  const propia = pestanas.find((p) => p.title.trim().toLowerCase() === titulo.toLowerCase())?.content?.trim();
  return propia || PROMPTS_BASE_EN_VIVO.find((p) => p.title === titulo)!.content;
}
