-- Auto-generated migration for VC206
BEGIN;
WITH
veh as (select id,name,currency from vehicles where entity_code='VC206'),
deal_ins as (
  insert into deals (vehicle_id,name,status,currency)
  select v.id,v.name,'closed',coalesce(v.currency,'USD') from veh v
  where not exists (select 1 from deals d where d.vehicle_id=v.id)
  returning id,vehicle_id
),
deal as (
  select d.id,d.vehicle_id from deals d join veh v on d.vehicle_id=v.id
  union all
  select id,vehicle_id from deal_ins
  limit 1
),
sub_input(investor_legal_name,investor_type,investor_contact_name,investor_email,commitment,currency,status,funded_amount,cost_per_share,price_per_share,num_shares,units_subscription,contract_date,spread_per_share,spread_fee_amount,subscription_fee_percent,subscription_fee_amount,bd_fee_percent,bd_fee_amount,finra_shares,finra_fee_amount,performance_fee_tier1_percent,performance_fee_tier1_threshold,performance_fee_tier2_percent,performance_fee_tier2_threshold,management_fee_percent,opportunity_name,sourcing_contract_ref,dash_row) as (values
    ('ODIN INVESTMENTS LIMITED','entity','Jason SCOTT','jason@5two5.vc',2508570.0,'USD','funded',2508570.0,453.0,570.0,4401.0,4401.0,'2025-03-26',117.0,514917.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'OPEN AI',NULL,'4'),
    ('AI DIRECT OPPORTUNITIES FUND SCSP','entity','Diego VUILLIOMENET','dv@deliogroup.com',1581352.5,'USD','funded',1581352.5,453.0,477.75,3310.0,3310.0,'2025-04-04',24.75,81922.5,0.03,47440.575,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'OPEN AI',NULL,'5'),
    ('KIWI INNOVATIONS LIMITED','entity','Madrac  ZHU','madrac.zhu@marswalk.com',2000000.0,'USD','funded',2000000.0,453.0,480.0,4166.0,4166.0,'2025-06-30',27.0,112482.0,0.03,60000.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'OPEN AI',NULL,'6'),
    ('Rishabh MITTAL','individual','-','rmittal101@gmail.com',100000.0,'USD','funded',100000.0,453.0,495.0,202.0,202.0,'2025-04-04',42.0,8484.0,0.03,3000.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'OPEN AI',NULL,'7'),
    ('Anuroop ARORA','individual','-','anurooparora@gmail.com',108000.0,'USD','funded',108000.0,453.0,480.0,225.0,225.0,'2025-06-30',27.0,6075.0,0.03,3240.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'OPEN AI',NULL,'8'),
    ('Bharath RAM','individual','-','rbharathram@gmail.com',100000.0,'USD','funded',100000.0,453.0,480.0,208.0,208.0,'2025-06-30',27.0,5616.0,0.03,3000.0,0.025,2500.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'OPEN AI',NULL,'9'),
    ('AEON INC','entity','Demetrios MALLIOS','dmallios@aeon.vc',399360.0,'USD','funded',399360.0,453.0,480.0,832.0,832.0,'2025-07-22',27.0,22464.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'OPEN AI',NULL,'10'),
    ('Julien MACHOT','individual','-','jmachot@versoholdings.com',8250.0,'USD','funded',8250.0,453.0,450.0,18.0,18.0,'2025-06-30',-3.0,-54.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'OPEN AI',NULL,'11'),
    ('ALTA ASSET FUND 3, A SUB-FUND OF ALTA ASSET FUND VCC','entity','Muzahir Degani','muzahir.degani@alta.exchange',1500000.0,'USD','funded',1500000.0,453.0,735.0,3191.0,3191.0,'2025-10-23',282.0,899862.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'OPEN AI',NULL,'14'),
    ('ALTA ASSET FUND 3, A SUB-FUND OF ALTA ASSET FUND VCC','entity','Muzahir Degani','muzahir.degani@alta.exchange',1000000.0,'USD','funded',1000000.0,480.0,480.0,2083.0,2083.0,'2025-06-08',0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'OPEN AI','HEDGE','17'),
    ('ALTA ASSET FUND 3, A SUB-FUND OF ALTA ASSET FUND VCC','entity','Muzahir Degani','muzahir.degani@alta.exchange',5000000.0,'USD','funded',5000000.0,480.0,480.0,10416.0,10416.0,'2025-06-09',0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'OPEN AI','RAGHAVANNAIR','18')
),
inv_norm as (
  select distinct
    s.investor_legal_name,
    s.investor_type,
    nullif(s.investor_email,'') as investor_email,
    lower(trim(s.investor_legal_name)) as name_key
  from sub_input s
),
inv_upd as (
  update investors i
  set email=coalesce(n.investor_email,i.email),
      type=coalesce(n.investor_type,i.type),
      display_name=coalesce(i.display_name,n.investor_legal_name)
  from inv_norm n
  where lower(trim(i.legal_name))=n.name_key
  returning i.id,i.legal_name
),
inv_ins as (
  insert into investors (legal_name,type,email,display_name)
  select n.investor_legal_name,n.investor_type,n.investor_email,n.investor_legal_name
  from inv_norm n
  where not exists (
    select 1 from investors i
    where lower(trim(i.legal_name))=n.name_key
  )
  returning id,legal_name
),
inv as (
  select distinct i.id,i.legal_name,
    lower(trim(i.legal_name)) as name_key
  from investors i join inv_norm n
    on lower(trim(i.legal_name))=n.name_key
  union
  select ii.id,ii.legal_name,lower(trim(ii.legal_name)) from inv_ins ii
  union
  select iu.id,iu.legal_name,lower(trim(iu.legal_name)) from inv_upd iu
),
sub_ins as (
  insert into subscriptions (investor_id,vehicle_id,deal_id,commitment,currency,status,funded_amount,cost_per_share,price_per_share,num_shares,units,contract_date,spread_per_share,spread_fee_amount,subscription_fee_percent,subscription_fee_amount,bd_fee_percent,bd_fee_amount,finra_shares,finra_fee_amount,performance_fee_tier1_percent,performance_fee_tier1_threshold,performance_fee_tier2_percent,performance_fee_tier2_threshold,management_fee_percent,opportunity_name,sourcing_contract_ref)
  select i.id,d.vehicle_id,d.id,
         s.commitment::numeric,s.currency,s.status,s.funded_amount::numeric,
         s.cost_per_share::numeric,s.price_per_share::numeric,s.num_shares::numeric,s.units_subscription::numeric,
         s.contract_date::date,s.spread_per_share::numeric,s.spread_fee_amount::numeric,
         s.subscription_fee_percent::numeric,s.subscription_fee_amount::numeric,
         s.bd_fee_percent::numeric,s.bd_fee_amount::numeric,s.finra_shares::numeric,s.finra_fee_amount::numeric,
         s.performance_fee_tier1_percent::numeric,s.performance_fee_tier1_threshold::numeric,
         s.performance_fee_tier2_percent::numeric,s.performance_fee_tier2_threshold::numeric,
         s.management_fee_percent::numeric,s.opportunity_name,s.sourcing_contract_ref
  from sub_input s join (select name_key,min(id::text)::uuid as id from inv group by name_key) i on i.name_key=lower(trim(s.investor_legal_name)) cross join deal d
  where not exists (
    select 1 from subscriptions x
    where x.investor_id=i.id and x.vehicle_id=d.vehicle_id
      and coalesce(x.commitment,0)=coalesce(s.commitment::numeric,0)
      and coalesce(x.num_shares,0)=coalesce(s.num_shares::numeric,0)
      and coalesce(x.contract_date::text,'')=coalesce((s.contract_date::date)::text,'')
  )
  returning id
),
pos_input(investor_legal_name,units,cost_basis,as_of_date) as (values
    ('ODIN INVESTMENTS LIMITED',4401.0,2508570.0,'2025-03-26'),
    ('AI DIRECT OPPORTUNITIES FUND SCSP',3310.0,1581352.5,'2025-04-04'),
    ('KIWI INNOVATIONS LIMITED',4166.0,2000000.0,'2025-06-30'),
    ('Rishabh MITTAL',202.0,100000.0,'2025-04-04'),
    ('Anuroop ARORA',225.0,108000.0,'2025-06-30'),
    ('Bharath RAM',208.0,100000.0,'2025-06-30'),
    ('AEON INC',832.0,399360.0,'2025-07-22'),
    ('Julien MACHOT',18.0,8250.0,'2025-06-30'),
    ('ALTA ASSET FUND 3, A SUB-FUND OF ALTA ASSET FUND VCC',15690.0,7500000.0,'2025-10-23')
),
pos_upd as (
  update positions p
  set units=ps.units,cost_basis=ps.cost_basis,as_of_date=coalesce(ps.as_of_date,p.as_of_date)
  from (
    select i.id as investor_id,d.vehicle_id as vehicle_id,
           max(pi.units::numeric) as units,
           max(pi.cost_basis::numeric) as cost_basis,
           max(pi.as_of_date::date) as as_of_date
    from pos_input pi join (select name_key,min(id::text)::uuid as id from inv group by name_key) i on i.name_key=lower(trim(pi.investor_legal_name)) cross join deal d
    group by i.id,d.vehicle_id
  ) ps
  where p.investor_id=ps.investor_id and p.vehicle_id=ps.vehicle_id
  returning p.id
),
pos_ins as (
  insert into positions (investor_id,vehicle_id,units,cost_basis,as_of_date)
  select ps.investor_id,ps.vehicle_id,ps.units,ps.cost_basis,ps.as_of_date
  from (
    select i.id as investor_id,d.vehicle_id as vehicle_id,
           max(pi.units::numeric) as units,
           max(pi.cost_basis::numeric) as cost_basis,
           max(pi.as_of_date::date) as as_of_date
    from pos_input pi join (select name_key,min(id::text)::uuid as id from inv group by name_key) i on i.name_key=lower(trim(pi.investor_legal_name)) cross join deal d
    group by i.id,d.vehicle_id
  ) ps
  on conflict (investor_id,vehicle_id) do update
    set units=excluded.units,
        cost_basis=excluded.cost_basis,
        as_of_date=coalesce(excluded.as_of_date, positions.as_of_date)
  returning id
),
intro_input(intro_key,investor_legal_name,introducer_legal_name,introducer_contact_name,introducer_email,introducer_type,introduced_at,intro_status,dash_row) as (values
    ('VC206_INTRO_1','AAF D Boral Mstr SPV LLC, Ser III OpenAI','AEON INC','Demetrios Mallios','dimitris@aeon.vc','entity','2025-12-08','allocated','3'),
    ('VC206_INTRO_2','AI DIRECT OPPORTUNITIES FUND SCSP','Venture Spring','Gérald Avenel','gerald@venturespringvc.com','entity','2025-04-04','allocated','5'),
    ('VC206_INTRO_3','AI DIRECT OPPORTUNITIES FUND SCSP','Dimensional Advisors','Michel Guerriche','mg@claresco.fr','entity','2025-04-04','allocated','5'),
    ('VC206_INTRO_4','KIWI INNOVATIONS LIMITED','Bromley Capital Partners','Xiaoxiao Yin','xyin@bromleypartners.com','entity','2025-06-30','allocated','6'),
    ('VC206_INTRO_5','Rishabh MITTAL','Renaissance Bridge Capital LLC','Anushka Mathur','anushka@renbridgecap.com','entity','2025-04-04','allocated','7'),
    ('VC206_INTRO_6','Anuroop ARORA','Renaissance Bridge Capital LLC','Anushka Mathur','anushka@renbridgecap.com','entity','2025-06-30','allocated','8'),
    ('VC206_INTRO_7','Bharath RAM','Renaissance Bridge Capital LLC','Anushka Mathur','anushka@renbridgecap.com','entity','2025-06-30','allocated','9'),
    ('VC206_INTRO_8','AEON INC','Renaissance Bridge Capital LLC',NULL,NULL,'entity','2025-07-22','allocated','10'),
    ('VC206_INTRO_9','Jyotsna HEDGE','Mervyn Pereira',NULL,'mervyn.pereira@gmail.com','entity','2025-04-08','allocated','12'),
    ('VC206_INTRO_10','PUTHAN N.C. MENON AND/OR SOBHA MENON RAGHAVANNAIR','Mervyn Pereira',NULL,'mervyn.pereira@gmail.com','entity','2025-04-08','allocated','13'),
    ('VC206_INTRO_11','REDPOINT OMEGA V, L.P.','Visual Sectors','Elena Vysotskaia','elena@astraglobal.org','entity','2025-10-15','allocated','15'),
    ('VC206_INTRO_12','REDPOINT OMEGA V, L.P.','Astral Global Limited','Elena Vysotskaia','elena@astraglobal.org','entity','2025-10-15','allocated','15'),
    ('VC206_INTRO_13','REDPOINT OMEGA ASSOCIATES V, LLC','Visual Sectors','Elena Vysotskaia','elena@astraglobal.org','entity','2025-10-15','allocated','16'),
    ('VC206_INTRO_14','ALTA ASSET FUND 3, A SUB-FUND OF ALTA ASSET FUND VCC','Visual Sectors',NULL,NULL,'entity','2025-06-08','allocated','17')
),
intro_norm as (
  select distinct
    ii.introducer_legal_name,
    nullif(ii.introducer_contact_name,'') as introducer_contact_name,
    nullif(ii.introducer_email,'') as introducer_email,
    coalesce(ii.introducer_type,'entity') as introducer_type,
    lower(trim(ii.introducer_legal_name)) as intro_key
  from intro_input ii
),
intro_actor_upd as (
  update introducers x
  set email=coalesce(n.introducer_email,x.email),
      contact_name=coalesce(n.introducer_contact_name,x.contact_name),
      type=coalesce(n.introducer_type,x.type),
      display_name=coalesce(x.display_name,n.introducer_legal_name)
  from intro_norm n
  where lower(trim(x.legal_name))=n.intro_key
  returning x.id,x.legal_name
),
intro_actor_ins as (
  insert into introducers (legal_name,display_name,contact_name,email,type,status)
  select n.introducer_legal_name,n.introducer_legal_name,n.introducer_contact_name,n.introducer_email,n.introducer_type,'active'
  from intro_norm n
  where not exists (
    select 1 from introducers x
    where lower(trim(x.legal_name))=n.intro_key
  )
  returning id,legal_name
),
intro_actor as (
  select distinct x.id,x.legal_name,
    lower(trim(x.legal_name)) as intro_key
  from introducers x join intro_norm n
    on lower(trim(x.legal_name))=n.intro_key
  union
  select ia.id,ia.legal_name,lower(trim(ia.legal_name)) from intro_actor_ins ia
  union
  select iu.id,iu.legal_name,lower(trim(iu.legal_name)) from intro_actor_upd iu
),
intro_ins as (
  insert into introductions (introducer_id,prospect_investor_id,deal_id,status,introduced_at,notes)
  select ia.id,iv.id,d.id,ii.intro_status,ii.introduced_at::date,'VC2 migration row '||ii.dash_row
  from intro_input ii
  join (select intro_key,min(id::text)::uuid as id from intro_actor group by intro_key) ia on ia.intro_key=lower(trim(ii.introducer_legal_name))
  join (select lower(trim(legal_name)) as name_key, min(id::text)::uuid as id from investors group by 1) iv on iv.name_key=lower(trim(ii.investor_legal_name))
  cross join deal d
  where not exists (select 1 from introductions z where z.introducer_id=ia.id and z.prospect_investor_id=iv.id and z.deal_id=d.id)
  returning id,introducer_id,prospect_investor_id,deal_id
),
intro_ref as (
  select z.id as introduction_id,
         lower(trim(ia.legal_name)) as introducer_key,
         lower(trim(iv.legal_name)) as investor_key
  from introductions z
  join introducers ia on ia.id=z.introducer_id
  join investors iv on iv.id=z.prospect_investor_id
  cross join deal d
  where z.deal_id=d.id
),
comm_input(intro_key,investor_legal_name,introducer_legal_name,basis_type,rate_bps,base_amount,accrual_amount,currency,status,paid_at,tier_number,threshold_multiplier) as (values
    ('VC206_INTRO_1','AAF D Boral Mstr SPV LLC, Ser III OpenAI','AEON INC','invested_amount',500,1176400.0,58806.25,'USD','paid','2025-12-08',1,NULL),
    ('VC206_INTRO_1','AAF D Boral Mstr SPV LLC, Ser III OpenAI','AEON INC','spread',0,1176400.0,0.0,'USD','paid','2025-12-08',1,NULL),
    ('VC206_INTRO_1','AAF D Boral Mstr SPV LLC, Ser III OpenAI','AEON INC','performance_fee',0,1176400.0,0.0,'USD','paid','2025-12-08',1,NULL),
    ('VC206_INTRO_2','AI DIRECT OPPORTUNITIES FUND SCSP','Venture Spring','invested_amount',150,1581352.5,11860.14375,'USD','paid','2025-04-04',1,NULL),
    ('VC206_INTRO_2','AI DIRECT OPPORTUNITIES FUND SCSP','Venture Spring','spread',0,1581352.5,0.0,'USD','paid','2025-04-04',1,NULL),
    ('VC206_INTRO_2','AI DIRECT OPPORTUNITIES FUND SCSP','Venture Spring','performance_fee',0,1581352.5,0.0,'USD','paid','2025-04-04',1,NULL),
    ('VC206_INTRO_3','AI DIRECT OPPORTUNITIES FUND SCSP','Dimensional Advisors','invested_amount',150,1581352.5,11860.14375,'USD','paid','2025-04-04',1,NULL),
    ('VC206_INTRO_3','AI DIRECT OPPORTUNITIES FUND SCSP','Dimensional Advisors','spread',0,1581352.5,0.0,'USD','paid','2025-04-04',1,NULL),
    ('VC206_INTRO_3','AI DIRECT OPPORTUNITIES FUND SCSP','Dimensional Advisors','performance_fee',0,1581352.5,0.0,'USD','paid','2025-04-04',1,NULL),
    ('VC206_INTRO_4','KIWI INNOVATIONS LIMITED','Bromley Capital Partners','invested_amount',150,2000000.0,30000.0,'USD','paid','2025-06-30',1,NULL),
    ('VC206_INTRO_4','KIWI INNOVATIONS LIMITED','Bromley Capital Partners','spread',0,2000000.0,0.0,'USD','paid','2025-06-30',1,NULL),
    ('VC206_INTRO_4','KIWI INNOVATIONS LIMITED','Bromley Capital Partners','performance_fee',0,2000000.0,0.0,'USD','paid','2025-06-30',1,NULL),
    ('VC206_INTRO_5','Rishabh MITTAL','Renaissance Bridge Capital LLC','invested_amount',300,100000.0,3000.0,'USD','paid','2025-04-04',1,NULL),
    ('VC206_INTRO_5','Rishabh MITTAL','Renaissance Bridge Capital LLC','spread',0,100000.0,0.0,'USD','paid','2025-04-04',1,NULL),
    ('VC206_INTRO_5','Rishabh MITTAL','Renaissance Bridge Capital LLC','performance_fee',0,100000.0,0.0,'USD','paid','2025-04-04',1,NULL),
    ('VC206_INTRO_6','Anuroop ARORA','Renaissance Bridge Capital LLC','invested_amount',300,108000.0,3240.0,'USD','paid','2025-06-30',1,NULL),
    ('VC206_INTRO_6','Anuroop ARORA','Renaissance Bridge Capital LLC','spread',0,108000.0,0.0,'USD','paid','2025-06-30',1,NULL),
    ('VC206_INTRO_6','Anuroop ARORA','Renaissance Bridge Capital LLC','performance_fee',0,108000.0,0.0,'USD','paid','2025-06-30',1,NULL),
    ('VC206_INTRO_7','Bharath RAM','Renaissance Bridge Capital LLC','invested_amount',300,100000.0,3000.0,'USD','paid','2025-06-30',1,NULL),
    ('VC206_INTRO_7','Bharath RAM','Renaissance Bridge Capital LLC','spread',0,100000.0,0.0,'USD','paid','2025-06-30',1,NULL),
    ('VC206_INTRO_7','Bharath RAM','Renaissance Bridge Capital LLC','performance_fee',0,100000.0,0.0,'USD','paid','2025-06-30',1,NULL),
    ('VC206_INTRO_8','AEON INC','Renaissance Bridge Capital LLC','invested_amount',0,399360.0,0.0,'USD','paid','2025-07-22',1,NULL),
    ('VC206_INTRO_8','AEON INC','Renaissance Bridge Capital LLC','spread',0,399360.0,0.0,'USD','paid','2025-07-22',1,NULL),
    ('VC206_INTRO_8','AEON INC','Renaissance Bridge Capital LLC','performance_fee',0,399360.0,0.0,'USD','paid','2025-07-22',1,NULL),
    ('VC206_INTRO_9','Jyotsna HEDGE','Mervyn Pereira','invested_amount',200,1000000.0,20000.0,'USD','paid','2025-04-08',1,NULL),
    ('VC206_INTRO_9','Jyotsna HEDGE','Mervyn Pereira','spread',0,1000000.0,0.0,'USD','paid','2025-04-08',1,NULL),
    ('VC206_INTRO_9','Jyotsna HEDGE','Mervyn Pereira','performance_fee',0,1000000.0,0.0,'USD','paid','2025-04-08',1,NULL),
    ('VC206_INTRO_10','PUTHAN N.C. MENON AND/OR SOBHA MENON RAGHAVANNAIR','Mervyn Pereira','invested_amount',200,5000000.0,100000.0,'USD','paid','2025-04-08',1,NULL),
    ('VC206_INTRO_10','PUTHAN N.C. MENON AND/OR SOBHA MENON RAGHAVANNAIR','Mervyn Pereira','spread',0,5000000.0,0.0,'USD','paid','2025-04-08',1,NULL),
    ('VC206_INTRO_10','PUTHAN N.C. MENON AND/OR SOBHA MENON RAGHAVANNAIR','Mervyn Pereira','performance_fee',0,5000000.0,0.0,'USD','paid','2025-04-08',1,NULL),
    ('VC206_INTRO_11','REDPOINT OMEGA V, L.P.','Visual Sectors','invested_amount',233,7396512.78,86000.0,'USD','paid','2025-10-15',1,NULL),
    ('VC206_INTRO_11','REDPOINT OMEGA V, L.P.','Visual Sectors','spread',0,7396512.78,0.0,'USD','paid','2025-10-15',1,NULL),
    ('VC206_INTRO_11','REDPOINT OMEGA V, L.P.','Visual Sectors','performance_fee',0,7396512.78,0.0,'USD','paid','2025-10-15',1,NULL),
    ('VC206_INTRO_12','REDPOINT OMEGA V, L.P.','Astral Global Limited','invested_amount',233,7396512.78,86000.0,'USD','paid','2025-10-15',1,NULL),
    ('VC206_INTRO_12','REDPOINT OMEGA V, L.P.','Astral Global Limited','spread',0,7396512.78,0.0,'USD','paid','2025-10-15',1,NULL),
    ('VC206_INTRO_12','REDPOINT OMEGA V, L.P.','Astral Global Limited','performance_fee',0,7396512.78,0.0,'USD','paid','2025-10-15',1,NULL),
    ('VC206_INTRO_13','REDPOINT OMEGA ASSOCIATES V, LLC','Visual Sectors','invested_amount',3123,192117.22,60000.0,'USD','paid','2025-10-15',1,NULL),
    ('VC206_INTRO_13','REDPOINT OMEGA ASSOCIATES V, LLC','Visual Sectors','spread',0,192117.22,0.0,'USD','paid','2025-10-15',1,NULL),
    ('VC206_INTRO_13','REDPOINT OMEGA ASSOCIATES V, LLC','Visual Sectors','performance_fee',0,192117.22,0.0,'USD','paid','2025-10-15',1,NULL),
    ('VC206_INTRO_14','ALTA ASSET FUND 3, A SUB-FUND OF ALTA ASSET FUND VCC','Visual Sectors','invested_amount',0,6000000.0,0.0,'USD','paid','2025-06-08',1,NULL),
    ('VC206_INTRO_14','ALTA ASSET FUND 3, A SUB-FUND OF ALTA ASSET FUND VCC','Visual Sectors','spread',0,6000000.0,0.0,'USD','paid','2025-06-08',1,NULL),
    ('VC206_INTRO_14','ALTA ASSET FUND 3, A SUB-FUND OF ALTA ASSET FUND VCC','Visual Sectors','performance_fee',0,6000000.0,0.0,'USD','paid','2025-06-08',1,NULL)
),
comm_ins as (
  insert into introducer_commissions (introducer_id,deal_id,investor_id,basis_type,rate_bps,base_amount,accrual_amount,currency,status,paid_at,introduction_id,tier_number,threshold_multiplier)
  select ia.id,d.id,iv.id,ci.basis_type,ci.rate_bps::int,ci.base_amount::numeric,ci.accrual_amount::numeric,ci.currency,ci.status,ci.paid_at::date,ir.introduction_id,ci.tier_number::int,ci.threshold_multiplier::numeric
  from comm_input ci
  join (select intro_key,min(id::text)::uuid as id from intro_actor group by intro_key) ia on ia.intro_key=lower(trim(ci.introducer_legal_name))
  join (select lower(trim(legal_name)) as name_key, min(id::text)::uuid as id from investors group by 1) iv on iv.name_key=lower(trim(ci.investor_legal_name))
  join intro_ref ir on ir.introducer_key=lower(trim(ci.introducer_legal_name)) and ir.investor_key=lower(trim(ci.investor_legal_name))
  cross join deal d
  where not exists (
    select 1 from introducer_commissions x
    where x.introducer_id=ia.id and x.deal_id=d.id and x.investor_id=iv.id
      and x.basis_type=ci.basis_type and coalesce(x.tier_number,0)=coalesce(ci.tier_number::int,0)
      and coalesce(x.accrual_amount,0)=coalesce(ci.accrual_amount::numeric,0)
      and coalesce(x.rate_bps,0)=coalesce(ci.rate_bps::int,0)
  )
  returning id
)
SELECT 1;
COMMIT;
