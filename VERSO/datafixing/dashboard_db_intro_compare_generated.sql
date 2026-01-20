with dashboard (vc_code, introducer_name, dash_sub_fee, dash_spread) as (
    values
    ('VC111', 'AUX Business Support Ltd', 6100.000000, 0.000000),
    ('VC111', 'Altras Capital Financing Broker', 20000.000000, 330114.290000),
    ('VC111', 'Daniel Baumslag', 18150.000000, 0.000000),
    ('VC111', 'GEMERA Consulting Pte Ltd', 4000.000000, 0.000000),
    ('VC111', 'Julien', 9000.000000, 0.000000),
    ('VC111', 'Moore & Moore Investments Ltd', 15625.000000, 0.000000),
    ('VC111', 'Stableton+Terra', 7500.000000, 0.000000),
    ('VC111', 'Terra Financial & Management Services SA', 13300.000000, 0.000000),
    ('VC111', 'VERSO PARTNER', 29150.000000, 71428.570000),
    ('VC112', 'FINSA', 2000.000000, 0.000000),
    ('VC112', 'Terra Financial & Management Services SA', 24000.000000, 0.000000),
    ('VC113', 'Altras Capital Financing Broker', 47200.000000, 677853.000000),
    ('VC113', 'Daniel Baumslag', 24925.000000, 0.000000),
    ('VC113', 'Denis', 4000.000000, 0.000000),
    ('VC113', 'Enguerrand Elbaz', 27520.000000, 0.000000),
    ('VC113', 'GEMERA Consulting Pte Ltd', 2000.000000, 0.000000),
    ('VC113', 'Robin', 6000.000000, 0.000000),
    ('VC113', 'Sandro', 8300.000000, 0.000000),
    ('VC113', 'Setcap', 48000.000000, 286034.607500),
    ('VC113', 'Terra Financial & Management Services SA', 26050.000000, 0.000000),
    ('VC118', 'Daniel Baumslag', 10000.000000, 69225.750000),
    ('VC118', 'Terra Financial & Management Services SA', 20000.000000, 0.000000),
    ('VC125', 'Daniel Baumslag', 957.138800, 0.000000),
    ('VC125', 'Terra Financial & Management Services SA', 957.138800, 0.000000),
    ('VC126', 'Alpha Gaia', 6000.000000, 0.000000),
    ('VC126', 'Giovanni SALADINO', 0.000000, 37749.683551),
    ('VC126', 'Moore & Moore Investments Ltd', 6000.000000, 24420.000000),
    ('VC126', 'Pierre Paumier', 4000.000000, 0.000000),
    ('VC126', 'Setcap', 0.000000, 505128.447760),
    ('VC126', 'Setcap+Daniel Baumslag', 0.000000, 21090.000000),
    ('VC126', 'Simone', 0.000000, 38892.000000),
    ('VC133', 'Altras Capital Financing Broker', 50000.000000, 112875.000000),
    ('VC133', 'Elevation Securities', 0.000000, 33750.000000),
    ('VC133', 'Setcap', 5000.000000, 76267.500000)
), db_totals as (
    select v.entity_code as vc_code,
           coalesce(i.display_name, i.legal_name) as introducer_name,
           sum(case when ic.basis_type = 'invested_amount' then ic.accrual_amount else 0 end) as db_sub_fee,
           sum(case when ic.basis_type = 'spread' then ic.accrual_amount else 0 end) as db_spread
    from introducer_commissions ic
    join introducers i on i.id = ic.introducer_id
    join deals d on d.id = ic.deal_id
    join vehicles v on v.id = d.vehicle_id
    group by v.entity_code, coalesce(i.display_name, i.legal_name)
)
select coalesce(d.vc_code, db.vc_code) as vc_code,
       coalesce(d.introducer_name, db.introducer_name) as introducer_name,
       d.dash_sub_fee,
       db.db_sub_fee,
       d.dash_spread,
       db.db_spread,
       (coalesce(db.db_sub_fee, 0) - coalesce(d.dash_sub_fee, 0)) as sub_fee_diff,
       (coalesce(db.db_spread, 0) - coalesce(d.dash_spread, 0)) as spread_diff
from dashboard d
full join db_totals db
  on db.vc_code = d.vc_code
 and lower(db.introducer_name) = lower(d.introducer_name)
order by vc_code, introducer_name;
