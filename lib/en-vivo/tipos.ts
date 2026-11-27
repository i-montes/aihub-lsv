import type { Ajustes, Caja, Encuadre, Etiqueta } from "@/lib/en-vivo/geometria";

/** Lo que se lee de la nota. */
export type Nota = {
  url: string;
  titular: string;
  /** Foto destacada en su tamaño original (wp-content/uploads sin parámetros). */
  fotoAlta: string;
  /** La misma foto en el tamaño de og:image, de respaldo. */
  foto: string;
  pie: string;
  etiquetas: string;
  /** Texto hasta el primer intertítulo (h2), un bloque por párrafo o lista. */
  parrafos: string[];
  /** De dónde salió: la conexión de WordPress de la organización o el HTML público. */
  fuente: "wordpress" | "html";
};

/** Una cabeza que lleva etiqueta: índice en `cabezas`, nombre y cargo. */
export type EtiquetaPedida = { indice: number; persona: string; cargo: string };

/**
 * Todo lo que hace falta para rehacer una pieza. Viaja entre el navegador y el servidor: la
 * herramienta no guarda piezas en la base, como envivo-web. Las imágenes van por id de archivo
 * (ver almacen.ts), nunca en el cuerpo.
 */
export type Pieza = {
  url: string;
  /** Titular de la nota, para el nombre del archivo y las analíticas. */
  titularNota: string;
  /** Titular que va en la imagen. */
  titular: string;
  /** Texto del post de Facebook. */
  texto: string;
  foto: {
    /** Id del JPEG normalizado (orientación aplicada) en el almacén. */
    archivo: string;
    ancho: number;
    alto: number;
    /** Nombre del archivo original: pista de quién sale en la foto. */
    nombre: string;
  } | null;
  /** Cabezas en fracciones de la foto (0 a 1). */
  cabezas: Caja[];
  etiquetas: EtiquetaPedida[];
  ajustes: Ajustes;
  /** Lo que resultó de la geometría, para mostrar y para el modelo de cambios. */
  encuadre: Encuadre | null;
  ubicadas: Etiqueta[];
  /**
   * PNG sin etiquetas (foto, capa fija y titular), la huella de lo que lo produjo y sus avisos
   * (titular que no cabe). Se reutiliza mientras la huella no cambie.
   */
  base: { archivo: string; huella: string; avisos?: string[] } | null;
  /** PNG final, con etiquetas. */
  imagen: string | null;
  motor: "plantilla" | "canva";
  diseno: { id: string; editUrl: string | null } | null;
  /** Avisos de la nota y de la foto (resumen, quién es quién). Se conservan entre cambios. */
  avisos: string[];
  /** Avisos de la última composición (etiqueta sin espacio, persona fuera del encuadre). */
  avisosGeometria: string[];
};

/** Uso de un modelo, para sumar costos de varias llamadas. */
export type UsoModelo = {
  inputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
  cachedInputTokens?: number;
  cacheWriteTokens?: number;
};
