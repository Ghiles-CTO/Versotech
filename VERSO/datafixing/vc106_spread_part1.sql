with dash(investor_name, accrual_amount, spread_pps) as (
    values
    ('Chang NGAN', 5040.000000, 0.900000),
    ('SHEILA and KAMLESH MADHVANI', 40000.000000, 4.000000),
    ('SAMIR KOHI', 10000.000000, 2.000000),
    ('Han CHIH-HENG', 4999.500000, 0.900000),
    ('Daryl YONGJIE', 8250.300000, 0.900000),
    ('Ekkawat SAE-JEE', 1249.200000, 0.900000),
    ('Tan GEOK', 4003.200000, 0.900000),
    ('DALINGA HOLDING AG', 3768.000000, 1.500000),
    ('Matteo MARTINI', 7537.500000, 1.500000),
    ('AS ADVISORY DWC-LLC', 35712.000000, 3.000000),
    ('OEP Ltd', 35715.000000, 3.000000),
    ('KRANA INVESTMENTS PTE. LTD.', 20999.034000, 1.533000),
    ('Johann AKERMANN', 15000.000000, 1.500000),
    ('Sandra CABIAN', 3768.000000, 1.500000),
    ('Dario SCIMONE', 5980.000000, 2.500000),
    ('OFBR Trust', 13941.600000, 1.570000),
    ('Elidon Estate Inc', 13999.356000, 1.533000),
    ('Adam Smith Singapore Pte Ltd', 1749.153000, 1.533000),
    ('CAUSE FIRST Holdings Ltd', 6806.520000, 1.533000),
    ('Anisha Bansal and Rahul KARKUN', 9088.000000, 4.000000),
    ('Craig BROWN', 5000.000000, 2.000000),
    ('TRUE INVESTMENTS 4 LLC', 57104.250000, 1.750000),
    ('ROSEN INVEST HOLDINGS Inc', 6806.520000, 1.533000),
    ('Nilakantan MAHESWARI & Subbiah SUBRAMANIAN', 10321.689000, 1.533000),
    ('Hedgebay Securities LLC', 8716.600000, 2.050000),
    ('Hedgebay Securities LLC', 2177.100000, 2.050000),
    ('Hedgebay Securities LLC', 2177.100000, 2.050000),
    ('Hedgebay Securities LLC', 2177.100000, 2.050000),
    ('ONC Limited', 65901.350000, 0.310000),
    ('Mohammed AL ABBASI', 31750.000000, 2.500000),
    ('Patrick CORR', 13179.960000, 0.620000),
    ('Stephen JORDAN', 4217.240000, 0.620000),
    ('FigTree Family Office Ltd', 9489.720000, 0.620000),
    ('Oliver WRIGHT', 1317.500000, 0.620000),
    ('Emile VAN DEN BOL', 2635.620000, 0.620000),
    ('Mark MATTHEWS', 2635.620000, 0.620000),
    ('Matthew HAYCOX', 1976.560000, 0.620000),
    ('John ACKERLEY', 1317.500000, 0.620000),
    ('Steve MANNING', 1317.500000, 0.620000),
    ('Global Custody & Clearing Limited', 37293.000000, 0.620000),
    ('Gregory BROOKS', 1317.500000, 0.620000),
    ('Stephane DAHAN', 5271.860000, 0.620000),
    ('Jean DUTIL', 2635.620000, 0.620000),
    ('Sudon Carlop Holdings Limited', 2635.620000, 0.620000),
    ('Lesli SCHUTTE', 1317.500000, 0.620000),
    ('Manraj SEKHON', 29930.560000, 1.760000),
    ('Erich GRAF', 1360.320000, 0.320000),
    ('Shana NUSSBERGER', 9106.020000, 1.260000),
    ('JASSQ HOLDING LIMITED', 2550.900000, 0.300000),
    ('INNOSIGHT VENTURES Pte Ltd', 20000.000000, 0.800000),
    ('INNOSIGHT VENTURES Pte Ltd', 5600.000000, 0.800000),
    ('GORILLA PE Inc', 1760203.800000, 2.760000)
),
inv_norm as (
    select id as investor_id, regexp_replace(lower(coalesce(legal_name, display_name)), '[^a-z0-9]+', '', 'g') as norm_name
    from investors
),
inputs as (
    select d.accrual_amount, d.spread_pps, inv.investor_id
    from dash d
    join inv_norm inv
      on inv.norm_name = regexp_replace(lower(d.investor_name), '[^a-z0-9]+', '', 'g')
),
sub as (
    select investor_id, price_per_share, num_shares
    from subscriptions
    where deal_id = '07eff085-9f1d-4e02-b1e2-d717817503f1'
),
joined as (
    select i.investor_id, i.accrual_amount, i.spread_pps, s.price_per_share
    from inputs i
    left join sub s
      on s.investor_id = i.investor_id
     and round(s.num_shares::numeric, 3) = round(i.accrual_amount / i.spread_pps, 3)
)
insert into introducer_commissions (introducer_id, deal_id, investor_id, basis_type, rate_bps, accrual_amount, currency, status)
select '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
       '07eff085-9f1d-4e02-b1e2-d717817503f1',
       j.investor_id,
       'spread',
       case
         when j.price_per_share is not null and j.price_per_share <> 0
           then round(j.spread_pps / j.price_per_share * 10000)::int
         else 0
       end,
       j.accrual_amount,
       'USD',
       'accrued'
from joined j;
