-- Add deal_id to signature_requests so NDA/subscription signatures can be scoped to a deal.
ALTER TABLE public.signature_requests
  ADD COLUMN IF NOT EXISTS deal_id uuid REFERENCES public.deals(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_signature_requests_deal_id
  ON public.signature_requests(deal_id)
  WHERE deal_id IS NOT NULL;
