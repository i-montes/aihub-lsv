import { describe, expect, it } from "vitest";
import {
  filtrarModelosAnthropic,
  filtrarModelosGoogle,
  filtrarModelosOpenAI,
} from "@/lib/proveedores/listar-modelos";

describe("filtrarModelosOpenAI", () => {
  it("deja los gpt sin instruct ni versiones viejas, ordenados", () => {
    const ids = ["whisper-1", "gpt-4-0314", "gpt-5.6-terra", "gpt-3.5-turbo-instruct", "gpt-4o", "gpt-4-0301"];
    expect(filtrarModelosOpenAI(ids)).toEqual(["gpt-4o", "gpt-5.6-terra"]);
  });

  it("devuelve lista vacía si no hay gpt, sin lanzar", () => {
    expect(filtrarModelosOpenAI(["whisper-1", "dall-e-3"])).toEqual([]);
  });
});

describe("filtrarModelosAnthropic", () => {
  it("deja sólo los claude, ordenados", () => {
    expect(filtrarModelosAnthropic(["claude-sonnet-5", "otro", "claude-opus-4-8"])).toEqual([
      "claude-opus-4-8",
      "claude-sonnet-5",
    ]);
  });
});

describe("filtrarModelosGoogle", () => {
  it("quita el prefijo models/ y deja sólo gemini", () => {
    expect(filtrarModelosGoogle(["models/gemini-3.1-pro-preview", "models/embedding-001", "models/gemini-3-flash-preview"])).toEqual([
      "gemini-3-flash-preview",
      "gemini-3.1-pro-preview",
    ]);
  });
});
