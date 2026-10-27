# Jev saca las reglas de la guía de estilo, no de un catálogo escrito a mano

Fecha: 27 de octubre de 2026. Estado: comparado contra el Jev de `main` con la configuración real del Corrector.

## La tarea

El Corrector volvió a usar el tamiz con Jev (#25), pero con la versión vieja de las reglas: `CATALOGO`, una lista de 53 reglas escrita a mano en `lib/proofreader/correccion-por-frase.ts` que resumía el manual. La versión que saca las reglas directamente del prompt se hizo el 1 y 2 de octubre en la rama local `feat/jev-reglas-del-manual`, que nunca se subió ni se mergeó.

Esta rama (`feat/jev-reglas-del-prompt`) concilia esa versión con `main`. Lleva los dos commits de la rama local sobre `main` actualizado, sin conflictos: el archivo no había cambiado en `main` desde que salió la rama.

## Por qué el catálogo a mano se apartaba del manual

Lo dice el commit original (`0c1952e`): al resumen le faltaban siete partidos, la cautela de «en caso de duda, no cambiar» en siglas y condiciones de la regla de números, y traía dos reglas de redacción que el manual no tiene (redundancias y extranjerismos). Además, cada cambio del manual en Ajustes obligaba a tocar el código.

## El cambio

En `lib/proofreader/correccion-por-frase.ts`:

- `reglasDelManual(manual)` lee la guía de estilo que ya recibe `analizarPorFrase` (`opciones.guiaDeEstilo`, guardada en Ajustes > Herramientas):
  - Cada numeral con título propio es una regla, con su texto literal: «### 0.2 Siglas…», «## 4. CONCORDANCIAS VERBALES».
  - Los subtítulos sin número («### Coma Criminal») se quedan dentro de su numeral.
  - Los numerales de excepciones se unen a la regla que exceptúan: 0.3 va con 0.2.
  - Los numerales que sólo agrupan a otros (el «## 0.») no son regla.
  - Si el manual no tiene numerales, cada título es una regla. Si no tiene títulos, el manual entero es una sola.
- Sólo quedan escritas a mano las tres reglas generales que el manual da por sabidas (`REGLAS_GENERALES`): ortografía, concordancia y régimen preposicional. Salen las dos de redacción.
- `CANDIDATAS_MAX` baja de 15 a 5. Cada regla es ahora un numeral entero, de 300 a 2.600 caracteres: quince serían casi el manual completo en cada llamada.
- En el prompt del corrector, cada regla sospechosa va en su propio bloque con título, porque trae viñetas y ejemplos.
- Cuando una frase no se puede corregir, se escribe el error en la consola. Antes se perdía en silencio.

`actions/analyze-text.ts` no cambia: ya pasaba la guía de estilo a `analizarPorFrase`.

## Prueba

Con la guía de estilo real (14.948 caracteres), `reglasDelManual` saca 15 reglas: 12 numerales del manual más las 3 generales.

| Regla | Caracteres |
|---|---|
| 0.1 «gobierno»: SIEMPRE en minúscula | 657 |
| 0.2 Siglas (con 0.3, excepciones) | 2.353 |
| 0.4 Cifras con «mil» y «millones» | 1.438 |
| 1. Reglas editoriales obligatorias | 2.573 |
| 2. Puntuación crítica | 1.470 |
| 3. Comillas y citas | 513 |
| 4. Concordancias verbales | 261 |
| 5. Prefijos | 1.036 |
| 6. Tildes | 517 |
| 7. Números y fechas | 2.353 |
| 8. Mayúsculas/minúsculas | 415 |
| 9. Estilo editorial | 577 |

Se corrieron las dos versiones sobre los mismos 8 párrafos de la nota «Sondra Macollins legalizó millonario anticipo estatal con fundaciones de su familia» (14 frases), con la configuración real del Corrector (`gpt-5.6-luna`, prompt principal y guía guardados). Fueron tres vueltas:

| | Jev viejo (catálogo) | Jev nuevo (del prompt) |
|---|---|---|
| Reglas | 53 | 15 |
| Frases marcadas | 11 a 13 | 9 a 10 |
| Tokens de Jev por petición | 17.636 | 14.657 |
| Tiempo | 15 s | 8 a 10 s |
| Correcciones | 8 a 9 | 2 a 3 |

Qué corrigió cada uno:

- **Viejo.** La mitad de sus correcciones salen de reglas que no están en el manual: redundancias («quien también está → quien está»), extranjerismos («call centers → centros de llamadas») y verbos comodín. Además trae errores:
  - Cambió «3.261 millones» por «3.261.000», que divide la cifra por mil.
  - En una misma corrida corrigió «Garvín → Garvin» y «Garvin → Garvín».
  - Pasó «4.500 millones» a «4.500.000.000» y «$3.261 millones» a «$3.261.000.000».
- **Nuevo.** Sus correcciones aplican numerales del manual: «un millón → 1 millón» (0.4, el numeral va en cifras), «“contrataderos” → ‘contrataderos’» (3, comillas sencillas para el sentido aproximado). Una vez también propuso «Garvín → Garvin».

En la primera vuelta una frase del Jev nuevo no se pudo corregir por un error de red local (certificado autofirmado), ajeno al cambio. Con el commit de registro, ahora ese error sale en la consola.

`tsc --noEmit` no reporta errores en `correccion-por-frase.ts`.

## Decisión

Se queda el Jev nuevo, aunque encuentre menos cosas. Decidido el 27 de octubre de 2026.

Que el tamiz no corrija redundancias, extranjerismos ni verbos comodín está bien: el Corrector aplica el manual de La Silla, y esas reglas no están en él. No se devuelven a `REGLAS_GENERALES`. Si algún día se quieren, se agregan al manual en Ajustes y el tamiz las toma sin tocar código.

La comparación es de una sola nota. Conviene mirar las primeras correcciones en producción para confirmar que el nuevo no deja pasar errores del manual.
