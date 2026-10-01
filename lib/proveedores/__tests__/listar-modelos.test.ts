import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ErrorProveedor,
  filtrarModelosAnthropic,
  filtrarModelosGoogle,
  filtrarModelosOpenAI,
  listarModelos,
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

describe("listarModelos", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("OpenAI 200 con respuesta exitosa filtra y verifica encabezado Authorization", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ data: [{ id: "gpt-5.6-terra" }, { id: "whisper-1" }] }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const resultado = await listarModelos("OPENAI", "test-key");

    expect(resultado).toEqual(["gpt-5.6-terra"]);
    expect(mockFetch).toHaveBeenCalledWith("https://api.openai.com/v1/models", {
      headers: { Authorization: "Bearer test-key" },
    });
  });

  it("401 con mensaje de error rechaza con ErrorProveedor con estado 400", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: vi.fn().mockResolvedValue({ error: { message: "Incorrect API key" } }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await expect(listarModelos("OPENAI", "bad-key")).rejects.toBeInstanceOf(ErrorProveedor);
    await expect(listarModelos("OPENAI", "bad-key")).rejects.toMatchObject({
      status: 400,
      message: "Incorrect API key",
    });
  });

  it("500 con cuerpo no JSON rechaza con ErrorProveedor estado 502", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockRejectedValue(new SyntaxError("Unexpected token")),
    });
    vi.stubGlobal("fetch", mockFetch);

    await expect(listarModelos("OPENAI", "key")).rejects.toBeInstanceOf(ErrorProveedor);
    await expect(listarModelos("OPENAI", "key")).rejects.toMatchObject({ status: 502 });
  });

  it("200 cuyo json() rechaza (cuerpo no JSON) rechaza con ErrorProveedor estado 502", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockRejectedValue(new SyntaxError("Unexpected end of JSON input")),
    });
    vi.stubGlobal("fetch", mockFetch);

    await expect(listarModelos("OPENAI", "key")).rejects.toBeInstanceOf(ErrorProveedor);
    await expect(listarModelos("OPENAI", "key")).rejects.toMatchObject({
      status: 502,
      message: expect.stringContaining("devolvió una respuesta que no se pudo leer"),
    });
  });

  it("fetch lanzando TypeError rechaza con ErrorProveedor estado 502 con 'No se pudo conectar'", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new TypeError("failed"));
    vi.stubGlobal("fetch", mockFetch);

    await expect(listarModelos("OPENAI", "key")).rejects.toBeInstanceOf(ErrorProveedor);
    await expect(listarModelos("OPENAI", "key")).rejects.toMatchObject({ status: 502 });
    await expect(listarModelos("OPENAI", "key")).rejects.toThrow(/No se pudo conectar/);
  });
});
