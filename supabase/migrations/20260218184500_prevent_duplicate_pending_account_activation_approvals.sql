-- Prevent duplicate pending account activation approvals created by concurrent staff actions.

WITH ranked_pending AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY entity_type, entity_id, status
      ORDER BY created_at ASC, id ASC
    ) AS rn
  FROM public.approvals
  WHERE entity_type = 'account_activation'
    AND status = 'pending'
)
UPDATE public.approvals AS a
SET
  status = 'cancelled',
  notes = trim(both from concat_ws(' | ', a.notes, 'Auto-cancelled duplicate pending account activation request')),
  resolved_at = COALESCE(a.resolved_at, now()),
  updated_at = now()
FROM ranked_pending AS rp
WHERE a.id = rp.id
  AND rp.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS approvals_unique_pending_account_activation
  ON public.approvals (entity_type, entity_id)
  WHERE entity_type = 'account_activation'
    AND status = 'pending';
