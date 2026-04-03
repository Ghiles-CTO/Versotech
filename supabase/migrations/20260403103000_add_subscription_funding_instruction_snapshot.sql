alter table public.subscriptions
  add column if not exists funding_gross_target_amount numeric,
  add column if not exists funding_gross_received_amount numeric not null default 0,
  add column if not exists funding_instruction_snapshot jsonb,
  add column if not exists funding_instruction_generated_at timestamptz,
  add column if not exists funding_instruction_notified_at timestamptz,
  add column if not exists funding_instruction_emailed_at timestamptz;

update public.subscriptions
set funding_gross_received_amount = 0
where funding_gross_received_amount is null;

comment on column public.subscriptions.funding_gross_target_amount is
  'Frozen gross amount to wire from the signed funding instructions, including subscription fees.';

comment on column public.subscriptions.funding_gross_received_amount is
  'Gross amount confirmed received so far for the investor funding flow.';

comment on column public.subscriptions.funding_instruction_snapshot is
  'Frozen funding instruction snapshot captured when the investor completes subscription signing.';

comment on column public.subscriptions.funding_instruction_generated_at is
  'Timestamp when the funding instruction PDF/document was first generated.';

comment on column public.subscriptions.funding_instruction_notified_at is
  'Timestamp when investor funding notifications were first created.';

comment on column public.subscriptions.funding_instruction_emailed_at is
  'Timestamp when the automatic funding instruction email was first delivered.';
