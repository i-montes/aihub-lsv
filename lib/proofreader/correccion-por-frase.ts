import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { TypeSafeClient, choice, noul } from "@typesafe-ai/sdk";
import { generateObject, type LanguageModel } from "ai";
import { z } from "zod";
import { cacheOpenAI, systemCacheado } from "@/lib/prompt-cache";
import type { SuggestionType } from "@/types/proofreader";

/**
 * Corrector de estilo en dos etapas.
 *
 * Antes se mandaba el artículo entero y el manual entero en una sola llamada a
 * un modelo caro, y se esperaba un JSON gigante que en notas largas se truncaba
 * a la mitad. Aquí el trabajo se parte:
 *
 *  1. **Tamiz.** El manual se parte en reglas y el texto en frases. Por cada
 *     frase se le hacen a Jev dos preguntas: un noul de si hay algo roto y un
 *     choice de qué regla del manual es. Van por lotes, con el manual en el
 *     `state`. Los tokens de salida no se cobran.
 *  2. **Corrección.** Sólo las frases que pasan el umbral van al modelo caro, y
 *     van con las reglas concretas que fallaron, no con el manual completo.
 *
 * Las dos etapas van en paralelo por dentro, así que la latencia es la de la
 * tanda más lenta y no la de la suma.
 */

// ---------------------------------------------------------------------------
// Configuración
// ---------------------------------------------------------------------------

/**
 * Probabilidad mínima para mandar una frase a corregir.
 *
 * Ojo, no confundir con las reglas candidatas: ahí no hay corte, van siempre
 * las primeras. Este umbral es lo otro, y decide si la frase llega siquiera al
 * corrector.
 *
 * Medido sobre un artículo real de 87 frases: con 0,45 se marcaban 39 (45%
 * del texto) y el corrector devolvía vacío en más de la mitad. La franja de
 * 0,45 a 0,60 resultó ser casi toda ruido, y se reconoce porque ahí la regla
 * más votada también viene floja —0,08, 0,18, 0,22—: cuando Jev duda de que
 * haya algo roto, tampoco sabe de qué. Con 0,6 quedan 27 frases (31%).
 *
 * Subirlo no vuelve ciego al corrector: lo que entra sigue trayendo 15 reglas
 * candidatas en vez de 8, así que la buena viaja igual.
 */
const UMBRAL = Number(process.env.PROOFREADER_UMBRAL_TAMIZ ?? 0.6);

/** Jev admite 1.200 peticiones por minuto; con 12 en vuelo sobra holgura. */
const TAMIZ_SIMULTANEAS = Number(process.env.PROOFREADER_TAMIZ_SIMULTANEAS ?? 12);

/** Mucho más bajo: OpenAI, Anthropic y Google tienen límites más estrechos. */
const CORRECCION_SIMULTANEAS = Number(
  process.env.PROOFREADER_CORRECCION_SIMULTANEAS ?? 6,
);

/** Una frase da unas pocas correcciones; si se dispara, está reescribiendo. */
const MAX_TOKENS_POR_FRASE = 1200;

/**
 * Modelo con el que se corrigen las frases marcadas.
 *
 * No es el que el usuario elige en la interfaz, y es a propósito: ese selector
 * está pensado para una llamada grande por artículo, mientras que aquí son
 * decenas de llamadas cortas y paralelas, una por frase. Lo que conviene es un
 * modelo rápido y barato, no el más capaz.
 *
 * El selector de la interfaz sigue mandando en el flujo viejo de una sola
 * llamada, y también aquí si la organización no tiene clave de OpenAI.
 */
export const MODELO_CORRECTOR = {
  provider: "openai",
  model: process.env.PROOFREADER_MODELO_CORRECCION || "gpt-5.6-luna",
};

/** Frases más cortas no tienen reglas que incumplir y gastarían una llamada. */
const LARGO_MINIMO_FRASE = 12;

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** Una regla suelta del manual, lista para preguntársela a Jev. */
type Regla = {
  id: string;
  /** Sección del manual de la que sale ("Puntuación", "Siglas y acrónimos"). */
  categoria: string;
  /** Categoría de error con la que se pinta la sugerencia en la UI. */
  tipo: SuggestionType;
  /** La regla tal como está escrita en el manual, sin reescribir. */
  texto: string;
};

/** Una frase del texto, con su posición para poder darle contexto. */
type Frase = { indice: number; texto: string };

/** Una frase que superó el umbral, con sus reglas candidatas. */
type FraseMarcada = {
  frase: Frase;
  /** Probabilidad, según el noul, de que la frase tenga algo roto. */
  rompe: number;
  /** Reglas más señaladas por el choice, de la más probable a la menos. */
  incumple: Array<{ regla: Regla; probabilidad: number }>;
};

/**
 * Lo que pasó con una frase, para poder reconstruir el análisis después.
 *
 * El proceso reparte el trabajo entre dos modelos y descarta frases por el
 * camino, así que sin esto no hay forma de saber por qué una corrección salió
 * —o por qué no salió— sin volver a correrlo todo.
 */
export type PasoDeFrase = {
  indice: number;
  texto: string;
  /** Milisegundo, desde que arrancó el análisis, en que respondió el tamiz. */
  msTamiz: number;
  /** Probabilidad del noul de que la frase tenga algo roto. */
  rompe: number;
  /**
   * El reparto del choice, de mayor a menor. Se guardan más de las que se le
   * mandan al corrector: `enviada` marca cuáles cruzaron el corte, que es lo
   * que hace falta para saber si se está cortando demasiado pronto.
   */
  candidatas: Array<{
    id: string;
    regla: string;
    categoria: string;
    probabilidad: number;
    enviada?: boolean;
  }>;
  /** Si superó el umbral y se mandó a corregir. */
  marcada: boolean;
  /** Milisegundo en que respondió el corrector, si se llegó a llamar. */
  msCorreccion?: number;
  /**
   * Lo que devolvió el corrector para esta frase, incluidas las que el código
   * descartó después: `descartada` dice por qué no llegó a la interfaz.
   */
  correcciones?: Array<{
    original: string;
    suggestion: string;
    explanation: string;
    descartada?: string;
  }>;
  /** Qué falló, si falló: el tamiz o el corrector. */
  error?: "tamiz" | "correccion";
};

/** Una corrección en la forma que ya espera el editor del Hub. */
export type CorreccionPlana = {
  original: string;
  suggestion: string;
  type: SuggestionType;
  explanation: string;
  /** La regla del manual que la motivó, para poder contrastarla en la UI. */
  regla?: string;
  categoria?: string;
  /** Lo que el noul le dio a la frase; sirve para dudar de las flojas. */
  confianza?: number;
};

/** Una petición del tamiz, para poder mirarla desde el modal de proceso. */
export type PeticionTamiz = {
  n: number;
  frases: number;
  preguntas: number;
  tokens: number;
  ms: number;
};

export type ResultadoPorFrase = {
  correcciones: CorreccionPlana[];
  /** Frase por frase, qué pasó y cuándo. Alimenta el modal de proceso. */
  traza: PasoDeFrase[];
  /**
   * El cuerpo de la primera petición, tal cual se envió.
   *
   * Sólo la primera: todas tienen la misma forma y el mismo manual dentro, así
   * que mandar las nueve al navegador sería repetir el catálogo nueve veces.
   */
  ejemploPeticion: unknown;
  /** Una fila por petición, para ver cómo se repartió el trabajo. */
  peticiones: PeticionTamiz[];
  /**
   * Lo que se le manda al modelo corrector para una frase: las instrucciones
   * con el manual completo, que van en el `system` y son iguales para todas, y
   * el mensaje de una frase concreta con sus reglas sospechosas.
   */
  ejemploCorreccion: { modelo: string; system: string; prompt: string } | null;
  /** Números para las analíticas y el panel de depuración. */
  detalle: {
    frases: number;
    frasesMarcadas: number;
    frasesConErrorEnTamiz: number;
    frasesConErrorEnCorreccion: number;
    reglas: number;
    /** Peticiones a Jev; una por lote de frases, no una por frase. */
    peticionesTamiz: number;
    umbral: number;
    modeloTamiz: string | null;
    tokensTamiz: number;
    /** Modelo que hizo las correcciones, que no tiene por qué ser el elegido. */
    modeloCorrector: string;
    msTotal: number;
  };
  /** Consumo del modelo corrector; es el que cuesta y el que se factura. */
  uso: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cachedInputTokens: number;
    cacheWriteTokens: number;
    reasoningTokens: number;
  };
};

// ---------------------------------------------------------------------------
// 1. El catálogo de reglas
// ---------------------------------------------------------------------------

/**
 * Las reglas del manual, escritas a mano.
 *
 * Antes se sacaban del prompt guardado en Supabase con expresiones regulares.
 * No funcionó: el manual real es un Markdown de 23.000 caracteres con viñetas
 * anidadas, ejemplos marcados con ✅/❌ y secciones numeradas, y el parser
 * devolvía 169 "reglas" que en su mayoría eran ejemplos sueltos ("✅ Verde
 * Oxígeno"), fragmentos a media frase o instrucciones del formato de salida.
 * Con 169 opciones el Choice reparte la probabilidad tan fina que las reglas
 * de verdad —la de siglas, por ejemplo— no llegaban ni al umbral mínimo.
 *
 * Aquí están una por una, atómicas y autocontenidas. El manual completo sigue
 * yendo al modelo corrector en la segunda etapa, así que lo que esta lista
 * necesita no es reproducirlo entero sino nombrar cada cosa que se puede
 * incumplir, con los ejemplos justos para no confundirla con su vecina.
 *
 * Al final van las reglas generales de ortografía y gramática, que el manual
 * da por sabidas porque no las escribe: sin ellas una tilde comida no tendría
 * ninguna opción a la que asignarse.
 *
 * Cuando el manual del Hub cambie, esta lista hay que tocarla a mano. Es el
 * precio de que el tamiz sea predecible.
 */
const CATALOGO: Array<Omit<Regla, "id">> = [
  // --- Donde La Silla se aparta de la RAE (máxima prioridad) ---------------
  { categoria: "Gobierno", tipo: "spelling", texto: "«gobierno» va SIEMPRE en minúscula, incluso en «gobierno Petro» o «gobierno Santos». La única excepción es al inicio de oración. Si ya está en minúscula, está correcto." },
  { categoria: "Siglas", tipo: "style", texto: "Las siglas de 3 letras o menos van en mayúsculas sostenidas y sin puntos: ONU, JEP, ELN, ONG, PIB, IVA, CNE, DNP, FBI. Es error escribir O.N.U. o F.B.I." },
  { categoria: "Siglas", tipo: "style", texto: "CUALQUIER sigla de 4 letras o más va sólo con la primera letra en mayúscula, aunque la grafía oficial use mayúscula sostenida. La regla vale para toda sigla, esté o no en estos ejemplos: Farc, Otan, Unicef, Dane, Sena, Icbf, Invima, Conpes, Fecode. Es error escribir FARC, OTAN, UNICEF, DANE, ICBF." },
  { categoria: "Siglas", tipo: "style", texto: "Las siglas no se pluralizan con «s»: se escribe «las ONG» y «las Farc», nunca «las ONGs» ni «las Farcs»." },
  { categoria: "Siglas", tipo: "spelling", texto: "Los acrónimos pronunciables llevan tilde cuando la acentuación lo exige, porque se tratan como palabras comunes: Sisbén, Dijín. Es error escribir Sisben o Dijin." },
  { categoria: "Siglas", tipo: "style", texto: "Excepciones que NO se tocan: EE.UU. conserva sus puntos; las abreviaturas de ministerios con mayúscula interna (MinHacienda, MinTIC, MinSalud) son nombres propios y no siglas; los partidos enumerados en el manual conservan su grafía aunque contradiga el conteo de letras, como ALMA." },
  { categoria: "Siglas", tipo: "style", texto: "No se cambian los guiones de una sigla ni se unen o separan las combinaciones de sigla y número, que conservan su grafía oficial: M-19 con guion, COP30 unido." },

  // --- Cifras con mil y millones -------------------------------------------
  { categoria: "Cifras", tipo: "style", texto: "Los separadores son punto para los miles y coma para los decimales: 1.245.557,88." },
  { categoria: "Cifras", tipo: "style", texto: "El numeral que acompaña a «mil» o «millones» va siempre en cifras, aunque esté entre 1 y 10: «5 millones», «3 mil». Es error «cinco millones» o «tres mil»." },
  { categoria: "Cifras", tipo: "style", texto: "Una cantidad se escribe con «mil» o «millones» sólo si cabe en un solo numeral, con un decimal como máximo para «millones» y ninguno para «mil»: 13 mil, 574 mil, 5 millones, 2,5 millones. Si no cabe, va la cifra completa y no hay corrección: 1.750.000, 23.400, 13.092. Es error componer «1 millón 750 mil» o «23,4 mil»." },

  // --- Grafías editoriales obligatorias ------------------------------------
  { categoria: "Grafías", tipo: "style", texto: "Las cabeceras propias se escriben así: La Silla Vacía (o La Silla), La Silla Llena, La Silla Académica, La Silla Datos, Detector de Mentiras, Huevos Revueltos con Política." },
  { categoria: "Grafías", tipo: "style", texto: "«paz total» va en minúscula. Es error «Paz Total» o «Paz total»." },
  { categoria: "Grafías", tipo: "spelling", texto: "Se escriben en una sola palabra, sin guion ni espacio: posacuerdo, posconflicto, centroderecha, centroizquierda." },
  { categoria: "Grafías", tipo: "style", texto: "Los cargos en femenino se escriben en femenino: vicepresidenta, alcaldesa, concejala, lideresa, jueza." },
  { categoria: "Grafías", tipo: "spelling", texto: "«pódcast» lleva tilde, en singular y en plural." },
  { categoria: "Grafías", tipo: "style", texto: "Se escribe «noticias clave», nunca «noticias claves»." },
  { categoria: "Grafías", tipo: "style", texto: "Se escribe «Lista Clinton» con mayúscula inicial en las dos palabras, nunca «lista Clinton»." },
  { categoria: "Grafías", tipo: "style", texto: "Se escribe «Acuerdo de Paz», tanto el de las Farc como el del ELN. Es error «acuerdo de Paz»." },
  { categoria: "Grafías", tipo: "style", texto: "Se escribe «Revista Semana» con mayúscula. No se extiende a otras revistas que el manual no enumera." },
  { categoria: "Grafías", tipo: "style", texto: "El apellido «de la Espriella» lleva la partícula en minúscula cuando va inmediatamente después del nombre de pila («Abelardo de la Espriella») y en mayúscula cuando no («De la Espriella dijo», «amigo de De la Espriella»). El «la» va siempre en minúscula: «De La Espriella» es error." },
  { categoria: "Grafías", tipo: "style", texto: "Los partidos conservan su grafía oficial: Pacto Histórico, Centro Democrático, Cambio Radical, ALMA, Partido Liberal, Partido Conservador, Verde, ASI, Colombia Renaciente, Fuerza de la Paz, Nuevo Liberalismo, Dignidad, Mira, Fuerza Ciudadana, Comunes, Verde Oxígeno, Creemos, Partido de La U, Salvación Nacional, Mais, Aico, En Marcha. Se mantienen los guiones de las coaliciones." },

  // --- Puntuación -----------------------------------------------------------
  { categoria: "Puntuación", tipo: "punctuation", texto: "Nunca va coma separando directamente el sujeto del verbo principal: «El presidente, firmó el decreto» es error. Sí es válida cuando entre los dos hay un inciso o un complemento: «El presidente, en su primer año, firmó el decreto». También va coma cuando la lista de sujetos termina en «etc.»." },
  { categoria: "Puntuación", tipo: "punctuation", texto: "Van coma obligatoria: antes de «ya que», «pues», «puesto que» y «dado que»; después del vocativo («Buenas tardes, fiscal»); y después de las expresiones de enlace («De hecho,», «Sin embargo,»)." },
  { categoria: "Puntuación", tipo: "punctuation", texto: "Va coma antes de «pero», salvo en dos casos: cuando «pero» precede a una pregunta («Pero ¿por qué llegaron tarde?») y cuando contrapone cualidades («La ciudad es linda pero insegura»)." },
  { categoria: "Puntuación", tipo: "punctuation", texto: "Los incisos se abren y se cierran con el mismo signo, sea coma, raya o paréntesis: «Juan, presidente del comité, llegó»." },

  // --- Comillas y citas -----------------------------------------------------
  { categoria: "Comillas", tipo: "punctuation", texto: "Las comillas dobles se usan para citas directas, alias y títulos; las sencillas, dentro de las dobles o para el sentido aproximado." },
  { categoria: "Comillas", tipo: "punctuation", texto: "La cita directa va después de dos puntos y empieza con mayúscula. La cita indirecta va sin comillas y sin dos puntos." },
  { categoria: "Comillas", tipo: "punctuation", texto: "El punto va siempre después de las comillas, las rayas o los paréntesis: «Dijo: \"No es cierto\".» Es error «Dijo: \"No es cierto.\"»." },
  { categoria: "Comillas", tipo: "style", texto: "Dentro de una cita textual se aplica la grafía del manual y se corrigen los errores evidentes, pero nunca se reformula ni se cambian las palabras." },

  // --- Concordancias --------------------------------------------------------
  { categoria: "Concordancia", tipo: "grammar", texto: "El verbo «haber» existencial va siempre en singular: «Habrá muchas personas», nunca «Habrán muchas personas»." },
  { categoria: "Concordancia", tipo: "grammar", texto: "Las construcciones partitivas llevan el verbo en plural: «La mayoría de votantes eligieron»." },
  { categoria: "Concordancia", tipo: "grammar", texto: "«le» y «les» concuerdan en número con el objeto indirecto al que se refieren." },
  { categoria: "Concordancia", tipo: "grammar", texto: "Los eventos «se inician», no «inician»." },

  // --- Prefijos -------------------------------------------------------------
  { categoria: "Prefijos", tipo: "spelling", texto: "Los prefijos (ex, anti, vice, pro, pre) se escriben unidos cuando la base es una sola palabra: preelectoral, anticuerpo, exministro, vicepresidente, antivacuna. Es error «ex ministro», «anti-cuerpo» o «vice-presidente»." },
  { categoria: "Prefijos", tipo: "spelling", texto: "Cuando el prefijo afecta a una expresión de varias palabras va separado por un espacio y sin guion: «ex primer ministro», «ex ministro del Interior», «pro Unión Europea». Es error «exprimer ministro» o «pro-Unión Europea»." },
  { categoria: "Prefijos", tipo: "spelling", texto: "El prefijo va con guion cuando le sigue un número, una sigla o un nombre propio: sub-17, anti-ONG, pro-Biden, ex-Farc." },

  // --- Tildes ---------------------------------------------------------------
  { categoria: "Tildes", tipo: "spelling", texto: "Las mayúsculas llevan tilde: Álvaro, África." },
  { categoria: "Tildes", tipo: "spelling", texto: "«este» y «esta» van sin tilde, salvo ambigüedad real." },
  { categoria: "Tildes", tipo: "spelling", texto: "«solo» va sin tilde por defecto, signifique «solamente» o «sin compañía». Sólo se tilda cuando sin la tilde la frase quedaría genuinamente ambigua." },

  // --- Números y fechas -----------------------------------------------------
  { categoria: "Números y fechas", tipo: "style", texto: "Las fechas van en cifras: «1 de febrero de 2021». Es error «primero de febrero de 2021»." },
  { categoria: "Números y fechas", tipo: "style", texto: "Las horas van en cifras, en formato de 12 horas y con «de la mañana», «de la tarde» o «de la noche»: «3 de la tarde». Es error «15:00» y también «tres de la tarde»." },
  { categoria: "Números y fechas", tipo: "style", texto: "Los porcentajes van en cifra con el símbolo %: «15%», «3%». Es error «quince por ciento» o «3 por ciento»." },
  { categoria: "Números y fechas", tipo: "style", texto: "Un número entero entre 1 y 10 escrito en cifras va en letras cuando cuantifica directamente a un sustantivo que le sigue y no hay unidad de medida ni identificador: «3 personas» debe ser «tres personas». No aplica a fechas, horas, gráficas, carreras, decimales ni rangos con unidad." },
  { categoria: "Números y fechas", tipo: "style", texto: "Un número mayor de 10 escrito en letras va en cifras, salvo que abra la oración o sea una expresión lexicalizada: «treinta días» debe ser «30 días», pero «Treinta días después» y «las mil y una noches» son correctos." },

  // --- Mayúsculas y minúsculas ---------------------------------------------
  { categoria: "Mayúsculas", tipo: "spelling", texto: "Los nombres de cargos van en minúscula: «el presidente Petro», «la ministra», «el fiscal general». Sólo van en mayúscula si forman parte del nombre oficial de una institución." },
  { categoria: "Mayúsculas", tipo: "spelling", texto: "Van en minúscula los meses, los días, las estaciones, los gentilicios, las etnias y las ideologías (uribismo, neoliberalismo)." },

  // --- Estilo editorial -----------------------------------------------------
  { categoria: "Estilo", tipo: "style", texto: "Las frases buscan un máximo de 18 palabras de promedio. Sólo se marcan los casos extremos en que la longitud daña claramente la comprensión." },
  { categoria: "Estilo", tipo: "style", texto: "Se evitan los verbos comodín cuando existe uno más preciso: «permitir», «generar», «presentar». Sólo se corrige cuando el verbo preciso es claramente mejor en contexto." },

  // --- Las generales, que el manual da por sabidas --------------------------
  { categoria: "Ortografía", tipo: "spelling", texto: "Las palabras están bien escritas y bien acentuadas según la ortografía del español: sin letras cambiadas, sin tildes comidas ni sobrantes." },
  { categoria: "Gramática", tipo: "grammar", texto: "Hay concordancia de género y número entre el sustantivo y sus determinantes y adjetivos, y entre el sujeto y su verbo." },
  { categoria: "Gramática", tipo: "grammar", texto: "El régimen preposicional y los tiempos verbales son los que corresponden; no hay dequeísmo, queísmo ni cambios de tiempo injustificados." },
  { categoria: "Redacción", tipo: "style", texto: "No hay redundancias, pleonasmos ni muletillas que sobren en una frase periodística." },
  { categoria: "Redacción", tipo: "style", texto: "No hay extranjerismos evitables cuando existe una palabra equivalente en español." },
];

/** El catálogo con su id, que es lo que viaja como opción del Choice. */
export function reglasDelManual(): Regla[] {
  return CATALOGO.map((regla, i) => ({ ...regla, id: `r${i}` }));
}

// ---------------------------------------------------------------------------
// 2. El texto se parte en frases
// ---------------------------------------------------------------------------

/**
 * Corta el texto en frases con `Intl.Segmenter`, que sabe de abreviaturas y
 * comillas en español y no parte "EE. UU." ni "3 p.m." como haría un split por
 * punto. Node 20 lo trae de serie; si faltara, cae a un corte por signos.
 */
export function partirEnFrases(texto: string): Frase[] {
  const crudas =
    typeof Intl !== "undefined" && "Segmenter" in Intl
      ? Array.from(
          new Intl.Segmenter("es", { granularity: "sentence" }).segment(texto),
          (s) => s.segment,
        )
      : texto.split(/(?<=[.!?…]+[")»”']*)\s+/);

  const frases: Frase[] = [];
  for (const cruda of crudas) {
    const contenido = cruda.trim();
    if (contenido.length < LARGO_MINIMO_FRASE) continue;
    frases.push({ indice: frases.length, texto: contenido });
  }

  return frases;
}

/**
 * Las frases vecinas, recortadas, para acompañar a la que se revisa. Sin ellas
 * la concordancia con un antecedente o la atribución de una cita se juzgan a
 * ciegas; se recortan porque son para desambiguar, no para corregirlas.
 */
function contextoDe(frases: Frase[], indice: number, max = 300) {
  const recortar = (f?: Frase) => (f ? f.texto.slice(0, max) : null);
  return { anterior: recortar(frases[indice - 1]), siguiente: recortar(frases[indice + 1]) };
}

// ---------------------------------------------------------------------------
// 3. El tamiz con Jev
// ---------------------------------------------------------------------------


/**
 * Frases por petición.
 *
 * El manual entero viaja en el `state` de cada petición, así que conviene que
 * lo aproveche más de una frase; pero un lote grande tarda más y, si falla,
 * se lleva por delante todas sus frases. Diez es el punto medio, y de paso
 * cada frase queda con sus vecinas dentro del mismo state como contexto.
 *
 * Medido contra la API: cada petición cuesta 4.200 tokens del catálogo más
 * 700 por frase. Como el techo son 64k por petición, el máximo real son ~85
 * frases; con 100 se pasa (74.200) y devuelve 422, y al caerse el tamiz entero
 * el corrector vuelve al flujo viejo sin avisar.
 *
 * El catálogo se reenvía en cada petición, así que lotes chicos salen caros:
 * de a 1 son 4.901 tokens por frase, de a 10 son 1.119 y de a 20 son 909. De
 * 20 en adelante ya se gana poco (40 da 804) y se dobla lo que se pierde si
 * una petición falla.
 */
const LOTE_FRASES = Number(process.env.PROOFREADER_LOTE_FRASES ?? 20);

/**
 * Cuántas reglas candidatas se le pasan al corrector por frase.
 *
 * Sin corte por probabilidad, y a propósito. El Choice reparte 1 entre las 53
 * reglas, así que la que acierta puede quedarse en 0,08 y aun así ser la
 * buena: con un mínimo de 0,1 se perdían casos reales —una frase con ESAP y
 * EAFIT se marcaba como rota pero la regla de siglas no llegaba a pasar—.
 *
 * Quince en vez de tres cuestan unos 700 tokens más por frase marcada, que al
 * lado de lo que cuesta la llamada no es nada. Y el riesgo es bajo: al
 * corrector se le dice que son sospechas y que devuelva lista vacía si la
 * frase está bien.
 *
 * Es la contrapartida de haber subido el umbral: entran menos frases, pero
 * cada una llega con casi todo el reparto encima, así que subir el corte de
 * arriba no puede costar una regla abajo.
 */
const CANDIDATAS_MAX = Number(process.env.PROOFREADER_CANDIDATAS ?? 15);

/** Se guardan más de las que se envían, para poder ver dónde cae el corte. */
const CANDIDATAS_EN_TRAZA = 20;

/**
 * Dos preguntas por frase, no una por regla.
 *
 * La primera versión de esto hacía un `noul` por cada regla del manual: 17
 * preguntas por frase, y el texto de la pregunta repetido en cada una era el
 * 62% de todo lo que se enviaba. El patrón correcto es el del cookbook de
 * búsqueda línea por línea de TypeSafe:
 *
 *  - un **Choice** que reparte la probabilidad entre las reglas del manual, y
 *    que va a señalar alguna aunque la frase esté impecable, porque siempre
 *    reparte 1;
 *  - un **Noul** aparte que dice si de verdad hay algo roto, que es lo que
 *    decide si ese reparto se mira o se tira.
 *
 * Las dos van en la misma petición sobre el mismo `state` y se resuelven en
 * paralelo, pero cada una se contesta por su cuenta y ninguna ve la respuesta
 * de la otra. Por eso las dos tienen que sostenerse solas: el choice no puede
 * apoyarse en que el noul ya dijo que hay una infracción.
 *
 * El reparto entre `state` y pregunta sigue al cookbook: en el `state` va
 * aquello entre lo que se elige —las reglas, etiquetadas por id— y en la
 * pregunta va el sujeto que se juzga, que aquí es la frase. Las frases NO van
 * en el `state`: si fueran, la pregunta sólo podría apuntar "F037" y el modelo
 * tendría que ir a buscarla entre las demás del lote; llevándola dentro, cada
 * pregunta se contesta sola.
 *
 * El ahorro está en que las opciones del Choice van **sin descripción**: los
 * textos de las reglas viven en el `state` y se envían una vez por lote, no
 * una vez por pregunta.
 */
const PREGUNTA_ROMPE =
  "¿La `frase_revisada` incumple alguna regla de `manual_de_estilo`?";

const CRITERIOS_ROMPE = {
  true: "hay en la frase uno o mas fragmentos concretos que habría que cambiar para cumplir el manual",
  false: "la frase cumple el manual tal como está",
};

/**
 * Va en plural y sin dar por hecho que hay algo roto, por dos motivos.
 *
 * El primero es que las dos preguntas no se ven entre sí: el choice no sabe qué
 * contestó el noul, así que preguntarle "cuál es LA que incumple" le mete de
 * contrabando que ya hay una infracción. Tiene que sostenerse solo.
 *
 * El segundo es cómo se consume la respuesta. El choice reparte 1 entre todas
 * las reglas; preguntado en singular concentra la masa en su favorita y hunde a
 * las demás, pero aquí lo que se quiere es una lista corta de sospechosas, y en
 * plural el reparto deja arriba a todas las que de verdad aplican.
 */
const PREGUNTA_REGLA =
  "¿Cuáles de las reglas de `manual_de_estilo` son las que incumple la `frase_revisada`?";

/**
 * Marca cada sigla con su número de letras, sólo para el tamiz.
 *
 * La regla del manual se parte en dos según el largo —hasta 3 letras van en
 * mayúscula sostenida, de 4 en adelante sólo la inicial— y contar letras es
 * una tarea simbólica que el modelo hace mal: con `ESAP`, de cuatro letras,
 * Jev apostaba por la regla de tres. Contándolo aquí, el modelo ya no tiene
 * que contar, sólo decidir.
 *
 * `La ESAP y la EAFIT firmaron` → `La ESAP(4) y la EAFIT(5) firmaron`
 *
 * La anotación NO llega nunca al corrector: su campo `original` tiene que ser
 * una copia literal de la frase para poder ubicarla en el documento, y
 * `ESAP(4)` no existe en el texto. Por eso se aplica al armar la pregunta y no
 * sobre la frase, que se guarda intacta.
 */
function anotarSiglas(texto: string | null): string | null {
  if (!texto) return texto;
  // Entre 3 y 10 letras: por debajo no hay ambigüedad de regla y por encima ya
  // no es una sigla sino una palabra en mayúsculas o un titular gritado.
  return texto.replace(
    /\b[A-ZÁÉÍÓÚÑÜ]{3,10}\b/g,
    (sigla) => `${sigla}(${sigla.length})`,
  );
}

/**
 * Pasa el texto por Jev y devuelve las frases que hay que corregir, con sus
 * reglas candidatas.
 *
 * Una frase que falle no tumba el análisis. Si fallan todos los lotes, lanza,
 * para que quien llama caiga al flujo viejo.
 */
async function tamizar(
  cliente: TypeSafeClient,
  frases: Frase[],
  reglas: Regla[],
  arranque: number,
  señal?: AbortSignal,
) {
  // Las opciones del Choice son sólo los identificadores. `null` deja la
  // etiqueta sin describir: el texto de cada regla ya está en el state.
  const opciones = Object.fromEntries(reglas.map((r) => [r.id, null]));
  const porId = new Map(reglas.map((r) => [r.id, r]));
  const manual = reglas.map((r) => ({ id: r.id, seccion: r.categoria, regla: r.texto }));

  const lotes: Frase[][] = [];
  for (let i = 0; i < frases.length; i += LOTE_FRASES) {
    lotes.push(frases.slice(i, i + LOTE_FRASES));
  }

  let tokens = 0;
  let modelo: string | null = null;
  let frasesConError = 0;
  const traza = new Map<number, PasoDeFrase>();
  const peticiones: PeticionTamiz[] = [];
  let ejemploPeticion: unknown = null;

  const porLote = await enParalelo(lotes, TAMIZ_SIMULTANEAS, async (lote) => {
    // Cada frase lleva una etiqueta corta para que las preguntas puedan
    // señalarla dentro del lote, como los `L052|` del cookbook.
    const etiqueta = (f: Frase) => `F${String(f.indice).padStart(3, "0")}`;

    const questions: Record<string, ReturnType<typeof noul> | ReturnType<typeof choice>> = {};
    for (const frase of lote) {
      const e = etiqueta(frase);
      // Cada pregunta lleva su propia frase y sus vecinas. El texto se repite
      // en las dos preguntas de esa frase —unas decenas de tokens— a cambio de
      // que ninguna tenga que ir a buscar nada dentro del state.
      const contexto = contextoDe(frases, frase.indice);
      const sujeto = {
        frase_revisada: anotarSiglas(frase.texto),
        frase_anterior: anotarSiglas(contexto.anterior),
        frase_siguiente: anotarSiglas(contexto.siguiente),
        nota: "El número entre paréntesis después de una palabra en mayúsculas es su cantidad de letras, puesta por el sistema. No forma parte del texto.",
      };

      questions[`rompe_${e}`] = noul(
        { ...sujeto, pregunta: PREGUNTA_ROMPE },
        CRITERIOS_ROMPE,
      );
      questions[`regla_${e}`] = choice(
        { ...sujeto, pregunta: PREGUNTA_REGLA },
        opciones,
      );
    }

    // El cuerpo se arma antes de enviarlo para poder guardarlo tal cual: lo
    // que se muestra en el modal es la petición de verdad, no una maqueta.
    const cuerpo = {
      state: { manual_de_estilo: manual },
      questions,
      model: process.env.TYPESAFE_DEFAULT_MODEL || "jev-latest",
    };
    const t0 = Date.now();

    try {
      const respuesta = await cliente.systemOne(
        { state: cuerpo.state, questions },
        { signal: señal },
      );

      tokens += respuesta.usage.input_tokens;
      modelo ??= respuesta.model;
      ejemploPeticion ??= cuerpo;
      peticiones.push({
        n: peticiones.length + 1,
        frases: lote.length,
        preguntas: Object.keys(questions).length,
        tokens: respuesta.usage.input_tokens,
        ms: Date.now() - t0,
      });

      const msTamiz = Date.now() - arranque;

      return lote.flatMap((frase) => {
        const e = etiqueta(frase);
        const rompe = (respuesta.answers[`rompe_${e}`] as { noul?: number })?.noul ?? 0;

        const distribucion =
          (respuesta.answers[`regla_${e}`] as { probabilities?: Record<string, number> })
            ?.probabilities ?? {};

        // El Choice reparte la probabilidad entre todas las reglas, así que se
        // le pasan al corrector las más señaladas y no sólo la ganadora: una
        // frase puede romper dos cosas y el reparto las deja a las dos arriba.
        const ordenadas = Object.entries(distribucion)
          .sort(([, a], [, b]) => b - a)
          .flatMap(([id, probabilidad]) => {
            const regla = porId.get(id);
            return regla ? [{ regla, probabilidad }] : [];
          });

        const incumple = ordenadas.slice(0, CANDIDATAS_MAX);

        // La traza guarda TODAS las frases, no sólo las marcadas: saber qué se
        // descartó y con qué probabilidad es justo lo que hace falta para
        // calibrar el umbral.
        const marcada = rompe >= UMBRAL && incumple.length > 0;
        traza.set(frase.indice, {
          indice: frase.indice,
          texto: frase.texto,
          msTamiz,
          rompe,
          marcada,
          // Se guardan más de las que se envían: la traza sirve para ver el
          // reparto completo y dónde queda el corte, no sólo lo que pasó.
          candidatas: ordenadas
            .slice(0, CANDIDATAS_EN_TRAZA)
            .map(({ regla, probabilidad }, i) => ({
              id: regla.id,
              regla: regla.texto,
              categoria: regla.categoria,
              probabilidad,
              enviada: i < CANDIDATAS_MAX,
            })),
        });

        return marcada ? [{ frase, incumple, rompe }] : [];
      });
    } catch {
      // Un lote caído no puede tumbar el análisis entero: se cuenta y sigue.
      frasesConError += lote.length;
      for (const frase of lote) {
        traza.set(frase.indice, {
          indice: frase.indice,
          texto: frase.texto,
          msTamiz: Date.now() - arranque,
          rompe: 0,
          marcada: false,
          candidatas: [],
          error: "tamiz",
        });
      }
      return [];
    }
  });

  if (frases.length > 0 && frasesConError === frases.length) {
    throw new Error("El tamiz con Jev falló en todas las frases");
  }

  return {
    marcadas: porLote.flat(),
    conError: frasesConError,
    tokens,
    peticiones,
    modelo,
    traza,
    ejemploPeticion,
  };
}

// ---------------------------------------------------------------------------
// 4. La corrección de las frases marcadas
// ---------------------------------------------------------------------------

const EsquemaFrase = z.object({
  correcciones: z.array(
    z.object({
      original: z
        .string()
        .describe("Copia literal del fragmento con el error, tal como aparece en la frase"),
      suggestion: z.string().describe("El mismo fragmento ya corregido"),
      regla_id: z.string().describe("El id de la regla incumplida, de la lista de reglas marcadas"),
      explanation: z.string().describe("Por qué está mal y cómo se corrige, en una o dos frases"),
    }),
  ),
});

/**
 * Van en el `system` junto al manual completo porque son el prefijo estable de
 * todas las llamadas de un análisis: así el caché de prompt las cobra una vez.
 */
const INSTRUCCIONES = `Eres el corrector de estilo de un medio digital colombiano.

Recibes UNA frase de una noticia y la lista de reglas del manual que, según un
primer filtro, esa frase podría estar incumpliendo. Tu tarea es decidir si de
verdad las incumple y, si es así, devolver la corrección.

Reglas de la tarea:
- Corrige ÚNICAMENTE lo que señalan las reglas que te llegan. Vienen del manual
  y traen sus propios ejemplos: son todo lo que necesitas. No revises la frase
  en busca de otros errores.
- Están ordenadas de más a menos probable y son SOSPECHAS de un filtro, no un
  diagnóstico.
- El filtro se equivoca: si la frase está bien, devuelve una lista vacía. No
  inventes un error para justificar la marca.
- El campo "original" tiene que ser una copia literal de un fragmento de la
  frase revisada, carácter por carácter, sin reescribirlo ni normalizarlo. Es
  lo que permite ubicar la corrección dentro del documento.
- Recorta ese fragmento al mínimo que hay que cambiar, no a la frase entera.
- No corrijas nada que esté en la frase anterior o en la siguiente: van sólo
  como contexto.
- No toques el contenido de las citas textuales, salvo su puntuación y sus
  comillas.
- Mantén un tono neutro y objetivo en las explicaciones.`;

/**
 * Corrige, en paralelo, sólo las frases que el tamiz marcó.
 *
 * A cada llamada le llega una frase y las reglas concretas que falló, no el
 * texto entero ni el manual como muro: el modelo tiene una tarea pequeña y
 * acotada, que es lo que baja la latencia y sube el acierto.
 */
async function corregir(
  marcadas: FraseMarcada[],
  frases: Frase[],
  reglas: Regla[],
  opciones: {
    modelo: LanguageModel;
    /** Sólo para mostrarlo; `modelo` ya viene construido. */
    nombreModelo: string;
    provider: string;
    arranque: number;
    traza: Map<number, PasoDeFrase>;
    señal?: AbortSignal;
  },
) {
  const providerOptions = opcionesDeProveedor(opciones.provider);
  // El manual completo NO va aquí. Jev ya identificó qué reglas se incumplen y
  // el texto de cada una viaja en el mensaje del usuario con sus ejemplos, así
  // que mandar los 23.000 caracteres del manual era pagar en cada llamada por
  // un contexto que no se usa. Lo que queda es sólo cómo corregir.
  const system = systemCacheado(INSTRUCCIONES);

  // El catálogo completo, no sólo las sospechas: ahora el corrector puede
  // señalar otra regla del manual y hay que saber de qué tipo es.
  const catalogo = new Map(reglas.map((r) => [r.id, r]));

  let conError = 0;
  let ejemploCorreccion: { modelo: string; system: string; prompt: string } | null = null;
  const uso = {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    cachedInputTokens: 0,
    cacheWriteTokens: 0,
    reasoningTokens: 0,
  };

  const porFrase = await enParalelo(marcadas, CORRECCION_SIMULTANEAS, async (marcada) => {
    const contexto = contextoDe(frases, marcada.frase.indice);

    const prompt = [
      `REGLAS SOSPECHOSAS EN ESTA FRASE (el filtro le da ${marcada.rompe.toFixed(2)} de 1 a que haya algo roto):`,
      ...marcada.incumple.map(
        ({ regla, probabilidad }) =>
          `- [${regla.id}] (${regla.categoria}, ${probabilidad.toFixed(2)}) ${regla.texto}`,
      ),
      "",
      `FRASE ANTERIOR (sólo contexto): ${contexto.anterior ?? "—"}`,
      `FRASE SIGUIENTE (sólo contexto): ${contexto.siguiente ?? "—"}`,
      "",
      "FRASE A REVISAR:",
      marcada.frase.texto,
    ].join("\n");

    // Se guarda antes de llamar, para que el modal muestre lo que de verdad
    // salió aunque esa llamada falle.
    ejemploCorreccion ??= {
      modelo: opciones.nombreModelo,
      system: String(system.content),
      prompt,
    };

    try {
      const { object, usage } = await generateObject({
        model: opciones.modelo,
        schema: EsquemaFrase,
        messages: [system, { role: "user", content: prompt }],
        maxOutputTokens: MAX_TOKENS_POR_FRASE,
        abortSignal: opciones.señal,
        ...(providerOptions ? { providerOptions } : {}),
      });

      uso.inputTokens += usage?.inputTokens ?? 0;
      uso.outputTokens += usage?.outputTokens ?? 0;
      // Campos canónicos, no los alias de nivel superior (deprecados y sin
      // equivalente para cacheWriteTokens).
      uso.cachedInputTokens += usage?.inputTokenDetails?.cacheReadTokens ?? 0;
      uso.cacheWriteTokens += usage?.inputTokenDetails?.cacheWriteTokens ?? 0;
      uso.reasoningTokens += usage?.outputTokenDetails?.reasoningTokens ?? 0;

      const propuestas = object.correcciones.map((bruta) => {
        // El tipo y la categoría salen del catálogo de reglas, no de lo que
        // diga el modelo: así no puede inventar una que la UI no sepa pintar.
        const original = bruta.original.trim();
        const regla = catalogo.get(bruta.regla_id) ?? marcada.incumple[0].regla;

        // Se descartan aquí, pero la traza las conserva con el motivo: una
        // sugerencia que el modelo dio y el código tiró es exactamente lo que
        // hay que poder ver cuando falta una corrección que se esperaba.
        const descartada = !original
          ? "vacía"
          : original === bruta.suggestion.trim()
            ? "no cambia nada"
            : // Sin una copia literal no hay forma de ubicarla en el documento.
              !marcada.frase.texto.includes(original)
              ? "no aparece literal en la frase"
              : undefined;

        return {
          original,
          suggestion: bruta.suggestion,
          type: regla.tipo,
          explanation: bruta.explanation,
          // Jev dice exactamente qué regla señaló: se arrastra hasta la UI en
          // vez de quedarse sólo en la traza del modal de proceso.
          regla: regla.texto,
          categoria: regla.categoria,
          confianza: marcada.rompe,
          indiceFrase: marcada.frase.indice,
          descartada,
        };
      });

      const paso = opciones.traza.get(marcada.frase.indice);
      if (paso) {
        paso.msCorreccion = Date.now() - opciones.arranque;
        paso.correcciones = propuestas.map(({ original, suggestion, explanation, descartada }) => ({
          original,
          suggestion,
          explanation,
          descartada,
        }));
      }

      return propuestas.flatMap(({ descartada, ...c }) => (descartada ? [] : [c]));
    } catch {
      // Vale más entregar el resto de correcciones que tumbar el análisis.
      conError++;
      const paso = opciones.traza.get(marcada.frase.indice);
      if (paso) {
        paso.msCorreccion = Date.now() - opciones.arranque;
        paso.error = "correccion";
      }
      return [];
    }
  });

  const correcciones = porFrase
    .flat()
    .sort((a, b) => a.indiceFrase - b.indiceFrase)
    .map(({ indiceFrase: _, ...resto }) => resto);

  return { correcciones, conError, uso, ejemploCorreccion };
}

// ---------------------------------------------------------------------------
// 5. La entrada pública
// ---------------------------------------------------------------------------

/**
 * Analiza el texto frase por frase.
 *
 * Devuelve `null` cuando no hay clave de TypeSafe configurada, para que quien
 * llama caiga al flujo de una sola llamada sin enterarse de nada más.
 */
export async function analizarPorFrase(
  texto: string,
  opciones: {
    /** Modelo y clave con los que se corrigen las frases marcadas. */
    modeloElegido: { model: string; provider: string };
    apiKey: string;
    promptPrincipal: string;
    guiaDeEstilo: string;
    señal?: AbortSignal;
  },
): Promise<ResultadoPorFrase | null> {
  const clave = process.env.TYPESAFE_API_KEY?.trim();
  if (!clave) return null;

  const arranque = Date.now();

  const cliente = new TypeSafeClient({
    apiKey: clave,
    defaultModel: process.env.TYPESAFE_DEFAULT_MODEL || "jev-latest",
    timeout: 30_000,
  });

  const reglas = reglasDelManual();
  const frases = partirEnFrases(texto);

  const vacio: ResultadoPorFrase = {
    correcciones: [],
    detalle: {
      frases: frases.length,
      frasesMarcadas: 0,
      frasesConErrorEnTamiz: 0,
      frasesConErrorEnCorreccion: 0,
      reglas: reglas.length,
      peticionesTamiz: 0,
      umbral: UMBRAL,
      modeloTamiz: null,
      tokensTamiz: 0,
      modeloCorrector: opciones.modeloElegido.model,
      msTotal: 0,
    },
    traza: [],
    ejemploPeticion: null,
    peticiones: [],
    ejemploCorreccion: null,
    uso: {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      cachedInputTokens: 0,
      cacheWriteTokens: 0,
      reasoningTokens: 0,
    },
  };

  if (frases.length === 0) return vacio;

  const tamiz = await tamizar(cliente, frases, reglas, arranque, opciones.señal);
  const traza = () =>
    [...tamiz.traza.values()].sort((a, b) => a.indice - b.indice);
  const detalle = {
    ...vacio.detalle,
    frasesMarcadas: tamiz.marcadas.length,
    frasesConErrorEnTamiz: tamiz.conError,
    peticionesTamiz: tamiz.peticiones.length,
    modeloTamiz: tamiz.modelo,
    tokensTamiz: tamiz.tokens,
  };

  // Un texto limpio no llega nunca al modelo caro: el tamiz ya cerró el caso.
  if (tamiz.marcadas.length === 0) {
    return {
      ...vacio,
      detalle: { ...detalle, msTotal: Date.now() - arranque },
      traza: traza(),
      ejemploPeticion: tamiz.ejemploPeticion,
      peticiones: tamiz.peticiones,
    };
  }

  const correccion = await corregir(tamiz.marcadas, frases, reglas, {
    modelo: crearModelo(opciones.modeloElegido, opciones.apiKey),
    nombreModelo: opciones.modeloElegido.model,
    provider: opciones.modeloElegido.provider,
    arranque,
    traza: tamiz.traza,
    señal: opciones.señal,
  });

  return {
    correcciones: correccion.correcciones,
    traza: traza(),
    ejemploPeticion: tamiz.ejemploPeticion,
    peticiones: tamiz.peticiones,
    ejemploCorreccion: correccion.ejemploCorreccion,
    detalle: {
      ...detalle,
      frasesConErrorEnCorreccion: correccion.conError,
      msTotal: Date.now() - arranque,
    },
    uso: {
      ...correccion.uso,
      totalTokens: correccion.uso.inputTokens + correccion.uso.outputTokens,
    },
  };
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

/**
 * Corre `tarea` sobre cada elemento con un tope de tareas simultáneas.
 *
 * Un artículo de 150 frases disparadas de golpe se come el límite de peticiones
 * por minuto y devuelve 429. Con un tope, la latencia sigue siendo la de la
 * tanda más lenta y no la suma de todas. Los resultados vuelven en el orden de
 * entrada, no en el de terminación.
 */
async function enParalelo<T, R>(
  elementos: readonly T[],
  tope: number,
  tarea: (elemento: T, indice: number) => Promise<R>,
): Promise<R[]> {
  if (elementos.length === 0) return [];

  const resultados = new Array<R>(elementos.length);
  let siguiente = 0;

  const trabajador = async () => {
    while (true) {
      const indice = siguiente++;
      if (indice >= elementos.length) return;
      resultados[indice] = await tarea(elementos[indice], indice);
    }
  };

  await Promise.all(
    Array.from({ length: Math.max(1, Math.min(tope, elementos.length)) }, trabajador),
  );

  return resultados;
}

function crearModelo(
  { provider, model }: { provider: string; model: string },
  apiKey: string,
): LanguageModel {
  switch (provider.toLowerCase()) {
    case "openai":
      return createOpenAI({ apiKey })(model);
    case "anthropic":
      return createAnthropic({ apiKey })(model);
    case "google":
      return createGoogleGenerativeAI({ apiKey })(model);
    default:
      throw new Error(`Proveedor no soportado: ${provider}`);
  }
}

function opcionesDeProveedor(provider: string) {
  if (provider.toLowerCase() !== "openai") return undefined;

  return {
    openai: {
      reasoningEffort: "medium",
      textVerbosity: "medium",
      store: false,
      ...cacheOpenAI("corrector"),
    },
  };
}
