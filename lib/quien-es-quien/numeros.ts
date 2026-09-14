/**
 * Coerción defensiva de los números que vienen del upstream de Quién es quién.
 *
 * Existe por lo que ya pasó una vez: `segundos` llegó como decimal
 * (`128.9`) a una columna `integer` y el insert reventó con "invalid input
 * syntax for type integer" — la fila de esa generación nunca se guardó.
 * El tipo de una columna en Postgres no protege de nada si el código
 * simplemente reenvía lo que mandó un servicio que no controlamos: si mañana
 * `quienai` cambia un campo a string, o deja de mandarlo, o manda `NaN`
 * serializado raro, el guardado no debe volver a fallar por eso — en el peor
 * caso, ese campo queda en NULL, nunca tumba la fila completa.
 */

/**
 * `Number(null) === 0` y `Number("") === 0` — sin este guardia, un `null`
 * explícito del upstream (o un string vacío) se colaría como cero en vez de
 * quedar ausente, que es lo que de verdad significa.
 */
function aNumeroOInvalido(valor: unknown): number {
  if (valor === null || valor === undefined || valor === "") return NaN;
  return typeof valor === "number" ? valor : Number(valor);
}

/** Para columnas `integer`: redondea y valida, o `null` si no es un número real */
export function comoEntero(valor: unknown): number | null {
  const n = aNumeroOInvalido(valor);
  return Number.isFinite(n) ? Math.round(n) : null;
}

/** Para columnas `numeric` que sí llevan fracción (segundos, costo_usd) */
export function comoNumero(valor: unknown): number | null {
  const n = aNumeroOInvalido(valor);
  return Number.isFinite(n) ? n : null;
}
