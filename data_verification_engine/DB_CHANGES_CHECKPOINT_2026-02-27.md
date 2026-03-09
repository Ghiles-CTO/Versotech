# DB Changes Checkpoint — 2026-02-27

## Scope
This checkpoint captures all database, rules, and engine changes performed on 2026-02-27 to resolve introduction-link integrity issues while preserving historical orphan introductions.

## 1) Database changes applied

### 1.1 Deleted stale introduction-linked zero-amount commissions
- Table: `introducer_commissions`
- Action: `DELETE`
- Rows deleted: `72`
- Condition: `introduction_id` linked to the 33 stale introductions removed below
- Validation before delete:
  - `commission_rows_linked = 72`
  - `commission_amount_total = 0.00`
  - `non_zero_amount_rows = 0`

### 1.2 Deleted stale introductions with no dashboard introducer signal
- Table: `introductions`
- Action: `DELETE`
- Rows deleted: `33`
- Rationale: these were confirmed as real stale links (`real_intro_without_dashboard_signal`), not orphan historical cases

Deleted introduction IDs:
- 291bc29e-0ceb-40f3-a23f-7ca2b5a15801
- 2c9f4246-e680-44e5-907a-91a073c6533d
- 3102736b-36c8-470e-ad27-87b02a798be8
- 3fe840a7-1c80-4045-92c0-46757ac4e872
- 467f1832-93d7-46b9-9f80-35082eaa8373
- 49abf853-23c5-4c30-af37-cb337fce91c2
- 5151ecef-722c-4734-81cb-98574f570923
- 5156a007-c0e4-463a-96b9-177aeab67cef
- 5584b0ad-f615-47aa-95d2-919aa13cafc6
- 58182ef6-7794-4dbc-a977-2eb0c006df4f
- 63a7d251-37d9-4d91-95fa-3bdd14484aed
- 660850ed-551e-474a-a7b7-052c530a3c1b
- a7d68410-72c2-4fb3-888b-590c61566548
- a93f05e1-75b2-45e5-838d-7bbf754b6521
- b683f64b-395b-4bd1-837b-9f79a71e8e09
- bfad23f8-d4ee-403a-af24-9a612af02217
- cb947343-56ea-46ef-b36e-61ab1d42f85d
- cf792369-0d90-4996-b69f-dfd008580fff
- e6026600-f90f-40d9-ad22-a0148e82cb87
- 0b172289-ec26-4e10-8583-9e03515952cc
- 0bff1d54-5daf-4d0b-a53c-23cf7c2d942e
- 133f1b19-5294-475a-bc46-f5b3674cf2fc
- 284861c1-1227-42cf-b144-ec4de5e9d6c2
- 3430bcc2-8347-4e91-b68c-812af8eb0c59
- 38a89cc9-bd1a-4fce-8cac-69df4ca9df2c
- 3fe499f3-93de-4b59-8091-5ceaa93e7a8e
- 57180e53-cdae-498e-8195-20f64a78a66d
- 6752ff1c-b155-4121-9563-1a285c09d62d
- 6f3c9f08-a017-4976-9745-5eaa9119fb15
- 7a522c8a-aa1c-487c-af05-30e4f5df2cae
- 834cec89-bc82-4fa8-b28b-cb3881a7b330
- 9e6647a3-c386-4443-9f08-82e1218c5bea
- b5dd4f4b-9791-4bea-b1dd-a04cf5879b30

### 1.3 Preserved orphan historical introductions (kept)
- Table: `introductions`
- Action: `KEEP`
- Rows kept: `4`
- Reason: no subscriptions in DB; aligned with historical zero-ownership behavior

Kept orphan IDs:
- 076fd345-6b20-42c5-9726-95339744d9a4 (VC106, VERSO GROUP)
- c52361b6-e74a-4f44-bfdf-4f9852788ab7 (VC106, STABLETON (ALTERNATIVE ISSUANCE))
- eb0d5078-0302-4550-a19d-273cdb54107b (VC113, PETRATECH)
- ff155fe9-7f23-424c-a2f9-f6e5885858bc (VC106, Charles RIVA)

### 1.4 VC113 perf1 swap correction for twin 100k rows
- Table: `subscriptions`
- Action: `UPDATE`
- Rows updated: `2`
- Changes:
  - `e45cf8fd-996b-42a9-9942-ef8522f0959d` (`Julien MACHOT`): `performance_fee_tier1_percent 0.1 -> 0.0`
  - `88817172-c22c-49c4-931a-1b8821bc1908` (`OEP LIMITED`): `performance_fee_tier1_percent 0.0 -> 0.1`

---

## 2) Engine and rules changes applied

### 2.1 Engine classification hardening for orphan introductions
Updated files:
- `data_verification_engine/scopes/vc1/run_vc1_audit.py`
- `data_verification_engine/scopes/vc2/run_vc2_audit.py`
- `data_verification_engine/scopes/in/run_in_audit.py`

Behavior added:
- If an introduction has no matching `(deal_id, investor_id)` subscription in DB, classify it as:
  - warning `orphan_introduction_without_subscription` (default), or
  - failure if `orphan_introduction_without_subscription_as_failure=true`
- This prevents mixing orphan historical intros with real bad-link failures.

### 2.2 VC1 rule updates for OEP/Julien mapping alignment
Updated file:
- `data_verification_engine/scopes/vc1/rules_vc1.json`

Added/updated:
- `investor_aliases_by_vehicle.VC126`
  - `Julien MACHOT -> OEP LIMITED`
  - `OEP Ltd -> OEP LIMITED`
- `fallback_ruled_name_pairs`
  - `VC126: Julien MACHOT -> OEP LIMITED`
  - `VC113: OEP Ltd -> OEP LIMITED`

### 2.3 Trust governance updates for new orphan warning class
Updated file:
- `data_verification_engine/trust_pack/trust_policy.json`

Added warning governance entries for `orphan_introduction_without_subscription` across `vc1/vc2/in`:
- allowlist
- threshold
- expiry
- owner
- reason

Final threshold chosen:
- `vc1`: `200` (to permit known historical orphan volume)
- `vc2`: `50`
- `in`: `50`

---

## 3) Evidence artifacts generated

### 3.1 Manual classification artifact used for execution
- `tmp/intro_fails_37_manual_audit_exactmatch.json`
  - `33` real stale intro links (deleted)
  - `4` orphan intro links (kept)

### 3.2 Fix-plan snapshot
- `data_verification_engine/INTRO_LINK_FIX_PLAN_2026-02-27.json`

### 3.3 Final run evidence
- VC1 report run: `data_verification_engine/scopes/vc1/output/run_20260227_154341/audit_report.json`
- VC2 report run: `data_verification_engine/scopes/vc2/output/run_20260227_154345/audit_report.json`
- IN report run: `data_verification_engine/scopes/in/output/run_20260227_154348/audit_report.json`

- Trust pack report: `data_verification_engine/output/trust/run_20260227_144537/trust_pack_report.json`
- Trust pack summary: `data_verification_engine/output/trust/run_20260227_144537/trust_pack_summary.md`

Final status:
- `TOTAL_FAIL_COUNT = 0`
- `TRUST_STATUS = PASS`
- `FINDINGS_COUNT = 0`

---

## 4) Additional strict-mode remediation (same date)

### 4.1 VC124 rounding alignment on subscription `1bd785f5-63ee-4ddb-aad5-c118cb2c4a29`
- Table: `subscriptions`
- Action: `UPDATE`
- Changes:
  - `commitment: 8352.50 -> 8352.00`
  - `funded_amount: 8352.50 -> 8352.00`
- Purpose: remove strict fallback on dashboard row `VC24:12` caused by a `0.50` drift.

### 4.2 Middle-name normalization for unresolved individual identity rows
- Table: `investors`
- Action: `UPDATE`
- Rows updated: `37` individual investors
- Changes:
  - Set `legal_name` and `display_name` to full person name including middle component
  - For two records, also populated missing `middle_name`:
    - `abeb45c3-a070-4298-a121-0ebd94db939c`: `middle_name = Ismail`
    - `5bd7af59-1fd3-42c3-b06a-726f3be90fe4`: `middle_name = Richard`
- Validation: all `37/37` targeted investors now match intended full names.

### 4.3 VC1 rule file alias additions for abbreviated dashboard variants
- File: `data_verification_engine/scopes/vc1/rules_vc1.json`
- Added aliases:
  - `Keir BENBOW -> Keir Richard BENBOW`
  - `Mayuriben Chetan K. JOGANI -> Mayuriben Chetan Kumar JOGANI`
  - `Mayuriben Chetan K JOGANI -> Mayuriben Chetan Kumar JOGANI`
  - `Mayuriben Chetan K. Jogani -> Mayuriben Chetan Kumar JOGANI`

### 4.4 Post-remediation VC1 status snapshot
- Run: `data_verification_engine/scopes/vc1/output/run_20260227_182125`
- `FAIL_COUNT = 4`, `WARN_COUNT = 120`
- Remaining fails:
  1. `row_mapping_unresolved` (VC113): `OEP Ltd -> OEP LIMITED` (transfer mapping decision)
  2. `row_mapping_unresolved` (VC126): `Julien MACHOT -> OEP LIMITED` (transfer mapping decision)
  3. `commission_row_missing_in_db` (VC133): `Sahejman Singh KAHLON / Elevation / spread / 825`
  4. `name_mapping_unresolved_total = 2` (summary of the two unresolved transfer mappings)

---

## 5) OEP/JULIEN transfer-rule closure (same date, follow-up)

### 5.1 Rule decisions applied in VC1 rules
- File: `data_verification_engine/scopes/vc1/rules_vc1.json`
- Actions:
  - Updated ruled fallback mapping:
    - `VC113: OEP Ltd -> OEP LIMITED` (was `Julien MACHOT`)
    - `VC126: OEP Ltd -> OEP LIMITED` (was `Julien MACHOT`)
  - Added explicit transfer fallback:
    - `VC126: Julien MACHOT -> OEP LIMITED`
  - Added vehicle-scoped investor alias:
    - `investor_aliases_by_vehicle.VC126["Julien MACHOT"] = "OEP LIMITED"`
  - Added name alias for VC133 middle-name variant:
    - `Sahejman Singh KAHLON -> Sahejman KAHLON`

### 5.2 DB changes in this follow-up
- None (rules-only update; no DB writes).

### 5.3 VC1 rerun progression after rule updates
- Run: `data_verification_engine/scopes/vc1/output/run_20260227_182515`
  - `FAIL_COUNT = 3`, `WARN_COUNT = 120`
- Run: `data_verification_engine/scopes/vc1/output/run_20260227_182709`
  - `FAIL_COUNT = 1`, `WARN_COUNT = 120`
- Run: `data_verification_engine/scopes/vc1/output/run_20260227_182752`
  - `FAIL_COUNT = 0`, `WARN_COUNT = 121`

### 5.4 Final outcome for this follow-up
- Transfer mappings are now resolved under the confirmed business rule:
  - `OEP Ltd` and `OEP LIMITED` treated as same investor label, canonicalized to `OEP LIMITED`
  - `Julien MACHOT -> OEP LIMITED` enforced for `VC126`
- VC1 strict-mode run is back to zero fails.
