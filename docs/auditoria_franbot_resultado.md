# Resultado de la auditoría de FranBot

**Fecha:** 3 de julio de 2026
**Insumo:** `docs/prompt_auditoria_franbot_fable.md` (prompt "Principal" del 20 de marzo de 2026 y "Manual de estilo" del 9 de abril de 2026)
**Entregables asociados:**
- Prompt Principal corregido: `docs/franbot_prompt_principal_corregido.md`
- Manual de estilo corregido: `docs/franbot_manual_estilo_corregido.md`

---

## Diagnóstico por falla

### A1. "gobierno" no se baja a minúscula de forma consistente

1. **Naturaleza:** arquitectura de decisión (con un componente de contradicción de especificación dentro del propio prompt).
2. **Ubicación del origen:** el prompt Principal, sección "Prohibiciones estrictas", punto 1; agravado por la triplicación de la regla en el manual (secciones 1, 8 y 9).
3. **Mecanismo:** la prohibición dice "Nombres propios de personas, lugares, cargos, **instituciones** o productos... **Ante cualquier duda sobre si algo es nombre propio, trátalo como nombre propio y no lo corrijas**". En español estándar, "Gobierno" (institución) se escribe con mayúscula y funciona como nombre institucional. El modelo, cuyo prior RAE/Fundéu dice que "Gobierno" es correcto, encuentra en la prohibición una instrucción explícita que coincide con ese prior: hay duda → es nombre propio → no tocar. La regla de la guía nunca llega a competir. La triplicación en el manual (una de las tres copias además rotulada "EXCEPCIÓN 'gobierno'", como si fuera excepción de otra regla) diluye la autoridad en vez de reforzarla: tres formulaciones distintas de lo mismo leen como ruido histórico, no como norma.
4. **Arreglo mínimo:** estructural, no aditivo. (a) Reescribir la prohibición de nombres propios para que proteja la **identidad** (a quién/qué se refiere el texto) y excluya explícitamente la **grafía** gobernada por la guía (mayúsculas, siglas, formato). (b) Consolidar la regla de "gobierno" en una única sección de máxima prioridad del manual, con ejemplos en ambas direcciones (qué corregir y qué NO tocar). Añadir una cuarta advertencia repetida habría empeorado el problema: la falla no es falta de énfasis sino una instrucción contraria con rango superior.

### A2. Siglas (Farc/Otan/Unicef) no se aplican de forma consistente

1. **Naturaleza:** arquitectura de decisión + contradicción de especificación.
2. **Ubicación del origen:** el mismo punto 1 de las prohibiciones del Principal; y dos contradicciones internas del manual: (a) la sección "Partidos y movimientos" ordena "Respetar la escritura oficial de estos nombres propios" y "Mantener mayúsculas/minúsculas exactamente como aparecen", con **ALMA** (4 letras en mayúscula sostenida) en la lista, contradiciendo la regla de siglas 4+ sin declararse excepción; (b) los ejemplos de la regla de siglas son en su mayoría instituciones mexicanas (Segob, Inegi, Pemex, Imss, Ine), señal de un fragmento heredado de otra guía que resta credibilidad a la sección ante el modelo.
3. **Mecanismo:** idéntico al de A1 — FARC, OTAN y UNICEF son nombres de organizaciones; la grafía oficial y la RAE escriben FARC/OTAN; la prohibición de nombres propios más el desempate "duda → no tocar" le dan al modelo permiso para conservar la forma estándar. La instrucción de "respetar la escritura oficial" de la sección de partidos refuerza el reflejo: la escritura "oficial" de las FARC es con mayúscula sostenida. Esto confirma la hipótesis de trabajo: en los puntos exactos donde La Silla se aparta del estándar, el prompt contiene texto que valida el prior del modelo.
4. **Arreglo mínimo:** (a) el mismo carve-out de grafía del arreglo A1 (una sola intervención cubre ambas fallas); (b) declarar en el manual, de forma explícita, que las grafías oficiales de la lista de partidos son **excepciones enumeradas** a la regla de siglas (ALMA), no un principio general de "respetar la escritura oficial"; (c) sustituir los ejemplos mexicanos por ejemplos colombianos (Dane, Sena, Icbf, Invima, Fecode).

### B1. La prioridad "La Silla primero" no se impone

1. **Naturaleza:** arquitectura de decisión.
2. **Ubicación del origen:** prompt Principal, "jerarquía normativa" (puntos 1–3).
3. **Mecanismo:** la jerarquía está formulada como un conflicto **entre documentos** ("en caso de discrepancia entre fuentes, prevalece la guía"). Pero el adversario real de la guía no es un documento: es el **conocimiento interno del modelo** sobre el español estándar, que el modelo no experimenta como una "fuente" que consulta sino como lo que ya sabe. Tal como está redactada, la jerarquía nunca se activa en los casos A1/A2/C1: el modelo no percibe discrepancia entre fuentes, percibe que el texto ya está bien (subcorrección) o que tiene un error estándar (sobrecorrección). El punto 2 (Fundéu/RAE como red de seguridad con lista cerrada) está bien diseñado y debe conservarse.
4. **Arreglo mínimo:** reescribir el punto 1 y 3 de la jerarquía para nombrar al adversario real: declarar que La Silla se aparta **deliberadamente** de la RAE/Fundéu, enumerar los tres puntos de divergencia conocidos (gobierno, siglas, cifras con mil/millones), y ordenar explícitamente que en esos puntos la intuición de español estándar del modelo queda invertida: lo que le parece correcto es error y viceversa. Es un cambio estructural de encuadre, no una regla más.

### C1. Sobrecorrección "más de 15 mil damnificados" → "15.000"

1. **Naturaleza:** precisión/restricción, causada por una ambigüedad de especificación en el manual.
2. **Ubicación del origen:** manual, sección 7 "Números y fechas", regla "**EXCEPCIÓN - Números compuestos (mil, millones, porcentajes): SIEMPRE en cifras**".
3. **Mecanismo:** "SIEMPRE en cifras" admite dos lecturas: (i) la pretendida — el *numeral que acompaña* a "mil"/"millones" va en dígitos ("3 mil", no "tres mil") — y (ii) la defectuosa — *la cantidad completa* va en dígitos ("15.000", no "15 mil"). La lectura (ii) coincide con el prior del modelo (Fundéu desaconseja los híbridos cifra+palabra como "15 mil"). Crucialmente, esta ambigüedad le permite al modelo **superar la verificación obligatoria del Principal** ("¿puedes citar exactamente qué regla se incumple?"): cita "Números compuestos: SIEMPRE en cifras" y la corrección pasa el filtro. La regla correcta ("usar 'mil' cuando es múltiplo exacto de 1.000") está tres bullets más abajo, formulada solo en positivo, sin decir nunca que convertir "15 mil" en "15.000" es un error del corrector. Confirma la hipótesis: el prior gana porque encuentra una grieta citable en la especificación.
4. **Arreglo mínimo:** reescribir la sección de números separando las dos reglas ortogonales y cerrando la lectura defectuosa: (a) "la regla afecta SOLO al numeral, no ordena escribir la cantidad completa en dígitos"; (b) ejemplos bidireccionales: `❌ 15.000 → ✅ 15 mil` y `✅ "más de 15 mil damnificados" (correcto — no generar corrección)`. Añadir además a la verificación del Principal una cuarta pregunta de descarte: "¿tu única razón es que la RAE o Fundéu lo preferirían así? → descarta".

### D1. MinHacienda, MinTIC, etc. deben respetarse

1. **Naturaleza:** reconocimiento (falta de carve-out); independiente de las anteriores.
2. **Ubicación del origen:** manual, sección 9.2 (regla de siglas). No existe ninguna mención a las abreviaturas acuñadas de ministerios en todo el documento.
3. **Mecanismo:** aquí el problema no es el prior del modelo sino la regla misma: "MinHacienda" tiene más de 4 letras, así que la regla de siglas, aplicada literalmente y con "máxima prioridad", ordena producir "Minhacienda". Es la falla inversa a A1/A2: la instrucción sí se impone, pero sobre un caso que debía estar excluido. La única salvación posible era la prohibición de nombres propios — precisamente la instrucción que el arreglo de A1/A2 va a debilitar para la grafía — así que **el carve-out de grafía hace obligatorio añadir esta excepción a la vez**, o el arreglo de A empeoraría D.
4. **Arreglo mínimo:** subsección explícita de excepciones a la regla de siglas: EE.UU.; abreviaturas acuñadas con mayúscula interna (patrón "Min" + nombre: MinHacienda, MinTIC, MinSalud, MinDefensa, MinInterior, etc.), que no se revierten a "Ministerio de..." ni se les bajan las mayúsculas internas; y las grafías oficiales de partidos enumeradas (ALMA).

---

## Hallazgos adicionales (no listados en la tipología, detectados durante la auditoría)

- **Contradicción citas:** el Principal prohíbe tocar "textos de citas directas o indirectas", pero el manual (sección 3) ordena "si hay error en cita textual, corregir (salvo que el error aporte información relevante)". Resuelta en los documentos corregidos: los errores ortográficos evidentes dentro de citas sí se corrigen; nunca se reformula ni se cambia el sentido. **Requiere confirmación humana** de que esa es la política editorial deseada.
- **Duplicado mal ubicado:** la "EXCEPCIÓN 'etc.'" aparece dos veces, la segunda bajo "Comas con pero", donde no tiene relación. Eliminada del lugar incorrecto.
- **Verbos muletilla con flechas ambiguas** (`permitir→facultar`): la dirección de la flecha sugiere lo contrario de lo que se quiere. Reformulado.
- **Metas de longitud (18/54 palabras "promedio")**: una regla de promedio no es verificable frase a frase e invita a falsos positivos de estilo. Acotada a "solo casos extremos que dañen la claridad".
- **Contexto de código (solo contexto, no parte de este arreglo):** la auditoría de código detectó que `actions/analyze-text.ts:337-340` ensambla el prompt buscando los títulos exactos `"Principal"` y `"Guia de estilo"` (sin tilde, sensible a mayúsculas) y que si no coinciden la guía entra **vacía y sin aviso**; además la UI envía HTML en lugar de texto plano (`app/dashboard/corrector/page.tsx:515-516`). **Ninguna corrección de prompt surtirá efecto si la guía no está llegando al modelo.** Al cargar los documentos corregidos en la base de datos, verificar que los títulos de los prompts coincidan exactamente con los que el código busca.

---

## Veredicto sobre la hipótesis

**Confirmada, con una precisión importante.** A1, A2, B1 y C1 son un mismo bug de fondo asomando por varios lados: la autoridad de la instrucción no se impone sobre el conocimiento de español estándar del modelo. Pero la causa no es que el modelo "desobedezca": es que **el propio prompt le da permiso escrito de obedecer a su prior** en cada uno de esos puntos — la prohibición de nombres propios con desempate "duda → no tocar" (A1, A2), la jerarquía formulada contra documentos y no contra su conocimiento interno (B1), y la regla ambigua "SIEMPRE en cifras" que le permite citar una norma al sobrecorregir (C1). No es un problema de énfasis insuficiente sino de instrucciones contrarias con rango superior; por eso añadir más advertencias o repetir las reglas (como ya se hizo triplicando "gobierno") no funcionó y no funcionará.

D1 es la excepción: una falla independiente de reconocimiento (falta un carve-out), que además queda **acoplada** al arreglo principal — debilitar la prohibición de nombres propios para la grafía exige añadir las excepciones de MinHacienda/EE.UU./ALMA simultáneamente.

## Las 3 intervenciones de mayor impacto, en orden

1. **Reencuadrar la jerarquía normativa y la prohibición de nombres propios** (Principal): declarar las divergencias deliberadas frente a RAE/Fundéu e invertir explícitamente la intuición del modelo en esos puntos; limitar la prohibición de nombres propios a la identidad, excluyendo la grafía regida por la guía. Arregla A1, A2 y B1 de raíz.
2. **Desambiguar la sección de números y añadir la pregunta de descarte anti-RAE** (manual sección de cifras + verificación del Principal): reglas ortogonales separadas, ejemplos bidireccionales con "no generar corrección", y descarte automático de correcciones cuya única base sea la preferencia RAE/Fundéu. Arregla C1 y reduce falsos positivos en general.
3. **Excepciones explícitas de reconocimiento** (manual): EE.UU., abreviaturas acuñadas MinHacienda/MinTIC/etc., grafías oficiales de partidos (ALMA). Arregla D1 y blinda el arreglo n.º 1.

(Condición externa, de código: garantizar que la guía de estilo realmente entra al prompt — títulos exactos en la base de datos — y que el modelo recibe texto plano. Sin eso, las tres intervenciones anteriores son invisibles.)
