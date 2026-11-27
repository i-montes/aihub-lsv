import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/en-vivo/almacen", async () => (await import("./almacen-memoria")).almacenEnMemoria());
vi.mock("@/lib/en-vivo/publico", () => ({ urlPublica: (origen: string, id: string) => `${origen}/publico/${id}` }));

const llamarGraph = vi.fn();
vi.mock("@/lib/en-vivo/facebook", () => ({ llamarGraph: (...a: unknown[]) => llamarGraph(...a), pruebaAppSecret: () => ({ appsecret_proof: "p" }) }));

import { archivos, pngLiso } from "./almacen-memoria";
import { PlazoInstagramError, publicarEnInstagram } from "../instagram";
import type { ConexionFacebook, ConexionInstagram } from "../conexiones";

const fb = { pageId: "pag", pageToken: "tok" } as ConexionFacebook;
const ig: ConexionInstagram = { igUserId: "ig1", usuario: "@lasillavacia", pageId: "pag" };
const ORIGEN = "https://hub.lasillavacia.com";
const LEJOS = () => Date.now() + 60_000;

/** Graph simulado: cada POST a /media da un id nuevo; `estado` decide el status_code. */
function graph(estado: () => string = () => "FINISHED") {
  let n = 0;
  llamarGraph.mockImplementation(async (metodo: string, ruta: string, datos: Record<string, string>) => {
    if (metodo === "POST" && ruta === "ig1/media") return { id: `c${++n}` };
    if (metodo === "POST" && ruta === "ig1/media_publish") return { id: "m1" };
    if (metodo === "GET" && datos.fields === "status_code") return { status_code: estado() };
    if (metodo === "GET" && datos.fields === "permalink") return { permalink: "https://www.instagram.com/p/abc/" };
    throw new Error(`llamada inesperada ${metodo} ${ruta}`);
  });
}
const llamadas = (ruta: string) => llamarGraph.mock.calls.filter((c) => c[1] === ruta).map((c) => c[2]);

beforeEach(() => {
  archivos.clear();
  llamarGraph.mockReset();
});

describe("publicar en Instagram", () => {
  it("una imagen: la pasa a JPEG público, crea el contenedor con el texto y publica", async () => {
    graph();
    const r = await publicarEnInstagram(fb, ig, [await pngLiso(1080, 1350)], "El texto", ORIGEN, LEJOS());
    expect(r).toEqual({ mediaId: "m1", link: "https://www.instagram.com/p/abc/" });
    const [media] = llamadas("ig1/media");
    expect(media.caption).toBe("El texto");
    expect(media.image_url).toMatch(/^https:\/\/hub\.lasillavacia\.com\/publico\/[0-9a-f]{32}\.jpg$/);
    expect(llamadas("ig1/media_publish")).toEqual([expect.objectContaining({ creation_id: "c1" })]);
  });

  it("dos imágenes: carrusel con la pieza primero y la segunda foto después", async () => {
    graph();
    await publicarEnInstagram(fb, ig, [await pngLiso(1080, 1350), await pngLiso(1080, 1350, "#4a4595")], "El texto", ORIGEN, LEJOS());
    const media = llamadas("ig1/media");
    expect(media[0]).toMatchObject({ is_carousel_item: "true" });
    expect(media[1]).toMatchObject({ is_carousel_item: "true" });
    expect(media[0].caption).toBeUndefined();
    expect(media[2]).toMatchObject({ media_type: "CAROUSEL", children: "c1,c2", caption: "El texto" });
    expect(llamadas("ig1/media_publish")).toEqual([expect.objectContaining({ creation_id: "c3" })]);
  });

  it("si se acaba el plazo, no publica nada", async () => {
    graph(() => "IN_PROGRESS");
    const error = await publicarEnInstagram(fb, ig, [await pngLiso(1080, 1350)], "x", ORIGEN, Date.now() - 1).catch((e) => e);
    expect(error).toBeInstanceOf(PlazoInstagramError);
    expect(llamadas("ig1/media_publish")).toHaveLength(0);
  });

  it("si Instagram no pudo procesar la imagen, lo dice y no publica", async () => {
    graph(() => "ERROR");
    await expect(publicarEnInstagram(fb, ig, [await pngLiso(1080, 1350)], "x", ORIGEN, LEJOS())).rejects.toThrow(/no pudo procesar/);
    expect(llamadas("ig1/media_publish")).toHaveLength(0);
  });

  it("si no se puede leer el permalink, devuelve el perfil", async () => {
    graph();
    const base = llamarGraph.getMockImplementation()!;
    llamarGraph.mockImplementation(async (m: string, r: string, d: Record<string, string>) => {
      if (d.fields === "permalink") throw new Error("no");
      return base(m, r, d);
    });
    const r = await publicarEnInstagram(fb, ig, [await pngLiso(1080, 1350)], "x", ORIGEN, LEJOS());
    expect(r.link).toBe("https://www.instagram.com/lasillavacia/");
  });
});
