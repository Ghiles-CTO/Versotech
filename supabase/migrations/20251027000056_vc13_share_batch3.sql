-- VC13 Share Data Batch 3/3
UPDATE public.subscriptions s
SET
    cost_per_share = CASE
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 100000.0 THEN 6.842
        WHEN (i.legal_name LIKE '%Denis MATTHEY%' OR i.legal_name LIKE '%Denis%MATTHEY%' OR i.legal_name LIKE '%MATTHEY%Denis%') AND s.commitment = 100000.0 THEN 6.842
        WHEN (i.legal_name LIKE '%Robert DETTMEIJER%' OR i.legal_name LIKE '%Robert%DETTMEIJER%' OR i.legal_name LIKE '%DETTMEIJER%Robert%') AND s.commitment = 25000.0 THEN 6.842
        WHEN (i.legal_name LIKE '%Daniel BAUMSLAG%' OR i.legal_name LIKE '%Daniel%BAUMSLAG%' OR i.legal_name LIKE '%BAUMSLAG%Daniel%') AND s.commitment = 25000.0 THEN 6.842
        WHEN (i.legal_name LIKE '%SMR3T Capital Pte Ltd%' OR i.legal_name LIKE '%SMR3T%Ltd%' OR i.legal_name LIKE '%Ltd%SMR3T%') AND s.commitment = 100000.0 THEN 6.842
        WHEN (i.legal_name LIKE '%CLOUD IN HEAVEN SAS%' OR i.legal_name LIKE '%CLOUD%SAS%' OR i.legal_name LIKE '%SAS%CLOUD%') AND s.commitment = 25000.0 THEN 6.842
        WHEN (i.legal_name LIKE '%Majid MOHAMMED%' OR i.legal_name LIKE '%Majid%MOHAMMED%' OR i.legal_name LIKE '%MOHAMMED%Majid%') AND s.commitment = 100000.0 THEN 6.842
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 25000.0 THEN 6.842
        WHEN (i.legal_name LIKE '%AS ADVISORY DWC LLC%' OR i.legal_name LIKE '%AS%LLC%' OR i.legal_name LIKE '%LLC%AS%') AND s.commitment = 100000.0 THEN 6.842
        WHEN (i.legal_name LIKE '%OEP Ltd%' OR i.legal_name LIKE '%OEP%Ltd%' OR i.legal_name LIKE '%Ltd%OEP%') AND s.commitment = 100000.0 THEN 6.842
        WHEN i.legal_name LIKE '%PETRATECH%' AND s.commitment = 50000.0 THEN 6.842
        WHEN (i.legal_name LIKE '%FRALIS SPF%' OR i.legal_name LIKE '%FRALIS%SPF%' OR i.legal_name LIKE '%SPF%FRALIS%') AND s.commitment = 100000.0 THEN 6.842
        WHEN (i.legal_name LIKE '%Benjamin POURRAT%' OR i.legal_name LIKE '%Benjamin%POURRAT%' OR i.legal_name LIKE '%POURRAT%Benjamin%') AND s.commitment = 12755.1 THEN 26.495
        WHEN (i.legal_name LIKE '%Mark MATTHEWS%' OR i.legal_name LIKE '%Mark%MATTHEWS%' OR i.legal_name LIKE '%MATTHEWS%Mark%') AND s.commitment = 50000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%Scott FLETCHER%' OR i.legal_name LIKE '%Scott%FLETCHER%' OR i.legal_name LIKE '%FLETCHER%Scott%') AND s.commitment = 2000000.0 THEN 27.5612
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 2000000.0 THEN 26.8314
        WHEN (i.legal_name LIKE '%Mark HAYWARD%' OR i.legal_name LIKE '%Mark%HAYWARD%' OR i.legal_name LIKE '%HAYWARD%Mark%') AND s.commitment = 80000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%Zandera (Holdco) Limited%' OR i.legal_name LIKE '%Zandera%Limited%' OR i.legal_name LIKE '%Limited%Zandera%') AND s.commitment = 500000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%Sheikh Yousef AL SABAH%' OR i.legal_name LIKE '%Sheikh%SABAH%' OR i.legal_name LIKE '%SABAH%Sheikh%') AND s.commitment = 50000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%Andrew MEYER%' OR i.legal_name LIKE '%Andrew%MEYER%' OR i.legal_name LIKE '%MEYER%Andrew%') AND s.commitment = 200000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%Abhie SHAH%' OR i.legal_name LIKE '%Abhie%SHAH%' OR i.legal_name LIKE '%SHAH%Abhie%') AND s.commitment = 100000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%Deyan MIHOV%' OR i.legal_name LIKE '%Deyan%MIHOV%' OR i.legal_name LIKE '%MIHOV%Deyan%') AND s.commitment = 90000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%Zandera (Holdco) Limited%' OR i.legal_name LIKE '%Zandera%Limited%' OR i.legal_name LIKE '%Limited%Zandera%') AND s.commitment = 600000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 50000.0 THEN 6.842
        WHEN (i.legal_name LIKE '%Keir BENBOW%' OR i.legal_name LIKE '%Keir%BENBOW%' OR i.legal_name LIKE '%BENBOW%Keir%') AND s.commitment = 50000.0 THEN 26.495
        ELSE cost_per_share
    END,
    price_per_share = CASE
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 100000.0 THEN 6.842
        WHEN (i.legal_name LIKE '%Denis MATTHEY%' OR i.legal_name LIKE '%Denis%MATTHEY%' OR i.legal_name LIKE '%MATTHEY%Denis%') AND s.commitment = 100000.0 THEN 6.842
        WHEN (i.legal_name LIKE '%Robert DETTMEIJER%' OR i.legal_name LIKE '%Robert%DETTMEIJER%' OR i.legal_name LIKE '%DETTMEIJER%Robert%') AND s.commitment = 25000.0 THEN 6.842
        WHEN (i.legal_name LIKE '%Daniel BAUMSLAG%' OR i.legal_name LIKE '%Daniel%BAUMSLAG%' OR i.legal_name LIKE '%BAUMSLAG%Daniel%') AND s.commitment = 25000.0 THEN 6.842
        WHEN (i.legal_name LIKE '%SMR3T Capital Pte Ltd%' OR i.legal_name LIKE '%SMR3T%Ltd%' OR i.legal_name LIKE '%Ltd%SMR3T%') AND s.commitment = 100000.0 THEN 6.842
        WHEN (i.legal_name LIKE '%CLOUD IN HEAVEN SAS%' OR i.legal_name LIKE '%CLOUD%SAS%' OR i.legal_name LIKE '%SAS%CLOUD%') AND s.commitment = 25000.0 THEN 6.842
        WHEN (i.legal_name LIKE '%Majid MOHAMMED%' OR i.legal_name LIKE '%Majid%MOHAMMED%' OR i.legal_name LIKE '%MOHAMMED%Majid%') AND s.commitment = 100000.0 THEN 6.842
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 25000.0 THEN 6.842
        WHEN (i.legal_name LIKE '%AS ADVISORY DWC LLC%' OR i.legal_name LIKE '%AS%LLC%' OR i.legal_name LIKE '%LLC%AS%') AND s.commitment = 100000.0 THEN 6.842
        WHEN (i.legal_name LIKE '%OEP Ltd%' OR i.legal_name LIKE '%OEP%Ltd%' OR i.legal_name LIKE '%Ltd%OEP%') AND s.commitment = 100000.0 THEN 6.842
        WHEN i.legal_name LIKE '%PETRATECH%' AND s.commitment = 50000.0 THEN 6.842
        WHEN (i.legal_name LIKE '%FRALIS SPF%' OR i.legal_name LIKE '%FRALIS%SPF%' OR i.legal_name LIKE '%SPF%FRALIS%') AND s.commitment = 100000.0 THEN 6.842
        WHEN (i.legal_name LIKE '%Benjamin POURRAT%' OR i.legal_name LIKE '%Benjamin%POURRAT%' OR i.legal_name LIKE '%POURRAT%Benjamin%') AND s.commitment = 12755.1 THEN 26.495
        WHEN (i.legal_name LIKE '%Mark MATTHEWS%' OR i.legal_name LIKE '%Mark%MATTHEWS%' OR i.legal_name LIKE '%MATTHEWS%Mark%') AND s.commitment = 50000.0 THEN 29.5
        WHEN (i.legal_name LIKE '%Scott FLETCHER%' OR i.legal_name LIKE '%Scott%FLETCHER%' OR i.legal_name LIKE '%FLETCHER%Scott%') AND s.commitment = 2000000.0 THEN 26.8314
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 2000000.0 THEN 26.8314
        WHEN (i.legal_name LIKE '%Mark HAYWARD%' OR i.legal_name LIKE '%Mark%HAYWARD%' OR i.legal_name LIKE '%HAYWARD%Mark%') AND s.commitment = 80000.0 THEN 40.0
        WHEN (i.legal_name LIKE '%Zandera (Holdco) Limited%' OR i.legal_name LIKE '%Zandera%Limited%' OR i.legal_name LIKE '%Limited%Zandera%') AND s.commitment = 500000.0 THEN 40.0
        WHEN (i.legal_name LIKE '%Sheikh Yousef AL SABAH%' OR i.legal_name LIKE '%Sheikh%SABAH%' OR i.legal_name LIKE '%SABAH%Sheikh%') AND s.commitment = 50000.0 THEN 29.5
        WHEN (i.legal_name LIKE '%Andrew MEYER%' OR i.legal_name LIKE '%Andrew%MEYER%' OR i.legal_name LIKE '%MEYER%Andrew%') AND s.commitment = 200000.0 THEN 29.5
        WHEN (i.legal_name LIKE '%Abhie SHAH%' OR i.legal_name LIKE '%Abhie%SHAH%' OR i.legal_name LIKE '%SHAH%Abhie%') AND s.commitment = 100000.0 THEN 29.5
        WHEN (i.legal_name LIKE '%Deyan MIHOV%' OR i.legal_name LIKE '%Deyan%MIHOV%' OR i.legal_name LIKE '%MIHOV%Deyan%') AND s.commitment = 90000.0 THEN 26.8314
        WHEN (i.legal_name LIKE '%Zandera (Holdco) Limited%' OR i.legal_name LIKE '%Zandera%Limited%' OR i.legal_name LIKE '%Limited%Zandera%') AND s.commitment = 600000.0 THEN 41.0
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 50000.0 THEN 6.842
        WHEN (i.legal_name LIKE '%Keir BENBOW%' OR i.legal_name LIKE '%Keir%BENBOW%' OR i.legal_name LIKE '%BENBOW%Keir%') AND s.commitment = 50000.0 THEN 29.5
        ELSE price_per_share
    END,
    num_shares = CASE
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 100000.0 THEN 14615.0
        WHEN (i.legal_name LIKE '%Denis MATTHEY%' OR i.legal_name LIKE '%Denis%MATTHEY%' OR i.legal_name LIKE '%MATTHEY%Denis%') AND s.commitment = 100000.0 THEN 14615.0
        WHEN (i.legal_name LIKE '%Robert DETTMEIJER%' OR i.legal_name LIKE '%Robert%DETTMEIJER%' OR i.legal_name LIKE '%DETTMEIJER%Robert%') AND s.commitment = 25000.0 THEN 3653.0
        WHEN (i.legal_name LIKE '%Daniel BAUMSLAG%' OR i.legal_name LIKE '%Daniel%BAUMSLAG%' OR i.legal_name LIKE '%BAUMSLAG%Daniel%') AND s.commitment = 25000.0 THEN 3653.0
        WHEN (i.legal_name LIKE '%SMR3T Capital Pte Ltd%' OR i.legal_name LIKE '%SMR3T%Ltd%' OR i.legal_name LIKE '%Ltd%SMR3T%') AND s.commitment = 100000.0 THEN 14615.0
        WHEN (i.legal_name LIKE '%CLOUD IN HEAVEN SAS%' OR i.legal_name LIKE '%CLOUD%SAS%' OR i.legal_name LIKE '%SAS%CLOUD%') AND s.commitment = 25000.0 THEN 3653.0
        WHEN (i.legal_name LIKE '%Majid MOHAMMED%' OR i.legal_name LIKE '%Majid%MOHAMMED%' OR i.legal_name LIKE '%MOHAMMED%Majid%') AND s.commitment = 100000.0 THEN 14615.0
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 25000.0 THEN 3661.0
        WHEN (i.legal_name LIKE '%AS ADVISORY DWC LLC%' OR i.legal_name LIKE '%AS%LLC%' OR i.legal_name LIKE '%LLC%AS%') AND s.commitment = 100000.0 THEN 14615.0
        WHEN (i.legal_name LIKE '%OEP Ltd%' OR i.legal_name LIKE '%OEP%Ltd%' OR i.legal_name LIKE '%Ltd%OEP%') AND s.commitment = 100000.0 THEN 14615.0
        WHEN i.legal_name LIKE '%PETRATECH%' AND s.commitment = 50000.0 THEN 7307.0
        WHEN (i.legal_name LIKE '%FRALIS SPF%' OR i.legal_name LIKE '%FRALIS%SPF%' OR i.legal_name LIKE '%SPF%FRALIS%') AND s.commitment = 100000.0 THEN 14615.0
        WHEN (i.legal_name LIKE '%Benjamin POURRAT%' OR i.legal_name LIKE '%Benjamin%POURRAT%' OR i.legal_name LIKE '%POURRAT%Benjamin%') AND s.commitment = 12755.1 THEN 481.0
        WHEN (i.legal_name LIKE '%Mark MATTHEWS%' OR i.legal_name LIKE '%Mark%MATTHEWS%' OR i.legal_name LIKE '%MATTHEWS%Mark%') AND s.commitment = 50000.0 THEN 1694.0
        WHEN (i.legal_name LIKE '%Scott FLETCHER%' OR i.legal_name LIKE '%Scott%FLETCHER%' OR i.legal_name LIKE '%FLETCHER%Scott%') AND s.commitment = 2000000.0 THEN 74539.0
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 2000000.0 THEN 74539.0
        WHEN (i.legal_name LIKE '%Mark HAYWARD%' OR i.legal_name LIKE '%Mark%HAYWARD%' OR i.legal_name LIKE '%HAYWARD%Mark%') AND s.commitment = 80000.0 THEN 2000.0
        WHEN (i.legal_name LIKE '%Zandera (Holdco) Limited%' OR i.legal_name LIKE '%Zandera%Limited%' OR i.legal_name LIKE '%Limited%Zandera%') AND s.commitment = 500000.0 THEN 12500.0
        WHEN (i.legal_name LIKE '%Sheikh Yousef AL SABAH%' OR i.legal_name LIKE '%Sheikh%SABAH%' OR i.legal_name LIKE '%SABAH%Sheikh%') AND s.commitment = 50000.0 THEN 1694.0
        WHEN (i.legal_name LIKE '%Andrew MEYER%' OR i.legal_name LIKE '%Andrew%MEYER%' OR i.legal_name LIKE '%MEYER%Andrew%') AND s.commitment = 200000.0 THEN 6779.0
        WHEN (i.legal_name LIKE '%Abhie SHAH%' OR i.legal_name LIKE '%Abhie%SHAH%' OR i.legal_name LIKE '%SHAH%Abhie%') AND s.commitment = 100000.0 THEN 3389.0
        WHEN (i.legal_name LIKE '%Deyan MIHOV%' OR i.legal_name LIKE '%Deyan%MIHOV%' OR i.legal_name LIKE '%MIHOV%Deyan%') AND s.commitment = 90000.0 THEN 3354.0
        WHEN (i.legal_name LIKE '%Zandera (Holdco) Limited%' OR i.legal_name LIKE '%Zandera%Limited%' OR i.legal_name LIKE '%Limited%Zandera%') AND s.commitment = 600000.0 THEN 14634.0
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 50000.0 THEN 7307.0
        WHEN (i.legal_name LIKE '%Keir BENBOW%' OR i.legal_name LIKE '%Keir%BENBOW%' OR i.legal_name LIKE '%BENBOW%Keir%') AND s.commitment = 50000.0 THEN 1694.0
        ELSE num_shares
    END,
    spread_per_share = price_per_share - cost_per_share,
    spread_fee_amount = (price_per_share - cost_per_share) * num_shares
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC113';
