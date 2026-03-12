CREATE UNIQUE INDEX IF NOT EXISTS signature_requests_introducer_agreement_signer_position_unique_idx
  ON public.signature_requests (introducer_agreement_id, signer_role, signature_position)
  WHERE introducer_agreement_id IS NOT NULL
    AND status <> ALL (ARRAY['cancelled'::text, 'expired'::text]);
