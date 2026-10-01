import { describe, expect, it } from "vitest";
import { conPosiciones } from "@/lib/proveedores/configuracion";

describe("conPosiciones", () => {
  it("asigna la posición por índice y deja api_key en null al conservar la clave", () => {
    const filas = conPosiciones([
      { proveedor: "ANTHROPIC", modelo: "claude-x", apiKey: "sk-ant-1", conservarClave: false, reasoningEffort: "low", verbosity: null },
      { proveedor: "OPENAI", modelo: "gpt-x", conservarClave: true, reasoningEffort: null, verbosity: "high" },
      { proveedor: "GOOGLE", modelo: "gemini-x", apiKey: "g-1", conservarClave: false, reasoningEffort: null, verbosity: null },
    ]);

    expect(filas.map((f) => f.posicion)).toEqual([0, 1, 2]);
    expect(filas.map((f) => f.proveedor)).toEqual(["ANTHROPIC", "OPENAI", "GOOGLE"]);
    expect(filas[1]).toEqual({
      proveedor: "OPENAI",
      api_key: null,
      modelo: "gpt-x",
      reasoning_effort: null,
      verbosity: "high",
      posicion: 1,
    });
    expect(filas[0].api_key).toBe("sk-ant-1");
  });

  it("con lista vacía devuelve una lista vacía", () => {
    expect(conPosiciones([])).toEqual([]);
  });
});
