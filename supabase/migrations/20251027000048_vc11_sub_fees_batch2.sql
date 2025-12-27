-- VC11 Subscription Fees Batch 2/2
UPDATE public.subscriptions s
SET
    subscription_fee_percent = CASE
        WHEN (i.legal_name LIKE '%Alberto RAVANO%' OR i.legal_name LIKE '%Alberto%RAVANO%' OR i.legal_name LIKE '%RAVANO%Alberto%') AND s.commitment = 100000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%FINALMA SUISSE SA%' OR i.legal_name LIKE '%FINALMA%SA%' OR i.legal_name LIKE '%SA%FINALMA%') AND s.commitment = 50000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%MONFIN LTD%' OR i.legal_name LIKE '%MONFIN%LTD%' OR i.legal_name LIKE '%LTD%MONFIN%') AND s.commitment = 50000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Bright Phoenix Holdings LTD%' OR i.legal_name LIKE '%Bright%LTD%' OR i.legal_name LIKE '%LTD%Bright%') AND s.commitment = 100000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Antonio PERONACE%' OR i.legal_name LIKE '%Antonio%PERONACE%' OR i.legal_name LIKE '%PERONACE%Antonio%') AND s.commitment = 70000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%BRAHMA FINANCE%' OR i.legal_name LIKE '%BRAHMA%FINANCE%' OR i.legal_name LIKE '%FINANCE%BRAHMA%') AND s.commitment = 250000.0 THEN 0.02
        WHEN (i.legal_name LIKE '%GTV Partners SA%' OR i.legal_name LIKE '%GTV%SA%' OR i.legal_name LIKE '%SA%GTV%') AND s.commitment = 600000.0 THEN 0.03
        WHEN (i.legal_name LIKE '%Beatrice and Marcel KNOPF%' OR i.legal_name LIKE '%Beatrice%KNOPF%' OR i.legal_name LIKE '%KNOPF%Beatrice%') AND s.commitment = 100000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%BenSkyla AG%' OR i.legal_name LIKE '%BenSkyla%AG%' OR i.legal_name LIKE '%AG%BenSkyla%') AND s.commitment = 200000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Peter HOGLAND%' OR i.legal_name LIKE '%Peter%HOGLAND%' OR i.legal_name LIKE '%HOGLAND%Peter%') AND s.commitment = 150000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Wymo Finance Limited%' OR i.legal_name LIKE '%Wymo%Limited%' OR i.legal_name LIKE '%Limited%Wymo%') AND s.commitment = 500000.0 THEN 0.02
        WHEN (i.legal_name LIKE '%HASSBRO Investments Limited%' OR i.legal_name LIKE '%HASSBRO%Limited%' OR i.legal_name LIKE '%Limited%HASSBRO%') AND s.commitment = 500000.0 THEN 0.02
        WHEN (i.legal_name LIKE '%Vladimir GUSEV%' OR i.legal_name LIKE '%Vladimir%GUSEV%' OR i.legal_name LIKE '%GUSEV%Vladimir%') AND s.commitment = 100000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Vladimir GUSEV%' OR i.legal_name LIKE '%Vladimir%GUSEV%' OR i.legal_name LIKE '%GUSEV%Vladimir%') AND s.commitment = 50000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Zandera (Finco) Limited%' OR i.legal_name LIKE '%Zandera%Limited%' OR i.legal_name LIKE '%Limited%Zandera%') AND s.commitment = 571428.57 THEN 0.04
        WHEN (i.legal_name LIKE '%TERRA Financial & Management Services SA%' OR i.legal_name LIKE '%TERRA%SA%' OR i.legal_name LIKE '%SA%TERRA%') AND s.commitment = 30000.0 THEN 0.02
        ELSE subscription_fee_percent
    END,
    subscription_fee_amount = CASE
        WHEN (i.legal_name LIKE '%Alberto RAVANO%' OR i.legal_name LIKE '%Alberto%RAVANO%' OR i.legal_name LIKE '%RAVANO%Alberto%') AND s.commitment = 100000.0 THEN 4000.0
        WHEN (i.legal_name LIKE '%FINALMA SUISSE SA%' OR i.legal_name LIKE '%FINALMA%SA%' OR i.legal_name LIKE '%SA%FINALMA%') AND s.commitment = 50000.0 THEN 2000.0
        WHEN (i.legal_name LIKE '%MONFIN LTD%' OR i.legal_name LIKE '%MONFIN%LTD%' OR i.legal_name LIKE '%LTD%MONFIN%') AND s.commitment = 50000.0 THEN 2000.0
        WHEN (i.legal_name LIKE '%Bright Phoenix Holdings LTD%' OR i.legal_name LIKE '%Bright%LTD%' OR i.legal_name LIKE '%LTD%Bright%') AND s.commitment = 100000.0 THEN 4000.0
        WHEN (i.legal_name LIKE '%Antonio PERONACE%' OR i.legal_name LIKE '%Antonio%PERONACE%' OR i.legal_name LIKE '%PERONACE%Antonio%') AND s.commitment = 70000.0 THEN 2800.0
        WHEN (i.legal_name LIKE '%BRAHMA FINANCE%' OR i.legal_name LIKE '%BRAHMA%FINANCE%' OR i.legal_name LIKE '%FINANCE%BRAHMA%') AND s.commitment = 250000.0 THEN 5000.0
        WHEN (i.legal_name LIKE '%GTV Partners SA%' OR i.legal_name LIKE '%GTV%SA%' OR i.legal_name LIKE '%SA%GTV%') AND s.commitment = 600000.0 THEN 18000.0
        WHEN (i.legal_name LIKE '%Beatrice and Marcel KNOPF%' OR i.legal_name LIKE '%Beatrice%KNOPF%' OR i.legal_name LIKE '%KNOPF%Beatrice%') AND s.commitment = 100000.0 THEN 4000.0
        WHEN (i.legal_name LIKE '%BenSkyla AG%' OR i.legal_name LIKE '%BenSkyla%AG%' OR i.legal_name LIKE '%AG%BenSkyla%') AND s.commitment = 200000.0 THEN 8000.0
        WHEN (i.legal_name LIKE '%Peter HOGLAND%' OR i.legal_name LIKE '%Peter%HOGLAND%' OR i.legal_name LIKE '%HOGLAND%Peter%') AND s.commitment = 150000.0 THEN 6000.0
        WHEN (i.legal_name LIKE '%Wymo Finance Limited%' OR i.legal_name LIKE '%Wymo%Limited%' OR i.legal_name LIKE '%Limited%Wymo%') AND s.commitment = 500000.0 THEN 10000.0
        WHEN (i.legal_name LIKE '%HASSBRO Investments Limited%' OR i.legal_name LIKE '%HASSBRO%Limited%' OR i.legal_name LIKE '%Limited%HASSBRO%') AND s.commitment = 500000.0 THEN 10000.0
        WHEN (i.legal_name LIKE '%Vladimir GUSEV%' OR i.legal_name LIKE '%Vladimir%GUSEV%' OR i.legal_name LIKE '%GUSEV%Vladimir%') AND s.commitment = 100000.0 THEN 4000.0
        WHEN (i.legal_name LIKE '%Vladimir GUSEV%' OR i.legal_name LIKE '%Vladimir%GUSEV%' OR i.legal_name LIKE '%GUSEV%Vladimir%') AND s.commitment = 50000.0 THEN 2000.0
        WHEN (i.legal_name LIKE '%Zandera (Finco) Limited%' OR i.legal_name LIKE '%Zandera%Limited%' OR i.legal_name LIKE '%Limited%Zandera%') AND s.commitment = 571428.57 THEN 40000.0
        WHEN (i.legal_name LIKE '%TERRA Financial & Management Services SA%' OR i.legal_name LIKE '%TERRA%SA%' OR i.legal_name LIKE '%SA%TERRA%') AND s.commitment = 30000.0 THEN 600.0
        ELSE subscription_fee_amount
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC111';