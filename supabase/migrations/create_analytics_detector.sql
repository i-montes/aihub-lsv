-- Analytics del Detector de mentiras.
--
-- Es la cuarta tabla de la familia `analytics_*` y sigue el mismo contrato que
-- las otras tres (id de texto generado en la aplicación, upsert por id,
-- created_at/updated_at), pero con una diferencia de fondo: el detector puede
-- correr dos modelos a la vez sobre el mismo insumo. Por eso todo lo que
-- depende del modelo —salida, tiempo y tokens— va duplicado con sufijo _1 y _2
-- en vez de una sola columna.
--
-- Cuando corre un solo modelo, las columnas _2 quedan en NULL. `modo` distingue
-- los dos casos sin tener que mirar si modelo_2 vino vacío.

create table if not exists public.analytics_detector (
  id text primary key,
  session_id text,
  user_id uuid,
  organization_id uuid,

  -- ── Qué se corrió ────────────────────────────────────────────────────────
  -- `modo`: 'simple' (un modelo) o 'comparacion' (dos en paralelo).
  modo text not null default 'simple',
  proveedor_1 text,
  modelo_1 text,
  proveedor_2 text,
  modelo_2 text,
  -- Versión legible para leer la tabla sin cruzar columnas:
  -- 'gpt-5.6-terra' o 'gpt-5.6-terra + claude-opus-4-8'.
  modelos_resumen text,

  -- ── Salida de cada modelo ────────────────────────────────────────────────
  -- En modo simple el modelo principal es siempre el _1.
  output_1 text,
  output_2 text,
  longitud_output_1 integer,
  longitud_output_2 integer,

  -- ── Tiempos (ms), desagregados por modelo ────────────────────────────────
  -- Los dos modelos corren en paralelo, así que tiempo_total NO es la suma:
  -- es el tiempo de pared del request completo (incluye auth, config y prompt).
  tiempo_modelo_1 integer,
  tiempo_modelo_2 integer,
  tiempo_total integer,

  -- ── Tokens por modelo ────────────────────────────────────────────────────
  input_tokens_1 integer,
  output_tokens_1 integer,
  total_tokens_1 integer,
  reasoning_tokens_1 integer,
  cached_input_tokens_1 integer,
  input_tokens_2 integer,
  output_tokens_2 integer,
  total_tokens_2 integer,
  reasoning_tokens_2 integer,
  cached_input_tokens_2 integer,
  -- Suma de los dos, para consultas de costo sin sumar a mano.
  total_tokens integer,

  -- ── Entrada ──────────────────────────────────────────────────────────────
  -- El formulario del detector tiene demasiadas partes (tres bloques de texto
  -- con su metadata de enlaces, transcripciones de YouTube, adjuntos) para
  -- abrirlas en columnas. Va completo como jsonb, PERO sin los binarios: los
  -- adjuntos quedan como {nombre, tamano, tipo} y las fotos se ven en el Doc.
  -- Guardar los data URL base64 aquí haría filas de varios MB.
  input_completo jsonb,
  -- El prompt de usuario tal como lo recibió el modelo, ya con el contenido de
  -- los enlaces incrustado. Es el artefacto más útil para auditar una salida.
  prompt_usuario text,
  calificacion text,
  numero_imagenes integer default 0,
  numero_pdfs integer default 0,
  numero_enlaces integer default 0,
  numero_transcripciones integer default 0,

  -- ── Documento de revisión en Drive ───────────────────────────────────────
  -- Se crea después de responder (Next `after()`), así que estas columnas
  -- llegan unos segundos más tarde que el resto de la fila.
  documento_url text,
  documento_id text,
  documento_error text,

  -- ── Interacción y feedback ───────────────────────────────────────────────
  uso_copiar boolean default false,
  -- En comparación, cuál de las dos salidas copió el periodista: '1' o '2'.
  -- Es la señal de cuál modelo prefirió.
  modelo_copiado text,
  feedback_like boolean,
  feedback_rank_like integer,

  -- ── Estado ───────────────────────────────────────────────────────────────
  -- Sin esto los análisis que fallan no dejan rastro y la tabla sobrerrepresenta
  -- los casos exitosos.
  estado text not null default 'completado',
  error_mensaje text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.analytics_detector
  drop constraint if exists analytics_detector_modo_check,
  add constraint analytics_detector_modo_check
    check (modo in ('simple', 'comparacion'));

alter table public.analytics_detector
  drop constraint if exists analytics_detector_estado_check,
  add constraint analytics_detector_estado_check
    check (estado in ('completado', 'fallido'));

alter table public.analytics_detector
  drop constraint if exists analytics_detector_modelo_copiado_check,
  add constraint analytics_detector_modelo_copiado_check
    check (modelo_copiado is null or modelo_copiado in ('1', '2'));

create index if not exists idx_analytics_detector_organization
  on public.analytics_detector(organization_id);

create index if not exists idx_analytics_detector_created_at
  on public.analytics_detector(created_at desc);

create index if not exists idx_analytics_detector_modo
  on public.analytics_detector(modo);

-- RLS: la aplicación escribe con service_role (getSupabaseRouteHandler), que la
-- salta. La política de lectura existe para que una futura pantalla de
-- analíticas pueda consultar con el cliente del usuario sin ver otras
-- organizaciones.
alter table public.analytics_detector enable row level security;

drop policy if exists "service_role hace todo en analytics_detector" on public.analytics_detector;
create policy "service_role hace todo en analytics_detector"
  on public.analytics_detector
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "lectura por organizacion en analytics_detector" on public.analytics_detector;
create policy "lectura por organizacion en analytics_detector"
  on public.analytics_detector
  for select
  to authenticated
  using (
    organization_id = (
      select p."organizationId" from public.profiles p where p.id = auth.uid()
    )
  );

comment on table public.analytics_detector is
  'Una fila por generación del Detector de mentiras. Las columnas _2 sólo se llenan en modo comparación.';
