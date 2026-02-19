-- Auto-generated migration for VC209
BEGIN;
WITH
veh as (select id,name,currency from vehicles where entity_code='VC209'),
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
    ('SINO SUISSE LLC','entity','Yan FANG','lucky@beyondfo.cn',960000.0,'USD','funded',960000.0,35.0,40.0,24000.0,24000.0,'2025-07-14',5.0,120000.0,0.04,38400.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'X.AI','MNH ACCESS FUND','3'),
    ('AEON INC','entity','Demetrios MALLIOS','dmallios@aeon.vc',1588217.0,'USD','funded',1588217.0,35.0,41.0,38737.0,38737.0,'2025-08-20',6.0,232422.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'X.AI','MNH ACCESS FUND','4'),
    ('Georgi GEORGIEV','individual','-','Georgiev.georgio@gmail.com',3000000.0,'USD','funded',3000000.0,35.0,43.0,69767.0,69767.0,'2025-08-25',8.0,558136.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'X.AI','MNH ACCESS FUND','5'),
    ('JRF INVESTMENTS DMCC','entity','Roland Yakovlevich ISAEV','jacobisaev.wrk@gmail.com',1460000.0,'USD','funded',1460000.0,35.0,40.0,36500.0,36500.0,'2025-08-25',5.0,182500.0,0.02,29200.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'X.AI','MNH ACCESS FUND','6'),
    ('D. BORAL MASTER SPV, SERIES IV XAI','entity','Demetrios MALLIOS','dmallios@aeon.vc',2034626.0,'USD','funded',2034626.0,35.0,43.5,46773.0,46773.0,'2025-12-09',8.5,397570.5,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'X.AI','MNH ACCESS FUND','7'),
    ('U.S. HMC SERIES FUND LP - SERIES II','entity','George Guoying CHEN','george.chen@us.homaer.com',2700012.0,'USD','funded',2700012.0,36.55983,42.0,64286.0,64286.0,'2025-09-26',5.44017,349726.7686,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'X.AI','MNH ACCESS FUND','8'),
    ('Seri Cosmos Capital Limited','entity','Ong XUANFENG','xuanfeng.ong@twotreescapital.biz',333333.0,'USD','funded',333333.0,35.0,50.0,6666.0,6666.0,'2025-10-14',15.0,99990.0,0.02,6666.66,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'X.AI','MNH ACCESS FUND','9'),
    ('CBH Compagnie Bancaire Helvétique SA','entity','Alexandre SALAOUI','ASalaoui@cbhbank.com',3452484.0,'USD','funded',3452484.0,35.0,42.0,82202.0,82202.0,'2025-09-26',7.0,575414.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'X.AI','MNH ACCESS FUND','10'),
    ('Jamel CHANDOUL','individual','-','jchandoul@yahoo.com',300000.0,'USD','funded',300000.0,35.0001,45.0,6666.0,6666.0,'2025-09-25',9.9999,66659.3334,0.02,6000.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'X.AI','MNH ACCESS FUND','11'),
    ('BRIGHT VIEWS HOLDINGS','entity','Frederic DEMARGNE','freddemargne@yahoo.fr/ fdemargne@versoholdings.com',9000.0,'USD','funded',9000.0,35.0001,40.0,225.0,225.0,'2025-09-26',4.9999,1124.9775,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'X.AI','MNH ACCESS FUND','12'),
    ('STP CAP V, A SERIES OF CGF2021 LLC, SYDECAR LLC','entity','Sanjay MUPPANENI','smuppane@gmail.com',1978500.0,'USD','funded',1978500.0,35.0001,42.1225,46970.0,46970.0,'2025-09-23',7.1224,334539.128,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'X.AI','MNH ACCESS FUND','13'),
    ('SINO SUISSE LLC','entity','Yan FANG','lucky@beyondfo.cn',900000.0,'USD','funded',900000.0,35.0,50.0,18000.0,18000.0,'2025-10-10',15.0,270000.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'X.AI','MNH ACCESS FUND','14'),
    ('CBH Compagnie Bancaire Helvétique SA','entity','Alexandre SALAOUI','ASalaoui@cbhbank.com',99996.0,'USD','funded',99996.0,35.0,52.0,1923.0,1923.0,'2025-10-13',17.0,32691.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'X.AI','MNH ACCESS FUND','15'),
    ('MOBILITY INNOVATION FUND LLC','entity','Gordon WAN','gwan@saicusa.com',3000000.0,'USD','funded',3000000.0,43.0,48.5,61855.0,61855.0,'2025-10-27',5.5,340202.5,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'X.AI','MNH ACCESS FUND','16'),
    ('U.S. HMC SERIES FUND LP - SERIES II','entity','George Guoying CHEN','george.chen@us.homaer.com',3500016.0,'USD','funded',3500016.0,45.0,52.0,67308.0,67308.0,'2025-06-11',7.0,471156.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'X.AI','MNH ACCESS FUND','17'),
    ('MRS ANISHA BANSAL AND MR RAHUL KARKUN','individual','-','anisha.bansal@gmail.com',25000.0,'USD','funded',25000.0,35.0001,49.0,510.0,510.0,'2025-09-30',13.9999,7139.949,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'X.AI','MNH ACCESS FUND','18'),
    ('SPACEFARING VENTURES FUND 9, LLC','entity','Anish PHILIP','ir@spacefaring.ventures',266058.0,'USD','funded',266058.0,35.0,54.0,4927.0,4927.0,'2025-11-13',19.0,93613.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'X.AI','MNH ACCESS FUND','19'),
    ('PVPL FUND LLC SERIES 3','entity','Alexandra ZOTOVA','az@bcsventure.com',10000000.0,'USD','funded',10000000.0,44.0,55.0,181818.0,181818.0,'2025-10-11',11.0,1999998.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'X.AI','MNH ACCESS FUND','20'),
    ('PREAMBLE X CAPITAL I, A SERIES OF PREAMBLE X CAPITAL LLC','entity','Alex CHEUNG','alex@preamble.info',2727208.0,'USD','funded',2727208.0,35.0,68.0,40106.0,40106.0,'2025-01-12',33.0,1323498.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'X.AI','MNH ACCESS FUND','21'),
    ('Mohan SASANAPURI','individual','-','mohansasan@gmail.com',50000.0,'USD','funded',50000.0,35.0,77.0,649.0,649.0,'2025-11-12',42.0,27258.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'X.AI','MNH ACCESS FUND','22'),
    ('Kartik Kumar ATTULURI','individual','-','kartik_ms@outlook.com',100023.0,'USD','funded',100023.0,35.0,77.0,1299.0,1299.0,'2025-11-12',42.0,54558.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'X.AI','MNH ACCESS FUND','23'),
    ('Prabhakar Somana KONGANDA','individual',NULL,'somana@gmail.com',100023.0,'USD','funded',100023.0,35.0,77.0,1299.0,1299.0,'2025-12-16',42.0,54558.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'X.AI','MNH ACCESS FUND','24'),
    ('Julien MACHOT','individual','-','jmachot@versoholdings.com',40000.0,'USD','funded',40000.0,35.0,40.0,1000.0,1000.0,'2025-03-12',5.0,5000.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'X.AI','MNH ACCESS FUND','25'),
    ('MADISON TRUST COMPANY (on behalf of Edward Bendickson)','entity','Kurt POWER','kpower@madisontrust.com',150000.0,'USD','funded',150000.0,35.0,77.0,1948.0,1948.0,'2025-12-19',42.0,81816.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'X.AI','MNH ACCESS FUND','26'),
    ('FRONTIERX VIII, LP','entity','Alice ZHANG','alice.2023az@gmail.com',725400.0,'USD','funded',725400.0,35.0,78.0,9300.0,9300.0,'2025-12-29',43.0,399900.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'X.AI','MNH ACCESS FUND','27')
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
    ('SINO SUISSE LLC',42000.0,1860000.0,'2025-10-10'),
    ('AEON INC',38737.0,1588217.0,'2025-08-20'),
    ('Georgi GEORGIEV',69767.0,3000000.0,'2025-08-25'),
    ('JRF INVESTMENTS DMCC',36500.0,1460000.0,'2025-08-25'),
    ('D. BORAL MASTER SPV, SERIES IV XAI',46773.0,2034626.0,'2025-12-09'),
    ('U.S. HMC SERIES FUND LP - SERIES II',131594.0,6200028.0,'2025-09-26'),
    ('Seri Cosmos Capital Limited',6666.0,333333.0,'2025-10-14'),
    ('CBH Compagnie Bancaire Helvétique SA',84125.0,3552480.0,'2025-10-13'),
    ('Jamel CHANDOUL',6666.0,300000.0,'2025-09-25'),
    ('BRIGHT VIEWS HOLDINGS',225.0,9000.0,'2025-09-26'),
    ('STP CAP V, A SERIES OF CGF2021 LLC, SYDECAR LLC',46970.0,1978500.0,'2025-09-23'),
    ('MOBILITY INNOVATION FUND LLC',61855.0,3000000.0,'2025-10-27'),
    ('MRS ANISHA BANSAL AND MR RAHUL KARKUN',510.0,25000.0,'2025-09-30'),
    ('SPACEFARING VENTURES FUND 9, LLC',4927.0,266058.0,'2025-11-13'),
    ('PVPL FUND LLC SERIES 3',181818.0,10000000.0,'2025-10-11'),
    ('PREAMBLE X CAPITAL I, A SERIES OF PREAMBLE X CAPITAL LLC',40106.0,2727208.0,'2025-01-12'),
    ('Mohan SASANAPURI',649.0,50000.0,'2025-11-12'),
    ('Kartik Kumar ATTULURI',1299.0,100023.0,'2025-11-12'),
    ('Prabhakar Somana KONGANDA',1299.0,100023.0,'2025-12-16'),
    ('Julien MACHOT',1000.0,40000.0,'2025-03-12'),
    ('MADISON TRUST COMPANY (on behalf of Edward Bendickson)',1948.0,150000.0,'2025-12-19'),
    ('FRONTIERX VIII, LP',9300.0,725400.0,'2025-12-29')
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
    ('VC209_INTRO_1','SINO SUISSE LLC','Bromley Capital Partners','Xiaoxiao Yin','xyin@bromleypartners.com','entity','2025-07-14','allocated','3'),
    ('VC209_INTRO_2','AEON INC','Bromley Capital Partners',NULL,NULL,'entity','2025-08-20','allocated','4'),
    ('VC209_INTRO_3','Georgi GEORGIEV','Robin Doble',NULL,'rdoble@versoholdings.com','entity','2025-08-25','allocated','5'),
    ('VC209_INTRO_4','JRF INVESTMENTS DMCC','Renaissance Bridge Capital LLC','Anushka Mathur','anushka@renbridgecap.com','entity','2025-08-25','allocated','6'),
    ('VC209_INTRO_5','D. BORAL MASTER SPV, SERIES IV XAI','AEON INC','Demetrios Mallios','dimitris@aeon.vc','entity','2025-12-09','allocated','7'),
    ('VC209_INTRO_6','CBH Compagnie Bancaire Helvétique SA','R. F. Lafferty & Co. Inc.','Joseph Gelet','jgelet@vccross.com','entity','2025-09-26','allocated','10'),
    ('VC209_INTRO_7','Jamel CHANDOUL','Bright Views Holdings','Frederic Demargne','freddemargne@yahoo.fr/ fdemargne@versoholdings.com','entity','2025-09-25','allocated','11'),
    ('VC209_INTRO_8','BRIGHT VIEWS HOLDINGS','Bright Views Holdings',NULL,NULL,'entity','2025-09-26','allocated','12'),
    ('VC209_INTRO_9','STP CAP V, A SERIES OF CGF2021 LLC, SYDECAR LLC','R. F. Lafferty & Co. Inc.','Joseph Gelet','jgelet@vccross.com','entity','2025-09-23','allocated','13'),
    ('VC209_INTRO_10','STP CAP V, A SERIES OF CGF2021 LLC, SYDECAR LLC','Bright Views Holdings',NULL,NULL,'entity','2025-09-23','allocated','13'),
    ('VC209_INTRO_11','SINO SUISSE LLC','Bright Views Holdings',NULL,NULL,'entity','2025-10-10','allocated','14'),
    ('VC209_INTRO_12','CBH Compagnie Bancaire Helvétique SA','Bright Views Holdings',NULL,NULL,'entity','2025-10-13','allocated','15'),
    ('VC209_INTRO_13','MOBILITY INNOVATION FUND LLC','Jeffrey Wan',NULL,'gregw28@gmail.com','entity','2025-10-27','allocated','16'),
    ('VC209_INTRO_14','MOBILITY INNOVATION FUND LLC','Bright Views Holdings',NULL,NULL,'entity','2025-10-27','allocated','16'),
    ('VC209_INTRO_15','U.S. HMC SERIES FUND LP - SERIES II','Bright Views Holdings',NULL,NULL,'entity','2025-06-11','allocated','17'),
    ('VC209_INTRO_16','U.S. HMC SERIES FUND LP - SERIES II','Jeffrey Wan',NULL,NULL,'entity','2025-06-11','allocated','17'),
    ('VC209_INTRO_17','MRS ANISHA BANSAL AND MR RAHUL KARKUN','Bright Views Holdings',NULL,NULL,'entity','2025-09-30','allocated','18'),
    ('VC209_INTRO_18','MRS ANISHA BANSAL AND MR RAHUL KARKUN','Jeffrey Wan',NULL,NULL,'entity','2025-09-30','allocated','18'),
    ('VC209_INTRO_19','SPACEFARING VENTURES FUND 9, LLC','Bright Views Holdings',NULL,NULL,'entity','2025-11-13','allocated','19'),
    ('VC209_INTRO_20','SPACEFARING VENTURES FUND 9, LLC','Jeffrey Wan',NULL,NULL,'entity','2025-11-13','allocated','19'),
    ('VC209_INTRO_21','PVPL FUND LLC SERIES 3','R. F. Lafferty & Co. Inc.','Joseph Gelet','jgelet@vccross.com','entity','2025-10-11','allocated','20'),
    ('VC209_INTRO_22','PVPL FUND LLC SERIES 3','Visual Sectors','Elena Vysotskaia','elena@astraglobal.org','entity','2025-10-11','allocated','20'),
    ('VC209_INTRO_23','PVPL FUND LLC SERIES 3','Bright Views Holdings',NULL,NULL,'entity','2025-10-11','allocated','20'),
    ('VC209_INTRO_24','PREAMBLE X CAPITAL I, A SERIES OF PREAMBLE X CAPITAL LLC','Rubix Holdings Limited','Douglas Chow','doug@rubix.hk','entity','2025-01-12','allocated','21'),
    ('VC209_INTRO_25','PREAMBLE X CAPITAL I, A SERIES OF PREAMBLE X CAPITAL LLC','Bright Views Holdings',NULL,NULL,'entity','2025-01-12','allocated','21'),
    ('VC209_INTRO_26','Mohan SASANAPURI','Bright Views Holdings',NULL,NULL,'entity','2025-11-12','allocated','22'),
    ('VC209_INTRO_27','Mohan SASANAPURI','Rubix Holdings Limited',NULL,NULL,'entity','2025-11-12','allocated','22'),
    ('VC209_INTRO_28','Kartik Kumar ATTULURI','Bright Views Holdings',NULL,NULL,'entity','2025-11-12','allocated','23'),
    ('VC209_INTRO_29','Kartik Kumar ATTULURI','Rubix Holdings Limited',NULL,NULL,'entity','2025-11-12','allocated','23'),
    ('VC209_INTRO_30','Prabhakar Somana KONGANDA','Bright Views Holdings',NULL,NULL,'entity','2025-12-16','allocated','24'),
    ('VC209_INTRO_31','Prabhakar Somana KONGANDA','Rubix Holdings Limited',NULL,NULL,'entity','2025-12-16','allocated','24'),
    ('VC209_INTRO_32','Julien MACHOT','Bright Views Holdings',NULL,NULL,'entity','2025-03-12','allocated','25'),
    ('VC209_INTRO_33','Julien MACHOT','Rubix Holdings Limited',NULL,NULL,'entity','2025-03-12','allocated','25'),
    ('VC209_INTRO_34','MADISON TRUST COMPANY (on behalf of Edward Bendickson)','Bright Views Holdings',NULL,NULL,'entity','2025-12-19','allocated','26'),
    ('VC209_INTRO_35','MADISON TRUST COMPANY (on behalf of Edward Bendickson)','Rubix Holdings Limited',NULL,NULL,'entity','2025-12-19','allocated','26'),
    ('VC209_INTRO_36','FRONTIERX VIII, LP','Bright Views Holdings',NULL,NULL,'entity','2025-12-29','allocated','27'),
    ('VC209_INTRO_37','FRONTIERX VIII, LP','Rubix Holdings Limited',NULL,NULL,'entity','2025-12-29','allocated','27')
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
    ('VC209_INTRO_1','SINO SUISSE LLC','Bromley Capital Partners','invested_amount',196,960000.0,18849.42,'USD','paid','2025-07-14',1,NULL),
    ('VC209_INTRO_1','SINO SUISSE LLC','Bromley Capital Partners','spread',0,1860000.0,0.0,'USD','paid','2025-07-14',1,NULL),
    ('VC209_INTRO_1','SINO SUISSE LLC','Bromley Capital Partners','performance_fee',0,1860000.0,0.0,'USD','paid','2025-07-14',1,NULL),
    ('VC209_INTRO_1','SINO SUISSE LLC','Bromley Capital Partners','invested_amount',0,900000.0,0.0,'USD','paid','2025-07-14',1,NULL),
    ('VC209_INTRO_2','AEON INC','Bromley Capital Partners','invested_amount',0,1588217.0,0.0,'USD','paid','2025-08-20',1,NULL),
    ('VC209_INTRO_2','AEON INC','Bromley Capital Partners','spread',0,1588217.0,0.0,'USD','paid','2025-08-20',1,NULL),
    ('VC209_INTRO_2','AEON INC','Bromley Capital Partners','performance_fee',0,1588217.0,0.0,'USD','paid','2025-08-20',1,NULL),
    ('VC209_INTRO_3','Georgi GEORGIEV','Robin Doble','invested_amount',75,3000000.0,22500.0,'USD','paid','2025-08-25',1,NULL),
    ('VC209_INTRO_3','Georgi GEORGIEV','Robin Doble','spread',0,3000000.0,0.0,'USD','paid','2025-08-25',1,NULL),
    ('VC209_INTRO_3','Georgi GEORGIEV','Robin Doble','performance_fee',0,3000000.0,0.0,'USD','paid','2025-08-25',1,NULL),
    ('VC209_INTRO_4','JRF INVESTMENTS DMCC','Renaissance Bridge Capital LLC','invested_amount',200,1460000.0,29200.0,'USD','paid','2025-08-25',1,NULL),
    ('VC209_INTRO_4','JRF INVESTMENTS DMCC','Renaissance Bridge Capital LLC','spread',0,1460000.0,0.0,'USD','paid','2025-08-25',1,NULL),
    ('VC209_INTRO_4','JRF INVESTMENTS DMCC','Renaissance Bridge Capital LLC','performance_fee',0,1460000.0,0.0,'USD','paid','2025-08-25',1,NULL),
    ('VC209_INTRO_5','D. BORAL MASTER SPV, SERIES IV XAI','AEON INC','invested_amount',287,2034626.0,58466.25,'USD','paid','2025-12-09',1,NULL),
    ('VC209_INTRO_5','D. BORAL MASTER SPV, SERIES IV XAI','AEON INC','spread',0,2034626.0,0.0,'USD','paid','2025-12-09',1,NULL),
    ('VC209_INTRO_5','D. BORAL MASTER SPV, SERIES IV XAI','AEON INC','performance_fee',0,2034626.0,0.0,'USD','paid','2025-12-09',1,NULL),
    ('VC209_INTRO_6','CBH Compagnie Bancaire Helvétique SA','R. F. Lafferty & Co. Inc.','invested_amount',356,3452484.0,123003.0,'USD','paid','2025-09-26',1,NULL),
    ('VC209_INTRO_6','CBH Compagnie Bancaire Helvétique SA','R. F. Lafferty & Co. Inc.','spread',0,3552480.0,0.0,'USD','paid','2025-09-26',1,NULL),
    ('VC209_INTRO_6','CBH Compagnie Bancaire Helvétique SA','R. F. Lafferty & Co. Inc.','performance_fee',0,3552480.0,0.0,'USD','paid','2025-09-26',1,NULL),
    ('VC209_INTRO_6','CBH Compagnie Bancaire Helvétique SA','R. F. Lafferty & Co. Inc.','invested_amount',0,99996.0,0.0,'USD','paid','2025-09-26',1,NULL),
    ('VC209_INTRO_7','Jamel CHANDOUL','Bright Views Holdings','invested_amount',300,300000.0,9000.0,'USD','paid','2025-09-25',1,NULL),
    ('VC209_INTRO_7','Jamel CHANDOUL','Bright Views Holdings','spread',0,300000.0,0.0,'USD','paid','2025-09-25',1,NULL),
    ('VC209_INTRO_7','Jamel CHANDOUL','Bright Views Holdings','performance_fee',0,300000.0,0.0,'USD','paid','2025-09-25',1,NULL),
    ('VC209_INTRO_8','BRIGHT VIEWS HOLDINGS','Bright Views Holdings','invested_amount',0,9000.0,0.0,'USD','paid','2025-09-26',1,NULL),
    ('VC209_INTRO_8','BRIGHT VIEWS HOLDINGS','Bright Views Holdings','spread',0,9000.0,0.0,'USD','paid','2025-09-26',1,NULL),
    ('VC209_INTRO_8','BRIGHT VIEWS HOLDINGS','Bright Views Holdings','performance_fee',0,9000.0,0.0,'USD','paid','2025-09-26',1,NULL),
    ('VC209_INTRO_9','STP CAP V, A SERIES OF CGF2021 LLC, SYDECAR LLC','R. F. Lafferty & Co. Inc.','invested_amount',150,1978500.0,29677.5,'USD','paid','2025-09-23',1,NULL),
    ('VC209_INTRO_9','STP CAP V, A SERIES OF CGF2021 LLC, SYDECAR LLC','R. F. Lafferty & Co. Inc.','spread',0,1978500.0,0.0,'USD','paid','2025-09-23',1,NULL),
    ('VC209_INTRO_9','STP CAP V, A SERIES OF CGF2021 LLC, SYDECAR LLC','R. F. Lafferty & Co. Inc.','performance_fee',0,1978500.0,0.0,'USD','paid','2025-09-23',1,NULL),
    ('VC209_INTRO_10','STP CAP V, A SERIES OF CGF2021 LLC, SYDECAR LLC','Bright Views Holdings','invested_amount',0,1978500.0,0.0,'USD','paid','2025-09-23',1,NULL),
    ('VC209_INTRO_10','STP CAP V, A SERIES OF CGF2021 LLC, SYDECAR LLC','Bright Views Holdings','spread',0,1978500.0,0.0,'USD','paid','2025-09-23',1,NULL),
    ('VC209_INTRO_10','STP CAP V, A SERIES OF CGF2021 LLC, SYDECAR LLC','Bright Views Holdings','performance_fee',0,1978500.0,0.0,'USD','paid','2025-09-23',1,NULL),
    ('VC209_INTRO_11','SINO SUISSE LLC','Bright Views Holdings','invested_amount',0,900000.0,0.0,'USD','paid','2025-10-10',1,NULL),
    ('VC209_INTRO_11','SINO SUISSE LLC','Bright Views Holdings','spread',0,900000.0,0.0,'USD','paid','2025-10-10',1,NULL),
    ('VC209_INTRO_11','SINO SUISSE LLC','Bright Views Holdings','performance_fee',0,900000.0,0.0,'USD','paid','2025-10-10',1,NULL),
    ('VC209_INTRO_12','CBH Compagnie Bancaire Helvétique SA','Bright Views Holdings','invested_amount',0,99996.0,0.0,'USD','paid','2025-10-13',1,NULL),
    ('VC209_INTRO_12','CBH Compagnie Bancaire Helvétique SA','Bright Views Holdings','spread',0,99996.0,0.0,'USD','paid','2025-10-13',1,NULL),
    ('VC209_INTRO_12','CBH Compagnie Bancaire Helvétique SA','Bright Views Holdings','performance_fee',0,99996.0,0.0,'USD','paid','2025-10-13',1,NULL),
    ('VC209_INTRO_13','MOBILITY INNOVATION FUND LLC','Jeffrey Wan','invested_amount',103,3000000.0,30927.0,'USD','paid','2025-10-27',1,NULL),
    ('VC209_INTRO_13','MOBILITY INNOVATION FUND LLC','Jeffrey Wan','spread',0,3000000.0,0.0,'USD','paid','2025-10-27',1,NULL),
    ('VC209_INTRO_13','MOBILITY INNOVATION FUND LLC','Jeffrey Wan','performance_fee',0,3000000.0,0.0,'USD','paid','2025-10-27',1,NULL),
    ('VC209_INTRO_14','MOBILITY INNOVATION FUND LLC','Bright Views Holdings','invested_amount',0,3000000.0,0.0,'USD','paid','2025-10-27',1,NULL),
    ('VC209_INTRO_14','MOBILITY INNOVATION FUND LLC','Bright Views Holdings','spread',0,3000000.0,0.0,'USD','paid','2025-10-27',1,NULL),
    ('VC209_INTRO_14','MOBILITY INNOVATION FUND LLC','Bright Views Holdings','performance_fee',0,3000000.0,0.0,'USD','paid','2025-10-27',1,NULL),
    ('VC209_INTRO_15','U.S. HMC SERIES FUND LP - SERIES II','Bright Views Holdings','invested_amount',0,3500016.0,0.0,'USD','paid','2025-06-11',1,NULL),
    ('VC209_INTRO_15','U.S. HMC SERIES FUND LP - SERIES II','Bright Views Holdings','spread',0,3500016.0,0.0,'USD','paid','2025-06-11',1,NULL),
    ('VC209_INTRO_15','U.S. HMC SERIES FUND LP - SERIES II','Bright Views Holdings','performance_fee',0,3500016.0,0.0,'USD','paid','2025-06-11',1,NULL),
    ('VC209_INTRO_16','U.S. HMC SERIES FUND LP - SERIES II','Jeffrey Wan','invested_amount',0,3500016.0,0.0,'USD','paid','2025-06-11',1,NULL),
    ('VC209_INTRO_16','U.S. HMC SERIES FUND LP - SERIES II','Jeffrey Wan','spread',0,3500016.0,0.0,'USD','paid','2025-06-11',1,NULL),
    ('VC209_INTRO_16','U.S. HMC SERIES FUND LP - SERIES II','Jeffrey Wan','performance_fee',0,3500016.0,0.0,'USD','paid','2025-06-11',1,NULL),
    ('VC209_INTRO_17','MRS ANISHA BANSAL AND MR RAHUL KARKUN','Bright Views Holdings','invested_amount',0,25000.0,0.0,'USD','paid','2025-09-30',1,NULL),
    ('VC209_INTRO_17','MRS ANISHA BANSAL AND MR RAHUL KARKUN','Bright Views Holdings','spread',0,25000.0,0.0,'USD','paid','2025-09-30',1,NULL),
    ('VC209_INTRO_17','MRS ANISHA BANSAL AND MR RAHUL KARKUN','Bright Views Holdings','performance_fee',0,25000.0,0.0,'USD','paid','2025-09-30',1,NULL),
    ('VC209_INTRO_18','MRS ANISHA BANSAL AND MR RAHUL KARKUN','Jeffrey Wan','invested_amount',0,25000.0,0.0,'USD','paid','2025-09-30',1,NULL),
    ('VC209_INTRO_18','MRS ANISHA BANSAL AND MR RAHUL KARKUN','Jeffrey Wan','spread',0,25000.0,0.0,'USD','paid','2025-09-30',1,NULL),
    ('VC209_INTRO_18','MRS ANISHA BANSAL AND MR RAHUL KARKUN','Jeffrey Wan','performance_fee',0,25000.0,0.0,'USD','paid','2025-09-30',1,NULL),
    ('VC209_INTRO_19','SPACEFARING VENTURES FUND 9, LLC','Bright Views Holdings','invested_amount',0,266058.0,0.0,'USD','paid','2025-11-13',1,NULL),
    ('VC209_INTRO_19','SPACEFARING VENTURES FUND 9, LLC','Bright Views Holdings','spread',0,266058.0,0.0,'USD','paid','2025-11-13',1,NULL),
    ('VC209_INTRO_19','SPACEFARING VENTURES FUND 9, LLC','Bright Views Holdings','performance_fee',0,266058.0,0.0,'USD','paid','2025-11-13',1,NULL),
    ('VC209_INTRO_20','SPACEFARING VENTURES FUND 9, LLC','Jeffrey Wan','invested_amount',0,266058.0,0.0,'USD','paid','2025-11-13',1,NULL),
    ('VC209_INTRO_20','SPACEFARING VENTURES FUND 9, LLC','Jeffrey Wan','spread',0,266058.0,0.0,'USD','paid','2025-11-13',1,NULL),
    ('VC209_INTRO_20','SPACEFARING VENTURES FUND 9, LLC','Jeffrey Wan','performance_fee',0,266058.0,0.0,'USD','paid','2025-11-13',1,NULL),
    ('VC209_INTRO_21','PVPL FUND LLC SERIES 3','R. F. Lafferty & Co. Inc.','invested_amount',110,10000000.0,55000.0,'USD','paid','2025-10-11',1,NULL),
    ('VC209_INTRO_21','PVPL FUND LLC SERIES 3','R. F. Lafferty & Co. Inc.','spread',0,10000000.0,0.0,'USD','paid','2025-10-11',1,NULL),
    ('VC209_INTRO_21','PVPL FUND LLC SERIES 3','R. F. Lafferty & Co. Inc.','performance_fee',0,10000000.0,0.0,'USD','paid','2025-10-11',1,NULL),
    ('VC209_INTRO_22','PVPL FUND LLC SERIES 3','Visual Sectors','invested_amount',110,10000000.0,55000.0,'USD','paid','2025-10-11',1,NULL),
    ('VC209_INTRO_22','PVPL FUND LLC SERIES 3','Visual Sectors','spread',0,10000000.0,0.0,'USD','paid','2025-10-11',1,NULL),
    ('VC209_INTRO_22','PVPL FUND LLC SERIES 3','Visual Sectors','performance_fee',0,10000000.0,0.0,'USD','paid','2025-10-11',1,NULL),
    ('VC209_INTRO_23','PVPL FUND LLC SERIES 3','Bright Views Holdings','invested_amount',0,10000000.0,0.0,'USD','paid','2025-10-11',1,NULL),
    ('VC209_INTRO_23','PVPL FUND LLC SERIES 3','Bright Views Holdings','spread',0,10000000.0,0.0,'USD','paid','2025-10-11',1,NULL),
    ('VC209_INTRO_23','PVPL FUND LLC SERIES 3','Bright Views Holdings','performance_fee',0,10000000.0,0.0,'USD','paid','2025-10-11',1,NULL),
    ('VC209_INTRO_24','PREAMBLE X CAPITAL I, A SERIES OF PREAMBLE X CAPITAL LLC','Rubix Holdings Limited','invested_amount',1000,2727208.0,272720.8,'USD','paid','2025-01-12',1,NULL),
    ('VC209_INTRO_24','PREAMBLE X CAPITAL I, A SERIES OF PREAMBLE X CAPITAL LLC','Rubix Holdings Limited','spread',0,2727208.0,0.0,'USD','paid','2025-01-12',1,NULL),
    ('VC209_INTRO_24','PREAMBLE X CAPITAL I, A SERIES OF PREAMBLE X CAPITAL LLC','Rubix Holdings Limited','performance_fee',0,2727208.0,0.0,'USD','paid','2025-01-12',1,NULL),
    ('VC209_INTRO_25','PREAMBLE X CAPITAL I, A SERIES OF PREAMBLE X CAPITAL LLC','Bright Views Holdings','invested_amount',0,2727208.0,0.0,'USD','paid','2025-01-12',1,NULL),
    ('VC209_INTRO_25','PREAMBLE X CAPITAL I, A SERIES OF PREAMBLE X CAPITAL LLC','Bright Views Holdings','spread',0,2727208.0,0.0,'USD','paid','2025-01-12',1,NULL),
    ('VC209_INTRO_25','PREAMBLE X CAPITAL I, A SERIES OF PREAMBLE X CAPITAL LLC','Bright Views Holdings','performance_fee',0,2727208.0,0.0,'USD','paid','2025-01-12',1,NULL),
    ('VC209_INTRO_26','Mohan SASANAPURI','Bright Views Holdings','invested_amount',0,50000.0,0.0,'USD','paid','2025-11-12',1,NULL),
    ('VC209_INTRO_26','Mohan SASANAPURI','Bright Views Holdings','spread',0,50000.0,0.0,'USD','paid','2025-11-12',1,NULL),
    ('VC209_INTRO_26','Mohan SASANAPURI','Bright Views Holdings','performance_fee',0,50000.0,0.0,'USD','paid','2025-11-12',1,NULL),
    ('VC209_INTRO_27','Mohan SASANAPURI','Rubix Holdings Limited','invested_amount',0,50000.0,0.0,'USD','paid','2025-11-12',1,NULL),
    ('VC209_INTRO_27','Mohan SASANAPURI','Rubix Holdings Limited','spread',0,50000.0,0.0,'USD','paid','2025-11-12',1,NULL),
    ('VC209_INTRO_27','Mohan SASANAPURI','Rubix Holdings Limited','performance_fee',0,50000.0,0.0,'USD','paid','2025-11-12',1,NULL),
    ('VC209_INTRO_28','Kartik Kumar ATTULURI','Bright Views Holdings','invested_amount',0,100023.0,0.0,'USD','paid','2025-11-12',1,NULL),
    ('VC209_INTRO_28','Kartik Kumar ATTULURI','Bright Views Holdings','spread',0,100023.0,0.0,'USD','paid','2025-11-12',1,NULL),
    ('VC209_INTRO_28','Kartik Kumar ATTULURI','Bright Views Holdings','performance_fee',0,100023.0,0.0,'USD','paid','2025-11-12',1,NULL),
    ('VC209_INTRO_29','Kartik Kumar ATTULURI','Rubix Holdings Limited','invested_amount',0,100023.0,0.0,'USD','paid','2025-11-12',1,NULL),
    ('VC209_INTRO_29','Kartik Kumar ATTULURI','Rubix Holdings Limited','spread',0,100023.0,0.0,'USD','paid','2025-11-12',1,NULL),
    ('VC209_INTRO_29','Kartik Kumar ATTULURI','Rubix Holdings Limited','performance_fee',0,100023.0,0.0,'USD','paid','2025-11-12',1,NULL),
    ('VC209_INTRO_30','Prabhakar Somana KONGANDA','Bright Views Holdings','invested_amount',0,100023.0,0.0,'USD','paid','2025-12-16',1,NULL),
    ('VC209_INTRO_30','Prabhakar Somana KONGANDA','Bright Views Holdings','spread',0,100023.0,0.0,'USD','paid','2025-12-16',1,NULL),
    ('VC209_INTRO_30','Prabhakar Somana KONGANDA','Bright Views Holdings','performance_fee',0,100023.0,0.0,'USD','paid','2025-12-16',1,NULL),
    ('VC209_INTRO_31','Prabhakar Somana KONGANDA','Rubix Holdings Limited','invested_amount',0,100023.0,0.0,'USD','paid','2025-12-16',1,NULL),
    ('VC209_INTRO_31','Prabhakar Somana KONGANDA','Rubix Holdings Limited','spread',0,100023.0,0.0,'USD','paid','2025-12-16',1,NULL),
    ('VC209_INTRO_31','Prabhakar Somana KONGANDA','Rubix Holdings Limited','performance_fee',0,100023.0,0.0,'USD','paid','2025-12-16',1,NULL),
    ('VC209_INTRO_32','Julien MACHOT','Bright Views Holdings','invested_amount',0,40000.0,0.0,'USD','paid','2025-03-12',1,NULL),
    ('VC209_INTRO_32','Julien MACHOT','Bright Views Holdings','spread',0,40000.0,0.0,'USD','paid','2025-03-12',1,NULL),
    ('VC209_INTRO_32','Julien MACHOT','Bright Views Holdings','performance_fee',0,40000.0,0.0,'USD','paid','2025-03-12',1,NULL),
    ('VC209_INTRO_33','Julien MACHOT','Rubix Holdings Limited','invested_amount',0,40000.0,0.0,'USD','paid','2025-03-12',1,NULL),
    ('VC209_INTRO_33','Julien MACHOT','Rubix Holdings Limited','spread',0,40000.0,0.0,'USD','paid','2025-03-12',1,NULL),
    ('VC209_INTRO_33','Julien MACHOT','Rubix Holdings Limited','performance_fee',0,40000.0,0.0,'USD','paid','2025-03-12',1,NULL),
    ('VC209_INTRO_34','MADISON TRUST COMPANY (on behalf of Edward Bendickson)','Bright Views Holdings','invested_amount',0,150000.0,0.0,'USD','paid','2025-12-19',1,NULL),
    ('VC209_INTRO_34','MADISON TRUST COMPANY (on behalf of Edward Bendickson)','Bright Views Holdings','spread',0,150000.0,0.0,'USD','paid','2025-12-19',1,NULL),
    ('VC209_INTRO_34','MADISON TRUST COMPANY (on behalf of Edward Bendickson)','Bright Views Holdings','performance_fee',0,150000.0,0.0,'USD','paid','2025-12-19',1,NULL),
    ('VC209_INTRO_35','MADISON TRUST COMPANY (on behalf of Edward Bendickson)','Rubix Holdings Limited','invested_amount',0,150000.0,0.0,'USD','paid','2025-12-19',1,NULL),
    ('VC209_INTRO_35','MADISON TRUST COMPANY (on behalf of Edward Bendickson)','Rubix Holdings Limited','spread',0,150000.0,0.0,'USD','paid','2025-12-19',1,NULL),
    ('VC209_INTRO_35','MADISON TRUST COMPANY (on behalf of Edward Bendickson)','Rubix Holdings Limited','performance_fee',0,150000.0,0.0,'USD','paid','2025-12-19',1,NULL),
    ('VC209_INTRO_36','FRONTIERX VIII, LP','Bright Views Holdings','invested_amount',0,725400.0,0.0,'USD','paid','2025-12-29',1,NULL),
    ('VC209_INTRO_36','FRONTIERX VIII, LP','Bright Views Holdings','spread',0,725400.0,0.0,'USD','paid','2025-12-29',1,NULL),
    ('VC209_INTRO_36','FRONTIERX VIII, LP','Bright Views Holdings','performance_fee',0,725400.0,0.0,'USD','paid','2025-12-29',1,NULL),
    ('VC209_INTRO_37','FRONTIERX VIII, LP','Rubix Holdings Limited','invested_amount',0,725400.0,0.0,'USD','paid','2025-12-29',1,NULL),
    ('VC209_INTRO_37','FRONTIERX VIII, LP','Rubix Holdings Limited','spread',0,725400.0,0.0,'USD','paid','2025-12-29',1,NULL),
    ('VC209_INTRO_37','FRONTIERX VIII, LP','Rubix Holdings Limited','performance_fee',0,725400.0,0.0,'USD','paid','2025-12-29',1,NULL)
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
