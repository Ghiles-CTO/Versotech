-- Enforce one formal subscription and one open submission per investment cycle.
-- This protects the new sequential investment-cycle model from duplicate round data.

create unique index if not exists idx_subscriptions_cycle_unique_active
  on public.subscriptions(cycle_id)
  where cycle_id is not null
    and status not in ('cancelled', 'rejected');

create unique index if not exists idx_dss_cycle_unique_open
  on public.deal_subscription_submissions(cycle_id)
  where cycle_id is not null
    and status in ('pending_review', 'approved');
