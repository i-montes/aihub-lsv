-- Claves de API por herramienta y proveedor.
--
-- Reemplaza a api_key_table (una clave por organización y proveedor): ahora
-- cada herramienta tiene las suyas. Sólo la lee y escribe el rol de servicio;
-- el navegador nunca ve esta tabla. Ver
-- docs/superpowers/specs/2026-09-29-claves-por-herramienta-design.md.

create table if not exists public.herramienta_proveedores (
  organization_id uuid not null references public.organization (id) on delete cascade,
  herramienta text not null,
  proveedor text not null check (proveedor in ('OPENAI', 'ANTHROPIC', 'GOOGLE')),
  api_key text not null check (length(api_key) > 0),
  modelo text not null check (length(modelo) > 0),
  reasoning_effort text,
  verbosity text,
  posicion integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, herramienta, proveedor)
);

-- Una clave no se repite entre herramientas de la misma organización.
create unique index if not exists herramienta_proveedores_clave_unica
  on public.herramienta_proveedores (organization_id, api_key);

alter table public.herramienta_proveedores enable row level security;

drop policy if exists "service_role_todo" on public.herramienta_proveedores;
create policy "service_role_todo"
  on public.herramienta_proveedores
  for all
  to service_role
  using (true)
  with check (true);

-- Guarda la configuración completa de una herramienta en una transacción:
-- inserta o actualiza los proveedores que vienen y borra los que no.
--
-- `p_proveedores` es un arreglo JSON de objetos
--   { "proveedor", "api_key" (opcional: conservar la actual), "modelo",
--     "reasoning_effort", "verbosity", "posicion" }.
-- Si `api_key` viene nulo, se conserva la de la fila existente; si no hay
-- fila, falla con un mensaje claro.
create or replace function public.guardar_herramienta_proveedores(
  p_organization_id uuid,
  p_herramienta text,
  p_proveedores jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  fila jsonb;
  clave text;
begin
  delete from public.herramienta_proveedores
  where organization_id = p_organization_id
    and herramienta = p_herramienta
    and proveedor not in (
      select value ->> 'proveedor' from jsonb_array_elements(p_proveedores)
    );

  for fila in select value from jsonb_array_elements(p_proveedores) loop
    clave := fila ->> 'api_key';
    if clave is null then
      select api_key into clave
      from public.herramienta_proveedores
      where organization_id = p_organization_id
        and herramienta = p_herramienta
        and proveedor = fila ->> 'proveedor';
      if clave is null then
        raise exception 'El proveedor % no tiene clave guardada', fila ->> 'proveedor'
          using errcode = '22023';
      end if;
    end if;

    insert into public.herramienta_proveedores (
      organization_id, herramienta, proveedor, api_key, modelo,
      reasoning_effort, verbosity, posicion, updated_at
    ) values (
      p_organization_id,
      p_herramienta,
      fila ->> 'proveedor',
      clave,
      fila ->> 'modelo',
      fila ->> 'reasoning_effort',
      fila ->> 'verbosity',
      coalesce((fila ->> 'posicion')::integer, 0),
      now()
    )
    on conflict (organization_id, herramienta, proveedor) do update set
      api_key = excluded.api_key,
      modelo = excluded.modelo,
      reasoning_effort = excluded.reasoning_effort,
      verbosity = excluded.verbosity,
      posicion = excluded.posicion,
      updated_at = now();
  end loop;
end;
$$;

revoke all on function public.guardar_herramienta_proveedores(uuid, text, jsonb) from public;
grant execute on function public.guardar_herramienta_proveedores(uuid, text, jsonb) to service_role;
