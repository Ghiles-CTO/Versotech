-- Auto-generated migration for VC207
BEGIN;
WITH
veh as (select id,name,currency from vehicles where entity_code='VC207'),
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
    ('TARA LYNN SCHOLLEMANN','individual','-','taraschollemann@fastmail.fm',50000.0,'USD','funded',50000.0,400.0,390.0,128.0,128.0,'2025-05-29',-10.0,-1280.0,0.01,500.0,0.0,0.0,0.0,0.0,0.1,NULL,NULL,NULL,0.0,'PERPLEXITY','FF (TRANCHE 1)','3'),
    ('JONATHAN STONA','individual','-','jonstona@gmail.com',50000.0,'USD','funded',50000.0,400.0,390.0,128.0,128.0,'2025-05-29',-10.0,-1280.0,0.01,500.0,0.0,0.0,0.0,0.0,0.1,NULL,NULL,NULL,0.0,'PERPLEXITY','FF (TRANCHE 1)','4'),
    ('PRASANNA SANTHANAM','individual','-','psanthanam@gmail.com',50000.0,'USD','funded',50000.0,400.0,390.0,128.0,128.0,'2025-05-29',-10.0,-1280.0,0.01,500.0,0.0,0.0,0.0,0.0,0.1,NULL,NULL,NULL,0.0,'PERPLEXITY','FF (TRANCHE 1)','5'),
    ('DILIP STEPHANE ROUSSENALY','individual','-','dilip.roussenaly@gmail.com',50000.0,'USD','funded',50000.0,400.0,390.0,128.0,128.0,'2025-05-29',-10.0,-1280.0,0.01,500.0,0.0,0.0,0.0,0.0,0.1,NULL,NULL,NULL,0.0,'PERPLEXITY','FF (TRANCHE 1)','6'),
    ('GUSTAVO FUCHS ALBUQUERQUE','individual','-','gustavo@gustavofuchs.com',50000.0,'USD','funded',50000.0,400.0,390.0,128.0,128.0,'2025-05-29',-10.0,-1280.0,0.01,500.0,0.0,0.0,0.0,0.0,0.1,NULL,NULL,NULL,0.0,'PERPLEXITY','FF (TRANCHE 1)','7'),
    ('MARK SOUZA','individual','-','mark_souza@hotmail.com',50000.0,'USD','funded',50000.0,400.0,390.0,128.0,128.0,'2025-05-29',-10.0,-1280.0,0.01,500.0,0.0,0.0,0.0,0.0,0.1,NULL,NULL,NULL,0.0,'PERPLEXITY','FF (TRANCHE 1)','8'),
    ('KEE-MIN NGIAM','individual','-','keemin@gcxventures.co',50000.0,'USD','funded',50000.0,400.0,390.0,128.0,128.0,'2025-05-29',-10.0,-1280.0,0.01,500.0,0.0,0.0,0.0,0.0,0.1,NULL,NULL,NULL,0.0,'PERPLEXITY','FF (TRANCHE 1)','9'),
    ('ANUROOP ARORA','individual','-','anurooparora@gmail.com',100350.0,'USD','funded',100350.0,400.0,450.0,223.0,223.0,'2025-04-06',50.0,11150.0,0.03,3010.5,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'PERPLEXITY','FF (TRANCHE 1)','10'),
    ('DIVYA SRIDHAR and SHRIVATSAN VASUDHEVAN','individual','-','divs.sridhar@gmail.com',100350.0,'USD','funded',100350.0,400.0,450.0,223.0,223.0,'2025-04-06',50.0,11150.0,0.03,3010.5,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'PERPLEXITY','FF (TRANCHE 1)','11'),
    ('BHARATH RAM','individual','-','rbharathram@gmail.com',100000.0,'USD','funded',100000.0,400.0,450.0,222.0,222.0,'2025-05-06',50.0,11100.0,0.03,3000.0,0.025,2500.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'PERPLEXITY','FF (TRANCHE 1)','12'),
    ('VARUN SEMBIUM VARADARAJAN','individual','-','varuns84@gmail.com',100350.0,'USD','funded',100350.0,400.0,450.0,223.0,223.0,'2025-06-06',50.0,11150.0,0.03,3010.5,0.025,2508.75,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'PERPLEXITY','FF (TRANCHE 1)','13'),
    ('Julien MACHOT','individual','-','jmachot@versoholdings.com',89200.0,'USD','funded',89200.0,400.0,400.0,223.0,223.0,'2025-09-06',0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'PERPLEXITY','FF (TRANCHE 1)','14'),
    ('ABHINEET MISHRA','individual','-','abhineetmishra1@gmail.com',25000.0,'USD','funded',25000.0,400.0,450.0,55.0,55.0,'2025-09-06',50.0,2750.0,0.03,750.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'PERPLEXITY','FF (TRANCHE 1)','15'),
    ('AGP ALTERNATIVE INVESTMENT QP FUND - SERIES 4','entity','Zachary GRODKO','ZGrodko@allianceg.com',9347840.0,'USD','funded',9347840.0,400.0,428.8,21800.0,21800.0,'2025-08-14',28.8,627840.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'PERPLEXITY','FF (TRANCHE 1)','16'),
    ('ASHUTOSH CHETAL','individual','-','ashutoshchetal@gmail.com',25000.0,'USD','funded',25000.0,400.0,450.0,55.0,55.0,'2025-09-06',50.0,2750.0,0.03,750.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'PERPLEXITY','FF (TRANCHE 1)','17'),
    ('VIDHYA GOVINDARAJAN','individual','-','vidhyag.mnc@gmail.com',100350.0,'USD','funded',100350.0,400.0,450.0,223.0,223.0,'2025-09-06',50.0,11150.0,0.03,3010.5,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'PERPLEXITY','FF (TRANCHE 1)','18'),
    ('ANKUR SRIVASTAVA','individual','-','sr.ankur@gmail.com',50000.0,'USD','funded',50000.0,400.0,450.0,111.0,111.0,'2025-09-06',50.0,5550.0,0.05,2500.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'PERPLEXITY','FF (TRANCHE 1)','19'),
    ('GURPREET SINGH','individual','-','singh.180@gmail.com',50000.0,'USD','funded',50000.0,400.0,450.0,111.0,111.0,'2025-09-06',50.0,5550.0,0.065,3250.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'PERPLEXITY','FF (TRANCHE 1)','20'),
    ('AEON INC.','entity','Demetrios MALLIOS','dmallios@aeon.vc',829800.0,'USD','funded',829800.0,400.0,450.0,1844.0,1844.0,'2025-06-26',50.0,92200.0,0.08,66384.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'PERPLEXITY','FF (TRANCHE 1)','21'),
    ('SPARKLABS GLOBAL CAPITAL X LLC','entity','Bernard Moon','bernard@sparklabsgroup.com',590000.0,'USD','funded',590000.0,400.0,459.0,1285.0,1285.0,'2025-06-26',59.0,75815.0,0.095,56050.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'PERPLEXITY','FF (TRANCHE 1)','22'),
    ('Julien MACHOT','individual','-','jmachot@versoholdings.com',2400.0,'USD','funded',2400.0,400.0,400.0,6.0,6.0,'2025-05-29',0.0,0.0,0.11,264.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'PERPLEXITY','FF (TRANCHE 1)','23'),
    ('MR AND MRS MATHEW KOLANGIKOMBIL THOMAS','individual','-','SanthoshN@alessakuwait.com',100000.0,'USD','funded',100000.0,698.0,698.0,143.0,143.0,'2025-08-21',0.0,0.0,0.125,12500.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'PERPLEXITY','FF (TRANCHE 2)','24'),
    ('Rishabh MITTAL','individual','-','rmittal101@gmail.com',50000.0,'USD','funded',50000.0,698.0,698.0,71.0,71.0,NULL,0.0,0.0,0.04,2000.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'PERPLEXITY','FF (TRANCHE 2)','25'),
    ('LF GROUP SARL','entity','Laurent FULL','laurentfull@yahoo.fr',100100.0,'USD','funded',100100.0,698.0,700.0,143.0,143.0,'2025-10-22',2.0,286.0,0.03,3003.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'PERPLEXITY','FF (TRANCHE 2)','26'),
    ('IGOR TSUKERMAN and IRENE APOTOVSKY','individual','-','igor_tsukerman@yahoo.com',100080.0,'USD','funded',100080.0,698.0,695.0,144.0,144.0,'2025-12-22',-3.0,-432.0,0.04,4003.2,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'PERPLEXITY','FF (TRANCHE 2)','27')
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
    ('TARA LYNN SCHOLLEMANN',128.0,50000.0,'2025-05-29'),
    ('JONATHAN STONA',128.0,50000.0,'2025-05-29'),
    ('PRASANNA SANTHANAM',128.0,50000.0,'2025-05-29'),
    ('DILIP STEPHANE ROUSSENALY',128.0,50000.0,'2025-05-29'),
    ('GUSTAVO FUCHS ALBUQUERQUE',128.0,50000.0,'2025-05-29'),
    ('MARK SOUZA',128.0,50000.0,'2025-05-29'),
    ('KEE-MIN NGIAM',128.0,50000.0,'2025-05-29'),
    ('ANUROOP ARORA',223.0,100350.0,'2025-04-06'),
    ('DIVYA SRIDHAR and SHRIVATSAN VASUDHEVAN',223.0,100350.0,'2025-04-06'),
    ('BHARATH RAM',222.0,100000.0,'2025-05-06'),
    ('VARUN SEMBIUM VARADARAJAN',223.0,100350.0,'2025-06-06'),
    ('Julien MACHOT',229.0,91600.0,'2025-09-06'),
    ('ABHINEET MISHRA',55.0,25000.0,'2025-09-06'),
    ('AGP ALTERNATIVE INVESTMENT QP FUND - SERIES 4',21800.0,9347840.0,'2025-08-14'),
    ('ASHUTOSH CHETAL',55.0,25000.0,'2025-09-06'),
    ('VIDHYA GOVINDARAJAN',223.0,100350.0,'2025-09-06'),
    ('ANKUR SRIVASTAVA',111.0,50000.0,'2025-09-06'),
    ('GURPREET SINGH',111.0,50000.0,'2025-09-06'),
    ('AEON INC.',1844.0,829800.0,'2025-06-26'),
    ('SPARKLABS GLOBAL CAPITAL X LLC',1285.0,590000.0,'2025-06-26'),
    ('MR AND MRS MATHEW KOLANGIKOMBIL THOMAS',143.0,100000.0,'2025-08-21'),
    ('Rishabh MITTAL',71.0,50000.0,NULL),
    ('LF GROUP SARL',143.0,100100.0,'2025-10-22'),
    ('IGOR TSUKERMAN and IRENE APOTOVSKY',144.0,100080.0,'2025-12-22')
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
    ('VC207_INTRO_1','ANUROOP ARORA','Renaissance Bridge Capital LLC','Anushka Mathur','anushka@renbridgecap.com','entity','2025-04-06','allocated','10'),
    ('VC207_INTRO_2','DIVYA SRIDHAR and SHRIVATSAN VASUDHEVAN','Renaissance Bridge Capital LLC','Anushka Mathur','anushka@renbridgecap.com','entity','2025-04-06','allocated','11'),
    ('VC207_INTRO_3','BHARATH RAM','Renaissance Bridge Capital LLC','Anushka Mathur','anushka@renbridgecap.com','entity','2025-05-06','allocated','12'),
    ('VC207_INTRO_4','VARUN SEMBIUM VARADARAJAN','Renaissance Bridge Capital LLC','Anushka Mathur','anushka@renbridgecap.com','entity','2025-06-06','allocated','13'),
    ('VC207_INTRO_5','Julien MACHOT','Renaissance Bridge Capital LLC',NULL,NULL,'entity','2025-09-06','allocated','14'),
    ('VC207_INTRO_6','ABHINEET MISHRA','Renaissance Bridge Capital LLC','Anushka Mathur','anushka@renbridgecap.com','entity','2025-09-06','allocated','15'),
    ('VC207_INTRO_7','AGP ALTERNATIVE INVESTMENT QP FUND - SERIES 4','Alliance Global Partners LLC','Dave Tillman','dave@headwallpm.com','entity','2025-08-14','allocated','16'),
    ('VC207_INTRO_8','ASHUTOSH CHETAL','Renaissance Bridge Capital LLC','Anushka Mathur','anushka@renbridgecap.com','entity','2025-09-06','allocated','17'),
    ('VC207_INTRO_9','VIDHYA GOVINDARAJAN','Renaissance Bridge Capital LLC','Anushka Mathur','anushka@renbridgecap.com','entity','2025-09-06','allocated','18'),
    ('VC207_INTRO_10','ANKUR SRIVASTAVA','Renaissance Bridge Capital LLC','Anushka Mathur','anushka@renbridgecap.com','entity','2025-09-06','allocated','19'),
    ('VC207_INTRO_11','GURPREET SINGH','Renaissance Bridge Capital LLC','Anushka Mathur','anushka@renbridgecap.com','entity','2025-09-06','allocated','20'),
    ('VC207_INTRO_12','AEON INC.','R. F. Lafferty & Co. Inc.','Joseph Gelet','jgelet@vccross.com','entity','2025-06-26','allocated','21'),
    ('VC207_INTRO_13','SPARKLABS GLOBAL CAPITAL X LLC','Elena VYSOTSKAIA',NULL,'elena@astraglobal.org','entity','2025-06-26','allocated','22'),
    ('VC207_INTRO_14','Rishabh MITTAL','Renaissance Bridge Capital LLC','Anushka Mathur','anushka@renbridgecap.com','entity',NULL,'allocated','25')
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
    ('VC207_INTRO_1','ANUROOP ARORA','Renaissance Bridge Capital LLC','invested_amount',149,100350.0,1500.0,'USD','paid','2025-04-06',1,NULL),
    ('VC207_INTRO_1','ANUROOP ARORA','Renaissance Bridge Capital LLC','spread',0,100350.0,0.0,'USD','paid','2025-04-06',1,NULL),
    ('VC207_INTRO_1','ANUROOP ARORA','Renaissance Bridge Capital LLC','performance_fee',0,100350.0,0.0,'USD','paid','2025-04-06',1,NULL),
    ('VC207_INTRO_2','DIVYA SRIDHAR and SHRIVATSAN VASUDHEVAN','Renaissance Bridge Capital LLC','invested_amount',149,100350.0,1500.0,'USD','paid','2025-04-06',1,NULL),
    ('VC207_INTRO_2','DIVYA SRIDHAR and SHRIVATSAN VASUDHEVAN','Renaissance Bridge Capital LLC','spread',0,100350.0,0.0,'USD','paid','2025-04-06',1,NULL),
    ('VC207_INTRO_2','DIVYA SRIDHAR and SHRIVATSAN VASUDHEVAN','Renaissance Bridge Capital LLC','performance_fee',0,100350.0,0.0,'USD','paid','2025-04-06',1,NULL),
    ('VC207_INTRO_3','BHARATH RAM','Renaissance Bridge Capital LLC','invested_amount',150,100000.0,1500.0,'USD','paid','2025-05-06',1,NULL),
    ('VC207_INTRO_3','BHARATH RAM','Renaissance Bridge Capital LLC','spread',0,100000.0,0.0,'USD','paid','2025-05-06',1,NULL),
    ('VC207_INTRO_3','BHARATH RAM','Renaissance Bridge Capital LLC','performance_fee',0,100000.0,0.0,'USD','paid','2025-05-06',1,NULL),
    ('VC207_INTRO_4','VARUN SEMBIUM VARADARAJAN','Renaissance Bridge Capital LLC','invested_amount',149,100350.0,1500.0,'USD','paid','2025-06-06',1,NULL),
    ('VC207_INTRO_4','VARUN SEMBIUM VARADARAJAN','Renaissance Bridge Capital LLC','spread',0,100350.0,0.0,'USD','paid','2025-06-06',1,NULL),
    ('VC207_INTRO_4','VARUN SEMBIUM VARADARAJAN','Renaissance Bridge Capital LLC','performance_fee',0,100350.0,0.0,'USD','paid','2025-06-06',1,NULL),
    ('VC207_INTRO_5','Julien MACHOT','Renaissance Bridge Capital LLC','invested_amount',0,89200.0,0.0,'USD','paid','2025-09-06',1,NULL),
    ('VC207_INTRO_5','Julien MACHOT','Renaissance Bridge Capital LLC','spread',0,89200.0,0.0,'USD','paid','2025-09-06',1,NULL),
    ('VC207_INTRO_5','Julien MACHOT','Renaissance Bridge Capital LLC','performance_fee',0,89200.0,0.0,'USD','paid','2025-09-06',1,NULL),
    ('VC207_INTRO_6','ABHINEET MISHRA','Renaissance Bridge Capital LLC','invested_amount',150,25000.0,375.0,'USD','paid','2025-09-06',1,NULL),
    ('VC207_INTRO_6','ABHINEET MISHRA','Renaissance Bridge Capital LLC','spread',0,25000.0,0.0,'USD','paid','2025-09-06',1,NULL),
    ('VC207_INTRO_6','ABHINEET MISHRA','Renaissance Bridge Capital LLC','performance_fee',0,25000.0,0.0,'USD','paid','2025-09-06',1,NULL),
    ('VC207_INTRO_7','AGP ALTERNATIVE INVESTMENT QP FUND - SERIES 4','Alliance Global Partners LLC','invested_amount',100,9347840.0,93478.4,'USD','paid','2025-08-14',1,NULL),
    ('VC207_INTRO_7','AGP ALTERNATIVE INVESTMENT QP FUND - SERIES 4','Alliance Global Partners LLC','spread',0,9347840.0,0.0,'USD','paid','2025-08-14',1,NULL),
    ('VC207_INTRO_7','AGP ALTERNATIVE INVESTMENT QP FUND - SERIES 4','Alliance Global Partners LLC','performance_fee',0,9347840.0,0.0,'USD','paid','2025-08-14',1,NULL),
    ('VC207_INTRO_8','ASHUTOSH CHETAL','Renaissance Bridge Capital LLC','invested_amount',150,25000.0,375.0,'USD','paid','2025-09-06',1,NULL),
    ('VC207_INTRO_8','ASHUTOSH CHETAL','Renaissance Bridge Capital LLC','spread',0,25000.0,0.0,'USD','paid','2025-09-06',1,NULL),
    ('VC207_INTRO_8','ASHUTOSH CHETAL','Renaissance Bridge Capital LLC','performance_fee',0,25000.0,0.0,'USD','paid','2025-09-06',1,NULL),
    ('VC207_INTRO_9','VIDHYA GOVINDARAJAN','Renaissance Bridge Capital LLC','invested_amount',149,100350.0,1500.0,'USD','paid','2025-09-06',1,NULL),
    ('VC207_INTRO_9','VIDHYA GOVINDARAJAN','Renaissance Bridge Capital LLC','spread',0,100350.0,0.0,'USD','paid','2025-09-06',1,NULL),
    ('VC207_INTRO_9','VIDHYA GOVINDARAJAN','Renaissance Bridge Capital LLC','performance_fee',0,100350.0,0.0,'USD','paid','2025-09-06',1,NULL),
    ('VC207_INTRO_10','ANKUR SRIVASTAVA','Renaissance Bridge Capital LLC','invested_amount',150,50000.0,750.0,'USD','paid','2025-09-06',1,NULL),
    ('VC207_INTRO_10','ANKUR SRIVASTAVA','Renaissance Bridge Capital LLC','spread',0,50000.0,0.0,'USD','paid','2025-09-06',1,NULL),
    ('VC207_INTRO_10','ANKUR SRIVASTAVA','Renaissance Bridge Capital LLC','performance_fee',0,50000.0,0.0,'USD','paid','2025-09-06',1,NULL),
    ('VC207_INTRO_11','GURPREET SINGH','Renaissance Bridge Capital LLC','invested_amount',150,50000.0,750.0,'USD','paid','2025-09-06',1,NULL),
    ('VC207_INTRO_11','GURPREET SINGH','Renaissance Bridge Capital LLC','spread',0,50000.0,0.0,'USD','paid','2025-09-06',1,NULL),
    ('VC207_INTRO_11','GURPREET SINGH','Renaissance Bridge Capital LLC','performance_fee',0,50000.0,0.0,'USD','paid','2025-09-06',1,NULL),
    ('VC207_INTRO_12','AEON INC.','R. F. Lafferty & Co. Inc.','invested_amount',315,829800.0,26138.7,'USD','paid','2025-06-26',1,NULL),
    ('VC207_INTRO_12','AEON INC.','R. F. Lafferty & Co. Inc.','spread',0,829800.0,0.0,'USD','paid','2025-06-26',1,NULL),
    ('VC207_INTRO_12','AEON INC.','R. F. Lafferty & Co. Inc.','performance_fee',0,829800.0,0.0,'USD','paid','2025-06-26',1,NULL),
    ('VC207_INTRO_13','SPARKLABS GLOBAL CAPITAL X LLC','Elena VYSOTSKAIA','invested_amount',196,590000.0,11565.0,'USD','paid','2025-06-26',1,NULL),
    ('VC207_INTRO_13','SPARKLABS GLOBAL CAPITAL X LLC','Elena VYSOTSKAIA','spread',0,590000.0,0.0,'USD','paid','2025-06-26',1,NULL),
    ('VC207_INTRO_13','SPARKLABS GLOBAL CAPITAL X LLC','Elena VYSOTSKAIA','performance_fee',0,590000.0,0.0,'USD','paid','2025-06-26',1,NULL),
    ('VC207_INTRO_14','Rishabh MITTAL','Renaissance Bridge Capital LLC','invested_amount',200,50000.0,1000.0,'USD','paid',NULL,1,NULL),
    ('VC207_INTRO_14','Rishabh MITTAL','Renaissance Bridge Capital LLC','spread',0,50000.0,0.0,'USD','paid',NULL,1,NULL),
    ('VC207_INTRO_14','Rishabh MITTAL','Renaissance Bridge Capital LLC','performance_fee',0,50000.0,0.0,'USD','paid',NULL,1,NULL)
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
