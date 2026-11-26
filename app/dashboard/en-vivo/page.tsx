"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Download, ExternalLink, ImageUp, Loader2, Pencil, Send, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ApiKeyRequiredModal } from "@/components/proofreader/api-key-required-modal";
import { AvisoErrorProveedores } from "@/components/tools/aviso-error-proveedores";
import { useEstadoConexiones } from "@/components/en-vivo/conexiones-en-vivo";
import { useAuth } from "@/hooks/use-auth";
import { useProveedoresActivos } from "@/hooks/use-proveedores-activos";
import type { Pieza } from "@/lib/en-vivo/tipos";
import { textoInstagram } from "@/lib/en-vivo/texto-instagram";

type FotoPropia = { datos: string; nombre: string };

/** Reduce la foto en el navegador antes de subirla: el cuerpo de una petición en Vercel no pasa de 4,5 MB. */
async function reducirFoto(archivo: File): Promise<FotoPropia> {
  const url = URL.createObjectURL(archivo);
  try {
    const img = await new Promise<HTMLImageElement>((ok, mal) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => mal(new Error("No se pudo leer la foto."));
      i.src = url;
    });
    const escala = Math.min(1, 2400 / Math.max(img.width, img.height), 1600 / Math.min(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * escala);
    canvas.height = Math.round(img.height * escala);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return { datos: canvas.toDataURL("image/jpeg", 0.88), nombre: archivo.name };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Lee la respuesta NDJSON de /api/en-vivo/* evento por evento. */
async function leerPasos(respuesta: Response, alEvento: (e: any) => void) {
  if (!respuesta.ok || !respuesta.body) {
    const j = await respuesta.json().catch(() => ({}));
    throw new Error(j.error ?? `Error ${respuesta.status}`);
  }
  const lector = respuesta.body.getReader();
  const decodificador = new TextDecoder();
  let resto = "";
  for (;;) {
    const { value, done } = await lector.read();
    if (done) break;
    resto += decodificador.decode(value, { stream: true });
    const lineas = resto.split("\n");
    resto = lineas.pop() ?? "";
    for (const linea of lineas) if (linea.trim()) alEvento(JSON.parse(linea));
  }
}

const slug = (t: string) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

// useSearchParams necesita un Suspense alrededor para que la página se pueda prerenderizar.
export default function EnVivoPage() {
  return (
    <Suspense>
      <EnVivo />
    </Suspense>
  );
}

function EnVivo() {
  const { profile } = useAuth();
  const esAdmin = profile?.role === "OWNER" || profile?.role === "ADMIN";
  const { proveedores, cargando, error: errorProveedores, recargar } = useProveedoresActivos("en-vivo");
  const { estado } = useEstadoConexiones();
  const parametros = useSearchParams();

  const [url, setUrl] = useState("");
  const [foto, setFoto] = useState<FotoPropia | null>(null);
  const [pasos, setPasos] = useState<string[]>([]);
  const [trabajando, setTrabajando] = useState(false);
  const [pieza, setPieza] = useState<Pieza | null>(null);
  const [textoPrevio, setTextoPrevio] = useState<string | null>(null);
  const [analyticsId, setAnalyticsId] = useState<string | number | null>(null);
  const [editandoTexto, setEditandoTexto] = useState(false);
  const [pedidoCambios, setPedidoCambios] = useState("");
  const [notaCambios, setNotaCambios] = useState<string | null>(null);
  const [publicado, setPublicado] = useState<{ red: string; link: string }[] | null>(null);
  // Instagram arranca apagado: publicar sale de inmediato y es mejor que el editor lo elija.
  const [redes, setRedes] = useState({ facebook: true, instagram: false });
  // Segunda foto (opcional): una foto de evidencia que va después de la pieza en las dos redes.
  const [evidencia, setEvidencia] = useState<string | null>(null);
  const [linkEvidencia, setLinkEvidencia] = useState("");
  const [armandoEvidencia, setArmandoEvidencia] = useState(false);
  const entradaEvidencia = useRef<HTMLInputElement>(null);
  const entradaFoto = useRef<HTMLInputElement>(null);
  const entradaCambiarFoto = useRef<HTMLInputElement>(null);

  // Vuelta de "Conectar con Facebook".
  useEffect(() => {
    const mensaje = parametros.get("facebook");
    if (mensaje) toast.info(mensaje);
  }, [parametros]);

  const generar = async (fotoPropia: FotoPropia | null, textoActual?: string) => {
    setTrabajando(true);
    setPasos([]);
    setNotaCambios(null);
    setPublicado(null);
    const anterior = pieza;
    try {
      const r = await fetch("/api/en-vivo/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, foto: fotoPropia, texto: textoActual ?? null }),
      });
      await leerPasos(r, (e) => {
        if (e.tipo === "progreso") setPasos((p) => [...p, e.paso]);
        if (e.tipo === "nota") setTextoPrevio(e.texto);
        if (e.tipo === "resultado") {
          setPieza(e.pieza);
          setAnalyticsId(e.analyticsId ?? null);
        }
        if (e.tipo === "error") throw new Error(e.mensaje);
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo armar la pieza.");
      // Si falla "cambiar foto", se queda la pieza que había.
      if (anterior) setPieza(anterior);
    } finally {
      setTrabajando(false);
    }
  };

  const pedirCambios = async () => {
    if (!pieza || !pedidoCambios.trim()) return;
    setTrabajando(true);
    setPasos([]);
    try {
      const r = await fetch("/api/en-vivo/cambios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pieza, instrucciones: pedidoCambios, analyticsId }),
      });
      await leerPasos(r, (e) => {
        if (e.tipo === "progreso") setPasos((p) => [...p, e.paso]);
        if (e.tipo === "resultado") {
          setPieza(e.pieza);
          setNotaCambios(e.nota);
          setPedidoCambios("");
        }
        if (e.tipo === "error") throw new Error(e.mensaje);
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo aplicar el cambio.");
    } finally {
      setTrabajando(false);
    }
  };

  const publicar = async () => {
    if (!pieza?.imagen) return;
    const elegidas = (["facebook", "instagram"] as const).filter((r) => redes[r] && (r === "facebook" ? facebookListo : instagramListo));
    if (!elegidas.length) return;
    const destino = elegidas
      .map((r) => (r === "facebook" ? `Facebook${estado?.facebook.pagina ? ` («${estado.facebook.pagina}»)` : ""}` : `Instagram${estado?.instagram?.usuario ? ` (${estado.instagram.usuario})` : ""}`))
      .join(" y ");
    if (!confirm(`¿Publicar en ${destino}? Sale de inmediato.`)) return;
    setTrabajando(true);
    try {
      const r = await fetch("/api/en-vivo/publicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imagen: pieza.imagen,
          evidencia,
          texto: pieza.texto,
          url: pieza.url,
          redes: elegidas,
          nombre: `envivo-${slug(pieza.titularNota)}`,
          analyticsId,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      const resultados: { red: string; ok: boolean; link?: string; error?: string }[] = j.resultados ?? [];
      const nombreRed = (red: string) => (red === "facebook" ? "Facebook" : "Instagram");
      for (const x of resultados) {
        if (x.ok) toast.success(`Publicado en ${nombreRed(x.red)}.`);
        else toast.error(`${nombreRed(x.red)}: ${x.error}`);
      }
      const buenos = resultados.filter((x) => x.ok && x.link).map((x) => ({ red: nombreRed(x.red), link: x.link! }));
      if (buenos.length) setPublicado(buenos);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo publicar.");
    } finally {
      setTrabajando(false);
    }
  };

  const descartar = () => {
    setPieza(null);
    setTextoPrevio(null);
    setAnalyticsId(null);
    setPasos([]);
    setNotaCambios(null);
    setPublicado(null);
    setFoto(null);
    setEvidencia(null);
    setLinkEvidencia("");
  };

  const agregarEvidencia = async (origen: { foto: FotoPropia } | { url: string }) => {
    setArmandoEvidencia(true);
    try {
      const r = await fetch("/api/en-vivo/evidencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(origen),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setEvidencia(j.imagen);
      setLinkEvidencia("");
      setPublicado(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo agregar la segunda foto.");
    } finally {
      setArmandoEvidencia(false);
    }
  };

  const elegirFoto = async (archivo: File | undefined, alElegir: (f: FotoPropia) => void) => {
    if (!archivo) return;
    try {
      alElegir(await reducirFoto(archivo));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo leer la foto.");
    }
  };

  const facebookListo = !!estado?.facebook.conectada;
  const instagramListo = !!estado?.instagram?.conectada;
  const algunaRed = (redes.facebook && facebookListo) || (redes.instagram && instagramListo);
  const avisos = pieza ? [...pieza.avisos, ...pieza.avisosGeometria] : [];

  return (
    <div className="container py-8">
      {errorProveedores && <AvisoErrorProveedores error={errorProveedores} onReintentar={recargar} className="mb-4" />}
      <ApiKeyRequiredModal
        isLoading={cargando}
        isOpen={!cargando && !errorProveedores && proveedores.length === 0}
        isAdmin={esAdmin}
        herramienta="Post redes"
      />
      <div className="mx-auto max-w-6xl rounded-2xl border bg-white p-6 shadow-sm dark:bg-gray-950">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Post redes</h1>
          <div className="flex flex-wrap gap-2 text-xs">
            {estado?.canva.configurada && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-green-800">Armada en Canva</span>
            )}
            <span className={`rounded-full px-3 py-1 ${facebookListo ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`}>
              {estado ? (facebookListo ? `Facebook: ${estado.facebook.pagina}` : "Facebook sin conectar") : "…"}
            </span>
            {instagramListo && (
              <span className="rounded-full bg-pink-100 px-3 py-1 text-pink-800">Instagram: {estado?.instagram?.usuario}</span>
            )}
            {esAdmin && (
              <Link href="/dashboard/configuracion/herramientas" className="rounded-full bg-gray-100 px-3 py-1 text-gray-700 hover:bg-gray-200">
                Configurar
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Entrada */}
          <div className="space-y-4 lg:col-span-2">
            <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Link de la nota</label>
                <Input
                  placeholder="https://www.lasillavacia.com/…"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={trabajando}
                />
              </div>
              <div className="space-y-2">
                <input ref={entradaFoto} type="file" accept="image/*" className="hidden" onChange={(e) => elegirFoto(e.target.files?.[0], setFoto)} />
                {foto ? (
                  <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <span className="truncate">Foto propia: {foto.nombre}</span>
                    <Button size="sm" variant="ghost" onClick={() => setFoto(null)}>Quitar</Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => entradaFoto.current?.click()} disabled={trabajando}>
                    <ImageUp className="mr-2 h-4 w-4" /> Usar otra foto (opcional)
                  </Button>
                )}
              </div>
              <Button className="w-full" onClick={() => generar(foto)} disabled={trabajando || !url.trim() || proveedores.length === 0}>
                {trabajando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generar
              </Button>
              {esAdmin && estado?.fuenteRespaldo && (
                <p className="text-xs text-amber-700">
                  El titular usa Anton en lugar de MARTIN, la fuente de la plantilla, porque falta su archivo
                  (lib/en-vivo/plantilla/fuentes/MARTIN-Regular.ttf).
                </p>
              )}
            </div>

            {pasos.length > 0 && (
              <ol className="space-y-1 rounded-xl border bg-card p-4 text-sm">
                {pasos.map((p, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-600">
                    {trabajando && i === pasos.length - 1 ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3 text-green-600" />}
                    {p}
                  </li>
                ))}
              </ol>
            )}

            {pieza && (
              <div className="space-y-3 rounded-xl border bg-card p-4">
                <label className="text-sm font-medium text-gray-700">Pedir cambios</label>
                <Textarea
                  placeholder="Sube la etiqueta, acorta el titular, cambia el cargo a…"
                  value={pedidoCambios}
                  onChange={(e) => setPedidoCambios(e.target.value)}
                  disabled={trabajando}
                  rows={3}
                />
                <Button size="sm" onClick={pedirCambios} disabled={trabajando || !pedidoCambios.trim()}>
                  Aplicar cambios
                </Button>
                {notaCambios && <p className="text-xs text-gray-600">{notaCambios}</p>}
              </div>
            )}

            {pieza && (
              <div className="space-y-3 rounded-xl border bg-card p-4">
                <label className="text-sm font-medium text-gray-700">Segunda foto (opcional)</label>
                <p className="text-xs text-gray-500">
                  Una foto de evidencia que va después de la pieza, en Facebook y en Instagram. Sube un archivo o pega el link de la imagen.
                </p>
                {evidencia ? (
                  <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <span>Segunda foto lista</span>
                    <Button size="sm" variant="ghost" onClick={() => setEvidencia(null)} disabled={trabajando}>Quitar</Button>
                  </div>
                ) : (
                  <>
                    <input
                      ref={entradaEvidencia}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => elegirFoto(e.target.files?.[0], (f) => agregarEvidencia({ foto: f }))}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://… (link de la imagen)"
                        value={linkEvidencia}
                        onChange={(e) => setLinkEvidencia(e.target.value)}
                        disabled={armandoEvidencia || trabajando}
                      />
                      <Button size="sm" variant="outline" onClick={() => agregarEvidencia({ url: linkEvidencia })} disabled={!linkEvidencia.trim() || armandoEvidencia || trabajando}>
                        Agregar
                      </Button>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => entradaEvidencia.current?.click()} disabled={armandoEvidencia || trabajando}>
                      {armandoEvidencia ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageUp className="mr-2 h-4 w-4" />} Subir archivo
                    </Button>
                  </>
                )}
              </div>
            )}

            {avisos.length > 0 && (
              <div className="space-y-1 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                <p className="font-medium">Para revisar</p>
                {avisos.map((a, i) => <p key={i}>{a}</p>)}
              </div>
            )}
          </div>

          {/* Vista del post */}
          <div className="lg:col-span-3">
            {!pieza && !textoPrevio ? (
              <div className="flex h-full min-h-80 items-center justify-center rounded-xl border border-dashed text-sm text-gray-400">
                Pega el link de una nota y dale Generar.
              </div>
            ) : (
              <div className="mx-auto max-w-lg overflow-hidden rounded-xl border bg-white shadow-sm">
                <div className="space-y-2 p-4">
                  {editandoTexto && pieza ? (
                    <Textarea value={pieza.texto} onChange={(e) => setPieza({ ...pieza, texto: e.target.value })} rows={10} />
                  ) : (
                    <p className="whitespace-pre-wrap text-sm text-gray-800">{pieza?.texto ?? textoPrevio}</p>
                  )}
                </div>
                {pieza?.imagen ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <>
                    <img src={`/api/en-vivo/archivo/${pieza.imagen}`} alt={pieza.titular} className="w-full" />
                    {evidencia && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/api/en-vivo/archivo/${evidencia}`} alt="Segunda foto" className="w-full border-t" />
                    )}
                  </>
                ) : (
                  <div className="flex aspect-[4/5] items-center justify-center bg-gray-100 text-sm text-gray-400">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Armando la imagen…
                  </div>
                )}
                {pieza && (
                  <div className="space-y-3 border-t p-4">
                    {publicado ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {publicado.map((p) => (
                          <a key={p.red} href={p.link} target="_blank" rel="noreferrer">
                            <Button size="sm"><ExternalLink className="mr-2 h-4 w-4" /> Ver en {p.red}</Button>
                          </a>
                        ))}
                        <Button size="sm" variant="outline" onClick={descartar}>Hacer otro</Button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <label className={`flex items-center gap-1 text-sm ${facebookListo ? "" : "text-gray-400"}`}>
                          <input type="checkbox" checked={redes.facebook && facebookListo} disabled={!facebookListo || trabajando} onChange={(e) => setRedes({ ...redes, facebook: e.target.checked })} />
                          Facebook
                        </label>
                        <label className={`flex items-center gap-1 text-sm ${instagramListo ? "" : "text-gray-400"}`} title={instagramListo ? "" : "Instagram no está conectado: reconecta Facebook en Ajustes y acepta los permisos de Instagram"}>
                          <input type="checkbox" checked={redes.instagram && instagramListo} disabled={!instagramListo || trabajando} onChange={(e) => setRedes({ ...redes, instagram: e.target.checked })} />
                          Instagram
                        </label>
                        <Button size="sm" onClick={publicar} disabled={trabajando || !algunaRed || !pieza.imagen}>
                          <Send className="mr-2 h-4 w-4" /> Publicar
                        </Button>
                        {pieza.imagen && (
                          <a href={`/api/en-vivo/archivo/${pieza.imagen}?descargar=envivo-${slug(pieza.titularNota)}${analyticsId != null ? `&analytics=${analyticsId}` : ""}`}>
                            <Button size="sm" variant="outline"><Download className="mr-2 h-4 w-4" /> Descargar</Button>
                          </a>
                        )}
                        {evidencia && (
                          <a href={`/api/en-vivo/archivo/${evidencia}?descargar=envivo-${slug(pieza.titularNota)}-2`}>
                            <Button size="sm" variant="outline"><Download className="mr-2 h-4 w-4" /> Descargar segunda</Button>
                          </a>
                        )}
                        <Button size="sm" variant="outline" onClick={() => setEditandoTexto((v) => !v)} disabled={trabajando}>
                          <Pencil className="mr-2 h-4 w-4" /> {editandoTexto ? "Listo" : "Editar texto"}
                        </Button>
                        <input
                          ref={entradaCambiarFoto}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => elegirFoto(e.target.files?.[0], (f) => generar(f, pieza.texto))}
                        />
                        <Button size="sm" variant="outline" onClick={() => entradaCambiarFoto.current?.click()} disabled={trabajando}>
                          <ImageUp className="mr-2 h-4 w-4" /> Cambiar foto
                        </Button>
                        <Button size="sm" variant="ghost" onClick={descartar} disabled={trabajando}>
                          <Trash2 className="mr-2 h-4 w-4" /> Descartar
                        </Button>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>Titular: {pieza.titular}</span>
                      {pieza.etiquetas.length > 0 && <span>Etiquetas: {pieza.etiquetas.map((e) => `${e.persona}${e.cargo ? ` (${e.cargo})` : ""}`).join(", ")}</span>}
                      {pieza.diseno?.editUrl && (
                        <a href={pieza.diseno.editUrl} target="_blank" rel="noreferrer" className="underline">Abrir en Canva</a>
                      )}
                    </div>
                    {instagramListo && (
                      <details className="text-xs text-gray-600">
                        <summary className="cursor-pointer">Texto para Instagram</summary>
                        <p className="mt-2 whitespace-pre-wrap">{textoInstagram(pieza.texto, pieza.url)}</p>
                      </details>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
