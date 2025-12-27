WITH introducer_seed (id, legal_name, contact_name, email, default_commission_bps, commission_cap_amount, payment_terms, status, notes, created_at) AS (
  VALUES
    ('10000000-0000-0000-0000-000000000001'::uuid,'Atlas Wealth Alliance','Laura Patel','laura.patel@atlaswealth.com',120::int,50000::numeric,'net_30','active','Focus on UHNWI in APAC', now() - interval '35 days'),
    ('10000000-0000-0000-0000-000000000002'::uuid,'Harborview Family Office Network','Michael Grant','m.grant@harborviewfo.com',150::int,60000::numeric,'net_45','active','Strong relationships in real estate funds', now() - interval '25 days'),
    ('10000000-0000-0000-0000-000000000003'::uuid,'Summit Capital Connect','Aisha Khan','aisha.khan@summitcapital.co',180::int,45000::numeric,'net_30','active','Focus on growth equity deals', now() - interval '18 days'),
    ('10000000-0000-0000-0000-000000000004'::uuid,'BridgePoint Introductions','Carlos Mendes','carlos.mendes@bridgepoint-introducers.com',140::int,NULL::numeric,'net_30','active','Specialises in LATAM institutional investors', now() - interval '12 days'),
    ('10000000-0000-0000-0000-000000000005'::uuid,'Northshore Advisory Partners','Emily Roberts','emily.roberts@northshoreadvisory.com',200::int,80000::numeric,'net_60','suspended','Temporarily on hold pending agreement renewal', now() - interval '60 days'),
    ('10000000-0000-0000-0000-000000000006'::uuid,'Crescent Bridge Advisory','Daniel Cho','daniel.cho@crescentbridge.com',110::int,40000::numeric,'net_30','active','Focus on Middle East wealth managers', now() - interval '8 days')
)
INSERT INTO introducers (id, legal_name, contact_name, email, default_commission_bps, commission_cap_amount, payment_terms, status, notes, created_at)
SELECT *
FROM introducer_seed
ON CONFLICT (id) DO NOTHING;
WITH introduction_seed (id, introducer_id, prospect_email, deal_id, status, introduced_at, created_at, commission_rate_override_bps, notes) AS (
  VALUES
    ('20000000-0000-0000-0000-000000000001'::uuid,'10000000-0000-0000-0000-000000000001'::uuid,'victor.nguyen@sovereignwealth.sg','880e8400-e29b-41d4-a716-446655440001'::uuid,'allocated', current_date - 14, now() - interval '14 days', NULL::int, 'Looking to deploy $3M in secondary positions'),
    ('20000000-0000-0000-0000-000000000002'::uuid,'10000000-0000-0000-0000-000000000001'::uuid,'au.jadeinvest@familyoffice.com','5ca1185e-9096-4422-ad27-444e8166ee71'::uuid,'joined', current_date - 9, now() - interval '9 days', 140::int, 'Considering credit allocation of $1.2M'),
    ('20000000-0000-0000-0000-000000000003'::uuid,'10000000-0000-0000-0000-000000000002'::uuid,'amelia.wang@globalfamilyoffice.hk','880e8400-e29b-41d4-a716-446655440002'::uuid,'allocated', current_date - 6, now() - interval '6 days', NULL::int, 'Committed $1.5M to AI Primary round'),
    ('20000000-0000-0000-0000-000000000004'::uuid,'10000000-0000-0000-0000-000000000003'::uuid,'omar.elhassan@menawealth.com','6336fe1e-26ba-4c12-a647-8afe9146bf54'::uuid,'joined', current_date - 5, now() - interval '5 days', NULL::int, 'Needs updated IM before allocating'),
    ('20000000-0000-0000-0000-000000000005'::uuid,'10000000-0000-0000-0000-000000000003'::uuid,'funds@evergreenvc.com','880e8400-e29b-41d4-a716-446655440002'::uuid,'invited', current_date - 3, now() - interval '3 days', 190::int, 'Targeting $2M allocation'),
    ('20000000-0000-0000-0000-000000000006'::uuid,'10000000-0000-0000-0000-000000000004'::uuid,'felipe.souza@brazilcapital.com','5ca1185e-9096-4422-ad27-444e8166ee71'::uuid,'allocated', current_date - 4, now() - interval '4 days', NULL::int, 'Closed $1M commitment to xAI fund'),
    ('20000000-0000-0000-0000-000000000007'::uuid,'10000000-0000-0000-0000-000000000004'::uuid,'laura.garcia@latamfamilyoffice.com','6336fe1e-26ba-4c12-a647-8afe9146bf54'::uuid,'invited', current_date - 2, now() - interval '2 days', NULL::int, 'Awaiting compliance checks'),
    ('20000000-0000-0000-0000-000000000008'::uuid,'10000000-0000-0000-0000-000000000006'::uuid,'samir.hassan@crescentwealth.ae','d4d2fbe4-b1a3-466e-b25c-c7b559078e69'::uuid,'joined', current_date - 1, now() - interval '1 day', NULL::int, 'Interested in structured trade finance exposure')
),
filtered_introductions AS (
  SELECT s.*
  FROM introduction_seed s
  WHERE EXISTS (SELECT 1 FROM introducers i WHERE i.id = s.introducer_id)
    AND (s.deal_id IS NULL OR EXISTS (SELECT 1 FROM deals d WHERE d.id = s.deal_id))
)
INSERT INTO introductions (id, introducer_id, prospect_email, deal_id, status, introduced_at, created_at, commission_rate_override_bps, notes)
SELECT *
FROM filtered_introductions
ON CONFLICT (id) DO NOTHING;
WITH commission_seed (id, introducer_id, introduction_id, deal_id, investor_id, basis_type, rate_bps, base_amount, accrual_amount, status, created_at, approved_at, payment_due_date, notes) AS (
  VALUES
    ('30000000-0000-0000-0000-000000000001'::uuid,'10000000-0000-0000-0000-000000000001'::uuid,'20000000-0000-0000-0000-000000000001'::uuid,'880e8400-e29b-41d4-a716-446655440001'::uuid,NULL::uuid,'invested_amount',120::int,3000000::numeric,36000::numeric,'paid', now() - interval '7 days', now() - interval '6 days', current_date - 5, 'Commission settled via wire transfer'),
    ('30000000-0000-0000-0000-000000000002'::uuid,'10000000-0000-0000-0000-000000000002'::uuid,'20000000-0000-0000-0000-000000000003'::uuid,'880e8400-e29b-41d4-a716-446655440002'::uuid,NULL::uuid,'invested_amount',150::int,1500000::numeric,22500::numeric,'accrued', now() - interval '4 days', NULL::timestamptz, current_date + 10, 'Pending payment after capital call'),
    ('30000000-0000-0000-0000-000000000003'::uuid,'10000000-0000-0000-0000-000000000004'::uuid,'20000000-0000-0000-0000-000000000006'::uuid,'5ca1185e-9096-4422-ad27-444e8166ee71'::uuid,NULL::uuid,'invested_amount',140::int,1000000::numeric,14000::numeric,'invoiced', now() - interval '2 days', now() - interval '1 day', current_date + 20, 'Invoice #INV-2201 issued'),
    ('30000000-0000-0000-0000-000000000004'::uuid,'10000000-0000-0000-0000-000000000006'::uuid,'20000000-0000-0000-0000-000000000008'::uuid,'d4d2fbe4-b1a3-466e-b25c-c7b559078e69'::uuid,NULL::uuid,'invested_amount',110::int,800000::numeric,8800::numeric,'accrued', now() - interval '1 day', NULL::timestamptz, current_date + 15, 'Awaiting approval from finance')
),
filtered_commissions AS (
  SELECT s.*
  FROM commission_seed s
  WHERE EXISTS (SELECT 1 FROM introducers i WHERE i.id = s.introducer_id)
    AND EXISTS (SELECT 1 FROM introductions intro WHERE intro.id = s.introduction_id)
    AND (s.deal_id IS NULL OR EXISTS (SELECT 1 FROM deals d WHERE d.id = s.deal_id))
)
INSERT INTO introducer_commissions (id, introducer_id, introduction_id, deal_id, investor_id, basis_type, rate_bps, base_amount, accrual_amount, status, created_at, approved_at, payment_due_date, notes)
SELECT *
FROM filtered_commissions
ON CONFLICT (id) DO NOTHING;
