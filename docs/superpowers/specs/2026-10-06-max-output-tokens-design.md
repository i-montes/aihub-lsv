# Tope de salida explícito en todas las llamadas al modelo

Fecha: 6 de octubre de 2026. Estado: probado contra la API con una nota real.

## El problema

El generador de hilos falla con Claude Sonnet 5.5 y el periodista ve:

> Error en el procesamiento del texto: No object generated: the model did not return a response.

## La causa

`actions/generate-threads/index.ts` llamaba a `generateObject` sin `maxOutputTokens`. Cuando no se le pasa, `@ai-sdk/anthropic` 3.0.23 toma el máximo de su tabla de modelos conocidos (`getModelCapabilities`), que sólo llega a los 4.5. Para cualquier otro modelo, Sonnet 5.5 incluido, manda `max_tokens: 4096`.

Hilos corre con esfuerzo `high`, configurado en Ajustes > Herramientas, y con ese esfuerzo Sonnet 5.5 razona antes de responder. En una nota larga, el razonamiento se gasta los 4.096 tokens, la respuesta se corta (`stop_reason: max_tokens`) y no trae ningún bloque de texto. `generateObject` no encuentra el JSON y lanza `NoObjectGeneratedError`.

El arreglo del 1 de octubre (#20) fijó `structuredOutputMode: "outputFormat"`, que quitó el 400 de `tool_choice`, pero no toca este límite.

El detector y los resúmenes tenían el mismo hueco: llamaban a `generateText` sin tope, y con Sonnet 5.5 los dos quedaban limitados a 4.096 tokens. El corrector y Preguntas a SillaIA ya lo tenían cubierto, cada uno con su propia constante de 16000.

## El cambio

`lib/proveedores/opciones-modelo.ts` exporta `MAX_OUTPUT_TOKENS = 16000`, junto a las demás opciones que comparten todas las herramientas. Toda llamada al modelo lo pasa:

| Herramienta | Llamada | Antes |
|---|---|---|
| Hilos | `generateObject` en `actions/generate-threads/index.ts` | Sin tope |
| Detector | `generateText` en `app/api/detector/route.ts` | Sin tope |
| Resúmenes, selección de noticias | `generateObject` en `app/api/tools/generate-resume/route.ts` | Sin tope |
| Resúmenes, redacción | `generateText` en el mismo archivo | Sin tope |
| Corrector | `generateObject` en `actions/analyze-text.ts` | Constante local de 16000 |
| Preguntas a SillaIA | `ToolLoopAgent` en `lib/preguntas-chatbot/agente.ts` | Constante local de 16000 |

Las dos constantes locales se borran y esos archivos usan la compartida. El valor no cambia.

Se queda como está el corrector por frase (`lib/proofreader/correccion-por-frase.ts`), con `MAX_TOKENS_POR_FRASE = 1200`. Ese tope corto es a propósito: si una frase pasa de ahí, el modelo la está reescribiendo.

Quién es quién no llama al modelo desde este repo: sólo entrega las claves a su servicio por `/api/internal/llm-keys`.

El tope se pasa a todos los proveedores, no sólo a Anthropic. En OpenAI el máximo por defecto también es bajo y ya había cortado JSON a la mitad en el corrector y en el chatbot. 16000 cabe en el máximo de todos los modelos que se ofrecen, incluidos los mini de la selección de noticias (`gpt-4o-mini`: 16.384).

## Prueba

Se usó la nota «Sondra Macollins legalizó millonario anticipo estatal con fundaciones de su familia» (17.716 caracteres), con la configuración real de cada herramienta en Anthropic y sus prompts guardados.

**Hilos** (`claude-sonnet-5-5`, esfuerzo `high`, formato `investigacion`, `generateObject` con salida estructurada nativa):

| | Sin tope (antes) | `maxOutputTokens: 16000` (ahora) |
|---|---|---|
| Resultado | Falla: `No object generated` | Hilo de 15 trinos |
| `finishReason` | `length` | `stop` |
| Tokens de salida | 4.096, todos de razonamiento | 6.211 (4.719 de razonamiento) |
| Tiempo | 27 s | 38 s |

El razonamiento solo ya pasa los 4.096 tokens: el tope por defecto no alcanza ni para empezar a escribir el hilo.

**Detector** (`claude-sonnet-5-5`, esfuerzo `medium`): con tope termina bien (`stop`) en 922 tokens, 245 de razonamiento. La corrida sin tope falló por un error de red ajeno al cambio.

**Resúmenes** (`claude-sonnet-5-5`, esfuerzo por defecto): termina bien con y sin tope, en unos 370 tokens y sin razonamiento.

Con estas entradas, el detector y los resúmenes no llegan a 4.096 tokens. Para ellos el tope es preventivo: con un esfuerzo más alto, más adjuntos o más noticias seleccionadas caerían en el mismo corte que hilos, en silencio y con el texto truncado.
