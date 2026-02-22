-- Add missing profile columns used by self-service profile update APIs.
-- This migration targets issue #2 only (field/schema mismatch on profile saves).

ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS country_of_incorporation text,
  ADD COLUMN IF NOT EXISTS registration_number text,
  ADD COLUMN IF NOT EXISTS tax_id text;

ALTER TABLE public.introducers
  ADD COLUMN IF NOT EXISTS phone text;

ALTER TABLE public.lawyers
  ADD COLUMN IF NOT EXISTS address_line_1 text,
  ADD COLUMN IF NOT EXISTS address_line_2 text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS country_of_incorporation text;

ALTER TABLE public.commercial_partners
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS state_province text;
