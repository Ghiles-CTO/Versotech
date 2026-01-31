alter table public.deal_fee_structures
  add column if not exists to_description text;
