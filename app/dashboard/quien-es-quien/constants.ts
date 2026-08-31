import { z } from "zod";

/** Única organización con la herramienta habilitada */
export const ORGANIZACION_HABILITADA = "La Silla Vacía";

/** Límite del API: nombres más largos devuelven 400 */
export const MAX_NOMBRE_LENGTH = 120;

/**
 * Duración típica del agente, medida por el equipo del API.
 * Se muestra al usuario para que la espera no parezca un cuelgue.
 */
export const DURACION_ESTIMADA_SEGUNDOS = { min: 80, max: 160 };

/** Tope duro del upstream. Pasado ese punto la petición se aborta. */
export const TIMEOUT_SEGUNDOS = 300;

/**
 * Pasos que suele dar el agente. Es una referencia para la barra de progreso,
 * no un dato del API: si el agente pide más pasos, la barra se queda al tope.
 */
export const PASOS_ESTIMADOS = 5;

export const perfilSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "Escribe el nombre de la persona")
    .max(
      MAX_NOMBRE_LENGTH,
      `El nombre no puede pasar de ${MAX_NOMBRE_LENGTH} caracteres`
    ),
});

export type PerfilFormSchema = z.infer<typeof perfilSchema>;

/* ------------------------------------------------------------------ *
 * Verificación del nombre (`/api/nombre`)
 *
 * Paso previo y barato (~$0,003, 3–10 s) que resuelve lo que escribió el
 * usuario contra el archivo. Sirve para no gastar dos minutos y ~$0,20 en un
 * perfil impecable de la persona equivocada.
 * ------------------------------------------------------------------ */

/**
 * `confirmar`: una sola persona, pero igual hay que confirmarla.
 * `elegir`: homónimos o un apellido suelto; escoge el usuario.
 * `sin_resultados`: el archivo no tiene a nadie así; no se llama al generador.
 */
export type EstadoNombre = "confirmar" | "elegir" | "sin_resultados";

/**
 * Cuerpo exacto para `POST /api/perfil`. Se manda tal cual: `confirmado: true`
 * es lo que cambia la instrucción del agente de "si el nombre es ambiguo,
 * elige la figura con más material" a "no lo cambies ni lo completes".
 */
export interface ParaGenerar {
  nombre: string;
  descripcion?: string;
  confirmado?: boolean;
}

/** El perfil que esa persona ya tiene publicado en el sitio */
export interface PerfilPublicado {
  titulo: string;
  link: string;
}

export interface OpcionNombre {
  /** El nombre como lo escribe el archivo: esto es lo que va al generador */
  nombre: string;
  /** Cargo y filiación en una línea; es lo que distingue a dos homónimos */
  descripcion: string;
  /** `alta` (nombrado igual y varias veces) · `media` · `baja` (sólo parecido) */
  confianza: "alta" | "media" | "baja";
  perfil_publicado: PerfilPublicado | null;
  para_generar: ParaGenerar;
}

export interface NombreResultado {
  /** El nombre tal como lo tecleó el usuario */
  consulta: string;
  estado: EstadoNombre;
  /** Frase en español, lista para mostrarse tal cual */
  mensaje: string;
  opciones: OpcionNombre[];
  /** Cuánta evidencia hubo de cada fuente. Sirve para depurar, no para mostrar. */
  fuentes?: {
    perfiles_publicados?: number;
    notas?: number;
    proyectos_de_ley?: number;
  };
}

/** Un paso nuevo del agente */
export interface AvancePaso {
  tipo: "paso";
  paso: number;
}

/** Una búsqueda web. `q` viene en español legible y se muestra tal cual. */
export interface AvanceBusqueda {
  tipo: "busqueda";
  q: string;
  debe_mencionar?: string[];
  resultados: number;
}

/** Una consulta a proyectos de ley del Congreso */
export interface AvanceLeyes {
  tipo: "leyes";
  persona: string;
  rol: string;
  total: number;
}

export type Avance = AvancePaso | AvanceBusqueda | AvanceLeyes;

/**
 * Entradas visibles de la bitácora.
 *
 * Los avances de tipo "paso" no generan entrada: sólo mueven el contador del
 * encabezado.
 */
export type EntradaBitacora = AvanceBusqueda | AvanceLeyes;

export interface PerfilMetricas {
  segundos?: number;
  pasos?: number;
  busquedas?: number;
  consultas_leyes?: number;
  leyes_encontradas?: number;
  caracteres?: number;
  /** Distinto de "end_turn" significa que el perfil pudo quedar corto */
  stop_reason?: string;
  citas?: {
    totales?: number;
    links_unicos?: number;
  };
  links?: {
    encontrados?: number;
    no_usados?: number;
  };
  costo_usd?: {
    total?: number;
  };
}

/** Cuerpo del evento `fin`, idéntico a la respuesta sin streaming */
export interface PerfilResultado {
  personaje: string;
  modelo?: string;
  effort?: string;
  /** El markdown que lee el periodista */
  perfil: string;
  metricas?: PerfilMetricas;
}

export interface PerfilError {
  error: string;
  /** Presente en los errores que genera el proxy */
  status?: number;
  /** El 502 informa cuánto alcanzó a correr el agente antes de morir */
  personaje?: string;
  segundos?: number;
}
