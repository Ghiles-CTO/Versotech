-- Migration: 20260106000002_add_individual_kyc_fields.sql
-- Purpose: Add comprehensive KYC fields to all member tables
-- These fields are required for regulatory compliance (KYC/AML, FATCA/CRS)

-- Use DO block to add columns to all member tables dynamically
DO $$
DECLARE
  member_tables text[] := ARRAY[
    'investor_members',
    'partner_members',
    'introducer_members',
    'lawyer_members',
    'commercial_partner_members',
    'arranger_members',
    'counterparty_entity_members'
  ];
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY member_tables
  LOOP
    -- Check if table exists before altering
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN

      -- Structured name fields (split from full_name)
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS first_name text', tbl);
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS middle_name text', tbl);
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS last_name text', tbl);
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS name_suffix text', tbl);

      -- Birth/nationality fields
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS date_of_birth date', tbl);
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS country_of_birth text', tbl);

      -- US tax status (FATCA compliance)
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS is_us_citizen boolean DEFAULT false', tbl);
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS is_us_taxpayer boolean DEFAULT false', tbl);
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS us_taxpayer_id text', tbl);

      -- Tax residency (CRS compliance)
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS country_of_tax_residency text', tbl);

      -- Separate phone fields (currently only phone exists)
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS phone_mobile text', tbl);
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS phone_office text', tbl);

      -- Additional address field
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS residential_line_2 text', tbl);

      -- ID document metadata (some tables may already have id_type, id_number, id_expiry_date)
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS id_issue_date date', tbl);
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS id_issuing_country text', tbl);

      -- Proof of address tracking (for document validation)
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS proof_of_address_date date', tbl);
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS proof_of_address_expiry date', tbl);

      -- KYC fields (add if not exists - some tables may already have these)
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS kyc_status text DEFAULT ''pending''', tbl);
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS kyc_approved_at timestamptz', tbl);
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS kyc_approved_by uuid', tbl);
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS kyc_expiry_date date', tbl);
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS kyc_notes text', tbl);

      RAISE NOTICE 'Added KYC columns to %', tbl;
    ELSE
      RAISE NOTICE 'Table % does not exist, skipping', tbl;
    END IF;
  END LOOP;
END;
$$;

-- Create function to compute full_name from name components
-- This preserves backward compatibility while allowing structured names
CREATE OR REPLACE FUNCTION public.compute_member_full_name()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only compute if we have structured name components
  IF NEW.first_name IS NOT NULL OR NEW.last_name IS NOT NULL THEN
    NEW.full_name := TRIM(
      COALESCE(NEW.first_name, '') ||
      CASE WHEN NEW.middle_name IS NOT NULL THEN ' ' || NEW.middle_name ELSE '' END ||
      CASE WHEN NEW.last_name IS NOT NULL THEN ' ' || NEW.last_name ELSE '' END ||
      CASE WHEN NEW.name_suffix IS NOT NULL THEN ' ' || NEW.name_suffix ELSE '' END
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Apply trigger to all member tables
DO $$
DECLARE
  member_tables text[] := ARRAY[
    'investor_members',
    'partner_members',
    'introducer_members',
    'lawyer_members',
    'commercial_partner_members',
    'arranger_members',
    'counterparty_entity_members'
  ];
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY member_tables
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
      -- Drop existing trigger if exists
      EXECUTE format('DROP TRIGGER IF EXISTS %I_compute_full_name ON public.%I', tbl, tbl);

      -- Create new trigger
      EXECUTE format('
        CREATE TRIGGER %I_compute_full_name
          BEFORE INSERT OR UPDATE OF first_name, middle_name, last_name, name_suffix
          ON public.%I
          FOR EACH ROW
          EXECUTE FUNCTION public.compute_member_full_name()
      ', tbl, tbl);

      RAISE NOTICE 'Created full_name trigger for %', tbl;
    END IF;
  END LOOP;
END;
$$;

-- Add foreign key constraint for kyc_approved_by if not exists
DO $$
DECLARE
  member_tables text[] := ARRAY[
    'investor_members',
    'partner_members',
    'introducer_members',
    'lawyer_members',
    'commercial_partner_members',
    'arranger_members',
    'counterparty_entity_members'
  ];
  tbl text;
  constraint_name text;
BEGIN
  FOREACH tbl IN ARRAY member_tables
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
      constraint_name := tbl || '_kyc_approved_by_fkey';

      -- Check if constraint already exists
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = constraint_name
      ) THEN
        -- Check if column exists first
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = tbl AND column_name = 'kyc_approved_by'
        ) THEN
          BEGIN
            EXECUTE format('
              ALTER TABLE public.%I
              ADD CONSTRAINT %I
              FOREIGN KEY (kyc_approved_by) REFERENCES public.profiles(id)
            ', tbl, constraint_name);
            RAISE NOTICE 'Added FK constraint for kyc_approved_by on %', tbl;
          EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not add FK constraint on %, may already exist: %', tbl, SQLERRM;
          END;
        END IF;
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- Add comments for documentation
COMMENT ON FUNCTION public.compute_member_full_name() IS
  'Computes full_name from first_name, middle_name, last_name, and name_suffix for all member tables';

-- Migrate existing phone data to phone_mobile where applicable
-- (Only if phone exists but phone_mobile is null)
DO $$
DECLARE
  member_tables text[] := ARRAY[
    'investor_members',
    'partner_members',
    'introducer_members',
    'lawyer_members',
    'commercial_partner_members',
    'arranger_members',
    'counterparty_entity_members'
  ];
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY member_tables
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
      -- Check if both phone and phone_mobile columns exist
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = tbl AND column_name = 'phone'
      ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = tbl AND column_name = 'phone_mobile'
      ) THEN
        -- Backfill phone_mobile from phone where phone_mobile is null
        EXECUTE format('
          UPDATE public.%I
          SET phone_mobile = phone
          WHERE phone_mobile IS NULL AND phone IS NOT NULL
        ', tbl);
        RAISE NOTICE 'Backfilled phone_mobile from phone in %', tbl;
      END IF;
    END IF;
  END LOOP;
END;
$$;
