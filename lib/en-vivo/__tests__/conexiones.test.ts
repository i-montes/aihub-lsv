import { randomBytes } from "crypto";
import { mkdtempSync, readFileSync, rmSync } from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// herramienta_conexiones en memoria. `faltaTabla` simula la migración sin aplicar.
const tabla = new Map<string, { datos: Record<string, string | null> }>();
let faltaTabla = false;
const upsert = vi.fn(async (fila: { organization_id: string; herramienta: string; servicio: string; datos: Record<string, string | null> }) => {
  if (faltaTabla) return { error: {}, status: 404 };
  tabla.set(`${fila.organization_id}|${fila.herramienta}|${fila.servicio}`, { datos: fila.datos });
  return { error: null, status: 201 };
});

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: () => ({
    from: () => ({
      upsert,
      select: () => {
        const filtro: Record<string, string> = {};
        const q = {
          eq: (k: string, v: string) => ((filtro[k] = v), q),
          maybeSingle: async () =>
            faltaTabla
              ? { data: null, error: { code: "42P01", message: "relation does not exist" } }
              : { data: tabla.get(`${filtro.organization_id}|${filtro.herramienta}|${filtro.servicio}`) ?? null, error: null },
        };
        return q;
      },
    }),
  }),
}));

const TOKEN = "EAAtoken-secreto-de-la-pagina";
let dir: string;
let c: typeof import("../conexiones");

const guardado = (servicio: string) => tabla.get(`org|en-vivo|${servicio}`)?.datos;
const conectar = () => c.guardarConexionFacebook("org", "u1", { pageId: "123", pageName: "La Silla Vacía", pageToken: TOKEN, scopes: ["pages_manage_posts"] });

beforeEach(async () => {
  tabla.clear();
  faltaTabla = false;
  upsert.mockClear();
  dir = mkdtempSync(path.join(os.tmpdir(), "en-vivo-conexiones-"));
  vi.spyOn(process, "cwd").mockReturnValue(dir);
  vi.stubEnv("CONEXIONES_CLAVE", randomBytes(32).toString("base64"));
  vi.stubEnv("VERCEL", "");
  vi.stubEnv("META_PAGE_ID", "");
  vi.stubEnv("META_PAGE_TOKEN", "");
  vi.resetModules();
  c = await import("../conexiones");
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  rmSync(dir, { recursive: true, force: true });
});

describe("conexión de Facebook con CONEXIONES_CLAVE", () => {
  it("guarda el token cifrado en la base y lo lee de vuelta", async () => {
    await conectar();
    const datos = guardado("FACEBOOK")!;
    expect(datos.page_token).toMatch(/^gcm:/);
    expect(JSON.stringify(datos)).not.toContain(TOKEN);
    const fb = await c.conexionFacebook("org");
    expect(fb).toMatchObject({ pageId: "123", pageToken: TOKEN, estado: "conectado" });
  });

  it("marcar como desconectado no vuelve a cifrar el token", async () => {
    await conectar();
    const antes = guardado("FACEBOOK")!.page_token;
    await c.marcarFacebookDesconectado("org");
    expect(guardado("FACEBOOK")!.page_token).toBe(antes);
    expect(await c.conexionFacebook("org")).toMatchObject({ pageToken: TOKEN, estado: "desconectado" });
  });

  it("el secreto de Canva también va cifrado", async () => {
    await c.guardarConexionCanva("org", "u1", { clientId: "id", clientSecret: "secreto-canva", plantillaId: "p", campoTitular: "t", campoFoto: "f" });
    expect(guardado("CANVA")!.client_secret).toMatch(/^gcm:/);
    expect((await c.conexionCanva("org"))?.clientSecret).toBe("secreto-canva");
  });

  it("lo que ve el navegador no trae el token", async () => {
    await conectar();
    const estado = await c.estadoConexiones("org");
    expect(estado.facebook).toMatchObject({ conectada: true, pagina: "La Silla Vacía" });
    expect(JSON.stringify(estado)).not.toContain(TOKEN);
  });

  it("una clave de otro largo es un error", async () => {
    vi.stubEnv("CONEXIONES_CLAVE", Buffer.from("corta").toString("base64"));
    await expect(conectar()).rejects.toThrow(/32 bytes/);
  });
});

describe("conexión de Facebook sin CONEXIONES_CLAVE", () => {
  beforeEach(() => vi.stubEnv("CONEXIONES_CLAVE", ""));

  it("en Vercel falla y no escribe nada en la base", async () => {
    vi.stubEnv("VERCEL", "1");
    await expect(conectar()).rejects.toThrow(/CONEXIONES_CLAVE/);
    expect(upsert).not.toHaveBeenCalled();
  });

  it("en local va sólo al archivo, aunque la tabla exista, y se lee de ahí", async () => {
    await conectar();
    expect(upsert).not.toHaveBeenCalled();
    const local = JSON.parse(readFileSync(path.join(dir, ".data", "en-vivo", "conexiones.json"), "utf8"));
    expect(local["org:en-vivo:FACEBOOK"].page_token).toBe(TOKEN);
    expect((await c.conexionFacebook("org"))?.pageToken).toBe(TOKEN);
  });

  it("Instagram no tiene secretos: va a la base sin clave", async () => {
    await c.guardarConexionInstagram("org", "u1", { igUserId: "ig1", usuario: "@lasillavacia", pageId: "123" });
    expect(upsert).toHaveBeenCalledTimes(1);
    expect(await c.conexionInstagram("org")).toEqual({ igUserId: "ig1", usuario: "@lasillavacia", pageId: "123" });
  });
});

describe("sin la tabla (migración sin aplicar)", () => {
  beforeEach(() => {
    faltaTabla = true;
  });

  it("en local guarda cifrado en el archivo", async () => {
    await conectar();
    const local = JSON.parse(readFileSync(path.join(dir, ".data", "en-vivo", "conexiones.json"), "utf8"));
    expect(local["org:en-vivo:FACEBOOK"].page_token).toMatch(/^gcm:/);
    expect((await c.conexionFacebook("org"))?.pageToken).toBe(TOKEN);
  });

  it("en Vercel pide aplicar la migración", async () => {
    vi.stubEnv("VERCEL", "1");
    await expect(conectar()).rejects.toThrow(/aplica la migración/);
  });
});
