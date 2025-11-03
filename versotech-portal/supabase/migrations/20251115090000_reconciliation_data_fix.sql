-- Fix run_auto_match cleanup logic and repair corrupted reconciliation data
BEGIN;

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
    -- Clear stale suggestions before generating new ones
    DELETE FROM public.suggested_matches
    WHERE bank_transaction_id = v_transaction.id;

    DELETE FROM public.reconciliation_matches
    WHERE bank_transaction_id = v_transaction.id
      AND status = 'suggested';

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

WITH corrupted_tx AS (
  SELECT bt.id
  FROM public.bank_transactions bt
  LEFT JOIN public.reconciliation_matches rm
    ON rm.bank_transaction_id = bt.id
    AND rm.status = 'approved'
  WHERE bt.status IN ('matched','partially_matched')
  GROUP BY bt.id
  HAVING COUNT(rm.id) = 0
),
updated_transactions AS (
  UPDATE public.bank_transactions bt
  SET status = 'unmatched',
      match_confidence = NULL,
      match_notes = NULL,
      matched_invoice_ids = NULL,
      match_group_id = NULL,
      updated_at = now()
  WHERE bt.id IN (SELECT id FROM corrupted_tx)
  RETURNING bt.id
),
deleted_suggestions AS (
  DELETE FROM public.suggested_matches sm
  WHERE sm.bank_transaction_id IN (SELECT id FROM corrupted_tx)
  RETURNING sm.bank_transaction_id
),
deleted_pending_matches AS (
  DELETE FROM public.reconciliation_matches rm
  WHERE rm.bank_transaction_id IN (SELECT id FROM corrupted_tx)
    AND rm.status <> 'approved'
  RETURNING rm.bank_transaction_id
)
UPDATE public.invoices i
SET match_status = 'unmatched'
WHERE i.id IN (
  SELECT i.id
  FROM public.invoices i
  LEFT JOIN public.reconciliation_matches rm
    ON rm.invoice_id = i.id
    AND rm.status = 'approved'
  GROUP BY i.id, i.match_status
  HAVING COUNT(rm.id) = 0 AND i.match_status <> 'unmatched'
);

COMMIT;
