-- Migration: 20260325111500_add_document_cards_to_dashboard_marketing.sql
-- Purpose: Add investor-authenticated document announcement cards

ALTER TABLE public.dashboard_marketing_cards
  ADD COLUMN IF NOT EXISTS document_storage_path text,
  ADD COLUMN IF NOT EXISTS document_file_name text,
  ADD COLUMN IF NOT EXISTS document_mime_type text,
  ADD COLUMN IF NOT EXISTS document_preview_storage_path text;

ALTER TABLE public.dashboard_marketing_cards
  DROP CONSTRAINT IF EXISTS dashboard_marketing_cards_card_type_check,
  DROP CONSTRAINT IF EXISTS dashboard_marketing_cards_media_type_check,
  DROP CONSTRAINT IF EXISTS dashboard_marketing_cards_document_required;

ALTER TABLE public.dashboard_marketing_cards
  ADD CONSTRAINT dashboard_marketing_cards_card_type_check
    CHECK (card_type IN ('opportunity', 'event', 'news', 'document')),
  ADD CONSTRAINT dashboard_marketing_cards_media_type_check
    CHECK (media_type IN ('image', 'video', 'link', 'document')),
  ADD CONSTRAINT dashboard_marketing_cards_document_required
    CHECK (
      media_type <> 'document' OR (
        document_storage_path IS NOT NULL AND
        document_file_name IS NOT NULL AND
        document_mime_type IS NOT NULL AND
        document_preview_storage_path IS NOT NULL
      )
    );

COMMENT ON COLUMN public.dashboard_marketing_cards.document_storage_path IS
  'Private storage path for uploaded marketing documents.';

COMMENT ON COLUMN public.dashboard_marketing_cards.document_file_name IS
  'Original uploaded filename for document announcement cards.';

COMMENT ON COLUMN public.dashboard_marketing_cards.document_mime_type IS
  'MIME type for document announcement cards.';

COMMENT ON COLUMN public.dashboard_marketing_cards.document_preview_storage_path IS
  'Private storage path for the generated first-page preview image shown on document cards.';
