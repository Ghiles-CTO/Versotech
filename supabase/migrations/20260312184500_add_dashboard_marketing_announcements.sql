-- Migration: 20260312184500_add_dashboard_marketing_announcements.sql
-- Purpose: Dashboard marketing announcements and investor interest capture

CREATE TABLE IF NOT EXISTS public.dashboard_marketing_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_type text NOT NULL
    CHECK (card_type IN ('opportunity', 'event', 'news')),
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published')),
  title text NOT NULL,
  summary text NOT NULL,
  media_type text NOT NULL
    CHECK (media_type IN ('image', 'video', 'link')),
  image_url text,
  image_storage_path text,
  video_url text,
  video_storage_path text,
  external_url text,
  link_domain text,
  source_published_at timestamptz,
  metadata_json jsonb,
  cta_enabled boolean NOT NULL DEFAULT false,
  cta_label text,
  sort_order integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dashboard_marketing_cards_image_required
    CHECK (media_type <> 'image' OR image_url IS NOT NULL),
  CONSTRAINT dashboard_marketing_cards_video_required
    CHECK (media_type <> 'video' OR (video_url IS NOT NULL AND image_url IS NOT NULL)),
  CONSTRAINT dashboard_marketing_cards_link_required
    CHECK (media_type <> 'link' OR external_url IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS dashboard_marketing_cards_status_sort_idx
  ON public.dashboard_marketing_cards(status, sort_order, created_at DESC);

CREATE INDEX IF NOT EXISTS dashboard_marketing_cards_type_idx
  ON public.dashboard_marketing_cards(card_type, status);

DROP TRIGGER IF EXISTS dashboard_marketing_cards_set_updated_at ON public.dashboard_marketing_cards;
CREATE TRIGGER dashboard_marketing_cards_set_updated_at
  BEFORE UPDATE ON public.dashboard_marketing_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.dashboard_marketing_cards ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.dashboard_marketing_cards IS 'Admin-managed dashboard marketing announcement cards for investors.';
COMMENT ON COLUMN public.dashboard_marketing_cards.media_type IS 'One media mode per card: image, uploaded video, or external link preview.';

CREATE TABLE IF NOT EXISTS public.dashboard_marketing_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES public.dashboard_marketing_cards(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  investor_id uuid NOT NULL REFERENCES public.investors(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dashboard_marketing_leads_unique_user_card UNIQUE (card_id, user_id)
);

CREATE INDEX IF NOT EXISTS dashboard_marketing_leads_card_idx
  ON public.dashboard_marketing_leads(card_id, created_at DESC);

CREATE INDEX IF NOT EXISTS dashboard_marketing_leads_investor_idx
  ON public.dashboard_marketing_leads(investor_id, created_at DESC);

ALTER TABLE public.dashboard_marketing_leads ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.dashboard_marketing_leads IS 'Investor interest submissions captured from dashboard marketing cards.';
