-- VC9 Share Data: ALL 16 rows from VC9 sheet
UPDATE public.subscriptions s
SET
    cost_per_share = CASE
        WHEN (i.legal_name LIKE '%STRUCTURED ISSUANCE LIMITED%' OR i.legal_name LIKE '%STRUCTURED%LIMITED%' OR i.legal_name LIKE '%LIMITED%STRUCTURED%') AND s.commitment = 500000.0 THEN 13.5
        WHEN (i.legal_name LIKE '%EENDRACHT TRADING Sarl%' OR i.legal_name LIKE '%EENDRACHT%Sarl%' OR i.legal_name LIKE '%Sarl%EENDRACHT%') AND s.commitment = 125000.0 THEN 13.5
        WHEN (i.legal_name LIKE '%Robert SALMON%' OR i.legal_name LIKE '%Robert%SALMON%' OR i.legal_name LIKE '%SALMON%Robert%') AND s.commitment = 125000.0 THEN 13.5
        WHEN (i.legal_name LIKE '%Michiel VAN DEURSEN%' OR i.legal_name LIKE '%Michiel%DEURSEN%' OR i.legal_name LIKE '%DEURSEN%Michiel%') AND s.commitment = 125000.0 THEN 13.5
        WHEN (i.legal_name LIKE '%EXPAND RESEARCH BV%' OR i.legal_name LIKE '%EXPAND%BV%' OR i.legal_name LIKE '%BV%EXPAND%') AND s.commitment = 150000.0 THEN 13.5
        WHEN (i.legal_name LIKE '%KALE UNITED AB%' OR i.legal_name LIKE '%KALE%AB%' OR i.legal_name LIKE '%AB%KALE%') AND s.commitment = 125000.0 THEN 13.5
        WHEN (i.legal_name LIKE '%Dr Detlef TREFZGER%' OR i.legal_name LIKE '%Dr%TREFZGER%' OR i.legal_name LIKE '%TREFZGER%Dr%') AND s.commitment = 375000.0 THEN 13.5
        WHEN (i.legal_name LIKE '%Oliver FEHR%' OR i.legal_name LIKE '%Oliver%FEHR%' OR i.legal_name LIKE '%FEHR%Oliver%') AND s.commitment = 125000.0 THEN 13.5
        WHEN (i.legal_name LIKE '%Marcel WIPF%' OR i.legal_name LIKE '%Marcel%WIPF%' OR i.legal_name LIKE '%WIPF%Marcel%') AND s.commitment = 125000.0 THEN 13.5
        WHEN (i.legal_name LIKE '%Miro HAECHLER%' OR i.legal_name LIKE '%Miro%HAECHLER%' OR i.legal_name LIKE '%HAECHLER%Miro%') AND s.commitment = 125000.0 THEN 13.5
        WHEN (i.legal_name LIKE '%Vagit SHARIFOV%' OR i.legal_name LIKE '%Vagit%SHARIFOV%' OR i.legal_name LIKE '%SHARIFOV%Vagit%') AND s.commitment = 150006.17 THEN 13.5
        WHEN (i.legal_name LIKE '%German MUSTAFIN%' OR i.legal_name LIKE '%German%MUSTAFIN%' OR i.legal_name LIKE '%MUSTAFIN%German%') AND s.commitment = 150006.17 THEN 13.5
        WHEN (i.legal_name LIKE '%Sergey SINITSKY%' OR i.legal_name LIKE '%Sergey%SINITSKY%' OR i.legal_name LIKE '%SINITSKY%Sergey%') AND s.commitment = 150006.17 THEN 13.5
        WHEN (i.legal_name LIKE '%Viacheslav SAMOILENKO%' OR i.legal_name LIKE '%Viacheslav%SAMOILENKO%' OR i.legal_name LIKE '%SAMOILENKO%Viacheslav%') AND s.commitment = 125001.22 THEN 13.5
        WHEN (i.legal_name LIKE '%Svetlana KHEYFITS%' OR i.legal_name LIKE '%Svetlana%KHEYFITS%' OR i.legal_name LIKE '%KHEYFITS%Svetlana%') AND s.commitment = 550061.83 THEN 13.5
        WHEN (i.legal_name LIKE '%Juan Diego OLAECHEA%' OR i.legal_name LIKE '%Juan%OLAECHEA%' OR i.legal_name LIKE '%OLAECHEA%Juan%') AND s.commitment = 200000.0 THEN 13.5
        ELSE cost_per_share
    END,
    price_per_share = CASE
        WHEN (i.legal_name LIKE '%STRUCTURED ISSUANCE LIMITED%' OR i.legal_name LIKE '%STRUCTURED%LIMITED%' OR i.legal_name LIKE '%LIMITED%STRUCTURED%') AND s.commitment = 500000.0 THEN 23.52
        WHEN (i.legal_name LIKE '%EENDRACHT TRADING Sarl%' OR i.legal_name LIKE '%EENDRACHT%Sarl%' OR i.legal_name LIKE '%Sarl%EENDRACHT%') AND s.commitment = 125000.0 THEN 23.52
        WHEN (i.legal_name LIKE '%Robert SALMON%' OR i.legal_name LIKE '%Robert%SALMON%' OR i.legal_name LIKE '%SALMON%Robert%') AND s.commitment = 125000.0 THEN 23.52
        WHEN (i.legal_name LIKE '%Michiel VAN DEURSEN%' OR i.legal_name LIKE '%Michiel%DEURSEN%' OR i.legal_name LIKE '%DEURSEN%Michiel%') AND s.commitment = 125000.0 THEN 23.52
        WHEN (i.legal_name LIKE '%EXPAND RESEARCH BV%' OR i.legal_name LIKE '%EXPAND%BV%' OR i.legal_name LIKE '%BV%EXPAND%') AND s.commitment = 150000.0 THEN 23.52
        WHEN (i.legal_name LIKE '%KALE UNITED AB%' OR i.legal_name LIKE '%KALE%AB%' OR i.legal_name LIKE '%AB%KALE%') AND s.commitment = 125000.0 THEN 23.52
        WHEN (i.legal_name LIKE '%Dr Detlef TREFZGER%' OR i.legal_name LIKE '%Dr%TREFZGER%' OR i.legal_name LIKE '%TREFZGER%Dr%') AND s.commitment = 375000.0 THEN 23.52
        WHEN (i.legal_name LIKE '%Oliver FEHR%' OR i.legal_name LIKE '%Oliver%FEHR%' OR i.legal_name LIKE '%FEHR%Oliver%') AND s.commitment = 125000.0 THEN 23.52
        WHEN (i.legal_name LIKE '%Marcel WIPF%' OR i.legal_name LIKE '%Marcel%WIPF%' OR i.legal_name LIKE '%WIPF%Marcel%') AND s.commitment = 125000.0 THEN 23.52
        WHEN (i.legal_name LIKE '%Miro HAECHLER%' OR i.legal_name LIKE '%Miro%HAECHLER%' OR i.legal_name LIKE '%HAECHLER%Miro%') AND s.commitment = 125000.0 THEN 23.52
        WHEN (i.legal_name LIKE '%Vagit SHARIFOV%' OR i.legal_name LIKE '%Vagit%SHARIFOV%' OR i.legal_name LIKE '%SHARIFOV%Vagit%') AND s.commitment = 150006.17 THEN 23.523
        WHEN (i.legal_name LIKE '%German MUSTAFIN%' OR i.legal_name LIKE '%German%MUSTAFIN%' OR i.legal_name LIKE '%MUSTAFIN%German%') AND s.commitment = 150006.17 THEN 23.523
        WHEN (i.legal_name LIKE '%Sergey SINITSKY%' OR i.legal_name LIKE '%Sergey%SINITSKY%' OR i.legal_name LIKE '%SINITSKY%Sergey%') AND s.commitment = 150006.17 THEN 23.523
        WHEN (i.legal_name LIKE '%Viacheslav SAMOILENKO%' OR i.legal_name LIKE '%Viacheslav%SAMOILENKO%' OR i.legal_name LIKE '%SAMOILENKO%Viacheslav%') AND s.commitment = 125001.22 THEN 23.523
        WHEN (i.legal_name LIKE '%Svetlana KHEYFITS%' OR i.legal_name LIKE '%Svetlana%KHEYFITS%' OR i.legal_name LIKE '%KHEYFITS%Svetlana%') AND s.commitment = 550061.83 THEN 23.523
        WHEN (i.legal_name LIKE '%Juan Diego OLAECHEA%' OR i.legal_name LIKE '%Juan%OLAECHEA%' OR i.legal_name LIKE '%OLAECHEA%Juan%') AND s.commitment = 200000.0 THEN 23.52
        ELSE price_per_share
    END,
    num_shares = CASE
        WHEN (i.legal_name LIKE '%STRUCTURED ISSUANCE LIMITED%' OR i.legal_name LIKE '%STRUCTURED%LIMITED%' OR i.legal_name LIKE '%LIMITED%STRUCTURED%') AND s.commitment = 500000.0 THEN 21258.0
        WHEN (i.legal_name LIKE '%EENDRACHT TRADING Sarl%' OR i.legal_name LIKE '%EENDRACHT%Sarl%' OR i.legal_name LIKE '%Sarl%EENDRACHT%') AND s.commitment = 125000.0 THEN 5314.0
        WHEN (i.legal_name LIKE '%Robert SALMON%' OR i.legal_name LIKE '%Robert%SALMON%' OR i.legal_name LIKE '%SALMON%Robert%') AND s.commitment = 125000.0 THEN 5314.0
        WHEN (i.legal_name LIKE '%Michiel VAN DEURSEN%' OR i.legal_name LIKE '%Michiel%DEURSEN%' OR i.legal_name LIKE '%DEURSEN%Michiel%') AND s.commitment = 125000.0 THEN 5314.0
        WHEN (i.legal_name LIKE '%EXPAND RESEARCH BV%' OR i.legal_name LIKE '%EXPAND%BV%' OR i.legal_name LIKE '%BV%EXPAND%') AND s.commitment = 150000.0 THEN 6377.0
        WHEN (i.legal_name LIKE '%KALE UNITED AB%' OR i.legal_name LIKE '%KALE%AB%' OR i.legal_name LIKE '%AB%KALE%') AND s.commitment = 125000.0 THEN 5314.0
        WHEN (i.legal_name LIKE '%Dr Detlef TREFZGER%' OR i.legal_name LIKE '%Dr%TREFZGER%' OR i.legal_name LIKE '%TREFZGER%Dr%') AND s.commitment = 375000.0 THEN 15943.0
        WHEN (i.legal_name LIKE '%Oliver FEHR%' OR i.legal_name LIKE '%Oliver%FEHR%' OR i.legal_name LIKE '%FEHR%Oliver%') AND s.commitment = 125000.0 THEN 5314.0
        WHEN (i.legal_name LIKE '%Marcel WIPF%' OR i.legal_name LIKE '%Marcel%WIPF%' OR i.legal_name LIKE '%WIPF%Marcel%') AND s.commitment = 125000.0 THEN 5314.0
        WHEN (i.legal_name LIKE '%Miro HAECHLER%' OR i.legal_name LIKE '%Miro%HAECHLER%' OR i.legal_name LIKE '%HAECHLER%Miro%') AND s.commitment = 125000.0 THEN 5314.0
        WHEN (i.legal_name LIKE '%Vagit SHARIFOV%' OR i.legal_name LIKE '%Vagit%SHARIFOV%' OR i.legal_name LIKE '%SHARIFOV%Vagit%') AND s.commitment = 150006.17 THEN 6377.0
        WHEN (i.legal_name LIKE '%German MUSTAFIN%' OR i.legal_name LIKE '%German%MUSTAFIN%' OR i.legal_name LIKE '%MUSTAFIN%German%') AND s.commitment = 150006.17 THEN 6377.0
        WHEN (i.legal_name LIKE '%Sergey SINITSKY%' OR i.legal_name LIKE '%Sergey%SINITSKY%' OR i.legal_name LIKE '%SINITSKY%Sergey%') AND s.commitment = 150006.17 THEN 6377.0
        WHEN (i.legal_name LIKE '%Viacheslav SAMOILENKO%' OR i.legal_name LIKE '%Viacheslav%SAMOILENKO%' OR i.legal_name LIKE '%SAMOILENKO%Viacheslav%') AND s.commitment = 125001.22 THEN 5314.0
        WHEN (i.legal_name LIKE '%Svetlana KHEYFITS%' OR i.legal_name LIKE '%Svetlana%KHEYFITS%' OR i.legal_name LIKE '%KHEYFITS%Svetlana%') AND s.commitment = 550061.83 THEN 23384.0
        WHEN (i.legal_name LIKE '%Juan Diego OLAECHEA%' OR i.legal_name LIKE '%Juan%OLAECHEA%' OR i.legal_name LIKE '%OLAECHEA%Juan%') AND s.commitment = 200000.0 THEN 8503.0
        ELSE num_shares
    END,
    spread_per_share = price_per_share - cost_per_share,
    spread_fee_amount = (price_per_share - cost_per_share) * num_shares
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC109';