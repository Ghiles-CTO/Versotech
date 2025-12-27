-- Fix fee_component_kind_enum by adding missing values required by application code
-- These values are used in subscription-fee-calculator.ts but were missing from the database enum

-- Add missing enum values (cannot use IF NOT EXISTS with ALTER TYPE, so we need to check first)
DO $$
BEGIN
  -- Check and add 'flat' (used for investment commitment amount)
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'flat' AND enumtypid = 'public.fee_component_kind_enum'::regtype) THEN
    ALTER TYPE public.fee_component_kind_enum ADD VALUE 'flat';
  END IF;

  -- Check and add 'spread_markup' (used for spread fees)
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'spread_markup' AND enumtypid = 'public.fee_component_kind_enum'::regtype) THEN
    ALTER TYPE public.fee_component_kind_enum ADD VALUE 'spread_markup';
  END IF;

  -- Check and add 'bd_fee' (broker-dealer fees)
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'bd_fee' AND enumtypid = 'public.fee_component_kind_enum'::regtype) THEN
    ALTER TYPE public.fee_component_kind_enum ADD VALUE 'bd_fee';
  END IF;

  -- Check and add 'finra_fee' (FINRA regulatory fees)
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'finra_fee' AND enumtypid = 'public.fee_component_kind_enum'::regtype) THEN
    ALTER TYPE public.fee_component_kind_enum ADD VALUE 'finra_fee';
  END IF;

  -- Check and add 'other' (miscellaneous fees)
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'other' AND enumtypid = 'public.fee_component_kind_enum'::regtype) THEN
    ALTER TYPE public.fee_component_kind_enum ADD VALUE 'other';
  END IF;
END $$;

-- Verify the enum now has all required values
-- Expected values after this migration:
-- 'subscription', 'management', 'performance' (original)
-- 'flat', 'spread_markup', 'bd_fee', 'finra_fee', 'other' (added)

-- Add comment to document the fee types
COMMENT ON TYPE public.fee_component_kind_enum IS 'Types of fees that can be charged. flat=investment commitment (not actually a fee), subscription=upfront fee, management=recurring fee, performance=carried interest, spread_markup=spread on investment, bd_fee=broker-dealer fee, finra_fee=regulatory fee, other=miscellaneous';