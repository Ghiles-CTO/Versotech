# Merge Investor Duplicate: Julien MACHOT

- Canonical investor_id: `f3dabc56-d079-4536-9ad5-9e6b543aea21` (status=active)
- Duplicate investor_id: `5ee17648-dd9d-4351-a450-f57119440739` (status=inactive)

## Pre-merge totals (canonical+dupe combined)
- subs_count: `65`
- subs_commitment: `19811191.59`
- subs_units: `7487.0`
- pos_count: `30`
- pos_units: `4139408.0`
- comms_count: `39`
- comms_accrual: `75520.0`

## Step 1: Merge overlapping positions (unique investor_id+vehicle_id)
- vehicle_id `0f964c92-7941-4b78-9cad-e6831e9fbdca`: kept `45a968fa-5541-44a7-83c1-4d632f57c402` updated units=379271.0 cost_basis=60852.5; deleted `ee3e7596-142c-488c-9a57-d00ebf5d7ce4`
- vehicle_id `2df9e790-9e6e-4764-8fe2-b0c846f7ca21`: kept `5cf3fe00-3ded-499e-b77c-19a3122c0d1a` updated units=321428.0 cost_basis=275000.0; deleted `909dc9e5-082b-4a1c-9a74-1f30cdf56a11`
- vehicle_id `606a4626-6397-40e4-9178-8ba187524589`: kept `7ab63681-e55d-4b8a-aa40-382c5ebf9790` updated units=2666.0 cost_basis=412112.18; deleted `84b7c9d6-c2f8-4ab6-979f-eaf79bfafc33`
- vehicle_id `8d4db38a-0119-4eef-bb1a-d9f266aef1e7`: kept `e9dfe742-bb01-4f95-8e65-25536cfd3c77` updated units=298567.0 cost_basis=8559000.0; deleted `d30b280b-1b1f-4f18-bc1d-95b5938aea4e`
- vehicle_id `a76af65f-d0cb-45e7-927d-5f61791d86db`: kept `3a4970cb-06a6-438b-9568-053062d4f784` updated units=1322038.0 cost_basis=1340087.15; deleted `e5fad873-4e09-4855-b19a-61ad85505f1b`
- vehicle_id `ba584abd-ea2b-4a3f-893a-c7e0999f4039`: kept `f1d83176-0a3a-4191-acec-05a5e64372cb` updated units=107510.0 cost_basis=None; deleted `00cc9c73-bd0d-4b22-92b5-702a16631b94`

## Step 2: Move remaining dupe-only positions to canonical
- positions moved: `5` (before=5, after=0)

## Step 3: Delete duplicate entity_investors rows for dupe investor
- entity_investors deleted: `13` (before=13, after=0)

## Step 4: Re-point FKs (subscriptions, introductions, commissions)
- subscriptions.investor_id: moved `16` (before=16, after=0)
- introductions.prospect_investor_id: moved `8` (before=8, after=0)
- introducer_commissions.investor_id: moved `18` (before=18, after=0)

## Step 5: Verify no remaining references to dupe investor
- OK: subscriptions/positions/introductions/commissions/entity_investors now have 0 rows referencing dupe.

## Step 6: Archive duplicate investor row
- investors `5ee17648-dd9d-4351-a450-f57119440739` status=archived archived_at=2026-02-08T23:48:20.094654+00:00

## Post-merge totals (canonical only)
- subs_count: `65`
- subs_commitment: `19811191.59`
- subs_units: `7487.0`
- pos_count: `24`
- pos_units: `4139408.0`
- comms_count: `39`
- comms_accrual: `75520.0`

## Totals delta (post - pre)
- subs_count: delta=0
- subs_commitment: delta=0.0
- subs_units: delta=0.0
- pos_count: delta=-6
- pos_units: delta=0.0
- comms_count: delta=0
- comms_accrual: delta=0.0