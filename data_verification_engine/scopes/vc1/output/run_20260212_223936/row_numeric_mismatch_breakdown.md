# VC1 row_numeric_mismatch Breakdown

- Source run: `data_verification_engine/scopes/vc1/output/run_20260212_223936`
- Total `row_numeric_mismatch`: **145**

## Counts by Vehicle

| Vehicle | Count |
|---|---:|
| VC106 | 115 |
| VC111 | 6 |
| VC113 | 2 |
| VC122 | 20 |
| VC126 | 2 |

## Counts by Metric

| Metric | Count |
|---|---:|
| perf1_percent | 110 |
| price_per_share | 9 |
| bd_fee_percent | 8 |
| finra_shares | 6 |
| sub_fee | 5 |
| sub_fee_percent | 5 |
| bd_fee | 2 |

## Counts by Vehicle + Metric

| Vehicle | Metric | Count |
|---|---|---:|
| VC106 | perf1_percent | 101 |
| VC106 | bd_fee_percent | 8 |
| VC106 | finra_shares | 6 |
| VC111 | perf1_percent | 2 |
| VC111 | sub_fee | 2 |
| VC111 | sub_fee_percent | 2 |
| VC113 | perf1_percent | 2 |
| VC122 | price_per_share | 9 |
| VC122 | perf1_percent | 5 |
| VC122 | sub_fee | 3 |
| VC122 | sub_fee_percent | 3 |
| VC126 | bd_fee | 2 |

## Repeated Value Patterns (dashboard vs db)

| Vehicle | Metric | Dashboard | DB | Count |
|---|---|---:|---:|---:|
| VC106 | perf1_percent | 0.2 | 0 | 68 |
| VC106 | perf1_percent | 0.1 | 0 | 27 |
| VC106 | bd_fee_percent | 0.03 | 0 | 6 |
| VC122 | price_per_share | 1 | 0 | 5 |
| VC106 | finra_shares | 0.71 | 0 | 4 |
| VC106 | perf1_percent | 0 | 20 | 4 |
| VC122 | perf1_percent | 0.2 | 0 | 3 |
| VC122 | sub_fee_percent | 0.02 | 0 | 3 |
| VC122 | perf1_percent | 0.1 | 0 | 2 |
| VC122 | price_per_share | 1 | 0.62533 | 2 |
| VC122 | sub_fee | 1500 | 0 | 2 |
| VC126 | bd_fee | 625 | 0.025 | 2 |
| VC106 | bd_fee_percent | 0.02 | 0 | 1 |
| VC106 | bd_fee_percent | 0.1 | 0 | 1 |
| VC106 | finra_shares | 0.7356 | 0 | 1 |
| VC106 | finra_shares | 2 | 0 | 1 |
| VC106 | perf1_percent | 0.1 | 20 | 1 |
| VC106 | perf1_percent | 0.15 | 0 | 1 |
| VC111 | perf1_percent | 0.1 | 0.2 | 1 |
| VC111 | perf1_percent | 0.2 | 0.1 | 1 |
| VC111 | sub_fee | 0 | 2000 | 1 |
| VC111 | sub_fee | 2000 | 0 | 1 |
| VC111 | sub_fee_percent | 0 | 0.04 | 1 |
| VC111 | sub_fee_percent | 0.04 | 0 | 1 |
| VC113 | perf1_percent | 0 | 0.1 | 1 |
| VC113 | perf1_percent | 0.1 | 0 | 1 |
| VC122 | price_per_share | 0.62533 | 0 | 1 |
| VC122 | price_per_share | 1 | 0.40076 | 1 |
| VC122 | sub_fee | 1000 | 0 | 1 |

## Full 145 Rows (line-by-line)

| # | Vehicle | Sheet Row | Investor | Metric | Dashboard | DB | Delta | Mode |
|---:|---|---:|---|---|---:|---:|---:|---|
| 1 | VC106 | VC6:22 | MA GROUP AG | perf1_percent | 0.1 | 0 | -0.1 | exact_date |
| 2 | VC106 | VC6:23 | KRANA INVESTMENTS PTE. LTD. | perf1_percent | 0.1 | 0 | -0.1 | exact_date |
| 3 | VC106 | VC6:25 | Sandra KOHLER CABIAN | perf1_percent | 0.1 | 0 | -0.1 | exact_date |
| 4 | VC106 | VC6:26 | Dario SCIMONE | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 5 | VC106 | VC6:28 | Elidon Estate Inc | perf1_percent | 0.1 | 0 | -0.1 | exact_date |
| 6 | VC106 | VC6:29 | Adam Smith Singapore Pte Ltd | perf1_percent | 0.1 | 0 | -0.1 | exact_date |
| 7 | VC106 | VC6:34 | Mrs and Mr Beatrice & Marcel KNOPF | perf1_percent | 0.1 | 0 | -0.1 | exact_date |
| 8 | VC106 | VC6:35 | VOLF Trust | perf1_percent | 0.1 | 0 | -0.1 | exact_date |
| 9 | VC106 | VC6:38 | Heinz & Barbara WINZ | perf1_percent | 0.1 | 0 | -0.1 | exact_date |
| 10 | VC106 | VC6:39 | Sabrina WINZ | perf1_percent | 0.1 | 0 | -0.1 | exact_date |
| 11 | VC106 | VC6:41 | Craig BROWN | bd_fee_percent | 0.1 | 0 | -0.1 | exact_date |
| 12 | VC106 | VC6:41 | Craig BROWN | finra_shares | 2 | 0 | -2 | exact_date |
| 13 | VC106 | VC6:42 | TRUE INVESTMENTS 4 LLC | bd_fee_percent | 0.02 | 0 | -0.02 | exact_date |
| 14 | VC106 | VC6:43 | ROSEN INVEST HOLDINGS Inc | perf1_percent | 0.1 | 0 | -0.1 | exact_date |
| 15 | VC106 | VC6:44 | Mrs & Mr Subbiah SUBRAMANIAN | perf1_percent | 0.1 | 0 | -0.1 | fallback_amounts_date |
| 16 | VC106 | VC6:56 | Hedgebay Securities LLC | finra_shares | 0.71 | 0 | -0.71 | fallback_amounts_date |
| 17 | VC106 | VC6:57 | Hedgebay Securities LLC | finra_shares | 0.71 | 0 | -0.71 | fallback_amounts_date |
| 18 | VC106 | VC6:58 | Hedgebay Securities LLC | finra_shares | 0.71 | 0 | -0.71 | fallback_amounts_date |
| 19 | VC106 | VC6:59 | Hedgebay Securities LLC | finra_shares | 0.71 | 0 | -0.71 | fallback_amounts_date |
| 20 | VC106 | VC6:60 | ONC Limited | perf1_percent | 0.1 | 0 | -0.1 | exact_date |
| 21 | VC106 | VC6:62 | Patrick CORR | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 22 | VC106 | VC6:63 | Stephen JORDAN | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 23 | VC106 | VC6:64 | FigTree Family Office Ltd | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 24 | VC106 | VC6:66 | Emile VAN DEN BOL | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 25 | VC106 | VC6:67 | Mark MATTHEWS | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 26 | VC106 | VC6:68 | Matthew HAYCOX | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 27 | VC106 | VC6:69 | John ACKERLEY | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 28 | VC106 | VC6:70 | Steve J MANNING | perf1_percent | 0.2 | 0 | -0.2 | fallback_loose_name_amounts |
| 29 | VC106 | VC6:72 | Gregory BROOKS | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 30 | VC106 | VC6:74 | Stephane DAHAN | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 31 | VC106 | VC6:75 | Jean DUTIL | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 32 | VC106 | VC6:78 | Sudon Carlop Holdings Limited | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 33 | VC106 | VC6:79 | Lesli Ann SCHUTTE | perf1_percent | 0.2 | 0 | -0.2 | fallback_loose_name_amounts |
| 34 | VC106 | VC6:83 | Erich GRAF | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 35 | VC106 | VC6:84 | TERRA Financial & Management Services SA | perf1_percent | 0.1 | 0 | -0.1 | exact_date |
| 36 | VC106 | VC6:90 | CLOUDSAFE HOLDINGS LTD | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 37 | VC106 | VC6:91 | David HOLDEN | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 38 | VC106 | VC6:94 | Imrat HAYAT | bd_fee_percent | 0.03 | 0 | -0.03 | fallback_amounts_date |
| 39 | VC106 | VC6:94 | Imrat HAYAT | finra_shares | 0.7356 | 0 | -0.7356 | fallback_amounts_date |
| 40 | VC106 | VC6:101 | David BACHELIER | perf1_percent | 0 | 20 | 20 | exact_date |
| 41 | VC106 | VC6:103 | Ashish KOTHARI | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 42 | VC106 | VC6:105 | Fawad MUKHTAR | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 43 | VC106 | VC6:106 | KABELLA LTD | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 44 | VC106 | VC6:107 | SOUTH SOUND LTD | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 45 | VC106 | VC6:110 | CINCORIA LIMITED | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 46 | VC106 | VC6:112 | Mrs Nalini Yoga & Mr Aran James WILLETTS | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 47 | VC106 | VC6:113 | Emma Graham-Taylor & Gregory SOMMERVILLE | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 48 | VC106 | VC6:115 | Kim LUND | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 49 | VC106 | VC6:116 | Ivan BELGA | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 50 | VC106 | VC6:118 | Karthic JAYARAMAN | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 51 | VC106 | VC6:119 | Imran HAKIM | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 52 | VC106 | VC6:120 | Kenilworth Ltd | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 53 | VC106 | VC6:121 | Adil Arshed KHAWAJA | perf1_percent | 0.2 | 0 | -0.2 | fallback_loose_name_amounts |
| 54 | VC106 | VC6:123 | Lubna M. A. QUNASH | perf1_percent | 0.2 | 0 | -0.2 | fallback_loose_name_amounts |
| 55 | VC106 | VC6:124 | Bank SYZ AG | perf1_percent | 0.1 | 0 | -0.1 | exact_date |
| 56 | VC106 | VC6:125 | Bank SYZ AG | perf1_percent | 0.1 | 0 | -0.1 | exact_date |
| 57 | VC106 | VC6:126 | Bank SYZ AG | perf1_percent | 0.1 | 0 | -0.1 | exact_date |
| 58 | VC106 | VC6:127 | Bank SYZ AG | perf1_percent | 0.1 | 0 | -0.1 | exact_date |
| 59 | VC106 | VC6:128 | Bank SYZ AG | perf1_percent | 0.1 | 0 | -0.1 | exact_date |
| 60 | VC106 | VC6:129 | Bank SYZ AG | perf1_percent | 0.1 | 0 | -0.1 | exact_date |
| 61 | VC106 | VC6:130 | Bank SYZ AG | perf1_percent | 0.1 | 0 | -0.1 | exact_date |
| 62 | VC106 | VC6:131 | Bank SYZ AG | perf1_percent | 0.1 | 0 | -0.1 | exact_date |
| 63 | VC106 | VC6:132 | Damien KRAUSER | perf1_percent | 0.1 | 0 | -0.1 | exact_date |
| 64 | VC106 | VC6:134 | Michel Louis GUERIN | perf1_percent | 0.2 | 0 | -0.2 | fallback_loose_name_amounts |
| 65 | VC106 | VC6:135 | Eric Pascal LE SEIGNEUR | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 66 | VC106 | VC6:137 | Phaena Advisory Ltd | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 67 | VC106 | VC6:140 | POTASSIUM Capital | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 68 | VC106 | VC6:141 | Aatif N. HASSAN | perf1_percent | 0.2 | 0 | -0.2 | fallback_loose_name_amounts |
| 69 | VC106 | VC6:142 | Kevin FOSTER WILTSHIRE | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 70 | VC106 | VC6:143 | GTV Partners SA | perf1_percent | 0.15 | 0 | -0.15 | exact_date |
| 71 | VC106 | VC6:144 | LENN Participations SARL | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 72 | VC106 | VC6:145 | WEALTH TRAIN LIMITED | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 73 | VC106 | VC6:147 | TERSANE INTERNATIONAL LTD | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 74 | VC106 | VC6:148 | Brahma Finance (BVI) Ltd | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 75 | VC106 | VC6:158 | Eric SARASIN | perf1_percent | 0.1 | 0 | -0.1 | exact_date |
| 76 | VC106 | VC6:159 | Damien KRAUSER | perf1_percent | 0.1 | 20 | 19.9 | exact_date |
| 77 | VC106 | VC6:162 | REVERY CAPITAL Limited | perf1_percent | 0 | 20 | 20 | exact_date |
| 78 | VC106 | VC6:163 | Sandra KOHLER CABIAN | perf1_percent | 0.1 | 0 | -0.1 | exact_date |
| 79 | VC106 | VC6:166 | Nicki ASQUITH | perf1_percent | 0 | 20 | 20 | exact_date |
| 80 | VC106 | VC6:167 | Isabella CHANDRIS | perf1_percent | 0 | 20 | 20 | exact_date |
| 81 | VC106 | VC6:169 | Herve STEIMES | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 82 | VC106 | VC6:171 | Frederic SAMAMA | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 83 | VC106 | VC6:172 | Denis MATTHEY | perf1_percent | 0.1 | 0 | -0.1 | exact_date |
| 84 | VC106 | VC6:173 | SWISS TRUSTEES OF GENEVA SA as Trustees of the LUTEPIN TRUST | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 85 | VC106 | VC6:174 | Laurent CUDRE-MAUROUX | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 86 | VC106 | VC6:175 | Georges Sylvain CYTRON | perf1_percent | 0.2 | 0 | -0.2 | fallback_loose_name_amounts |
| 87 | VC106 | VC6:176 | Rosario RIENZO | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 88 | VC106 | VC6:177 | Raphael GHESQUIERES | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 89 | VC106 | VC6:178 | Guillaume SAMAMA | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 90 | VC106 | VC6:179 | David Jean ROSSIER | perf1_percent | 0.2 | 0 | -0.2 | fallback_loose_name_amounts |
| 91 | VC106 | VC6:180 | MARSAULT INTERNATIONAL LTD | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 92 | VC106 | VC6:181 | Bernard Henri DUFAURE | perf1_percent | 0.2 | 0 | -0.2 | fallback_loose_name_amounts |
| 93 | VC106 | VC6:183 | Scott FLETCHER | perf1_percent | 0.1 | 0 | -0.1 | exact_date |
| 94 | VC106 | VC6:185 | Charles DE BAVIER | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 95 | VC106 | VC6:188 | Hossien Hakimi JAVID | bd_fee_percent | 0.03 | 0 | -0.03 | exact_date |
| 96 | VC106 | VC6:189 | Kamyar BADII | bd_fee_percent | 0.03 | 0 | -0.03 | exact_date |
| 97 | VC106 | VC6:190 | Shaham SOLOUKI | bd_fee_percent | 0.03 | 0 | -0.03 | exact_date |
| 98 | VC106 | VC6:191 | Kian Mohammad Hakimi JAVID | bd_fee_percent | 0.03 | 0 | -0.03 | fallback_loose_name_amounts |
| 99 | VC106 | VC6:192 | Salman Raza HUSSAIN | bd_fee_percent | 0.03 | 0 | -0.03 | fallback_loose_name_amounts |
| 100 | VC106 | VC6:193 | Juan TONELLI BANFI | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 101 | VC106 | VC6:198 | Banco BTG Pactual S.A. Client 36003 | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 102 | VC106 | VC6:200 | Banco BTG Pactual S.A. Client 36957 | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 103 | VC106 | VC6:201 | Banco BTG Pactual S.A. Client 80738 | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 104 | VC106 | VC6:202 | Banco BTG Pactual S.A. Client 80772 | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 105 | VC106 | VC6:203 | Banco BTG Pactual S.A. Client 80775 | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 106 | VC106 | VC6:204 | Banco BTG Pactual S.A. Client 80776 | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 107 | VC106 | VC6:205 | Banco BTG Pactual S.A. Client 80840 | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 108 | VC106 | VC6:206 | Banco BTG Pactual S.A. Client 80862 | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 109 | VC106 | VC6:207 | Banco BTG Pactual S.A. Client 80873 | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 110 | VC106 | VC6:208 | Banco BTG Pactual S.A. Client 80890 | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 111 | VC106 | VC6:209 | Banco BTG Pactual S.A. Client 80910 | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 112 | VC106 | VC6:210 | Banco BTG Pactual S.A. Client 81022 | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 113 | VC106 | VC6:211 | Banco BTG Pactual S.A. Client 515 | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 114 | VC106 | VC6:212 | RLABS HOLDINGS LTD | perf1_percent | 0.1 | 0 | -0.1 | exact_date |
| 115 | VC106 | VC6:214 | Samuel GRANDCHAMP | perf1_percent | 0.2 | 0 | -0.2 | exact_date |
| 116 | VC111 | VC11:12 | Dan Jean BAUMSLAG DUTIL | perf1_percent | 0.1 | 0.2 | 0.1 | relaxed |
| 117 | VC111 | VC11:12 | Dan Jean BAUMSLAG DUTIL | sub_fee | 0 | 2000 | 2000 | relaxed |
| 118 | VC111 | VC11:12 | Dan Jean BAUMSLAG DUTIL | sub_fee_percent | 0 | 0.04 | 0.04 | relaxed |
| 119 | VC111 | VC11:22 | FINALMA SUISSE SA | perf1_percent | 0.2 | 0.1 | -0.1 | relaxed |
| 120 | VC111 | VC11:22 | FINALMA SUISSE SA | sub_fee | 2000 | 0 | -2000 | relaxed |
| 121 | VC111 | VC11:22 | FINALMA SUISSE SA | sub_fee_percent | 0.04 | 0 | -0.04 | relaxed |
| 122 | VC113 | VC13:53 | Julien MACHOT | perf1_percent | 0 | 0.1 | 0.1 | exact_date |
| 123 | VC113 | VC13:62 | OEP Ltd | perf1_percent | 0.1 | 0 | -0.1 | fallback_amounts_date |
| 124 | VC122 | VC22:3 | Julien MACHOT | price_per_share | 1 | 0.40076 | -0.59924 | exact_date |
| 125 | VC122 | VC22:4 | AS ADVISORY DWC LLC | perf1_percent | 0.1 | 0 | -0.1 | relaxed |
| 126 | VC122 | VC22:4 | AS ADVISORY DWC LLC | price_per_share | 1 | 0 | -1 | relaxed |
| 127 | VC122 | VC22:5 | Deyan D MIHOV | perf1_percent | 0.2 | 0 | -0.2 | relaxed |
| 128 | VC122 | VC22:5 | Deyan D MIHOV | price_per_share | 1 | 0 | -1 | relaxed |
| 129 | VC122 | VC22:5 | Deyan D MIHOV | sub_fee | 1500 | 0 | -1500 | relaxed |
| 130 | VC122 | VC22:5 | Deyan D MIHOV | sub_fee_percent | 0.02 | 0 | -0.02 | relaxed |
| 131 | VC122 | VC22:6 | Sheikh Yousef AL SABAH | perf1_percent | 0.2 | 0 | -0.2 | relaxed |
| 132 | VC122 | VC22:6 | Sheikh Yousef AL SABAH | price_per_share | 1 | 0 | -1 | relaxed |
| 133 | VC122 | VC22:6 | Sheikh Yousef AL SABAH | sub_fee | 1000 | 0 | -1000 | relaxed |
| 134 | VC122 | VC22:6 | Sheikh Yousef AL SABAH | sub_fee_percent | 0.02 | 0 | -0.02 | relaxed |
| 135 | VC122 | VC22:7 | Anke Skoludek RICE | price_per_share | 1 | 0.62533 | -0.37467 | fallback_loose_name_amounts |
| 136 | VC122 | VC22:8 | VERSO CAPITAL ESTABLISHMENT | perf1_percent | 0.1 | 0 | -0.1 | relaxed |
| 137 | VC122 | VC22:8 | VERSO CAPITAL ESTABLISHMENT | price_per_share | 1 | 0 | -1 | relaxed |
| 138 | VC122 | VC22:9 | INNOVATECH COMPARTMENT 8 | price_per_share | 1 | 0.62533 | -0.37467 | fallback_amounts_date |
| 139 | VC122 | VC22:11 | Erich GRAF | price_per_share | 0.62533 | 0 | -0.62533 | exact_date |
| 140 | VC122 | VC22:12 | LF GROUP SARL | perf1_percent | 0.2 | 0 | -0.2 | relaxed |
| 141 | VC122 | VC22:12 | LF GROUP SARL | price_per_share | 1 | 0 | -1 | relaxed |
| 142 | VC122 | VC22:12 | LF GROUP SARL | sub_fee | 1500 | 0 | -1500 | relaxed |
| 143 | VC122 | VC22:12 | LF GROUP SARL | sub_fee_percent | 0.02 | 0 | -0.02 | relaxed |
| 144 | VC126 | VC26:20 | Garson Brandon LEVY | bd_fee | 625 | 0.025 | -624.975 | exact_date |
| 145 | VC126 | VC26:25 | Amanda RYZOWY | bd_fee | 625 | 0.025 | -624.975 | exact_date |