# UI Testing Plan (Launch)

## 0) Preconditions
- Test accounts: CEO/staff, approved investor, incomplete investor, blacklisted investor.
- Deals: one open deal requiring NDA, one open deal with direct subscribe allowed, one closed deal, one draft deal.
- Vehicle with Series (e.g., “VERSO Capital 2 SCSp Series 600”).

## 1) Login & Access
- Login: `/versotech/login`, `/versotech_main/login`, `/versoholdings/login`.
- Reset password: `/versotech_main/reset-password`.
- Check persona routing and access to `/versotech_main/deals` and `/versotech_main/deals/new` for CEO.

## 2) KYC Status Gating
- NEW user: cannot access platform beyond profile; verify redirect.
- INCOMPLETE: can view dispatched deals + positions; cannot request data room, confirm interest, or subscribe.
- PENDING APPROVAL: same as INCOMPLETE; verify banner copy.
- APPROVED: can request data room and subscribe.
- REJECTED: blocked from actions; verify messaging.
- UNAUTHORIZED (blacklisted): view only; no actions.

## 3) Dispatch & Blacklist
- Dispatch normal investor → deal membership created.
- Dispatch blacklisted investor → blocked; verify error + no membership created.
- Existing blacklisted investor: deal appears closed and no actions.

## 4) Investor Journey & NDA Flow
- Route A (Data room):
  - Request Data Room Access → NDA prompt (no “Interest confirmed”).
  - After approval, NDA signing available.
  - After all signatories sign: data room access granted.
- Route B (Direct subscribe):
  - Subscribe CTA appears without NDA.
  - Subscription pack flow proceeds.

## 5) Auto‑route to NDA (needs confirmation)
- After approval of access request, verify UI auto‑routes to NDA or provides direct CTA/link.

## 6) Term Sheet
- Create term sheet: default issuer/vehicle derived from vehicle name.
  - Issuer: base name + “S.à r.l.”
  - Vehicle: “Series NNN”
- Edit default free‑text sections (in principle approval, subject to change, etc.).
- Preview modal close button visible without hover.
- TO vs Purchaser mapping is correct in preview/PDF.

## 7) Fee Plans in Term Sheet
- Fee plans list loads without error.
- Create fee plan and verify it shows under the correct term sheet.

## 8) Deal Creation
- Save as draft (status = draft, appears in lists).
- CHF/AED available and persist.
- Currency propagates to subscriptions/subscription pack.

## 9) Logos & Media
- Deal/company logos crop consistently across main pages (deal list, opportunity, data room cards, mandates).

## 10) Approvals Queue UX
- “Data room access request” label shown.
- Deal name + requesting user visible.
- Priority hidden.

## 11) Documents / Preview
- Document viewer close button visible and works (all locations).
- Data room documents load and filter by folder.

## 12) Regression Spot‑Checks
- Opportunities list loads (no errors).
- Deal detail loads and tabs render.
- Subscription flow does not regress.
