
WITH all_matches AS (

    -- VC102: 1 names
    SELECT 
        'VC102' as vehicle,
        d.dashboard_name,
        inv.id as investor_id,
        inv.legal_name as db_legal_name,
        inv.last_name as db_last_name,
        inv.type as investor_type
    FROM (VALUES ('VC2')) AS d(dashboard_name)
    LEFT JOIN vehicles v ON v.entity_code = 'VC102'
    LEFT JOIN subscriptions s ON s.vehicle_id = v.id
    LEFT JOIN investors inv ON inv.id = s.investor_id
        AND (
            UPPER(inv.last_name) = UPPER(d.dashboard_name)
            OR UPPER(inv.legal_name) = UPPER(d.dashboard_name)
            OR UPPER(inv.legal_name) LIKE UPPER('%' || d.dashboard_name || '%')
        )
    
    UNION ALL

    -- VC106: 160 names
    SELECT 
        'VC106' as vehicle,
        d.dashboard_name,
        inv.id as investor_id,
        inv.legal_name as db_legal_name,
        inv.last_name as db_last_name,
        inv.type as investor_type
    FROM (VALUES ('ROLLINS'), ('CHANG'), ('NGAN'), ('MADHVANI'), ('KOHI'), ('CHIH-HENG'), ('AGARWALA'), ('CHANDRA'), ('YONGJIE'), ('SAE-JEE'), ('GEOK'), ('DALINGA HOLDING AG'), ('MARTINI'), ('SAHLI'), ('OEP Ltd'), ('KRANA INVESTMENTS PTE. LTD.'), ('AKERMANN'), ('CABIAN'), ('SCIMONE'), ('OFBR Trust'), ('Elidon Estate Inc'), ('Adam Smith Singapore Pte Ltd'), ('KNOPF'), ('VOLF Trust'), ('Bahama Global Towers Limited'), ('CAUSE FIRST Holdings Ltd'), ('KARKUN'), ('BROWN'), ('TRUE INVESTMENTS 4 LLC'), ('ROSEN INVEST HOLDINGS Inc'), ('SUBRAMANIAN'), ('JIMENEZ TRADING INC'), ('RIKHYE'), ('HARIA'), ('SHAH'), ('ONC Limited'), ('AL ABBASI'), ('CORR'), ('JORDAN'), ('FigTree Family Office Ltd'), ('WRIGHT'), ('VAN DEN BOL'), ('MATTHEWS'), ('HAYCOX'), ('ACKERLEY'), ('MANNING'), ('Global Custody & Clearing Limited'), ('BROOKS'), ('DAHAN'), ('DUTIL'), ('Sudon Carlop Holdings Limited'), ('SCHUTTE'), ('SEKHON'), ('GRAF'), ('NUSSBERGER'), ('JASSQ HOLDING LIMITED'), ('INNOSIGHT VENTURES Pte Ltd'), ('GORILLA PE Inc'), ('EVANS'), ('HOLDEN'), ('HAYAT'), ('KOTHARI'), ('MUKHTAR'), ('SOUTH SOUND LTD'), ('PATRASCU'), ('JOGANI'), ('RUSHTON'), ('SOMMERVILLE'), ('LAI'), ('LUND'), ('BELGA'), ('JOMAA'), ('JAYARAMAN'), ('HAKIM'), ('Kenilworth Ltd'), ('KHAWAJA'), ('JATANIA'), ('QUNASH'), ('GUERIN'), ('LE SEIGNEUR'), ('PATEL'), ('POTASSIUM Capital'), ('HASSAN'), ('GTV Partners SA'), ('LENN Participations SARL'), ('WEALTH TRAIN LIMITED'), ('GOKER'), ('ALAMOUTI'), ('Caspian Enterprises Limited'), ('Rensburg Client Nominees Limited A/c CLT'), ('DCMS Holdings Limited'), ('GELIGA LIMITED'), ('KRAUSER'), ('FLETCHER'), ('STEIMES'), ('SERRA'), ('SAMAMA'), ('SWISS TRUSTEES OF GENEVA SA as Trustees of the LUTEPIN TRUST'), ('CUDRE-MAUROUX'), ('CYTRON'), ('RIENZO'), ('GHESQUIERES'), ('ROSSIER'), ('MARSAULT INTERNATIONAL LTD'), ('DUFAURE'), ('SUKHOTIN'), ('JAVID'), ('BADII'), ('SOLOUKI'), ('HUSSAIN'), ('TONELLI BANFI'), ('GREENLEAF'), ('Banco BTG Pactual S.A. Client 12279'), ('Banco BTG Pactual S.A. Client 34658'), ('Banco BTG Pactual S.A. Client 34924'), ('Banco BTG Pactual S.A. Client 36003'), ('Banco BTG Pactual S.A. Client 36749'), ('Banco BTG Pactual S.A. Client 36957'), ('Banco BTG Pactual S.A. Client 80738'), ('Banco BTG Pactual S.A. Client 80772'), ('Banco BTG Pactual S.A. Client 80775'), ('Banco BTG Pactual S.A. Client 80776'), ('Banco BTG Pactual S.A. Client 80840'), ('Banco BTG Pactual S.A. Client 80862'), ('Banco BTG Pactual S.A. Client 80873'), ('Banco BTG Pactual S.A. Client 80890'), ('Banco BTG Pactual S.A. Client 80910'), ('Banco BTG Pactual S.A. Client 81022'), ('Banco BTG Pactual S.A. Client 515'), ('OLD HILL INVESTMENT GROUP LLC'), ('FONTES WILLIAMS'), ('MA GROUP AG'), ('WINZ'), ('HARALALKA'), ('DATT'), ('BIN MOHAMED'), ('GANERIWALA'), ('PANT Investments Inc'), ('SUD'), ('KAPOOR'), ('KULKARNI'), ('Innovatech 1'), ('MOORE'), ('TERRA Financial & Management Services SA'), ('BACHELIER'), ('ROTH'), ('KABELLA LTD'), ('CINCORIA LIMITED'), ('WILLETTS'), ('Bank SYZ AG'), ('Bright Phoenix Holdings Limited'), ('Swip Holdings Ltd'), ('Phaena Advisory Ltd'), ('WILTSHIRE'), ('TERSANE INTERNATIONAL LTD'), ('Brahma Finance (BVI) Ltd'), ('HARTSHORN'), ('SARASIN'), ('KOHLER CABIAN'), ('RLABS HOLDINGS LTD')) AS d(dashboard_name)
    LEFT JOIN vehicles v ON v.entity_code = 'VC106'
    LEFT JOIN subscriptions s ON s.vehicle_id = v.id
    LEFT JOIN investors inv ON inv.id = s.investor_id
        AND (
            UPPER(inv.last_name) = UPPER(d.dashboard_name)
            OR UPPER(inv.legal_name) = UPPER(d.dashboard_name)
            OR UPPER(inv.legal_name) LIKE UPPER('%' || d.dashboard_name || '%')
        )
    
    UNION ALL

    -- VC111: 4 names
    SELECT 
        'VC111' as vehicle,
        d.dashboard_name,
        inv.id as investor_id,
        inv.legal_name as db_legal_name,
        inv.last_name as db_last_name,
        inv.type as investor_type
    FROM (VALUES ('VC11'), ('Markus'), ('Attilio'), ('Bruno')) AS d(dashboard_name)
    LEFT JOIN vehicles v ON v.entity_code = 'VC111'
    LEFT JOIN subscriptions s ON s.vehicle_id = v.id
    LEFT JOIN investors inv ON inv.id = s.investor_id
        AND (
            UPPER(inv.last_name) = UPPER(d.dashboard_name)
            OR UPPER(inv.legal_name) = UPPER(d.dashboard_name)
            OR UPPER(inv.legal_name) LIKE UPPER('%' || d.dashboard_name || '%')
        )
    
    UNION ALL

    -- VC112: 2 names
    SELECT 
        'VC112' as vehicle,
        d.dashboard_name,
        inv.id as investor_id,
        inv.legal_name as db_legal_name,
        inv.last_name as db_last_name,
        inv.type as investor_type
    FROM (VALUES ('VC12'), ('Antonio Alberto')) AS d(dashboard_name)
    LEFT JOIN vehicles v ON v.entity_code = 'VC112'
    LEFT JOIN subscriptions s ON s.vehicle_id = v.id
    LEFT JOIN investors inv ON inv.id = s.investor_id
        AND (
            UPPER(inv.last_name) = UPPER(d.dashboard_name)
            OR UPPER(inv.legal_name) = UPPER(d.dashboard_name)
            OR UPPER(inv.legal_name) LIKE UPPER('%' || d.dashboard_name || '%')
        )
    
    UNION ALL

    -- VC113: 36 names
    SELECT 
        'VC113' as vehicle,
        d.dashboard_name,
        inv.id as investor_id,
        inv.legal_name as db_legal_name,
        inv.last_name as db_last_name,
        inv.type as investor_type
    FROM (VALUES ('WINZ'), ('AKERMANN'), ('Dalinga AG'), ('ROMANOV'), ('GORYAINOV'), ('ZINKEVICH'), ('MADHVANI'), ('Rosen Invest Holdings Inc'), ('Zandera (Finco) Limited'), ('HAYWARD'), ('KNOPF'), ('TOMMEY'), ('Signet Logistics Ltd'), ('GRAF'), ('DE'), ('Bright Phoenix Holdings Ltd'), ('TEKAPO Group Limited'), ('ALGAR'), ('MERIDA'), ('MAHESWARI & SUBRAMANIAN'), ('HIQUIANA-TANEJA & TANEJA'), ('FRALIS SPF'), ('NEWBRIDGE FINANCE SPF'), ('ULDRY'), ('COMEL'), ('EL MOGHAZI'), ('MOHAMMED'), ('OEP Ltd'), ('PETRATECH'), ('Zandera (Holdco) Limited'), ('MEYER'), ('SHAH'), ('KOHLER CABIAN'), ('SAFE'), ('JOGANI'), ('TAROUILLY')) AS d(dashboard_name)
    LEFT JOIN vehicles v ON v.entity_code = 'VC113'
    LEFT JOIN subscriptions s ON s.vehicle_id = v.id
    LEFT JOIN investors inv ON inv.id = s.investor_id
        AND (
            UPPER(inv.last_name) = UPPER(d.dashboard_name)
            OR UPPER(inv.legal_name) = UPPER(d.dashboard_name)
            OR UPPER(inv.legal_name) LIKE UPPER('%' || d.dashboard_name || '%')
        )
    
    UNION ALL

    -- VC118: 1 names
    SELECT 
        'VC118' as vehicle,
        d.dashboard_name,
        inv.id as investor_id,
        inv.legal_name as db_legal_name,
        inv.last_name as db_last_name,
        inv.type as investor_type
    FROM (VALUES ('VC18')) AS d(dashboard_name)
    LEFT JOIN vehicles v ON v.entity_code = 'VC118'
    LEFT JOIN subscriptions s ON s.vehicle_id = v.id
    LEFT JOIN investors inv ON inv.id = s.investor_id
        AND (
            UPPER(inv.last_name) = UPPER(d.dashboard_name)
            OR UPPER(inv.legal_name) = UPPER(d.dashboard_name)
            OR UPPER(inv.legal_name) LIKE UPPER('%' || d.dashboard_name || '%')
        )
    
    UNION ALL

    -- VC125: 1 names
    SELECT 
        'VC125' as vehicle,
        d.dashboard_name,
        inv.id as investor_id,
        inv.legal_name as db_legal_name,
        inv.last_name as db_last_name,
        inv.type as investor_type
    FROM (VALUES ('VC25')) AS d(dashboard_name)
    LEFT JOIN vehicles v ON v.entity_code = 'VC125'
    LEFT JOIN subscriptions s ON s.vehicle_id = v.id
    LEFT JOIN investors inv ON inv.id = s.investor_id
        AND (
            UPPER(inv.last_name) = UPPER(d.dashboard_name)
            OR UPPER(inv.legal_name) = UPPER(d.dashboard_name)
            OR UPPER(inv.legal_name) LIKE UPPER('%' || d.dashboard_name || '%')
        )
    
    UNION ALL

    -- VC126: 3 names
    SELECT 
        'VC126' as vehicle,
        d.dashboard_name,
        inv.id as investor_id,
        inv.legal_name as db_legal_name,
        inv.last_name as db_last_name,
        inv.type as investor_type
    FROM (VALUES ('VC26'), ('Brandon'), ('Abou')) AS d(dashboard_name)
    LEFT JOIN vehicles v ON v.entity_code = 'VC126'
    LEFT JOIN subscriptions s ON s.vehicle_id = v.id
    LEFT JOIN investors inv ON inv.id = s.investor_id
        AND (
            UPPER(inv.last_name) = UPPER(d.dashboard_name)
            OR UPPER(inv.legal_name) = UPPER(d.dashboard_name)
            OR UPPER(inv.legal_name) LIKE UPPER('%' || d.dashboard_name || '%')
        )
    
    UNION ALL

    -- VC133: 3 names
    SELECT 
        'VC133' as vehicle,
        d.dashboard_name,
        inv.id as investor_id,
        inv.legal_name as db_legal_name,
        inv.last_name as db_last_name,
        inv.type as investor_type
    FROM (VALUES ('VC33'), ('Singh'), ('Richard')) AS d(dashboard_name)
    LEFT JOIN vehicles v ON v.entity_code = 'VC133'
    LEFT JOIN subscriptions s ON s.vehicle_id = v.id
    LEFT JOIN investors inv ON inv.id = s.investor_id
        AND (
            UPPER(inv.last_name) = UPPER(d.dashboard_name)
            OR UPPER(inv.legal_name) = UPPER(d.dashboard_name)
            OR UPPER(inv.legal_name) LIKE UPPER('%' || d.dashboard_name || '%')
        )
    
)
SELECT 
    vehicle,
    dashboard_name,
    investor_id,
    db_legal_name,
    db_last_name,
    investor_type,
    CASE WHEN investor_id IS NOT NULL THEN 'MATCHED' ELSE 'NOT_FOUND' END as status
FROM all_matches
GROUP BY vehicle, dashboard_name, investor_id, db_legal_name, db_last_name, investor_type
ORDER BY vehicle, dashboard_name;
