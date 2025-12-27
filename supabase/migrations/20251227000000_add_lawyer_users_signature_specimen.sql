-- Migration: Add signature specimen columns to lawyer_users
-- Date: 2025-12-27
-- Purpose: Allow lawyer users to upload signature specimen images for compliance

DO $$
BEGIN
    -- Add signature_specimen_url column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'lawyer_users'
        AND column_name = 'signature_specimen_url'
    ) THEN
        ALTER TABLE public.lawyer_users
        ADD COLUMN signature_specimen_url TEXT;

        COMMENT ON COLUMN public.lawyer_users.signature_specimen_url
        IS 'URL to the uploaded signature specimen image in storage';
    END IF;

    -- Add signature_specimen_uploaded_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'lawyer_users'
        AND column_name = 'signature_specimen_uploaded_at'
    ) THEN
        ALTER TABLE public.lawyer_users
        ADD COLUMN signature_specimen_uploaded_at TIMESTAMPTZ;

        COMMENT ON COLUMN public.lawyer_users.signature_specimen_uploaded_at
        IS 'Timestamp when the signature specimen was uploaded';
    END IF;
END $$;
