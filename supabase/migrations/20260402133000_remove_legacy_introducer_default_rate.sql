-- Remove legacy account-level introducer commission defaults.
-- Introducer agreements are now generated per deal from fee plans.

DROP TRIGGER IF EXISTS trigger_auto_create_introducer_commission ON public.subscriptions;

DROP FUNCTION IF EXISTS public.auto_create_introducer_commission();

ALTER TABLE public.introducers
  DROP COLUMN IF EXISTS agreement_doc_id,
  DROP COLUMN IF EXISTS agreement_expiry_date,
  DROP COLUMN IF EXISTS default_commission_bps;
