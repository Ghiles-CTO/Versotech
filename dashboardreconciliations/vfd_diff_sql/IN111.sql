
with vfd as (
  select * from jsonb_to_recordset('[{"row_num":26,"entity_code":"IN111","investor_name":"Boris IPPOLITOV","investor_type":"individual","currency":"EUR","commitment":29919.44,"funded_amount":29919.44,"shares":103,"current_position":77447,"notes":null,"price_per_share":290.48,"cost_per_share":290.48,"subscription_fee_percent":0,"subscription_fee_amount":0,"performance_fee_tier1_percent":0.15,"performance_fee_tier1_threshold":null,"performance_fee_tier2_percent":null,"performance_fee_tier2_threshold":null,"spread_per_share":-0.48,"spread_fee_amount":-49.44,"management_fee_percent":null,"bd_fee_percent":null,"bd_fee_amount":null,"finra_fee_shares":null,"finra_fee_amount":null,"discount_rate":null,"interest_rate":null,"valuation_cap":null,"opportunity_name":"PAPKOT H SAS, France","sourcing_contract_ref":null,"contract_date":"2025-02-19 00:00:00","extra_cols":["Currency","Shares","Current Position","Price Per Share"]}]'::jsonb) as x(
    row_num int,
    entity_code text,
    investor_name text,
    investor_type text,
    currency text,
    commitment numeric,
    funded_amount numeric,
    shares numeric,
    current_position numeric,
    notes text,
    price_per_share numeric,
    cost_per_share numeric,
    subscription_fee_percent numeric,
    subscription_fee_amount numeric,
    performance_fee_tier1_percent numeric,
    performance_fee_tier1_threshold numeric,
    performance_fee_tier2_percent numeric,
    performance_fee_tier2_threshold numeric,
    spread_per_share numeric,
    spread_fee_amount numeric,
    management_fee_percent numeric,
    bd_fee_percent numeric,
    bd_fee_amount numeric,
    finra_fee_shares numeric,
    finra_fee_amount numeric,
    discount_rate numeric,
    interest_rate numeric,
    valuation_cap numeric,
    opportunity_name text,
    sourcing_contract_ref text,
    contract_date date,
    extra_cols text[]
  )
), matched as (
  select vfd.*, v.id as vehicle_id,
         s.id as subscription_id,
         i.id as investor_id,
         coalesce(i.display_name,i.legal_name, trim(coalesce(i.first_name,'')||' '||coalesce(i.last_name,''))) as db_investor,
         i.type as db_investor_type,
         s.currency as db_currency,
         s.commitment as db_commitment,
         s.funded_amount as db_funded_amount,
         s.num_shares as db_shares,
         s.contract_date as db_contract_date,
         s.subscription_fee_amount as db_subscription_fee_amount,
         s.subscription_fee_percent as db_subscription_fee_percent,
         s.spread_fee_amount as db_spread_fee_amount,
         s.spread_per_share as db_spread_per_share,
         s.bd_fee_amount as db_bd_fee_amount,
         s.bd_fee_percent as db_bd_fee_percent,
         s.finra_fee_amount as db_finra_fee_amount,
         s.finra_shares as db_finra_fee_shares,
         s.price_per_share as db_price_per_share,
         s.cost_per_share as db_cost_per_share,
         s.performance_fee_tier1_percent as db_pf1,
         s.performance_fee_tier1_threshold as db_pf1_th,
         s.performance_fee_tier2_percent as db_pf2,
         s.performance_fee_tier2_threshold as db_pf2_th,
         s.management_fee_percent as db_management_fee_percent,
         s.discount_rate as db_discount_rate,
         s.interest_rate as db_interest_rate,
         s.valuation_cap as db_valuation_cap,
         s.opportunity_name as db_opportunity_name,
         s.sourcing_contract_ref as db_sourcing_contract_ref,
         s.acknowledgement_notes as db_notes
  from vfd
  left join vehicles v on v.entity_code = vfd.entity_code
  left join subscriptions s on s.vehicle_id = v.id
     and s.commitment = vfd.commitment
     and ( (s.num_shares is null and vfd.shares is null) or s.num_shares = vfd.shares )
     and ( (s.contract_date is null and vfd.contract_date is null) or s.contract_date = vfd.contract_date )
  left join investors i on i.id = s.investor_id
), with_pos as (
  select m.*, p.units as db_current_position
  from matched m
  left join positions p on p.investor_id=m.investor_id and p.vehicle_id=m.vehicle_id
), with_diffs as (
  select *,
    array_remove(array[CASE WHEN 'Investor Name' = ANY(extra_cols) AND investor_name IS DISTINCT FROM db_investor THEN 'investor_name' END,CASE WHEN 'Investor Type' = ANY(extra_cols) AND investor_type IS DISTINCT FROM db_investor_type THEN 'investor_type' END,CASE WHEN 'Currency' = ANY(extra_cols) AND currency IS DISTINCT FROM db_currency THEN 'currency' END,CASE WHEN 'Commitment' = ANY(extra_cols) AND commitment IS DISTINCT FROM db_commitment THEN 'commitment' END,CASE WHEN 'Funded Amount' = ANY(extra_cols) AND funded_amount IS DISTINCT FROM db_funded_amount THEN 'funded_amount' END,CASE WHEN 'Shares' = ANY(extra_cols) AND shares IS DISTINCT FROM db_shares THEN 'shares' END,CASE WHEN 'Current Position' = ANY(extra_cols) AND current_position IS DISTINCT FROM db_current_position THEN 'current_position' END,CASE WHEN 'Notes' = ANY(extra_cols) AND notes IS DISTINCT FROM db_notes THEN 'notes' END,CASE WHEN 'Price Per Share' = ANY(extra_cols) AND price_per_share IS DISTINCT FROM db_price_per_share THEN 'price_per_share' END,CASE WHEN 'Cost Per Share' = ANY(extra_cols) AND cost_per_share IS DISTINCT FROM db_cost_per_share THEN 'cost_per_share' END,CASE WHEN 'Subscription Fee (%)' = ANY(extra_cols) AND subscription_fee_percent IS DISTINCT FROM db_subscription_fee_percent THEN 'subscription_fee_percent' END,CASE WHEN 'Subscription Fee Amount' = ANY(extra_cols) AND subscription_fee_amount IS DISTINCT FROM db_subscription_fee_amount THEN 'subscription_fee_amount' END,CASE WHEN 'Performance Fee Tier 1 (%)' = ANY(extra_cols) AND performance_fee_tier1_percent IS DISTINCT FROM db_pf1 THEN 'performance_fee_tier1_percent' END,CASE WHEN 'Performance Fee Tier 1 Threshold' = ANY(extra_cols) AND performance_fee_tier1_threshold IS DISTINCT FROM db_pf1_th THEN 'performance_fee_tier1_threshold' END,CASE WHEN 'Performance Fee Tier 2 (%)' = ANY(extra_cols) AND performance_fee_tier2_percent IS DISTINCT FROM db_pf2 THEN 'performance_fee_tier2_percent' END,CASE WHEN 'Performance Fee Tier 2 Threshold' = ANY(extra_cols) AND performance_fee_tier2_threshold IS DISTINCT FROM db_pf2_th THEN 'performance_fee_tier2_threshold' END,CASE WHEN 'Spread Per Share' = ANY(extra_cols) AND spread_per_share IS DISTINCT FROM db_spread_per_share THEN 'spread_per_share' END,CASE WHEN 'Spread Fee Amount' = ANY(extra_cols) AND spread_fee_amount IS DISTINCT FROM db_spread_fee_amount THEN 'spread_fee_amount' END,CASE WHEN 'Management Fee (%)' = ANY(extra_cols) AND management_fee_percent IS DISTINCT FROM db_management_fee_percent THEN 'management_fee_percent' END,CASE WHEN 'BD Fee (%)' = ANY(extra_cols) AND bd_fee_percent IS DISTINCT FROM db_bd_fee_percent THEN 'bd_fee_percent' END,CASE WHEN 'BD Fee Amount' = ANY(extra_cols) AND bd_fee_amount IS DISTINCT FROM db_bd_fee_amount THEN 'bd_fee_amount' END,CASE WHEN 'FINRA Fee Shares' = ANY(extra_cols) AND finra_fee_shares IS DISTINCT FROM db_finra_fee_shares THEN 'finra_fee_shares' END,CASE WHEN 'FINRA Fee Amount' = ANY(extra_cols) AND finra_fee_amount IS DISTINCT FROM db_finra_fee_amount THEN 'finra_fee_amount' END,CASE WHEN 'Discount Rate' = ANY(extra_cols) AND discount_rate IS DISTINCT FROM db_discount_rate THEN 'discount_rate' END,CASE WHEN 'Interest Rate' = ANY(extra_cols) AND interest_rate IS DISTINCT FROM db_interest_rate THEN 'interest_rate' END,CASE WHEN 'Valuation Cap' = ANY(extra_cols) AND valuation_cap IS DISTINCT FROM db_valuation_cap THEN 'valuation_cap' END,CASE WHEN 'Opportunity Name' = ANY(extra_cols) AND opportunity_name IS DISTINCT FROM db_opportunity_name THEN 'opportunity_name' END,CASE WHEN 'Sourcing Contract Ref' = ANY(extra_cols) AND sourcing_contract_ref IS DISTINCT FROM db_sourcing_contract_ref THEN 'sourcing_contract_ref' END,CASE WHEN 'Contract Date' = ANY(extra_cols) AND contract_date IS DISTINCT FROM db_contract_date THEN 'contract_date' END], NULL) as diff_fields,
    jsonb_strip_nulls(jsonb_build_object('investor_name', CASE WHEN 'Investor Name' = ANY(extra_cols) THEN jsonb_build_object('vfd',investor_name,'db',db_investor) END,'investor_type', CASE WHEN 'Investor Type' = ANY(extra_cols) THEN jsonb_build_object('vfd',investor_type,'db',db_investor_type) END,'currency', CASE WHEN 'Currency' = ANY(extra_cols) THEN jsonb_build_object('vfd',currency,'db',db_currency) END,'commitment', CASE WHEN 'Commitment' = ANY(extra_cols) THEN jsonb_build_object('vfd',commitment,'db',db_commitment) END,'funded_amount', CASE WHEN 'Funded Amount' = ANY(extra_cols) THEN jsonb_build_object('vfd',funded_amount,'db',db_funded_amount) END,'shares', CASE WHEN 'Shares' = ANY(extra_cols) THEN jsonb_build_object('vfd',shares,'db',db_shares) END,'current_position', CASE WHEN 'Current Position' = ANY(extra_cols) THEN jsonb_build_object('vfd',current_position,'db',db_current_position) END,'notes', CASE WHEN 'Notes' = ANY(extra_cols) THEN jsonb_build_object('vfd',notes,'db',db_notes) END,'price_per_share', CASE WHEN 'Price Per Share' = ANY(extra_cols) THEN jsonb_build_object('vfd',price_per_share,'db',db_price_per_share) END,'cost_per_share', CASE WHEN 'Cost Per Share' = ANY(extra_cols) THEN jsonb_build_object('vfd',cost_per_share,'db',db_cost_per_share) END,'subscription_fee_percent', CASE WHEN 'Subscription Fee (%)' = ANY(extra_cols) THEN jsonb_build_object('vfd',subscription_fee_percent,'db',db_subscription_fee_percent) END,'subscription_fee_amount', CASE WHEN 'Subscription Fee Amount' = ANY(extra_cols) THEN jsonb_build_object('vfd',subscription_fee_amount,'db',db_subscription_fee_amount) END,'performance_fee_tier1_percent', CASE WHEN 'Performance Fee Tier 1 (%)' = ANY(extra_cols) THEN jsonb_build_object('vfd',performance_fee_tier1_percent,'db',db_pf1) END,'performance_fee_tier1_threshold', CASE WHEN 'Performance Fee Tier 1 Threshold' = ANY(extra_cols) THEN jsonb_build_object('vfd',performance_fee_tier1_threshold,'db',db_pf1_th) END,'performance_fee_tier2_percent', CASE WHEN 'Performance Fee Tier 2 (%)' = ANY(extra_cols) THEN jsonb_build_object('vfd',performance_fee_tier2_percent,'db',db_pf2) END,'performance_fee_tier2_threshold', CASE WHEN 'Performance Fee Tier 2 Threshold' = ANY(extra_cols) THEN jsonb_build_object('vfd',performance_fee_tier2_threshold,'db',db_pf2_th) END,'spread_per_share', CASE WHEN 'Spread Per Share' = ANY(extra_cols) THEN jsonb_build_object('vfd',spread_per_share,'db',db_spread_per_share) END,'spread_fee_amount', CASE WHEN 'Spread Fee Amount' = ANY(extra_cols) THEN jsonb_build_object('vfd',spread_fee_amount,'db',db_spread_fee_amount) END,'management_fee_percent', CASE WHEN 'Management Fee (%)' = ANY(extra_cols) THEN jsonb_build_object('vfd',management_fee_percent,'db',db_management_fee_percent) END,'bd_fee_percent', CASE WHEN 'BD Fee (%)' = ANY(extra_cols) THEN jsonb_build_object('vfd',bd_fee_percent,'db',db_bd_fee_percent) END,'bd_fee_amount', CASE WHEN 'BD Fee Amount' = ANY(extra_cols) THEN jsonb_build_object('vfd',bd_fee_amount,'db',db_bd_fee_amount) END,'finra_fee_shares', CASE WHEN 'FINRA Fee Shares' = ANY(extra_cols) THEN jsonb_build_object('vfd',finra_fee_shares,'db',db_finra_fee_shares) END,'finra_fee_amount', CASE WHEN 'FINRA Fee Amount' = ANY(extra_cols) THEN jsonb_build_object('vfd',finra_fee_amount,'db',db_finra_fee_amount) END,'discount_rate', CASE WHEN 'Discount Rate' = ANY(extra_cols) THEN jsonb_build_object('vfd',discount_rate,'db',db_discount_rate) END,'interest_rate', CASE WHEN 'Interest Rate' = ANY(extra_cols) THEN jsonb_build_object('vfd',interest_rate,'db',db_interest_rate) END,'valuation_cap', CASE WHEN 'Valuation Cap' = ANY(extra_cols) THEN jsonb_build_object('vfd',valuation_cap,'db',db_valuation_cap) END,'opportunity_name', CASE WHEN 'Opportunity Name' = ANY(extra_cols) THEN jsonb_build_object('vfd',opportunity_name,'db',db_opportunity_name) END,'sourcing_contract_ref', CASE WHEN 'Sourcing Contract Ref' = ANY(extra_cols) THEN jsonb_build_object('vfd',sourcing_contract_ref,'db',db_sourcing_contract_ref) END,'contract_date', CASE WHEN 'Contract Date' = ANY(extra_cols) THEN jsonb_build_object('vfd',contract_date,'db',db_contract_date) END)) as change_values
  from with_pos
)
select row_num, entity_code, investor_name, subscription_id, db_investor, diff_fields, change_values
from with_diffs
where subscription_id is null or array_length(diff_fields,1) > 0
order by row_num;
