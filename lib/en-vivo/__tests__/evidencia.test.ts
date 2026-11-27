import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/en-vivo/almacen", async () => (await import("./almacen-memoria")).almacenEnMemoria());

import { archivos, pngLiso } from "./almacen-memoria";
import { armarEvidencia } from "../evidencia";

const fetchFalso = vi.fn<typeof fetch>();

beforeEach(() => {
  archivos.clear();
  fetchFalso.mockReset();
  vi.stubGlobal("fetch", fetchFalso);
});
afterEach(() => vi.unstubAllGlobals());

async function pixel(png: Buffer, left: number, top: number) {
  const d = await sharp(png).extract({ left, top, width: 1, height: 1 }).removeAlpha().raw().toBuffer();
  return [...d];
}

describe("segunda foto (evidencia)", () => {
  it("arma 1080x1350 con el fondo morado, el logo arriba y la foto en el centro", async () => {
    const foto = await pngLiso(800, 600, "#ff0000");
    const id = await armarEvidencia({ datos: `data:image/png;base64,${foto.toString("base64")}`, nombre: "doc.png" });
    const png = archivos.get(id)!;
    const { width, height } = await sharp(png).metadata();
    expect({ width, height }).toEqual({ width: 1080, height: 1350 });
    expect(await pixel(png, 5, 5)).toEqual([0x4a, 0x45, 0x95]);
    expect(await pixel(png, 540, 740)).toEqual([255, 0, 0]);
    // El logo (crema) está arriba a la derecha.
    const logo = await sharp(png).extract({ left: 725, top: 62, width: 301, height: 46 }).removeAlpha().raw().toBuffer();
    expect(Math.max(...logo)).toBeGreaterThan(200);
  });

  it("baja la foto de un link público", async () => {
    fetchFalso.mockResolvedValue(new Response(new Uint8Array(await pngLiso(400, 400)), { headers: { "content-type": "image/png" } }));
    const id = await armarEvidencia({ url: "https://www.lasillavacia.com/foto.png" });
    expect(archivos.has(id)).toBe(true);
  });

  it.each([
    ["localhost", "http://localhost:3000/foto.png"],
    ["una IP interna", "http://10.0.0.5/foto.png"],
    ["la red de la casa", "http://192.168.1.10/foto.png"],
    ["metadatos de la nube", "http://169.254.169.254/latest/meta-data"],
    ["IPv6", "http://[::1]/foto.png"],
    ["ftp", "ftp://servidor/foto.png"],
    ["algo que no es link", "no soy un link"],
  ])("rechaza %s sin bajarla", async (_, url) => {
    await expect(armarEvidencia({ url })).rejects.toThrow();
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it("rechaza un link que no lleva a una imagen", async () => {
    fetchFalso.mockResolvedValue(new Response("<html>", { headers: { "content-type": "text/html" } }));
    await expect(armarEvidencia({ url: "https://www.lasillavacia.com/nota" })).rejects.toThrow(/no lleva a una imagen/);
  });

  it("rechaza una foto de más de 10 MB", async () => {
    fetchFalso.mockResolvedValue(new Response(null, { headers: { "content-type": "image/jpeg", "content-length": String(11 * 1024 * 1024) } }));
    await expect(armarEvidencia({ url: "https://x.com/grande.jpg" })).rejects.toThrow(/pesa demasiado/);
  });
});
