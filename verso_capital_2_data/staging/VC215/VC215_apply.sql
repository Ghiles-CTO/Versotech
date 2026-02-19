-- Auto-generated migration for VC215
BEGIN;
WITH
veh as (select id,name,currency from vehicles where entity_code='VC215'),
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
    ('Julien MACHOT','individual','-','jmachot@versoholdings.com',841650.0,'USD','funded',841650.0,150.0,150.0,5611.0,11.0,'2025-11-21',0.0,0.0,0.03,25249.5,0.0,0.0,0.0,0.0,0.2,NULL,0.3,NULL,0.02,'ANTHROPIC AI',NULL,'3'),
    ('Gourav KAKKAR','individual','-','gouravkakkar@gmail.com',29000.0,'USD','funded',29000.0,150.0,155.0,187.0,187.0,'2025-10-16',5.0,935.0,0.03,870.0,0.0,0.0,0.0,0.0,0.2,NULL,0.3,NULL,0.02,'ANTHROPIC AI',NULL,'4'),
    ('Rajagopalan MADHUSUDAN','individual','-','rmadhusadan@gmail.com',23000.0,'USD','funded',23000.0,150.0,155.0,148.0,148.0,'2025-10-16',5.0,740.0,0.01,230.0,0.0,0.0,0.0,0.0,0.1,NULL,NULL,NULL,0.0,'ANTHROPIC AI',NULL,'5'),
    ('Ved NIRANJANBHAI ANTANI','individual','-','ved.atani@gmail.com',47000.0,'USD','funded',47000.0,150.0,155.0,303.0,303.0,'2025-10-16',5.0,1515.0,0.01,470.0,0.0,0.0,0.0,0.0,0.1,NULL,NULL,NULL,0.0,'ANTHROPIC AI',NULL,'6'),
    ('Mahesh NALLAPATI','individual','-','nallapati.mahesh87@gmail.com',20000.0,'USD','funded',20000.0,150.0,155.0,129.0,129.0,'2025-10-16',5.0,645.0,0.01,200.0,0.0,0.0,0.0,0.0,0.1,NULL,NULL,NULL,0.0,'ANTHROPIC AI',NULL,'7'),
    ('Varun SEMBIUM VARADARAJAN','individual','-','varuns84@gmail.com',107889.0,'USD','funded',107889.0,150.0,155.0,696.0,696.0,'2025-10-23',5.0,3480.0,0.01,1078.89,0.0,0.0,0.0,0.0,0.1,NULL,NULL,NULL,0.0,'ANTHROPIC AI',NULL,'8'),
    ('CARTA INVESTMENTS LLC','entity','Kavel  BHATELA','kbhatela@dbdiagnostics.com',85000.0,'USD','funded',85000.0,150.0,155.0,548.0,548.0,'2025-10-21',5.0,2740.0,0.01,850.0,0.0,0.0,0.0,0.0,0.1,NULL,NULL,NULL,0.0,'ANTHROPIC AI',NULL,'9'),
    ('STELLATRION PARTNERS','entity','David PIEHL','investors@stellatrion.com',150040.0,'USD','funded',150040.0,150.0,155.0,968.0,968.0,'2025-10-10',5.0,4840.0,0.03,4501.2,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'ANTHROPIC AI',NULL,'10'),
    ('STELLATRION PARTNERS','entity','David PIEHL','investors@stellatrion.com',150040.0,'USD','funded',150040.0,150.0,155.0,968.0,968.0,'2025-10-10',5.0,4840.0,0.03,4501.2,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'ANTHROPIC AI',NULL,'11'),
    ('ANTHR SYND I, A SERIES OF 2H OPPORTUNITIES, LLC','entity','Anya HAYDEN','anya@animfund.com',733010.0,'USD','funded',733010.0,150.0,155.0,4729.0,4729.0,'2025-10-24',5.0,23645.0,0.03,21990.3,0.025,18325.25,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'ANTHROPIC AI',NULL,'12'),
    ('ANTHR SYND I, A SERIES OF 2H OPPORTUNITIES, LLC','entity','Anya HAYDEN','anya@animfund.com',291262.0,'USD','funded',291262.0,150.0,155.0,1879.0,1879.0,'2025-10-28',5.0,9395.0,0.03,8737.86,0.025,7281.55,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'ANTHROPIC AI',NULL,'13'),
    ('ANTHR SYND I, A SERIES OF 2H OPPORTUNITIES, LLC','entity','Anya HAYDEN','anya@animfund.com',300033.0,'USD','funded',300033.0,150.0,159.0,1887.0,1887.0,'2025-12-11',9.0,16983.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'ANTHROPIC AI',NULL,'14'),
    ('Anuroop ARORA','individual','-','anurooparora@gmail.com',108035.0,'USD','funded',108035.0,150.0,155.0,697.0,697.0,'2025-06-11',5.0,3485.0,0.03,3241.05,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'ANTHROPIC AI',NULL,'15'),
    ('AEON INC','entity','Demetrios MALLIOS','dmallios@aeon.vc',333333.0,'USD','funded',333333.0,150.0,163.0,2044.0,2044.0,'2025-10-23',13.0,26572.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'ANTHROPIC AI',NULL,'16'),
    ('Anthropic Compartment, HAG Private Markets SARL','entity','Elisa AMAR','e.amar@hottinger-ag.ch',10000000.0,'USD','funded',10000000.0,150.0,174.41,57336.0,57336.0,'2025-10-11',24.41,1399571.76,0.03,300000.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'ANTHROPIC AI',NULL,'17'),
    ('LF GROUP SARL','entity','Laurent FULL','laurentfull@yahoo.fr',100000.0,'USD','funded',100000.0,150.0,160.0,625.0,625.0,'2025-10-22',10.0,6250.0,0.03,3000.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'ANTHROPIC AI',NULL,'18'),
    ('AEON INC','entity','Demetrios MALLIOS','dmallios@aeon.vc',131670.0,'USD','funded',131670.0,150.0,165.0,798.0,798.0,'2025-12-11',15.0,11970.0,0.05,6583.5,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'ANTHROPIC AI',NULL,'19'),
    ('Keir BENBOW','individual','-','krb@vitol.com',125160.0,'USD','funded',125160.0,150.0,280.0,447.0,447.0,'2025-02-12',130.0,58110.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'ANTHROPIC AI',NULL,'20'),
    ('George Guoying CHEN','individual','-','george.chen@us.homaer.com',1456000.0,'USD','funded',1456000.0,150.0,260.0,5600.0,5600.0,'2025-12-24',110.0,616000.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,NULL,NULL,NULL,0.0,'ANTHROPIC AI',NULL,'21')
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
    ('Julien MACHOT',11.0,841650.0,'2025-11-21'),
    ('Gourav KAKKAR',187.0,29000.0,'2025-10-16'),
    ('Rajagopalan MADHUSUDAN',148.0,23000.0,'2025-10-16'),
    ('Ved NIRANJANBHAI ANTANI',303.0,47000.0,'2025-10-16'),
    ('Mahesh NALLAPATI',129.0,20000.0,'2025-10-16'),
    ('Varun SEMBIUM VARADARAJAN',696.0,107889.0,'2025-10-23'),
    ('CARTA INVESTMENTS LLC',548.0,85000.0,'2025-10-21'),
    ('STELLATRION PARTNERS',1936.0,300080.0,'2025-10-10'),
    ('ANTHR SYND I, A SERIES OF 2H OPPORTUNITIES, LLC',8495.0,1324305.0,'2025-12-11'),
    ('Anuroop ARORA',697.0,108035.0,'2025-06-11'),
    ('AEON INC',2842.0,465003.0,'2025-12-11'),
    ('Anthropic Compartment, HAG Private Markets SARL',57336.0,10000000.0,'2025-10-11'),
    ('LF GROUP SARL',625.0,100000.0,'2025-10-22'),
    ('Keir BENBOW',447.0,125160.0,'2025-02-12'),
    ('George Guoying CHEN',5600.0,1456000.0,'2025-12-24')
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
    ('VC215_INTRO_1','Julien MACHOT','Bromley Capital',NULL,NULL,'entity','2025-11-21','allocated','3'),
    ('VC215_INTRO_2','Gourav KAKKAR','Infinyte Club Private Limited','Paul','paul@infinyte.club','entity','2025-10-16','allocated','4'),
    ('VC215_INTRO_3','Gourav KAKKAR','Set Cap','Anand Sethia','anand@set-cap.com','entity','2025-10-16','allocated','4'),
    ('VC215_INTRO_4','Rajagopalan MADHUSUDAN','Infinyte Club Private Limited','Paul','paul@infinyte.club','entity','2025-10-16','allocated','5'),
    ('VC215_INTRO_5','Rajagopalan MADHUSUDAN','Set Cap','Anand Sethia','anand@set-cap.com','entity','2025-10-16','allocated','5'),
    ('VC215_INTRO_6','Ved NIRANJANBHAI ANTANI','Infinyte Club Private Limited','Paul','paul@infinyte.club','entity','2025-10-16','allocated','6'),
    ('VC215_INTRO_7','Ved NIRANJANBHAI ANTANI','Set Cap','Anand Sethia','anand@set-cap.com','entity','2025-10-16','allocated','6'),
    ('VC215_INTRO_8','Mahesh NALLAPATI','Infinyte Club Private Limited','Paul','paul@infinyte.club','entity','2025-10-16','allocated','7'),
    ('VC215_INTRO_9','Mahesh NALLAPATI','Set Cap','Anand Sethia','anand@set-cap.com','entity','2025-10-16','allocated','7'),
    ('VC215_INTRO_10','Varun SEMBIUM VARADARAJAN','Renaissance Bridge Capital LLC','Anushka Mathur','anushka@renbridgecap.com','entity','2025-10-23','allocated','8'),
    ('VC215_INTRO_11','Varun SEMBIUM VARADARAJAN','Set Cap',NULL,NULL,'entity','2025-10-23','allocated','8'),
    ('VC215_INTRO_12','CARTA INVESTMENTS LLC','Infinyte Club Private Limited','Paul','paul@infinyte.club','entity','2025-10-21','allocated','9'),
    ('VC215_INTRO_13','CARTA INVESTMENTS LLC','Set Cap','Anand Sethia','anand@set-cap.com','entity','2025-10-21','allocated','9'),
    ('VC215_INTRO_14','STELLATRION PARTNERS','Set Cap','Anand Sethia','anand@set-cap.com','entity','2025-10-10','allocated','10'),
    ('VC215_INTRO_15','STELLATRION PARTNERS','Bromley Capital',NULL,NULL,'entity','2025-10-10','allocated','10'),
    ('VC215_INTRO_16','ANTHR SYND I, A SERIES OF 2H OPPORTUNITIES, LLC','Set Cap',NULL,NULL,'entity','2025-10-24','allocated','12'),
    ('VC215_INTRO_17','ANTHR SYND I, A SERIES OF 2H OPPORTUNITIES, LLC','Bromley Capital',NULL,NULL,'entity','2025-10-24','allocated','12'),
    ('VC215_INTRO_18','Anuroop ARORA','Renaissance Bridge Capital LLC','Anushka Mathur','anushka@renbridgecap.com','entity','2025-06-11','allocated','15'),
    ('VC215_INTRO_19','Anuroop ARORA','Set Cap',NULL,NULL,'entity','2025-06-11','allocated','15'),
    ('VC215_INTRO_20','AEON INC','Set Cap',NULL,NULL,'entity','2025-10-23','allocated','16'),
    ('VC215_INTRO_21','AEON INC','Bromley Capital',NULL,NULL,'entity','2025-10-23','allocated','16'),
    ('VC215_INTRO_22','Anthropic Compartment, HAG Private Markets SARL','Hottinger AG','Elisa AMAR','e.amar@hottinger-ag.ch','entity','2025-10-11','allocated','17'),
    ('VC215_INTRO_23','Anthropic Compartment, HAG Private Markets SARL','Set Cap',NULL,NULL,'entity','2025-10-11','allocated','17'),
    ('VC215_INTRO_24','LF GROUP SARL','Set Cap',NULL,NULL,'entity','2025-10-22','allocated','18'),
    ('VC215_INTRO_25','LF GROUP SARL','Bromley Capital',NULL,NULL,'entity','2025-10-22','allocated','18'),
    ('VC215_INTRO_26','Keir BENBOW','Set Cap',NULL,NULL,'entity','2025-02-12','allocated','20'),
    ('VC215_INTRO_27','Keir BENBOW','Bromley Capital',NULL,NULL,'entity','2025-02-12','allocated','20'),
    ('VC215_INTRO_28','George Guoying CHEN','Set Cap',NULL,NULL,'entity','2025-12-24','allocated','21'),
    ('VC215_INTRO_29','George Guoying CHEN','Bromley Capital',NULL,NULL,'entity','2025-12-24','allocated','21')
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
    ('VC215_INTRO_1','Julien MACHOT','Bromley Capital','invested_amount',100,841650.0,8416.5,'USD','paid','2025-11-21',1,NULL),
    ('VC215_INTRO_1','Julien MACHOT','Bromley Capital','spread',0,841650.0,0.0,'USD','paid','2025-11-21',1,NULL),
    ('VC215_INTRO_1','Julien MACHOT','Bromley Capital','performance_fee',0,841650.0,0.0,'USD','paid','2025-11-21',1,NULL),
    ('VC215_INTRO_2','Gourav KAKKAR','Infinyte Club Private Limited','invested_amount',261,29000.0,747.82,'USD','paid','2025-10-16',1,NULL),
    ('VC215_INTRO_2','Gourav KAKKAR','Infinyte Club Private Limited','spread',0,29000.0,0.0,'USD','paid','2025-10-16',1,NULL),
    ('VC215_INTRO_2','Gourav KAKKAR','Infinyte Club Private Limited','performance_fee',0,29000.0,0.0,'USD','paid','2025-10-16',1,NULL),
    ('VC215_INTRO_3','Gourav KAKKAR','Set Cap','invested_amount',0,29000.0,0.0,'USD','paid','2025-10-16',1,NULL),
    ('VC215_INTRO_3','Gourav KAKKAR','Set Cap','spread',250,29000.0,725.32625,'USD','paid','2025-10-16',1,NULL),
    ('VC215_INTRO_3','Gourav KAKKAR','Set Cap','performance_fee',0,29000.0,0.0,'USD','paid','2025-10-16',1,NULL),
    ('VC215_INTRO_4','Rajagopalan MADHUSUDAN','Infinyte Club Private Limited','invested_amount',261,23000.0,592.64,'USD','paid','2025-10-16',1,NULL),
    ('VC215_INTRO_4','Rajagopalan MADHUSUDAN','Infinyte Club Private Limited','spread',0,23000.0,0.0,'USD','paid','2025-10-16',1,NULL),
    ('VC215_INTRO_4','Rajagopalan MADHUSUDAN','Infinyte Club Private Limited','performance_fee',0,23000.0,0.0,'USD','paid','2025-10-16',1,NULL),
    ('VC215_INTRO_5','Rajagopalan MADHUSUDAN','Set Cap','invested_amount',0,23000.0,0.0,'USD','paid','2025-10-16',1,NULL),
    ('VC215_INTRO_5','Rajagopalan MADHUSUDAN','Set Cap','spread',250,23000.0,574.055,'USD','paid','2025-10-16',1,NULL),
    ('VC215_INTRO_5','Rajagopalan MADHUSUDAN','Set Cap','performance_fee',0,23000.0,0.0,'USD','paid','2025-10-16',1,NULL),
    ('VC215_INTRO_6','Ved NIRANJANBHAI ANTANI','Infinyte Club Private Limited','invested_amount',261,47000.0,1211.89,'USD','paid','2025-10-16',1,NULL),
    ('VC215_INTRO_6','Ved NIRANJANBHAI ANTANI','Infinyte Club Private Limited','spread',0,47000.0,0.0,'USD','paid','2025-10-16',1,NULL),
    ('VC215_INTRO_6','Ved NIRANJANBHAI ANTANI','Infinyte Club Private Limited','performance_fee',0,47000.0,0.0,'USD','paid','2025-10-16',1,NULL),
    ('VC215_INTRO_7','Ved NIRANJANBHAI ANTANI','Set Cap','invested_amount',0,47000.0,0.0,'USD','paid','2025-10-16',1,NULL),
    ('VC215_INTRO_7','Ved NIRANJANBHAI ANTANI','Set Cap','spread',250,47000.0,1175.26125,'USD','paid','2025-10-16',1,NULL),
    ('VC215_INTRO_7','Ved NIRANJANBHAI ANTANI','Set Cap','performance_fee',0,47000.0,0.0,'USD','paid','2025-10-16',1,NULL),
    ('VC215_INTRO_8','Mahesh NALLAPATI','Infinyte Club Private Limited','invested_amount',261,20000.0,515.79,'USD','paid','2025-10-16',1,NULL),
    ('VC215_INTRO_8','Mahesh NALLAPATI','Infinyte Club Private Limited','spread',0,20000.0,0.0,'USD','paid','2025-10-16',1,NULL),
    ('VC215_INTRO_8','Mahesh NALLAPATI','Infinyte Club Private Limited','performance_fee',0,20000.0,0.0,'USD','paid','2025-10-16',1,NULL),
    ('VC215_INTRO_9','Mahesh NALLAPATI','Set Cap','invested_amount',0,20000.0,0.0,'USD','paid','2025-10-16',1,NULL),
    ('VC215_INTRO_9','Mahesh NALLAPATI','Set Cap','spread',250,20000.0,500.35875,'USD','paid','2025-10-16',1,NULL),
    ('VC215_INTRO_9','Mahesh NALLAPATI','Set Cap','performance_fee',0,20000.0,0.0,'USD','paid','2025-10-16',1,NULL),
    ('VC215_INTRO_10','Varun SEMBIUM VARADARAJAN','Renaissance Bridge Capital LLC','invested_amount',202,107889.0,2144.0,'USD','paid','2025-10-23',1,NULL),
    ('VC215_INTRO_10','Varun SEMBIUM VARADARAJAN','Renaissance Bridge Capital LLC','spread',0,107889.0,0.0,'USD','paid','2025-10-23',1,NULL),
    ('VC215_INTRO_10','Varun SEMBIUM VARADARAJAN','Renaissance Bridge Capital LLC','performance_fee',0,107889.0,0.0,'USD','paid','2025-10-23',1,NULL),
    ('VC215_INTRO_11','Varun SEMBIUM VARADARAJAN','Set Cap','invested_amount',0,107889.0,0.0,'USD','paid','2025-10-23',1,NULL),
    ('VC215_INTRO_11','Varun SEMBIUM VARADARAJAN','Set Cap','spread',0,107889.0,0.0,'USD','paid','2025-10-23',1,NULL),
    ('VC215_INTRO_11','Varun SEMBIUM VARADARAJAN','Set Cap','performance_fee',0,107889.0,0.0,'USD','paid','2025-10-23',1,NULL),
    ('VC215_INTRO_12','CARTA INVESTMENTS LLC','Infinyte Club Private Limited','invested_amount',161,85000.0,1341.74,'USD','paid','2025-10-21',1,NULL),
    ('VC215_INTRO_12','CARTA INVESTMENTS LLC','Infinyte Club Private Limited','spread',0,85000.0,0.0,'USD','paid','2025-10-21',1,NULL),
    ('VC215_INTRO_12','CARTA INVESTMENTS LLC','Infinyte Club Private Limited','performance_fee',0,85000.0,0.0,'USD','paid','2025-10-21',1,NULL),
    ('VC215_INTRO_13','CARTA INVESTMENTS LLC','Set Cap','invested_amount',0,85000.0,0.0,'USD','paid','2025-10-21',1,NULL),
    ('VC215_INTRO_13','CARTA INVESTMENTS LLC','Set Cap','spread',550,85000.0,4674.99896,'USD','paid','2025-10-21',1,NULL),
    ('VC215_INTRO_13','CARTA INVESTMENTS LLC','Set Cap','performance_fee',0,85000.0,0.0,'USD','paid','2025-10-21',1,NULL),
    ('VC215_INTRO_14','STELLATRION PARTNERS','Set Cap','invested_amount',0,600160.0,0.0,'USD','paid','2025-10-10',1,NULL),
    ('VC215_INTRO_14','STELLATRION PARTNERS','Set Cap','spread',300,600160.0,18004.8,'USD','paid','2025-10-10',1,NULL),
    ('VC215_INTRO_14','STELLATRION PARTNERS','Set Cap','performance_fee',0,600160.0,0.0,'USD','paid','2025-10-10',1,NULL),
    ('VC215_INTRO_15','STELLATRION PARTNERS','Bromley Capital','invested_amount',100,300080.0,2904.0,'USD','paid','2025-10-10',1,NULL),
    ('VC215_INTRO_15','STELLATRION PARTNERS','Bromley Capital','spread',0,300080.0,0.0,'USD','paid','2025-10-10',1,NULL),
    ('VC215_INTRO_15','STELLATRION PARTNERS','Bromley Capital','performance_fee',0,300080.0,0.0,'USD','paid','2025-10-10',1,NULL),
    ('VC215_INTRO_16','ANTHR SYND I, A SERIES OF 2H OPPORTUNITIES, LLC','Set Cap','invested_amount',0,1324305.0,0.0,'USD','paid','2025-10-24',1,NULL),
    ('VC215_INTRO_16','ANTHR SYND I, A SERIES OF 2H OPPORTUNITIES, LLC','Set Cap','spread',0,1324305.0,0.0,'USD','paid','2025-10-24',1,NULL),
    ('VC215_INTRO_16','ANTHR SYND I, A SERIES OF 2H OPPORTUNITIES, LLC','Set Cap','performance_fee',0,1324305.0,0.0,'USD','paid','2025-10-24',1,NULL),
    ('VC215_INTRO_17','ANTHR SYND I, A SERIES OF 2H OPPORTUNITIES, LLC','Bromley Capital','invested_amount',100,1324305.0,12742.5,'USD','paid','2025-10-24',1,NULL),
    ('VC215_INTRO_17','ANTHR SYND I, A SERIES OF 2H OPPORTUNITIES, LLC','Bromley Capital','spread',0,1324305.0,0.0,'USD','paid','2025-10-24',1,NULL),
    ('VC215_INTRO_17','ANTHR SYND I, A SERIES OF 2H OPPORTUNITIES, LLC','Bromley Capital','performance_fee',0,1324305.0,0.0,'USD','paid','2025-10-24',1,NULL),
    ('VC215_INTRO_18','Anuroop ARORA','Renaissance Bridge Capital LLC','invested_amount',261,108035.0,2786.44,'USD','paid','2025-06-11',1,NULL),
    ('VC215_INTRO_18','Anuroop ARORA','Renaissance Bridge Capital LLC','spread',0,108035.0,0.0,'USD','paid','2025-06-11',1,NULL),
    ('VC215_INTRO_18','Anuroop ARORA','Renaissance Bridge Capital LLC','performance_fee',0,108035.0,0.0,'USD','paid','2025-06-11',1,NULL),
    ('VC215_INTRO_19','Anuroop ARORA','Set Cap','invested_amount',0,108035.0,0.0,'USD','paid','2025-06-11',1,NULL),
    ('VC215_INTRO_19','Anuroop ARORA','Set Cap','spread',0,108035.0,0.0,'USD','paid','2025-06-11',1,NULL),
    ('VC215_INTRO_19','Anuroop ARORA','Set Cap','performance_fee',0,108035.0,0.0,'USD','paid','2025-06-11',1,NULL),
    ('VC215_INTRO_20','AEON INC','Set Cap','invested_amount',0,465003.0,0.0,'USD','paid','2025-10-23',1,NULL),
    ('VC215_INTRO_20','AEON INC','Set Cap','spread',0,465003.0,0.0,'USD','paid','2025-10-23',1,NULL),
    ('VC215_INTRO_20','AEON INC','Set Cap','performance_fee',0,465003.0,0.0,'USD','paid','2025-10-23',1,NULL),
    ('VC215_INTRO_21','AEON INC','Bromley Capital','invested_amount',100,465003.0,4263.0,'USD','paid','2025-10-23',1,NULL),
    ('VC215_INTRO_21','AEON INC','Bromley Capital','spread',0,465003.0,0.0,'USD','paid','2025-10-23',1,NULL),
    ('VC215_INTRO_21','AEON INC','Bromley Capital','performance_fee',0,465003.0,0.0,'USD','paid','2025-10-23',1,NULL),
    ('VC215_INTRO_22','Anthropic Compartment, HAG Private Markets SARL','Hottinger AG','invested_amount',800,10000000.0,786004.0,'USD','paid','2025-10-11',1,NULL),
    ('VC215_INTRO_22','Anthropic Compartment, HAG Private Markets SARL','Hottinger AG','spread',0,10000000.0,0.0,'USD','paid','2025-10-11',1,NULL),
    ('VC215_INTRO_22','Anthropic Compartment, HAG Private Markets SARL','Hottinger AG','performance_fee',0,10000000.0,0.0,'USD','paid','2025-10-11',1,NULL),
    ('VC215_INTRO_23','Anthropic Compartment, HAG Private Markets SARL','Set Cap','invested_amount',0,10000000.0,0.0,'USD','paid','2025-10-11',1,NULL),
    ('VC215_INTRO_23','Anthropic Compartment, HAG Private Markets SARL','Set Cap','spread',0,10000000.0,0.0,'USD','paid','2025-10-11',1,NULL),
    ('VC215_INTRO_23','Anthropic Compartment, HAG Private Markets SARL','Set Cap','performance_fee',0,10000000.0,0.0,'USD','paid','2025-10-11',1,NULL),
    ('VC215_INTRO_24','LF GROUP SARL','Set Cap','invested_amount',0,100000.0,0.0,'USD','paid','2025-10-22',1,NULL),
    ('VC215_INTRO_24','LF GROUP SARL','Set Cap','spread',0,100000.0,0.0,'USD','paid','2025-10-22',1,NULL),
    ('VC215_INTRO_24','LF GROUP SARL','Set Cap','performance_fee',0,100000.0,0.0,'USD','paid','2025-10-22',1,NULL),
    ('VC215_INTRO_25','LF GROUP SARL','Bromley Capital','invested_amount',100,100000.0,937.5,'USD','paid','2025-10-22',1,NULL),
    ('VC215_INTRO_25','LF GROUP SARL','Bromley Capital','spread',0,100000.0,0.0,'USD','paid','2025-10-22',1,NULL),
    ('VC215_INTRO_25','LF GROUP SARL','Bromley Capital','performance_fee',0,100000.0,0.0,'USD','paid','2025-10-22',1,NULL),
    ('VC215_INTRO_26','Keir BENBOW','Set Cap','invested_amount',0,125160.0,0.0,'USD','paid','2025-02-12',1,NULL),
    ('VC215_INTRO_26','Keir BENBOW','Set Cap','spread',0,125160.0,0.0,'USD','paid','2025-02-12',1,NULL),
    ('VC215_INTRO_26','Keir BENBOW','Set Cap','performance_fee',0,125160.0,0.0,'USD','paid','2025-02-12',1,NULL),
    ('VC215_INTRO_27','Keir BENBOW','Bromley Capital','invested_amount',100,125160.0,670.5,'USD','paid','2025-02-12',1,NULL),
    ('VC215_INTRO_27','Keir BENBOW','Bromley Capital','spread',0,125160.0,0.0,'USD','paid','2025-02-12',1,NULL),
    ('VC215_INTRO_27','Keir BENBOW','Bromley Capital','performance_fee',0,125160.0,0.0,'USD','paid','2025-02-12',1,NULL),
    ('VC215_INTRO_28','George Guoying CHEN','Set Cap','invested_amount',0,1456000.0,0.0,'USD','paid','2025-12-24',1,NULL),
    ('VC215_INTRO_28','George Guoying CHEN','Set Cap','spread',0,1456000.0,0.0,'USD','paid','2025-12-24',1,NULL),
    ('VC215_INTRO_28','George Guoying CHEN','Set Cap','performance_fee',0,1456000.0,0.0,'USD','paid','2025-12-24',1,NULL),
    ('VC215_INTRO_29','George Guoying CHEN','Bromley Capital','invested_amount',100,1456000.0,8400.0,'USD','paid','2025-12-24',1,NULL),
    ('VC215_INTRO_29','George Guoying CHEN','Bromley Capital','spread',0,1456000.0,0.0,'USD','paid','2025-12-24',1,NULL),
    ('VC215_INTRO_29','George Guoying CHEN','Bromley Capital','performance_fee',0,1456000.0,0.0,'USD','paid','2025-12-24',1,NULL)
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
