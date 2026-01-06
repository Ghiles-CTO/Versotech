-- Migration: 20260106000004_create_notice_contacts.sql
-- Purpose: Create table for optional notice contacts for entities
-- These are contacts that should receive formal notices (regulatory, legal, etc.)

CREATE TABLE IF NOT EXISTS public.entity_notice_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Polymorphic entity references (exactly one should be set)
  investor_id uuid REFERENCES public.investors(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES public.partners(id) ON DELETE CASCADE,
  introducer_id uuid REFERENCES public.introducers(id) ON DELETE CASCADE,
  lawyer_id uuid REFERENCES public.lawyers(id) ON DELETE CASCADE,
  commercial_partner_id uuid REFERENCES public.commercial_partners(id) ON DELETE CASCADE,
  arranger_entity_id uuid REFERENCES public.arranger_entities(id) ON DELETE CASCADE,

  -- Contact type (determines what kind of notices they receive)
  contact_type text NOT NULL DEFAULT 'primary'
    CHECK (contact_type IN ('primary', 'legal', 'tax', 'compliance', 'operations', 'billing')),

  -- Contact details
  contact_name text NOT NULL,
  contact_title text,
  email text,
  phone text,

  -- Mailing address (for physical notices)
  address_line_1 text,
  address_line_2 text,
  city text,
  state_province text,
  postal_code text,
  country text,

  -- Preferences
  preferred_method text DEFAULT 'email'
    CHECK (preferred_method IN ('email', 'mail', 'both')),
  receive_copies boolean DEFAULT true,
  is_active boolean DEFAULT true,

  -- Audit fields
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id),
  updated_at timestamptz DEFAULT now(),

  -- Ensure exactly one entity reference is set
  CONSTRAINT notice_contact_single_entity CHECK (
    (CASE WHEN investor_id IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN partner_id IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN introducer_id IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN lawyer_id IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN commercial_partner_id IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN arranger_entity_id IS NOT NULL THEN 1 ELSE 0 END) = 1
  )
);

-- Create indexes for each entity type (partial indexes for efficiency)
CREATE INDEX IF NOT EXISTS entity_notice_contacts_investor_idx
  ON public.entity_notice_contacts(investor_id) WHERE investor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS entity_notice_contacts_partner_idx
  ON public.entity_notice_contacts(partner_id) WHERE partner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS entity_notice_contacts_introducer_idx
  ON public.entity_notice_contacts(introducer_id) WHERE introducer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS entity_notice_contacts_lawyer_idx
  ON public.entity_notice_contacts(lawyer_id) WHERE lawyer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS entity_notice_contacts_cp_idx
  ON public.entity_notice_contacts(commercial_partner_id) WHERE commercial_partner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS entity_notice_contacts_arranger_idx
  ON public.entity_notice_contacts(arranger_entity_id) WHERE arranger_entity_id IS NOT NULL;

-- Index for active contacts
CREATE INDEX IF NOT EXISTS entity_notice_contacts_active_idx
  ON public.entity_notice_contacts(is_active) WHERE is_active = true;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.entity_notice_contacts_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS entity_notice_contacts_set_updated_at ON public.entity_notice_contacts;
CREATE TRIGGER entity_notice_contacts_set_updated_at
  BEFORE UPDATE ON public.entity_notice_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.entity_notice_contacts_set_updated_at();

-- Enable RLS
ALTER TABLE public.entity_notice_contacts ENABLE ROW LEVEL SECURITY;

-- Staff can manage all notice contacts
CREATE POLICY entity_notice_contacts_staff_all
  ON public.entity_notice_contacts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role::text LIKE 'staff_%'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role::text LIKE 'staff_%'
    )
  );

-- Investors can manage their own notice contacts
CREATE POLICY entity_notice_contacts_investor_all
  ON public.entity_notice_contacts
  FOR ALL
  USING (
    investor_id IN (
      SELECT investor_id FROM public.investor_users WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    investor_id IN (
      SELECT investor_id FROM public.investor_users WHERE user_id = auth.uid()
    )
  );

-- Partners can manage their own notice contacts
CREATE POLICY entity_notice_contacts_partner_all
  ON public.entity_notice_contacts
  FOR ALL
  USING (
    partner_id IN (
      SELECT partner_id FROM public.partner_users WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    partner_id IN (
      SELECT partner_id FROM public.partner_users WHERE user_id = auth.uid()
    )
  );

-- Introducers can manage their own notice contacts
CREATE POLICY entity_notice_contacts_introducer_all
  ON public.entity_notice_contacts
  FOR ALL
  USING (
    introducer_id IN (
      SELECT introducer_id FROM public.introducer_users WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    introducer_id IN (
      SELECT introducer_id FROM public.introducer_users WHERE user_id = auth.uid()
    )
  );

-- Lawyers can manage their own notice contacts
CREATE POLICY entity_notice_contacts_lawyer_all
  ON public.entity_notice_contacts
  FOR ALL
  USING (
    lawyer_id IN (
      SELECT lawyer_id FROM public.lawyer_users WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    lawyer_id IN (
      SELECT lawyer_id FROM public.lawyer_users WHERE user_id = auth.uid()
    )
  );

-- Add comments
COMMENT ON TABLE public.entity_notice_contacts IS 'Optional contacts for receiving formal notices for entities';
COMMENT ON COLUMN public.entity_notice_contacts.contact_type IS 'Type of contact: primary, legal, tax, compliance, operations, billing';
COMMENT ON COLUMN public.entity_notice_contacts.preferred_method IS 'Preferred method of receiving notices: email, mail, or both';
