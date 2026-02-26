alter table public.deal_fee_structures
  add column if not exists product_description text;
