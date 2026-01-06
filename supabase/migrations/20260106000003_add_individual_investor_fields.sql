-- Migration: 20260106000003_add_individual_investor_fields.sql
-- Purpose: Add individual-specific KYC fields to investors table
-- These are used when type='individual' (224 records currently)

-- Add structured name fields (for individual investors)
ALTER TABLE public.investors
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS middle_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS name_suffix text;

-- Add birth/nationality fields
ALTER TABLE public.investors
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS country_of_birth text,
  ADD COLUMN IF NOT EXISTS nationality text;

-- Add US tax status (FATCA compliance)
ALTER TABLE public.investors
  ADD COLUMN IF NOT EXISTS is_us_citizen boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_us_taxpayer boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS us_taxpayer_id text;

-- Additional tax residencies (array for CRS multi-jurisdiction)
ALTER TABLE public.investors
  ADD COLUMN IF NOT EXISTS additional_tax_residencies text[];

-- Add ID document fields (for individual investors)
ALTER TABLE public.investors
  ADD COLUMN IF NOT EXISTS id_type text,
  ADD COLUMN IF NOT EXISTS id_number text,
  ADD COLUMN IF NOT EXISTS id_expiry_date date,
  ADD COLUMN IF NOT EXISTS id_issue_date date,
  ADD COLUMN IF NOT EXISTS id_issuing_country text;

-- Add proof of address tracking
ALTER TABLE public.investors
  ADD COLUMN IF NOT EXISTS proof_of_address_date date,
  ADD COLUMN IF NOT EXISTS proof_of_address_expiry date;

-- Add additional residential address line
ALTER TABLE public.investors
  ADD COLUMN IF NOT EXISTS residential_line_2 text;

-- Add postal code to registered address (was missing)
ALTER TABLE public.investors
  ADD COLUMN IF NOT EXISTS postal_code text;

-- Create trigger for computing display_name for individual investors
CREATE OR REPLACE FUNCTION public.compute_investor_display_name()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- For individuals, compute display_name from name components
  IF NEW.type = 'individual' AND (NEW.first_name IS NOT NULL OR NEW.last_name IS NOT NULL) THEN
    NEW.display_name := TRIM(
      COALESCE(NEW.first_name, '') ||
      CASE WHEN NEW.middle_name IS NOT NULL THEN ' ' || NEW.middle_name ELSE '' END ||
      CASE WHEN NEW.last_name IS NOT NULL THEN ' ' || NEW.last_name ELSE '' END ||
      CASE WHEN NEW.name_suffix IS NOT NULL THEN ' ' || NEW.name_suffix ELSE '' END
    );
    -- For individuals, legal_name should match display_name
    NEW.legal_name := COALESCE(NEW.legal_name, NEW.display_name);
  END IF;
  RETURN NEW;
END;
$$;

-- Apply trigger
DROP TRIGGER IF EXISTS investors_compute_display_name ON public.investors;
CREATE TRIGGER investors_compute_display_name
  BEFORE INSERT OR UPDATE OF first_name, middle_name, last_name, name_suffix, type
  ON public.investors
  FOR EACH ROW
  EXECUTE FUNCTION public.compute_investor_display_name();

-- Add check constraint for ID type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'investors_id_type_check'
  ) THEN
    ALTER TABLE public.investors
      ADD CONSTRAINT investors_id_type_check
      CHECK (id_type IS NULL OR id_type IN ('passport', 'national_id', 'drivers_license', 'residence_permit'));
  END IF;
END;
$$;

-- Add comments
COMMENT ON COLUMN public.investors.first_name IS 'First name for individual investors (when type=individual)';
COMMENT ON COLUMN public.investors.is_us_citizen IS 'US citizenship status for FATCA compliance';
COMMENT ON COLUMN public.investors.us_taxpayer_id IS 'US SSN or TIN for US persons';
COMMENT ON COLUMN public.investors.additional_tax_residencies IS 'Array of additional countries of tax residency for CRS reporting';
COMMENT ON COLUMN public.investors.postal_code IS 'Postal/ZIP code for registered address';
