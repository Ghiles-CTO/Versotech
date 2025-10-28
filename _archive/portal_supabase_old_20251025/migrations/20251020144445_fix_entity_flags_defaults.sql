-- Fix entity_flags severity defaults to match application expectations

alter table public.entity_flags
  alter column severity set default 'warning';;
