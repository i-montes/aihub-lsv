import { mkdtempSync, rmSync } from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// El almacén local (sin bucket) no debe tocar Supabase.
vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: () => {
    throw new Error("el almacén local no debe usar Supabase");
  },
}));

let dir: string;
let almacen: typeof import("../almacen");

const marca = (c: string) => `pub-${c.repeat(64)}.json`;

beforeEach(async () => {
  dir = mkdtempSync(path.join(os.tmpdir(), "en-vivo-almacen-"));
  vi.spyOn(process, "cwd").mockReturnValue(dir);
  vi.stubEnv("EN_VIVO_BUCKET", "");
  vi.stubEnv("VERCEL", "");
  vi.resetModules();
  almacen = await import("../almacen");
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  rmSync(dir, { recursive: true, force: true });
});

describe("almacén local", () => {
  it("guarda y lee un archivo por id", async () => {
    const id = await almacen.guardarArchivo(Buffer.from("hola"), "png");
    expect(almacen.esIdValido(id)).toBe(true);
    expect(almacen.tipoDe(id)).toBe("image/png");
    expect((await almacen.leerArchivo(id))?.toString()).toBe("hola");
  });

  it.each(["../../etc/passwd", "abc.png", `${"a".repeat(32)}.exe`, `${"a".repeat(32)}.png/../x`])("rechaza el id %s", async (id) => {
    expect(almacen.esIdValido(id)).toBe(false);
    expect(await almacen.leerArchivo(id)).toBeNull();
  });

  it("devuelve null si el archivo no existe", async () => {
    expect(await almacen.leerArchivo(`${"b".repeat(32)}.jpg`)).toBeNull();
  });

  it("en Vercel sin bucket falla en vez de escribir en el disco", async () => {
    vi.stubEnv("VERCEL", "1");
    await expect(almacen.guardarArchivo(Buffer.from("x"), "png")).rejects.toThrow(/EN_VIVO_BUCKET/);
    await expect(almacen.reservarMarca(marca("a"), {})).rejects.toThrow(/EN_VIVO_BUCKET/);
  });
});

describe("marcas", () => {
  it("reservar sólo funciona la primera vez", async () => {
    expect(await almacen.reservarMarca(marca("a"), { n: 1 })).toBe(true);
    expect(await almacen.reservarMarca(marca("a"), { n: 2 })).toBe(false);
    expect(await almacen.leerMarca(marca("a"))).toEqual({ n: 1 });
  });

  it("reservar a la vez deja pasar a uno solo", async () => {
    const r = await Promise.all(Array.from({ length: 8 }, (_, i) => almacen.reservarMarca(marca("b"), { i })));
    expect(r.filter(Boolean)).toHaveLength(1);
  });

  it("escribir reemplaza, borrar quita y después se puede reservar otra vez", async () => {
    await almacen.reservarMarca(marca("c"), { estado: "publicando" });
    await almacen.escribirMarca(marca("c"), { estado: "publicada" });
    expect(await almacen.leerMarca(marca("c"))).toEqual({ estado: "publicada" });
    await almacen.borrarMarca(marca("c"));
    expect(await almacen.leerMarca(marca("c"))).toBeNull();
    expect(await almacen.reservarMarca(marca("c"), {})).toBe(true);
  });

  it.each(["../pub-x.json", "pub-abc.json", `pub-${"a".repeat(64)}.png`, `../pub-${"a".repeat(64)}.json`])("rechaza el nombre %s", async (nombre) => {
    await expect(almacen.reservarMarca(nombre, {})).rejects.toThrow(/no válido/);
    await expect(almacen.leerMarca(nombre)).rejects.toThrow(/no válido/);
  });
});
