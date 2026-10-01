import { describe, expect, it } from "vitest";
import { opcionesDeProveedor } from "@/lib/proveedores/opciones-modelo";

describe("opcionesDeProveedor", () => {
  it("OpenAI: esfuerzo, verbosidad y sin almacenar", () => {
    expect(opcionesDeProveedor("OPENAI", "high", "low")).toEqual({
      openai: { reasoningEffort: "high", textVerbosity: "low", store: false },
    });
  });

  it("OpenAI: sin verbosidad no envía textVerbosity y mezcla opciones extra", () => {
    expect(opcionesDeProveedor("OPENAI", "medium", null, { promptCacheKey: "x" })).toEqual({
      openai: { reasoningEffort: "medium", store: false, promptCacheKey: "x" },
    });
  });

  it("OpenAI: por defecto del modelo sólo envía store: false", () => {
    expect(opcionesDeProveedor("OPENAI", null, null)).toEqual({ openai: { store: false } });
  });

  it("Anthropic y Google: por defecto del modelo no envían nada", () => {
    expect(opcionesDeProveedor("ANTHROPIC", null, null)).toEqual({});
    expect(opcionesDeProveedor("GOOGLE", null, null)).toEqual({});
  });

  it("Anthropic: sólo effort, y xhigh se recorta a high", () => {
    expect(opcionesDeProveedor("ANTHROPIC", "low", null)).toEqual({ anthropic: { effort: "low" } });
    expect(opcionesDeProveedor("ANTHROPIC", "xhigh", "high")).toEqual({ anthropic: { effort: "high" } });
  });

  it("Google: thinkingLevel, y xhigh se recorta a high", () => {
    expect(opcionesDeProveedor("GOOGLE", "minimal", null)).toEqual({
      google: { thinkingConfig: { thinkingLevel: "minimal" } },
    });
    expect(opcionesDeProveedor("GOOGLE", "xhigh", null)).toEqual({
      google: { thinkingConfig: { thinkingLevel: "high" } },
    });
  });
});
