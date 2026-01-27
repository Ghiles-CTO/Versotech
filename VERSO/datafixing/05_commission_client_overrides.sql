-- Apply client red-edited commission overrides (even when conflicting with dashboard)
-- Source: VERSO/datafixing/05_Introducer_Commissions_FD comments.xlsx (red rows)
-- Note: rate_bps must be integer; row 531 shows Rate(bps)=113.75 and Rate(%)=13.75.
-- We store 1375 bps to match 13.75% and the amount 12,210.

begin;

-- Ensure investor exists: 778 WALNUT LLC
insert into investors (legal_name, display_name)
select '778 WALNUT LLC', '778 WALNUT LLC'
where not exists (
  select 1 from investors
  where lower(legal_name) = lower('778 WALNUT LLC')
     or lower(display_name) = lower('778 WALNUT LLC')
);

-- Ensure missing introductions
-- VC122 Pierre Paumier -> LF GROUP SARL
insert into introductions (introducer_id, prospect_investor_id, deal_id, status)
select
  '41974010-e41d-40a6-9cbf-725618e7e00c',
  '938db8aa-ce0c-47e9-b0f7-23ba9c20e7a1',
  '06653c86-b191-438a-9f32-d0a3224854b1',
  'allocated'
where not exists (
  select 1 from introductions
  where introducer_id = '41974010-e41d-40a6-9cbf-725618e7e00c'
    and prospect_investor_id = '938db8aa-ce0c-47e9-b0f7-23ba9c20e7a1'
    and deal_id = '06653c86-b191-438a-9f32-d0a3224854b1'
);

-- VC125 Terra -> Eric SARASIN
insert into introductions (introducer_id, prospect_investor_id, deal_id, status)
select
  '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
  '698833c1-7ff3-4fa7-b7d0-733d8547cf43',
  'f73d625c-dc39-4829-919e-327dd5bdae07',
  'allocated'
where not exists (
  select 1 from introductions
  where introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
    and prospect_investor_id = '698833c1-7ff3-4fa7-b7d0-733d8547cf43'
    and deal_id = 'f73d625c-dc39-4829-919e-327dd5bdae07'
);

-- VC125 Pierre Paumier -> LF GROUP SARL
insert into introductions (introducer_id, prospect_investor_id, deal_id, status)
select
  '41974010-e41d-40a6-9cbf-725618e7e00c',
  '938db8aa-ce0c-47e9-b0f7-23ba9c20e7a1',
  'f73d625c-dc39-4829-919e-327dd5bdae07',
  'allocated'
where not exists (
  select 1 from introductions
  where introducer_id = '41974010-e41d-40a6-9cbf-725618e7e00c'
    and prospect_investor_id = '938db8aa-ce0c-47e9-b0f7-23ba9c20e7a1'
    and deal_id = 'f73d625c-dc39-4829-919e-327dd5bdae07'
);

-- VC126 Setcap -> BSV SPV III LLC
insert into introductions (introducer_id, prospect_investor_id, deal_id, status)
select
  'b661243f-e6b4-41f1-b239-de4b197a689a',
  'd84e68f3-64cb-4c17-ad14-0e9f9146aef1',
  'e2d649da-f1e9-49ca-b426-dd8ade244f12',
  'allocated'
where not exists (
  select 1 from introductions
  where introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
    and prospect_investor_id = 'd84e68f3-64cb-4c17-ad14-0e9f9146aef1'
    and deal_id = 'e2d649da-f1e9-49ca-b426-dd8ade244f12'
);

-- VC126 Daniel Baumslag -> CLOUDSAFE HOLDINGS LIMITED
insert into introductions (introducer_id, prospect_investor_id, deal_id, status)
select
  '18aecf7f-4793-405d-b7f3-d9add75f8063',
  '76518678-13f1-4a8e-a050-1e0ef6a39d4c',
  'e2d649da-f1e9-49ca-b426-dd8ade244f12',
  'allocated'
where not exists (
  select 1 from introductions
  where introducer_id = '18aecf7f-4793-405d-b7f3-d9add75f8063'
    and prospect_investor_id = '76518678-13f1-4a8e-a050-1e0ef6a39d4c'
    and deal_id = 'e2d649da-f1e9-49ca-b426-dd8ade244f12'
);

-- VC133 Setcap -> 778 WALNUT LLC
insert into introductions (introducer_id, prospect_investor_id, deal_id, status)
select
  'b661243f-e6b4-41f1-b239-de4b197a689a',
  (select id from investors where lower(legal_name)=lower('778 WALNUT LLC') or lower(display_name)=lower('778 WALNUT LLC') limit 1),
  '750e0559-a10a-48eb-9593-106329bf9f53',
  'allocated'
where not exists (
  select 1 from introductions
  where introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
    and prospect_investor_id = (select id from investors where lower(legal_name)=lower('778 WALNUT LLC') or lower(display_name)=lower('778 WALNUT LLC') limit 1)
    and deal_id = '750e0559-a10a-48eb-9593-106329bf9f53'
);

-- Update existing commissions per client edits (VC126 Cloudsafe)
update introducer_commissions
set introducer_id = '18aecf7f-4793-405d-b7f3-d9add75f8063',
    rate_bps = 0,
    accrual_amount = 0,
    introduction_id = (
      select id from introductions
      where introducer_id = '18aecf7f-4793-405d-b7f3-d9add75f8063'
        and prospect_investor_id = '76518678-13f1-4a8e-a050-1e0ef6a39d4c'
        and deal_id = 'e2d649da-f1e9-49ca-b426-dd8ade244f12'
      limit 1
    )
where id = 'b057ecc2-8ad8-464d-9b43-f0030604357c';

update introducer_commissions
set introducer_id = '18aecf7f-4793-405d-b7f3-d9add75f8063',
    rate_bps = 1375,
    accrual_amount = 12210,
    introduction_id = (
      select id from introductions
      where introducer_id = '18aecf7f-4793-405d-b7f3-d9add75f8063'
        and prospect_investor_id = '76518678-13f1-4a8e-a050-1e0ef6a39d4c'
        and deal_id = 'e2d649da-f1e9-49ca-b426-dd8ade244f12'
      limit 1
    )
where id = '6f6c330a-c5fe-419a-8178-37069b41a853';

-- Insert missing commissions (client red rows)
-- VC122 Pierre Paumier -> LF GROUP SARL
insert into introducer_commissions (introducer_id, deal_id, investor_id, introduction_id, basis_type, rate_bps, accrual_amount, currency, status)
select
  '41974010-e41d-40a6-9cbf-725618e7e00c',
  '06653c86-b191-438a-9f32-d0a3224854b1',
  '938db8aa-ce0c-47e9-b0f7-23ba9c20e7a1',
  (select id from introductions where introducer_id='41974010-e41d-40a6-9cbf-725618e7e00c' and prospect_investor_id='938db8aa-ce0c-47e9-b0f7-23ba9c20e7a1' and deal_id='06653c86-b191-438a-9f32-d0a3224854b1' limit 1),
  'invested_amount',
  200,
  1500,
  'USD',
  'accrued'
where not exists (
  select 1 from introducer_commissions
  where introducer_id='41974010-e41d-40a6-9cbf-725618e7e00c'
    and deal_id='06653c86-b191-438a-9f32-d0a3224854b1'
    and investor_id='938db8aa-ce0c-47e9-b0f7-23ba9c20e7a1'
    and basis_type='invested_amount'
    and rate_bps=200
    and accrual_amount=1500
    and currency='USD'
);

insert into introducer_commissions (introducer_id, deal_id, investor_id, introduction_id, basis_type, rate_bps, accrual_amount, currency, status)
select
  '41974010-e41d-40a6-9cbf-725618e7e00c',
  '06653c86-b191-438a-9f32-d0a3224854b1',
  '938db8aa-ce0c-47e9-b0f7-23ba9c20e7a1',
  (select id from introductions where introducer_id='41974010-e41d-40a6-9cbf-725618e7e00c' and prospect_investor_id='938db8aa-ce0c-47e9-b0f7-23ba9c20e7a1' and deal_id='06653c86-b191-438a-9f32-d0a3224854b1' limit 1),
  'performance_fee',
  500,
  0,
  'USD',
  'accrued'
where not exists (
  select 1 from introducer_commissions
  where introducer_id='41974010-e41d-40a6-9cbf-725618e7e00c'
    and deal_id='06653c86-b191-438a-9f32-d0a3224854b1'
    and investor_id='938db8aa-ce0c-47e9-b0f7-23ba9c20e7a1'
    and basis_type='performance_fee'
    and rate_bps=500
    and accrual_amount=0
    and currency='USD'
);

-- VC125 Terra -> MA GROUP AG (performance fee)
insert into introducer_commissions (introducer_id, deal_id, investor_id, introduction_id, basis_type, rate_bps, accrual_amount, currency, status)
select
  '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
  'f73d625c-dc39-4829-919e-327dd5bdae07',
  '3e75e4c5-6071-410d-bb55-d4ede85ab93d',
  'e7ddfbfa-f70b-46ab-bda2-7563a4ea592f',
  'performance_fee',
  200,
  0,
  'EUR',
  'accrued'
where not exists (
  select 1 from introducer_commissions
  where introducer_id='1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
    and deal_id='f73d625c-dc39-4829-919e-327dd5bdae07'
    and investor_id='3e75e4c5-6071-410d-bb55-d4ede85ab93d'
    and basis_type='performance_fee'
    and rate_bps=200
    and accrual_amount=0
    and currency='EUR'
);

-- VC125 Terra -> Eric SARASIN
insert into introducer_commissions (introducer_id, deal_id, investor_id, introduction_id, basis_type, rate_bps, accrual_amount, currency, status)
select
  '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
  'f73d625c-dc39-4829-919e-327dd5bdae07',
  '698833c1-7ff3-4fa7-b7d0-733d8547cf43',
  (select id from introductions where introducer_id='1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' and prospect_investor_id='698833c1-7ff3-4fa7-b7d0-733d8547cf43' and deal_id='f73d625c-dc39-4829-919e-327dd5bdae07' limit 1),
  'invested_amount',
  500,
  5000,
  'EUR',
  'accrued'
where not exists (
  select 1 from introducer_commissions
  where introducer_id='1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
    and deal_id='f73d625c-dc39-4829-919e-327dd5bdae07'
    and investor_id='698833c1-7ff3-4fa7-b7d0-733d8547cf43'
    and basis_type='invested_amount'
    and rate_bps=500
    and accrual_amount=5000
    and currency='EUR'
);

insert into introducer_commissions (introducer_id, deal_id, investor_id, introduction_id, basis_type, rate_bps, accrual_amount, currency, status)
select
  '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
  'f73d625c-dc39-4829-919e-327dd5bdae07',
  '698833c1-7ff3-4fa7-b7d0-733d8547cf43',
  (select id from introductions where introducer_id='1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' and prospect_investor_id='698833c1-7ff3-4fa7-b7d0-733d8547cf43' and deal_id='f73d625c-dc39-4829-919e-327dd5bdae07' limit 1),
  'performance_fee',
  200,
  0,
  'EUR',
  'accrued'
where not exists (
  select 1 from introducer_commissions
  where introducer_id='1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
    and deal_id='f73d625c-dc39-4829-919e-327dd5bdae07'
    and investor_id='698833c1-7ff3-4fa7-b7d0-733d8547cf43'
    and basis_type='performance_fee'
    and rate_bps=200
    and accrual_amount=0
    and currency='EUR'
);

-- VC125 Pierre Paumier -> LF GROUP SARL
insert into introducer_commissions (introducer_id, deal_id, investor_id, introduction_id, basis_type, rate_bps, accrual_amount, currency, status)
select
  '41974010-e41d-40a6-9cbf-725618e7e00c',
  'f73d625c-dc39-4829-919e-327dd5bdae07',
  '938db8aa-ce0c-47e9-b0f7-23ba9c20e7a1',
  (select id from introductions where introducer_id='41974010-e41d-40a6-9cbf-725618e7e00c' and prospect_investor_id='938db8aa-ce0c-47e9-b0f7-23ba9c20e7a1' and deal_id='f73d625c-dc39-4829-919e-327dd5bdae07' limit 1),
  'invested_amount',
  200,
  2000,
  'EUR',
  'accrued'
where not exists (
  select 1 from introducer_commissions
  where introducer_id='41974010-e41d-40a6-9cbf-725618e7e00c'
    and deal_id='f73d625c-dc39-4829-919e-327dd5bdae07'
    and investor_id='938db8aa-ce0c-47e9-b0f7-23ba9c20e7a1'
    and basis_type='invested_amount'
    and rate_bps=200
    and accrual_amount=2000
    and currency='EUR'
);

-- VC126 Setcap -> BSV SPV III LLC
insert into introducer_commissions (introducer_id, deal_id, investor_id, introduction_id, basis_type, rate_bps, accrual_amount, currency, status)
select
  'b661243f-e6b4-41f1-b239-de4b197a689a',
  'e2d649da-f1e9-49ca-b426-dd8ade244f12',
  'd84e68f3-64cb-4c17-ad14-0e9f9146aef1',
  (select id from introductions where introducer_id='b661243f-e6b4-41f1-b239-de4b197a689a' and prospect_investor_id='d84e68f3-64cb-4c17-ad14-0e9f9146aef1' and deal_id='e2d649da-f1e9-49ca-b426-dd8ade244f12' limit 1),
  'performance_fee',
  0,
  0,
  'USD',
  'accrued'
where not exists (
  select 1 from introducer_commissions
  where introducer_id='b661243f-e6b4-41f1-b239-de4b197a689a'
    and deal_id='e2d649da-f1e9-49ca-b426-dd8ade244f12'
    and investor_id='d84e68f3-64cb-4c17-ad14-0e9f9146aef1'
    and basis_type='performance_fee'
    and rate_bps=0
    and accrual_amount=0
    and currency='USD'
);

insert into introducer_commissions (introducer_id, deal_id, investor_id, introduction_id, basis_type, rate_bps, accrual_amount, currency, status)
select
  'b661243f-e6b4-41f1-b239-de4b197a689a',
  'e2d649da-f1e9-49ca-b426-dd8ade244f12',
  'd84e68f3-64cb-4c17-ad14-0e9f9146aef1',
  (select id from introductions where introducer_id='b661243f-e6b4-41f1-b239-de4b197a689a' and prospect_investor_id='d84e68f3-64cb-4c17-ad14-0e9f9146aef1' and deal_id='e2d649da-f1e9-49ca-b426-dd8ade244f12' limit 1),
  'spread',
  290,
  31030,
  'USD',
  'accrued'
where not exists (
  select 1 from introducer_commissions
  where introducer_id='b661243f-e6b4-41f1-b239-de4b197a689a'
    and deal_id='e2d649da-f1e9-49ca-b426-dd8ade244f12'
    and investor_id='d84e68f3-64cb-4c17-ad14-0e9f9146aef1'
    and basis_type='spread'
    and rate_bps=290
    and accrual_amount=31030
    and currency='USD'
);

-- VC133 Setcap -> 778 WALNUT LLC (new investor)
insert into introducer_commissions (introducer_id, deal_id, investor_id, introduction_id, basis_type, rate_bps, accrual_amount, currency, status)
select
  'b661243f-e6b4-41f1-b239-de4b197a689a',
  '750e0559-a10a-48eb-9593-106329bf9f53',
  (select id from investors where lower(legal_name)=lower('778 WALNUT LLC') or lower(display_name)=lower('778 WALNUT LLC') limit 1),
  (select id from introductions where introducer_id='b661243f-e6b4-41f1-b239-de4b197a689a' and prospect_investor_id=(select id from investors where lower(legal_name)=lower('778 WALNUT LLC') or lower(display_name)=lower('778 WALNUT LLC') limit 1) and deal_id='750e0559-a10a-48eb-9593-106329bf9f53' limit 1),
  'spread',
  8500,
  2805,
  'USD',
  'accrued'
where not exists (
  select 1 from introducer_commissions
  where introducer_id='b661243f-e6b4-41f1-b239-de4b197a689a'
    and deal_id='750e0559-a10a-48eb-9593-106329bf9f53'
    and investor_id=(select id from investors where lower(legal_name)=lower('778 WALNUT LLC') or lower(display_name)=lower('778 WALNUT LLC') limit 1)
    and basis_type='spread'
    and rate_bps=8500
    and accrual_amount=2805
    and currency='USD'
);

commit;
