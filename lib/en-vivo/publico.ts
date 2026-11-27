import { createHash, createHmac, timingSafeEqual } from "crypto";

/**
 * Enlaces públicos firmados a un archivo del almacén, para quien tiene que bajarlo por URL sin
 * sesión: Instagram, que no acepta la imagen como archivo (sólo `image_url`).
 *
 * La firma es un HMAC del id y el vencimiento. La clave es EN_VIVO_FIRMA_CLAVE o, si no está,
 * una derivada de SUPABASE_SERVICE_ROLE_KEY, que sólo existe en el servidor.
 */

const UNA_HORA_S = 60 * 60;

function clave(): string {
  const propia = process.env.EN_VIVO_FIRMA_CLAVE?.trim();
  if (propia) return propia;
  const servicio = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!servicio) throw new Error("Falta EN_VIVO_FIRMA_CLAVE para firmar enlaces públicos.");
  return createHash("sha256").update(`en-vivo-publico:${servicio}`).digest("hex");
}

const firmar = (id: string, vence: number) => createHmac("sha256", clave()).update(`${id}:${vence}`).digest("hex");

/** URL pública a `/api/en-vivo/publico/[id]`, válida una hora. */
export function urlPublica(origen: string, id: string, duracionS = UNA_HORA_S): string {
  const vence = Math.floor(Date.now() / 1000) + duracionS;
  return `${origen}/api/en-vivo/publico/${id}?vence=${vence}&firma=${firmar(id, vence)}`;
}

export function firmaValida(id: string, vence: string | null, firma: string | null): boolean {
  const v = Number(vence);
  if (!vence || !firma || !Number.isFinite(v) || v < Date.now() / 1000) return false;
  const esperada = Buffer.from(firmar(id, v));
  const recibida = Buffer.from(firma);
  return esperada.length === recibida.length && timingSafeEqual(esperada, recibida);
}
