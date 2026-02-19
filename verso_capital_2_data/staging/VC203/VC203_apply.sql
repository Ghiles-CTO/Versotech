-- Auto-generated migration for VC203
BEGIN;
WITH
veh as (select id,name,currency from vehicles where entity_code='VC203'),
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
    ('AGP Alternative Investment QP','entity','Zachary GRODKO','ZGrodko@allianceg.com',704509.0,'USD','funded',704509.0,34.34,37.0,19040.0,19040.0,'2025-01-31',2.66,50646.4,0.03,21135.27,0.0,0.0,0.83217,15844.55,0.2,NULL,NULL,NULL,0.02,'XAI','SERIES C','3'),
    ('DOMINARI SECURITIES LLC','entity','Christopher SCHIAVELLO','cschiavello@dominarisecurities.com',2500000.0,'USD','funded',2500000.0,34.34,45.0,55555.0,55555.0,'2025-12-02',10.66,592216.3,0.0,0.0,0.0,0.0,0.83217,46231.31,0.0,NULL,NULL,NULL,0.0,'XAI','SERIES C','4'),
    ('Georges SMITH','individual','-','Smith.GRS@outlook.com',10000.0,'USD','funded',10000.0,34.34,40.0,250.0,250.0,'2025-12-02',5.66,1415.0,0.03,300.0,0.0,0.0,0.83217,208.04,0.0,NULL,NULL,NULL,0.0,'XAI','SERIES C','5'),
    ('Julien MACHOT','individual','-','jmachot@versoholdings.com',50000.0,'USD','funded',50000.0,34.34,40.0,1250.0,1250.0,'2025-12-02',5.66,7075.0,0.03,1500.0,0.0,0.0,0.83217,1040.21,0.0,NULL,NULL,NULL,0.0,'XAI','SERIES C','6'),
    ('Nicholas FOWLER','individual','-','nick.j.fowler@hotmail.co.uk',10000.0,'USD','funded',10000.0,34.34,40.0,250.0,250.0,'2025-12-02',5.66,1415.0,0.03,300.0,0.0,0.0,0.83217,208.04,0.0,NULL,NULL,NULL,0.0,'XAI','SERIES C','7'),
    ('Sebastian LATTUGA','individual','-','slattuga@gmail.com',500000.0,'USD','funded',500000.0,34.34,38.11,13119.0,13119.0,'2025-02-22',3.77,49458.63,0.0,0.0,0.0,0.0,0.83217,10917.26,0.1,NULL,NULL,NULL,0.01,'XAI','SERIES C','8'),
    ('EVERLASTING HOLDINGS LLC','entity','Qi YANG','sunvalleyimportant@yahoo.com',1000000.0,'USD','funded',1000000.0,34.34,37.5,26666.0,26666.0,'2025-03-13',3.16,84264.56,0.0,0.0,0.0,0.0,0.83217,22190.7,0.0,NULL,NULL,NULL,0.0,'XAI','SERIES C','9'),
    ('Tobias ENSELE','individual','-','tensele@gmail.com',1000000.0,'USD','funded',1000000.0,34.34,41.5,24096.0,24096.0,'2025-03-25',7.16,172527.36,0.0,0.0,0.0,0.0,0.83217,20052.01,0.0,NULL,NULL,NULL,0.0,'XAI','SERIES B','10'),
    ('PEGASUS TECH VENTURES COMPANY VIII, L.P.','entity','Michael FARACE','michael@pegasusventures.com',1500000.0,'USD','funded',1500000.0,34.34,37.5,40000.0,40000.0,'2025-11-03',3.16,126400.0,0.0,0.0,0.0,0.0,0.83217,33286.88,0.0,NULL,NULL,NULL,0.0,'XAI','SERIES B','11'),
    ('INS NEVADA LLC','entity','Olga GALANTER','oig@subrosa.law',1000000.0,'USD','funded',1000000.0,34.34,38.0,26315.0,26315.0,'2025-03-15',3.66,96312.9,0.0,0.0,0.0,0.0,0.83217,21898.6,0.0,NULL,NULL,NULL,0.0,'XAI','SERIES B','12'),
    ('INCRED GLOBAL WEALTH PTE LTD','entity','Siraj ALI','siraj.ali@incredwealth.sg',1000000.0,'USD','funded',1000000.0,34.34,41.5,24096.0,24096.0,'2025-03-25',7.16,172527.36,0.0,0.0,0.0,0.0,0.83217,20052.01,0.0,NULL,NULL,NULL,0.0,'XAI','SERIES B','13'),
    ('Julien MACHOT','individual','-','jmachot@versoholdings.com',207225.98,'USD','funded',207225.98,34.34,41.62,4979.0,4979.0,'2025-03-25',7.28,36247.12,0.0,0.0,0.0,0.0,0.61513,3062.73,0.0,NULL,NULL,NULL,0.0,'XAI','SERIES B','14'),
    ('MAVAN TECH INTELLIGENCE LIMITED PARTNERSHIP','entity','Laine NEVISON','laine@mavancapital.com',2600000.0,'USD','funded',2600000.0,34.34,36.5,71232.0,71232.0,'2025-03-28',2.16,153861.12,0.02,52000.0,0.0,0.0,0.63541,45261.21,0.0,NULL,NULL,NULL,0.0,'XAI','SERIES B','15'),
    ('AGP Alternative Investment QP','entity','Zachary GRODKO','ZGrodko@allianceg.com',9195433.9,'USD','funded',9195433.9,34.34,43.43,211730.0,211730.0,'2025-11-04',9.09,1924625.7,0.0,0.0,0.0,0.0,0.615,130213.95,0.0,NULL,NULL,NULL,0.0,'XAI','SERIES B','16'),
    ('AGP Alternative Investment Fund VI- Series 2','entity','Zachary GRODKO','ZGrodko@allianceg.com',1642609.46,'USD','funded',1642609.46,34.34,43.43,37822.0,37822.0,'2025-11-04',9.09,343801.98,0.0,0.0,0.0,0.0,0.615,23260.53,0.0,NULL,NULL,NULL,0.0,'XAI','SERIES B','17'),
    ('AGP Alternative Investment QF','entity','Zachary GRODKO','ZGrodko@allianceg.com',356169.43,'USD','funded',356169.43,36.56,43.43,8201.0,8201.0,'2025-05-09',6.87,56340.87,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'XAI','SERIES B (MACQUARIE)','18'),
    ('AGP Alternative Investment Fund VI- Series 2','entity','Zachary GRODKO','ZGrodko@allianceg.com',1842691.47,'USD','funded',1842691.47,36.56,43.43,42429.0,42429.0,'2025-11-04',6.87,291487.23,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'XAI','SERIES B (MACQUARIE)','19'),
    ('AEON INC','entity','Demetrios MALLIOS','dmallios@aeon.vc',417870.0,'USD','funded',417870.0,34.34,45.0,9286.0,9286.0,'2025-10-05',10.66,98988.76,0.0,0.0,0.0,0.0,0.615,1366.53,0.0,NULL,NULL,NULL,0.0,'XAI','SERIES B','20'),
    ('Robert VOGT IV','individual','-','rvogti@gmail.com',100000.0,'USD','funded',100000.0,34.34,45.0,2222.0,2222.0,'2025-04-15',10.66,23686.52,0.0,0.0,0.0,0.0,0.615,5710.89,0.0,NULL,NULL,NULL,0.0,'XAI','SERIES B','21')
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
    ('AGP Alternative Investment QP',230770.0,9899942.9,'2025-11-04'),
    ('DOMINARI SECURITIES LLC',55555.0,2500000.0,'2025-12-02'),
    ('Georges SMITH',250.0,10000.0,'2025-12-02'),
    ('Julien MACHOT',6229.0,257225.98,'2025-12-02'),
    ('Nicholas FOWLER',250.0,10000.0,'2025-12-02'),
    ('Sebastian LATTUGA',13119.0,500000.0,'2025-02-22'),
    ('EVERLASTING HOLDINGS LLC',26666.0,1000000.0,'2025-03-13'),
    ('Tobias ENSELE',24096.0,1000000.0,'2025-03-25'),
    ('PEGASUS TECH VENTURES COMPANY VIII, L.P.',40000.0,1500000.0,'2025-11-03'),
    ('INS NEVADA LLC',26315.0,1000000.0,'2025-03-15'),
    ('INCRED GLOBAL WEALTH PTE LTD',24096.0,1000000.0,'2025-03-25'),
    ('MAVAN TECH INTELLIGENCE LIMITED PARTNERSHIP',71232.0,2600000.0,'2025-03-28'),
    ('AGP Alternative Investment Fund VI- Series 2',80251.0,3485300.93,'2025-11-04'),
    ('AGP Alternative Investment QF',8201.0,356169.43,'2025-05-09'),
    ('AEON INC',9286.0,417870.0,'2025-10-05'),
    ('Robert VOGT IV',2222.0,100000.0,'2025-04-15')
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
    ('VC203_INTRO_1','AGP Alternative Investment QP','Alliance Global Partners LLC','Dave Tillman','dave@headwallpm.com','entity','2025-01-31','allocated','3'),
    ('VC203_INTRO_2','DOMINARI SECURITIES LLC','Dimensional Advisors','Michel Guerriche','mg@claresco.fr','entity','2025-12-02','allocated','4'),
    ('VC203_INTRO_3','DOMINARI SECURITIES LLC','R. F. Lafferty & Co. Inc.','Joseph Gelet','jgelet@vccross.com','entity','2025-12-02','allocated','4'),
    ('VC203_INTRO_4','Sebastian LATTUGA','R. F. Lafferty & Co. Inc.','Joseph Gelet','jgelet@vccross.com','entity','2025-02-22','allocated','8'),
    ('VC203_INTRO_5','EVERLASTING HOLDINGS LLC','Sakal Advisory, LLC','Kris BORTNOVSKY','krisbort@icloud.com','entity','2025-03-13','allocated','9'),
    ('VC203_INTRO_6','EVERLASTING HOLDINGS LLC','Astral Global Limited','Elena Vysotskaia','elena@astraglobal.org','entity','2025-03-13','allocated','9'),
    ('VC203_INTRO_7','Tobias ENSELE','Old City Securities LLC','Christine Healey','christine@healeypreipo.com','entity','2025-03-25','allocated','10'),
    ('VC203_INTRO_8','Tobias ENSELE','Renaissance bridge Capital LLC','Anushka Mathur','anushka@renbridgecap.com','entity','2025-03-25','allocated','10'),
    ('VC203_INTRO_9','PEGASUS TECH VENTURES COMPANY VIII, L.P.','Astral Global Limited','Elena Vysotskaia','elena@astraglobal.org','entity','2025-11-03','allocated','11'),
    ('VC203_INTRO_10','INS NEVADA LLC','Rainmaker Securities','Brendan Breen','bbreen@rainmakersecurities.com','entity','2025-03-15','allocated','12'),
    ('VC203_INTRO_11','INCRED GLOBAL WEALTH PTE LTD','Renaissance Bridge Capital LLC','Anushka Mathur','anushka@renbridgecap.com','entity','2025-03-25','allocated','13'),
    ('VC203_INTRO_12','INCRED GLOBAL WEALTH PTE LTD','Old City Securities LLC','Christine Healey','christine@healeypreipo.com','entity','2025-03-25','allocated','13'),
    ('VC203_INTRO_13','Julien MACHOT','Old City Securities LLC',NULL,NULL,'entity','2025-03-25','allocated','14'),
    ('VC203_INTRO_14','Julien MACHOT','Renaissance bridge Capital LLC',NULL,NULL,'entity','2025-03-25','allocated','14'),
    ('VC203_INTRO_15','MAVAN TECH INTELLIGENCE LIMITED PARTNERSHIP','Renaissance Bridge Capital LLC','Anushka Mathur','anushka@renbridgecap.com','entity','2025-03-28','allocated','15'),
    ('VC203_INTRO_16','MAVAN TECH INTELLIGENCE LIMITED PARTNERSHIP','Oliver Little',NULL,'olivernjlittle@gmail.com','entity','2025-03-28','allocated','15'),
    ('VC203_INTRO_17','AGP Alternative Investment Fund VI- Series 2','Alliance Global Partners LLC','Dave Tillman','dave@headwallpm.com','entity','2025-11-04','allocated','17'),
    ('VC203_INTRO_18','AGP Alternative Investment QF','Alliance Global Partners LLC','Dave Tillman','dave@headwallpm.com','entity','2025-05-09','allocated','18'),
    ('VC203_INTRO_19','AEON INC','Alliance Global Partners LLC',NULL,NULL,'entity','2025-10-05','allocated','20'),
    ('VC203_INTRO_20','Robert VOGT IV','Alliance Global Partners LLC',NULL,NULL,'entity','2025-04-15','allocated','21')
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
    ('VC203_INTRO_1','AGP Alternative Investment QP','Alliance Global Partners LLC','invested_amount',0,704509.0,0.0,'USD','paid','2025-01-31',1,NULL),
    ('VC203_INTRO_1','AGP Alternative Investment QP','Alliance Global Partners LLC','spread',0,9899942.9,0.0,'USD','paid','2025-01-31',1,NULL),
    ('VC203_INTRO_1','AGP Alternative Investment QP','Alliance Global Partners LLC','performance_fee',0,9899942.9,0.0,'USD','paid','2025-01-31',1,NULL),
    ('VC203_INTRO_1','AGP Alternative Investment QP','Alliance Global Partners LLC','invested_amount',100,9195433.9,91954.339,'USD','paid','2025-01-31',1,NULL),
    ('VC203_INTRO_2','DOMINARI SECURITIES LLC','Dimensional Advisors','invested_amount',384,2500000.0,48055.075,'USD','paid','2025-12-02',1,NULL),
    ('VC203_INTRO_2','DOMINARI SECURITIES LLC','Dimensional Advisors','spread',0,2500000.0,0.0,'USD','paid','2025-12-02',1,NULL),
    ('VC203_INTRO_2','DOMINARI SECURITIES LLC','Dimensional Advisors','performance_fee',0,2500000.0,0.0,'USD','paid','2025-12-02',1,NULL),
    ('VC203_INTRO_3','DOMINARI SECURITIES LLC','R. F. Lafferty & Co. Inc.','invested_amount',384,2500000.0,48055.075,'USD','paid','2025-12-02',1,NULL),
    ('VC203_INTRO_3','DOMINARI SECURITIES LLC','R. F. Lafferty & Co. Inc.','spread',0,2500000.0,0.0,'USD','paid','2025-12-02',1,NULL),
    ('VC203_INTRO_3','DOMINARI SECURITIES LLC','R. F. Lafferty & Co. Inc.','performance_fee',0,2500000.0,0.0,'USD','paid','2025-12-02',1,NULL),
    ('VC203_INTRO_4','Sebastian LATTUGA','R. F. Lafferty & Co. Inc.','invested_amount',291,500000.0,14563.11,'USD','paid','2025-02-22',1,NULL),
    ('VC203_INTRO_4','Sebastian LATTUGA','R. F. Lafferty & Co. Inc.','spread',0,500000.0,0.0,'USD','paid','2025-02-22',1,NULL),
    ('VC203_INTRO_4','Sebastian LATTUGA','R. F. Lafferty & Co. Inc.','performance_fee',0,500000.0,0.0,'USD','paid','2025-02-22',1,NULL),
    ('VC203_INTRO_5','EVERLASTING HOLDINGS LLC','Sakal Advisory, LLC','invested_amount',150,1000000.0,7500.0,'USD','paid','2025-03-13',1,NULL),
    ('VC203_INTRO_5','EVERLASTING HOLDINGS LLC','Sakal Advisory, LLC','spread',0,1000000.0,0.0,'USD','paid','2025-03-13',1,NULL),
    ('VC203_INTRO_5','EVERLASTING HOLDINGS LLC','Sakal Advisory, LLC','performance_fee',0,1000000.0,0.0,'USD','paid','2025-03-13',1,NULL),
    ('VC203_INTRO_6','EVERLASTING HOLDINGS LLC','Astral Global Limited','invested_amount',150,1000000.0,7500.0,'USD','paid','2025-03-13',1,NULL),
    ('VC203_INTRO_6','EVERLASTING HOLDINGS LLC','Astral Global Limited','spread',0,1000000.0,0.0,'USD','paid','2025-03-13',1,NULL),
    ('VC203_INTRO_6','EVERLASTING HOLDINGS LLC','Astral Global Limited','performance_fee',0,1000000.0,0.0,'USD','paid','2025-03-13',1,NULL),
    ('VC203_INTRO_7','Tobias ENSELE','Old City Securities LLC','invested_amount',525,1000000.0,26250.0,'USD','paid','2025-03-25',1,NULL),
    ('VC203_INTRO_7','Tobias ENSELE','Old City Securities LLC','spread',0,1000000.0,0.0,'USD','paid','2025-03-25',1,NULL),
    ('VC203_INTRO_7','Tobias ENSELE','Old City Securities LLC','performance_fee',0,1000000.0,0.0,'USD','paid','2025-03-25',1,NULL),
    ('VC203_INTRO_8','Tobias ENSELE','Renaissance bridge Capital LLC','invested_amount',525,1000000.0,26250.0,'USD','paid','2025-03-25',1,NULL),
    ('VC203_INTRO_8','Tobias ENSELE','Renaissance bridge Capital LLC','spread',0,1000000.0,0.0,'USD','paid','2025-03-25',1,NULL),
    ('VC203_INTRO_8','Tobias ENSELE','Renaissance bridge Capital LLC','performance_fee',0,1000000.0,0.0,'USD','paid','2025-03-25',1,NULL),
    ('VC203_INTRO_9','PEGASUS TECH VENTURES COMPANY VIII, L.P.','Astral Global Limited','invested_amount',100,1500000.0,15000.0,'USD','paid','2025-11-03',1,NULL),
    ('VC203_INTRO_9','PEGASUS TECH VENTURES COMPANY VIII, L.P.','Astral Global Limited','spread',0,1500000.0,0.0,'USD','paid','2025-11-03',1,NULL),
    ('VC203_INTRO_9','PEGASUS TECH VENTURES COMPANY VIII, L.P.','Astral Global Limited','performance_fee',0,1500000.0,0.0,'USD','paid','2025-11-03',1,NULL),
    ('VC203_INTRO_10','INS NEVADA LLC','Rainmaker Securities','invested_amount',250,1000000.0,25000.0,'USD','paid','2025-03-15',1,NULL),
    ('VC203_INTRO_10','INS NEVADA LLC','Rainmaker Securities','spread',0,1000000.0,0.0,'USD','paid','2025-03-15',1,NULL),
    ('VC203_INTRO_10','INS NEVADA LLC','Rainmaker Securities','performance_fee',0,1000000.0,0.0,'USD','paid','2025-03-15',1,NULL),
    ('VC203_INTRO_11','INCRED GLOBAL WEALTH PTE LTD','Renaissance Bridge Capital LLC','invested_amount',525,1000000.0,26250.0,'USD','paid','2025-03-25',1,NULL),
    ('VC203_INTRO_11','INCRED GLOBAL WEALTH PTE LTD','Renaissance Bridge Capital LLC','spread',0,1000000.0,0.0,'USD','paid','2025-03-25',1,NULL),
    ('VC203_INTRO_11','INCRED GLOBAL WEALTH PTE LTD','Renaissance Bridge Capital LLC','performance_fee',0,1000000.0,0.0,'USD','paid','2025-03-25',1,NULL),
    ('VC203_INTRO_12','INCRED GLOBAL WEALTH PTE LTD','Old City Securities LLC','invested_amount',525,1000000.0,26250.0,'USD','paid','2025-03-25',1,NULL),
    ('VC203_INTRO_12','INCRED GLOBAL WEALTH PTE LTD','Old City Securities LLC','spread',0,1000000.0,0.0,'USD','paid','2025-03-25',1,NULL),
    ('VC203_INTRO_12','INCRED GLOBAL WEALTH PTE LTD','Old City Securities LLC','performance_fee',0,1000000.0,0.0,'USD','paid','2025-03-25',1,NULL),
    ('VC203_INTRO_13','Julien MACHOT','Old City Securities LLC','invested_amount',0,207225.98,0.0,'USD','paid','2025-03-25',1,NULL),
    ('VC203_INTRO_13','Julien MACHOT','Old City Securities LLC','spread',0,207225.98,0.0,'USD','paid','2025-03-25',1,NULL),
    ('VC203_INTRO_13','Julien MACHOT','Old City Securities LLC','performance_fee',0,207225.98,0.0,'USD','paid','2025-03-25',1,NULL),
    ('VC203_INTRO_14','Julien MACHOT','Renaissance bridge Capital LLC','invested_amount',0,207225.98,0.0,'USD','paid','2025-03-25',1,NULL),
    ('VC203_INTRO_14','Julien MACHOT','Renaissance bridge Capital LLC','spread',0,207225.98,0.0,'USD','paid','2025-03-25',1,NULL),
    ('VC203_INTRO_14','Julien MACHOT','Renaissance bridge Capital LLC','performance_fee',0,207225.98,0.0,'USD','paid','2025-03-25',1,NULL),
    ('VC203_INTRO_15','MAVAN TECH INTELLIGENCE LIMITED PARTNERSHIP','Renaissance Bridge Capital LLC','invested_amount',192,2600000.0,25000.0,'USD','paid','2025-03-28',1,NULL),
    ('VC203_INTRO_15','MAVAN TECH INTELLIGENCE LIMITED PARTNERSHIP','Renaissance Bridge Capital LLC','spread',0,2600000.0,0.0,'USD','paid','2025-03-28',1,NULL),
    ('VC203_INTRO_15','MAVAN TECH INTELLIGENCE LIMITED PARTNERSHIP','Renaissance Bridge Capital LLC','performance_fee',0,2600000.0,0.0,'USD','paid','2025-03-28',1,NULL),
    ('VC203_INTRO_16','MAVAN TECH INTELLIGENCE LIMITED PARTNERSHIP','Oliver Little','invested_amount',192,2600000.0,25000.0,'USD','paid','2025-03-28',1,NULL),
    ('VC203_INTRO_16','MAVAN TECH INTELLIGENCE LIMITED PARTNERSHIP','Oliver Little','spread',0,2600000.0,0.0,'USD','paid','2025-03-28',1,NULL),
    ('VC203_INTRO_16','MAVAN TECH INTELLIGENCE LIMITED PARTNERSHIP','Oliver Little','performance_fee',0,2600000.0,0.0,'USD','paid','2025-03-28',1,NULL),
    ('VC203_INTRO_17','AGP Alternative Investment Fund VI- Series 2','Alliance Global Partners LLC','invested_amount',100,6970601.86,34853.0093,'USD','paid','2025-11-04',1,NULL),
    ('VC203_INTRO_17','AGP Alternative Investment Fund VI- Series 2','Alliance Global Partners LLC','spread',0,6970601.86,0.0,'USD','paid','2025-11-04',1,NULL),
    ('VC203_INTRO_17','AGP Alternative Investment Fund VI- Series 2','Alliance Global Partners LLC','performance_fee',0,6970601.86,0.0,'USD','paid','2025-11-04',1,NULL),
    ('VC203_INTRO_18','AGP Alternative Investment QF','Alliance Global Partners LLC','invested_amount',100,356169.43,3561.6943,'USD','paid','2025-05-09',1,NULL),
    ('VC203_INTRO_18','AGP Alternative Investment QF','Alliance Global Partners LLC','spread',0,356169.43,0.0,'USD','paid','2025-05-09',1,NULL),
    ('VC203_INTRO_18','AGP Alternative Investment QF','Alliance Global Partners LLC','performance_fee',0,356169.43,0.0,'USD','paid','2025-05-09',1,NULL),
    ('VC203_INTRO_19','AEON INC','Alliance Global Partners LLC','invested_amount',0,417870.0,0.0,'USD','paid','2025-10-05',1,NULL),
    ('VC203_INTRO_19','AEON INC','Alliance Global Partners LLC','spread',0,417870.0,0.0,'USD','paid','2025-10-05',1,NULL),
    ('VC203_INTRO_19','AEON INC','Alliance Global Partners LLC','performance_fee',0,417870.0,0.0,'USD','paid','2025-10-05',1,NULL),
    ('VC203_INTRO_20','Robert VOGT IV','Alliance Global Partners LLC','invested_amount',0,100000.0,0.0,'USD','paid','2025-04-15',1,NULL),
    ('VC203_INTRO_20','Robert VOGT IV','Alliance Global Partners LLC','spread',0,100000.0,0.0,'USD','paid','2025-04-15',1,NULL),
    ('VC203_INTRO_20','Robert VOGT IV','Alliance Global Partners LLC','performance_fee',0,100000.0,0.0,'USD','paid','2025-04-15',1,NULL)
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
