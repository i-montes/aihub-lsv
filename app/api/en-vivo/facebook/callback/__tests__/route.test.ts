import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const acceso = vi.fn();
vi.mock("@/lib/en-vivo/acceso", async (original) => ({
  ...(await original<typeof import("@/lib/en-vivo/acceso")>()),
  verificarAccesoEnVivo: () => acceso(),
}));

const guardarConexionFacebook = vi.fn(async () => {});
const guardarConexionInstagram = vi.fn(async () => {});
vi.mock("@/lib/en-vivo/conexiones", () => ({
  guardarConexionFacebook: (...a: unknown[]) => guardarConexionFacebook(...(a as [])),
  guardarConexionInstagram: (...a: unknown[]) => guardarConexionInstagram(...(a as [])),
}));

const canjearCodigo = vi.fn();
vi.mock("@/lib/en-vivo/facebook", async (original) => ({
  ...(await original<typeof import("@/lib/en-vivo/facebook")>()),
  canjearCodigo: (...a: unknown[]) => canjearCodigo(...a),
  verificarTokenDePagina: async () => ({ valido: true, vence: false }),
  cuentaInstagram: async () => ({ id: "ig1", usuario: "@lasillavacia" }),
}));

import { COOKIE_STATE } from "@/lib/en-vivo/facebook";
import { GET } from "../route";

const SILLA = { id: "111", name: "La Silla Vacía", access_token: "tok-silla" };
const PERSONAL = { id: "222", name: "Página personal", access_token: "tok-personal" };

async function volver(params: Record<string, string> = { code: "c", state: "s" }, cookie = "s") {
  const req = new NextRequest(`http://localhost:3000/api/en-vivo/facebook/callback?${new URLSearchParams(params)}`, {
    headers: { cookie: `${COOKIE_STATE}=${cookie}` },
  });
  const r = await GET(req);
  return new URL(r.headers.get("location")!).searchParams.get("facebook") ?? "";
}

beforeEach(() => {
  acceso.mockResolvedValue({ negado: null, organizationId: "silla", userId: "u1", role: "ADMIN" });
  canjearCodigo.mockReset().mockResolvedValue({ paginas: [PERSONAL, SILLA], scopes: ["pages_manage_posts", "instagram_content_publish"] });
  guardarConexionFacebook.mockClear();
  guardarConexionInstagram.mockClear();
  vi.stubEnv("META_REDIRECT_BASE", "");
  vi.stubEnv("META_PAGE_ID", "");
  vi.stubEnv("VERCEL", "");
});
afterEach(() => vi.unstubAllEnvs());

describe("GET /api/en-vivo/facebook/callback", () => {
  it("conecta la página de META_PAGE_ID aunque haya otras, y su Instagram", async () => {
    vi.stubEnv("META_PAGE_ID", "111");
    expect(await volver()).toMatch(/Página conectada: La Silla Vacía\. Instagram: @lasillavacia/);
    expect(guardarConexionFacebook).toHaveBeenCalledWith("silla", "u1", expect.objectContaining({ pageId: "111", pageToken: "tok-silla" }));
    expect(guardarConexionInstagram).toHaveBeenCalledWith("silla", "u1", { igUserId: "ig1", usuario: "@lasillavacia", pageId: "111" });
  });

  it("en Vercel sin META_PAGE_ID no conecta nada", async () => {
    vi.stubEnv("VERCEL", "1");
    expect(await volver()).toMatch(/Falta META_PAGE_ID/);
    expect(guardarConexionFacebook).not.toHaveBeenCalled();
  });

  it("en local, con varias páginas y sin META_PAGE_ID, no adivina", async () => {
    const mensaje = await volver();
    expect(mensaje).toMatch(/Administras varias páginas/);
    expect(mensaje).toContain("La Silla Vacía (111)");
    expect(guardarConexionFacebook).not.toHaveBeenCalled();
  });

  it("en local, con una sola página, usa esa", async () => {
    canjearCodigo.mockResolvedValue({ paginas: [SILLA], scopes: [] });
    expect(await volver()).toMatch(/Página conectada: La Silla Vacía/);
    expect(guardarConexionFacebook).toHaveBeenCalled();
  });

  it("si quien conecta no administra la página de META_PAGE_ID, lo dice", async () => {
    vi.stubEnv("META_PAGE_ID", "999");
    expect(await volver()).toMatch(/no administra la página 999/);
    expect(guardarConexionFacebook).not.toHaveBeenCalled();
  });

  it.each(["USER", "ADMIN", "OWNER"])("un miembro con rol %s puede conectar", async (role) => {
    vi.stubEnv("META_PAGE_ID", "111");
    acceso.mockResolvedValue({ negado: null, organizationId: "silla", userId: "u1", role });
    expect(await volver()).toMatch(/Página conectada: La Silla Vacía/);
    expect(guardarConexionFacebook).toHaveBeenCalled();
  });

  it("rechaza un state que no coincide con la cookie", async () => {
    expect(await volver({ code: "c", state: "otro" })).toMatch(/venció o no es válida/);
    expect(canjearCodigo).not.toHaveBeenCalled();
  });

  it("otra organización no llega a canjear el código", async () => {
    acceso.mockResolvedValue({ negado: { mensaje: "Tu organización no tiene habilitada esta herramienta", status: 403 } });
    expect(await volver()).toMatch(/no tiene habilitada/);
    expect(canjearCodigo).not.toHaveBeenCalled();
  });
});
