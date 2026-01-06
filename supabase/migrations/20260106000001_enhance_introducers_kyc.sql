-- Migration: 20260106000001_enhance_introducers_kyc.sql
-- Purpose: Add missing fields to introducers table to match other entity tables
-- The introducers table was severely lacking compared to partners, lawyers, etc.

-- Add type field (individual vs entity) - CRITICAL missing field
ALTER TABLE public.introducers
  ADD COLUMN IF NOT EXISTS type text DEFAULT 'individual';

-- Add constraint for type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'introducers_type_check'
  ) THEN
    ALTER TABLE public.introducers
      ADD CONSTRAINT introducers_type_check
      CHECK (type IN ('individual', 'entity', 'sole_proprietor'));
  END IF;
END;
$$;

-- Add display name if not exists
ALTER TABLE public.introducers
  ADD COLUMN IF NOT EXISTS display_name text;

-- Add phone fields (separate mobile/office)
ALTER TABLE public.introducers
  ADD COLUMN IF NOT EXISTS phone_mobile text,
  ADD COLUMN IF NOT EXISTS phone_office text;

-- Add website
ALTER TABLE public.introducers
  ADD COLUMN IF NOT EXISTS website text;

-- Add address fields (ALL MISSING!)
ALTER TABLE public.introducers
  ADD COLUMN IF NOT EXISTS address_line_1 text,
  ADD COLUMN IF NOT EXISTS address_line_2 text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state_province text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS country text;

-- Add company registration fields (for entity type)
ALTER TABLE public.introducers
  ADD COLUMN IF NOT EXISTS country_of_incorporation text,
  ADD COLUMN IF NOT EXISTS registration_number text,
  ADD COLUMN IF NOT EXISTS tax_id text;

-- Add individual KYC fields (for individual type)
ALTER TABLE public.introducers
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS middle_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS name_suffix text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS country_of_birth text,
  ADD COLUMN IF NOT EXISTS nationality text;

-- Add US tax compliance fields
ALTER TABLE public.introducers
  ADD COLUMN IF NOT EXISTS is_us_citizen boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_us_taxpayer boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS us_taxpayer_id text,
  ADD COLUMN IF NOT EXISTS country_of_tax_residency text;

-- Add ID document fields
ALTER TABLE public.introducers
  ADD COLUMN IF NOT EXISTS id_type text,
  ADD COLUMN IF NOT EXISTS id_number text,
  ADD COLUMN IF NOT EXISTS id_expiry_date date,
  ADD COLUMN IF NOT EXISTS id_issue_date date,
  ADD COLUMN IF NOT EXISTS id_issuing_country text;

-- Add updated_at if not exists
ALTER TABLE public.introducers
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Backfill legal_name from contact_name for existing records if needed
UPDATE public.introducers
SET legal_name = COALESCE(legal_name, contact_name)
WHERE legal_name IS NULL AND contact_name IS NOT NULL;

-- Backfill display_name from legal_name or contact_name
UPDATE public.introducers
SET display_name = COALESCE(display_name, legal_name, contact_name)
WHERE display_name IS NULL;

-- Create or replace trigger for updated_at
CREATE OR REPLACE FUNCTION public.introducers_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS introducers_set_updated_at ON public.introducers;
CREATE TRIGGER introducers_set_updated_at
  BEFORE UPDATE ON public.introducers
  FOR EACH ROW
  EXECUTE FUNCTION public.introducers_set_updated_at();

-- Create function to compute full name for individual introducers
CREATE OR REPLACE FUNCTION public.compute_introducer_display_name()
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
    -- Also update legal_name to match for individuals
    NEW.legal_name := NEW.display_name;
  END IF;
  RETURN NEW;
END;
$$;

-- Apply trigger for computing display name
DROP TRIGGER IF EXISTS introducers_compute_display_name ON public.introducers;
CREATE TRIGGER introducers_compute_display_name
  BEFORE INSERT OR UPDATE OF first_name, middle_name, last_name, name_suffix, type
  ON public.introducers
  FOR EACH ROW
  EXECUTE FUNCTION public.compute_introducer_display_name();

-- Add comments for documentation
COMMENT ON COLUMN public.introducers.type IS 'Type of introducer: individual, entity, or sole_proprietor';
COMMENT ON COLUMN public.introducers.is_us_citizen IS 'Whether the individual is a US citizen (for FATCA compliance)';
COMMENT ON COLUMN public.introducers.us_taxpayer_id IS 'US SSN or TIN if US person';
COMMENT ON COLUMN public.introducers.country_of_tax_residency IS 'Primary country of tax residency';
