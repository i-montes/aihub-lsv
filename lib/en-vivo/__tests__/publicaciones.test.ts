import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/en-vivo/almacen", async () => (await import("./almacen-memoria")).almacenEnMemoria());

import { archivos } from "./almacen-memoria";
import { PublicacionPendienteError, publicarUnaVez } from "../publicaciones";

const IMAGEN = `${"a".repeat(32)}.png`;
const EVIDENCIA = `${"e".repeat(32)}.png`;

const publicador = (link = "https://www.facebook.com/1") =>
  vi.fn(async () => {
    await new Promise((r) => setTimeout(r, 20));
    return link;
  });

beforeEach(() => archivos.clear());

describe("publicarUnaVez", () => {
  it("publica y el segundo intento devuelve el mismo link sin publicar", async () => {
    const publicar = publicador();
    const a = await publicarUnaVez("org", "facebook", IMAGEN, null, publicar);
    const b = await publicarUnaVez("org", "facebook", IMAGEN, null, publicar);
    expect(a).toEqual({ link: "https://www.facebook.com/1", yaEstaba: false });
    expect(b).toEqual({ link: "https://www.facebook.com/1", yaEstaba: true });
    expect(publicar).toHaveBeenCalledTimes(1);
  });

  it("dos pedidos a la vez publican una sola vez", async () => {
    const publicar = publicador();
    const r = await Promise.allSettled([
      publicarUnaVez("org", "facebook", IMAGEN, null, publicar),
      publicarUnaVez("org", "facebook", IMAGEN, null, publicar),
    ]);
    expect(publicar).toHaveBeenCalledTimes(1);
    expect(r.filter((x) => x.status === "fulfilled")).toHaveLength(1);
    const rechazado = r.find((x) => x.status === "rejected") as PromiseRejectedResult;
    expect(rechazado.reason).toBeInstanceOf(PublicacionPendienteError);
  });

  it("si Meta falla, borra la marca y se puede reintentar", async () => {
    const falla = vi.fn(async () => {
      throw new Error("Facebook: algo salió mal");
    });
    await expect(publicarUnaVez("org", "instagram", IMAGEN, null, falla)).rejects.toThrow("algo salió mal");
    expect([...archivos.keys()]).toHaveLength(0);
    const publicar = publicador("https://www.instagram.com/p/1");
    expect((await publicarUnaVez("org", "instagram", IMAGEN, null, publicar)).link).toBe("https://www.instagram.com/p/1");
  });

  it("un intento que se cortó (marca «publicando») bloquea y no publica", async () => {
    const colgado = vi.fn(() => new Promise<string>(() => {})); // nunca termina: la función "se cayó"
    void publicarUnaVez("org", "facebook", IMAGEN, null, colgado);
    await new Promise((r) => setTimeout(r, 10));
    const publicar = publicador();
    const error = await publicarUnaVez("org", "facebook", IMAGEN, null, publicar).catch((e) => e);
    expect(error).toBeInstanceOf(PublicacionPendienteError);
    expect(error.message).toMatch(/Revisa la página/);
    expect(publicar).not.toHaveBeenCalled();
  });

  it("la marca depende de la red, la organización, la imagen y la segunda foto", async () => {
    const publicar = publicador();
    await publicarUnaVez("org", "facebook", IMAGEN, null, publicar);
    await publicarUnaVez("org", "instagram", IMAGEN, null, publicar);
    await publicarUnaVez("otra", "facebook", IMAGEN, null, publicar);
    await publicarUnaVez("org", "facebook", IMAGEN, EVIDENCIA, publicar);
    await publicarUnaVez("org", "facebook", `${"b".repeat(32)}.png`, null, publicar);
    expect(publicar).toHaveBeenCalledTimes(5);
  });
});
