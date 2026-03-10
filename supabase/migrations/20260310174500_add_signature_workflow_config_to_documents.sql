ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS signature_workflow_config jsonb;

COMMENT ON COLUMN public.documents.signature_workflow_config IS
'Staged signature workflow metadata for document-level release ordering.';
