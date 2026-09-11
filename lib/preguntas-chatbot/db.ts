import { Client } from "pg";

/**
 * Acceso de sólo lectura a la base de datos del chatbot de La Silla Vacía
 * (un proyecto Supabase aparte del de esta app), para que el agente de
 * "Preguntas al chatbot" pueda consultar `chats_new` con SQL que el propio
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

function validarSoloLectura(sql: string): string {
  const limpio = sql.trim();

  if (!limpio) {
    throw new SqlNoPermitidoError("La consulta está vacía");
  }
  if (limpio.includes("--") || limpio.includes("/*") || limpio.includes("*/")) {
    throw new SqlNoPermitidoError(
      "No se permiten comentarios en la consulta"
    );
  }
  // Se tolera un único ; final (el modelo suele agregarlo por costumbre).
  const sinPuntoYComaFinal = limpio.replace(/;\s*$/, "");
  if (sinPuntoYComaFinal.includes(";")) {
    throw new SqlNoPermitidoError(
      "Sólo se permite una consulta a la vez (nada de punto y coma en medio)"
    );
  }
  if (!/^(select|with)\b/i.test(sinPuntoYComaFinal)) {
    throw new SqlNoPermitidoError("Sólo se permiten consultas SELECT");
  }
  if (PALABRAS_PROHIBIDAS.test(sinPuntoYComaFinal)) {
    throw new SqlNoPermitidoError(
      "La consulta contiene una palabra no permitida (sólo lectura)"
    );
  }

  const tablasReferenciadas = [
    ...sinPuntoYComaFinal.matchAll(/\b(?:from|join)\s+([a-zA-Z_][a-zA-Z0-9_.]*)/gi),
  ].map((m) => m[1].replace(/^public\./i, "").toLowerCase());

  const tablaNoPermitida = tablasReferenciadas.find(
    (t) => !TABLAS_PERMITIDAS.includes(t)
  );
  if (tablaNoPermitida) {
    throw new SqlNoPermitidoError(
      `Sólo se puede consultar ${TABLAS_PERMITIDAS.join(", ")} (se encontró "${tablaNoPermitida}")`
    );
  }

  return sinPuntoYComaFinal;
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
  const sqlValidado = validarSoloLectura(sql);

  const connectionString = process.env.CHATBOT_DATABASE_URL;
  if (!connectionString) {
    throw new Error("Falta configurar CHATBOT_DATABASE_URL");
  }

  const client = new Client({
    connectionString: connectionString.replace("sslmode=require", "sslmode=no-verify"),
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
