-- Migration: 20260106000006_enhance_arranger_entities.sql
-- Purpose: Add structured address fields and individual KYC fields to arranger_entities
-- Currently arranger_entities only has a single 'address' text field

-- Add structured address fields
ALTER TABLE public.arranger_entities
  ADD COLUMN IF NOT EXISTS address_line_1 text,
  ADD COLUMN IF NOT EXISTS address_line_2 text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state_province text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS country text;

-- Add type field for individual vs entity arrangers
ALTER TABLE public.arranger_entities
  ADD COLUMN IF NOT EXISTS type text DEFAULT 'entity';

-- Add constraint for type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'arranger_entities_type_check'
  ) THEN
    ALTER TABLE public.arranger_entities
      ADD CONSTRAINT arranger_entities_type_check
      CHECK (type IN ('individual', 'entity'));
  END IF;
END;
$$;

-- Add country of incorporation (for entities)
ALTER TABLE public.arranger_entities
  ADD COLUMN IF NOT EXISTS country_of_incorporation text;

-- Add separate phone fields
ALTER TABLE public.arranger_entities
  ADD COLUMN IF NOT EXISTS phone_mobile text,
  ADD COLUMN IF NOT EXISTS phone_office text;

-- Add website
ALTER TABLE public.arranger_entities
  ADD COLUMN IF NOT EXISTS website text;

-- Add individual KYC fields (for individual arrangers)
ALTER TABLE public.arranger_entities
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS middle_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS name_suffix text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS country_of_birth text,
  ADD COLUMN IF NOT EXISTS nationality text;

-- Add US tax compliance fields
ALTER TABLE public.arranger_entities
  ADD COLUMN IF NOT EXISTS is_us_citizen boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_us_taxpayer boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS us_taxpayer_id text,
  ADD COLUMN IF NOT EXISTS country_of_tax_residency text;

-- Add ID document fields (for individuals)
ALTER TABLE public.arranger_entities
  ADD COLUMN IF NOT EXISTS id_type text,
  ADD COLUMN IF NOT EXISTS id_number text,
  ADD COLUMN IF NOT EXISTS id_expiry_date date,
  ADD COLUMN IF NOT EXISTS id_issue_date date,
  ADD COLUMN IF NOT EXISTS id_issuing_country text;

-- Migrate existing address data to address_line_1
UPDATE public.arranger_entities
SET address_line_1 = address
WHERE address IS NOT NULL AND address_line_1 IS NULL;

-- Create trigger for computing display name for individual arrangers
CREATE OR REPLACE FUNCTION public.compute_arranger_display_name()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- For individuals, compute display name from name components
  IF NEW.type = 'individual' AND (NEW.first_name IS NOT NULL OR NEW.last_name IS NOT NULL) THEN
    NEW.company_name := TRIM(
      COALESCE(NEW.first_name, '') ||
      CASE WHEN NEW.middle_name IS NOT NULL THEN ' ' || NEW.middle_name ELSE '' END ||
      CASE WHEN NEW.last_name IS NOT NULL THEN ' ' || NEW.last_name ELSE '' END ||
      CASE WHEN NEW.name_suffix IS NOT NULL THEN ' ' || NEW.name_suffix ELSE '' END
    );
    -- Also set legal_name to match
    NEW.legal_name := COALESCE(NEW.legal_name, NEW.company_name);
  END IF;
  RETURN NEW;
END;
$$;

-- Apply trigger
DROP TRIGGER IF EXISTS arranger_entities_compute_display_name ON public.arranger_entities;
CREATE TRIGGER arranger_entities_compute_display_name
  BEFORE INSERT OR UPDATE OF first_name, middle_name, last_name, name_suffix, type
  ON public.arranger_entities
  FOR EACH ROW
  EXECUTE FUNCTION public.compute_arranger_display_name();

-- Add comments
COMMENT ON COLUMN public.arranger_entities.type IS 'Type of arranger: individual or entity';
COMMENT ON COLUMN public.arranger_entities.address_line_1 IS 'Primary street address (migrated from address field)';
COMMENT ON COLUMN public.arranger_entities.is_us_citizen IS 'US citizenship status for FATCA compliance (individual arrangers)';
