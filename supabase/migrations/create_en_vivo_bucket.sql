-- Bucket de Supabase Storage para En Vivo: la foto recortada que se sube a
-- Canva y el PNG final (sin y con etiquetas). lib/en-vivo/almacen.ts lo usa
-- cuando EN_VIVO_BUCKET=en-vivo; sin esa variable, en local, guarda en
-- .data/en-vivo.
--
-- Privado: los archivos los sirve /api/en-vivo/archivo/[id], que exige sesión,
-- y las subidas a Canva y Facebook van como binario, no por URL. Sólo el rol de
-- servicio escribe y lee (sin políticas para anon ni authenticated). La app
-- borra lo de más de 2 días cada vez que guarda algo.
--
-- application/json: las marcas de publicación (lib/en-vivo/publicaciones.ts),
-- que evitan publicar la misma pieza dos veces.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('en-vivo', 'en-vivo', false, 15728640, array['image/png', 'image/jpeg', 'application/json'])
on conflict (id) do nothing;
