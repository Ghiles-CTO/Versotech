with dash(investor_name, accrual_amount, spread_pps) as (
    values
    ('CLOUDSAFE HOLDINGS LTD', 13179.960000, 0.620000),
    ('David HOLDEN', 1976.870000, 0.310000),
    ('Imrat HAYAT', 25200.000000, 2.520000),
    ('SOUTH SOUND LTD', 2635.930000, 0.310000),
    ('Constantin-Octavian PATRASCU', 1317.810000, 0.310000),
    ('Hayden RUSHTON', 1317.810000, 0.310000),
    ('Emma Graham-Taylor & Gregory SOMMERVILLE', 1317.810000, 0.310000),
    ('Rabin D. and Dolly LAI', 5356.260000, 1.260000),
    ('Kim LUND', 1317.810000, 0.310000),
    ('Ivan BELGA', 1317.810000, 0.310000),
    ('Imran HAKIM', 1317.810000, 0.310000),
    ('Kenilworth Ltd', 1317.810000, 0.310000),
    ('Bharat JATANIA', 1317.810000, 0.310000),
    ('Bhikhu PATEL', 13392.540000, 1.260000),
    ('Vijaykumar PATEL', 40177.620000, 1.260000),
    ('POTASSIUM Capital', 1317.810000, 0.310000),
    ('Aatif HASSAN', 1317.810000, 0.310000),
    ('GTV Partners SA', 33033.420000, 1.620000),
    ('WEALTH TRAIN LIMITED', 5930.920000, 0.310000),
    ('Murat Cem and Mehmet Can GOKER', 18748.800000, 1.260000),
    ('Cyrus ALAMOUTI', 5356.260000, 1.260000),
    ('Darius ALAMOUTI', 5356.260000, 1.260000),
    ('Kaveh ALAMOUTI', 5356.260000, 1.260000),
    ('Caspian Enterprises Limited', 53571.420000, 1.260000),
    ('GELIGA LIMITED', 26785.080000, 1.260000),
    ('Murat Cem and Mehmet Can GOKER', 34821.360000, 1.260000),
    ('Hossien JAVID', 2677.500000, 1.260000),
    ('Kamyar BADII', 1071.000000, 1.260000),
    ('Shaham SOLOUKI', 2677.500000, 1.260000),
    ('Kian JAVID', 1338.120000, 1.260000),
    ('Salman HUSSAIN', 2677.500000, 1.260000),
    ('Juan TONELLI BANFI', 13392.540000, 1.260000),
    ('GREENLEAF', 132388.650000, 2.010000),
    ('Banco BTG Pactual S.A. Client 12279', 10712.520000, 2.520000),
    ('Banco BTG Pactual S.A. Client 34658', 10712.520000, 2.520000),
    ('Banco BTG Pactual S.A. Client 34924', 10712.520000, 2.520000),
    ('Banco BTG Pactual S.A. Client 36003', 26785.080000, 2.520000),
    ('Banco BTG Pactual S.A. Client 36749', 10712.520000, 2.520000),
    ('Banco BTG Pactual S.A. Client 36957', 10712.520000, 2.520000),
    ('Banco BTG Pactual S.A. Client 80738', 10712.520000, 2.520000),
    ('Banco BTG Pactual S.A. Client 80772', 10712.520000, 2.520000),
    ('Banco BTG Pactual S.A. Client 80775', 10712.520000, 2.520000),
    ('Banco BTG Pactual S.A. Client 80776', 10712.520000, 2.520000),
    ('Banco BTG Pactual S.A. Client 80840', 10712.520000, 2.520000),
    ('Banco BTG Pactual S.A. Client 80862', 10712.520000, 2.520000),
    ('Banco BTG Pactual S.A. Client 80873', 10712.520000, 2.520000),
    ('Banco BTG Pactual S.A. Client 80890', 10712.520000, 2.520000),
    ('Banco BTG Pactual S.A. Client 80910', 10712.520000, 2.520000),
    ('Banco BTG Pactual S.A. Client 81022', 10712.520000, 2.520000),
    ('Banco BTG Pactual S.A. Client 515', 107142.840000, 2.520000),
    ('OLD HILL INVESTMENT GROUP LLC', 59819.610000, 2.010000),
    ('Luiz FONTES WILLIAMS', 4078.000000, 1.000000)
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
