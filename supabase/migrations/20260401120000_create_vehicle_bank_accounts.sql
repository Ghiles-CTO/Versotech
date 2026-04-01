-- Create canonical vehicle-level bank accounts for subscription packs and escrow views.

CREATE TABLE IF NOT EXISTS public.vehicle_bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  lawyer_id uuid REFERENCES public.lawyers(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'archived')),
  bank_name text,
  bank_address text,
  holder_name text,
  law_firm_address text,
  description text,
  iban text,
  bic text,
  currency text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  published_at timestamptz,
  published_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vehicle_bank_accounts_active_requires_published CHECK (
    status <> 'active' OR published_at IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS vehicle_bank_accounts_vehicle_idx
  ON public.vehicle_bank_accounts(vehicle_id, created_at DESC);

CREATE INDEX IF NOT EXISTS vehicle_bank_accounts_status_idx
  ON public.vehicle_bank_accounts(status, vehicle_id);

CREATE UNIQUE INDEX IF NOT EXISTS vehicle_bank_accounts_one_active_per_vehicle
  ON public.vehicle_bank_accounts(vehicle_id)
  WHERE status = 'active';

CREATE UNIQUE INDEX IF NOT EXISTS vehicle_bank_accounts_one_draft_per_vehicle
  ON public.vehicle_bank_accounts(vehicle_id)
  WHERE status = 'draft';

DROP TRIGGER IF EXISTS vehicle_bank_accounts_set_updated_at ON public.vehicle_bank_accounts;
CREATE TRIGGER vehicle_bank_accounts_set_updated_at
  BEFORE UPDATE ON public.vehicle_bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.vehicle_bank_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vehicle_bank_accounts_internal_read ON public.vehicle_bank_accounts;
CREATE POLICY vehicle_bank_accounts_internal_read
  ON public.vehicle_bank_accounts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')
    )
    OR EXISTS (
      SELECT 1
      FROM public.ceo_users cu
      WHERE cu.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS vehicle_bank_accounts_manage ON public.vehicle_bank_accounts;
CREATE POLICY vehicle_bank_accounts_manage
  ON public.vehicle_bank_accounts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('staff_admin', 'staff_ops', 'ceo')
    )
    OR EXISTS (
      SELECT 1
      FROM public.ceo_users cu
      WHERE cu.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('staff_admin', 'staff_ops', 'ceo')
    )
    OR EXISTS (
      SELECT 1
      FROM public.ceo_users cu
      WHERE cu.user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.vehicle_bank_accounts IS 'Vehicle-level wire instructions used for subscription packs, dispatch validation, and escrow views.';
COMMENT ON COLUMN public.vehicle_bank_accounts.lawyer_id IS 'Optional lawyer used as the source of default holder/address data; text snapshots are stored separately.';
COMMENT ON COLUMN public.vehicle_bank_accounts.status IS 'Draft rows are internal only; active rows are the canonical bank account shown to investors and used in generated packs.';

INSERT INTO public.vehicle_bank_accounts (
  vehicle_id,
  lawyer_id,
  status,
  bank_name,
  bank_address,
  holder_name,
  law_firm_address,
  description,
  iban,
  bic,
  currency,
  created_by,
  updated_by,
  published_at,
  published_by,
  created_at,
  updated_at
)
SELECT
  src.vehicle_id,
  src.lawyer_id,
  'active',
  src.bank_name,
  src.bank_address,
  src.holder_name,
  src.law_firm_address,
  src.description,
  src.iban,
  src.bic,
  src.currency,
  src.created_by,
  src.created_by,
  COALESCE(src.published_at, now()),
  src.created_by,
  COALESCE(src.created_at, now()),
  now()
FROM (
  SELECT DISTINCT ON (d.vehicle_id)
    d.vehicle_id,
    v.lawyer_id,
    NULLIF(trim(dfs.wire_bank_name), '') AS bank_name,
    NULLIF(trim(dfs.wire_bank_address), '') AS bank_address,
    NULLIF(trim(dfs.wire_account_holder), '') AS holder_name,
    NULLIF(trim(dfs.wire_law_firm_address), '') AS law_firm_address,
    COALESCE(
      NULLIF(
        trim(
          replace(
            replace(COALESCE(dfs.wire_description_format, ''), '{series}', COALESCE(v.series_number, '')),
            '{short_title}',
            COALESCE(NULLIF(v.series_short_title, ''), NULLIF(v.investment_name, ''), '')
          )
        ),
        ''
      ),
      'Client Account on behalf of ' || v.name
    ) AS description,
    NULLIF(trim(dfs.wire_iban), '') AS iban,
    NULLIF(trim(dfs.wire_bic), '') AS bic,
    COALESCE(NULLIF(trim(v.currency), ''), NULLIF(trim(d.currency), ''), 'USD') AS currency,
    dfs.created_by,
    dfs.published_at,
    dfs.created_at
  FROM public.deal_fee_structures dfs
  JOIN public.deals d
    ON d.id = dfs.deal_id
  JOIN public.vehicles v
    ON v.id = d.vehicle_id
  WHERE d.vehicle_id IS NOT NULL
    AND (
      COALESCE(trim(dfs.wire_bank_name), '') <> ''
      OR COALESCE(trim(dfs.wire_bank_address), '') <> ''
      OR COALESCE(trim(dfs.wire_account_holder), '') <> ''
      OR COALESCE(trim(dfs.wire_iban), '') <> ''
      OR COALESCE(trim(dfs.wire_bic), '') <> ''
    )
  ORDER BY d.vehicle_id, dfs.published_at DESC NULLS LAST, dfs.created_at DESC NULLS LAST
) AS src
WHERE NOT EXISTS (
  SELECT 1
  FROM public.vehicle_bank_accounts existing
  WHERE existing.vehicle_id = src.vehicle_id
);
