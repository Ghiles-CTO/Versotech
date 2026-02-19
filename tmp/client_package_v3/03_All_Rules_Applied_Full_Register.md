# VERSO Capital Rules Register

This document provides the complete numbered rule set used in reconciliation, with exact naming mappings and business context.

## How each rule is controlled

- Fully automatic control: the checker validates this rule directly.
- Automatic control plus approved process control: the checker validates part of the rule and the rest is covered by approved documented process.
- Approved process control only: managed by approved documented process outside direct checker logic.
- Not a data validation control: informational or coding convention item.

## Exact naming and renaming mappings

These are the exact `from -> to` mappings used for name reconciliation.

### VC1 introducer mappings

| Source name used in dashboard or records | Standard name used in validation |
|---|---|
| alpha gaia | Alpha Gaia ALPHA GAIA CAPITAL FZE |
| alphagaia | Alpha Gaia ALPHA GAIA CAPITAL FZE |
| gaiacapital | Alpha Gaia ALPHA GAIA CAPITAL FZE |
| altrasandrew | Altras Capital Financing Broker |
| altrasandrewstewart | Altras Capital Financing Broker |
| rick | Altras Capital Financing Broker |
| Rick + Andrew | Altras Capital Financing Broker |
| Rick+Andrew | Altras Capital Financing Broker |
| aux | AUX Business Support Ltd |
| mrsandmrbeatricemarcelknopf | Beatrice and Marcel KNOPF |
| dan | Daniel BAUMSLAG |
| danbaumslag | Daniel BAUMSLAG |
| danjeanbaumslagdutil | Daniel BAUMSLAG |
| denis | Denis Matthey |
| deyandmihov | Deyan D MIHOV |
| luizeduardofonteswilliams | Eduardo Luiz FONTES WILLIAMS |
| enguerrand | Enguerrand Elbaz |
| ericlepascalseigneur | Eric LE SEIGNEUR |
| ericpascalleseigneur | Eric LE SEIGNEUR |
| garsonlevy | Garson Brandon LEVY |
| gemera | GEMERA Consulting Pte Ltd |
| sandro | GEMERA Consulting Pte Ltd |
| sandrogemera | GEMERA Consulting Pte Ltd |
| gio | Giovanni SALADINO |
| hedgebaysecuritiesllc | Hedgebay Securities LLC |
| hakimihossienjavid | Hossein JAVID |
| hossienhakimijavid | Hossein JAVID |
| hossienjavid | Hossein JAVID |
| julien | Julien MACHOT |
| leegrandgroup | Lee Rant Group |
| leerantgroup | Lee Rant Group |
| liudmilaandalexeyromanovaromanov | Liudmila and Alexey ROMANOV |
| simone | Manna Capital |
| mickaelryan | Michael RYAN |
| john | Moore & Moore Investments Ltd |
| mrsnaliniyogamraranjameswilletts | Nalini Yoga and Aran James WILLETTS |
| odileandgeorgesmradandfenergi | Odile and Georges Abou MRAD and FENERGI |
| oep limited transfer from as advisory dwc llc | OEP LIMITED |
| oeplimitedtransferfromasadvisorydwcllc | OEP LIMITED |
| renbridge | Renaissance Bridge Capital LLC |
| robin | Robin Doble |
| anand | Set Cap |
| Anand+Dan | Set Cap |
| anandrathi | Set Cap |
| anandrathia | Set Cap |
| anandsethia | Set Cap |
| set cap | Set Cap |
| setcap | Set Cap |
| setcapdanielbaumslag | Set Cap |
| Stableton+Terra | Terra Financial & Management Services SA |
| terra | Terra Financial & Management Services SA |
| terrafinancial | Terra Financial & Management Services SA |
| terrafinancialmanagementservicessa | Terra Financial & Management Services SA |
### VC2 introducer mappings

| Source name used in dashboard or records | Standard name used in validation |
|---|---|
| aeon | AEON INC |
| Aeon | AEON INC |
| allianceglobalpartners | Alliance Global Partners LLC |
| Headwall / AGP | Alliance Global Partners LLC |
| headwallagp | Alliance Global Partners LLC |
| Astra Global | Astral Global Limited |
| Astra Global Limited | Astral Global Limited |
| astragloballimited | Astral Global Limited |
| Bright Views | Bright Views Holdings |
| brightviews | Bright Views Holdings |
| Bromley Capital | Bromley Capital Partners |
| Bromley Partners | Bromley Capital Partners |
| bromleycapital | Bromley Capital Partners |
| bromleypartners | Bromley Capital Partners |
| Dimensional Advisors + Lafferty | Dimensional Advisors |
| garsonlevy | Garson Brandon LEVY |
| Georges CHEN | George Guoying CHEN |
| georgeschen | George Guoying CHEN |
| liudmilaandalexeyromanovaromanov | Liudmila and Alexey ROMANOV |
| odileandgeorgesmradandfenergi | Odile and Georges Abou MRAD and FENERGI |
| Old City Capital | Old City Securities LLC |
| lafferty | R. F. Lafferty & Co. Inc. |
| Lafferty | R. F. Lafferty & Co. Inc. |
| renaissance | Renaissance Bridge Capital LLC |
| Renaissance | Renaissance Bridge Capital LLC |
| renbridge | Renaissance Bridge Capital LLC |
| Robert C. VOGT IV | Robert VOGT IV |
| robertcvogtiv | Robert VOGT IV |
| anand | Set Cap |
| Anand | Set Cap |
| Anand+Dan | Set Cap |
| anandrathi | Set Cap |
| setcapdanielbaumslag | Set Cap |
| Lafferty + Visual Sectors | Visual Sectors |
| Lafferty+Visual Sectors | Visual Sectors |
### IN introducer mappings

| Source name used in dashboard or records | Standard name used in validation |
|---|---|
| altrasandrew | Altras Capital Financing Broker |
| altrasandrewstewart | Altras Capital Financing Broker |
| altrasandrewstewartaltrascapitalfinancingbroker | Altras Capital Financing Broker |
| andrew | Andrew Stewart |
| Astra Global | Astral Global Limited |
| benjaminjonelee | Benjamin JONES |
| alanchristopherpaulsen | Christopher PAULSEN |
| baumslagdan | Daniel BAUMSLAG |
| Dimensional Advisors + Lafferty | Dimensional Advisors |
| davidgaryhall | Gary HALL |
| mickaelryan | Michael RYAN |
| Old City Capital | Old City Securities LLC |
| renbridge | Renaissance Bridge Capital LLC |
| anand | Set Cap |
| Anand+Dan | Set Cap |
| setcap | Set Cap |
| setcapdanielbaumslag | Set Cap |
| Lafferty + Visual Sectors | Visual Sectors |
| Lafferty+Visual Sectors | Visual Sectors |
### VC1 investor mappings by vehicle

| Vehicle | Source investor name | Standard investor name |
|---|---|---|
| VC111 | Zandera (Finco) Limited | Michael RYAN |
| VC113 | Zandera (Finco) Limited | Zandera (Holdco) Limited |

### VC1 approved fallback mappings

| Vehicle | Dashboard name | Database name |
|---|---|---|
| VC106 | Hedgebay Securities LLC | Sheetal HARIA |
| VC106 | Hedgebay Securities LLC | Tapan SHAH |
| VC106 | Hedgebay Securities LLC | Lakin HARIA |
| VC106 | Hedgebay Securities LLC | Aaron RIKHYE |
| VC106 | LEE RAND GROUP | Ekta DATT |
| VC106 | LEE RAND GROUP | Rasika KULKARNI |
| VC106 | LEE RAND GROUP | Nidhi GANERIWALA |
| VC106 | LEE RAND GROUP | Rajiv KAPOOR |
| VC106 | LEE RAND GROUP | Atima HARALALKA |
| VC106 | LEE RAND GROUP | Rajesh SUD |
| VC122 | OEP Ltd | Julien MACHOT |
| VC106 | OEP Ltd | Julien MACHOT |
| VC112 | OEP Ltd | Julien MACHOT |
| VC113 | OEP Ltd | Julien MACHOT |
| VC124 | OEP Ltd | Julien MACHOT |
| VC125 | OEP Ltd | Julien MACHOT |
| VC126 | OEP Ltd | Julien MACHOT |
| VC106 | Mrs and Mr KARKUN | Anisha Bansal and Rahul KARKUN |
| VC106 | Mrs & Mr Subbiah SUBRAMANIAN | Nilakantan MAHESWARI & Subbiah SUBRAMANIAN |
| VC106 | Imrat HAYAT | Imran HAYAT |
| VC122 | INNOVATECH COMPARTMENT 8 | Anand SETHA |

## Broker and role rules

### Expected broker names

- Bromley Capital Partners
- Elevation Securities
- Old City Securities LLC
- R. F. Lafferty & Co. Inc.

### Names blocked globally as introducers

- R. F. Lafferty & Co. Inc.

### Vehicle-specific introducer blocks

| Vehicle | Name not allowed as introducer |
|---|---|
| VC215 | Bromley Capital Partners |

### Approved dual-role names

- Old City Securities LLC
- Bromley Capital Partners

## Explicit commission value and split rules

### VC2 explicit values

| Vehicle | Investor | Introducer | Basis | Amount | Rate bps |
|---|---|---|---|---:|---:|
| VC203 | EVERLASTING HOLDINGS LLC | Sakal Advisory, LLC | invested_amount | 5000.0 | 50 |
| VC203 | EVERLASTING HOLDINGS LLC | Astral Global Limited | invested_amount | 10000.0 | 100 |
| VC206 | REDPOINT OMEGA V, L.P. | Visual Sectors | invested_amount | 82000.0 | 111 |
| VC206 | REDPOINT OMEGA V, L.P. | Astral Global Limited | invested_amount | 90000.0 | 122 |
| VC209 | PVPL FUND LLC SERIES 3 | Visual Sectors | invested_amount | 10000.0 | 10 |
| VC202 | SPLENDID HEIGHT HOLDINGS LIMITED | Bromley Capital Partners | invested_amount | 80000.0 | 80 |
| VC206 | KIWI INNOVATIONS LIMITED | Bromley Capital Partners | invested_amount | 30000.0 | 150 |
| VC209 | SINO SUISSE LLC | Bromley Capital Partners | invested_amount | 18849.42 | 196 |

### IN explicit values

| Vehicle | Investor | Introducer | Basis | Amount | Rate bps |
|---|---|---|---|---:|---:|
| IN103 | Zandera (Holdco) Limited | Altras Capital Financing Broker | invested_amount | 15000.0 |  |
| IN103 | Zandera (Holdco) Limited | Altras Capital Financing Broker | spread | 174999.03 |  |
| IN103 | Zandera (Holdco) Limited | Set Cap | invested_amount | 5000.0 |  |
| IN103 | Zandera (Holdco) Limited | Set Cap | spread | 74999.58 |  |

## Full numbered rules

| Rule # | Scope | Rule text from source documentation | Control method | Business meaning |
|---|---|---|---|---|
| R01 | VC1 | Introducer name aliases (VC1 scope) — Anand/Set Cap, Dan/Daniel, Rick/Altras, Terra/TERRA, Setcap+Daniel replacement, Anand+Dan -> Set Cap | Fully automatic control | Ensures different spellings or labels still match the correct person or firm. |
| R02 | VC2 | Introducer name aliases (VC2 scope) — Renbridge/Renaissance, Headwall/AGP, Aeon, Old City, Astral/Astra, Lafferty, Bromley, VOGT, CHEN, Bright Views | Fully automatic control | Ensures different spellings or labels still match the correct person or firm. |
| R03 | VC1/VC2/IN | Investor name normalization — strip titles, & -> and, limited -> ltd, remove punctuation, token replacements (dan->daniel, mickael->michael), two-name swap, explicit investor aliases | Fully automatic control | Ensures different spellings or labels still match the correct person or firm. |
| R04 | VC2 | VC2 canonical naming rule — use client file legal names for storage, dashboard names for matching only | Automatic control plus approved process control | Ensures this documented control is applied consistently during reconciliation. |
| R05 | VC1 | Investor dedup rules — Talal PASHA->CHAMSI PASHA, Sandra CABIAN->KOHLER CABIAN, Sheikh AL SABAH->Yousef AL SABAH, Zandera Finco->Holdco | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| R06 | VC1 | Introducer cleanup / merge — Stableton+Terra replaced, Denis Matthey deleted, GEMERA old ID merged | Automatic control plus approved process control | Ensures this documented control is applied consistently during reconciliation. |
| R07 | VC1/VC2/IN | Commission basis types and rate conversion — dashboard percent = decimal fraction, rate_bps = percent * 10000 | Automatic control plus approved process control | Ensures this documented control is applied consistently during reconciliation. |
| R08 | VC1/VC2/IN | Invested amount commission calculation — use dashboard Subscription fees when available, otherwise amount_invested * percent | Fully automatic control | Ensures subscription-level values and structure are aligned to source records. |
| R09 | VC1/VC2/IN | Spread commission calculation — use dashboard Spread PPS Fees, otherwise Spread PPS * shares | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| R10 | VC1/VC2/IN | Performance fee commission rows — accrual_amount = 0.0, threshold_multiplier = 0.0, one row per tier per investor per introducer | Automatic control plus approved process control | Ensures performance-fee logic follows the approved structure and tiers. |
| R11 | VC1/VC2/IN | All commissions status = paid — applied 2026-01-31 across all 867 rows | Fully automatic control | Ensures only paid commissions are treated as completed outcomes. |
| R12 | VC1/VC2/IN | Commission duplicate detection — exact duplicates (all fields identical except id/created_at), keep earlier row, delete stale batch rows with rate_bps=0 | Fully automatic control | Prevents double counting by removing or blocking duplicate commission lines. |
| R13 | VC1/VC2/IN | Commission split rules — investors with 2+ subscriptions need matching split commission rows with different base_amount | Automatic control plus approved process control | Ensures split allocations follow approved percentages and amounts. |
| R14 | VC1/VC2/IN | Commission total ruled diffs — expected deltas per vehicle (IN102, IN103, IN106, VC113, VC114, VC106) | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| R15 | VC1 | Zero-amount commission artifacts — 66 rows in VC106 with rate_bps=0, accrual_amount=0; excluded from row-count parity; flagged but not failures | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| R16 | VC1/VC2/IN | Partners are treated as introducers — dashboard Partner columns extracted alongside Introducer columns, both flow into introducers/introductions/commissions tables | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| R17 | VC2 | R. F. Lafferty = BROKER only (VC2) — removed from introducers table, 0 commission rows, 0 introduction rows | Fully automatic control | Enforces broker-versus-introducer policy so allocations go to the right party. |
| R18 | VC2 | Old City Securities LLC = DUAL ROLE (VC2) — exists in both brokers and introducers tables | Automatic control plus approved process control | Enforces broker-versus-introducer policy so allocations go to the right party. |
| R19 | VC2 | Bromley Capital Partners = context-dependent role — BROKER in VC215 (commissions removed, paired rates reduced by 100bps), INTRODUCER in VC202/VC206/VC209 | Fully automatic control | Enforces broker-versus-introducer policy so allocations go to the right party. |
| R20 | VC2 | VC215 Set Cap = spread-only partner — invested_amount 14 rows all $0.00, spread 14 rows sum $25654.81 | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| R21 | VC2 | Bright Views Holdings = internal placeholder, not real introducer — 3 commission rows ($9000) for Jamel CHANDOUL in VC209, warning only | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| R22 | VC2 | Documented split assertions (VC2) — VC203 EVERLASTING, VC206 REDPOINT OMEGA V, VC209 PVPL, Bromley retained on VC202/VC206/VC209 | Fully automatic control | Ensures split allocations follow approved percentages and amounts. |
| R23 | VC1/VC2/IN | Dashboard is source of truth — every non-zero dashboard row becomes a subscription, 1:1 mapping, repeated rows = separate subscriptions | Fully automatic control | Ensures subscription-level values and structure are aligned to source records. |
| R24 | VC1/VC2/IN | Zero ownership rule — if dashboard ownership/units = 0, do NOT create subscription or position; commissions can still exist | Fully automatic control | Prevents historical zero-ownership rows from being treated as active subscriptions. |
| R25 | VC1/IN | Missing ownership handling — blank row = not active, missing column entirely (IN101/IN102/IN109/IN111) = treat all as active | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| R26 | VC2 | Subscription status/funding rules (VC2) — status = funded, funded_amount = commitment | Fully automatic control | Ensures subscription-level values and structure are aligned to source records. |
| R27 | VC1/VC2/IN | Every subscription must have deal_id — NULL deal_id is erroneous when vehicle has one deal | Fully automatic control | Ensures record links are valid so each row belongs to the correct vehicle and deal. |
| R28 | VC1/VC2/IN | bd_fee_amount calculation rule — bd_fee_amount = commitment * bd_fee_percent; flag rows where bd_fee_amount equals bd_fee_percent exactly | Automatic control plus approved process control | Ensures this documented control is applied consistently during reconciliation. |
| R29 | VC1/VC2/IN | subscription_fee_amount calculation rule — subscription_fee_amount = commitment * subscription_fee_percent | Automatic control plus approved process control | Ensures subscription-level values and structure are aligned to source records. |
| R30 | VC1 | VC106 performance_fee_tier1_percent convention — whole numbers (20=20%), all others use fractions (0.2=20%) | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| R31 | VC1 | Cost per share priority rule — use Cost per Share when present, else Final Cost per Share, else NULL | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| R32 | VC1/VC2/IN | Spread fee calculation — spread_fee_amount = spread_per_share * num_shares | Automatic control plus approved process control | Ensures this documented control is applied consistently during reconciliation. |
| R33 | VC1/VC2/IN | Vehicle sheet to code mapping — VCxx -> VC1xx, INxx -> IN1xx (prepend 1) | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| R34 | VC1 | VC122 column parsing correction — OWNERSHIP POSITION = column 17, Number of shares = column 16 | Fully automatic control | Ensures investor holdings and ownership totals remain consistent and not duplicated. |
| R35 | IN | IN110 ETH-denominated amounts — parse ETH prefix to extract numeric values | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| R36 | VC2 | VC203 commission slot override — column positions shifted by 1 from default | Fully automatic control | Ensures investor holdings and ownership totals remain consistent and not duplicated. |
| R37 | VC2 | VCL001 and VCL002 separation from VC203 — 4 AGP subscriptions moved, not part of VC2xx scope | Fully automatic control | Ensures subscription-level values and structure are aligned to source records. |
| R38 | VC1 | VC1 max_introducers_per_subscription = 3 | Fully automatic control | Ensures subscription-level values and structure are aligned to source records. |
| R39 | VC1 | VC1 skip cost_per_share and ownership in vehicle totals | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| R40 | VC1 | VC126 ruled fallback: OEP Ltd -> Julien MACHOT | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| R41 | VC1 | VC113 alias: Zandera (Finco) Limited -> Zandera (Holdco) Limited | Fully automatic control | Ensures different spellings or labels still match the correct person or firm. |
| R42 | VC1/VC2/IN | Position uniqueness per investor+vehicle — only one position row per (investor_id, vehicle_id) | Fully automatic control | Ensures investor holdings and ownership totals remain consistent and not duplicated. |
| R43 | VC1/VC2/IN | No zero-unit positions | Fully automatic control | Ensures investor holdings and ownership totals remain consistent and not duplicated. |
| R44 | VC1/VC2/IN | Position units = aggregate dashboard ownership per investor — positions.units must match dashboard ownership sum | Fully automatic control | Ensures investor holdings and ownership totals remain consistent and not duplicated. |
| R45 | VC1/VC2/IN | Currency from dashboard, no assumptions — currency set from dashboard row, some VC125 rows use EUR | Fully automatic control | Prevents currency mismatches between dashboard records and database records. |
| R46 | VC1/VC2/IN | rate_bps is integer — dashboard shows fractional rates, DB stores integer | Automatic control plus approved process control | Ensures this documented control is applied consistently during reconciliation. |
| R47 | VC1/VC2/IN | Dashboard combined-introducer cells — cells with + or multi-line names treated as warnings | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| R48 | VC1/VC2/IN | Subscription matching order — numeric gate, tie-breakers, name keys for disambiguation | Fully automatic control | Ensures subscription-level values and structure are aligned to source records. |
| R49 | VC2 | Red rows in client file = excluded | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| R50 | VC1 | Strikethrough rows in commission file = deleted from DB | Approved process control only | Ensures this documented control is applied consistently during reconciliation. |
| R51 | VC1/VC2/IN | Client override commissions take precedence over dashboard | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| R52 | VC1/VC2/IN | One introduction per unique (introducer_id, investor_id, deal_id) — introduced_at = contract_date, status = allocated | Automatic control plus approved process control | Ensures record links are valid so each row belongs to the correct vehicle and deal. |
| R53 | VC1/VC2/IN | Every commission must point to an existing introduction — no orphaned commission rows | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| R54 | VC2 | VC206 REDPOINT OMEGA V unequal split — Visual Sectors 111bps $82000, Astral Global 122bps $90000, total $172000 | Fully automatic control | Ensures split allocations follow approved percentages and amounts. |
| R55 | VC2 | VC209 PVPL split after Lafferty removal — Visual Sectors corrected to 10bps $10000 | Fully automatic control | Ensures split allocations follow approved percentages and amounts. |
| R56 | VC2 | VC215 Bromley paired-introducer rate adjustment — remaining introducer keeps original rate minus 100bps | Automatic control plus approved process control | Ensures this documented control is applied consistently during reconciliation. |
| R57 | VC2 | Multi-introducer spread zero issue (VC2) — 21 rows with spread_fee > 0 but introducer spread commissions = 0 | Automatic control plus approved process control | Ensures this documented control is applied consistently during reconciliation. |
| R58 | N/A | No SELECT * in queries | Not a data validation control | Ensures this documented control is applied consistently during reconciliation. |
| R59 | VC1/VC2/IN | Commission basis is always funded_amount — fee tiers only affect investor fees, not partner commissions | Automatic control plus approved process control | Ensures this documented control is applied consistently during reconciliation. |
| R60 | VC1/VC2/IN | Reuse existing investor/introducer records — no duplicate creation, resolve aliases first | Fully automatic control | Ensures different spellings or labels still match the correct person or firm. |
| R61 | VC1 | VC111 BAUMSLAG/FINALMA fee swap correction — specific field values after correction | Automatic control plus approved process control | Ensures this documented control is applied consistently during reconciliation. |
| R62 | VC1 | VC113 MACHOT/OEP perf1 swap correction — direct (perf1=0) and via OEP (perf1=0.1) | Automatic control plus approved process control | Ensures this documented control is applied consistently during reconciliation. |
| E01 | VC1/VC2/IN | Subscription-deal vehicle consistency — subscription's vehicle must match deal's vehicle | Fully automatic control | Ensures record links are valid so each row belongs to the correct vehicle and deal. |
| E02 | VC1/VC2/IN | Dashboard column existence validation — required columns must exist before processing a sheet | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| E03 | VC1/VC2/IN | Commission header drift detection — warns if commission column headers do not match expected patterns | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| E04 | VC1/VC2/IN | Dashboard commission amount without introducer name — non-zero amounts with empty name cell | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| E05 | VC1 | Individual loose identity duplicates — same first+last name on multiple individual-type investor IDs | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| E06 | VC1 | Metric tolerance overrides — commitment uses 1.0 tolerance instead of default 0.01 | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| E07 | VC1 | Percent comparison mode — fraction_or_percent_strict for percent fields | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| E08 | VC1 | Dashboard header row and data start row overrides per sheet | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| E09 | VC1/VC2/IN | Vehicle-level position total vs dashboard ownership total | Fully automatic control | Ensures investor holdings and ownership totals remain consistent and not duplicated. |
| E10 | VC1/VC2/IN | restrict_to_db_vehicles_with_data — vehicles with no DB data are excluded from scope | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| E11 | VC1/IN | Dashboard optional numeric fields — management_fee_percent, bd_fee_percent, bd_fee, finra_shares, finra_fee not required | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| E12 | VC2 | Contacts file cross-reference — introducer/broker names in contacts must exist in DB master tables | Fully automatic control | Enforces broker-versus-introducer policy so allocations go to the right party. |
| E13 | VC2 | Forbidden names in introducers master table (e.g. Lafferty must not appear in introducers table) | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| E14 | VC2 | Forbidden names in introductions table (e.g. Lafferty must not appear in any introduction row) | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| E15 | VC2 | Commission combined amount mismatch — investor-basis-level aggregate check for combined introducer rows | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| E16 | VC2/IN | Performance fee tier splitting — DB performance_fee basis_type split into tier1/tier2 by tier_number | Fully automatic control | Ensures split allocations follow approved percentages and amounts. |
| E17 | ALL | Trust pack — CSV vs JSON count consistency, forbidden pattern enforcement, warning allow-list | Fully automatic control | Ensures record links are valid so each row belongs to the correct vehicle and deal. |
| E18 | ALL | Gate script — verify_all_scopes.sh with set -euo pipefail and exit code propagation | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| E19 | IN | Dashboard ownership fallback to shares if ownership column missing | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| E20 | VC1/VC2/IN | Row-level contract_date comparison with null tolerance | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
| E21 | VC2 | Broker table completeness — expected broker names must exist in brokers table | Fully automatic control | Enforces broker-versus-introducer policy so allocations go to the right party. |
| E22 | VC2 | VC2 dashboard vehicle alias by sheet — VCS001/VCS002 map to VC203 | Fully automatic control | Ensures different spellings or labels still match the correct person or firm. |
| E23 | IN | IN2 (IN102) commission extraction disabled — empty slot config, no commissions extracted | Fully automatic control | Ensures this documented control is applied consistently during reconciliation. |
