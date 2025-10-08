-- Fees Management MVP migration
-- Aligns fee-related schema, enums, functions, and RLS with PRD requirements

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Fee plan metadata enhancements
-- ---------------------------------------------------------------------------

ALTER TABLE public.fee_plans
  ADD COLUMN IF NOT EXISTS vehicle_id uuid REFERENCES public.vehicles(id),
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS effective_from date DEFAULT current_date NOT NULL,
  ADD COLUMN IF NOT EXISTS effective_until date,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now() NOT NULL;

UPDATE public.fee_plans
SET updated_at = COALESCE(updated_at, created_at);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_fee_plans_default_per_deal
  ON public.fee_plans (deal_id)
  WHERE is_default = true;

DROP TRIGGER IF EXISTS trg_fee_plans_set_updated_at ON public.fee_plans;
CREATE TRIGGER trg_fee_plans_set_updated_at
  BEFORE UPDATE ON public.fee_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 2. Fee component extensions
-- ---------------------------------------------------------------------------

ALTER TYPE public.fee_calc_method_enum ADD VALUE IF NOT EXISTS 'percent_of_commitment';
ALTER TYPE public.fee_calc_method_enum ADD VALUE IF NOT EXISTS 'percent_of_nav';
ALTER TYPE public.fee_calc_method_enum ADD VALUE IF NOT EXISTS 'fixed_amount';

ALTER TYPE public.fee_frequency_enum ADD VALUE IF NOT EXISTS 'on_event';

ALTER TABLE public.fee_components
  ADD COLUMN IF NOT EXISTS base_calculation text
    CHECK (base_calculation IS NULL OR base_calculation IN ('commitment','nav','profit','units','fixed')),
  ADD COLUMN IF NOT EXISTS has_catchup boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS catchup_rate_bps integer,
  ADD COLUMN IF NOT EXISTS has_high_water_mark boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now() NOT NULL,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now() NOT NULL;

UPDATE public.fee_components
SET created_at = COALESCE(created_at, now()),
    updated_at = COALESCE(updated_at, now()),
    has_high_water_mark = COALESCE(has_high_water_mark, high_watermark),
    has_catchup = COALESCE(has_catchup, false);

DROP TRIGGER IF EXISTS trg_fee_components_set_updated_at ON public.fee_components;
CREATE TRIGGER trg_fee_components_set_updated_at
  BEFORE UPDATE ON public.fee_components
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Preserve legacy boolean if it exists
ALTER TABLE public.fee_components
  DROP COLUMN IF EXISTS high_watermark;

-- ---------------------------------------------------------------------------
-- 3. Investor fee terms workflow
-- ---------------------------------------------------------------------------

ALTER TABLE public.investor_terms
  ADD COLUMN IF NOT EXISTS vehicle_id uuid REFERENCES public.vehicles(id),
  ADD COLUMN IF NOT EXISTS base_fee_plan_id uuid REFERENCES public.fee_plans(id),
  ADD COLUMN IF NOT EXISTS justification text,
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS effective_from date DEFAULT current_date NOT NULL,
  ADD COLUMN IF NOT EXISTS effective_until date,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now() NOT NULL;

UPDATE public.investor_terms
SET base_fee_plan_id = COALESCE(base_fee_plan_id, selected_fee_plan_id),
    updated_at = COALESCE(updated_at, created_at),
    justification = COALESCE(justification, 'Imported from legacy data');

ALTER TABLE public.investor_terms
  DROP CONSTRAINT IF EXISTS investor_terms_status_check;

ALTER TABLE public.investor_terms
  ADD CONSTRAINT investor_terms_status_check
  CHECK (status IN ('pending','active','expired','superseded'));

CREATE UNIQUE INDEX IF NOT EXISTS uniq_investor_terms_effective
  ON public.investor_terms (investor_id, deal_id, effective_from)
  WHERE status IN ('pending','active');

DROP TRIGGER IF EXISTS trg_investor_terms_set_updated_at ON public.investor_terms;
CREATE TRIGGER trg_investor_terms_set_updated_at
  BEFORE UPDATE ON public.investor_terms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 4. Fee events enrichment
-- ---------------------------------------------------------------------------

ALTER TYPE public.fee_event_status_enum ADD VALUE IF NOT EXISTS 'paid';
ALTER TYPE public.fee_event_status_enum ADD VALUE IF NOT EXISTS 'waived';
ALTER TYPE public.fee_event_status_enum ADD VALUE IF NOT EXISTS 'disputed';
ALTER TYPE public.fee_event_status_enum ADD VALUE IF NOT EXISTS 'cancelled';

ALTER TABLE public.fee_events
  ADD COLUMN IF NOT EXISTS fee_type public.fee_component_kind_enum,
  ADD COLUMN IF NOT EXISTS allocation_id uuid REFERENCES public.allocations(id),
  ADD COLUMN IF NOT EXISTS rate_bps integer,
  ADD COLUMN IF NOT EXISTS invoice_id uuid REFERENCES public.invoices(id),
  ADD COLUMN IF NOT EXISTS payment_id uuid REFERENCES public.payments(id),
  ADD COLUMN IF NOT EXISTS processed_at timestamptz,
  ADD COLUMN IF NOT EXISTS notes text;

ALTER TABLE public.fee_events
  ADD COLUMN IF NOT EXISTS period_start_date date;

ALTER TABLE public.fee_events
  ADD COLUMN IF NOT EXISTS period_end_date date;

UPDATE public.fee_events
SET period_start_date = COALESCE(period_start_date, period_start);

UPDATE public.fee_events
SET period_end_date = COALESCE(period_end_date, period_end);

ALTER TABLE public.fee_events
  DROP COLUMN IF EXISTS period_start;

ALTER TABLE public.fee_events
  DROP COLUMN IF EXISTS period_end;

CREATE INDEX IF NOT EXISTS idx_fee_events_investor_status_date
  ON public.fee_events (investor_id, status, event_date DESC);

CREATE INDEX IF NOT EXISTS idx_fee_events_fee_type_date
  ON public.fee_events (fee_type, event_date DESC);

-- ---------------------------------------------------------------------------
-- 5. Invoice support for accrual tracking
-- ---------------------------------------------------------------------------

ALTER TYPE public.invoice_status_enum RENAME VALUE 'partial' TO 'partially_paid';
ALTER TYPE public.invoice_status_enum ADD VALUE IF NOT EXISTS 'overdue';
ALTER TYPE public.invoice_status_enum ADD VALUE IF NOT EXISTS 'disputed';

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS paid_amount numeric(18,2) DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id);

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS balance_due numeric(18,2)
  GENERATED ALWAYS AS (GREATEST(total - paid_amount, 0)) STORED;

-- ---------------------------------------------------------------------------
-- 6. Utility functions for fees module
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.calculate_subscription_fee(
  p_commitment_amount numeric,
  p_rate_bps integer
)
RETURNS numeric
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN round(p_commitment_amount * (p_rate_bps::numeric / 10000), 2);
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_management_fee(
  p_base_amount numeric,
  p_rate_bps integer,
  p_period_days integer
)
RETURNS numeric
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN round(p_base_amount * (p_rate_bps::numeric / 10000) * (p_period_days::numeric / 365), 2);
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_performance_fee(
  p_contributed_capital numeric,
  p_exit_proceeds numeric,
  p_carry_rate_bps integer,
  p_hurdle_rate_bps integer,
  p_years_held numeric
)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  v_profit numeric;
  v_hurdle_return numeric;
  v_profit_above_hurdle numeric;
BEGIN
  v_profit := p_exit_proceeds - p_contributed_capital;
  IF v_profit <= 0 THEN
    RETURN 0;
  END IF;

  v_hurdle_return := p_contributed_capital * (p_hurdle_rate_bps::numeric / 10000) * p_years_held;
  v_profit_above_hurdle := v_profit - v_hurdle_return;

  IF v_profit_above_hurdle <= 0 THEN
    RETURN 0;
  END IF;

  RETURN round(v_profit_above_hurdle * (p_carry_rate_bps::numeric / 10000), 2);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_applicable_fee_plan(
  p_investor_id uuid,
  p_deal_id uuid,
  p_as_of_date date DEFAULT current_date
)
RETURNS TABLE (
  fee_plan_id uuid,
  fee_plan_name text,
  components jsonb,
  overrides jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH investor_terms AS (
    SELECT
      it.base_fee_plan_id,
      it.overrides
    FROM public.investor_terms it
    WHERE it.investor_id = p_investor_id
      AND it.deal_id = p_deal_id
      AND it.status = 'active'
      AND it.effective_from <= p_as_of_date
      AND (it.effective_until IS NULL OR it.effective_until >= p_as_of_date)
    ORDER BY it.effective_from DESC
    LIMIT 1
  ),
  default_plan AS (
    SELECT
      fp.id AS fee_plan_id,
      fp.name AS fee_plan_name,
      jsonb_agg(
        jsonb_build_object(
          'id', fc.id,
          'kind', fc.kind,
          'rate_bps', fc.rate_bps,
          'calc_method', fc.calc_method,
          'frequency', fc.frequency,
          'base_calculation', fc.base_calculation,
          'hurdle_rate_bps', fc.hurdle_rate_bps
        ) ORDER BY fc.kind
      ) AS components
    FROM public.fee_plans fp
    JOIN public.fee_components fc ON fc.fee_plan_id = fp.id
    WHERE fp.deal_id = p_deal_id
      AND fp.is_default = true
      AND fp.is_active = true
    GROUP BY fp.id, fp.name
  )
  SELECT
    COALESCE(it.base_fee_plan_id, dp.fee_plan_id) AS fee_plan_id,
    dp.fee_plan_name,
    dp.components,
    COALESCE(it.overrides, '{}'::jsonb) AS overrides
  FROM default_plan dp
  LEFT JOIN investor_terms it ON true;
END;
$$;

CREATE OR REPLACE FUNCTION public.accrue_quarterly_management_fees(
  p_deal_id uuid,
  p_quarter_end_date date
)
RETURNS TABLE (
  investor_id uuid,
  fee_amount numeric,
  fee_event_id uuid
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_quarter_start date;
  v_days_in_quarter integer;
  v_allocation record;
  v_fee_plan record;
  v_component record;
  v_rate integer;
  v_base numeric;
  v_fee numeric;
  v_fee_event_id uuid;
BEGIN
  v_quarter_start := date_trunc('quarter', p_quarter_end_date)::date;
  v_days_in_quarter := (p_quarter_end_date - v_quarter_start) + 1;

  FOR v_allocation IN
    SELECT a.investor_id, a.units, a.status
    FROM public.allocations a
    WHERE a.deal_id = p_deal_id
      AND a.status IN ('approved','settled')
  LOOP
    SELECT * INTO v_fee_plan
    FROM public.get_applicable_fee_plan(v_allocation.investor_id, p_deal_id, p_quarter_end_date)
    LIMIT 1;

    IF FOUND THEN
      SELECT * INTO v_component
      FROM jsonb_to_recordset(v_fee_plan.components) AS x(
        id uuid,
        kind public.fee_component_kind_enum,
        rate_bps integer,
        calc_method public.fee_calc_method_enum,
        frequency public.fee_frequency_enum,
        base_calculation text
      )
      WHERE kind = 'management'
      LIMIT 1;

      IF FOUND THEN
        v_rate := COALESCE((v_fee_plan.overrides->>'management_rate_bps')::integer, v_component.rate_bps);
        v_base := 0;

        IF v_component.base_calculation = 'commitment' OR v_component.calc_method = 'percent_of_commitment' THEN
          SELECT COALESCE(dc.requested_amount, 0)
          INTO v_base
          FROM public.deal_commitments dc
          WHERE dc.deal_id = p_deal_id
            AND dc.investor_id = v_allocation.investor_id
          LIMIT 1;
        ELSE
          SELECT COALESCE(sum(pos.units * pos.last_nav), 0)
          INTO v_base
          FROM public.positions pos
          WHERE pos.vehicle_id = (SELECT deal.vehicle_id FROM public.deals deal WHERE deal.id = p_deal_id)
            AND pos.investor_id = v_allocation.investor_id;
        END IF;

        v_fee := public.calculate_management_fee(v_base, v_rate, v_days_in_quarter);

        INSERT INTO public.fee_events (
          deal_id,
          investor_id,
          fee_component_id,
          fee_type,
          event_date,
          period_start_date,
          period_end_date,
          base_amount,
          rate_bps,
          computed_amount,
          status
        )
        VALUES (
          p_deal_id,
          v_allocation.investor_id,
          v_component.id,
          'management',
          p_quarter_end_date,
          v_quarter_start,
          p_quarter_end_date,
          v_base,
          v_rate,
          v_fee,
          'accrued'
        )
        RETURNING id INTO v_fee_event_id;

        RETURN QUERY SELECT v_allocation.investor_id, v_fee, v_fee_event_id;
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- ---------------------------------------------------------------------------
-- 7. RLS policies for staff access (idempotent)
-- ---------------------------------------------------------------------------

ALTER TABLE public.fee_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'fee_plans' AND policyname = 'fee_plans_staff_read'
  ) THEN
    EXECUTE 'CREATE POLICY fee_plans_staff_read ON public.fee_plans
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN (''staff_admin'',''staff_ops'',''staff_rm'')
        )
      )';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'fee_plans' AND policyname = 'fee_plans_admin_write'
  ) THEN
    EXECUTE 'CREATE POLICY fee_plans_admin_write ON public.fee_plans
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = ''staff_admin''
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = ''staff_admin''
        )
      )';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'fee_components' AND policyname = 'fee_components_staff_read'
  ) THEN
    EXECUTE 'CREATE POLICY fee_components_staff_read ON public.fee_components
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN (''staff_admin'',''staff_ops'',''staff_rm'')
        )
      )';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'fee_components' AND policyname = 'fee_components_admin_write'
  ) THEN
    EXECUTE 'CREATE POLICY fee_components_admin_write ON public.fee_components
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = ''staff_admin''
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = ''staff_admin''
        )
      )';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'investor_terms' AND policyname = 'investor_terms_staff_access'
  ) THEN
    EXECUTE 'CREATE POLICY investor_terms_staff_access ON public.investor_terms
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN (''staff_admin'',''staff_ops'',''staff_rm'')
        )
      )';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'investor_terms' AND policyname = 'investor_terms_admin_write'
  ) THEN
    EXECUTE 'CREATE POLICY investor_terms_admin_write ON public.investor_terms
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = ''staff_admin''
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = ''staff_admin''
        )
      )';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'fee_events' AND policyname = 'fee_events_staff_read'
  ) THEN
    EXECUTE 'CREATE POLICY fee_events_staff_read ON public.fee_events
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN (''staff_admin'',''staff_ops'',''staff_rm'')
        )
      )';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'fee_events' AND policyname = 'fee_events_admin_write'
  ) THEN
    EXECUTE 'CREATE POLICY fee_events_admin_write ON public.fee_events
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = ''staff_admin''
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = ''staff_admin''
        )
      )';
  END IF;
END;
$$;

COMMIT;

