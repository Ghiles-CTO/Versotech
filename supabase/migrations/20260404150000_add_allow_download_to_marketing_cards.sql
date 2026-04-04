-- Migration: 20260404150000_add_allow_download_to_marketing_cards.sql
-- Purpose: Allow CEO to control whether document cards are downloadable by investors

ALTER TABLE public.dashboard_marketing_cards
  ADD COLUMN IF NOT EXISTS allow_download boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.dashboard_marketing_cards.allow_download IS
  'When false, investors can only preview the document — download is hidden and blocked.';
