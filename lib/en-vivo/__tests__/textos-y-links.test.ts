import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { validarUrl } from "../nota";
import { firmaValida, urlPublica } from "../publico";
import { textoInstagram } from "../texto-instagram";
import { puedeVerHerramienta, seMuestraEnNavegacion } from "@/lib/organizaciones/herramientas";

describe("texto para Instagram", () => {
  const url = "https://www.lasillavacia.com/silla-nacional/nota";

  it("quita el link de la nota y no agrega nada", () => {
    expect(textoInstagram(`Pasó algo importante.\n\n${url}`, url)).toBe("Pasó algo importante.");
    expect(textoInstagram(`Uno ${url} dos`, url)).toBe("Uno  dos");
  });

  it("no deja más de una línea en blanco seguida", () => {
    expect(textoInstagram(`Uno\n\n${url}\n\nDos`, url)).toBe("Uno\n\nDos");
  });

  it("corta en 2.200 caracteres sin partir emojis", () => {
    const t = textoInstagram("🙂".repeat(3000), "");
    expect(Array.from(t)).toHaveLength(2200);
    expect(t.endsWith("🙂")).toBe(true);
  });
});

describe("links públicos firmados (para que Instagram baje la imagen)", () => {
  const ID = `${"a".repeat(32)}.jpg`;
  beforeEach(() => vi.stubEnv("EN_VIVO_FIRMA_CLAVE", "clave-de-prueba"));
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  const partes = (u: string) => {
    const x = new URL(u);
    return { vence: x.searchParams.get("vence"), firma: x.searchParams.get("firma") };
  };

  it("un link recién firmado es válido", () => {
    const { vence, firma } = partes(urlPublica("https://hub.x", ID));
    expect(firmaValida(ID, vence, firma)).toBe(true);
  });

  it("no sirve para otro archivo, con otra firma, sin firma ni vencido", () => {
    const { vence, firma } = partes(urlPublica("https://hub.x", ID));
    expect(firmaValida(`${"b".repeat(32)}.jpg`, vence, firma)).toBe(false);
    expect(firmaValida(ID, vence, "0".repeat(64))).toBe(false);
    expect(firmaValida(ID, vence, null)).toBe(false);
    expect(firmaValida(ID, String(Number(vence) + 1), firma)).toBe(false);
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 2 * 60 * 60 * 1000);
    expect(firmaValida(ID, vence, firma)).toBe(false);
  });
});

describe("links de nota", () => {
  it("acepta notas de lasillavacia.com", () => {
    expect(validarUrl(" https://www.lasillavacia.com/silla-nacional/nota/ ").hostname).toBe("www.lasillavacia.com");
  });

  it.each(["http://www.lasillavacia.com/x", "https://lasillavacia.com.evil.co/x", "https://otro.com/x", "no es link"])("rechaza %s", (u) => {
    expect(() => validarUrl(u)).toThrow();
  });
});

describe("quién ve Post redes", () => {
  it("La Silla Vacía la ve", () => {
    expect(puedeVerHerramienta("La Silla Vacía", "en-vivo")).toBe(true);
    expect(seMuestraEnNavegacion("La Silla Vacía", "en-vivo")).toBe(true);
  });

  it.each(["Orza", "Otra organización", null, undefined])("%s no la ve", (org) => {
    expect(puedeVerHerramienta(org, "en-vivo")).toBe(false);
    expect(seMuestraEnNavegacion(org, "en-vivo")).toBe(false);
  });
});
