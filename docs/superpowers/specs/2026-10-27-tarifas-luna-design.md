# Tarifas de gpt-6-luna, gpt-5.6-luna y Claude Sonnet 5.5

Fecha: 27 de octubre de 2026. Estado: precios verificados contra las páginas oficiales y cálculo probado.

## La tarea

Agregar las tarifas de los modelos "luna" a `lib/costos.ts` para que las analíticas tengan el costo bien calculado.

`calcularCosto` devuelve `null` cuando el modelo no está en `TARIFAS`, y la fila queda con el costo vacío. Faltaban tres modelos que hoy están en uso:

| Modelo | Dónde se usa | Filas sin costo desde el 1 de septiembre |
|---|---|---|
| `gpt-6-luna` | OpenAI configurado en todas las herramientas (Ajustes > Herramientas) | 26 en Preguntas a SillaIA, 3 en el detector |
| `gpt-5.6-luna` | `MODELO_CORRECTOR`: corrige las frases que marca Jev | No se pudo contar: la tabla del corrector no deja leer con la clave de servicio |
| `claude-sonnet-5-5` | Anthropic configurado en todas las herramientas | 19 en el detector |

Sonnet 5.5 no es "luna", pero es el mismo problema: la tabla tenía `claude-sonnet-5`, que es otro identificador y no coincide.

Las filas sin costo de `gpt-5.6-terra` y `claude-opus-4-8` en el detector no son de esta tarea. Esos modelos sí están en la tabla, así que lo más probable es que sean corridas que fallaron sin datos de uso.

## Tarifas

USD por millón de tokens, nivel estándar:

| Modelo | Input | Caché leída | Caché escrita | Output | Prompt de más de 272k tokens |
|---|---|---|---|---|---|
| `gpt-6-luna` | 0,10 | 0,01 | sin cargo | 0,50 | 0,20 / 0,02 / 0,75 |
| `gpt-5.6-luna` | 0,20 | 0,02 | sin cargo | 1,20 | 0,40 / 0,04 / 1,80 |
| `claude-sonnet-5-5` | 2,00 | 0,10 | 2,50 (5 min) | 10,00 | no aplica |

Fuentes:

- OpenAI: https://developers.openai.com/api/docs/pricing. El tramo largo es el mismo de `gpt-5.6-terra`, que ya estaba en la tabla con los valores de esa página, lo que confirma cómo se leyeron las columnas.
- Anthropic: https://claude.com/pricing y https://platform.claude.com/docs/en/about-claude/pricing. En Sonnet 5.5 la caché leída cuesta 0,05 veces el input, la mitad que en Sonnet 5. Desde Claude 4.6 no hay recargo por contexto largo salvo en Haiku 5.5.

## El cambio

- `lib/costos.ts` agrega las tres entradas a `TARIFAS`.
- El tramo de OpenAI pasa a un helper, `tarifaOpenAI(corto, largo)`, con el umbral de 272.000 tokens de input. Lo usan `gpt-5.6-terra` y los dos "luna", en vez de repetir la función tres veces. Los valores de `gpt-5.6-terra` no cambian.
- La fecha de verificación del encabezado anota las tarifas nuevas.

## Prueba

`calcularCosto` con cuatro usos de prueba (sin caché, con caché leída, con prompt de más de 272k y con caché escrita):

- `gpt-5.6-terra`, `claude-sonnet-5` y `gemini-3.1-pro-preview` dan lo mismo que en `main`: el helper no cambia los costos de los modelos que ya estaban.
- Los tres modelos nuevos pasan de `null` a un costo. Dos verificados a mano:
  - `gpt-6-luna` con 300.000 de input (100.000 de caché) y 10.000 de output: 0,0495 USD, con la tarifa larga.
  - `claude-sonnet-5-5` con 50.000 de input (20.000 de caché) y 3.000 de output: 0,092 USD.

`tsc --noEmit` no reporta errores en `lib/costos.ts`.

## Pendiente

- Las filas que ya quedaron sin costo no se recalculan solas: hay que rellenarlas con sus tokens guardados.
- Con Jev encendido, el costo del corrector cuenta sólo los tokens del modelo que corrige las frases, no los de Jev. En la prueba del tamiz fueron 17.636 tokens de Typesafe por petición. Para sumarlos hace falta la tarifa de Typesafe.
