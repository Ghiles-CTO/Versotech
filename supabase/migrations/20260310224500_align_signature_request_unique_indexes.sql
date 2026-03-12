DROP INDEX IF EXISTS public.signature_requests_document_signer_unique_idx;
DROP INDEX IF EXISTS public.signature_requests_workflow_signer_unique_idx;

CREATE UNIQUE INDEX IF NOT EXISTS signature_requests_document_signer_position_unique_idx
  ON public.signature_requests (document_id, signer_role, signature_position)
  WHERE document_id IS NOT NULL
    AND status <> ALL (ARRAY['cancelled'::text, 'expired'::text]);

CREATE UNIQUE INDEX IF NOT EXISTS signature_requests_workflow_signer_position_unique_idx
  ON public.signature_requests (workflow_run_id, signer_role, signature_position)
  WHERE workflow_run_id IS NOT NULL
    AND status <> ALL (ARRAY['cancelled'::text, 'expired'::text]);
