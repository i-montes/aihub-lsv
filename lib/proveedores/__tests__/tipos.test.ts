import { describe, expect, it } from "vitest";
import {
  enmascararClave,
  normalizarProveedor,
  validarCuerpoGuardado,
} from "@/lib/proveedores/tipos";

describe("normalizarProveedor", () => {
  it("acepta mayúsculas y minúsculas", () => {
    expect(normalizarProveedor("openai")).toBe("OPENAI");
    expect(normalizarProveedor("ANTHROPIC")).toBe("ANTHROPIC");
    expect(normalizarProveedor(" google ")).toBe("GOOGLE");
  });

  it("devuelve null para lo que no es un proveedor", () => {
    expect(normalizarProveedor("perplexity")).toBeNull();
    expect(normalizarProveedor(42)).toBeNull();
    expect(normalizarProveedor(undefined)).toBeNull();
  });
});

describe("enmascararClave", () => {
  it("deja sólo los últimos cuatro caracteres", () => {
    expect(enmascararClave("sk-abcdefgh1234")).toBe("••••1234");
  });

  it("no revela nada de una clave de cuatro caracteres o menos", () => {
    expect(enmascararClave("abcd")).toBe("••••");
    expect(enmascararClave("")).toBe("••••");
  });
});

describe("validarCuerpoGuardado", () => {
  const base = { proveedor: "OPENAI", modelo: "gpt-5.6-terra", apiKey: "sk-1" };

  it("acepta una lista válida y la devuelve normalizada", () => {
    const r = validarCuerpoGuardado(
      { proveedores: [{ ...base, reasoningEffort: "high", verbosity: "low" }] },
      []
    );
    expect(r).toEqual({
      ok: true,
      proveedores: [
        {
          proveedor: "OPENAI",
          modelo: "gpt-5.6-terra",
          apiKey: "sk-1",
          conservarClave: false,
          reasoningEffort: "high",
          verbosity: "low",
        },
      ],
    });
  });

  it("recorta espacios en la clave y el modelo", () => {
    const r = validarCuerpoGuardado(
      { proveedores: [{ proveedor: "openai", modelo: "  gpt-5.6-terra ", apiKey: " sk-1\n" }] },
      []
    );
    expect(r.ok && r.proveedores[0]).toMatchObject({ modelo: "gpt-5.6-terra", apiKey: "sk-1" });
  });

  it("acepta una lista vacía (la herramienta queda apagada)", () => {
    expect(validarCuerpoGuardado({ proveedores: [] }, [])).toEqual({ ok: true, proveedores: [] });
  });

  it("rechaza un cuerpo sin lista de proveedores", () => {
    expect(validarCuerpoGuardado({}, []).ok).toBe(false);
    expect(validarCuerpoGuardado(null, []).ok).toBe(false);
  });

  it("rechaza un proveedor desconocido y uno repetido", () => {
    expect(validarCuerpoGuardado({ proveedores: [{ ...base, proveedor: "perplexity" }] }, []).ok).toBe(false);
    const r = validarCuerpoGuardado({ proveedores: [base, base] }, []);
    expect(r).toEqual({ ok: false, error: "OpenAI aparece dos veces", proveedor: "OPENAI" });
  });

  it("rechaza modelo vacío", () => {
    const r = validarCuerpoGuardado({ proveedores: [{ ...base, modelo: "  " }] }, []);
    expect(r).toEqual({ ok: false, error: "Escribe o elige el modelo de OpenAI", proveedor: "OPENAI" });
  });

  it("exige clave nueva o conservarClave con fila existente", () => {
    const sinClave = validarCuerpoGuardado({ proveedores: [{ proveedor: "OPENAI", modelo: "m" }] }, []);
    expect(sinClave).toEqual({ ok: false, error: "Falta la clave de OpenAI", proveedor: "OPENAI" });

    const conservarSinFila = validarCuerpoGuardado(
      { proveedores: [{ proveedor: "OPENAI", modelo: "m", conservarClave: true }] },
      ["ANTHROPIC"]
    );
    expect(conservarSinFila).toEqual({
      ok: false,
      error: "OpenAI ya no tiene clave guardada; escribe una nueva",
      proveedor: "OPENAI",
    });

    const conservarConFila = validarCuerpoGuardado(
      { proveedores: [{ proveedor: "OPENAI", modelo: "m", conservarClave: true }] },
      ["OPENAI"]
    );
    expect(conservarConFila.ok).toBe(true);
    expect(conservarConFila.ok && conservarConFila.proveedores[0].apiKey).toBeUndefined();
  });

  it("valida el esfuerzo según el proveedor", () => {
    expect(validarCuerpoGuardado({ proveedores: [{ ...base, proveedor: "ANTHROPIC", reasoningEffort: "xhigh" }] }, [])).toEqual({
      ok: false,
      error: "Anthropic no admite el esfuerzo xhigh",
      proveedor: "ANTHROPIC",
    });
    expect(validarCuerpoGuardado({ proveedores: [{ ...base, proveedor: "GOOGLE", reasoningEffort: "minimal" }] }, []).ok).toBe(true);
  });

  it("sin esfuerzo usa el del modelo (null) y descarta la verbosidad fuera de OpenAI", () => {
    const r = validarCuerpoGuardado(
      { proveedores: [{ ...base, proveedor: "GOOGLE", verbosity: "high" }] },
      []
    );
    expect(r.ok && r.proveedores[0]).toMatchObject({ reasoningEffort: null, verbosity: null });
  });

  it("\"auto\" en el esfuerzo significa por defecto del modelo", () => {
    const r = validarCuerpoGuardado({ proveedores: [{ ...base, proveedor: "ANTHROPIC", reasoningEffort: "auto" }] }, []);
    expect(r.ok && r.proveedores[0]).toMatchObject({ reasoningEffort: null });
  });

  it("verbosidad vacía en OpenAI significa por defecto del modelo", () => {
    const r = validarCuerpoGuardado({ proveedores: [{ ...base, verbosity: "" }] }, []);
    expect(r.ok && r.proveedores[0]).toMatchObject({ reasoningEffort: null, verbosity: null });
  });

  it("rechaza una verbosidad inválida en OpenAI", () => {
    const r = validarCuerpoGuardado({ proveedores: [{ ...base, verbosity: "max" }] }, []);
    expect(r).toEqual({ ok: false, error: "OpenAI no admite la verbosidad max", proveedor: "OPENAI" });
  });
});
