-- Align document folder seeding helper with current schema

drop index if exists document_folders_vehicle_name_idx;

create unique index if not exists document_folders_vehicle_name_idx
  on public.document_folders(vehicle_id, name);

create or replace function public.ensure_entity_default_folders(p_vehicle_id uuid, p_actor uuid default null)
returns void
language plpgsql
as $$
declare
  folder_names text[] := array['KYC','Legal','Redemption','Operations'];
  folder text;
begin
  foreach folder in array folder_names
  loop
    insert into public.document_folders (vehicle_id, name, path, folder_type, created_by)
    values (p_vehicle_id, folder, concat('/', folder), 'category', p_actor)
    on conflict (vehicle_id, name) do nothing;
  end loop;
end;
$$;;
