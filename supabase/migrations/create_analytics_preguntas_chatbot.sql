-- Analytics de la herramienta "Preguntas al chatbot": un agente que consulta
-- (sólo lectura) la base de datos del chatbot de La Silla Vacía para
-- responder, en lenguaje natural y a varios turnos, qué le han preguntado.
--
-- Una fila por turno de la conversación (no por conversación completa):
-- así cada llamada real al modelo queda con su propio costo, igual que el
-- resto de analytics de esta app.
--
-- Sin RLS a propósito, igual que analytics_quien_es_quien (ver
-- grant_service_role_analytics_quien_es_quien.sql): nada en la app lee esta
-- tabla como usuario final todavía, y esa migración ya documentó que una
-- tabla sin RLS necesita GRANT explícito para `service_role` porque no lo
-- tiene por default. Se otorgan ambos roles en la misma migración para no
-- repetir por tercera vez el mismo bug (detector y quien_es_quien ya lo
-- sufrieron cada uno por separado).
create table if not exists public.analytics_preguntas_chatbot (
  id text primary key,
  -- Agrupa todos los turnos de una misma conversación (generado en el
  -- cliente al abrir el chat, no por fila como en las otras herramientas).
  session_id text not null,
  user_id uuid,
  organization_id uuid,

  turno integer not null,
  pregunta_usuario text,
  comentario_agente text,

  -- SQL de sólo lectura que el propio modelo redactó y se ejecutó contra
  -- chats_new este turno — auditoría de qué consultó, no resultados crudos.
  sql_ejecutado jsonb,
  filas_devueltas integer,
  -- La tabla resumen (fecha/tema/cantidad) que arma el modelo; la tabla
  -- desagregada NO se guarda aquí, es reproducible desde sql_ejecutado.
  resumen jsonb,
  pasos_agente integer,

  modelo_utilizado text,
  input_tokens integer,
  output_tokens integer,
  total_tokens integer,
  reasoning_tokens integer,
  cached_input_tokens integer,
  -- Más caro que el input normal en Anthropic: crea la entrada de caché.
  cache_write_tokens integer,
  -- USD calculados con lib/costos.ts. NULL si el modelo no está ahí.
  costo numeric(12,6),
  tiempo_procesamiento numeric(10,2),

  error_mensaje text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists analytics_preguntas_chatbot_session_id_idx
  on public.analytics_preguntas_chatbot (session_id);

grant select, insert, update, delete on public.analytics_preguntas_chatbot to service_role;
grant select, insert, update, delete on public.analytics_preguntas_chatbot to authenticated;

-- Verificación: debe devolver "t" (true) en las seis filas.
select
  has_table_privilege('service_role', 'public.analytics_preguntas_chatbot', 'INSERT') as service_role_inserta,
  has_table_privilege('service_role', 'public.analytics_preguntas_chatbot', 'SELECT') as service_role_lee,
  has_table_privilege('service_role', 'public.analytics_preguntas_chatbot', 'UPDATE') as service_role_actualiza,
  has_table_privilege('authenticated', 'public.analytics_preguntas_chatbot', 'INSERT') as authenticated_inserta,
  has_table_privilege('authenticated', 'public.analytics_preguntas_chatbot', 'SELECT') as authenticated_lee,
  has_table_privilege('authenticated', 'public.analytics_preguntas_chatbot', 'UPDATE') as authenticated_actualiza;
