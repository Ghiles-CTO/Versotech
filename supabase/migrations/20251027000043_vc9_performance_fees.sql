-- VC9 Performance Fees: 16 rows with performance fees (PERCENT ONLY)
UPDATE public.subscriptions s
SET
    performance_fee_tier1_percent = CASE
        WHEN (i.legal_name LIKE '%STRUCTURED ISSUANCE LIMITED%' OR i.legal_name LIKE '%STRUCTURED%LIMITED%' OR i.legal_name LIKE '%LIMITED%STRUCTURED%') AND s.commitment = 500000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%EENDRACHT TRADING Sarl%' OR i.legal_name LIKE '%EENDRACHT%Sarl%' OR i.legal_name LIKE '%Sarl%EENDRACHT%') AND s.commitment = 125000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Robert SALMON%' OR i.legal_name LIKE '%Robert%SALMON%' OR i.legal_name LIKE '%SALMON%Robert%') AND s.commitment = 125000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Michiel VAN DEURSEN%' OR i.legal_name LIKE '%Michiel%DEURSEN%' OR i.legal_name LIKE '%DEURSEN%Michiel%') AND s.commitment = 125000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%EXPAND RESEARCH BV%' OR i.legal_name LIKE '%EXPAND%BV%' OR i.legal_name LIKE '%BV%EXPAND%') AND s.commitment = 150000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%KALE UNITED AB%' OR i.legal_name LIKE '%KALE%AB%' OR i.legal_name LIKE '%AB%KALE%') AND s.commitment = 125000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Dr Detlef TREFZGER%' OR i.legal_name LIKE '%Dr%TREFZGER%' OR i.legal_name LIKE '%TREFZGER%Dr%') AND s.commitment = 375000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Oliver FEHR%' OR i.legal_name LIKE '%Oliver%FEHR%' OR i.legal_name LIKE '%FEHR%Oliver%') AND s.commitment = 125000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Marcel WIPF%' OR i.legal_name LIKE '%Marcel%WIPF%' OR i.legal_name LIKE '%WIPF%Marcel%') AND s.commitment = 125000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Miro HAECHLER%' OR i.legal_name LIKE '%Miro%HAECHLER%' OR i.legal_name LIKE '%HAECHLER%Miro%') AND s.commitment = 125000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Vagit SHARIFOV%' OR i.legal_name LIKE '%Vagit%SHARIFOV%' OR i.legal_name LIKE '%SHARIFOV%Vagit%') AND s.commitment = 150006.17 THEN 0.2
        WHEN (i.legal_name LIKE '%German MUSTAFIN%' OR i.legal_name LIKE '%German%MUSTAFIN%' OR i.legal_name LIKE '%MUSTAFIN%German%') AND s.commitment = 150006.17 THEN 0.2
        WHEN (i.legal_name LIKE '%Sergey SINITSKY%' OR i.legal_name LIKE '%Sergey%SINITSKY%' OR i.legal_name LIKE '%SINITSKY%Sergey%') AND s.commitment = 150006.17 THEN 0.2
        WHEN (i.legal_name LIKE '%Viacheslav SAMOILENKO%' OR i.legal_name LIKE '%Viacheslav%SAMOILENKO%' OR i.legal_name LIKE '%SAMOILENKO%Viacheslav%') AND s.commitment = 125001.22 THEN 0.2
        WHEN (i.legal_name LIKE '%Svetlana KHEYFITS%' OR i.legal_name LIKE '%Svetlana%KHEYFITS%' OR i.legal_name LIKE '%KHEYFITS%Svetlana%') AND s.commitment = 550061.83 THEN 0.2
        WHEN (i.legal_name LIKE '%Juan Diego OLAECHEA%' OR i.legal_name LIKE '%Juan%OLAECHEA%' OR i.legal_name LIKE '%OLAECHEA%Juan%') AND s.commitment = 200000.0 THEN 0.2
        ELSE performance_fee_tier1_percent
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC109';