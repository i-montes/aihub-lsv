/**
 * El texto del post de Facebook adaptado a Instagram. Vive aparte de instagram.ts (que usa sharp)
 * porque también lo usa la pantalla para mostrar cómo queda.
 *
 * Los links no se pueden cliquear en el caption de Instagram, así que se quita el de la nota y
 * queda sólo el texto, sin agregar nada (decisión editorial). El caption admite hasta 2.200
 * caracteres.
 */

const MAXIMO_CAPTION = 2200;

export function textoInstagram(texto: string, url: string): string {
  const sinLink = (url ? texto.split(url).join("") : texto).replace(/\n{3,}/g, "\n\n").trim();
  return Array.from(sinLink).slice(0, MAXIMO_CAPTION).join("");
}
