-- Migration: Add signature specimen columns to investor_members
-- Date: 2024-12-21
-- Purpose: Allow investor members to upload signature specimen images for compliance

-- Add signature specimen columns if they don't exist
DO $$
BEGIN
    -- Add signature_specimen_url column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'investor_members'
        AND column_name = 'signature_specimen_url'
    ) THEN
        ALTER TABLE public.investor_members
        ADD COLUMN signature_specimen_url TEXT;

        COMMENT ON COLUMN public.investor_members.signature_specimen_url
        IS 'URL to the uploaded signature specimen image in storage';
    END IF;

    -- Add signature_specimen_uploaded_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'investor_members'
        AND column_name = 'signature_specimen_uploaded_at'
    ) THEN
        ALTER TABLE public.investor_members
        ADD COLUMN signature_specimen_uploaded_at TIMESTAMPTZ;

        COMMENT ON COLUMN public.investor_members.signature_specimen_uploaded_at
        IS 'Timestamp when the signature specimen was uploaded';
    END IF;
END $$;
