import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/en-vivo/almacen", async () => (await import("@/lib/en-vivo/__tests__/almacen-memoria")).almacenEnMemoria());

const acceso = vi.fn();
vi.mock("@/lib/en-vivo/acceso", () => ({ verificarAccesoEnVivo: () => acceso() }));

const conexiones = { facebook: null as unknown, instagram: null as unknown };
const marcarFacebookDesconectado = vi.fn(async () => {});
vi.mock("@/lib/en-vivo/conexiones", () => ({
  conexionFacebook: async () => conexiones.facebook,
  conexionInstagram: async () => conexiones.instagram,
  marcarFacebookDesconectado: () => marcarFacebookDesconectado(),
}));

const publicarFb = vi.fn();
vi.mock("@/lib/en-vivo/facebook", async (original) => ({
  ...(await original<typeof import("@/lib/en-vivo/facebook")>()),
  publicar: (...a: unknown[]) => publicarFb(...a),
}));

const publicarIg = vi.fn();
vi.mock("@/lib/en-vivo/instagram", () => ({
  publicarEnInstagram: (...a: unknown[]) => publicarIg(...a),
  textoInstagram: (t: string) => `IG: ${t}`,
}));

const analytics = { fila: null as null | { updateSchema: ReturnType<typeof vi.fn> } };
const analyticsPropia = vi.fn(async () => analytics.fila);
vi.mock("@/lib/analytics", () => ({ analyticsPropia: (...a: unknown[]) => analyticsPropia(...(a as [])) }));

import { archivos, pngLiso } from "@/lib/en-vivo/__tests__/almacen-memoria";
import { ErrorMeta } from "@/lib/en-vivo/facebook";
import { POST } from "../route";

const IMAGEN = `${"a".repeat(32)}.png`;
const SEGUNDA = `${"e".repeat(32)}.png`;
const FB = { pageId: "pag", pageName: "La Silla Vacía", pageToken: "tok", estado: "conectado" };
const IG = { igUserId: "ig1", usuario: "@lasillavacia", pageId: "pag" };

const pedir = async (body: Record<string, unknown>) => {
  const r = await POST(new NextRequest("http://localhost/api/en-vivo/publicar", { method: "POST", body: JSON.stringify(body) }));
  return { status: r.status, json: await r.json() };
};
const pedido = (extra: Record<string, unknown> = {}) => ({ imagen: IMAGEN, texto: "El texto", url: "https://www.lasillavacia.com/n", redes: ["facebook"], ...extra });

beforeEach(async () => {
  archivos.clear();
  archivos.set(IMAGEN, await pngLiso(10, 10));
  archivos.set(SEGUNDA, await pngLiso(10, 10));
  acceso.mockResolvedValue({ negado: null, organizationId: "silla", userId: "u1", role: "USER" });
  conexiones.facebook = FB;
  conexiones.instagram = IG;
  publicarFb.mockReset().mockResolvedValue({ postId: "p1", link: "https://facebook.com/p1" });
  publicarIg.mockReset().mockResolvedValue({ mediaId: "m1", link: "https://instagram.com/p/m1" });
  marcarFacebookDesconectado.mockClear();
  analytics.fila = null;
  analyticsPropia.mockClear();
});

describe("POST /api/en-vivo/publicar", () => {
  it("niega el paso a quien no tiene la herramienta", async () => {
    acceso.mockResolvedValue({ negado: { mensaje: "Tu organización no tiene habilitada esta herramienta", status: 403 } });
    expect((await pedir(pedido())).status).toBe(403);
    expect(publicarFb).not.toHaveBeenCalled();
  });

  it("publica en Facebook", async () => {
    const r = await pedir(pedido());
    expect(r.json.resultados).toEqual([{ red: "facebook", ok: true, link: "https://facebook.com/p1", yaEstaba: false }]);
    expect(publicarFb).toHaveBeenCalledWith(FB, [expect.any(Buffer)], "El texto", "envivo");
  });

  it("el mismo pedido dos veces publica una sola vez", async () => {
    await pedir(pedido());
    const r = await pedir(pedido());
    expect(r.json.resultados[0]).toMatchObject({ ok: true, yaEstaba: true, link: "https://facebook.com/p1" });
    expect(publicarFb).toHaveBeenCalledTimes(1);
  });

  it("dos clics a la vez publican una sola vez", async () => {
    publicarFb.mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 30));
      return { postId: "p1", link: "https://facebook.com/p1" };
    });
    const [a, b] = await Promise.all([pedir(pedido()), pedir(pedido())]);
    expect(publicarFb).toHaveBeenCalledTimes(1);
    expect([a.json.resultados[0].ok, b.json.resultados[0].ok].sort()).toEqual([false, true]);
  });

  it("con segunda foto manda las dos imágenes a las dos redes", async () => {
    const r = await pedir(pedido({ evidencia: SEGUNDA, redes: ["facebook", "instagram"] }));
    expect(r.json.resultados.map((x: { ok: boolean }) => x.ok)).toEqual([true, true]);
    expect(publicarFb.mock.calls[0][1]).toHaveLength(2);
    expect(publicarIg.mock.calls[0][2]).toHaveLength(2);
    expect(publicarIg.mock.calls[0][3]).toBe("IG: El texto");
  });

  it("Instagram tiene un plazo que cabe en la ruta", async () => {
    const antes = Date.now();
    await pedir(pedido({ redes: ["instagram"] }));
    const plazo = publicarIg.mock.calls[0][5] as number;
    expect(plazo).toBeGreaterThanOrEqual(antes + 240_000);
    expect(plazo).toBeLessThan(Date.now() + 240_000 + 1);
  });

  it("si Instagram no está conectado, Facebook sale igual", async () => {
    conexiones.instagram = null;
    const r = await pedir(pedido({ redes: ["facebook", "instagram"] }));
    expect(r.json.resultados).toEqual([
      expect.objectContaining({ red: "facebook", ok: true }),
      expect.objectContaining({ red: "instagram", ok: false, error: expect.stringMatching(/no está conectado/) }),
    ]);
  });

  it("un token vencido marca Facebook como desconectado y se puede reintentar después", async () => {
    publicarFb.mockRejectedValueOnce(new ErrorMeta("Facebook: Session has expired", 190));
    const r = await pedir(pedido());
    expect(r.json.resultados[0]).toMatchObject({ ok: false, error: expect.stringMatching(/volver a conectar/) });
    expect(marcarFacebookDesconectado).toHaveBeenCalled();
    expect((await pedir(pedido())).json.resultados[0]).toMatchObject({ ok: true, yaEstaba: false });
  });

  it("sin Facebook conectado no publica", async () => {
    conexiones.facebook = { ...FB, estado: "desconectado" };
    expect((await pedir(pedido())).status).toBe(400);
  });

  it("si falta la imagen o la segunda foto, lo dice", async () => {
    expect((await pedir(pedido({ imagen: `${"0".repeat(32)}.png` }))).status).toBe(404);
    expect((await pedir(pedido({ evidencia: `${"0".repeat(32)}.png` }))).status).toBe(404);
    expect((await pedir(pedido({ texto: "" }))).status).toBe(400);
    expect((await pedir(pedido({ redes: ["x"] }))).status).toBe(400);
  });

  it("sólo actualiza las analíticas si la fila es propia", async () => {
    await pedir(pedido({ analyticsId: "a1" }));
    expect(analyticsPropia).toHaveBeenCalledWith("a1", "silla", "u1");

    analytics.fila = { updateSchema: vi.fn(async () => ({ success: true })) };
    archivos.clear();
    archivos.set(IMAGEN, await pngLiso(10, 10));
    await pedir(pedido({ analyticsId: "a1" }));
    expect(analytics.fila.updateSchema).toHaveBeenCalledWith({ publicada: true, permalink: "https://facebook.com/p1" });
  });
});
