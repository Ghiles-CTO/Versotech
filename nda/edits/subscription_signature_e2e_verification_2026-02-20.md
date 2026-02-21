# Subscription Pack + Signature E2E Verification
Date: 2026-02-20
Environment: local app (`http://localhost:3000`) + dev Supabase
Deal under test: `SPACE X Secondary Investment` (`450b5460-0158-4d12-8fec-d9a16c483afa`)

## Scope Covered
1. Ready for Signature workflow initiation (issue #18)
2. CEO approval -> subscription pack generation data integrity (price per share / shares)
3. Individual investor signing flow
4. Entity investor flow with 2 investor signatories
5. Signature anchor placement validation against generated signed PDFs

## Test Data
- Individual investor: `Pierre Julien` (`cd3058e9-93f4-4e83-9543-175cb7614533`)
- Entity investor: `Ghiless Business Ventures LLC` (`8753bf9d-babf-4174-9bc5-75d65c3b0a39`)
- Entity subscription created in test: `a6271b90-2082-4b94-bdb0-9f6ce927f4f0`
- Individual subscription tested: `fc3112e9-4171-4a40-849a-096b94f7254e`

## Results

### 1) Ready for Signature Workflow Failure (`Failed to initiate signature workflow`)
Status: ✅ PASS

Validated from UI on both subscriptions:
- Entity: `a6271b90-2082-4b94-bdb0-9f6ce927f4f0`
- Individual: `fc3112e9-4171-4a40-849a-096b94f7254e`

Observed behavior:
- Dialog opened (`Send for Signature`)
- Request completed (no internal server error toast)
- Signature requests created in DB immediately

### 2) CEO Approval -> Subscription Pack data integrity (price/share injection issue)
Status: ✅ PASS

For entity SpaceX approval (`f27e6b9f-eaf7-49a1-b4cb-7a9fa30f1f0d`):
- Generated subscription: `a6271b90-2082-4b94-bdb0-9f6ce927f4f0`
- DB values: `commitment=3000000`, `price_per_share=198.12345`, `num_shares=15142`
- Extracted pack text confirms:
  - `USD 3000000.00`
  - `Price per Share: USD 198.12*`
  - `15142 Certificates`

For individual:
- DB/text consistent with `commitment=50000`, `price_per_share=198.12345`, `num_shares=252`

### 3) Individual signing flow
Status: ✅ PASS (investor + issuer)

Subscription: `fc3112e9-4171-4a40-849a-096b94f7254e`
- `party_b` signed: `b5d538c8-0186-48c2-b1b4-ce8d186137ce`
- `party_a` signed: `a90e371a-1ab7-4aeb-a103-1ca86271be26`
- `party_c` remains pending (missing test creds for `fdemargne@versoholdings.com`)

### 4) Entity with 2 investor signatories
Status: ✅ PASS (2/2 investor signatures)

Subscription: `a6271b90-2082-4b94-bdb0-9f6ce927f4f0`
- `party_a` signed: `599bad45-9419-4040-9d71-30754bfcdbaa`
- `party_a_2` signed: `99e2e34a-a4b4-4fef-9e17-f4a8ee2ff4d4`
- `party_b` signed: `1dc8a58e-d10b-4b92-966e-8fec7ec97768`
- `party_c` pending (same missing arranger creds)

### 5) Anchor placement / pixel validation
Status: ✅ PASS

Method:
- Downloaded unsigned and signed PDFs for both flows.
- Rendered pages at 144 DPI.
- Computed per-anchor image diffs in windows centered at expected coordinates from `signature_requests.signature_placements`.
- Confirmed strong local diffs at each expected anchor with low center offset.

Artifacts:
- Diff report JSON: `tmp/signature_anchor_diff_report.json`
- PDFs:
  - `tmp/entity_spacex_unsigned.pdf`
  - `tmp/entity_spacex_signed.pdf`
  - `tmp/individual_spacex_unsigned.pdf`
  - `tmp/individual_spacex_signed.pdf`

Representative offsets (pixels at 144 DPI):
- Most anchors: `(dx=0.0, dy≈-7.5)`
- Two subscription-form anchors: `(dx=0.0, dy≈-22.5)`
- Wire-instructions anchors: `(dx=0.0, dy≈-15.5)`

No horizontal drift detected; vertical offsets are small and consistent.

## Issues Found During Testing
1. ⚠️ Arranger test credential gap
- Could not complete `party_c` signatures because no valid password for `fdemargne@versoholdings.com` in provided creds.

2. ⚠️ Broken path observed
- `/versotech_main/versosign/sign/{token}` returned 404 in direct navigation tests.
- `/sign/{token}` works.
- Codebase still contains references to `/versotech_main/versosign/sign/...` in some pages.

3. ⚠️ Approvals action-button accessibility
- Row action buttons in approvals table are unlabeled icon-only controls.
- In browser automation, refs were unstable and initially triggered the wrong row action.

## Conclusion
Primary blockers requested are fixed in current dev run:
- Ready-for-signature initiation works.
- CEO approval path now carries correct price/share values into generated subscription pack.
- Entity two-investor-signatory flow works and both investor signatures can be completed.
- Anchor placements are landing in the expected locations with consistent, low-offset pixel diffs.
