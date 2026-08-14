-- Hiperparámetros de razonamiento por herramienta.
--
-- Antes vivían en el formulario del detector, lo que obligaba al periodista a
-- decidirlos en cada generación. Al moverlos a la configuración de la
-- herramienta quedan junto a los prompts y los modelos, que es donde se define
-- cómo se comporta la herramienta.
--
-- reasoning_effort: cuánto razona el modelo antes de responder.
--   OpenAI lo recibe como `reasoningEffort`; Anthropic como `effort`, que
--   activa su thinking adaptativo. Valores: low | medium | high.
--   (OpenAI admite además `xhigh`, que Anthropic no acepta.)
-- verbosity: longitud y detalle de la respuesta. Sólo lo usa OpenAI
--   (`textVerbosity`). Valores: low | medium | high.

alter table public.tools
  add column if not exists reasoning_effort text not null default 'medium',
  add column if not exists verbosity text not null default 'medium';

alter table public.default_tools
  add column if not exists reasoning_effort text not null default 'medium',
  add column if not exists verbosity text not null default 'medium';

-- Restringir a los valores que aceptan los proveedores
alter table public.tools
  drop constraint if exists tools_reasoning_effort_check,
  add constraint tools_reasoning_effort_check
    check (reasoning_effort in ('low', 'medium', 'high', 'xhigh'));

alter table public.tools
  drop constraint if exists tools_verbosity_check,
  add constraint tools_verbosity_check
    check (verbosity in ('low', 'medium', 'high'));

alter table public.default_tools
  drop constraint if exists default_tools_reasoning_effort_check,
  add constraint default_tools_reasoning_effort_check
    check (reasoning_effort in ('low', 'medium', 'high', 'xhigh'));

alter table public.default_tools
  drop constraint if exists default_tools_verbosity_check,
  add constraint default_tools_verbosity_check
    check (verbosity in ('low', 'medium', 'high'));
