# Hilos con Sonnet 5.5: tope de salida explícito

Fecha: 6 de octubre de 2026. Estado: probado contra la API con una nota real.

## El problema

El generador de hilos falla con Claude Sonnet 5.5 y el periodista ve:

> Error en el procesamiento del texto: No object generated: the model did not return a response.

## La causa

`actions/generate-threads/index.ts` llama a `generateObject` sin `maxOutputTokens`. Cuando no se le pasa, `@ai-sdk/anthropic` 3.0.23 toma el máximo de su tabla de modelos conocidos (`getModelCapabilities`), que sólo llega a los 4.5. Para cualquier otro modelo, Sonnet 5.5 incluido, manda `max_tokens: 4096`.

Hilos corre con esfuerzo `high`, configurado en Ajustes > Herramientas, y con ese esfuerzo Sonnet 5.5 razona antes de responder. En una nota larga, el razonamiento se gasta los 4.096 tokens, la respuesta se corta (`stop_reason: max_tokens`) y no trae ningún bloque de texto. `generateObject` no encuentra el JSON y lanza `NoObjectGeneratedError`.

El arreglo del 1 de octubre (#20) fijó `structuredOutputMode: "outputFormat"`, que quitó el 400 de `tool_choice`, pero no toca este límite.

## El cambio

`generateObject` recibe ahora `maxOutputTokens: 16000`, en la constante `MAX_OUTPUT_TOKENS`. Es el mismo valor y el mismo remedio que ya usan el corrector (`actions/analyze-text.ts`) y el agente de Preguntas a SillaIA (`lib/preguntas-chatbot/agente.ts`).

Se pasa a todos los proveedores, no sólo a Anthropic. En OpenAI y Google también evita que el proveedor aplique un tope propio más bajo.

## Prueba

Nota: «Sondra Macollins legalizó millonario anticipo estatal con fundaciones de su familia» (17.716 caracteres, formato `investigacion`). Se usó la configuración real de la organización: `claude-sonnet-5-5` con esfuerzo `high`, los prompts de la herramienta y salida estructurada nativa.

| | Sin tope (antes) | `maxOutputTokens: 16000` (ahora) |
|---|---|---|
| Resultado | Falla: `No object generated` | Hilo de 15 trinos |
| `finishReason` | `length` | `stop` |
| Tokens de salida | 4.096, todos de razonamiento | 6.211 (4.719 de razonamiento) |
| Tiempo | 27 s | 38 s |

El razonamiento solo ya pasa los 4.096 tokens: el tope por defecto no alcanza ni para empezar a escribir el hilo.

## Pendiente

El detector (`app/api/detector/route.ts`) y la redacción de resúmenes (`app/api/tools/generate-resume/route.ts`) llaman a `generateText` sin tope. Con Sonnet 5.5 tienen el mismo riesgo: no fallan con este error, pero pueden devolver texto cortado o vacío.
