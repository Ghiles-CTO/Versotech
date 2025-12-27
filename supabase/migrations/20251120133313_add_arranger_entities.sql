-- Create arranger entities table for regulated partners (e.g., VERSO MANAGEMENT LTD)
CREATE TABLE IF NOT EXISTS public.arranger_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Information
  legal_name TEXT NOT NULL,
  registration_number TEXT,
  tax_id TEXT,

  -- Regulatory Information
  regulator TEXT, -- 'FCA', 'SEC', 'FINMA', etc.
  license_number TEXT, -- FCA FRN or SEC CRD number
  license_type TEXT, -- 'Investment Advisor', 'Broker-Dealer', 'Fund Manager'
  license_expiry_date DATE,

  -- Contact Information
  email TEXT,
  phone TEXT,
  address TEXT,

  -- KYC Status (follows same pattern as investors table)
  kyc_status TEXT DEFAULT 'draft', -- draft/approved/expired/rejected
  kyc_approved_at TIMESTAMPTZ,
  kyc_approved_by UUID REFERENCES public.profiles(id),
  kyc_expires_at TIMESTAMPTZ,
  kyc_notes TEXT,

  -- Flexible metadata for beneficial owners, personnel, insurance, etc.
  metadata JSONB DEFAULT '{}',

  -- Status
  status TEXT DEFAULT 'active', -- active/inactive/suspended

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS arranger_entities_status_idx ON public.arranger_entities(status);
CREATE INDEX IF NOT EXISTS arranger_entities_kyc_status_idx ON public.arranger_entities(kyc_status);
CREATE INDEX IF NOT EXISTS arranger_entities_legal_name_idx ON public.arranger_entities(legal_name);
CREATE INDEX IF NOT EXISTS arranger_entities_created_at_idx ON public.arranger_entities(created_at DESC);

-- Add RLS policies (staff only access)
ALTER TABLE public.arranger_entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all arrangers"
  ON public.arranger_entities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role LIKE 'staff_%'
    )
  );

CREATE POLICY "Staff admin can insert arrangers"
  ON public.arranger_entities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'staff_admin'
    )
  );

CREATE POLICY "Staff admin can update arrangers"
  ON public.arranger_entities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'staff_admin'
    )
  );

CREATE POLICY "Staff admin can delete arrangers"
  ON public.arranger_entities FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'staff_admin'
    )
  );

-- Add foreign keys to deals table
ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS arranger_entity_id UUID REFERENCES public.arranger_entities(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS deals_arranger_entity_id_idx ON public.deals(arranger_entity_id);

COMMENT ON COLUMN public.deals.arranger_entity_id IS 'Regulated entity that arranged/structured this deal';

-- Add foreign keys to vehicles table
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS arranger_entity_id UUID REFERENCES public.arranger_entities(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS vehicles_arranger_entity_id_idx ON public.vehicles(arranger_entity_id);

COMMENT ON COLUMN public.vehicles.arranger_entity_id IS 'Regulated entity that manages this vehicle/fund';

-- Add foreign keys to documents table
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS arranger_entity_id UUID REFERENCES public.arranger_entities(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS documents_arranger_entity_id_idx ON public.documents(arranger_entity_id);

COMMENT ON COLUMN public.documents.arranger_entity_id IS 'Documents uploaded for arranger entity (KYC, licenses, certificates)';

-- Seed VERSO MANAGEMENT LTD as the first arranger entity
INSERT INTO public.arranger_entities (
  legal_name,
  regulator,
  license_number,
  license_type,
  email,
  phone,
  kyc_status,
  kyc_approved_at,
  status,
  metadata
) VALUES (
  'VERSO MANAGEMENT LTD',
  'FCA',
  'FRN123456',
  'Investment Advisor',
  'compliance@versomanagement.com',
  '+44 20 1234 5678',
  'approved',
  NOW(),
  'active',
  jsonb_build_object(
    'is_primary', true,
    'beneficial_owners', jsonb_build_array(),
    'key_personnel', jsonb_build_array()
  )
) ON CONFLICT DO NOTHING;

-- Add table comments
COMMENT ON TABLE public.arranger_entities IS 'Regulated financial entities (arrangers/advisors) that structure deals and manage vehicles';
COMMENT ON COLUMN public.arranger_entities.metadata IS 'Flexible JSONB field for beneficial owners, key personnel, insurance details, etc.';
