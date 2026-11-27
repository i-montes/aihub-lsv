import { randomBytes } from "crypto";

/**
 * Un almacén en memoria con la misma interfaz que `lib/en-vivo/almacen.ts`, para las pruebas que
 * no son del almacén. Se usa con:
 *
 *   vi.mock("@/lib/en-vivo/almacen", async () => (await import("./almacen-memoria")).almacenEnMemoria());
 *
 * `archivos` es el mismo Map para la prueba y para el código probado.
 */

export const archivos = new Map<string, Buffer>();

const ID = /^[0-9a-f]{32}\.(png|jpg)$/;

export function almacenEnMemoria() {
  return {
    esIdValido: (id: string) => ID.test(id),
    tipoDe: (id: string) => (id.endsWith(".png") ? "image/png" : "image/jpeg"),
    guardarArchivo: async (datos: Buffer, tipo: "png" | "jpg") => {
      const id = `${randomBytes(16).toString("hex")}.${tipo}`;
      archivos.set(id, datos);
      return id;
    },
    leerArchivo: async (id: string) => (ID.test(id) ? (archivos.get(id) ?? null) : null),
    reservarMarca: async (nombre: string, contenido: unknown) => {
      if (archivos.has(nombre)) return false;
      archivos.set(nombre, Buffer.from(JSON.stringify(contenido)));
      return true;
    },
    escribirMarca: async (nombre: string, contenido: unknown) => {
      archivos.set(nombre, Buffer.from(JSON.stringify(contenido)));
    },
    leerMarca: async (nombre: string) => {
      const d = archivos.get(nombre);
      return d ? JSON.parse(d.toString("utf8")) : null;
    },
    borrarMarca: async (nombre: string) => {
      archivos.delete(nombre);
    },
  };
}

/** Un PNG de color liso, para usar de foto o de pieza. */
export async function pngLiso(width: number, height: number, color = "#808080"): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  return sharp({ create: { width, height, channels: 3, background: color } }).png().toBuffer();
}
