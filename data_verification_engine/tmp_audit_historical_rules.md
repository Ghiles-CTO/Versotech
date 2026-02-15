# Historical Business Rules Audit — Data Verification Engine

Generated: 2026-02-14
Sources: datafixing/, datamigration/, dashboardreconciliations/, verso_capital_2_data/, data_verification_engine/

---

## A. Name Mapping / Normalization Rules

**1. Introducer name aliases (VC1 scope)**
- `Anand` / `Anand Sethia` / `Set Cap` / `Setcap` -> same introducer identity (Set Cap, id `b661243f`)
- `Dan` / `Daniel` -> `Daniel Baumslag` (id `18aecf7f` in VC1 scope, `81e78a56` legacy)
- `Rick` / `Rick+Andrew` / `Elevation+Rick` -> `Altras Capital Financing Broker` (id `55b67690`)
- `Terra` / `TERRA` / `TERRA Financial` / `Stableton+Terra` -> `Terra Financial & Management Services SA` (id `1e9af1ef`)
- `Setcap+Daniel Baumslag` -> replaced entirely by `Set Cap` (combined introducer deleted, see SET_CAP_DANIEL_REPLACEMENT_2026-02-09.md)
- `Anand+Dan` -> combined partner label in dashboard; DB stores as `Set Cap` for commission flow
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/VERSO/datafixing/vc106_rules_and_actions.md` (Rules Applied section), `/Users/ghilesmoussaoui/Desktop/Versotech/VERSO/datafixing/VC106_RECONCILIATION_SUMMARY.md`, `/Users/ghilesmoussaoui/Desktop/Versotech/verso_capital_2_data/SET_CAP_DANIEL_REPLACEMENT_2026-02-09.md`
- Engine should validate: YES -- verify no combined introducer records remain; verify alias resolution is deterministic

**2. Introducer name aliases (VC2 scope)**
- `Renbridge` / `Renaissance` -> `Renaissance Bridge Capital LLC`
- `Headwall / AGP` -> `Alliance Global Partners LLC`
- `Aeon` -> `AEON INC`
- `Old City Securities LLC` / `Old City Capital` -> same entity (dual role: broker + introducer)
- `Astral Global Limited` / `Astra Global` -> same entity
- `R. F. Lafferty & Co. Inc.` / `Lafferty` -> same entity (broker only in VC2)
- `Bromley Capital Partners` / `Bromley` -> context-dependent (broker in VC215, introducer in VC202/VC206/VC209)
- `Robert C. VOGT IV` / `Georges CHEN` -> specific canonical name forms
- `Bright Views Holdings` -> internal placeholder, not a real introducer (migration artifact)
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/VC2_AUDIT_ENGINE_FIX_CHECKPOINT_2026-02-11.md` (section 5), `/Users/ghilesmoussaoui/Desktop/Versotech/verso_capital_2_data/VC2_MIGRATION_PLAN.md` (Matching Rules Locked)
- Engine should validate: YES -- alias maps must resolve consistently; combined-name cells (`+` or `\n` separators) should be flagged as warnings

**3. Investor name normalization rules**
- Strip titles: `mr/mrs/ms/dr/sir/madam/mme/prof`
- Replace `&` with `and`
- Normalize `limited` -> `ltd`
- Remove punctuation and whitespace for matching key
- Normalize line breaks into spaces
- Token replacements: `dan` -> `daniel`, `mickael` -> `michael`
- Two-name swap: `A and B` matches `B and A`
- Explicit investor aliases:
  - `anandrathi` -> `setcap`
  - `garsonlevy` -> `garsonbrandonlevy`
  - `odileandgeorgesmradandfenergi` -> `odileandgeorgesaboumradandfenergi`
  - `liudmilaandalexeyromanovaromanov` -> `liudmilaandalexeyromanov`
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/dashboardreconciliations/LIVE_RECONCILIATION_RULES.md` (Investor Name Normalization)
- Engine should validate: YES -- these rules must be applied before any name-based matching

**4. VC2 canonical naming rule**
- Use client file legal names as stored names in DB
- Use dashboard names only for matching/row alignment
- Alias mapping is for matching only, not storage-name override
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/verso_capital_2_data/VC2_MIGRATION_PLAN.md` (Matching Rules Locked, "Canonical naming rule")
- Engine should validate: YES -- stored investor/introducer names should not be dashboard shorthand

**5. Investor dedup rules (merged pairs)**
- `Talal PASHA` -> `Talal CHAMSI PASHA` (survivor)
- `Sandra CABIAN` -> `Sandra KOHLER CABIAN` (survivor)
- `Sheikh AL SABAH` -> `Sheikh Yousef AL SABAH` (survivor)
- `Zandera (Finco) Limited` -> `Zandera (Holdco) Limited` (merged, Finco deleted)
- Rule: keep record with the fuller name; reassign all FK references in single transaction
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/DB_CHANGES_CHECKPOINT_2026-02-11.md` (sections 7, Pair 1-3), `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/DB_CHANGES_CHECKPOINT_2026-02-13.md` (section 4)
- Engine should validate: YES -- verify no orphaned investor IDs remain; verify discarded IDs have zero FK references

**6. Introducer cleanup / merge records**
- `Stableton+Terra` -> replaced by `Terra Financial & Management Services SA` (combined introducer deleted)
- `Denis Matthey` duplicate deleted (0 commissions/introductions/subscriptions)
- `GEMERA Consulting Pte Ltd` old ID (`61e01a81`) merged into canonical (`87571ef2`)
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/VERSO/datafixing/introducer_cleanup_actions.md`
- Engine should validate: YES -- verify no stale introducer IDs referenced in commissions/introductions

---

## B. Commission Calculation Rules

**7. Commission basis types and rate conversion**
- Dashboard percent columns are decimal fractions (e.g., `0.02 = 2%`)
- `rate_bps = percent * 10000`
- Basis types in DB: `invested_amount`, `spread`, `performance_fee`
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/VERSO/datafixing/vc106_rules_and_actions.md` (Commission calculations)
- Engine should validate: YES -- verify rate_bps = round(percent * 10000) for all commission rows

**8. Invested amount commission calculation**
- Use dashboard `Subscription fees` amount column when available
- If missing, compute: `amount_invested * percent`
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/VERSO/datafixing/vc106_rules_and_actions.md` (Commission calculations)
- Engine should validate: YES -- verify accrual_amount consistency with base_amount * rate_bps / 10000

**9. Spread commission calculation**
- Use dashboard `Spread PPS Fees` when available
- If missing, compute: `Spread PPS * shares`
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/VERSO/datafixing/vc106_rules_and_actions.md` (Commission calculations)
- Engine should validate: YES -- verify spread commission = spread_per_share * num_shares where applicable

**10. Performance fee commission rows**
- Created with `accrual_amount = 0.0`, `threshold_multiplier = 0.0`
- One row per tier per investor per introducer
- Dashboard performance_fee rates stored in bps in DB
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/VERSO/datafixing/vc106_rules_and_actions.md` (Commission calculations)
- Engine should validate: YES -- performance_fee rows should have accrual_amount = 0 (they are forward-looking)

**11. All commissions status = paid**
- Client confirmed all commissions were paid; `status = 'paid'`, `paid_at = created_at` when paid_at was NULL
- Applied 2026-01-31 across all 867 rows
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/VERSO/datafixing/commission_status_paid_update.md`
- Engine should validate: YES -- all commission rows should have status = 'paid'

**12. Commission duplicate detection rule**
- Only exact duplicates (all fields identical except id/created_at) are erroneous
- Duplicates from multiple import batches: keep earlier-created row, delete later copy
- Stale batch (rate_bps=0) superseded by re-import batch with computed rate_bps -> delete stale
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/VERSO/datafixing/vc106_rules_and_actions.md` (Duplicates), `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/DB_CHANGES_CHECKPOINT_2026-02-11.md` (sections 10, 15)
- Engine should validate: YES -- detect exact-duplicate commission rows; flag stale batch rows with rate_bps=0

**13. Commission split rules (multi-subscription investors)**
- Investors with 2+ subscriptions in same vehicle: dashboard shows 2 commission rows
- DB must have matching split rows (different `base_amount` to differentiate)
- Example: DALINGA HOLDING AG in VC125 has 2 subscriptions -> 2 commission rows per introducer
- Example: Eric LE SEIGNEUR in VC106 has 2 subscriptions -> 2 spread commission rows
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/DB_CHANGES_CHECKPOINT_2026-02-11.md` (sections 18, 21)
- Engine should validate: YES -- commission row count per investor should match subscription count for that vehicle

**14. Commission total ruled diffs (expected deltas)**
- Dashboard sums ALL fee groups (VERSO CAPITAL/MANAGEMENT + PARTNERS + INTRODUCERS)
- DB `introducer_commissions` only stores introducer commissions
- Known expected deltas per vehicle must be ruled as warnings, not failures:
  - IN102: -74881.5498 (invested_amount) -- all VERSO CAPITAL + PARTNERS, no introducer commissions
  - IN103: -20000.0 (invested_amount), -249998.61284 (spread) -- VERSO CAPITAL portion
  - IN106: -3300.0 (invested_amount) -- VERSO MANAGEMENT portion
  - VC113: +0.0125 (spread rounding)
  - VC114: -0.4 (spread, tiny dashboard residual)
  - VC106: +0.058 (spread rounding)
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/DB_CHANGES_CHECKPOINT_2026-02-11.md` (sections 5, 17, 25)
- Engine should validate: YES -- must maintain ruled diff registry per vehicle/basis_type

**15. Zero-amount commission artifacts**
- 66 commission rows in VC106 have `rate_bps=0, accrual_amount=0` (import artifacts from 2026-02-02)
- These are excluded from row-count parity checks (engine rule: skip DB rows where `abs(amount) <= 0.01`)
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/DB_CHANGES_CHECKPOINT_2026-02-11.md` (section 16), `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/DB_CHANGES_CHECKPOINT_2026-02-13.md` (section 1)
- Engine should validate: YES -- zero-amount rows should be flagged but not cause failures

---

## C. Broker / Introducer Treatment Rules

**16. Partners are treated as introducers**
- Dashboard Partner columns are extracted alongside Introducer columns
- Both flow into `introducers` + `introductions` + `introducer_commissions` tables
- No separate partner role in DB
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/VERSO/datafixing/vc106_rules_and_actions.md` (first rule), `/Users/ghilesmoussaoui/Desktop/Versotech/dashboardreconciliations/LIVE_RECONCILIATION_RULES.md` (implicit), `/Users/ghilesmoussaoui/Desktop/Versotech/verso_capital_2_data/VC2_MIGRATION_PLAN.md`
- Engine should validate: YES -- verify no orphaned partner entities; all commission rows link to `introducers` table

**17. R. F. Lafferty & Co. Inc. = BROKER only (VC2 scope)**
- Fully removed from `introducers` table
- 0 commission rows, 0 introduction rows in DB
- Was present in dashboard for VC203, VC207, VC209
- All Lafferty commissions deleted; paired introducers adjusted
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/verso_capital_2_data/VC2_CHECKPOINT_2026-02-10_BROKER_INTRODUCER.md` (section 1, R. F. Lafferty)
- Engine should validate: YES -- verify zero rows in introducer_commissions/introductions with Lafferty as introducer

**18. Old City Securities LLC = DUAL ROLE (VC2 scope)**
- Added to `brokers` table (broker contact: Eytan Feldman)
- Introducer data in `introducers` table left untouched (introducer contact: Christine Healey)
- Active in VC203 only
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/verso_capital_2_data/VC2_CHECKPOINT_2026-02-10_BROKER_INTRODUCER.md` (section 5)
- Engine should validate: YES -- verify Old City exists in both brokers and introducers tables

**19. Bromley Capital Partners = context-dependent role**
- VC215 ONLY: treated as BROKER. All Bromley commission rows removed. Paired introducers kept with rate reduced by 100 bps
- VC202, VC206, VC209: treated as legitimate INTRODUCER with commissions
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/verso_capital_2_data/VC2_CHECKPOINT_2026-02-10_BROKER_INTRODUCER.md` (section 1, Bromley), `/Users/ghilesmoussaoui/Desktop/Versotech/verso_capital_2_data/VC2_CHECKPOINT.md` (section 3, VC215 Bromley rule)
- Engine should validate: YES -- verify no Bromley commissions exist on VC215; verify Bromley commissions exist on VC202/VC206/VC209

**20. VC215 Set Cap = spread-only partner**
- invested_amount: 14 rows, all $0.00 (0 bps) -- correct, dashboard shows 0.00% sub fees
- spread: 14 rows, sum $25,654.81 -- matches dashboard
- performance_fee: 14 rows, all $0.00
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/verso_capital_2_data/VC2_CHECKPOINT_2026-02-10_BROKER_INTRODUCER.md` (section 4)
- Engine should validate: YES -- Set Cap invested_amount total on VC215 must be zero

**21. Bright Views Holdings = internal placeholder**
- Not a real introducer; migration artifact
- 3 commission rows ($3,000 each = $9,000) for Jamel CHANDOUL in VC209
- Flagged as warning only, not failure
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/verso_capital_2_data/VC2_CHECKPOINT_2026-02-10_BROKER_INTRODUCER.md` (section 5), `/Users/ghilesmoussaoui/Desktop/Versotech/verso_capital_2_data/audit_engine/VC2_RULES_COVERAGE_2026-02-11.md`
- Engine should validate: YES -- Bright Views rows should be warning-level, not failure

**22. Documented split assertions (VC2 scope)**
- VC203 EVERLASTING: Sakal Advisory 5,000 @ 50 bps, Astral Global 10,000 @ 100 bps
- VC206 REDPOINT OMEGA V: Visual Sectors 82,000 @ 111 bps, Astral Global 90,000 @ 122 bps
- VC209 PVPL: Visual Sectors 10,000 @ 10 bps
- Bromley retained as introducer commissions:
  - VC202 SPLENDID HEIGHT: 80,000 @ 80 bps
  - VC206 KIWI: 30,000 @ 150 bps
  - VC209 SINO SUISSE: 18,849.42 @ 196 bps
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/verso_capital_2_data/audit_engine/VC2_RULES_COVERAGE_2026-02-11.md` (Specific documented split assertions)
- Engine should validate: YES -- these exact amounts/rates should be asserted per vehicle/investor/introducer

---

## D. Subscription Rules

**23. Dashboard is source of truth**
- Every dashboard row with non-zero amounts/shares/ownership becomes a subscription
- 1:1 mapping between dashboard rows and DB subscriptions
- Repeated dashboard rows (same investor/amount/shares) treated as separate subscriptions
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/dashboardreconciliations/LIVE_RECONCILIATION_RULES.md`, `/Users/ghilesmoussaoui/Desktop/Versotech/VERSO/datafixing/VC106_RECONCILIATION_SUMMARY.md`
- Engine should validate: YES -- verify row count parity between dashboard and DB per vehicle

**24. Zero ownership rule**
- If dashboard ownership/units = 0: do NOT create subscription or position
- Commissions can still exist for zero-ownership rows (VC206 has 5 such rows)
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/dashboardreconciliations/LIVE_RECONCILIATION_RULES.md`, `/Users/ghilesmoussaoui/Desktop/Versotech/VERSO/datafixing/06_subscription_cleanup.md`, `/Users/ghilesmoussaoui/Desktop/Versotech/VERSO/datafixing/subscriptions_positions_deletions_2026-01-26.md`
- Engine should validate: YES -- verify no subscriptions exist for zero-ownership dashboard rows (except where commissions-only is documented)

**25. Missing ownership handling**
- If ownership column exists in sheet but row value is blank: do NOT treat as active
- If ownership column is missing entirely from sheet (IN101, IN102, IN109, IN111): treat all investor rows as active
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/dashboardreconciliations/LIVE_RECONCILIATION_RULES.md` (Ownership handling), `/Users/ghilesmoussaoui/Desktop/Versotech/VERSO/datafixing/vc122_no_ownership_cleanup_2026-01-27.md`
- Engine should validate: YES -- per-sheet ownership column presence must be checked

**26. Subscription status/funding rules (VC2)**
- `status = funded`
- `funded_amount = commitment`
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/verso_capital_2_data/VC2_MIGRATION_PLAN.md` (Data Rules to Apply During Upload)
- Engine should validate: YES -- all VC2 subscriptions should be funded with funded_amount = commitment

**27. Every subscription must have deal_id**
- Subscriptions with NULL deal_id are erroneous when the vehicle has exactly one deal
- 12 subscriptions fixed in VC111/VC113/VC122
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/DB_CHANGES_CHECKPOINT_2026-02-11.md` (section 8)
- Engine should validate: YES -- detect NULL deal_id on funded subscriptions

**28. bd_fee_amount calculation rule**
- `bd_fee_amount = commitment * bd_fee_percent`
- Bug pattern: bd_fee_amount was set to the percentage value itself (e.g., 0.02) instead of dollar amount
- Affected IN103 (4 rows), VC126 (2 rows)
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/DB_CHANGES_CHECKPOINT_2026-02-11.md` (sections 2, 9)
- Engine should validate: YES -- verify bd_fee_amount = commitment * bd_fee_percent (within tolerance); flag rows where bd_fee_amount equals bd_fee_percent exactly

**29. subscription_fee_amount calculation rule**
- `subscription_fee_amount = commitment * subscription_fee_percent`
- 246 values were corrected where percent was stored instead of amount
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/dashboardreconciliations/LIVE_RECONCILIATION_RULES.md` (Field Fixes Applied)
- Engine should validate: YES -- verify subscription_fee_amount = commitment * subscription_fee_percent (within tolerance)

**30. VC106 performance_fee_tier1_percent convention**
- VC106 uses WHOLE NUMBER convention: `20 = 20%`, `10 = 10%`, `15 = 15%`
- All other vehicles use FRACTION convention: `0.2 = 20%`, `0.1 = 10%`
- Do not overwrite existing non-zero DB values without explicit approval
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/DB_CHANGES_CHECKPOINT_2026-02-11.md` (section 14)
- Engine should validate: YES -- detect vehicle-specific perf1 convention; flag if VC106 has fractional values or other vehicles have whole-number values

**31. Cost per share priority rule**
- Use `Cost per Share` column when present
- If missing, use `Final Cost per Share`
- Otherwise NULL
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/VERSO/datafixing/vc106_rules_and_actions.md` (Cost per share)
- Engine should validate: OPTIONAL -- primarily a migration rule, but can verify non-NULL cost_per_share exists where dashboard had values

**32. Spread fee calculation**
- `spread_fee_amount = spread_per_share * num_shares`
- `spread_per_share = price_per_share - cost_per_share`
- Source: implicit across multiple reconciliation files and the DB_CHANGES_CHECKPOINT (VC209 section 1 demonstrates the relationship)
- Engine should validate: YES -- verify spread_fee_amount = spread_per_share * num_shares (within tolerance)

---

## E. Vehicle-Specific Exceptions

**33. Vehicle sheet to code mapping**
- VC sheets: `VCxx` in dashboard -> `VC1xx` in DB (prepend "1"). Example: `VC6` -> `VC106`
- IN sheets: `INxx` in dashboard -> `IN1xx` in DB (prepend "1"). Example: `IN3` -> `IN103`
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/dashboardreconciliations/LIVE_RECONCILIATION_RULES.md` (Vehicle -> Sheet Mapping)
- Engine should validate: YES -- ensure correct sheet-to-vehicle mapping

**34. VC122 column parsing correction**
- In sheet VC22: OWNERSHIP POSITION is column 17, Number of shares invested is column 16
- Prior reconciliation used wrong columns, causing invalid mismatches
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/VERSO/datafixing/AGENT_PROMPT_RECONCILIATION.md` (Known issue to fix)
- Engine should validate: YES -- use correct column indices for VC22/VC122

**35. IN110 ETH-denominated amounts**
- IN110 amounts are ETH strings (e.g., `ETH xx.xx`)
- Must parse `ETH` prefix to extract numeric values
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/VERSO/datafixing/reconciliation_fixes_2026-01-25.md` (IN110 section)
- Engine should validate: YES -- handle ETH currency parsing for IN110

**36. VC203 commission slot override**
- Default dashboard column slots: Slot1 name=43, invested=45, spread=51; Slot2 name=53, invested=55, spread=61
- VC203 override: Slot1 name=44, invested=46, spread=52; Slot2 name=54, invested=56, spread=62
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/VC2_AUDIT_ENGINE_FIX_CHECKPOINT_2026-02-11.md` (section 1)
- Engine should validate: YES -- use correct column slots per vehicle

**37. VCL001 and VCL002 separation from VC203**
- 4 AGP subscriptions moved from VC203 to VCL001/VCL002 (separate deals)
- VCL vehicles are NOT part of VC2xx scope in current DB
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/verso_capital_2_data/VC2_CHECKPOINT.md` (section 1, VCL split)
- Engine should validate: YES -- verify VCL subscriptions are not double-counted in VC203

**38. VC1 rules: max_introducers_per_subscription = 3**
- Some subscriptions have up to 3 introducers (partners + introducers combined)
- Changed from 2 to 3 to accommodate dashboard reality
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/DB_CHANGES_CHECKPOINT_2026-02-13.md` (rules_vc1.json changes)
- Engine should validate: YES -- flag subscriptions with >3 introducers as anomalous

**39. VC1 rules: skip cost_per_share and ownership in vehicle totals**
- `cost_per_share` and `ownership` added to `vehicle_totals_skip_metrics`
- These metrics are not compared at the vehicle total level (row-level only)
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/DB_CHANGES_CHECKPOINT_2026-02-13.md` (rules_vc1.json changes)
- Engine should validate: YES -- respect skip-metrics configuration per scope

**40. VC126 ruled fallback: OEP Ltd -> Julien MACHOT**
- Commission rows for OEP Ltd in VC126 map to Julien MACHOT subscriptions
- This is a commission-only mapping (OEP invests via MACHOT)
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/DB_CHANGES_CHECKPOINT_2026-02-13.md` (section 1, ruled fallback pairs)
- Engine should validate: YES -- apply fallback mapping when matching commission rows to subscriptions

**41. VC113 alias: Zandera (Finco) Limited -> Zandera (Holdco) Limited**
- Vehicle-scoped investor alias for commission matching
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/DB_CHANGES_CHECKPOINT_2026-02-13.md` (section 1, rules_vc1.json)
- Engine should validate: YES -- apply vehicle-scoped investor aliases

---

## F. Position Rules

**42. Position uniqueness per investor+vehicle**
- Only one position row per `(investor_id, vehicle_id)`
- When merging duplicate investors: sum units from both into survivor
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/DB_CHANGES_CHECKPOINT_2026-02-11.md` (section 7, Pair 2 CABIAN merge: 2125 + 2512 = 4637)
- Engine should validate: YES -- verify unique constraint on positions(investor_id, vehicle_id)

**43. No zero-unit positions**
- Positions with units = 0 must not exist in DB
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/verso_capital_2_data/VC2_END_TO_END_AUDIT.md` (Zero-unit positions = 0), `/Users/ghilesmoussaoui/Desktop/Versotech/dashboardreconciliations/LIVE_RECONCILIATION_RULES.md` (Position Matching Rules)
- Engine should validate: YES -- flag any positions with units = 0

**44. Position units = aggregate dashboard ownership per investor**
- Positions represent total ownership across all matched subscription rows
- Compare `positions.units` to sum of dashboard ownership for that investor+vehicle
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/dashboardreconciliations/LIVE_RECONCILIATION_RULES.md` (Position Matching Rules)
- Engine should validate: YES -- verify position units parity with dashboard ownership totals

---

## G. Data Formatting Conventions

**45. Currency from dashboard, no assumptions**
- Currency set from dashboard row value
- Some VC125 rows use EUR (column I), not USD
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/verso_capital_2_data/VC2_MIGRATION_PLAN.md` (Currency rule), `/Users/ghilesmoussaoui/Desktop/Versotech/VERSO/datafixing/05_commission_client_override.md` (EUR rows)
- Engine should validate: YES -- verify currency field is populated and matches dashboard

**46. rate_bps is integer**
- Dashboard shows fractional rates (e.g., 113.75 bps)
- DB stores integer: 1375 bps (aligning with 13.75% and the dollar amount)
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/VERSO/datafixing/05_commission_client_override.md` (Row 531 rate mismatch note)
- Engine should validate: YES -- verify rate_bps is always integer; verify rate_bps / 10000 approximates percent

**47. Dashboard combined-introducer cells**
- Cells containing `+` (e.g., `Anand+Dan`) or multi-line names (`\n`) indicate combined introducers
- These are treated as warning-only for strict row-level commission parity
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/VC2_AUDIT_ENGINE_FIX_CHECKPOINT_2026-02-11.md` (section 3)
- Engine should validate: YES -- detect and classify combined-name cells as warnings

---

## H. Reconciliation Process Rules

**48. Subscription matching order**
- Per vehicle: (1) numeric gate (amount + shares), (2) tie-breakers (price/cost + contract_date), (3) name keys for disambiguation
- Duplicates preserved 1:1 (repeated dashboard rows -> repeated DB subscriptions)
- IN110 special: match uses shares + date + name (amount is blank)
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/dashboardreconciliations/LIVE_RECONCILIATION_RULES.md` (Subscription Matching Rules)
- Engine should validate: YES -- matching algorithm must follow this priority order

**49. Red rows in client file = excluded**
- Red-highlighted rows in contacts/client files are excluded by client instruction
- Example: VC2 contacts file rows 10 and 13 excluded
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/verso_capital_2_data/VC2_CHECKPOINT.md` (Red rows), `/Users/ghilesmoussaoui/Desktop/Versotech/verso_capital_2_data/VC2_MIGRATION_PLAN.md`
- Engine should validate: YES -- ensure excluded rows are not loaded

**50. Strikethrough rows in commission file = deleted from DB**
- Rows with strikethrough formatting in `05_Introducer_Commissions_FD comments.xlsx` should be deleted
- Red-highlighted rows = corrected values that replace DB values
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/VERSO/datafixing/05_commission_comments_analysis.md`, `/Users/ghilesmoussaoui/Desktop/Versotech/VERSO/datafixing/05_commission_apply_summary.md`
- Engine should validate: YES -- verify strikethrough-marked rows have been removed from DB

**51. Client override commissions take precedence over dashboard**
- Where client comments (red edits) conflict with dashboard, client overrides are applied
- Examples: VC122 LF GROUP, VC125 MA GROUP/Eric SARASIN/LF GROUP, VC126 BSV/CLOUDSAFE, VC133 778 WALNUT
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/VERSO/datafixing/05_commission_client_override.md`
- Engine should validate: YES -- these specific commission rows should match client-override values, not dashboard values

---

## I. Introduction Rules

**52. One introduction per unique (introducer_id, investor_id, deal_id)**
- `introduced_at = contract_date` when available
- `status = allocated`
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/VERSO/datafixing/vc106_rules_and_actions.md` (Introductions)
- Engine should validate: YES -- verify uniqueness and that every commission has a valid introduction_id

**53. Every commission must point to an existing introduction**
- No orphaned commission rows (introduction_id must exist in introductions table)
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/verso_capital_2_data/audit_engine/VC2_RULES_COVERAGE_2026-02-11.md` (Commission integrity)
- Engine should validate: YES -- referential integrity check on introducer_commissions.introduction_id

---

## J. Multi-Introducer / Split Rules

**54. VC206 REDPOINT OMEGA V unequal split**
- Dashboard formula: `=1.10863054575835%+1.21678962339331%`
- Visual Sectors: 111 bps, $82,000.00
- Astral Global: 122 bps, $90,000.00
- Total: $172,000.00
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/verso_capital_2_data/VC2_CHECKPOINT_2026-02-10_BROKER_INTRODUCER.md` (section 3)
- Engine should validate: YES -- verify exact amounts per introducer

**55. VC209 PVPL split after Lafferty removal**
- Lafferty's 1% ($100,000) removed, NOT transferred
- Visual Sectors corrected to 10 bps, $10,000.00 on $10,000,000.00 base
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/verso_capital_2_data/VC2_CHECKPOINT_2026-02-10_BROKER_INTRODUCER.md` (section 3)
- Engine should validate: YES -- verify Visual Sectors rate and amount on PVPL

**56. VC215 Bromley paired-introducer rate adjustment**
- When Bromley removed from paired relationship: remaining introducer keeps original rate minus 100 bps (floor at 0)
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/verso_capital_2_data/VC2_CHECKPOINT.md` (section 3, VC215 Bromley rule)
- Engine should validate: YES -- verify rate adjustments on VC215 post-Bromley-removal

**57. Multi-introducer spread zero issue (VC2)**
- 21 multi-introducer subscription rows have spread_fee_amount > 0 but introducer spread commissions = 0
- Concentrated in VC209 (15), VC215 (3), VC203 (2), VC206 (1)
- This reflects missing/zero spread commission records in DB
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/verso_capital_2_data/VC2_MULTI_INTRO_FEE_CONCERN_REPORT.md`
- Engine should validate: YES -- flag multi-introducer rows where subscription has spread but commissions show zero spread

---

## K. Data Integrity Rules

**58. No SELECT * in queries**
- Always use explicit column lists
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/CLAUDE.md` (Critical Don'ts)
- Engine should validate: N/A (code convention, not data rule)

**59. Commission basis is always funded_amount**
- Fee tiers only affect investor fees, not partner commissions
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/CLAUDE.md` (Gotchas, item 3)
- Engine should validate: YES -- verify commission base_amount aligns with funded_amount where base is populated

**60. Reuse existing investor/introducer records**
- Do not create duplicates when matched entity already exists
- Resolve known aliases first, then upsert only when canonical identity does not exist
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/verso_capital_2_data/VC2_MIGRATION_PLAN.md` (Legacy Rename Guardrails, Data Rules)
- Engine should validate: YES -- detect potential duplicate investor/introducer records by normalized name

**61. VC111 BAUMSLAG/FINALMA fee swap correction**
- Fee fields were transposed between these two subscriptions during import
- BAUMSLAG: sub_fee_% = 0, sub_fee_amount = NULL, perf1 = 0.1, contract_date = 2021-09-16
- FINALMA: sub_fee_% = 0.04, sub_fee_amount = 2000, perf1 = 0.2
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/DB_CHANGES_CHECKPOINT_2026-02-11.md` (section 23)
- Engine should validate: YES -- verify these specific subscription values match corrected state

**62. VC113 MACHOT/OEP perf1 swap correction**
- Two Julien MACHOT subscriptions in VC113: direct (perf1=0) and via OEP (perf1=0.1)
- Source: `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/DB_CHANGES_CHECKPOINT_2026-02-11.md` (section 24)
- Engine should validate: YES -- verify these specific perf1 values

---

## Summary Statistics

- Total rules documented: 62
- Rules the engine should validate: 57
- Rules that are code conventions (N/A for engine): 1
- Rules that are optional for engine: 1
- Rules across categories:
  - Name Mapping / Normalization: 6
  - Commission Calculation: 9
  - Broker / Introducer Treatment: 7
  - Subscription Rules: 10
  - Vehicle-Specific Exceptions: 9
  - Position Rules: 3
  - Data Formatting: 3
  - Reconciliation Process: 4
  - Introduction Rules: 2
  - Multi-Introducer / Split: 4
  - Data Integrity: 5
