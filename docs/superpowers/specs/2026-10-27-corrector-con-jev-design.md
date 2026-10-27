# Corrector: el tamiz con Jev vuelve a estar encendido por defecto

Fecha: 27 de octubre de 2026. Estado: probado con la configuración real del Corrector.

## La tarea

Volver a poner a Jev en el Corrector de estilo. El 1 de octubre (#21) el tamiz por frase quedó apagado por defecto: el Corrector iba siempre por el flujo clásico de una sola llamada, salvo que la variable de entorno `CORRECTOR_CON_JEV` valiera `true`.

## Cómo funciona el tamiz

El Corrector parte el texto en frases y le pregunta a Jev (Typesafe) cuáles incumplen el manual de estilo. Sólo las frases que pasan el umbral van al modelo corrector, cada una con sus reglas sospechosas en vez del manual entero. Esas frases se corrigen en paralelo con `MODELO_CORRECTOR` (`gpt-5.6-luna`) si el Corrector tiene OpenAI encendido, y si no con el proveedor elegido.

Si no hay `TYPESAFE_API_KEY` o el tamiz falla, el análisis cae al flujo clásico y la pantalla avisa con «Se analizó con el flujo clásico». Ese respaldo no cambia.

## El cambio

En `actions/analyze-text.ts`, la condición se invierte:

```ts
// antes: apagado salvo que se encienda
const conJev = process.env.CORRECTOR_CON_JEV === "true";
// ahora: encendido salvo que se apague
const conJev = process.env.CORRECTOR_CON_JEV !== "false";
```

Sin la variable, o con cualquier valor distinto de `false`, el Corrector usa a Jev. Con `CORRECTOR_CON_JEV=false` vuelve al flujo clásico sin tocar código: es el interruptor para apagarlo rápido si Jev da problemas.

También se actualizan los comentarios de `actions/analyze-text.ts` y `app/dashboard/corrector/page.tsx` y el mensaje del log cuando está apagado. El aviso de la pantalla sigue saliendo sólo cuando Jev estaba encendido y no hubo traza, que ahora vuelve a ser el caso normal.

## Prueba

Se llamó a `analizarPorFrase` directamente con la configuración real del Corrector: clave de OpenAI, prompt principal y guía de estilo guardados, y la `TYPESAFE_API_KEY` de `.env`. El texto fueron los primeros 8 párrafos de la nota «Sondra Macollins legalizó millonario anticipo estatal con fundaciones de su familia» (2.706 caracteres).

| | |
|---|---|
| Frases | 14, de las que Jev marcó 11 |
| Reglas del manual | 53 |
| Peticiones a Jev | 1 (`jev-1.14.0`, umbral 0,6, 17.636 tokens) |
| Errores en el tamiz o en la corrección | 0 |
| Correcciones | 8 |
| Tiempo | 14 s |

`tsc --noEmit` no reporta errores en los archivos tocados.

## Para desplegar

Si en Vercel quedó `CORRECTOR_CON_JEV` con otro valor, no hace falta cambiarlo: sólo `false` apaga el tamiz. `TYPESAFE_API_KEY` tiene que estar configurada en producción. Si falta, el Corrector cae al flujo clásico y muestra el aviso en cada análisis.
