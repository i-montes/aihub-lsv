import { Client, types } from "pg";

/**
 * Acceso de sólo lectura a la base de datos del chatbot de La Silla Vacía
 * (un proyecto Supabase aparte del de esta app), para que el agente de
 * "Preguntas a SillaIA" pueda consultar `chats_new` con SQL que el propio
 * modelo redacta.
 *
 * Dejar que un modelo escriba SQL libre es peligroso por diseño, así que hay
 * dos capas independientes de protección — si una falla, la otra sigue en
 * pie:
 *
 * 1. Validación de texto aquí abajo: rechaza cualquier cosa que no sea un
 *    único SELECT/WITH contra `chats_new`, sin comentarios ni palabras de
 *    escritura/DDL.
 * 2. La conexión real corre la consulta dentro de una transacción
 *    `READ ONLY`: aunque la validación de texto tuviera un hueco, Postgres
 *    mismo rechaza cualquier escritura a nivel de motor, no de regex.
 *
 * Lo que la validación de texto NO garantiza es que el modelo sólo lea
 * `chats_new` y no otra tabla de esa misma base (la validación de tablas es
 * heurística, no un permiso real) — ver la nota en `TABLAS_PERMITIDAS`.
 */

const LIMITE_FILAS = 500;
const TIMEOUT_MS = 8_000;

/** Único identificador del error que se le puede mostrar tal cual al modelo */
export class SqlNoPermitidoError extends Error {}

const PALABRAS_PROHIBIDAS =
  /\b(insert|update|delete|drop|alter|truncate|grant|revoke|create|copy|call|execute|vacuum|reindex|merge|lock|listen|notify|do|prepare|deallocate|cluster|refresh|comment|set|reset|pg_sleep|pg_terminate_backend|pg_cancel_backend|pg_read_file|dblink|lo_import|lo_export)\b/i;

/**
 * Tablas que el agente puede leer. Es una comprobación de texto —no un
 * permiso de base de datos—, así que es una capa adicional, no la única: si
 * se quiere que esto sea un límite de verdad (y no sólo una ayuda para que el
 * modelo no se equivoque), hace falta un rol de Postgres en la base del
 * chatbot con SELECT únicamente sobre estas tablas.
 */
const TABLAS_PERMITIDAS = ["chats_new"];

/**
 * La consulta con cada texto entrecomillado vaciado, para que las
 * comprobaciones de abajo miren lo que Postgres va a ejecutar como código y
 * no lo que va a tratar como dato. El modelo arma expresiones regulares como
 * `'^\s*([0-9]+\s*[,;]?\s*)+$'` para descartar saludos y números sueltos, y
 * el `;` de adentro hacía rechazar la consulta como si fueran dos.
 *
 * Se entienden todas las formas de citar de Postgres, porque con una sola el
 * resto sirve para esconder código entre dos "textos" que el limpiador cierra
 * en otro sitio que Postgres: una comilla dentro de un identificador (`"a'"`),
 * un `$$'$$`, o la comilla escapada de `E'\''`.
 *
 * - `'...'` ('' escapa la comilla) → `''`.
 * - `E'...'` (además `\'` escapa la comilla; sólo si la E no es el final de
 *   un identificador) → `''`.
 * - `$tag$...$tag$` (sólo si el `$` no es parte de un identificador: en
 *   Postgres `x$a$` es un nombre de columna) → `''`.
 * - `"..."` ("" escapa la comilla) → el nombre tal cual si es una tabla
 *   permitida, y `__identificador__` si no. Así `from "chats_new"` pasa,
 *   `from "profiles"` se rechaza igual que sin comillas, y un alias como
 *   `"Comment"` no choca con PALABRAS_PROHIBIDAS (entre comillas nunca es
 *   palabra clave).
 *
 * Un texto sin cerrar se deja visible: queda más a la vista, nunca menos. Y
 * la transacción READ ONLY sigue de segunda capa.
 */
const TEXTOS_ENTRECOMILLADOS =
  /(?<![\w$])[eE]'(?:[^'\\]|\\[\s\S]|'')*'|'(?:[^']|'')*'|(?<![\w$])\$([A-Za-z_]\w*)?\$[\s\S]*?\$\1\$|"((?:[^"]|"")*)"/g;

function sinTextosEntreComillas(sql: string): string {
  return sql.replace(
    TEXTOS_ENTRECOMILLADOS,
    (_, _tag: string | undefined, identificador: string | undefined) => {
      if (identificador === undefined) return "''";
      return TABLAS_PERMITIDAS.includes(identificador) ? identificador : "__identificador__";
    }
  );
}

function validarSoloLectura(sql: string): string {
  const limpio = sql.trim();

  if (!limpio) {
    throw new SqlNoPermitidoError("La consulta está vacía");
  }
  // Se tolera un único ; final (el modelo suele agregarlo por costumbre).
  const sinPuntoYComaFinal = limpio.replace(/;\s*$/, "");
  const codigo = sinTextosEntreComillas(sinPuntoYComaFinal);

  if (codigo.includes("--") || codigo.includes("/*") || codigo.includes("*/")) {
    throw new SqlNoPermitidoError(
      "No se permiten comentarios en la consulta"
    );
  }
  if (codigo.includes(";")) {
    throw new SqlNoPermitidoError(
      "Sólo se permite una consulta a la vez (nada de punto y coma en medio)"
    );
  }
  if (!/^(select|with)\b/i.test(codigo)) {
    throw new SqlNoPermitidoError("Sólo se permiten consultas SELECT");
  }
  if (PALABRAS_PROHIBIDAS.test(codigo)) {
    throw new SqlNoPermitidoError(
      "La consulta contiene una palabra no permitida (sólo lectura)"
    );
  }

  // Nombres que el propio modelo define con WITH nombre AS (...): también son
  // "permitidos" para esta consulta puntual — son un alias a lo que ya haya
  // en el SELECT interno, no una tabla nueva de verdad. Sin esto, cualquier
  // SQL con su propia CTE (algo normal al comparar dos periodos) se rechazaba
  // igual que si hubiera intentado leer otra tabla.
  const nombresCte = [...codigo.matchAll(/\b(\w+)\s+as\s*\(/gi)].map((m) =>
    m[1].toLowerCase()
  );

  const tablasReferenciadas = [
    ...codigo.matchAll(/\b(?:from|join)\s+([a-zA-Z_][a-zA-Z0-9_.]*)/gi),
  ].map((m) => m[1].replace(/^public\./i, "").toLowerCase());

  const tablaNoPermitida = tablasReferenciadas.find(
    (t) => !TABLAS_PERMITIDAS.includes(t) && !nombresCte.includes(t)
  );
  if (tablaNoPermitida) {
    throw new SqlNoPermitidoError(
      `Sólo se puede consultar ${TABLAS_PERMITIDAS.join(", ")} (se encontró "${tablaNoPermitida}")`
    );
  }

  return sinPuntoYComaFinal;
}

export interface ColumnaChatsNew {
  nombre: string;
  tipo: string;
  descripcion: string;
  /** Sólo en las calculadas: la expresión SQL sobre la tabla real */
  expresion?: string;
}

/**
 * Las columnas que el agente puede usar de `chats_new`. Única fuente de
 * verdad: de aquí salen la CTE de abajo y la lista del prompt (agente.ts).
 *
 * Quedan fuera a propósito `debug_mode` (ya filtrado) y `debug_log` (interno
 * del chatbot, no es de los lectores).
 *
 * Las calculadas existen porque las formas "obvias" revientan la consulta:
 *
 * - `tipo_respuesta` y `texto_respuesta`: `respuesta` casi siempre es JSON
 *   como string, pero no siempre (algunas son texto plano, "Soy SillaIA…"),
 *   y un solo `respuesta::jsonb` sobre una de esas tumba todo el SELECT con
 *   "invalid input syntax for type json". Aquí se castea sólo si es válido.
 * - `pregunta_sin_tildes`: la extensión `unaccent` no está instalada en esa
 *   base (y no es nuestra para instalarla), así que se quitan con translate.
 */
export const COLUMNAS_CHATS_NEW: ColumnaChatsNew[] = [
  { nombre: "id", tipo: "bigint", descripcion: "id de la pregunta" },
  { nombre: "pregunta", tipo: "text", descripcion: "lo que escribió el lector, tal cual" },
  {
    nombre: "pregunta_sin_tildes",
    tipo: "text",
    descripcion: "la pregunta en minúsculas y sin tildes: úsala para filtrar por palabras",
    expresion:
      "translate(lower(pregunta), 'áàäâéèëêíìïîóòöôúùüûñ', 'aaaaeeeeiiiioooouuuun')",
  },
  {
    nombre: "respuesta",
    tipo: "text",
    descripcion: "respuesta cruda de SillaIA; casi siempre JSON como string, no siempre",
  },
  {
    nombre: "tipo_respuesta",
    tipo: "text",
    descripcion: "tipo de respuesta (ej. question, resumen, perfil, agresivo, just_greeting); null si no hay",
    expresion:
      "case when pg_input_is_valid(respuesta, 'jsonb') then respuesta::jsonb->>'tipo_respuesta' end",
  },
  {
    nombre: "texto_respuesta",
    tipo: "text",
    descripcion: "el texto de la respuesta de SillaIA",
    expresion:
      "case when pg_input_is_valid(respuesta, 'jsonb') then respuesta::jsonb->>'respuesta' else respuesta end",
  },
  { nombre: "created_at", tipo: "timestamptz", descripcion: "cuándo se hizo la pregunta" },
  { nombre: "history", tipo: "jsonb", descripcion: "turnos previos de esa misma conversación" },
  { nombre: "origin", tipo: "text", descripcion: 'de dónde llegó, ej. "Web"' },
  {
    nombre: "user_name",
    tipo: "text",
    descripcion: "id anónimo del lector (guest_<uuid>), no un nombre real",
  },
];

/**
 * Las filas con `debug_mode = true` son pruebas internas del equipo, no
 * preguntas reales de lectores — el prompt del agente ya le pide excluirlas,
 * pero un prompt es una sugerencia, no una garantía. Esto lo fuerza a nivel
 * de SQL: antepone una CTE que redefine `chats_new` como la versión ya
 * filtrada, así que toda referencia a `chats_new` en el SQL del modelo
 * (tenga o no su propio alias) queda sin filas de debug sin importar si el
 * modelo se acordó de filtrarlas.
 *
 * Una CTE y no una vista en la base del chatbot a propósito: es la base de
 * otro sistema, no de esta app, y esto lo resuelve por completo sin tocarla.
 *
 * La CTE expone SÓLO las columnas de `COLUMNAS_CHATS_NEW`, y el prompt del
 * agente se arma con esa misma lista: lo que el modelo lee es exactamente lo
 * que existe, ni más ni menos.
 */
function forzarFiltroDebug(sql: string): string {
  const columnas = COLUMNAS_CHATS_NEW.map((c) =>
    c.expresion ? `${c.expresion} as ${c.nombre}` : c.nombre
  ).join(",\n    ");
  const cte = `chats_new as (\n  select\n    ${columnas}\n  from public.chats_new where debug_mode is not true)`;

  // Si el modelo ya empieza con WITH, la propia se suma como una CTE más en
  // vez de anteponer un segundo WITH (inválido en SQL).
  if (/^with\s+/i.test(sql)) {
    return sql.replace(/^with\s+/i, `with ${cte}, `);
  }
  return `with ${cte}\n${sql}`;
}

/** OID de `timestamp without time zone` en Postgres */
const OID_TIMESTAMP_SIN_ZONA = 1114;

/**
 * `created_at at time zone 'America/Bogota'` devuelve un timestamp SIN zona
 * que ya es la hora de Bogotá. Por defecto `pg` lo vuelve un Date asumiendo
 * la zona del servidor (UTC), y al serializarlo para el modelo sale como
 * "2026-09-27T21:30:00.000Z": una hora de Bogotá marcada como UTC, que el
 * modelo tiende a "corregir" restándole 5 horas y así pasa las preguntas de
 * la noche al día equivocado. Se devuelve tal cual lo escribe Postgres.
 */
function parserDeTipos(oid: number, formato?: any) {
  if (oid === OID_TIMESTAMP_SIN_ZONA) return (valor: string) => valor;
  return types.getTypeParser(oid, formato);
}

export interface ResultadoConsulta {
  columnas: string[];
  filas: Record<string, unknown>[];
  truncado: boolean;
}

/**
 * Ejecuta SQL de sólo lectura contra la base del chatbot y devuelve las
 * filas. Lanza `SqlNoPermitidoError` (con un mensaje seguro de reenviar al
 * modelo) si la consulta no pasa la validación, o el error nativo de
 * Postgres si la consulta es válida pero está mal escrita (columna
 * inexistente, sintaxis, etc.) — también seguro de reenviar: son errores del
 * propio Postgres sobre el SQL que el modelo escribió.
 */
export async function ejecutarSqlSoloLectura(
  sql: string
): Promise<ResultadoConsulta> {
  const sqlValidado = forzarFiltroDebug(validarSoloLectura(sql));

  const connectionString = process.env.CHATBOT_DATABASE_URL;
  if (!connectionString) {
    throw new Error("Falta configurar CHATBOT_DATABASE_URL");
  }

  const client = new Client({
    connectionString: connectionString.replace("sslmode=require", "sslmode=no-verify"),
    types: { getTypeParser: parserDeTipos },
  });

  try {
    await client.connect();
    await client.query("BEGIN READ ONLY");
    await client.query(`SET LOCAL statement_timeout = ${TIMEOUT_MS}`);

    // Envolver como subconsulta es una segunda barrera contra que el SQL del
    // modelo traiga más de una sentencia real (rompería la sintaxis en vez de
    // ejecutarse), y de paso acota el tamaño del resultado sin importar si el
    // modelo puso su propio LIMIT.
    const resultado = await client.query(
      `select * from (\n${sqlValidado}\n) as consulta_modelo limit ${LIMITE_FILAS + 1}`
    );

    await client.query("ROLLBACK");

    const truncado = resultado.rows.length > LIMITE_FILAS;
    return {
      columnas: resultado.fields.map((f) => f.name),
      filas: truncado ? resultado.rows.slice(0, LIMITE_FILAS) : resultado.rows,
      truncado,
    };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}
