
-- VC106 matching query (160 investors)
WITH dashboard_names AS (
    SELECT unnest(ARRAY['ROLLINS', 'CHANG', 'NGAN', 'MADHVANI', 'KOHI', 'CHIH-HENG', 'AGARWALA', 'CHANDRA', 'YONGJIE', 'SAE-JEE', 'GEOK', 'DALINGA HOLDING AG', 'MARTINI', 'SAHLI', 'OEP Ltd', 'KRANA INVESTMENTS PTE. LTD.', 'AKERMANN', 'CABIAN', 'SCIMONE', 'OFBR Trust', 'Elidon Estate Inc', 'Adam Smith Singapore Pte Ltd', 'KNOPF', 'VOLF Trust', 'Bahama Global Towers Limited', 'CAUSE FIRST Holdings Ltd', 'KARKUN', 'BROWN', 'TRUE INVESTMENTS 4 LLC', 'ROSEN INVEST HOLDINGS Inc', 'SUBRAMANIAN', 'JIMENEZ TRADING INC', 'RIKHYE', 'HARIA', 'SHAH', 'ONC Limited', 'AL ABBASI', 'CORR', 'JORDAN', 'FigTree Family Office Ltd', 'WRIGHT', 'VAN DEN BOL', 'MATTHEWS', 'HAYCOX', 'ACKERLEY', 'MANNING', 'Global Custody & Clearing Limited', 'BROOKS', 'DAHAN', 'DUTIL', 'Sudon Carlop Holdings Limited', 'SCHUTTE', 'SEKHON', 'GRAF', 'NUSSBERGER', 'JASSQ HOLDING LIMITED', 'INNOSIGHT VENTURES Pte Ltd', 'GORILLA PE Inc', 'EVANS', 'HOLDEN', 'HAYAT', 'KOTHARI', 'MUKHTAR', 'SOUTH SOUND LTD', 'PATRASCU', 'JOGANI', 'RUSHTON', 'SOMMERVILLE', 'LAI', 'LUND', 'BELGA', 'JOMAA', 'JAYARAMAN', 'HAKIM', 'Kenilworth Ltd', 'KHAWAJA', 'JATANIA', 'QUNASH', 'GUERIN', 'LE SEIGNEUR', 'PATEL', 'POTASSIUM Capital', 'HASSAN', 'GTV Partners SA', 'LENN Participations SARL', 'WEALTH TRAIN LIMITED', 'GOKER', 'ALAMOUTI', 'Caspian Enterprises Limited', 'Rensburg Client Nominees Limited A/c CLT', 'DCMS Holdings Limited', 'GELIGA LIMITED', 'KRAUSER', 'FLETCHER', 'STEIMES', 'SERRA', 'SAMAMA', 'SWISS TRUSTEES OF GENEVA SA as Trustees of the LUTEPIN TRUST', 'CUDRE-MAUROUX', 'CYTRON', 'RIENZO', 'GHESQUIERES', 'ROSSIER', 'MARSAULT INTERNATIONAL LTD', 'DUFAURE', 'SUKHOTIN', 'JAVID', 'BADII', 'SOLOUKI', 'HUSSAIN', 'TONELLI BANFI', 'GREENLEAF', 'Banco BTG Pactual S.A. Client 12279', 'Banco BTG Pactual S.A. Client 34658', 'Banco BTG Pactual S.A. Client 34924', 'Banco BTG Pactual S.A. Client 36003', 'Banco BTG Pactual S.A. Client 36749', 'Banco BTG Pactual S.A. Client 36957', 'Banco BTG Pactual S.A. Client 80738', 'Banco BTG Pactual S.A. Client 80772', 'Banco BTG Pactual S.A. Client 80775', 'Banco BTG Pactual S.A. Client 80776', 'Banco BTG Pactual S.A. Client 80840', 'Banco BTG Pactual S.A. Client 80862', 'Banco BTG Pactual S.A. Client 80873', 'Banco BTG Pactual S.A. Client 80890', 'Banco BTG Pactual S.A. Client 80910', 'Banco BTG Pactual S.A. Client 81022', 'Banco BTG Pactual S.A. Client 515', 'OLD HILL INVESTMENT GROUP LLC', 'FONTES WILLIAMS', 'MA GROUP AG', 'WINZ', 'HARALALKA', 'DATT', 'BIN MOHAMED', 'GANERIWALA', 'PANT Investments Inc', 'SUD', 'KAPOOR', 'KULKARNI', 'Innovatech 1', 'MOORE', 'TERRA Financial & Management Services SA', 'BACHELIER', 'ROTH', 'KABELLA LTD', 'CINCORIA LIMITED', 'WILLETTS', 'Bank SYZ AG', 'Bright Phoenix Holdings Limited', 'Swip Holdings Ltd', 'Phaena Advisory Ltd', 'WILTSHIRE', 'TERSANE INTERNATIONAL LTD', 'Brahma Finance (BVI) Ltd', 'HARTSHORN', 'SARASIN', 'KOHLER CABIAN', 'RLABS HOLDINGS LTD']) as dashboard_name
),
matches AS (
    SELECT 
        d.dashboard_name,
        inv.id as investor_id,
        inv.legal_name,
        inv.type
    FROM dashboard_names d
    JOIN vehicles v ON v.entity_code = 'VC106'
    JOIN subscriptions s ON s.vehicle_id = v.id
    JOIN investors inv ON inv.id = s.investor_id
        AND (
            UPPER(inv.last_name) = UPPER(d.dashboard_name)
            OR UPPER(inv.legal_name) = UPPER(d.dashboard_name)
            OR UPPER(inv.legal_name) ILIKE '%' || d.dashboard_name || '%'
        )
    GROUP BY d.dashboard_name, inv.id, inv.legal_name, inv.type
)
SELECT 
    'VC106' as vehicle,
    d.dashboard_name,
    COALESCE(m.investor_id::text, 'NO_MATCH') as investor_id,
    COALESCE(m.legal_name, 'NO_MATCH') as db_legal_name,
    COUNT(m.investor_id) OVER (PARTITION BY d.dashboard_name) as match_count
FROM dashboard_names d
LEFT JOIN matches m ON m.dashboard_name = d.dashboard_name
ORDER BY d.dashboard_name;
