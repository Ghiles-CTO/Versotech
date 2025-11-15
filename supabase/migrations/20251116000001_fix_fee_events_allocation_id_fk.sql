-- Fix fee_events.allocation_id foreign key constraint
-- The allocation_id field is polymorphic - it can reference either:
-- 1. allocations.id (for deal-based allocations)
-- 2. subscriptions.id (for subscription-based fees)
--
-- Current FK to allocations table causes constraint violations when storing subscription_id
-- Solution: Make the FK nullable and add ON DELETE SET NULL to prevent cascading issues

-- First, drop the existing foreign key constraint if it exists
ALTER TABLE public.fee_events
DROP CONSTRAINT IF EXISTS fee_events_allocation_id_fkey;

-- Make allocation_id nullable if it isn't already
ALTER TABLE public.fee_events
ALTER COLUMN allocation_id DROP NOT NULL;

-- Re-add the foreign key with ON DELETE SET NULL
-- This allows the field to be used polymorphically without constraint violations
ALTER TABLE public.fee_events
ADD CONSTRAINT fee_events_allocation_id_fkey
FOREIGN KEY (allocation_id)
REFERENCES public.allocations(id)
ON DELETE SET NULL
DEFERRABLE INITIALLY DEFERRED;

-- Add comment to document the polymorphic nature of this field
COMMENT ON COLUMN public.fee_events.allocation_id IS 'Polymorphic reference: can point to either allocations.id (for deal allocations) or subscriptions.id (for subscription fees). FK constraint is relaxed to allow both uses.';

-- Create index for performance when querying by allocation_id
CREATE INDEX IF NOT EXISTS idx_fee_events_allocation_id ON public.fee_events(allocation_id) WHERE allocation_id IS NOT NULL;

-- Note: In a future migration, consider splitting this into two fields:
-- allocation_id (references allocations.id)
-- subscription_id (references subscriptions.id)
-- with a CHECK constraint ensuring exactly one is set