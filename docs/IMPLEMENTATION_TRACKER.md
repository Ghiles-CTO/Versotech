# VERSO Holdings - Implementation Tracker

> **Purpose**: Lock in goals and priorities. Prevent scope creep. Track progress.
> **Source**: Demo meeting feedback (December 2025)
> **Last Updated**: 2025-12-03

---

## LOCKED GOALS (Do Not Change)

These 8 items are the ONLY things to build. Do not add features, do not expand scope.

| # | Goal | Priority | Status | Owner |
|---|------|----------|--------|-------|
| 1 | Dashboard personalization | HIGH | DONE | - |
| 2 | Reports cleanup | HIGH | DONE | - |
| 3 | "Subscribe Now" button | HIGH | DONE | - |
| 4 | Rename "I'm Interested" button | MEDIUM | DONE | - |
| 5 | Data Room UI redesign | MEDIUM | DONE | - |
| 6 | Featured documents | MEDIUM | DONE | - |
| 7 | Documents page restructure | MEDIUM | DONE | - |
| 8 | Certificate generation | LOW | DONE | - |

---

## DETAILED SPECIFICATIONS

### 1. Dashboard Personalization
**Goal**: Show investor's name and photo when they log in

**Scope**:
- Display investor name prominently on dashboard
- Show investor photo/avatar if available
- Personalized greeting

**NOT in scope**:
- Profile editing
- Photo upload functionality (already exists in profile)

**Files**: `src/app/(investor)/versoholdings/dashboard/page.tsx`

**Success Criteria**: Investor sees their name and photo on dashboard

---

### 2. Reports Cleanup
**Goal**: Remove auto-generated quick reports. KEEP custom request tickets.

**KEEP (Do NOT delete)**:
- Documents Hub tab
- Custom Request modal (investor submits tickets)
- Active Requests list (investor sees pending tickets)
- Staff Requests page (`/versotech/staff/requests`)
- All `request_tickets` functionality

**DELETE**:
- Quick Reports tab
- Position Statement generator
- Quarterly/Monthly/Tax report generators
- `quick-report-card.tsx`
- `quick-report-dialog.tsx`
- `recent-reports-list.tsx`
- `/api/report-requests/` routes

**Files to modify**:
- `src/app/(investor)/versoholdings/reports/page.tsx`
- `src/components/reports/reports-page-client.tsx`

**Success Criteria**: No quick reports visible. Custom requests still work.

---

### 3. "Subscribe Now" Button
**Goal**: Let investors subscribe directly from Active Deals page (skip data room)

**Scope**:
- Add "Subscribe Now" button next to "I'm Interested" on deal cards
- Opens dialog with same subscription form used in data room
- No NDA requirement (30% of investors don't need data room)

**NOT in scope**:
- Changing the subscription form itself
- Modifying data room subscription flow

**Files**:
- `src/app/(investor)/versoholdings/deals/page.tsx`
- `src/components/deals/investor-deals-list-client.tsx`
- NEW: `src/components/deals/subscribe-now-dialog.tsx`

**Success Criteria**: Investor can subscribe from deals page without visiting data room

---

### 4. Rename "I'm Interested" Button
**Goal**: Change button text to clarify it's for data room access

**Current**: "I'm Interested"
**New**: "I'm interested in data room access"

**Files**: `src/components/deals/investor-deals-list-client.tsx`

**Success Criteria**: Button shows new text

---

### 5. Data Room UI Redesign
**Goal**: Restructure layout and improve styling

**New Layout (left section)**:
1. Featured Documents (top)
2. All Documents (folder tree)
3. Overview Info
4. Term Sheet
5. FAQ Section

**Styling Upgrade**:
- Professional/luxurious folder appearance
- Better shadows, spacing, colors
- Keep right section (subscription form) as-is

**Files**:
- `src/app/(investor)/versoholdings/data-rooms/[dealId]/page.tsx`
- `src/components/deals/data-room-documents-grouped.tsx`

**Success Criteria**: New layout with professional styling

---

### 6. Featured Documents
**Goal**: Staff can mark documents as "featured" to show at top of data room

**Database Change**:
```sql
ALTER TABLE deal_data_room_documents
ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
```

**UI Changes**:
- Add "Featured" checkbox in upload dialog
- Query and display featured docs at top of data room

**Files**:
- `src/components/deals/data-room-document-upload.tsx`
- `src/components/deals/data-room-documents-grouped.tsx`

**Success Criteria**: Staff can feature docs, they appear at top for investors

---

### 7. Documents Page Restructure
**Goal**: Group by investment first, then by document type

**Current Structure**:
```
Agreements → Fund A, Fund B
Statements → Fund A, Fund B
```

**New Structure**:
```
Fund A → Agreements, Statements
Fund B → Agreements, Statements
```

**Additional Changes**:
- Remove KYC documents from this view (KYC stays in Profile only)
- Major styling upgrade

**Files**:
- `src/components/documents/categorized-documents-client.tsx`
- `src/app/(investor)/versoholdings/documents/page.tsx`

**Success Criteria**: Documents grouped by investment first

---

### 8. Certificate Generation
**Goal**: Auto-generate certificates when subscription is fully funded

**Scope**:
- New n8n workflow for PDF generation
- Trigger when subscription reaches 100% funded
- API endpoint to request certificate

**Files**:
- `src/lib/workflows.ts`
- NEW: API route for certificate
- n8n workflow configuration

**Success Criteria**: Certificates generate automatically on full funding

---

## ALREADY DONE (No Changes Needed)

| Feature | Status | Notes |
|---------|--------|-------|
| Featured deals at top | DONE | Already works |
| Data room folder hierarchy | DONE | Folders exist, styling upgrade in #5 |
| NDA auto-generation | DONE | n8n workflow integrated |
| Subscription auto-status | DONE | Updates during reconciliation |
| KYC docs in Profile | DONE | Full functionality with status badges |

---

## SCOPE BOUNDARIES

### Do NOT:
- Add new features beyond the 8 listed
- Refactor unrelated code
- "Improve" things that weren't requested
- Change staff portal workflows (except requests page handling)
- Modify database schema beyond `is_featured` column
- Touch authentication or authorization
- Add new document types or categories

### If Unclear:
- Ask before adding anything
- Default to minimal change
- Keep existing patterns

---

## PROGRESS LOG

| Date | Item | Action | Notes |
|------|------|--------|-------|
| 2025-12-03 | Planning | Complete | All 8 items defined |
| 2025-12-03 | Goals 1-4 | Complete | Dashboard, Reports, Subscribe Now, Rename button |
| 2025-12-03 | Goals 6-8 | Complete | Featured docs, Documents restructure, Certificate workflow |
| 2025-12-03 | Goal 5 | Fixed | Data room layout restructured - documents now in left column |
| 2025-12-03 | Verification | Complete | All 8 goals verified and build passing |

---

## FILES INVENTORY

### To Create
```
src/components/deals/subscribe-now-dialog.tsx
```

### To Modify
```
src/app/(investor)/versoholdings/dashboard/page.tsx
src/app/(investor)/versoholdings/reports/page.tsx
src/app/(investor)/versoholdings/deals/page.tsx
src/app/(investor)/versoholdings/documents/page.tsx
src/app/(investor)/versoholdings/data-rooms/[dealId]/page.tsx
src/components/reports/reports-page-client.tsx
src/components/deals/investor-deals-list-client.tsx
src/components/deals/data-room-documents-grouped.tsx
src/components/deals/data-room-document-upload.tsx
src/components/documents/categorized-documents-client.tsx
src/lib/workflows.ts
```

### To Delete
```
src/components/reports/quick-report-card.tsx
src/components/reports/quick-report-dialog.tsx
src/components/reports/recent-reports-list.tsx
src/app/api/report-requests/
```

---

## SIGN-OFF

- [ ] Client approved scope
- [ ] Development complete
- [ ] Testing complete
- [ ] Deployed to production
