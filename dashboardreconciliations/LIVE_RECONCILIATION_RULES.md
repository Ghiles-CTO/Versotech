# Live Reconciliation Rules (DB vs Dashboards)

## Scope & Sources
- DB: live Supabase (subscriptions + positions + investors + vehicles).
- Dashboards: `datamigration/VERSO DASHBOARD_V1.0.xlsx` and `VERSO/datafixing/INNOVATECH DASHBOARD_V1.xlsx`.
- Goal: 1:1 subscription matching per dashboard row (ownership > 0), then positions match dashboard ownership totals.

## Vehicle → Sheet Mapping
- VC: `VC1xx` → `VCxx` (drop the leading “1”).
- IN: `IN1xx` → `INxx` (drop the leading “1”).

## Extraction Rules
- Header row detected by `Investor Last Name` / `Last Name`.
- **Skip summary rows**: if no investor last/first/entity.
- Ownership handling:
  - If ownership column exists: active if ownership > 0, zero if 0, unknown if blank.
  - If ownership column missing (IN101, IN102, IN109, IN111): treat all investor rows as active.
- Dates: missing dates are allowed (do not block matches).

## Investor Name Normalization
Applied to **both** dashboard and DB before matching:
- Strip titles: `mr/mrs/ms/dr/sir/madam/mme/prof`.
- Replace `&` with `and`.
- Normalize `limited → ltd`.
- Remove punctuation and whitespace.
- Normalize line breaks into spaces.
- Token replacements: `dan → daniel`, `mickael → michael`.
- Two‑name swap for “A and B” ↔ “B and A”.
- Aliases (explicit):
  - `anandrathi → setcap`
  - `garsonlevy → garsonbrandonlevy`
  - `odileandgeorgesmradandfenergi → odileandgeorgesaboumradandfenergi`
  - `liudmilaandalexeyromanovaromanov → liudmilaandalexeyromanov`

## Subscription Matching Rules
Matching runs **per vehicle**:
1) Numeric gate: amount + shares must match when present.
2) Tie‑breakers: price/cost + contract date.
3) Name keys used to disambiguate when multiple candidates exist.
4) Duplicates are preserved 1:1 (repeated dashboard rows must map to repeated subscriptions).
5) For IN110 where amount is blank, match uses shares + date + name.

## Position Matching Rules
- Only for sheets with ownership column.
- Aggregate dashboard ownership per investor (across matched rows).
- Compare to `positions.units`.
- Ignore rows with missing ownership.
- If dashboard ownership = 0 and DB units ≠ 0 → mismatch.

## Final State (after applying fixes)
- DB‑only subscriptions: **0**
- Dashboard‑only subscriptions: **0**
- Value mismatches: **0**
- Position mismatches: **0**

### Positions Fixes Applied
- Updated VC111 Daniel BAUMSLAG units to **200000**.
- Inserted missing VC133 positions (VERSO HOLDINGS, Tobias JOERN, René ROSSDEUTSCHER, Ellen STAUDENMAYER).
- Removed duplicate VC111 position for OEP Ltd (dashboard ownership 0).

### Field Fixes Applied (DB updated to dashboard values)
- opportunity_name (filled 277 missing values).
- sourcing_contract_ref (filled 225 missing values, cleared 3 stale values).
- subscription_fee_amount (corrected 246 values where percent was stored instead of amount).
- performance_fee_tier1_percent, interest_rate, finra_fee_shares, spread_per_share, spread_fee_amount, cost_per_share, finra_fee_amount, bd_fee_percent/amount, valuation_cap, discount_rate, management_fee_percent, performance_fee_tier2_percent/threshold, price_per_share, contract_date.
