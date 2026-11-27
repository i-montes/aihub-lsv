import sharp from "sharp";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/en-vivo/almacen", async () => (await import("./almacen-memoria")).almacenEnMemoria());
// Sin Canva configurada: la pieza se arma con la plantilla.
vi.mock("@/lib/en-vivo/conexiones", () => ({ conexionCanva: async () => null }));
vi.mock("@/lib/en-vivo/nota", () => ({ leerNota: vi.fn(), textoPost: vi.fn() }));

import { archivos, pngLiso } from "./almacen-memoria";
import { armar, piezaConfiable } from "../pieza";
import type { Pieza } from "../tipos";

async function guardarFoto(width: number, height: number) {
  const id = `${"f".repeat(32)}.jpg`;
  archivos.set(id, await sharp(await pngLiso(width, height)).jpeg().toBuffer());
  return id;
}

const pieza = (cambios: Partial<Pieza> = {}): Pieza => ({
  url: "https://www.lasillavacia.com/nota",
  titularNota: "Nota",
  titular: "El Congreso hunde la reforma",
  texto: "Texto del post",
  foto: null,
  cabezas: [{ x1: 0.4, y1: 0.2, x2: 0.6, y2: 0.4 }],
  etiquetas: [{ indice: 0, persona: "Gustavo Petro", cargo: "Presidente" }],
  ajustes: { foto: { dx: 0, dy: 0 }, etiquetas: [] },
  encuadre: null,
  ubicadas: [],
  base: null,
  imagen: null,
  motor: "plantilla",
  diseno: null,
  avisos: [],
  avisosGeometria: [],
  ...cambios,
});

beforeEach(() => archivos.clear());

describe("piezaConfiable", () => {
  it("toma el tamaño de la foto del archivo guardado, no del navegador", async () => {
    const archivo = await guardarFoto(1600, 1000);
    const p = await piezaConfiable(pieza({ foto: { archivo, ancho: 99_999_999, alto: -5, nombre: "foto.jpg" } }));
    expect(p.foto).toEqual({ archivo, ancho: 1600, alto: 1000, nombre: "foto.jpg" });
  });

  it("acota números, textos y listas, y descarta lo que no sirve", async () => {
    const falsa = pieza({
      titular: "T".repeat(5000),
      cabezas: [{ x1: -3, y1: 0.2, x2: 9e9, y2: Number.NaN }],
      etiquetas: [
        { indice: 7, persona: "Fantasma", cargo: "" },
        { indice: 0, persona: "P".repeat(500), cargo: "C" },
      ],
      ajustes: { foto: { dx: 1e12, dy: "x" as unknown as number }, etiquetas: [] },
      base: { archivo: "../../etc/passwd", huella: "h" },
      imagen: "../secreto.png",
      motor: "otro" as Pieza["motor"],
    });
    const p = await piezaConfiable(falsa);
    expect(p.titular).toHaveLength(300);
    expect(p.cabezas[0]).toEqual({ x1: 0, y1: 0.2, x2: 1, y2: 0 });
    expect(p.etiquetas).toHaveLength(1);
    expect(p.etiquetas[0].persona).toHaveLength(80);
    expect(p.ajustes.foto).toEqual({ dx: 1350, dy: 0 });
    expect(p.base).toBeNull();
    expect(p.imagen).toBeNull();
    expect(p.motor).toBe("plantilla");
  });

  it("si la foto ya no está, lo dice", async () => {
    await expect(piezaConfiable(pieza({ foto: { archivo: `${"0".repeat(32)}.jpg`, ancho: 1, alto: 1, nombre: "" } }))).rejects.toThrow(/Se perdió la foto/);
  });

  it("aguanta basura en lugar de listas", async () => {
    const p = await piezaConfiable(pieza({ cabezas: "nada" as unknown as Pieza["cabezas"], etiquetas: null as unknown as Pieza["etiquetas"], avisos: 3 as unknown as string[] }));
    expect(p.cabezas).toEqual([]);
    expect(p.etiquetas).toEqual([]);
    expect(p.avisos).toEqual([]);
  });
});

describe("armar", () => {
  it(
    "arma la pieza 1080x1350 con foto, titular y etiqueta",
    async () => {
      const archivo = await guardarFoto(1600, 1000);
      const p = await armar(await piezaConfiable(pieza({ foto: { archivo, ancho: 1, alto: 1, nombre: "" } })), "org", () => {});
      expect(p.motor).toBe("plantilla");
      expect(p.encuadre).not.toBeNull();
      expect(p.ubicadas).toHaveLength(1);
      const { width, height } = await sharp(archivos.get(p.imagen!)!).metadata();
      expect({ width, height }).toEqual({ width: 1080, height: 1350 });
    },
    60_000,
  );

  it(
    "si sólo se mueve una etiqueta, reutiliza la base",
    async () => {
      const archivo = await guardarFoto(1600, 1000);
      const primera = await armar(pieza({ foto: { archivo, ancho: 1600, alto: 1000, nombre: "" } }), "org", () => {});
      const pasos: string[] = [];
      const movida = await armar({ ...primera, ajustes: { foto: { dx: 0, dy: 0 }, etiquetas: [{ indice: 0, dx: 0, dy: 40 }] } }, "org", (p) => pasos.push(p));
      expect(movida.base?.archivo).toBe(primera.base?.archivo);
      expect(pasos).toEqual(["Poniendo las etiquetas"]);
      expect(movida.imagen).not.toBe(primera.imagen);
    },
    60_000,
  );

  it(
    "sin foto arma la pieza sobre un lienzo vacío",
    async () => {
      const p = await armar(pieza({ cabezas: [], etiquetas: [] }), "org", () => {});
      expect(archivos.has(p.imagen!)).toBe(true);
    },
    60_000,
  );
});
