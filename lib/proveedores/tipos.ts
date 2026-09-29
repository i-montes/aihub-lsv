/**
 * Proveedores de IA que cada herramienta puede encender desde Ajustes >
 * Herramientas, y lo que se guarda de cada uno. Este archivo no toca la
 * base ni la red: lo importan el navegador y el servidor.
 */

export const PROVEEDORES = ["OPENAI", "ANTHROPIC", "GOOGLE"] as const;
export type Proveedor = (typeof PROVEEDORES)[number];

export const NOMBRE_PROVEEDOR: Record<Proveedor, string> = {
  OPENAI: "OpenAI",
  ANTHROPIC: "Anthropic",
  GOOGLE: "Google",
};

/** Niveles de esfuerzo de razonamiento que admite cada proveedor */
export const ESFUERZOS: Record<Proveedor, readonly string[]> = {
  OPENAI: ["low", "medium", "high", "xhigh"],
  ANTHROPIC: ["low", "medium", "high"],
  GOOGLE: ["minimal", "low", "medium", "high"],
};

/** Verbosidad: sólo OpenAI la tiene */
export const VERBOSIDADES = ["low", "medium", "high"] as const;

/**
 * `null` significa "por defecto del modelo": no se envía la opción al
 * proveedor. Es el valor inicial de todo proveedor nuevo, porque hay modelos
 * que rechazan el esfuerzo o la verbosidad.
 */
export const ESFUERZO_POR_DEFECTO: string | null = null;
export const VERBOSIDAD_POR_DEFECTO: string | null = null;

/** Valor que usan los selectores para "Por defecto del modelo" */
export const VALOR_POR_DEFECTO_DEL_MODELO = "auto";

/** Ausente, vacío, `null` o `"auto"` → `null` (por defecto del modelo) */
function opcionalONulo(valor: unknown): unknown {
  return valor === undefined || valor === null || valor === "" || valor === VALOR_POR_DEFECTO_DEL_MODELO
    ? null
    : valor;
}

/** Herramientas que llevan proveedores, por su identidad en `tools` */
export const HERRAMIENTAS_CON_PROVEEDORES = [
  "proofreader",
  "threads_generator",
  "resume",
  "detector",
  "quien-es-quien",
  "preguntas-chatbot",
] as const;
export type HerramientaConProveedores = (typeof HERRAMIENTAS_CON_PROVEEDORES)[number];

export const NOMBRE_HERRAMIENTA: Record<HerramientaConProveedores, string> = {
  proofreader: "Corrector",
  threads_generator: "Hilos",
  resume: "Resúmenes",
  detector: "Detector",
  "quien-es-quien": "Quién es quién",
  "preguntas-chatbot": "Preguntas a SillaIA",
};

export function esHerramientaConProveedores(valor: unknown): valor is HerramientaConProveedores {
  return typeof valor === "string" && (HERRAMIENTAS_CON_PROVEEDORES as readonly string[]).includes(valor);
}

/** Lo que ve cualquier miembro: proveedor y modelo, en orden */
export interface ProveedorActivo {
  proveedor: Proveedor;
  modelo: string;
}

/** Lo que ve un administrador en el diálogo: todo menos la clave completa */
export interface ProveedorConfigurado extends ProveedorActivo {
  /** `null`: por defecto del modelo */
  reasoningEffort: string | null;
  verbosity: string | null;
  claveEnmascarada: string;
}

/** Lo que manda el diálogo al guardar, ya validado */
export interface ProveedorParaGuardar {
  proveedor: Proveedor;
  modelo: string;
  /** Clave nueva. Ausente si `conservarClave` es verdadero. */
  apiKey?: string;
  conservarClave: boolean;
  /** `null`: por defecto del modelo, no se envía */
  reasoningEffort: string | null;
  verbosity: string | null;
}

export function normalizarProveedor(valor: unknown): Proveedor | null {
  if (typeof valor !== "string") return null;
  const mayusculas = valor.trim().toUpperCase();
  return (PROVEEDORES as readonly string[]).includes(mayusculas) ? (mayusculas as Proveedor) : null;
}

/** Sólo los últimos cuatro caracteres; con cuatro o menos, nada. */
export function enmascararClave(clave: string): string {
  return clave.length > 4 ? `••••${clave.slice(-4)}` : "••••";
}

export type ResultadoValidacion =
  | { ok: true; proveedores: ProveedorParaGuardar[] }
  | { ok: false; error: string; proveedor?: Proveedor };

/**
 * Valida el cuerpo del PUT de configuración. `proveedoresGuardados` son los
 * que ya tienen fila: `conservarClave` sólo vale para ellos.
 */
export function validarCuerpoGuardado(
  cuerpo: unknown,
  proveedoresGuardados: readonly Proveedor[]
): ResultadoValidacion {
  const lista = (cuerpo as { proveedores?: unknown } | null)?.proveedores;
  if (!Array.isArray(lista) || lista.length === 0) {
    return { ok: false, error: "Configura al menos un proveedor con clave y modelo" };
  }

  const resultado: ProveedorParaGuardar[] = [];
  const vistos = new Set<Proveedor>();

  for (const item of lista) {
    const fila = item as Record<string, unknown> | null;
    const proveedor = normalizarProveedor(fila?.proveedor);
    if (!proveedor) return { ok: false, error: "Proveedor desconocido" };
    const nombre = NOMBRE_PROVEEDOR[proveedor];

    if (vistos.has(proveedor)) return { ok: false, error: `${nombre} aparece dos veces`, proveedor };
    vistos.add(proveedor);

    const modelo = typeof fila?.modelo === "string" ? fila.modelo.trim() : "";
    if (!modelo) return { ok: false, error: `Escribe o elige el modelo de ${nombre}`, proveedor };

    const conservarClave = fila?.conservarClave === true;
    const apiKey = typeof fila?.apiKey === "string" ? fila.apiKey.trim() : "";
    if (conservarClave && !proveedoresGuardados.includes(proveedor)) {
      return { ok: false, error: `${nombre} ya no tiene clave guardada; escribe una nueva`, proveedor };
    }
    if (!conservarClave && !apiKey) {
      return { ok: false, error: `Falta la clave de ${nombre}`, proveedor };
    }

    const esfuerzoRecibido = opcionalONulo(fila?.reasoningEffort);
    let reasoningEffort: string | null = ESFUERZO_POR_DEFECTO;
    if (esfuerzoRecibido !== null) {
      if (typeof esfuerzoRecibido !== "string" || !ESFUERZOS[proveedor].includes(esfuerzoRecibido)) {
        return { ok: false, error: `${nombre} no admite el esfuerzo ${String(esfuerzoRecibido)}`, proveedor };
      }
      reasoningEffort = esfuerzoRecibido;
    }

    let verbosity: string | null = null;
    if (proveedor === "OPENAI") {
      const verbosidadRecibida = opcionalONulo(fila?.verbosity);
      verbosity = VERBOSIDAD_POR_DEFECTO;
      if (verbosidadRecibida !== null) {
        if (
          typeof verbosidadRecibida !== "string" ||
          !(VERBOSIDADES as readonly string[]).includes(verbosidadRecibida)
        ) {
          return { ok: false, error: `${nombre} no admite la verbosidad ${String(verbosidadRecibida)}`, proveedor };
        }
        verbosity = verbosidadRecibida;
      }
    }

    resultado.push({
      proveedor,
      modelo,
      ...(conservarClave ? {} : { apiKey }),
      conservarClave,
      reasoningEffort,
      verbosity,
    });
  }

  return { ok: true, proveedores: resultado };
}
