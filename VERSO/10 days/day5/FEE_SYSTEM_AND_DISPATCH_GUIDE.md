# VERSO Fee System & Dispatch Workflow Guide

**Version:** 1.0
**Date:** January 5, 2026
**Based on:** Fred's requirements from meeting2.md

---

## Table of Contents

1. [Core Concept: The Term Sheet Hierarchy](#1-core-concept-the-term-sheet-hierarchy)
2. [Process 1: Deal Setup](#2-process-1-deal-setup)
3. [Process 2: Fee Model Creation](#3-process-2-fee-model-creation)
4. [Process 3: Fee Model Acceptance](#4-process-3-fee-model-acceptance)
5. [Process 4: Investor Dispatch](#5-process-4-investor-dispatch)
6. [Process 5: Data Room Access](#6-process-5-data-room-access)
7. [Process 6: Deal Closing & Invoicing](#7-process-6-deal-closing--invoicing)
8. [Visibility Rules by Persona](#8-visibility-rules-by-persona)
9. [Key Business Rules](#9-key-business-rules)
10. [What Changed & Why](#10-what-changed--why)

---

## 1. Core Concept: The Term Sheet Hierarchy

The term sheet is the backbone of every deal. Everything flows from it.

```
                    ┌─────────────┐
                    │    DEAL     │
                    │ (Investment │
                    │ Opportunity)│
                    └──────┬──────┘
                           │
                           │ contains
                           ▼
                    ┌─────────────┐
                    │ TERM SHEET  │ ◄── Defines investor terms
                    │  (Required) │     Sets MAXIMUM fee limits
                    └──────┬──────┘
                           │
                           │ derives (1:many)
                           ▼
                    ┌─────────────┐
                    │  FEE MODEL  │ ◄── Commercial agreement with
                    │             │     introducer/partner
                    └──────┬──────┘     Fees MUST be ≤ term sheet
                           │
                           │ linked to
                           ▼
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
       ┌─────────────┐           ┌─────────────┐
       │ INTRODUCER  │           │   PARTNER   │
       │             │           │             │
       └─────────────┘           └─────────────┘
```

**Why this matters:**
- Every fee model traces back to a specific term sheet
- No "floating" or reusable fee templates
- Clear audit trail for compliance

---

## 2. Process 1: Deal Setup

### Steps

| Step | Action | Who |
|------|--------|-----|
| 1 | Create new Deal | CEO |
| 2 | Assign to Vehicle (SPV/Fund) | CEO |
| 3 | Create Term Sheet with fee limits | CEO |
| 4 | Publish Term Sheet | CEO |
| 5 | Upload Data Room documents | CEO/Arranger |

### Term Sheet Contents

```
┌─────────────────────────────────────────────────────────┐
│                      TERM SHEET                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Investment Terms (for investors):                       │
│  ├── Minimum ticket: £50,000                            │
│  ├── Maximum ticket: £500,000                           │
│  ├── Price per share: £1.00                             │
│  └── Closing date: March 31, 2026                       │
│                                                          │
│  Fee Limits (MAXIMUM allowed):                           │
│  ├── Subscription fee: 3%                               │
│  ├── Management fee: 2%                                 │
│  └── Performance fee: 20%                               │
│                                                          │
│  Status: PUBLISHED ✓                                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Rule: Term Sheet Must Be Published

Fee models can only be created against **published** term sheets.

```
Draft Term Sheet ──► Cannot create fee models
Published Term Sheet ──► Can create fee models ✓
```

---

## 3. Process 2: Fee Model Creation

A fee model is a commercial agreement between VERSO and an introducer/partner for a specific deal.

### Steps

| Step | Action | Who |
|------|--------|-----|
| 1 | Select the Deal | CEO/Arranger |
| 2 | Select the published Term Sheet | CEO/Arranger |
| 3 | Select the Entity (Introducer OR Partner) | CEO/Arranger |
| 4 | Set fee rates (must be ≤ term sheet limits) | CEO/Arranger |
| 5 | Save as Draft | System |

### Fee Model Contents

```
┌─────────────────────────────────────────────────────────┐
│                      FEE MODEL                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Linked To:                                              │
│  ├── Deal: Transform Capital Series A                   │
│  ├── Term Sheet: Version 2 (Published)                  │
│  └── Entity: ABC Introducers Ltd                        │
│                                                          │
│  Fee Rates (negotiated):                                 │
│  ├── Subscription fee: 2.5%  (≤ 3% limit ✓)             │
│  ├── Management fee: 1.5%    (≤ 2% limit ✓)             │
│  └── Performance fee: 15%    (≤ 20% limit ✓)            │
│                                                          │
│  Status: DRAFT                                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Validation Rule: Fees Cannot Exceed Term Sheet

```
Term Sheet says:     Fee Model requests:     Result:
─────────────────    ───────────────────     ───────
Sub fee: 3% MAX      Sub fee: 2.5%           ✓ Allowed
Sub fee: 3% MAX      Sub fee: 4%             ✗ BLOCKED
Mgmt fee: 2% MAX     Mgmt fee: 1.5%          ✓ Allowed
Perf fee: 20% MAX    Perf fee: 25%           ✗ BLOCKED
```

### No Global Templates

Every fee model MUST be linked to:
1. A specific Deal
2. A specific Term Sheet
3. A specific Entity (Introducer/Partner)

There are no reusable "default" fee plans.

---

## 4. Process 3: Fee Model Acceptance

Before any investor can be dispatched through an introducer/partner, that entity must accept their fee model.

### Partner Acceptance Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    PARTNER ACCEPTANCE                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. CEO sends fee model to Partner                                │
│     └── Status changes: DRAFT → SENT                              │
│                                                                   │
│  2. Partner receives notification                                 │
│                                                                   │
│  3. Partner logs into platform                                    │
│     └── Partner CAN see the term sheet details                    │
│                                                                   │
│  4. Partner reviews fee model terms                               │
│                                                                   │
│  5. Partner clicks "Accept" or "Reject"                           │
│     ├── Accept → Status: ACCEPTED                                 │
│     └── Reject → Negotiation required (offline)                   │
│                                                                   │
│  No formal agreement document required for partners.              │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Introducer Acceptance Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    INTRODUCER ACCEPTANCE                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. CEO sends fee model to Introducer                             │
│     └── Status changes: DRAFT → PENDING SIGNATURE                 │
│                                                                   │
│  2. Introducer receives notification                              │
│                                                                   │
│  3. Introducer logs into platform                                 │
│     └── Introducer CANNOT see the term sheet                      │
│     └── Introducer only sees their fee model                      │
│                                                                   │
│  4. Introducer reviews fee model terms                            │
│                                                                   │
│  5. Introducer signs via VERSOSign (digital signature)            │
│     ├── Sign → Status: ACCEPTED + signature recorded              │
│     └── Reject → Negotiation required (offline)                   │
│                                                                   │
│  Formal agreement document IS required for introducers.           │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Fee Model Status Flow

```
                    ┌─────────┐
                    │  DRAFT  │
                    └────┬────┘
                         │
            CEO sends to entity
                         │
                         ▼
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
   ┌───────────┐                 ┌───────────────────┐
   │   SENT    │                 │ PENDING SIGNATURE │
   │ (Partner) │                 │   (Introducer)    │
   └─────┬─────┘                 └─────────┬─────────┘
         │                                 │
    Entity decides                    Entity decides
         │                                 │
    ┌────┴────┐                       ┌────┴────┐
    ▼         ▼                       ▼         ▼
┌────────┐ ┌────────┐           ┌────────┐ ┌────────┐
│ACCEPTED│ │REJECTED│           │ACCEPTED│ │REJECTED│
└────────┘ └────────┘           └────────┘ └────────┘
```

---

## 5. Process 4: Investor Dispatch

Dispatching means sending an investment opportunity to an investor. This is the critical step where term sheet, investor, and referring entity come together.

### Dispatch Blocking Rule

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│   Can we dispatch an investor through this introducer/partner?    │
│                                                                   │
│   Check: Does the entity have an ACCEPTED fee model for this      │
│          deal's term sheet?                                       │
│                                                                   │
│   ┌─────────────────────────┐     ┌─────────────────────────┐    │
│   │ Fee Model = ACCEPTED    │     │ Fee Model ≠ ACCEPTED    │    │
│   │                         │     │ (Draft/Sent/Pending)    │    │
│   │    ✓ DISPATCH ALLOWED   │     │    ✗ DISPATCH BLOCKED   │    │
│   └─────────────────────────┘     └─────────────────────────┘    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Dispatch Steps

| Step | Action | Who |
|------|--------|-----|
| 1 | Verify entity has accepted fee model | System (automatic) |
| 2 | Select Term Sheet | CEO/Arranger/Partner |
| 3 | Select Investor | CEO/Arranger/Partner |
| 4 | Select Referring Entity (if applicable) | CEO/Arranger |
| 5 | System links investor to fee model | System (automatic) |
| 6 | Investor receives notification | System |

### What Gets Linked at Dispatch

```
┌─────────────────────────────────────────────────────────────────┐
│                     DISPATCH CREATES LINK                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  INVESTOR: John Smith                                            │
│      │                                                           │
│      ├── Term Sheet: Version 2                                   │
│      │                                                           │
│      ├── Referred by: ABC Introducers Ltd                        │
│      │                                                           │
│      └── Fee Model: ABC's accepted fee model                     │
│                     (2.5% sub / 1.5% mgmt / 15% perf)            │
│                                                                  │
│  This link is permanent and determines:                          │
│  • What fees apply to this investor's subscription               │
│  • Who gets commission when investor funds                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Partner SHARE Feature

Partners have a special ability: they can SHARE deals directly with investors.

```
┌─────────────────────────────────────────────────────────────────┐
│                      PARTNER SHARE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Partner has accepted fee model for Deal X                    │
│                                                                  │
│  2. Partner clicks "Share" on the deal                           │
│                                                                  │
│  3. Partner enters investor email                                │
│                                                                  │
│  4. System dispatches to investor with:                          │
│     ├── Term sheet from the deal                                 │
│     ├── Partner as referring entity                              │
│     └── Partner's accepted fee model                             │
│                                                                  │
│  5. Partner can track investor's progress:                       │
│     DISPATCHED → VIEWED → INTERESTED → NDA →                     │
│     PACK SENT → SIGNED → FUNDED                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Process 5: Data Room Access

The data room contains due diligence documents, legal documents, and financials for a deal.

### Who Can Access the Data Room

| Persona | Can Access Data Room? | Condition |
|---------|----------------------|-----------|
| Investor | Yes | Must sign NDA first |
| Partner | Yes | Must sign NDA first |
| Introducer | No | No data room access |
| CEO/Staff | Yes | Always |
| Arranger | Yes | For assigned deals |

### NDA Flow for Data Room Access

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA ROOM ACCESS FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User expresses interest in deal                              │
│                                                                  │
│  2. System prompts for NDA                                       │
│     ├── NDA is pre-signed by VERSO                               │
│     └── User must sign digitally                                 │
│                                                                  │
│  3. User signs NDA                                               │
│                                                                  │
│  4. Data Room access granted                                     │
│     └── Access expires after 7 days (default)                    │
│                                                                  │
│  5. User can now:                                                │
│     ├── View documents                                           │
│     ├── Download documents                                       │
│     └── Review due diligence materials                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Introducer Exception

Introducers do NOT get data room access because:
- They are referral partners, not investors
- They only need to know fee model terms
- They do not need due diligence materials

---

## 7. Process 6: Deal Closing & Invoicing

Invoice requests and certificate issuance are triggered by the **deal closing date**, not by individual subscription funding.

### Timeline

```
                DURING DEAL                          AT CLOSING
                ───────────                          ──────────

Subscriptions funded                          Closing date reached
        │                                             │
        ▼                                             ▼
┌───────────────────┐                     ┌───────────────────────┐
│ Fees ACCRUE       │                     │ CEO approval triggered │
│ (calculated)      │                     │ (position confirmation)│
│                   │                     └───────────┬───────────┘
│ Partners/         │                                 │
│ Introducers can   │                         CEO confirms
│ VIEW accrued fees │                                 │
│                   │                                 ▼
│ But CANNOT submit │                     ┌───────────────────────┐
│ invoices yet      │                     │ AFTER CEO APPROVAL:   │
└───────────────────┘                     │                       │
                                          │ • Certificates issued │
                                          │ • Invoice requests    │
                                          │   ENABLED             │
                                          │ • Partners can now    │
                                          │   submit invoices     │
                                          └───────────────────────┘
```

### Why Closing Date (Not Funding)?

Fred's reasoning:
> "It could happen that we get the money and we have to return the funds to the investors because we haven't been able to do the closing."

Until the deal officially closes:
- Positions are not finalized
- Refunds may still occur
- Commissions should not be paid out

### Invoice Submission Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    INVOICE SUBMISSION                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BEFORE CLOSING:                                                 │
│  ├── Partner/Introducer logs in                                  │
│  ├── Views accrued fees: £5,000 owed                            │
│  └── "Submit Invoice" button is DISABLED                         │
│                                                                  │
│  AFTER CLOSING + CEO APPROVAL:                                   │
│  ├── Partner/Introducer logs in                                  │
│  ├── Views accrued fees: £5,000 owed                            │
│  ├── "Submit Invoice" button is ENABLED ✓                        │
│  ├── Partner/Introducer submits invoice                          │
│  ├── CEO/Arranger requests payment to Lawyer                     │
│  ├── Lawyer processes payment from escrow                        │
│  └── Partner/Introducer receives payment                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Visibility Rules by Persona

Different personas see different information. This is intentional for commercial and compliance reasons.

### Summary Table

| Information | Investor | Partner | Introducer | CEO/Staff |
|-------------|----------|---------|------------|-----------|
| Term Sheet | ✓ Full | ✓ Full | ✗ Hidden | ✓ Full |
| Fee Model | ✗ N/A | ✓ Own only | ✓ Own only | ✓ All |
| Data Room | ✓ After NDA | ✓ After NDA | ✗ No access | ✓ Always |
| Investor List | ✗ No | ✓ Own referrals | ✓ Own referrals | ✓ All |
| Accrued Fees | ✗ N/A | ✓ Own only | ✓ Own only | ✓ All |
| Other Fee Models | ✗ N/A | ✗ No | ✗ No | ✓ All |

### Why Introducers Cannot See Term Sheets

Fred's explanation:
> "The partner see the term sheet, the introducer doesn't see the term sheet."

Reasons:
1. **Commercial sensitivity**: Introducers don't need to know investor pricing
2. **Negotiation simplicity**: Introducer focuses only on their fee model
3. **Role clarity**: Introducers refer clients, they don't advise on investments

### Partner vs Introducer Visual

```
┌─────────────────────────────┐    ┌─────────────────────────────┐
│         PARTNER VIEW         │    │       INTRODUCER VIEW        │
├─────────────────────────────┤    ├─────────────────────────────┤
│                              │    │                              │
│  Deal: Transform Capital     │    │  Deal: Transform Capital     │
│                              │    │                              │
│  Term Sheet: ✓ VISIBLE       │    │  Term Sheet: ✗ HIDDEN        │
│  ├── Min ticket: £50,000    │    │                              │
│  ├── Sub fee: 3%            │    │  Your Fee Model: ✓ VISIBLE   │
│  └── Closing: Mar 2026      │    │  ├── Sub fee: 2.5%          │
│                              │    │  ├── Mgmt fee: 1.5%         │
│  Your Fee Model: ✓ VISIBLE   │    │  └── Perf fee: 15%          │
│  ├── Sub fee: 2.5%          │    │                              │
│  ├── Mgmt fee: 1.5%         │    │  Data Room: ✗ NO ACCESS      │
│  └── Perf fee: 15%          │    │                              │
│                              │    │  Status: Pending Signature   │
│  Data Room: ✓ ACCESS         │    │  [Sign Agreement]            │
│  (after NDA)                 │    │                              │
│                              │    │                              │
│  [Accept] [Reject]           │    │                              │
│  [Share with Investor]       │    │                              │
│                              │    │                              │
└─────────────────────────────┘    └─────────────────────────────┘
```

---

## 9. Key Business Rules

### Rule 1: No Global Fee Plans

```
┌─────────────────────────────────────────────────────────────────┐
│  ✗ WRONG: "Use default 2% fee plan for all deals"               │
│  ✓ RIGHT: "Create fee plan for Deal X, Term Sheet v2, Partner A"│
└─────────────────────────────────────────────────────────────────┘
```

Every fee model must specify: Deal + Term Sheet + Entity

### Rule 2: Fee Values Cannot Exceed Term Sheet

```
┌─────────────────────────────────────────────────────────────────┐
│  Term Sheet says: Subscription fee MAX 3%                        │
│                                                                  │
│  ✓ Fee Model at 2.5% → Allowed                                   │
│  ✓ Fee Model at 3.0% → Allowed (at limit)                        │
│  ✗ Fee Model at 3.5% → BLOCKED by system                         │
└─────────────────────────────────────────────────────────────────┘
```

### Rule 3: Dispatch Blocked Until Acceptance

```
┌─────────────────────────────────────────────────────────────────┐
│  Want to dispatch investor through Partner A?                    │
│                                                                  │
│  Check: Partner A's fee model status                             │
│                                                                  │
│  If ACCEPTED → Dispatch proceeds                                 │
│  If NOT ACCEPTED → Error: "Fee model must be accepted first"     │
└─────────────────────────────────────────────────────────────────┘
```

### Rule 4: Invoices Enabled at Closing

```
┌─────────────────────────────────────────────────────────────────┐
│  Investor funds £100,000 on February 15                          │
│  Deal closes on March 31                                         │
│  CEO confirms positions on April 1                               │
│                                                                  │
│  When can Partner submit invoice?                                │
│                                                                  │
│  ✗ February 15 (funding date) → Cannot submit                    │
│  ✗ March 31 (closing date) → Cannot submit (awaiting CEO)        │
│  ✓ April 1 (after CEO approval) → Can submit                     │
└─────────────────────────────────────────────────────────────────┘
```

### Rule 5: CEO Approval Required at Closing

```
┌─────────────────────────────────────────────────────────────────┐
│  Closing date reached → System triggers CEO approval             │
│                                                                  │
│  CEO reviews:                                                    │
│  • All funded subscriptions                                      │
│  • Final positions                                               │
│  • Any issues to resolve                                         │
│                                                                  │
│  CEO confirms → Certificates + Invoices enabled                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. What Changed & Why

### Before vs After Summary

| Aspect | Before (Wrong) | After (Correct) | Why Changed |
|--------|---------------|-----------------|-------------|
| Fee Plans | Could be global templates | Must link to Deal + Term Sheet + Entity | Risk management, audit trail |
| Fee Creation | Auto-synced from term sheet | Manual creation only | Intentional commercial decisions |
| Fee Values | No validation | Must be ≤ term sheet limits | Commercial consistency |
| Dispatch | Could dispatch without acceptance | Blocked until fee model accepted | Ensures agreement before action |
| Partner Visibility | Could not see term sheet | CAN see term sheet | Partners need full context |
| Introducer Visibility | Could see term sheet | CANNOT see term sheet | Role-appropriate access |
| Invoice Timing | At subscription funding | At deal closing + CEO approval | Prevents premature payouts |
| Certificates | At subscription funding | At deal closing + CEO approval | Positions must be finalized |

### The Core Change

**Before:** Fee plans were templates that could be reused.

**After:** Fee models are commercial agreements that must be:
1. Created intentionally for each deal
2. Linked to a published term sheet
3. Accepted by the entity before any dispatch
4. Validated against term sheet limits

### Business Value

| Change | Business Value |
|--------|----------------|
| No global templates | Eliminates risk of wrong fees being applied |
| Fee validation | Ensures commercial consistency |
| Acceptance requirement | Creates clear agreement before action |
| Closing date trigger | Prevents paying commissions before deal is final |
| Visibility rules | Appropriate information for each role |

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────┐
│                    QUICK REFERENCE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TO CREATE A FEE MODEL:                                          │
│  1. Deal exists                                                  │
│  2. Term Sheet is PUBLISHED                                      │
│  3. Select Entity (Introducer/Partner)                           │
│  4. Set fees ≤ term sheet limits                                 │
│                                                                  │
│  TO DISPATCH AN INVESTOR:                                        │
│  1. Entity's fee model is ACCEPTED                               │
│  2. Select term sheet                                            │
│  3. Select investor                                              │
│  4. Select referring entity                                      │
│                                                                  │
│  TO SUBMIT AN INVOICE:                                           │
│  1. Deal has closed                                              │
│  2. CEO has confirmed positions                                  │
│  3. Invoice requests enabled                                     │
│                                                                  │
│  VISIBILITY:                                                     │
│  • Partners: See term sheet + fee model + data room (after NDA)  │
│  • Introducers: See fee model only (no term sheet, no data room) │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 5, 2026 | System | Initial creation based on Fred's requirements |
