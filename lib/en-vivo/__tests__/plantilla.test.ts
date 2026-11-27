import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { dibujarBase, dibujarEtiquetas, usaFuenteDeRespaldo } from "../plantilla";
import type { Etiqueta } from "../geometria";
import { pngLiso } from "./almacen-memoria";

// Dibuja de verdad con sharp y las fuentes de lib/en-vivo/plantilla: tarda un poco.
const LENTO = 60_000;

async function medidas(png: Buffer) {
  const { width, height } = await sharp(png).metadata();
  return { width, height };
}

/** Diferencia media de color entre dos imágenes del mismo tamaño en un recorte: 0 = iguales. */
async function diferencia(a: Buffer, b: Buffer, zona: sharp.Region) {
  const [x, y] = await Promise.all([a, b].map((p) => sharp(p).extract(zona).removeAlpha().raw().toBuffer()));
  let suma = 0;
  for (let i = 0; i < x.length; i++) suma += Math.abs(x[i] - y[i]);
  return suma / x.length;
}

const etiqueta = (persona: string, cargo: string): Etiqueta =>
  ({
    persona,
    cargo,
    modo: "debajo de la cabeza",
    apunta: true,
    grupo: "A",
    rotacion: 0,
    recuadro: { top: 500, left: 320, width: 440, height: 100 },
    nombre: { top: 530, left: 340, width: 400, height: 30, font_size: 28 },
    cargoTexto: { top: 565, left: 340, width: 400, height: 24, font_size: 22 },
  }) as unknown as Etiqueta;

describe("plantilla", () => {
  it("usa MARTIN, no la fuente de respaldo", () => {
    expect(usaFuenteDeRespaldo()).toBe(false);
  });

  it(
    "un titular normal da 1080x1350, dibuja el texto y no avisa nada",
    async () => {
      const foto = await pngLiso(1080, 1350);
      const sinTitular = await dibujarBase(foto, "");
      const r = await dibujarBase(foto, "El Congreso hunde la reforma laboral");
      expect(await medidas(r.png)).toEqual({ width: 1080, height: 1350 });
      expect(r.avisos).toEqual([]);
      // La zona del titular cambia; la de arriba (foto y logo) no.
      expect(await diferencia(r.png, sinTitular.png, { left: 68, top: 860, width: 900, height: 100 })).toBeGreaterThan(5);
      expect(await diferencia(r.png, sinTitular.png, { left: 0, top: 200, width: 1080, height: 300 })).toBe(0);
    },
    LENTO,
  );

  it.each([
    ["Anticonstitucionalisimamente", false],
    ["Inconstitucionalidad", false],
    ["https://www.lasillavacia.com/silla-nacional/una-nota-con-un-slug-larguisimo-que-no-tiene-espacios", true],
    ["Petro dice que es " + "anticonstitucional".repeat(4), true],
  ])(
    "no rompe con la palabra larga «%s»",
    async (titular, avisaQueSeAchico) => {
      const r = await dibujarBase(await pngLiso(1080, 1350), titular);
      expect(await medidas(r.png)).toEqual({ width: 1080, height: 1350 });
      expect(r.avisos.some((a) => a.includes("se achicó"))).toBe(avisaQueSeAchico);
    },
    LENTO,
  );

  it(
    "un titular larguísimo avisa que no cabe en 4 renglones",
    async () => {
      const titular = Array.from({ length: 40 }, (_, i) => `palabra${i}`).join(" ");
      const r = await dibujarBase(await pngLiso(1080, 1350), titular);
      expect(await medidas(r.png)).toEqual({ width: 1080, height: 1350 });
      expect(r.avisos.some((a) => a.includes("renglones"))).toBe(true);
    },
    LENTO,
  );

  it(
    "dibuja etiquetas, también con nombre y cargo larguísimos",
    async () => {
      const base = (await dibujarBase(await pngLiso(1080, 1350), "Prueba")).png;
      const normal = await dibujarEtiquetas(base, [etiqueta("Gustavo Petro", "Presidente")]);
      const larga = await dibujarEtiquetas(base, [
        etiqueta("María Fernanda Cabal Molina De Las Mercedes Anticonstitucional", "Senadora del Centro Democrático y precandidata presidencial"),
      ]);
      for (const png of [normal, larga]) expect(await medidas(png)).toEqual({ width: 1080, height: 1350 });
      expect(await diferencia(normal, base, { left: 320, top: 500, width: 440, height: 100 })).toBeGreaterThan(5);
    },
    LENTO,
  );

  it("sin etiquetas devuelve la base tal cual", async () => {
    const base = await pngLiso(1080, 1350);
    expect(await dibujarEtiquetas(base, [])).toBe(base);
  });
});
