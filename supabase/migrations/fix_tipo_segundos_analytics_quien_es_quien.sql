-- `segundos` no cabe en integer: el upstream lo redondea a un decimal
-- (`Math.round(r.segundos * 10) / 10`, ver quienai2.0/api/perfil.ts), nunca
-- es un entero. Toda generación exitosa —la única que llena este campo, ya
-- que 'nombre' no lo usa y un 'perfil' fallido lo deja en null— reventaba el
-- insert con "invalid input syntax for type integer" y la fila nunca se
-- guardaba. Reproducido en vivo con una generación real de 128.9 segundos.
--
-- Esto, no el permiso de service_role, era la causa de que "generación" no
-- se guardara nunca mientras "nombre" sí: nombre no toca esta columna, y el
-- único intento de perfil que sí había pasado por el permiso arreglado antes
-- resultó ser un caso fallido con segundos en null, que no dispara este error.

alter table public.analytics_quien_es_quien
  alter column segundos type numeric(6,1);
