-- Migration: 20260310153000_create_homepage_content_backend.sql
-- Purpose: Create backend data model for the investor Home page content system

CREATE TABLE IF NOT EXISTS public.home_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL
    CHECK (kind IN ('hero', 'opportunity_teaser', 'event', 'report', 'verso_update', 'news_article')),
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  title text NOT NULL,
  eyebrow text,
  summary text NOT NULL,
  body text,
  image_url text,
  link_url text,
  cta_label text,
  cta_action text NOT NULL DEFAULT 'none'
    CHECK (cta_action IN ('open_link', 'interest_capture', 'go_to_dashboard', 'none')),
  source_url text,
  source_name text,
  source_domain text,
  source_published_at timestamptz,
  metadata_json jsonb,
  linked_deal_id uuid REFERENCES public.deals(id) ON DELETE SET NULL,
  featured_slot smallint
    CHECK (featured_slot IS NULL OR featured_slot BETWEEN 1 AND 3),
  sort_order integer NOT NULL DEFAULT 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_pinned boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT home_items_valid_schedule CHECK (
    starts_at IS NULL OR ends_at IS NULL OR starts_at < ends_at
  )
);

CREATE INDEX IF NOT EXISTS home_items_status_kind_idx
  ON public.home_items(status, kind);

CREATE INDEX IF NOT EXISTS home_items_schedule_idx
  ON public.home_items(starts_at, ends_at);

CREATE INDEX IF NOT EXISTS home_items_featured_slot_idx
  ON public.home_items(featured_slot)
  WHERE featured_slot IS NOT NULL;

CREATE INDEX IF NOT EXISTS home_items_source_url_idx
  ON public.home_items(source_url)
  WHERE source_url IS NOT NULL;

DROP TRIGGER IF EXISTS home_items_set_updated_at ON public.home_items;
CREATE TRIGGER home_items_set_updated_at
  BEFORE UPDATE ON public.home_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.home_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS home_items_staff_all ON public.home_items;
CREATE POLICY home_items_staff_all
  ON public.home_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.role::text LIKE 'staff_%' OR p.role IN ('ceo', 'staff_admin'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.role::text LIKE 'staff_%' OR p.role IN ('ceo', 'staff_admin'))
    )
  );

DROP POLICY IF EXISTS home_items_published_read_authenticated ON public.home_items;
CREATE POLICY home_items_published_read_authenticated
  ON public.home_items
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND status = 'published'
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at > now())
  );

COMMENT ON TABLE public.home_items IS 'Admin-managed content items for the investor Home page.';
COMMENT ON COLUMN public.home_items.kind IS 'Home page content type such as hero, teaser, event, report, update, or news article.';
COMMENT ON COLUMN public.home_items.featured_slot IS 'Pinned featured slot for top-of-page cards. Null means regular feed placement.';
COMMENT ON COLUMN public.home_items.metadata_json IS 'Stored metadata snapshot for URL-ingested news/article items.';

CREATE TABLE IF NOT EXISTS public.home_interest_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  home_item_id uuid NOT NULL REFERENCES public.home_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  investor_id uuid NOT NULL REFERENCES public.investors(id) ON DELETE CASCADE,
  note text,
  admin_note text,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'reviewed', 'contacted', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT home_interest_submissions_unique_user_item UNIQUE (home_item_id, user_id)
);

CREATE INDEX IF NOT EXISTS home_interest_submissions_status_idx
  ON public.home_interest_submissions(status, created_at DESC);

CREATE INDEX IF NOT EXISTS home_interest_submissions_item_idx
  ON public.home_interest_submissions(home_item_id, created_at DESC);

CREATE INDEX IF NOT EXISTS home_interest_submissions_investor_idx
  ON public.home_interest_submissions(investor_id, created_at DESC);

DROP TRIGGER IF EXISTS home_interest_submissions_set_updated_at ON public.home_interest_submissions;
CREATE TRIGGER home_interest_submissions_set_updated_at
  BEFORE UPDATE ON public.home_interest_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.home_interest_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS home_interest_submissions_staff_all ON public.home_interest_submissions;
CREATE POLICY home_interest_submissions_staff_all
  ON public.home_interest_submissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.role::text LIKE 'staff_%' OR p.role IN ('ceo', 'staff_admin'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.role::text LIKE 'staff_%' OR p.role IN ('ceo', 'staff_admin'))
    )
  );

DROP POLICY IF EXISTS home_interest_submissions_investor_select ON public.home_interest_submissions;
CREATE POLICY home_interest_submissions_investor_select
  ON public.home_interest_submissions
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS home_interest_submissions_investor_insert ON public.home_interest_submissions;
CREATE POLICY home_interest_submissions_investor_insert
  ON public.home_interest_submissions
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.investor_users iu
      WHERE iu.user_id = auth.uid()
        AND iu.investor_id = home_interest_submissions.investor_id
    )
  );

COMMENT ON TABLE public.home_interest_submissions IS 'Captured investor interest from Home page teaser and event cards.';
COMMENT ON COLUMN public.home_interest_submissions.admin_note IS 'Internal staff follow-up note for lead handling.';
