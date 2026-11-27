import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ErrorMeta, origenPublico, publicar, redirectUri, urlDeLogin } from "../facebook";
import type { ConexionFacebook } from "../conexiones";

const fb = { pageId: "pag", pageToken: "tok" } as ConexionFacebook;
const fetchFalso = vi.fn<typeof fetch>();
const json = (o: unknown) => new Response(JSON.stringify(o), { headers: { "content-type": "application/json" } });

beforeEach(() => {
  fetchFalso.mockReset();
  vi.stubGlobal("fetch", fetchFalso);
  vi.stubEnv("META_APP_ID", "app");
  vi.stubEnv("META_APP_SECRET", "secreto");
  vi.stubEnv("META_REDIRECT_BASE", "");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("publicar en Facebook", () => {
  it("sube las fotos sin publicar y las adjunta al post en orden", async () => {
    let foto = 0;
    fetchFalso.mockImplementation(async (url) => {
      const u = String(url);
      if (u.endsWith("/pag/photos")) return json({ id: `f${++foto}` });
      if (u.endsWith("/pag/feed")) return json({ id: "pag_post" });
      return json({ permalink_url: "https://www.facebook.com/lasillavacia/posts/1" });
    });
    const r = await publicar(fb, [Buffer.from("pieza"), Buffer.from("segunda")], "El texto", "envivo-nota");
    expect(r).toEqual({ postId: "pag_post", link: "https://www.facebook.com/lasillavacia/posts/1" });

    const fotos = fetchFalso.mock.calls.filter(([u]) => String(u).endsWith("/photos")).map(([, init]) => init!.body as FormData);
    expect(fotos).toHaveLength(2);
    expect(fotos.every((f) => f.get("published") === "false" && typeof f.get("appsecret_proof") === "string")).toBe(true);
    expect((fotos[1].get("source") as File).name).toBe("envivo-nota-2.png");

    const feed = new URLSearchParams(String(fetchFalso.mock.calls.find(([u]) => String(u).endsWith("/feed"))![1]!.body));
    expect(feed.get("message")).toBe("El texto");
    expect(JSON.parse(feed.get("attached_media[0]")!)).toEqual({ media_fbid: "f1" });
    expect(JSON.parse(feed.get("attached_media[1]")!)).toEqual({ media_fbid: "f2" });
  });

  it("un token vencido es un ErrorMeta que pide reconectar", async () => {
    fetchFalso.mockResolvedValue(json({ error: { message: "Session has expired", code: 190 } }));
    const error = await publicar(fb, [Buffer.from("x")], "t", "n").catch((e) => e);
    expect(error).toBeInstanceOf(ErrorMeta);
    expect(error.hayQueReconectar).toBe(true);
  });

  it("otros errores no piden reconectar", () => {
    expect(new ErrorMeta("x", 100).hayQueReconectar).toBe(false);
    expect(new ErrorMeta("x", 10, 492).hayQueReconectar).toBe(true);
  });
});

describe("login", () => {
  it("el origen público sale de META_REDIRECT_BASE o del host reenviado por el túnel", () => {
    const h = new Headers({ "x-forwarded-host": "abc.devtunnels.ms" });
    expect(origenPublico(h, "http://localhost:3000")).toBe("https://abc.devtunnels.ms");
    expect(origenPublico(new Headers(), "http://localhost:3000")).toBe("http://localhost:3000");
    vi.stubEnv("META_REDIRECT_BASE", "https://hub.lasillavacia.com/");
    expect(origenPublico(h, "http://localhost:3000")).toBe("https://hub.lasillavacia.com");
  });

  it("la URL de login lleva el state, el callback y los permisos de Instagram", () => {
    const u = new URL(urlDeLogin("estado123", redirectUri("https://hub.x")));
    expect(u.searchParams.get("state")).toBe("estado123");
    expect(u.searchParams.get("redirect_uri")).toBe("https://hub.x/api/en-vivo/facebook/callback");
    expect(u.searchParams.get("scope")).toContain("instagram_content_publish");
  });
});
