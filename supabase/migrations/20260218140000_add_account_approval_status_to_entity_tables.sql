-- Ensure account approval status exists across all KYC-enabled entity tables.
-- This keeps schema parity for environments created from migrations only.

ALTER TABLE public.investors
  ADD COLUMN IF NOT EXISTS account_approval_status text DEFAULT 'pending_onboarding';

ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS account_approval_status text DEFAULT 'pending_onboarding';

ALTER TABLE public.introducers
  ADD COLUMN IF NOT EXISTS account_approval_status text DEFAULT 'pending_onboarding';

ALTER TABLE public.lawyers
  ADD COLUMN IF NOT EXISTS account_approval_status text DEFAULT 'pending_onboarding';

ALTER TABLE public.commercial_partners
  ADD COLUMN IF NOT EXISTS account_approval_status text DEFAULT 'pending_onboarding';

ALTER TABLE public.arranger_entities
  ADD COLUMN IF NOT EXISTS account_approval_status text DEFAULT 'pending_onboarding';
