// Geometría de la pieza (lienzo 1080x1350): encuadre de la foto y posición de las etiquetas
// para que la flecha apunte a la cabeza de cada persona. Todo en píxeles del lienzo.
//
// Copiada de envivo-web (lib/geometria.ts) sin cambios en lo que ya estaba: las constantes son
// las de la plantilla En Vivo de Canva. Lo nuevo es `componerConAjustes`, al final, para los
// cambios que pide el periodista ("sube la etiqueta", "corre la foto a la izquierda").

export type Caja = { x1: number; y1: number; x2: number; y2: number };
export type Encuadre = { width: number; height: number; left: number; top: number };
type Rect = { top: number; left: number; width: number; height: number };

export type Etiqueta = {
  persona: string;
  cargo: string;
  modo: "debajo de la cabeza" | "encima de la cabeza" | "al lado";
  apunta: boolean;
  // Grupo de la plantilla de la app: A y B tienen la flecha arriba; C y D, abajo (ya volteados).
  grupo: "A" | "B" | "C" | "D";
  rotacion: 0 | -180;
  recuadro: Rect;
  nombre: Rect & { font_size: number };
  cargoTexto: (Rect & { font_size: number }) | null;
};

export const ANCHO = 1080;
export const ALTO = 1350;
const MARGEN = 40;
const SEPARACION = 14; // entre la punta de la flecha y la cabeza
const HOLGURA = 12;
// Recuadro de la etiqueta en la plantilla de la app: tamaño fijo, con la flecha centrada.
// No se redimensiona: el conector de la API no puede recortar, y al cambiar el ancho la flecha se descentra.
const RECUADRO = { width: 440, height: 100 };

// Elementos fijos de la plantilla que una etiqueta no puede tapar.
const ZONAS_FIJAS: Caja[] = [
  { x1: 725, y1: 62, x2: 1026, y2: 108 }, // logo
  { x1: 66, y1: 781, x2: 345, y2: 839 }, // etiqueta enVivo
  { x1: 68, y1: 831, x2: 1000, y2: ALTO }, // titular
];

const r1 = (n: number) => Math.round(n * 10) / 10;
const limitar = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);
const choca = (a: Caja, b: Caja, holgura = 0) =>
  a.x1 < b.x2 + holgura && b.x1 < a.x2 + holgura && a.y1 < b.y2 + holgura && b.y1 < a.y2 + holgura;
const caja = (r: Rect): Caja => ({ x1: r.left, y1: r.top, x2: r.left + r.width, y2: r.top + r.height });

// Encuadre "cover". `foco` (fracciones de la foto) queda centrado a lo ancho y, si la foto
// es vertical, a un tercio de la altura.
export function encuadre(ancho: number, alto: number, foco: { x: number; y: number } | null): Encuadre {
  const escala = Math.max(ANCHO / ancho, ALTO / alto);
  const width = ancho * escala;
  const height = alto * escala;
  const left = foco ? limitar(ANCHO / 2 - foco.x * width, ANCHO - width, 0) : (ANCHO - width) / 2;
  const top = foco ? limitar(ALTO * 0.32 - foco.y * height, ALTO - height, 0) : (ALTO - height) / 2;
  return { width: r1(width), height: r1(height), left: r1(left), top: r1(top) };
}

// Cabeza en fracciones de la foto → píxeles del lienzo.
export function enLienzo(c: Caja, e: Encuadre): Caja {
  return {
    x1: r1(e.left + c.x1 * e.width),
    y1: r1(e.top + c.y1 * e.height),
    x2: r1(e.left + c.x2 * e.width),
    y2: r1(e.top + c.y2 * e.height),
  };
}

function centro(grupo: Caja[]) {
  const x1 = Math.min(...grupo.map((c) => c.x1));
  const x2 = Math.max(...grupo.map((c) => c.x2));
  const y1 = Math.min(...grupo.map((c) => c.y1));
  const y2 = Math.max(...grupo.map((c) => c.y2));
  return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
}

// Prueba varios encuadres (todas las personas con etiqueta juntas, luego cada una por orden de
// importancia) y se queda con el que deja más flechas apuntando. `cabezas` va en fracciones de la foto.
export function componer(
  ancho: number,
  alto: number,
  cabezas: Caja[],
  pedidas: { persona: string; cargo: string; indice: number }[],
) {
  const conEtiqueta = pedidas.map((p) => cabezas[p.indice]);
  const focos =
    conEtiqueta.length > 0
      ? [centro(conEtiqueta), ...conEtiqueta.map((c) => centro([c]))]
      : cabezas.length > 0
        ? [centro(cabezas)]
        : [null];

  let mejor: { encuadre: Encuadre; cabezas: Caja[]; etiquetas: Etiqueta[]; avisos: string[]; puntaje: number } | null = null;
  for (const f of focos) {
    const e = encuadre(ancho, alto, f);
    const enEl = cabezas.map((c) => enLienzo(c, e));
    const avisos: string[] = [];
    const visibles = pedidas.filter((p) => {
      const c = enEl[p.indice];
      const dentro = (c.x1 + c.x2) / 2 > 0 && (c.x1 + c.x2) / 2 < ANCHO && (c.y1 + c.y2) / 2 > 0 && (c.y1 + c.y2) / 2 < ALTO;
      if (!dentro) avisos.push(`${p.persona} quedó fuera del encuadre, así que no lleva etiqueta.`);
      return dentro;
    });
    const r = ubicarEtiquetas(
      visibles.map((p) => ({ persona: p.persona, cargo: p.cargo, cabeza: enEl[p.indice] })),
      enEl,
    );
    // Una flecha que apunta vale más que una etiqueta al lado, y la del protagonista (la primera) vale doble.
    const puntaje = r.etiquetas.reduce(
      (s, x) => s + (x.apunta ? 10 : 1) * (x.persona === visibles[0]?.persona && x.persona === pedidas[0].persona ? 2 : 1),
      0,
    );
    if (!mejor || puntaje > mejor.puntaje) {
      mejor = { encuadre: e, cabezas: enEl, etiquetas: r.etiquetas, avisos: [...avisos, ...r.avisos], puntaje };
    }
  }
  return mejor!;
}

function medidas(persona: string, cargo: string) {
  return {
    ...RECUADRO,
    fuenteNombre: persona.length * 14.5 > 400 ? 26 : 30,
    fuenteCargo: cargo.length * 12.5 > 400 ? 22 : 26,
  };
}

function armar(
  persona: string,
  cargo: string,
  m: ReturnType<typeof medidas>,
  top: number,
  left: number,
  grupo: Etiqueta["grupo"],
  modo: Etiqueta["modo"],
): Etiqueta {
  const flechaArriba = grupo === "A" || grupo === "B";
  // Posición de los textos dentro del recuadro (medida en la plantilla); sin cargo, el nombre va centrado.
  const dyNombre = flechaArriba ? (cargo ? 27 : 42) : cargo ? 8 : 22;
  const dyCargo = flechaArriba ? 59 : 41;
  return {
    persona,
    cargo,
    modo,
    apunta: modo !== "al lado",
    grupo,
    rotacion: flechaArriba ? 0 : -180,
    recuadro: { top: r1(top), left: r1(left), width: m.width, height: m.height },
    nombre: { top: r1(top + dyNombre), left: r1(left), width: m.width, height: 36, font_size: m.fuenteNombre },
    cargoTexto: cargo ? { top: r1(top + dyCargo), left: r1(left), width: m.width, height: 36, font_size: m.fuenteCargo } : null,
  };
}

// Coloca cada etiqueta para que la punta de la flecha toque la cabeza: primero debajo de la
// barbilla (grupo con flecha arriba), si no cabe encima de la cabeza (grupo con flecha abajo). Se corre a los lados
// mientras la flecha siga sobre el 60 % central de la cabeza.
export function ubicarEtiquetas(pedidas: { persona: string; cargo: string; cabeza: Caja }[], todas: Caja[]) {
  const puestas: Caja[] = [];
  const etiquetas: Etiqueta[] = [];
  const avisos: string[] = [];
  const libres = { arriba: ["A", "B"] as const, abajo: ["C", "D"] as const };
  const usados = { arriba: 0, abajo: 0 };
  const grupoPara = (flecha: "arriba" | "abajo") => libres[flecha][usados[flecha]];

  for (const p of pedidas) {
    const m = medidas(p.persona, p.cargo);
    const h = p.cabeza;
    const cx = (h.x1 + h.x2) / 2;
    const otras = todas.filter((c) => c !== h);
    const libre = (c: Caja) =>
      c.x1 >= MARGEN &&
      c.x2 <= ANCHO - MARGEN &&
      c.y1 >= MARGEN &&
      c.y2 <= ALTO - MARGEN &&
      !choca(c, h) &&
      !ZONAS_FIJAS.some((z) => choca(c, z, HOLGURA)) &&
      !otras.some((o) => choca(c, o, 6)) &&
      !puestas.some((o) => choca(c, o, HOLGURA));

    const corrimientos = [0];
    for (let d = 10; d <= (h.x2 - h.x1) * 0.3; d += 10) corrimientos.push(-d, d);

    let elegida: Etiqueta | null = null;
    const opciones = [
      { modo: "debajo de la cabeza", flecha: "arriba", top: h.y2 + SEPARACION },
      { modo: "encima de la cabeza", flecha: "abajo", top: h.y1 - SEPARACION - m.height },
    ] as const;
    for (const o of opciones) {
      if (!grupoPara(o.flecha)) continue;
      for (const d of corrimientos) {
        const left = cx + d - m.width / 2;
        if (libre({ x1: left, y1: o.top, x2: left + m.width, y2: o.top + m.height })) {
          elegida = armar(p.persona, p.cargo, m, o.top, left, grupoPara(o.flecha), o.modo);
          break;
        }
      }
      if (elegida) break;
    }

    // Último recurso: al lado de la cabeza (la flecha no apunta, se avisa al editor).
    if (!elegida) {
      const cy = (h.y1 + h.y2) / 2;
      busqueda: for (const left of [h.x2 + 20, h.x1 - 20 - m.width]) {
        for (const dy of [0, -60, 60, -120, 120]) {
          const top = cy - m.height / 2 + dy;
          if (grupoPara("arriba") && libre({ x1: left, y1: top, x2: left + m.width, y2: top + m.height })) {
            elegida = armar(p.persona, p.cargo, m, top, left, grupoPara("arriba"), "al lado");
            break busqueda;
          }
        }
      }
    }

    if (!elegida) {
      avisos.push(`No hubo espacio para la etiqueta de ${p.persona}.`);
      continue;
    }
    if (!elegida.apunta) avisos.push(`No había espacio para que la flecha apunte a ${p.persona}; la etiqueta quedó al lado.`);
    etiquetas.push(elegida);
    puestas.push(caja(elegida.recuadro));
    usados[elegida.rotacion === 0 ? "arriba" : "abajo"]++;
  }
  return { etiquetas, avisos };
}

/** Correcciones que pide el periodista sobre lo que calculó `componer`, en píxeles del lienzo. */
export type Ajustes = {
  /** Corre la foto dentro del marco (positivo: a la derecha / hacia abajo). */
  foto: { dx: number; dy: number };
  /** Corre una etiqueta, por índice de cabeza. */
  etiquetas: { indice: number; dx: number; dy: number }[];
};

export const SIN_AJUSTES: Ajustes = { foto: { dx: 0, dy: 0 }, etiquetas: [] };

function moverEtiqueta(e: Etiqueta, dx: number, dy: number): Etiqueta {
  const mover = <T extends Rect>(r: T): T => ({ ...r, top: r1(r.top + dy), left: r1(r.left + dx) });
  return { ...e, recuadro: mover(e.recuadro), nombre: mover(e.nombre), cargoTexto: e.cargoTexto ? mover(e.cargoTexto) : null };
}

/**
 * `componer` más los ajustes del periodista. Si la foto se corre, se vuelven a ubicar las etiquetas
 * sobre las cabezas ya corridas; después se aplica el corrimiento de cada etiqueta, sin volver a
 * comprobar choques: es una orden explícita y se respeta.
 */
export function componerConAjustes(
  ancho: number,
  alto: number,
  cabezas: Caja[],
  pedidas: { persona: string; cargo: string; indice: number }[],
  ajustes: Ajustes = SIN_AJUSTES,
) {
  let r = componer(ancho, alto, cabezas, pedidas);

  if (ajustes.foto.dx || ajustes.foto.dy) {
    const e: Encuadre = {
      ...r.encuadre,
      left: r1(limitar(r.encuadre.left + ajustes.foto.dx, ANCHO - r.encuadre.width, 0)),
      top: r1(limitar(r.encuadre.top + ajustes.foto.dy, ALTO - r.encuadre.height, 0)),
    };
    const enEl = cabezas.map((c) => enLienzo(c, e));
    const u = ubicarEtiquetas(
      pedidas.map((p) => ({ persona: p.persona, cargo: p.cargo, cabeza: enEl[p.indice] })),
      enEl,
    );
    r = { ...r, encuadre: e, cabezas: enEl, etiquetas: u.etiquetas, avisos: u.avisos };
  }

  const etiquetas = r.etiquetas.map((e) => {
    const indice = pedidas.find((p) => p.persona === e.persona)?.indice;
    const a = ajustes.etiquetas.find((x) => x.indice === indice);
    return a && (a.dx || a.dy) ? moverEtiqueta(e, a.dx, a.dy) : e;
  });
  return { ...r, etiquetas };
}
