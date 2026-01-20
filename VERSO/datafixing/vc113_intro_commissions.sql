delete from introducer_commissions
where deal_id = '1e4061bd-6e36-4298-8e98-9fd55ab6a448'
  and basis_type in ('invested_amount','spread')
  and introducer_id in ('55b67690-c83d-4406-a2b4-935032d22739','b661243f-e6b4-41f1-b239-de4b197a689a','81e78a56-bed0-45dd-8c52-45566f5895b6','840071c5-c1ee-4617-a120-6e596d2dc97d','1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d');

with dash(introducer_name, investor_name, accrual_amount, rate_bps) as (
    values
    ('Dan', 'Barbara and Heinz WINZ', 1000.000000, 100),
    ('Dan', 'Sandra KOHLER CABIAN', 750.000000, 100),
    ('Dan', 'Markus AKERMANN', 375.000000, 50),
    ('Dan', 'Dalinga AG', 1500.000000, 100),
    ('Dan', 'Dalinga AG', 150.000000, 100),
    ('Dan', 'Liudmila Romanova and Alexey ROMANOV', 4000.000000, 100),
    ('Dan', 'Andrey GORYAINOV', 1000.000000, 100),
    ('Dan', 'Liubov and Igor ZINKEVICH', 1000.000000, 100),
    ('Anand', 'Sheila and Kamlesh MADHVANI', 2000.000000, 200),
    ('Dan', 'ROSEN INVEST HOLDINGS Inc', 2000.000000, 200),
    ('Anand', 'Zandera (Finco) Limited', 20000.000000, 200),
    ('Anand', 'Mark HAYWARD', 1000.000000, 200),
    ('Dan', 'Beatrice and Marcel KNOPF', 1000.000000, 100),
    ('Anand', 'Scott TOMMEY', 3000.000000, 200),
    ('Dan', 'Signet Logistics Ltd', 1000.000000, 100),
    ('Dan', 'Erich GRAF', 1000.000000, 100),
    ('Anand', 'Shrai and Aparna MADHVANI', 2000.000000, 200),
    ('Dan', 'Ivan DE', 500.000000, 100),
    ('Dan', 'Bright Phoenix Holdings LTD', 1000.000000, 100),
    ('Dan', 'TEKAPO Group Limited', 1000.000000, 100),
    ('Dan', 'Philip ALGAR', 500.000000, 100),
    ('Dan', 'Nilakantan MAHESWARI & Subbiah SUBRAMANIAN', 1050.000000, 100),
    ('Dan', 'Rosario Teresa HIQUIANA-TANEJA & Deepak TANEJA', 1100.000000, 100),
    ('Dan', 'SAFE', 5000.000000, 200),
    ('Denis', 'Mayuriben JOGANI', 2000.000000, 200),
    ('Denis', 'Erwan TAROUILLY', 2000.000000, 200),
    ('Anand', 'Zandera (Finco) Limited', 20000.000000, 200),
    ('Terra Financial & Management Services SA', 'Barbara and Heinz WINZ', 2000.000000, 200),
    ('Terra Financial & Management Services SA', 'Markus AKERMANN', 750.000000, 100),
    ('Terra Financial & Management Services SA', 'Dalinga AG', 3000.000000, 200),
    ('Terra Financial & Management Services SA', 'Dalinga AG', 300.000000, 200),
    ('Terra Financial & Management Services SA', 'Liudmila Romanova and Alexey ROMANOV', 8000.000000, 200),
    ('Terra Financial & Management Services SA', 'Andrey GORYAINOV', 2000.000000, 200),
    ('Terra Financial & Management Services SA', 'Liubov and Igor ZINKEVICH', 2000.000000, 200),
    ('Terra Financial & Management Services SA', 'Beatrice and Marcel KNOPF', 2000.000000, 200),
    ('Terra Financial & Management Services SA', 'Signet Logistics Ltd', 2000.000000, 200),
    ('Terra Financial & Management Services SA', 'Erich GRAF', 2000.000000, 200),
    ('Terra Financial & Management Services SA', 'Ivan DE', 1000.000000, 200),
    ('Terra Financial & Management Services SA', 'Philip ALGAR', 1000.000000, 200),
    ('Altras Capital Financing Broker', 'Mark HAYWARD', 3200.000000, 400),
    ('Altras Capital Financing Broker', 'Zandera (Holdco) Limited', 20000.000000, 400),
    ('Altras Capital Financing Broker', 'Zandera (Holdco) Limited', 24000.000000, 400)
),
introducer_map as (
    values
    ('Altras Capital Financing Broker', '55b67690-c83d-4406-a2b4-935032d22739'),
    ('Anand', 'b661243f-e6b4-41f1-b239-de4b197a689a'),
    ('Dan', '81e78a56-bed0-45dd-8c52-45566f5895b6'),
    ('Denis', '840071c5-c1ee-4617-a120-6e596d2dc97d'),
    ('Terra Financial & Management Services SA', '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d')
),
inv_norm as (
    select id as investor_id, regexp_replace(lower(coalesce(legal_name, display_name)), '[^a-z0-9]+', '', 'g') as norm_name
    from investors
),
inputs as (
    select d.investor_name, d.accrual_amount, d.rate_bps, m.column2::uuid as introducer_id,
           regexp_replace(lower(d.investor_name), '[^a-z0-9]+', '', 'g') as norm_name
    from dash d
    join introducer_map m on m.column1 = d.introducer_name
)
insert into introducer_commissions (introducer_id, deal_id, investor_id, basis_type, rate_bps, accrual_amount, currency, status)
select i.introducer_id,
       '1e4061bd-6e36-4298-8e98-9fd55ab6a448',
       inv.investor_id,
       'invested_amount',
       i.rate_bps,
       i.accrual_amount,
       'USD',
       'accrued'
from inputs i
join inv_norm inv on inv.norm_name = i.norm_name;

with dash(introducer_name, investor_name, accrual_amount, rate_bps) as (
    values
    ('Anand', 'Sheila and Kamlesh MADHVANI', 8131.250000, 813),
    ('Anand', 'Zandera (Finco) Limited', 81312.500000, 813),
    ('Anand', 'Mark HAYWARD', 4065.625000, 813),
    ('Anand', 'Scott TOMMEY', 12196.875000, 813),
    ('Anand', 'Shrai and Aparna MADHVANI', 8131.250000, 813),
    ('Anand', 'Zandera (Finco) Limited', 77438.772500, 774),
    ('Anand', 'Mark HAYWARD', 6505.000000, 813),
    ('Anand', 'Zandera (Holdco) Limited', 40656.250000, 813),
    ('Anand', 'Zandera (Holdco) Limited', 47597.085000, 793),
    ('Altras Capital Financing Broker', 'Sheila and Kamlesh MADHVANI', 17500.000000, 1750),
    ('Altras Capital Financing Broker', 'Zandera (Finco) Limited', 175000.000000, 1750),
    ('Altras Capital Financing Broker', 'Mark HAYWARD', 8750.000000, 1750),
    ('Altras Capital Financing Broker', 'Scott TOMMEY', 26250.000000, 1750),
    ('Altras Capital Financing Broker', 'Shrai and Aparna MADHVANI', 17500.000000, 1750),
    ('Altras Capital Financing Broker', 'Zandera (Finco) Limited', 214281.000000, 2143),
    ('Altras Capital Financing Broker', 'Mark HAYWARD', 14000.000000, 1750),
    ('Altras Capital Financing Broker', 'Zandera (Holdco) Limited', 87500.000000, 1750),
    ('Altras Capital Financing Broker', 'Zandera (Holdco) Limited', 117072.000000, 1951)
),
introducer_map as (
    values
    ('Altras Capital Financing Broker', '55b67690-c83d-4406-a2b4-935032d22739'),
    ('Anand', 'b661243f-e6b4-41f1-b239-de4b197a689a'),
    ('Dan', '81e78a56-bed0-45dd-8c52-45566f5895b6'),
    ('Denis', '840071c5-c1ee-4617-a120-6e596d2dc97d'),
    ('Terra Financial & Management Services SA', '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d')
),
inv_norm as (
    select id as investor_id, regexp_replace(lower(coalesce(legal_name, display_name)), '[^a-z0-9]+', '', 'g') as norm_name
    from investors
),
inputs as (
    select d.investor_name, d.accrual_amount, d.rate_bps, m.column2::uuid as introducer_id,
           regexp_replace(lower(d.investor_name), '[^a-z0-9]+', '', 'g') as norm_name
    from dash d
    join introducer_map m on m.column1 = d.introducer_name
)
insert into introducer_commissions (introducer_id, deal_id, investor_id, basis_type, rate_bps, accrual_amount, currency, status)
select i.introducer_id,
       '1e4061bd-6e36-4298-8e98-9fd55ab6a448',
       inv.investor_id,
       'spread',
       i.rate_bps,
       i.accrual_amount,
       'USD',
       'accrued'
from inputs i
join inv_norm inv on inv.norm_name = i.norm_name;
