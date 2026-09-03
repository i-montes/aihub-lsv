/**
 * Qué herramientas ve cada organización.
 *
 * Antes cada herramienta restringida llevaba su propio `organization?.name ==
 * "..."` repartido entre el sidebar, la tarjeta del inicio y la página. Con dos
 * organizaciones de alcance distinto eso ya no se sostiene: la regla vive aquí
 * y los tres lugares la consultan.
 */

/**
 * Las herramientas del kit más Analíticas, que no es una herramienta pero se
 * muestra u oculta por organización con la misma regla.
 */
export type Herramienta =
  | "corrector"
  | "hilos"
  | "resumenes"
  | "detector-de-mentiras"
  | "quien-es-quien"
  | "analiticas";

/** Lo que ve una organización que no aparece en la tabla de abajo */
const HERRAMIENTAS_ABIERTAS: Herramienta[] = [
  "corrector",
  "hilos",
  "resumenes",
  "analiticas",
];

/**
 * Organizaciones con lista propia: ven exactamente esto y nada más.
 *
 * Orza entró sólo por Quién es quién —pone la base de datos de proyectos de
 * ley—, así que no ve el resto del kit.
 */
const HERRAMIENTAS_POR_ORGANIZACION: Record<string, Herramienta[]> = {
  "La Silla Vacía": [
    ...HERRAMIENTAS_ABIERTAS,
    "detector-de-mentiras",
    "quien-es-quien",
  ],
  Orza: ["quien-es-quien"],
};

/**
 * Verdadero si esa organización puede usar la herramienta.
 *
 * Sin organización devuelve falso para todo lo restringido: mientras la sesión
 * carga es preferible no mostrar de más y que aparezca un instante después.
 */
export function puedeVerHerramienta(
  organizacion: string | null | undefined,
  herramienta: Herramienta
): boolean {
  const lista = organizacion
    ? HERRAMIENTAS_POR_ORGANIZACION[organizacion]
    : undefined;
  return (lista ?? HERRAMIENTAS_ABIERTAS).includes(herramienta);
}

/** La ruta de cada herramienta, para el sidebar y el inicio */
export const RUTA_HERRAMIENTA: Record<Herramienta, string> = {
  corrector: "/dashboard/corrector",
  hilos: "/dashboard/generador-hilos",
  resumenes: "/dashboard/generador-resumen",
  "detector-de-mentiras": "/dashboard/detector-de-mentiras",
  "quien-es-quien": "/dashboard/quien-es-quien",
  analiticas: "/dashboard/analiticas",
};

/** Qué herramienta es esa ruta, o `null` si no es una herramienta */
export function herramientaDeRuta(pathname: string): Herramienta | null {
  const entrada = Object.entries(RUTA_HERRAMIENTA).find(
    ([, ruta]) => pathname === ruta || pathname.startsWith(`${ruta}/`)
  );
  return entrada ? (entrada[0] as Herramienta) : null;
}
