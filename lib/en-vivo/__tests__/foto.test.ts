import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/en-vivo/almacen", async () => (await import("./almacen-memoria")).almacenEnMemoria());

import { archivos, pngLiso } from "./almacen-memoria";
import { fotoDeLaNota, fotoSubida } from "../foto";
import type { Nota } from "../tipos";

const MB = 1024 * 1024;
const nota = (fotoAlta: string, foto = "") => ({ fotoAlta, foto }) as Nota;

const respuesta = (cuerpo: BodyInit | null, tipo: string, extra: Record<string, string> = {}) =>
  new Response(cuerpo, { status: 200, headers: { "content-type": tipo, ...extra } });

/** Un cuerpo sin Content-Length que manda `n` pedazos de 1 MB. */
function cuerpoInfinito(n: number, alCancelar: () => void) {
  let enviados = 0;
  return new ReadableStream<Uint8Array>({
    pull(c) {
      if (enviados++ >= n) return c.close();
      c.enqueue(new Uint8Array(MB));
    },
    cancel: alCancelar,
  });
}

let jpeg: Buffer;
const fetchFalso = vi.fn<typeof fetch>();

beforeEach(async () => {
  archivos.clear();
  jpeg = await sharp(await pngLiso(3000, 2000)).jpeg().toBuffer();
  fetchFalso.mockReset();
  vi.stubGlobal("fetch", fetchFalso);
});
afterEach(() => vi.unstubAllGlobals());

describe("fotoDeLaNota", () => {
  it("baja la foto, la reduce a 2400 de lado y la guarda", async () => {
    fetchFalso.mockResolvedValue(respuesta(new Uint8Array(jpeg), "image/jpeg"));
    const f = await fotoDeLaNota(nota("https://www.lasillavacia.com/wp-content/uploads/foto%20alta.jpg"));
    expect(f).toMatchObject({ ancho: 2400, alto: 1600, nombre: "foto alta.jpg" });
    expect(archivos.has(f!.archivo)).toBe(true);
    // Con timeout.
    expect(fetchFalso.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
  });

  it("si la de alta no es una imagen, prueba con la otra", async () => {
    fetchFalso.mockResolvedValueOnce(respuesta("<html>", "text/html")).mockResolvedValueOnce(respuesta(new Uint8Array(jpeg), "image/jpeg"));
    expect(await fotoDeLaNota(nota("https://x/alta.jpg", "https://x/og.jpg"))).not.toBeNull();
    expect(fetchFalso).toHaveBeenCalledTimes(2);
  });

  it("descarta una foto que dice pesar más de 25 MB sin leerla", async () => {
    fetchFalso.mockResolvedValue(respuesta(null, "image/jpeg", { "content-length": String(30 * MB) }));
    expect(await fotoDeLaNota(nota("https://x/enorme.jpg"))).toBeNull();
  });

  it("deja de leer apenas pasa de 25 MB aunque no diga cuánto pesa", async () => {
    const cancelar = vi.fn();
    fetchFalso.mockResolvedValue(respuesta(cuerpoInfinito(1000, cancelar), "image/jpeg"));
    expect(await fotoDeLaNota(nota("https://x/sin-largo.jpg"))).toBeNull();
    expect(cancelar).toHaveBeenCalled();
  });

  it("si la red falla o tarda demasiado, devuelve null", async () => {
    fetchFalso.mockRejectedValue(new DOMException("The operation was aborted due to timeout", "TimeoutError"));
    expect(await fotoDeLaNota(nota("https://x/lenta.jpg"))).toBeNull();
  });
});

describe("fotoSubida", () => {
  it("acepta un data URL de imagen", async () => {
    const f = await fotoSubida(`data:image/jpeg;base64,${jpeg.toString("base64")}`, "mia.jpg");
    expect(f).toMatchObject({ ancho: 2400, alto: 1600, nombre: "mia.jpg" });
  });

  it.each([
    ["algo que no es data URL", "hola"],
    ["un data URL que no es imagen", `data:text/plain;base64,${Buffer.from("x").toString("base64")}`],
    ["una imagen dañada", `data:image/png;base64,${Buffer.from("no soy png").toString("base64")}`],
  ])("rechaza %s", async (_, dato) => {
    await expect(fotoSubida(dato, "x")).rejects.toThrow(/No se pudo leer la foto/);
  });

  it("rechaza una foto de más de 4 MB", async () => {
    await expect(fotoSubida(`data:image/jpeg;base64,${Buffer.alloc(5 * MB).toString("base64")}`, "x")).rejects.toThrow(/pesa demasiado/);
  });
});
