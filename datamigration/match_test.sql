
WITH all_matches AS (

    -- VC106: 160 names to match
    SELECT 
        'VC106' as vehicle,
        d.name as dashboard_name,
        inv.id as investor_id,
        inv.legal_name as db_legal_name,
        CASE WHEN inv.id IS NOT NULL THEN 1 ELSE 0 END as matched
    FROM (VALUES ('OLD HILL INVESTMENT GROUP LLC'), ('Bright Phoenix Holdings Limited'), ('OEP Ltd'), ('DALINGA HOLDING AG'), ('DUTIL'), ('SOUTH SOUND LTD'), ('LENN Participations SARL'), ('GUERIN'), ('HAKIM'), ('Banco BTG Pactual S.A. Client 36749'), ('JASSQ HOLDING LIMITED'), ('HAYAT'), ('Banco BTG Pactual S.A. Client 80776'), ('BACHELIER'), ('Banco BTG Pactual S.A. Client 515'), ('PATEL'), ('GTV Partners SA'), ('Elidon Estate Inc'), ('JIMENEZ TRADING INC'), ('OFBR Trust'), ('DAHAN'), ('HAYCOX'), ('Caspian Enterprises Limited'), ('Phaena Advisory Ltd'), ('RIENZO'), ('JAYARAMAN'), ('CUDRE-MAUROUX'), ('MATTHEWS'), ('SOMMERVILLE'), ('Bahama Global Towers Limited'), ('CHANG'), ('MUKHTAR'), ('HASSAN'), ('BELGA'), ('ALAMOUTI'), ('GHESQUIERES'), ('HARTSHORN'), ('GREENLEAF'), ('WILTSHIRE'), ('Banco BTG Pactual S.A. Client 36957'), ('NGAN'), ('MARSAULT INTERNATIONAL LTD'), ('EVANS'), ('CABIAN'), ('GANERIWALA'), ('INNOSIGHT VENTURES Pte Ltd'), ('SCIMONE'), ('CHANDRA'), ('Banco BTG Pactual S.A. Client 80840'), ('CYTRON'), ('Global Custody & Clearing Limited'), ('LE SEIGNEUR'), ('LAI'), ('KHAWAJA'), ('LUND'), ('JATANIA'), ('SARASIN'), ('RUSHTON'), ('HARALALKA'), ('RIKHYE'), ('Banco BTG Pactual S.A. Client 80910'), ('TERSANE INTERNATIONAL LTD'), ('KNOPF'), ('JOMAA'), ('Banco BTG Pactual S.A. Client 80775'), ('DUFAURE'), ('KABELLA LTD'), ('KARKUN'), ('SUKHOTIN'), ('JORDAN'), ('BADII'), ('WEALTH TRAIN LIMITED'), ('Innovatech 1'), ('FONTES WILLIAMS'), ('SAMAMA'), ('VOLF Trust'), ('PANT Investments Inc'), ('KAPOOR'), ('YONGJIE'), ('PATRASCU'), ('Banco BTG Pactual S.A. Client 80738'), ('BROOKS'), ('SUD'), ('AGARWALA'), ('DATT'), ('MANNING'), ('FigTree Family Office Ltd'), ('CHIH-HENG'), ('GOKER'), ('Banco BTG Pactual S.A. Client 80862'), ('BROWN'), ('KULKARNI'), ('ROTH'), ('KOTHARI'), ('Banco BTG Pactual S.A. Client 34924'), ('SAE-JEE'), ('BIN MOHAMED'), ('MARTINI'), ('RLABS HOLDINGS LTD'), ('HARIA'), ('ACKERLEY'), ('QUNASH'), ('WRIGHT'), ('Adam Smith Singapore Pte Ltd'), ('Kenilworth Ltd'), ('Banco BTG Pactual S.A. Client 36003'), ('Swip Holdings Ltd'), ('POTASSIUM Capital'), ('Bank SYZ AG'), ('MA GROUP AG'), ('GEOK'), ('HOLDEN'), ('Rensburg Client Nominees Limited A/c CLT'), ('DCMS Holdings Limited'), ('TERRA Financial & Management Services SA'), ('SHAH'), ('WILLETTS'), ('AKERMANN'), ('VAN DEN BOL'), ('SERRA'), ('CORR'), ('STEIMES'), ('ROLLINS'), ('KRAUSER'), ('ROSEN INVEST HOLDINGS Inc'), ('HUSSAIN'), ('Banco BTG Pactual S.A. Client 34658'), ('Banco BTG Pactual S.A. Client 80890'), ('KOHI'), ('JOGANI'), ('AL ABBASI'), ('MOORE'), ('TRUE INVESTMENTS 4 LLC'), ('SOLOUKI'), ('Banco BTG Pactual S.A. Client 81022'), ('KOHLER CABIAN'), ('Banco BTG Pactual S.A. Client 80873'), ('Banco BTG Pactual S.A. Client 80772'), ('SEKHON'), ('SCHUTTE'), ('ONC Limited'), ('WINZ'), ('MADHVANI'), ('CINCORIA LIMITED'), ('Brahma Finance (BVI) Ltd'), ('NUSSBERGER'), ('SAHLI'), ('Banco BTG Pactual S.A. Client 12279'), ('Sudon Carlop Holdings Limited'), ('JAVID'), ('ROSSIER'), ('CAUSE FIRST Holdings Ltd'), ('FLETCHER'), ('GRAF'), ('SUBRAMANIAN'), ('SWISS TRUSTEES OF GENEVA SA as Trustees of the LUTEPIN TRUST'), ('KRANA INVESTMENTS PTE. LTD.'), ('TONELLI BANFI'), ('GORILLA PE Inc'), ('GELIGA LIMITED')) AS d(name)
    LEFT JOIN vehicles v ON v.entity_code = 'VC106'
    LEFT JOIN subscriptions s ON s.vehicle_id = v.id
    LEFT JOIN investors inv ON inv.id = s.investor_id
        AND (UPPER(inv.last_name) = UPPER(d.name) 
             OR UPPER(inv.legal_name) = UPPER(d.name)
             OR UPPER(inv.legal_name) LIKE UPPER('%' || d.name || '%'))
    GROUP BY d.name, inv.id, inv.legal_name
    
 UNION ALL 

    -- VC133: 3 names to match
    SELECT 
        'VC133' as vehicle,
        d.name as dashboard_name,
        inv.id as investor_id,
        inv.legal_name as db_legal_name,
        CASE WHEN inv.id IS NOT NULL THEN 1 ELSE 0 END as matched
    FROM (VALUES ('Richard'), ('Singh'), ('VC33')) AS d(name)
    LEFT JOIN vehicles v ON v.entity_code = 'VC133'
    LEFT JOIN subscriptions s ON s.vehicle_id = v.id
    LEFT JOIN investors inv ON inv.id = s.investor_id
        AND (UPPER(inv.last_name) = UPPER(d.name) 
             OR UPPER(inv.legal_name) = UPPER(d.name)
             OR UPPER(inv.legal_name) LIKE UPPER('%' || d.name || '%'))
    GROUP BY d.name, inv.id, inv.legal_name
    
 UNION ALL 

    -- VC113: 36 names to match
    SELECT 
        'VC113' as vehicle,
        d.name as dashboard_name,
        inv.id as investor_id,
        inv.legal_name as db_legal_name,
        CASE WHEN inv.id IS NOT NULL THEN 1 ELSE 0 END as matched
    FROM (VALUES ('MEYER'), ('Signet Logistics Ltd'), ('HAYWARD'), ('TOMMEY'), ('TAROUILLY'), ('Zandera (Holdco) Limited'), ('FRALIS SPF'), ('COMEL'), ('HIQUIANA-TANEJA & TANEJA'), ('KNOPF'), ('Dalinga AG'), ('SHAH'), ('EL MOGHAZI'), ('NEWBRIDGE FINANCE SPF'), ('MAHESWARI & SUBRAMANIAN'), ('SAFE'), ('GORYAINOV'), ('Rosen Invest Holdings Inc'), ('DE'), ('Bright Phoenix Holdings Ltd'), ('AKERMANN'), ('Zandera (Finco) Limited'), ('JOGANI'), ('ZINKEVICH'), ('MOHAMMED'), ('KOHLER CABIAN'), ('WINZ'), ('ALGAR'), ('PETRATECH'), ('MERIDA'), ('MADHVANI'), ('ULDRY'), ('GRAF'), ('ROMANOV'), ('OEP Ltd'), ('TEKAPO Group Limited')) AS d(name)
    LEFT JOIN vehicles v ON v.entity_code = 'VC113'
    LEFT JOIN subscriptions s ON s.vehicle_id = v.id
    LEFT JOIN investors inv ON inv.id = s.investor_id
        AND (UPPER(inv.last_name) = UPPER(d.name) 
             OR UPPER(inv.legal_name) = UPPER(d.name)
             OR UPPER(inv.legal_name) LIKE UPPER('%' || d.name || '%'))
    GROUP BY d.name, inv.id, inv.legal_name
    
 UNION ALL 

    -- VC111: 4 names to match
    SELECT 
        'VC111' as vehicle,
        d.name as dashboard_name,
        inv.id as investor_id,
        inv.legal_name as db_legal_name,
        CASE WHEN inv.id IS NOT NULL THEN 1 ELSE 0 END as matched
    FROM (VALUES ('VC11'), ('Attilio'), ('Markus'), ('Bruno')) AS d(name)
    LEFT JOIN vehicles v ON v.entity_code = 'VC111'
    LEFT JOIN subscriptions s ON s.vehicle_id = v.id
    LEFT JOIN investors inv ON inv.id = s.investor_id
        AND (UPPER(inv.last_name) = UPPER(d.name) 
             OR UPPER(inv.legal_name) = UPPER(d.name)
             OR UPPER(inv.legal_name) LIKE UPPER('%' || d.name || '%'))
    GROUP BY d.name, inv.id, inv.legal_name
    
 UNION ALL 

    -- VC126: 3 names to match
    SELECT 
        'VC126' as vehicle,
        d.name as dashboard_name,
        inv.id as investor_id,
        inv.legal_name as db_legal_name,
        CASE WHEN inv.id IS NOT NULL THEN 1 ELSE 0 END as matched
    FROM (VALUES ('Abou'), ('VC26'), ('Brandon')) AS d(name)
    LEFT JOIN vehicles v ON v.entity_code = 'VC126'
    LEFT JOIN subscriptions s ON s.vehicle_id = v.id
    LEFT JOIN investors inv ON inv.id = s.investor_id
        AND (UPPER(inv.last_name) = UPPER(d.name) 
             OR UPPER(inv.legal_name) = UPPER(d.name)
             OR UPPER(inv.legal_name) LIKE UPPER('%' || d.name || '%'))
    GROUP BY d.name, inv.id, inv.legal_name
    
 UNION ALL 

    -- VC102: 1 names to match
    SELECT 
        'VC102' as vehicle,
        d.name as dashboard_name,
        inv.id as investor_id,
        inv.legal_name as db_legal_name,
        CASE WHEN inv.id IS NOT NULL THEN 1 ELSE 0 END as matched
    FROM (VALUES ('VC2')) AS d(name)
    LEFT JOIN vehicles v ON v.entity_code = 'VC102'
    LEFT JOIN subscriptions s ON s.vehicle_id = v.id
    LEFT JOIN investors inv ON inv.id = s.investor_id
        AND (UPPER(inv.last_name) = UPPER(d.name) 
             OR UPPER(inv.legal_name) = UPPER(d.name)
             OR UPPER(inv.legal_name) LIKE UPPER('%' || d.name || '%'))
    GROUP BY d.name, inv.id, inv.legal_name
    
 UNION ALL 

    -- VC112: 2 names to match
    SELECT 
        'VC112' as vehicle,
        d.name as dashboard_name,
        inv.id as investor_id,
        inv.legal_name as db_legal_name,
        CASE WHEN inv.id IS NOT NULL THEN 1 ELSE 0 END as matched
    FROM (VALUES ('VC12'), ('Antonio Alberto')) AS d(name)
    LEFT JOIN vehicles v ON v.entity_code = 'VC112'
    LEFT JOIN subscriptions s ON s.vehicle_id = v.id
    LEFT JOIN investors inv ON inv.id = s.investor_id
        AND (UPPER(inv.last_name) = UPPER(d.name) 
             OR UPPER(inv.legal_name) = UPPER(d.name)
             OR UPPER(inv.legal_name) LIKE UPPER('%' || d.name || '%'))
    GROUP BY d.name, inv.id, inv.legal_name
    
 UNION ALL 

    -- VC118: 1 names to match
    SELECT 
        'VC118' as vehicle,
        d.name as dashboard_name,
        inv.id as investor_id,
        inv.legal_name as db_legal_name,
        CASE WHEN inv.id IS NOT NULL THEN 1 ELSE 0 END as matched
    FROM (VALUES ('VC18')) AS d(name)
    LEFT JOIN vehicles v ON v.entity_code = 'VC118'
    LEFT JOIN subscriptions s ON s.vehicle_id = v.id
    LEFT JOIN investors inv ON inv.id = s.investor_id
        AND (UPPER(inv.last_name) = UPPER(d.name) 
             OR UPPER(inv.legal_name) = UPPER(d.name)
             OR UPPER(inv.legal_name) LIKE UPPER('%' || d.name || '%'))
    GROUP BY d.name, inv.id, inv.legal_name
    
 UNION ALL 

    -- VC125: 1 names to match
    SELECT 
        'VC125' as vehicle,
        d.name as dashboard_name,
        inv.id as investor_id,
        inv.legal_name as db_legal_name,
        CASE WHEN inv.id IS NOT NULL THEN 1 ELSE 0 END as matched
    FROM (VALUES ('VC25')) AS d(name)
    LEFT JOIN vehicles v ON v.entity_code = 'VC125'
    LEFT JOIN subscriptions s ON s.vehicle_id = v.id
    LEFT JOIN investors inv ON inv.id = s.investor_id
        AND (UPPER(inv.last_name) = UPPER(d.name) 
             OR UPPER(inv.legal_name) = UPPER(d.name)
             OR UPPER(inv.legal_name) LIKE UPPER('%' || d.name || '%'))
    GROUP BY d.name, inv.id, inv.legal_name
    
)
SELECT 
    vehicle,
    COUNT(DISTINCT dashboard_name) as total_names,
    COUNT(DISTINCT CASE WHEN investor_id IS NOT NULL THEN dashboard_name END) as matched_names,
    COUNT(DISTINCT CASE WHEN investor_id IS NULL THEN dashboard_name END) as unmatched_names
FROM all_matches
GROUP BY vehicle
ORDER BY vehicle;
