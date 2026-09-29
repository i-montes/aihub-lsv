import { describe, expect, it } from "vitest";
import { opcionesDeProveedor } from "@/lib/proveedores/opciones-modelo";

describe("opcionesDeProveedor", () => {
  it("OpenAI: esfuerzo, verbosidad y sin almacenar", () => {
    expect(opcionesDeProveedor("OPENAI", "high", "low")).toEqual({
      openai: { reasoningEffort: "high", textVerbosity: "low", store: false },
    });
  });

  it("OpenAI: sin verbosidad usa medium y mezcla opciones extra", () => {
    expect(opcionesDeProveedor("OPENAI", "medium", null, { promptCacheKey: "x" })).toEqual({
      openai: { reasoningEffort: "medium", textVerbosity: "medium", store: false, promptCacheKey: "x" },
    });
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
