# Complete Testing Plan - Meeting Issues (Jan 30, 2026)

> **Purpose:** Test every single issue discussed in the Friday meeting transcript.
> **How to use:** Follow each test case step-by-step. Document results in E2E_TEST_RESULTS.md after each test.

---

## MEETING ISSUES EXTRACTED (Line-by-Line Analysis)

| Issue # | Meeting Line | Issue Description | Status |
|---------|--------------|-------------------|--------|
| 1 | 79-81 | Users shouldn't be "approved before being approved" | TO TEST |
| 2 | 81-83 | Several issues on statuses including subscription | TO TEST |
| 3 | 100-103 | Preventing actions depending on status | TO TEST |
| 4 | 112-116 | User without KYC was able to confirm interest | TO TEST |
| 5 | 142 | Button says "Interest confirmed" - wrong message | TO TEST |
| 6 | 144-146 | UI confusing for interest buttons | TO TEST |
| 7 | 200-205 | "Interest confirmed" should say "Data Room Access Requested" | TO TEST |
| 8 | 211-219 | After clicking "Request Data Room" should redirect to NDA | TO TEST |
| 9 | 247-256 | Priority column in approvals - not needed | TO TEST |
| 10 | 254-258 | Approval shows "Deal Interest" not "Data Room Access Request" | TO TEST |
| 11 | 258-268 | Approval should show deal name and user under entity | TO TEST |
| 12 | 373-377 | NDA generated with EMPTY fields (address, city, country) | TO TEST |
| 13 | 386-396 | User should not access data room without KYC/info | TO TEST |
| 14 | 398-400 | Email bug in NDA document | TO TEST |
| 15 | 409-431 | NDA field mapping: Individual vs Entity differences | TO TEST |
| 16 | 446-449 | Entity should be approved before data room access | TO TEST |
| 17 | 456-481 | VERSOSign for users without account (email flow) | TO TEST |
| 18 | 520-525 | Stock type: remove forward slash, use "Common and Ordinary" | TO TEST |
| 19 | 539-544 | "Entity" label should be "Vehicle" in deal creation | TO TEST |
| 20 | 565-574 | Logo creates white box - should crop to oval | TO TEST |
| 21 | 579-586 | Currency: add CHF and AED | TO TEST |
| 22 | 587-603 | Need "Save as Draft" button in deal creation | TO TEST |
| 23 | 608-614 | "Mandate" label next to arranger - clarify meaning | TO TEST |
| 24 | 615-616 | Financial terms (per unit, min/max) should be deleted | TO TEST |
| 25 | 626-629 | Term sheet: Display text vs Numeric - display text should be deleted | TO TEST |
| 26 | 630-656 | Issuer and Vehicle fields should be pre-filled/dropdown | TO TEST |
| 27 | 656-688 | Issuer format: "{Vehicle} S.à r.l." / Vehicle: "Series XXX" | TO TEST |
| 28 | 707-720 | Free text sections should be pre-filled but editable | TO TEST |
| 29 | 726-741 | Term sheet: completion date display issue ("by") | TO TEST |
| 30 | 734 | Preview modal close button not visible | TO TEST |
| 31 | 742-753 | Term sheet cache issue - data disappears on refresh | TO TEST |
| 32 | 756-808 | TO vs Purchaser mapping issue - different fields | TO TEST |
| 33 | 832-840 | Interest progress bar should remain unchecked until confirmed | TO TEST |
| 34 | 840-850 | Two routes needed: NDA path OR Direct subscription (no NDA) | TO TEST |
| 35 | 867-881 | Account statuses: first should be "new" (invited) | TO TEST |

---

## ENVIRONMENT SETUP

```bash
# Start development server
cd versotech-portal && npm run dev

# Open browser to test
# URL: http://localhost:3000
```

### Test Credentials

| Email | Password | Personas | Use For |
|-------|----------|----------|---------|
| `cto@versoholdings.com` | `123123` | CEO, Arranger, Introducer, Investor | Admin tests, approvals, deal creation |
| `sales@aisynthesis.de` | `TempPass123!` | Arranger, CP, Introducer, Lawyer, Partner | Multi-persona tests |
| `biz@ghiless.com` | `22122003` | Investor | Investor flow tests |
| `py.moussaouighiles@gmail.com` | `TestIntro2024!` | Introducer, Investor | Introducer tests |
| `cto@verso-operation.com` | `VersoPartner2024!` | Investor, Partner | Partner tests |
| `cm.moussaouighiles@gmail.com` | `CommercialPartner2024!` | Commercial Partner | CP tests |

---

## SECTION 1: ACCOUNT APPROVAL STATUS GATING

### Issue #1-4, #13, #35: Account Status Blocking

**Relevant Code:**
- `/src/lib/account-approval-status.ts` - Status constants and labels
- `/src/app/api/deals/[id]/interests/route.ts` (Lines 149-179) - API blocking
- `/src/app/api/deals/[id]/subscriptions/route.ts` (Lines 213-241) - API blocking

**Status Values:**
```
new → incomplete → pending_approval → approved
                                   → rejected
                                   → unauthorized (blacklisted)
```

---

### TEST 1.1: User with status "new" cannot access platform

**Pre-condition:** Create or modify user to have `account_approval_status = 'new'`

| Step | Action | Page/URL | Expected Result |
|------|--------|----------|-----------------|
| 1 | Login as test user | `/versotech_main/login` | Login succeeds |
| 2 | Observe redirect | - | Redirected to `/versotech_main/profile` |
| 3 | Try to navigate to `/opportunities` | `/versotech_main/opportunities` | Blocked, redirected back to profile |

**Document:**
- [ ] PASS - Redirect works correctly
- [ ] FAIL - User can access other pages (document which pages)

---

### TEST 1.2: User with status "incomplete" can view deals but cannot act

**Pre-condition:** User has `account_approval_status = 'incomplete'`

| Step | Action | Page/URL | Expected Result |
|------|--------|----------|-----------------|
| 1 | Login as incomplete user | `/versotech_main/login` | Login succeeds |
| 2 | Navigate to opportunities | `/versotech_main/opportunities` | Page loads, deals visible |
| 3 | Click on a dispatched deal | `/versotech_main/opportunities/{id}` | Detail page loads |
| 4 | Look for "Request Data Room Access" button | Deal detail page | Button should be HIDDEN or DISABLED |
| 5 | Look for "Subscribe to Investment" button | Deal detail page | Button should be HIDDEN or DISABLED |
| 6 | Look for warning banner | Deal detail page | Should show: "Account approval required" |
| 7 | Check banner text | - | Should show: "Status: INCOMPLETE. [description]" |
| 8 | Check KYC status display | - | Should show: "KYC status: [current status]" |

**Document:**
- [ ] PASS - Buttons hidden/disabled, warning shown
- [ ] FAIL - Buttons visible and clickable (CRITICAL BUG)
- [ ] PARTIAL - Warning shown but buttons still visible

---

### TEST 1.3: User without KYC cannot confirm interest (Issue #4, #112-116)

**This was the exact issue Fred found in the meeting**

| Step | Action | Page/URL | Expected Result |
|------|--------|----------|-----------------|
| 1 | Login as user WITHOUT KYC submitted | `/versotech_main/login` | Login succeeds |
| 2 | Navigate to dispatched deal | `/versotech_main/opportunities/{id}` | Page loads |
| 3 | Check account_approval_status in profile | `/versotech_main/profile` | Should NOT be "approved" |
| 4 | Back to deal, try to click "Request Data Room Access" | Deal detail | Should be BLOCKED |
| 5 | If button is clickable, click it | - | API should return error |
| 6 | Check response message | - | Should say "Account approval required before requesting data room access" |

**API Verification (if needed):**
```bash
# Check the API directly
curl -X POST http://localhost:3000/api/deals/{dealId}/interests \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"investor_id": "{investorId}"}'
```

Expected API response for non-approved user:
```json
{
  "error": "Account approval required before requesting data room access"
}
```

**Document:**
- [ ] PASS - Button blocked OR API returns error
- [ ] FAIL - User was able to confirm interest without approval

---

### TEST 1.4: Approved user can access all features

| Step | Action | Page/URL | Expected Result |
|------|--------|----------|-----------------|
| 1 | Login as approved investor | `biz@ghiless.com` / `22122003` | Login succeeds |
| 2 | Navigate to opportunities | `/versotech_main/opportunities` | Deals visible |
| 3 | Click on dispatched deal | Deal detail | Page loads |
| 4 | Check for action buttons | - | Both buttons visible: "Subscribe to Investment" AND "Request Data Room Access" |
| 5 | No warning banner | - | No "Account approval required" message |

**Document:**
- [ ] PASS - Both buttons visible, no warnings
- [ ] FAIL - Buttons hidden or warnings shown for approved user

---

### TEST 1.5: Blacklisted/Unauthorized user sees deals as "closed"

| Step | Action | Page/URL | Expected Result |
|------|--------|----------|-----------------|
| 1 | Set user status to `unauthorized` in DB | - | Done |
| 2 | Login as that user | - | Login succeeds |
| 3 | Navigate to opportunities | `/versotech_main/opportunities` | Page loads |
| 4 | Check deal cards | - | Deals should appear as "closed" |
| 5 | Click on deal | Deal detail | No action buttons visible |

**Document:**
- [ ] PASS - Deals show as closed, no actions available
- [ ] FAIL - User can still see action buttons

---

## SECTION 2: INTEREST/DATA ROOM FLOW

### Issue #5, #7: Feedback Message Text (Lines 142, 200-205)

**The Problem:** When clicking "Request Data Room Access", the message says "Interest confirmed" instead of "Data Room Access Requested"

**Relevant Code:**
- `/src/app/(main)/versotech_main/opportunities/[id]/page.tsx` (Lines 713-755)
- `/src/components/deals/interest-status-card.tsx` (Lines 58-136)

---

### TEST 2.1: Request Data Room Access - Check feedback message

| Step | Action | Page/URL | Expected Result |
|------|--------|----------|-----------------|
| 1 | Login as approved investor | `biz@ghiless.com` / `22122003` | - |
| 2 | Find a deal you haven't expressed interest in | `/versotech_main/opportunities` | Find open deal |
| 3 | Click "View Details" | Deal detail page | - |
| 4 | Click "Request Data Room Access" button | - | Dialog opens |
| 5 | Check dialog title | - | Should say "Request Data Room Access" |
| 6 | Click "Request Access" in dialog | - | Request submitted |
| 7 | **CHECK THE FEEDBACK MESSAGE** | - | Should say "Data Room Access Requested" NOT "Interest confirmed" |
| 8 | Check interest status card | - | Should show stage "Access Requested" |

**Expected Status Card Text (Stage 3):**
```
Access Requested
Request received. NDA sent after team approval.
```

**Document:**
- [ ] PASS - Message says "Data Room Access Requested" or similar
- [ ] FAIL - Message says "Interest confirmed" (BUG FROM MEETING)
- Actual message shown: _____________________

---

### TEST 2.2: Two paths available (Issue #34, Lines 840-850)

| Step | Action | Page/URL | Expected Result |
|------|--------|----------|-----------------|
| 1 | Login as approved investor | - | - |
| 2 | Navigate to open deal (fresh, no prior interest) | Deal detail | - |
| 3 | Check for TWO action buttons | - | Should see BOTH: |
|   | | | 1. "Subscribe to Investment" (green) |
|   | | | 2. "Request Data Room Access" (dashed border) |
| 4 | Check button descriptions | - | Subscribe: "Subscription pack only (no NDA)" |
|   | | | Data Room: "Review documents first" |

**Document:**
- [ ] PASS - Both paths clearly visible with correct descriptions
- [ ] FAIL - Only one path visible
- [ ] FAIL - Descriptions incorrect or missing

---

### TEST 2.3: Direct Subscribe path - NO NDA required (Issue #34)

**Fred confirmed in meeting (Line 849): "just a subscription pack" - no NDA for direct subscribe**

| Step | Action | Page/URL | Expected Result |
|------|--------|----------|-----------------|
| 1 | Login as approved investor | - | - |
| 2 | Navigate to open deal | - | - |
| 3 | Click "Subscribe to Investment" | - | Subscription dialog opens |
| 4 | Enter subscription amount | - | e.g., 100000 |
| 5 | Submit subscription | - | Success |
| 6 | Check VERSOSign tasks | `/versotech_main/versosign` | Should have subscription pack, NOT NDA |
| 7 | Verify no NDA was generated | - | No NDA document in VERSOSign |

**Document:**
- [ ] PASS - Subscription submitted, no NDA generated
- [ ] FAIL - NDA was also generated for direct subscribe path

---

## SECTION 3: APPROVALS PAGE

### Issue #9, #10, #11: Approvals Queue Display

**Relevant Code:**
- `/src/components/approvals/approvals-page-client.tsx` (897 lines)
- `/src/components/approvals/approval-filters.tsx`

---

### TEST 3.1: Priority column should be HIDDEN (Issue #9, Lines 247-256)

| Step | Action | Page/URL | Expected Result |
|------|--------|----------|-----------------|
| 1 | Login as CEO | `cto@versoholdings.com` / `123123` | - |
| 2 | Navigate to Approvals | `/versotech_main/approvals` | Page loads |
| 3 | Look at table columns | - | Priority column should NOT be visible |
| 4 | Check column headers | - | Should see: Request Type, Deal/Investor, SLA Status, Assigned To, Actions |
|   | | | Should NOT see: Priority |

**Document:**
- [ ] PASS - Priority column is hidden
- [ ] FAIL - Priority column still visible

---

### TEST 3.2: Label says "Data Room Access Request" not "Deal Interest" (Issue #10)

| Step | Action | Page/URL | Expected Result |
|------|--------|----------|-----------------|
| 1 | Create an interest request as investor | - | Done |
| 2 | Login as CEO | - | - |
| 3 | Navigate to Approvals | `/versotech_main/approvals` | - |
| 4 | Find the interest approval | - | - |
| 5 | Check the TYPE label | - | Should say "DATA ROOM ACCESS REQUEST" |
|   | | | Should NOT say "Deal Interest" |

**Document:**
- [ ] PASS - Label correctly says "Data Room Access Request"
- [ ] FAIL - Label says "Deal Interest" (BUG FROM MEETING)
- Actual label: _____________________

---

### TEST 3.3: Approval shows Deal name and User name under Entity (Issue #11, Lines 258-268)

| Step | Action | Page/URL | Expected Result |
|------|--------|----------|-----------------|
| 1 | Login as CEO | - | - |
| 2 | Navigate to Approvals | `/versotech_main/approvals` | - |
| 3 | Find a Data Room Access approval | - | - |
| 4 | Check displayed information | - | Should show: |
|   | | | - Deal name (e.g., "Perplexity", "Anthropic") |
|   | | | - Entity name (if investor is entity) |
|   | | | - User name (the person who requested) |
| 5 | Click on approval for detail | - | Panel opens with full details |

**Expected Display Format:**
```
DATA ROOM ACCESS REQUEST
{Deal Name}
{User Name} - {Entity Name}
```

**Document:**
- [ ] PASS - All three pieces of information visible
- [ ] FAIL - Missing deal name
- [ ] FAIL - Missing user name
- [ ] FAIL - Only shows entity, not the specific user

---

## SECTION 4: NDA DOCUMENT GENERATION

### Issue #12, #14, #15: NDA Field Population

**The Critical Bug from Meeting (Lines 373-377):** NDA was generated with EMPTY fields

**Relevant Code:**
- `/src/app/api/approvals/[id]/action/route.ts` (Lines 466-849)
- NDA payload fields (Lines 720-750)

---

### TEST 4.1: NDA fields populated correctly for INDIVIDUAL investor

**Test Data:**
- Use individual investor with COMPLETE profile (address, city, country filled)

| Step | Action | Page/URL | Expected Result |
|------|--------|----------|-----------------|
| 1 | Ensure test investor has complete profile | DB check | Has: address, city, country, name |
| 2 | Login as investor, request data room access | - | Request submitted |
| 3 | Login as CEO, approve the request | `/versotech_main/approvals` | Approved |
| 4 | Wait for NDA generation (n8n) | - | NDA created |
| 5 | Login as CEO, go to VERSOSign | `/versotech_main/versosign` | Find NDA |
| 6 | Preview NDA document | - | Open PDF preview |
| 7 | **CHECK PARTY A FIELDS** | - | All must be filled: |

**Expected Party A Fields (Individual):**
| Field | Expected Value |
|-------|----------------|
| Name | Investor's name (from `display_name` or `legal_name`) |
| Address | Investor's `residential_street`, `residential_line_2`, `residential_postal_code` composed |
| City / Country | Investor's `residential_city` / `residential_country` |
| Represented By | Same as Name (individual represents themselves) |
| Email | Investor's email |

**Document:**
- [ ] PASS - All fields populated correctly
- [ ] FAIL - Name is empty
- [ ] FAIL - Address is empty (BUG FROM MEETING)
- [ ] FAIL - City/Country is empty (BUG FROM MEETING)
- [ ] FAIL - Email is empty or shows "[object Object]" (BUG FROM MEETING)
- Screenshot of NDA Party A section: _____________________

---

### TEST 4.2: NDA fields populated correctly for ENTITY investor

**Test Data:**
- Use entity investor with registered address filled
- Entity should have at least one signatory member

| Step | Action | Page/URL | Expected Result |
|------|--------|----------|-----------------|
| 1 | Ensure entity has: registered_address, city, country | DB check | Complete data |
| 2 | Ensure entity has signatory member with: full_name, email | DB check | Has signatory |
| 3 | Login as entity member, request data room access | - | Request submitted |
| 4 | Login as CEO, approve | - | Approved |
| 5 | Preview generated NDA | VERSOSign | Open PDF |
| 6 | **CHECK PARTY A FIELDS** | - | All must be filled: |

**Expected Party A Fields (Entity):**
| Field | Expected Value |
|-------|----------------|
| Name | Entity's `legal_name` (NOT the user's name) |
| Registered Address | Entity's `registered_address` |
| City / Country | Entity's `city` / `country` |
| Represented By | Signatory member's `full_name` |
| Email | Signatory member's `email` |

**Document:**
- [ ] PASS - All fields populated correctly
- [ ] FAIL - Name shows user instead of entity
- [ ] FAIL - Address empty (should be entity registered address)
- [ ] FAIL - Represented By is wrong person
- Screenshot: _____________________

---

### TEST 4.3: NDA generation BLOCKED if required data missing (Issue #13, Lines 386-396)

**Fred's point: "you should not be able to get access to data room until you provided the information"**

| Step | Action | Page/URL | Expected Result |
|------|--------|----------|-----------------|
| 1 | Create/find investor with MISSING required fields | DB | Missing address, city, or country |
| 2 | Ensure account_approval_status = 'approved' (for now) | - | - |
| 3 | Login as that investor | - | - |
| 4 | Try to request data room access | - | ??? |

**Two possible behaviors to test:**
1. **Option A:** Interest request blocked at UI level → Button disabled
2. **Option B:** Interest request accepted, but NDA generation fails with validation error

**If Option B, check validation error message:**
```
Missing NDA data: Party A registered address, Party A city/country
```

**Document:**
- [ ] PASS - Request blocked OR NDA validation fails with clear error
- [ ] FAIL - NDA generated with empty fields anyway

---

## SECTION 5: DEAL CREATION

### Issue #18-24: Deal Creation Form Issues

**Page:** `/versotech_main/deals/new`
**Component:** `/src/components/deals/create-deal-form.tsx`

---

### TEST 5.1: Stock type dropdown - No forward slash (Issue #18, Lines 520-525)

| Step | Action | Page/URL | Expected Result |
|------|--------|----------|-----------------|
| 1 | Login as CEO | - | - |
| 2 | Navigate to Create Deal | `/versotech_main/deals/new` | Form loads |
| 3 | Click Stock Type dropdown | - | Options appear |
| 4 | Check option labels | - | Should be: |

**Expected Stock Type Options:**
```
Common and Ordinary Shares   ← NOT "Common/Ordinary"
Preferred Shares
Convertible Notes
Warrants
Bonds
Notes
Other
```

**Document:**
- [ ] PASS - Labels use "and" not "/"
- [ ] FAIL - Still shows "Common/Ordinary" with slash

---

### TEST 5.2: Vehicle field labeled correctly (Issue #19, Lines 539-544)

**Fred's point: "Entity" label should be "Vehicle"**

| Step | Action | Page/URL | Expected Result |
|------|--------|----------|-----------------|
| 1 | Navigate to Create Deal | `/versotech_main/deals/new` | - |
| 2 | Find the vehicle selection field | Step 1 of form | - |
| 3 | Check field label | - | Should say "Vehicle (Optional)" |
|   | | | Should NOT say "Entity" |

**Document:**
- [ ] PASS - Label says "Vehicle"
- [ ] FAIL - Label says "Entity" (BUG FROM MEETING)
- Actual label: _____________________

---

### TEST 5.3: Currency dropdown includes CHF and AED (Issue #21, Lines 579-586)

| Step | Action | Page/URL | Expected Result |
|------|--------|----------|-----------------|
| 1 | Navigate to Create Deal | `/versotech_main/deals/new` | - |
| 2 | Proceed to Step 2 (Pipeline & Currency) | - | - |
| 3 | Click Currency dropdown | - | Options appear |
| 4 | Check available currencies | - | Should include: |

**Expected Currencies:**
```
USD
EUR
GBP
CHF  ← MUST be present (Fred requested)
AED  ← MUST be present (Fred requested - for Dubai)
```

**Document:**
- [ ] PASS - CHF and AED both available
- [ ] FAIL - CHF missing
- [ ] FAIL - AED missing

---

### TEST 5.4: Save as Draft button exists (Issue #22, Lines 587-603)

| Step | Action | Page/URL | Expected Result |
|------|--------|----------|-----------------|
| 1 | Navigate to Create Deal | `/versotech_main/deals/new` | - |
| 2 | Fill only Deal Name | Step 1 | e.g., "Test Draft Deal" |
| 3 | Look for Save Draft button | - | Should see "Save Draft" button |
| 4 | Click Save Draft | - | Deal saved with status "draft" |
| 5 | Check redirect | - | Should go to deals list |
| 6 | Find saved deal | `/versotech_main/deals` | Deal appears with "Draft" status |

**Document:**
- [ ] PASS - Save Draft works, deal saved with draft status
- [ ] FAIL - No Save Draft button visible
- [ ] FAIL - Button exists but doesn't save correctly

---

### TEST 5.5: Logo cropping to oval (Issue #20, Lines 565-574)

| Step | Action | Page/URL | Expected Result |
|------|--------|----------|-----------------|
| 1 | Navigate to Create Deal | `/versotech_main/deals/new` | - |
| 2 | Upload a rectangular logo | - | Upload completes |
| 3 | Check logo preview | - | Should appear as oval/circle |
|   | | | No white rectangular border around logo |
| 4 | Save deal and check in list | Deals list | Logo displays correctly |

**Document:**
- [ ] PASS - Logo cropped to oval, no white box
- [ ] FAIL - White rectangle visible around logo (BUG FROM MEETING)
- Screenshot: _____________________

---

## SECTION 6: TERM SHEET CREATION

### Issue #25-32: Term Sheet Form Issues

**Page:** Deal Detail → Term Sheets Tab → Create Term Sheet
**Component:** `/src/components/deals/deal-term-sheet-tab.tsx`

---

### TEST 6.1: Display text fields removed (Issue #25, Lines 626-629)

| Step | Action | Page/URL | Expected Result |
|------|--------|----------|-----------------|
| 1 | Navigate to deal detail | `/versotech_main/deals/{id}` | - |
| 2 | Go to Term Sheets tab | - | - |
| 3 | Click "Create Term Sheet" | - | Form opens |
| 4 | Look for price fields | - | Should see ONLY numeric field |
|   | | | Should NOT see "Display Text" field |

**Document:**
- [ ] PASS - Only numeric price field, no display text
- [ ] FAIL - Display text field still visible (BUG FROM MEETING)

---

### TEST 6.2: Issuer and Vehicle pre-filled (Issue #26-27, Lines 630-688)

**Fred's specification:**
- Issuer format: `{VehicleName} S.à r.l.`
- Vehicle format: `Series {number}`

| Step | Action | Page/URL | Expected Result |
|------|--------|----------|-----------------|
| 1 | Create deal under vehicle "VERSO Capital 2 SCSP Series 600" | - | Done |
| 2 | Navigate to deal Term Sheets tab | - | - |
| 3 | Click Create Term Sheet | - | Form opens |
| 4 | Check Issuer field | - | Should be pre-filled with: |
|   | | | "VERSO Capital 2 SCSP S.à r.l." |
| 5 | Check Vehicle field | - | Should be pre-filled with: |
|   | | | "Series 600" |
| 6 | Fields should be editable | - | Can override if needed |

**Document:**
- [ ] PASS - Issuer auto-filled with "S.à r.l." suffix
- [ ] PASS - Vehicle auto-filled with "Series XXX"
- [ ] FAIL - Fields empty (BUG FROM MEETING)
- [ ] FAIL - Wrong format
- Actual Issuer value: _____________________
- Actual Vehicle value: _____________________

---

### TEST 6.3: Free text sections pre-filled but editable (Issue #28, Lines 707-720)

**Fred's list of free text sections:**
- In Principle Approval
- Subject to Change
- Subscription Pack note
- Share Certificates note

| Step | Action | Page/URL | Expected Result |
|------|--------|----------|-----------------|
| 1 | Create new term sheet | - | Form opens |
| 2 | Scroll to free text sections | - | Find sections |
| 3 | Check "In Principle Approval" | - | Should have default text pre-filled |
| 4 | Check "Subject to Change" | - | Should have default text pre-filled |
| 5 | Try to edit text | - | Editable (can modify) |

**Expected Default Text Examples:**
```
In Principle Approval: "Subject to Arranger approval..."
Subject to Change: "Terms are subject to change..."
```

**Document:**
- [ ] PASS - Default text pre-filled, fields editable
- [ ] FAIL - Fields empty
- [ ] FAIL - Fields have default but not editable

---

### TEST 6.4: Preview modal close button visible (Issue #30, Line 734)

| Step | Action | Page/URL | Expected Result |
|------|--------|----------|-----------------|
| 1 | Create or edit term sheet | - | - |
| 2 | Click "Preview" button | - | Preview modal opens |
| 3 | Look for close button | Top right of modal | Close button (X) should be VISIBLE |
|   | | | Should NOT need to hover to see it |
| 4 | Click close button | - | Modal closes |

**Document:**
- [ ] PASS - Close button visible without hover
- [ ] FAIL - Close button hidden until hover (BUG FROM MEETING)
- [ ] FAIL - No close button at all

---

### TEST 6.5: TO vs Purchaser are different fields (Issue #32, Lines 756-808)

**Fred's clarification:**
- TO: "Qualified, Professional and Institutional Investors only" (header line)
- Purchaser: "Qualified Limited Partners and Institutional Clients ('Purchaser')" (party definition)

| Step | Action | Page/URL | Expected Result |
|------|--------|----------|-----------------|
| 1 | Create term sheet | - | - |
| 2 | Find "TO Description" field | - | One field for TO |
| 3 | Find "Purchaser" field | - | Separate field for Purchaser |
| 4 | Fill TO: "Qualified Professional Investors" | - | Saved |
| 5 | Fill Purchaser: "Limited Partners" | - | Saved (different value) |
| 6 | Preview term sheet | - | Both values appear correctly in different places |

**Document:**
- [ ] PASS - TO and Purchaser are separate, both appear correctly
- [ ] FAIL - Same value appears in both places (mapping issue)
- [ ] FAIL - Only one field exists

---

## SECTION 7: INVESTOR JOURNEY BAR

### Issue #33, #34: Journey Progress Display

**Component:** `/src/components/deals/investor-journey-bar.tsx`

---

### TEST 7.1: Interest remains unchecked until actually confirmed (Issue #33, Lines 832-840)

| Step | Action | Page/URL | Expected Result |
|------|--------|----------|-----------------|
| 1 | Login as investor | - | - |
| 2 | Navigate to deal you haven't interacted with | - | - |
| 3 | Check journey progress bar | - | "Interest" stage should be UNCHECKED |
| 4 | Request data room access | - | Submit request |
| 5 | Check journey bar again | - | "Access Requested" now checked |
| 6 | Before CEO approval | - | "NDA Signed" still unchecked |

**Document:**
- [ ] PASS - Stages update correctly based on actual completion
- [ ] FAIL - Stages pre-checked incorrectly

---

### TEST 7.2: Correct journey displayed per path

**Data Room Path Stages:**
```
Received → Viewed → Access Request → NDA Signed → Data Room → Subscribe Request → Pack Gen → Pack Sent → Signed → Funded → Active
```

**Direct Subscribe Path Stages:**
```
Received → Viewed → Subscribe Request → Pack Gen → Pack Sent → Signed → Funded → Active
```

| Step | Action | Expected Journey |
|------|--------|------------------|
| 1 | Choose direct subscribe | Shows 8 stages (no NDA, no data room) |
| 2 | Choose data room path | Shows 11 stages (includes NDA and data room) |

**Document:**
- [ ] PASS - Correct stages shown per path
- [ ] FAIL - Wrong number of stages

---

## SECTION 8: VERSOSIGN FOR EXTERNAL USERS

### Issue #17: Email-based signing (Lines 456-481)

---

### TEST 8.1: External signatory receives email to sign

**Scenario:** Entity has 3 signatories, only 1 has platform account

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Setup entity with 3 signatories (2 without accounts) | - |
| 2 | Account user requests data room access | - |
| 3 | CEO approves | - |
| 4 | Check: 3 NDAs generated (one per signatory) | 3 NDA documents |
| 5 | Check: Account user sees NDA in VERSOSign | Visible in portal |
| 6 | Check: External users receive emails | Email sent with signing link |
| 7 | External user clicks email link | Opens VERSOSign signing page |
| 8 | External user can sign without logging in | Signature captured |

**Document:**
- [ ] PASS - All 3 NDAs generated, emails sent to external users
- [ ] FAIL - Only 1 NDA generated
- [ ] FAIL - External users don't receive emails
- [ ] FAIL - Signing link doesn't work

---

## SECTION 9: FULL E2E FLOW TEST

### Complete Flow: Deal Creation → Investor Subscribe → Close

**Test all meeting issues in one complete flow:**

| Step | Page | Action | Verify |
|------|------|--------|--------|
| 1 | `/deals/new` | Create deal with all fields | CHF currency available |
| 2 | `/deals/new` | Upload rectangular logo | Crops to oval |
| 3 | `/deals/new` | Save as Draft | Draft status saved |
| 4 | `/deals/{id}` | Complete deal, change to Open | Status changes |
| 5 | `/deals/{id}/termsheets` | Create term sheet | Issuer/Vehicle pre-filled |
| 6 | Term sheet form | Check free text sections | Pre-filled and editable |
| 7 | Term sheet form | Preview | Close button visible |
| 8 | Term sheet form | Check TO vs Purchaser | Different fields |
| 9 | `/deals/{id}/members` | Dispatch to investor | Membership created |
| 10 | Login as investor | View opportunities | Deal visible |
| 11 | Deal detail | Check both action buttons | Subscribe + Data Room visible |
| 12 | Deal detail | Click "Request Data Room Access" | Message: "Data Room Access Requested" |
| 13 | Login as CEO | Go to Approvals | Type: "Data Room Access Request" |
| 14 | Approvals | Check priority column | HIDDEN |
| 15 | Approvals | Check user/deal display | Shows deal name, user name |
| 16 | Approvals | Approve request | NDA generated |
| 17 | Check NDA | Preview document | All Party A fields filled |
| 18 | CEO signs NDA | VERSOSign | Signature submitted |
| 19 | Investor signs NDA | VERSOSign | Data room access granted |
| 20 | Investor | Access data room | Documents visible |
| 21 | Investor | Subscribe | Subscription submitted |
| 22 | CEO | Approve subscription | Pack generated |
| 23 | CEO signs pack | VERSOSign | CEO signature on pack |
| 24 | Investor signs pack | VERSOSign | Subscription committed |

---

## DOCUMENTATION TEMPLATE

After each test, document in `E2E_TEST_RESULTS.md`:

```markdown
## Test [ID]: [Name]
**Date:** YYYY-MM-DD HH:MM
**Tester:** [Name]

### Result: PASS / FAIL / PARTIAL

### Steps Executed:
1. [Step] → [Observed result]
2. [Step] → [Observed result]
...

### Issues Found:
- [Description of any issues]

### Screenshots:
- [Screenshot paths]

### Notes:
- [Additional observations]
```

---

## QUICK REFERENCE: Issues to Verify

| # | Issue | Expected Fix |
|---|-------|--------------|
| 1 | Account status blocking | Users blocked until approved |
| 2 | Interest message | "Data Room Access Requested" |
| 3 | Priority column | Hidden in approvals |
| 4 | Approval type label | "Data Room Access Request" |
| 5 | NDA fields | All populated, no empty |
| 6 | Stock type | "Common and Ordinary Shares" |
| 7 | Vehicle label | Says "Vehicle" not "Entity" |
| 8 | Currency | CHF, AED available |
| 9 | Save Draft | Button exists and works |
| 10 | Logo crop | Oval, no white box |
| 11 | Issuer/Vehicle | Pre-filled from vehicle |
| 12 | Free text | Pre-filled, editable |
| 13 | Preview close | Button visible |
| 14 | TO vs Purchaser | Separate fields |
| 15 | Journey bar | Correct stages per path |
| 16 | External signing | Emails sent, works without login |
