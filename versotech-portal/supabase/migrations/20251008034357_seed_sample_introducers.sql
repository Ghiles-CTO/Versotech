insert into introducers (id, legal_name, contact_name, email, default_commission_bps, status, created_at)
values
  ('00000000-0000-0000-0000-00000000aa01','Goldman Sachs Private Wealth','Marcus Goldman','marcus.goldman@gs.com',150,'active',now() - interval '40 days'),
  ('00000000-0000-0000-0000-00000000aa02','Meridian Capital Partners','Sarah Chen','sarah.chen@meridian.com',200,'active',now() - interval '25 days'),
  ('00000000-0000-0000-0000-00000000aa03','Elite Family Office Network','James Morrison','james.morrison@elite.com',175,'inactive',now() - interval '90 days');

insert into introductions (id, introducer_id, prospect_email, deal_id, status, introduced_at, created_at)
values
  ('00000000-0000-0000-0000-00000000bb01','00000000-0000-0000-0000-00000000aa01','jane.smith@example.com',null,'allocated',current_date - 7, now() - interval '7 days'),
  ('00000000-0000-0000-0000-00000000bb02','00000000-0000-0000-0000-00000000aa02','wealth.office@example.com',null,'joined',current_date - 5, now() - interval '5 days'),
  ('00000000-0000-0000-0000-00000000bb03','00000000-0000-0000-0000-00000000aa01','family.office@example.com',null,'invited',current_date - 2, now() - interval '2 days');

insert into introducer_commissions (id, introducer_id, investor_id, deal_id, introduction_id, basis_type, rate_bps, accrual_amount, status, created_at, paid_at)
values
  ('00000000-0000-0000-0000-00000000cc01','00000000-0000-0000-0000-00000000aa01',null,null,'00000000-0000-0000-0000-00000000bb01','invested_amount',150,30000,'paid',now() - interval '3 days', now() - interval '1 days'),
  ('00000000-0000-0000-0000-00000000cc02','00000000-0000-0000-0000-00000000aa02',null,null,'00000000-0000-0000-0000-00000000bb02','invested_amount',200,18000,'accrued',now() - interval '4 days', null);
;
