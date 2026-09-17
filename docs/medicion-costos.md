# Medición de costos contra las consolas de los proveedores

Mediciones hechas con `scripts/medir-costos.ts` el 2026-09-17, con API keys
dedicadas que no usa ningún otro sistema — por eso el total de la consola de
cada proveedor es directamente comparable contra lo que calcula el hub.

Cada llamada replica lo que hace la herramienta en producción: mismo modelo,
mismos prompts de la organización, mismos parámetros, mismo SDK.

## Tanda 1 — Corrector de textos (2026-09-17, 23:00–23:02 UTC)

Texto de prueba: un artículo real de producción, 2.123 caracteres.

| # | modelo | resultado | input | de eso caché | output | razonamiento | finishReason | costo calculado | duración |
|---|---|---|---|---|---|---|---|---|---|
| 1 | gpt-5.6-terra | completado | 7.254 | 0 | 582 | 516 | stop | $0,021492 | 11,4s |
| 2 | gpt-5.6-terra | completado | 7.254 | 7.251 | 585 | 516 | stop | $0,008476 | 10,5s |
| 3 | gpt-5.6-terra | **fallido** | 7.158 | 0 | 64 | 64 | length | $0,015084 | 3,3s |
| 4 | claude-opus-4-8 | completado | 12.489 | 0 | 732 | — | stop | $0,080745 | 8,9s |
| 5 | claude-opus-4-8 | **fallido** | 12.344 | 0 | 64 | — | length | $0,063320 | 2,3s |

Totales a verificar en cada consola:

| proveedor | llamadas | input | output | costo calculado por el hub |
|---|---|---|---|---|
| OpenAI | 3 | 21.666 (7.251 de caché) | 1.231 | **$0,045052** |
| Anthropic | 2 | 24.833 | 796 | **$0,144065** |

### Verificado contra las consolas

| proveedor | lo que calculó el hub | lo que reportó la consola | |
|---|---|---|---|
| OpenAI (llamadas 1 y 2) | $0,029968 | **$0,03** | cuadra |
| Anthropic (llamadas 4 y 5) | 24.833 input + 796 output = **25.629 tokens** | **25.629 tokens** | cuadra al token |

La lectura de OpenAI se tomó antes de que la consola contabilizara la llamada 3
(la fallida), por eso son sólo las dos primeras. La de Anthropic sí incluye la
llamada fallida: **25.629 es la suma de las dos llamadas, la buena y la
truncada**. Es la prueba de que el proveedor factura una generación fallida
igual que una exitosa.

### Lo que ya quedó demostrado

**1. La cuenta de una llamada exitosa es exacta.** La llamada 4 reprodujo al
token la fila de producción de ese mismo texto: 12.489 tokens de input en las
dos. La fila guardada decía $0,08117 y la medición dio $0,080745 — la
diferencia son los 17 tokens de output que el modelo escribió de más esa vez.

**2. Una generación fallida se factura completa** — confirmado por la consola,
no deducido. Las llamadas 3 y 5 se
truncaron a propósito (`maxOutputTokens=64`) para reproducir el fallo que se ve
en producción. El AI SDK lanza `NoObjectGeneratedError` y ese error trae el
`usage`: **el input entero ya se consumió**. Anthropic cobra $0,063320 por una
llamada que, hasta el arreglo de hoy, no dejaba ninguna fila en la base de
datos.

Las dos fallaron en 2,3 y 3,3 segundos. Es exactamente el perfil de los fallos
de producción del 16 de septiembre: 3,2 segundos de mediana, contra 7,5 de los
análisis que salen bien.

**3. El caché de OpenAI es automático y pesa.** La llamada 2 es la misma que la
1 y costó menos de la mitad ($0,008476 contra $0,021492) porque 7.251 de sus
7.254 tokens de input se leyeron de caché. El hub lo contabiliza bien: usa
`inputTokenDetails.noCacheTokens` en vez de deducirlo restando.

## Pendiente

- Verificar los dos totales de arriba contra las consolas.
- Medir detector, hilos y resúmenes (el resumen incluye las llamadas del modelo
  mini, que hasta hoy no se guardaban).
