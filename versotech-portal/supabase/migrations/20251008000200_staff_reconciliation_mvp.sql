-- Bank Reconciliation MVP migration
-- Adds import batches, suggested matches, reconciliation helpers, and RLS policies

BEGIN;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ---------------------------------------------------------------------------
-- Import batches for bank statement uploads
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id text NOT NULL,
  file_name text NOT NULL,
  transaction_count int NOT NULL,
  imported_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Enhance bank_transactions data model
-- ---------------------------------------------------------------------------

ALTER TABLE public.bank_transactions
  ADD COLUMN IF NOT EXISTS counterparty_account text,
  ADD COLUMN IF NOT EXISTS bank_reference text,
  ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('unmatched','partially_matched','matched')) DEFAULT 'unmatched',
  ADD COLUMN IF NOT EXISTS matched_invoice_ids uuid[],
  ADD COLUMN IF NOT EXISTS match_confidence int,
  ADD COLUMN IF NOT EXISTS match_notes text,
  ADD COLUMN IF NOT EXISTS import_batch_id uuid REFERENCES public.import_batches(id),
  ADD COLUMN IF NOT EXISTS match_group_id uuid,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.bank_transactions
  DROP COLUMN IF EXISTS reconciled;

UPDATE public.bank_transactions
SET updated_at = COALESCE(updated_at, created_at);

DROP TRIGGER IF EXISTS trg_bank_transactions_set_updated_at ON public.bank_transactions;
CREATE TRIGGER trg_bank_transactions_set_updated_at
  BEFORE UPDATE ON public.bank_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_bank_transactions_status ON public.bank_transactions(status, value_date DESC);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_account ON public.bank_transactions(account_ref, value_date DESC);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_match_confidence ON public.bank_transactions(match_confidence);

-- ---------------------------------------------------------------------------
-- Suggested matches for reconciliation
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.suggested_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_transaction_id uuid REFERENCES public.bank_transactions(id) ON DELETE CASCADE,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE,
  confidence int CHECK (confidence >= 0 AND confidence <= 100) NOT NULL,
  match_reason text NOT NULL,
  amount_difference numeric(18,2),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suggested_matches_transaction ON public.suggested_matches(bank_transaction_id);
CREATE INDEX IF NOT EXISTS idx_suggested_matches_confidence ON public.suggested_matches(confidence DESC);

-- ---------------------------------------------------------------------------
-- Reconciliation matches table
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.reconciliation_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_transaction_id uuid REFERENCES public.bank_transactions(id) ON DELETE CASCADE,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE,
  match_type text CHECK (match_type IN ('exact','partial','combined','split','manual')) NOT NULL,
  matched_amount numeric(18,2) NOT NULL,
  match_confidence int,
  match_reason text,
  status text CHECK (status IN ('suggested','approved','reversed')) DEFAULT 'suggested',
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_matches_transaction ON public.reconciliation_matches(bank_transaction_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_matches_invoice ON public.reconciliation_matches(invoice_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_matches_status ON public.reconciliation_matches(status);

-- ---------------------------------------------------------------------------
-- Counterparty aliases to aid match heuristics
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.counterparty_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid REFERENCES public.investors(id) ON DELETE CASCADE,
  alias_name text NOT NULL,
  notes text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE (investor_id, alias_name)
);

CREATE INDEX IF NOT EXISTS idx_counterparty_aliases_investor ON public.counterparty_aliases(investor_id);
CREATE INDEX IF NOT EXISTS idx_counterparty_aliases_alias ON public.counterparty_aliases USING gin (to_tsvector('english', alias_name));

-- ---------------------------------------------------------------------------
-- Invoice enhancements for reconciliation reporting
-- ---------------------------------------------------------------------------

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS invoice_number text UNIQUE,
  ADD COLUMN IF NOT EXISTS match_status text CHECK (match_status IN ('unmatched','partially_matched','matched')) DEFAULT 'unmatched';

UPDATE public.invoices
SET invoice_number = 'INV-' || to_char(created_at, 'YYYYMMDD') || '-' || lpad((ROW_NUMBER() OVER (PARTITION BY created_at ORDER BY id))::text, 4, '0')
WHERE invoice_number IS NULL;

-- ---------------------------------------------------------------------------
-- RPC helpers for matching workflows
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.run_auto_match()
RETURNS TABLE (
  transaction_id uuid,
  invoice_id uuid,
  confidence int,
  reason text
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_transaction record;
  v_invoice record;
  v_confidence int;
  v_reason text;
  v_amount_diff numeric;
BEGIN
  FOR v_transaction IN
    SELECT * FROM public.bank_transactions
    WHERE status = 'unmatched'
  LOOP
    FOR v_invoice IN
      SELECT i.id,
             i.total AS total_amount,
             i.balance_due,
             inv.legal_name,
             similarity(coalesce(v_transaction.counterparty,''), coalesce(inv.legal_name,'')) AS name_similarity
      FROM public.invoices i
      JOIN public.investors inv ON inv.id = i.investor_id
      WHERE i.status IN ('sent','partially_paid','overdue')
        AND i.currency = v_transaction.currency
        AND i.balance_due > 0
      ORDER BY ABS(i.balance_due - v_transaction.amount) ASC,
               name_similarity DESC
      LIMIT 1
    LOOP
      v_confidence := 0;
      v_reason := '';
      v_amount_diff := v_transaction.amount - v_invoice.balance_due;

      IF abs(v_amount_diff) <= 1 THEN
        v_confidence := v_confidence + 50;
        v_reason := 'Exact amount match';
      ELSIF abs(v_amount_diff) / NULLIF(v_invoice.balance_due,0) < 0.05 THEN
        v_confidence := v_confidence + 40;
        v_reason := 'Amount match within 5%';
      ELSIF abs(v_amount_diff) / NULLIF(v_invoice.balance_due,0) < 0.10 THEN
        v_confidence := v_confidence + 20;
        v_reason := 'Amount match within 10%';
      END IF;

      IF v_invoice.name_similarity > 0.8 THEN
        v_confidence := v_confidence + 40;
        v_reason := v_reason || ', strong counterparty match';
      ELSIF v_invoice.name_similarity > 0.6 THEN
        v_confidence := v_confidence + 25;
        v_reason := v_reason || ', good counterparty match';
      ELSIF v_invoice.name_similarity > 0.4 THEN
        v_confidence := v_confidence + 10;
        v_reason := v_reason || ', possible counterparty match';
      END IF;

      IF v_transaction.value_date BETWEEN current_date - interval '30 days' AND current_date + interval '1 day' THEN
        v_confidence := v_confidence + 10;
      END IF;

      IF v_confidence >= 50 THEN
        INSERT INTO public.suggested_matches (bank_transaction_id, invoice_id, confidence, match_reason, amount_difference)
        VALUES (v_transaction.id, v_invoice.id, v_confidence, v_reason, v_amount_diff)
        ON CONFLICT DO NOTHING;

        RETURN QUERY SELECT v_transaction.id, v_invoice.id, v_confidence, v_reason;
      END IF;
    END LOOP;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.apply_match(
  p_match_id uuid,
  p_approved_by uuid
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_match record;
  v_invoice record;
BEGIN
  SELECT * INTO v_match FROM public.reconciliation_matches WHERE id = p_match_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match % not found', p_match_id;
  END IF;

  UPDATE public.reconciliation_matches
  SET status = 'approved', approved_by = p_approved_by, approved_at = now()
  WHERE id = p_match_id;

  UPDATE public.bank_transactions
  SET status = CASE
    WHEN v_match.match_type = 'partial' THEN 'partially_matched'
    ELSE 'matched'
  END,
  match_confidence = v_match.match_confidence,
  match_notes = v_match.match_reason,
  matched_invoice_ids = array_append(coalesce(matched_invoice_ids, '{}'), v_match.invoice_id)
  WHERE id = v_match.bank_transaction_id;

  UPDATE public.invoices
  SET paid_amount = coalesce(paid_amount, 0) + v_match.matched_amount,
      status = CASE
        WHEN coalesce(paid_amount, 0) + v_match.matched_amount >= total THEN 'paid'
        ELSE 'partially_paid'
      END,
      match_status = CASE
        WHEN coalesce(paid_amount, 0) + v_match.matched_amount >= total THEN 'matched'
        ELSE 'partially_matched'
      END,
      paid_at = CASE
        WHEN coalesce(paid_amount, 0) + v_match.matched_amount >= total THEN now()
        ELSE paid_at
      END
  WHERE id = v_match.invoice_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- Summary helper for dashboard
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_reconciliation_summary()
RETURNS TABLE (
  total_transactions bigint,
  matched_transactions bigint,
  unmatched_transactions bigint,
  match_rate numeric,
  reconciled_amount numeric,
  pending_amount numeric
)
LANGUAGE sql
AS $$
  WITH tx AS (
    SELECT
      count(*) AS total_transactions,
      count(*) FILTER (WHERE status = 'matched') AS matched_transactions,
      count(*) FILTER (WHERE status <> 'matched') AS unmatched_transactions,
      coalesce(sum(amount) FILTER (WHERE status = 'matched'), 0) AS reconciled_amount,
      coalesce(sum(amount) FILTER (WHERE status <> 'matched'), 0) AS pending_amount
    FROM public.bank_transactions
  )
  SELECT
    tx.total_transactions,
    tx.matched_transactions,
    tx.unmatched_transactions,
    CASE WHEN tx.total_transactions = 0 THEN 0 ELSE round(tx.matched_transactions::numeric / tx.total_transactions * 100, 1) END AS match_rate,
    tx.reconciled_amount,
    tx.pending_amount
  FROM tx;
$$;

-- ---------------------------------------------------------------------------
-- RLS Policies
-- ---------------------------------------------------------------------------

ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggested_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counterparty_aliases ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bank_transactions' AND policyname = 'bank_transactions_staff_access'
  ) THEN
    EXECUTE 'CREATE POLICY bank_transactions_staff_access ON public.bank_transactions
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN (''staff_admin'',''staff_ops'',''staff_rm'')
        )
      )';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bank_transactions' AND policyname = 'bank_transactions_admin_write'
  ) THEN
    EXECUTE 'CREATE POLICY bank_transactions_admin_write ON public.bank_transactions
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
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reconciliation_matches' AND policyname = 'reconciliation_matches_staff_access'
  ) THEN
    EXECUTE 'CREATE POLICY reconciliation_matches_staff_access ON public.reconciliation_matches
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN (''staff_admin'',''staff_ops'',''staff_rm'')
        )
      )';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reconciliation_matches' AND policyname = 'reconciliation_matches_admin_write'
  ) THEN
    EXECUTE 'CREATE POLICY reconciliation_matches_admin_write ON public.reconciliation_matches
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
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'suggested_matches' AND policyname = 'suggested_matches_staff_access'
  ) THEN
    EXECUTE 'CREATE POLICY suggested_matches_staff_access ON public.suggested_matches
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN (''staff_admin'',''staff_ops'',''staff_rm'')
        )
      )';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'counterparty_aliases' AND policyname = 'counterparty_aliases_staff_access'
  ) THEN
    EXECUTE 'CREATE POLICY counterparty_aliases_staff_access ON public.counterparty_aliases
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN (''staff_admin'',''staff_ops'',''staff_rm'')
        )
      )';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'counterparty_aliases' AND policyname = 'counterparty_aliases_admin_write'
  ) THEN
    EXECUTE 'CREATE POLICY counterparty_aliases_admin_write ON public.counterparty_aliases
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

