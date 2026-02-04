# PRD: VERSOTech AI Agents - Compliance Team

## Introduction

Introduce AI Agents to VERSOTech - a system of named personas that automate compliance workflows, provide risk visibility, and humanize system communications. The Compliance Team consists of three agents (Uma NAIDU - CCO, Valerie LEMOINE - Compliance Officer, Wayne O'CONNOR - Compliance Officer), each responsible for specific compliance tasks.

This feature combines:
1. **Automation** - Reduce manual compliance work (risk scoring, document tracking, alerts)
2. **Visibility** - Give CEO a centralized view of compliance status and risks
3. **Personalization** - System notifications branded with agent personas (e.g., "Valerie: Your passport expires in 30 days")

The Risk Profile System (from the Excel specification) serves as the scoring engine for investor and deal risk categorization.

---

## Goals

- Implement all 9 Compliance Team agent tasks as defined in the "VERSOTECH - AI AGENTS" PDF
- Import and operationalize the Risk Profile System from Excel (159 countries, 11 industries, 64 investment types)
- Create a dedicated "Agents" section in the admin portal for CEO visibility
- Allow CEO to configure which agent handles which task type
- Replace generic system notifications with agent-branded communications
- Provide automated risk scoring triggered by KYC data changes
- Ensure KYC/AML monitoring covers all persona entities and their members (not just investors)
- Improve notifications + messaging UX and reliability before agent rollout (discoverability, scroll stability, clear access to full notifications page from the bell)

---

## Agent Definitions

### Uma NAIDU (CCO) - `HR` High Risk Function
| Task Ref | Task Name | Description |
|----------|-----------|-------------|
| U001 | OFAC Reports | Screen entities, members, and directors against OFAC; generate and archive PDF reports |
| U002 | Risk Profile Categorization | Auto-calculate investor/deal risk using Country, Industry, and Investment Risk matrices |
| U003 | Blacklist Management | Maintain watchlist of bad actors; trigger alerts when flagged persons attempt to use VERSOTech |

### Valerie LEMOINE (Compliance Officer) - `KYC` KYC & AML Function
| Task Ref | Task Name | Description |
|----------|-----------|-------------|
| V001 | NDA-NDNC Processes | Produce, dispatch, track, and archive NDAs; auto-grant dataroom access on full execution |
| V002 | KYC/AML Records | Full KYC and AML monitoring **for all Users and Stakeholders (incl Issuers, Introducers, etc)**; expired document tracking; communications log |
| V003 | Compliance Documentation | Archive all signed legal documents; manage annual suitability questionnaires |

### Wayne O'CONNOR (Compliance Officer) - `AC` Active Compliance
| Task Ref | Task Name | Description |
|----------|-----------|-------------|
| W001 | Compliance Q&A | Manage compliance questions or issues in the chat |
| W002 | Compliance Log | Maintain a compliance log of events, messages, emails, litigation cases, surveys, tax updates, voting, etc. |
| W003 | Compliance Enquiry Intake | Record new compliance enquiries and update Admin when new solutions/modules/forms are needed |

---

## User Stories

### US-001: Create Agent Registry Database
**Description:** As a developer, I need to store agent definitions so they can be assigned to tasks and used for branded communications.

**Acceptance Criteria:**
- [x] Create `ai_agents` table with: id, name, role, avatar_url, email_identity, is_active, created_at
- [ ] Extract avatar photos from PDF and store in Supabase storage
- [x] Seed 3 Compliance Team agents (Uma, Valerie, Wayne) with names + roles (avatars pending)
- [x] Create `agent_task_assignments` table linking agents to task types
- [x] Default assignments match PDF specification (Uma→U001-U003, Valerie→V001-V003, Wayne→W001-W003)
- [x] RLS policies restrict UI access to CEO persona; backend jobs use service role and are fully audited
- [ ] Typecheck passes

---

### US-002: Import Risk Profile Scoring Matrices
**Description:** As a compliance system, I need the risk scoring data so I can calculate investor and deal risk grades.

**Acceptance Criteria:**
- [ ] Create `risk_grades` table: code (A1-E), label, points (0-20), color, sort_order
- [ ] Create `country_risks` table: country_code (ISO-3166-1 alpha-2), country_name, country_risk_grade, business_climate_grade
- [ ] Create `industry_risks` table: sector_code, sector_name, risk_grade
- [ ] Create `investment_type_risks` table: investment_type, category, key_risk_drivers, risk_grade
- [ ] Seed all 8 risk grades from Excel
- [ ] Seed all countries listed in Excel (159) with their risk ratings
- [ ] Map Excel country names to ISO-3166-1 alpha-2 codes; store name even if code is missing and flag for manual review
- [ ] Seed all 11 GICS sectors with their risk ratings from Excel
- [ ] Seed all 64 investment types with their risk ratings from Excel
- [ ] Do not add new fields to existing profiles; store normalized country_code inside risk profile records
- [ ] Typecheck passes

---

### US-003: Calculate Investor Risk Profile
**Description:** As Uma (CCO), I want to automatically calculate investor risk scores based on their KYC data so I can identify high-risk clients.

**Acceptance Criteria:**
- [ ] Create `investor_risk_profiles` table: id, investor_id, country_risk_grade, country_points, pep_risk_points, sanctions_risk_points, total_risk_points, composite_risk_grade, calculated_at, calculation_inputs (NO unique constraint on investor_id - keep full history)
- [ ] Create `calculate_investor_risk(investor_id)` function that:
  - Looks up investor country using: 
    - If `investors.type = 'individual'`: `residential_country` → fallback `country_of_tax_residency` → fallback `country`
    - Else (entity): `country_of_incorporation` → fallback `registered_country` → fallback `country`
  - Maps country to `country_risks` → gets points
  - Adds +10 points if is_pep = true
  - Adds +20 points if is_sanctioned = true
  - Sums total points → maps to composite risk grade
  - INSERTS new row (preserves history, doesn't update)
- [ ] Trigger recalculation when investor profile changes (country, is_pep, is_sanctioned)
- [ ] Create cron job for daily batch recalculation of all investor profiles at midnight
- [ ] Store calculation inputs snapshot in JSONB for audit trail
- [ ] Create view `investor_risk_profiles_current` showing only latest profile per investor
- [ ] Typecheck passes

---

### US-004: Calculate Deal Risk Profile
**Description:** As Uma (CCO), I want to automatically calculate deal risk scores so I can assess investment risk exposure.

**Acceptance Criteria:**
- [ ] Create `deal_risk_profiles` table: deal_id, country_risk_grade, industry_risk_grade, investment_type_risk_grade, total_risk_points, composite_risk_grade, calculated_at
- [ ] Create `calculate_deal_risk(deal_id)` function that:
  - Looks up deal's target country → country risk points
    - Use existing `deals.location` (free text) and map to country name in the risk matrix
    - If location is missing or unmapped, mark country risk as `Unknown` and flag for manual review
  - Looks up deal's sector → industry risk points (use existing `deals.sector`)
  - Looks up deal's investment type → investment type risk points using existing fields:
    - Primary: `vehicles.type` (if deal is linked to a vehicle)
    - Fallback: `deals.deal_type`
    - Map these values to the closest investment type in the risk matrix via a defined mapping table
    - Do not add new fields; use existing values only
  - Sums total → maps to composite grade
- [ ] Trigger recalculation when deal is updated
- [ ] Typecheck passes

---

### US-005: Create Blacklist System
**Description:** As Uma (CCO), I want to maintain a blacklist of bad actors so they are blocked from using VERSOTech.

**Acceptance Criteria:**
- [ ] Create `compliance_blacklist` table: id, email, phone, full_name, entity_name, tax_id, reason, severity (warning/blocked/banned), source, reported_by, reported_at, reviewed_by, reviewed_at, status (active/resolved/false_positive), notes
- [ ] Create `blacklist_matches` table: blacklist_entry_id, matched_user_id, matched_investor_id, match_type, match_confidence, matched_at, action_taken
- [ ] Create `screen_against_blacklist(email, name, tax_id)` function that returns matches with confidence scores
  - Exact match precedence for email/phone/tax_id (highest priority)
  - Exact normalized full_name/entity_name match (secondary)
  - Fuzzy name matching using trigram similarity on normalized names (lowercase, strip punctuation, collapse whitespace) with 0.90 threshold
- [ ] RLS policies allow CEO to create/edit blacklist entries
- [ ] Typecheck passes

---

### US-006: Blacklist Screening on User Actions
**Description:** As the system, I need to screen users against the blacklist during critical actions to prevent bad actors from proceeding.

**Acceptance Criteria:**
- [ ] Screen on user signup - block if email/name matches with severity='blocked' or 'banned'
- [ ] Screen on investor entity creation - check entity name and tax_id
- [ ] Screen on subscription creation - check investor against blacklist
- [ ] Log all matches to `blacklist_matches` table
- [ ] Generate compliance alert (from Uma) when match found
- [ ] Typecheck passes

---

### US-007: Create Admin Agents Overview Page
**Description:** As CEO, I want a dedicated Agents section in admin so I can see all AI agents and their status.

**Acceptance Criteria:**
- [ ] Create route `/versotech_admin/agents/page.tsx` (replace placeholder)
- [ ] Display agent cards for all registered agents with: name, avatar, role, status, task count
- [ ] Show quick stats: pending tasks, alerts raised today, automations completed
- [ ] Navigation to Compliance Team subsection
- [ ] Typecheck passes
- [ ] Verify in browser using agent-browser skill (login as cto@versoholdings.com)

---

### US-008: Create Compliance Team Dashboard
**Description:** As CEO, I want a Compliance Team dashboard so I can see all compliance agent activity in one place.

**Acceptance Criteria:**
- [ ] Create route `/versotech_admin/agents/compliance/page.tsx`
- [ ] Display 3 agent cards (Uma, Valerie, Wayne) with their assigned tasks
- [ ] Show KPI cards: High Risk Investors, Expiring Documents, Blacklist Alerts, Pending Reviews
- [ ] Tabbed interface: Risk Profiles | Blacklist | KYC Monitor | Activity Log
- [ ] Typecheck passes
- [ ] Verify in browser using agent-browser skill

---

### US-009: Risk Profiles Tab
**Description:** As CEO, I want to view all investor and deal risk profiles so I can assess compliance exposure.

**Acceptance Criteria:**
- [ ] Table showing: Investor/Deal Name, Country, Risk Grade (with color badge), Last Calculated, View Details
- [ ] Filter by risk grade (A1, A2, A3, A4, B, C, D, E)
- [ ] Filter by entity type (investor/deal)
- [ ] Sort by risk grade (highest first by default)
- [ ] Click row to see calculation breakdown
- [ ] Manual "Recalculate" button to refresh score
- [ ] Typecheck passes
- [ ] Verify in browser using agent-browser skill

---

### US-010: Blacklist Management Tab
**Description:** As CEO, I want to manage the compliance blacklist so I can add, review, and resolve entries.

**Acceptance Criteria:**
- [ ] Table showing: Name/Email, Severity, Reason, Reported By, Date, Status, Actions
- [ ] "Add to Blacklist" button opens modal with fields: name, email, entity, reason, severity
- [ ] Edit existing entry (change severity, add notes, change status)
- [ ] View match history for each entry
- [ ] Filter by status (active/resolved/false_positive) and severity
- [ ] Typecheck passes
- [ ] Verify in browser using agent-browser skill

---

### US-011: KYC Monitor Tab (V002)
**Description:** As Valerie, I want to monitor KYC document status so I can follow up on expired or missing documents.

**Acceptance Criteria:**
- [ ] Includes all persona entities and member-level KYC submissions (investors + counterparty entities, partners, introducers, lawyers, commercial partners, arrangers)
- [ ] Source tables for coverage: `kyc_submissions` plus entity/member tables (investors, investor_members, partners, partner_members, introducers, introducer_members, commercial_partners, commercial_partner_members, lawyers, lawyer_members, arranger_entities, arranger_members, investor_counterparty, counterparty_entity_members)
- [ ] Table showing: Investor Name, Document Type, Status, Expiry Date, Days Until Expiry, Last Reminder Sent
- [ ] Filter by: Expiring Soon (30 days), Expired, Missing Required
- [ ] Highlight overdue documents in red
- [ ] "Send Reminder" action button (creates notification from Valerie)
- [ ] Bulk select and send reminders
- [ ] Optional AI assist: OCR reads document, suggests expiry date with confidence; staff must confirm before saving
- [ ] Typecheck passes
- [ ] Verify in browser using agent-browser skill

---

### US-012: Compliance Q&A in Chat (W001)
**Description:** As Wayne, I want to handle compliance questions or issues in the existing chat so users can get help without leaving the platform.

**Acceptance Criteria:**
- [ ] Use existing messaging system only (no new chat stack)
- [ ] Compliance tags stored on existing conversation/message records (metadata)
- [ ] Compliance-related messages are flagged (metadata/tag) for Wayne to review/respond
- [ ] Provide a simple filter to show only compliance-tagged conversations
- [ ] If a persona has no chat access, route compliance questions to notifications instead
- [ ] Typecheck passes
- [ ] Verify in browser using agent-browser skill

---

### US-013: Compliance Activity Log (W002)
**Description:** As Wayne, I want a compliance log that captures events, messages, emails, litigation cases, surveys, tax updates, voting, and other compliance signals.

**Acceptance Criteria:**
- [ ] Create `compliance_activity_log` table: id, event_type, description, related_investor_id, related_deal_id, agent_id, created_by, created_at, metadata
- [ ] Event types include: risk_calculated, blacklist_added, blacklist_match, document_expired, reminder_sent, nda_sent, nda_signed, compliance_question, survey_sent, tax_update, voting_event, litigation_event, compliance_enquiry
- [ ] Table showing: Timestamp, Event Type, Description, Related Entity, Agent, User
- [ ] Filter by event type and date range
- [ ] Manual log entry form for events not auto-captured
- [ ] Typecheck passes
- [ ] Verify in browser using agent-browser skill

---

### US-014: Compliance Enquiry Intake (W003)
**Description:** As Wayne, I want to record new compliance enquiries and alert Admin when new solutions, modules, or forms are required.

**Acceptance Criteria:**
- [ ] Create an "Add Enquiry" action that logs a `compliance_enquiry` event in `compliance_activity_log`
- [ ] Capture: enquiry summary, requested change (module/form/process), urgency, and requester persona
- [ ] Notify CEO/Admin with a task or notification when a new enquiry is logged
- [ ] Typecheck passes
- [ ] Verify in browser using agent-browser skill

---

### US-015: Agent Task Assignment Configuration
**Description:** As CEO, I want to configure which agent handles which task type so I can customize the system.

**Acceptance Criteria:**
- [ ] Settings page or modal showing all task types and their assigned agents
- [ ] Dropdown to reassign any task to a different agent
- [ ] Changes take effect immediately for new notifications
- [ ] Audit log of assignment changes
- [ ] Typecheck passes
- [ ] Verify in browser using agent-browser skill

---

### US-016: Agent-Branded Notifications
**Description:** As the system, I want to send notifications branded with agent personas so communications feel personal.

**Acceptance Criteria:**
- [ ] Create `agent_notifications` table or extend existing notification system with agent_id
- [ ] Notifications display agent name and avatar: "Valerie LEMOINE: Your passport expires in 30 days"
- [ ] Notification types mapped to agents per `agent_task_assignments`
- [ ] Existing KYC expiry notifications now come "from Valerie"
- [ ] Risk alerts come "from Uma"
- [ ] Compliance enquiry responses come "from Wayne"
- [ ] Works across all personas; respects existing notification routing rules
- [ ] Typecheck passes
- [ ] Verify in browser using agent-browser skill

---

### US-017: NDA Automation Enhancement (V001)
**Description:** As Valerie, I want NDA workflow notifications to be branded with my persona so investors receive personalized compliance communications.

**Note:** The NDA system is already implemented. This story focuses on branding existing notifications with Valerie's persona.

**Acceptance Criteria:**
- [ ] Update existing NDA notifications to include agent_id (Valerie)
- [ ] Notifications display Valerie's name and avatar at each stage (sent, viewed, signed, fully_executed)
- [ ] Log NDA modification requests with investor comments (if not already implemented)
- [ ] Verify dataroom access is auto-granted on full NDA execution (existing behavior)
- [ ] Typecheck passes

---

### US-018: OFAC Screening Foundation (U001)
**Description:** As Uma, I want to screen entities against OFAC so I can identify sanctioned individuals.

**Acceptance Criteria:**
- [ ] Create `ofac_screenings` table: id, screened_entity_type, screened_entity_id, screened_name, screening_date, result (clear/match/potential_match), match_details, report_url
- [ ] Manual "Screen Now" button on investor/entity detail pages
- [ ] Manual process: staff searches official OFAC list, downloads/exports the PDF, and uploads it to the screening record
- [ ] Results logged and viewable in Compliance Activity Log
- [ ] If match found, auto-add to blacklist with severity='blocked' and source='ofac'
- [ ] Notification (from Uma) to CEO when OFAC match found
- [ ] Typecheck passes

**Note:** Full OFAC API integration is future scope. MVP is manual screening with structured results storage.

---

---

### US-019: Notifications & Messaging UX Hardening (Pre-Req)
**Description:** As a user, I need notifications and messaging to be easy to find and reliable so compliance workflows don't get blocked by UI friction.

**Acceptance Criteria:**
- [x] Bell dropdown includes a clear "Open notifications" button (no duplicate links)
- [x] Notification previews wrap to 2 lines (no chopped text)
- [x] Notifications page supports persona filtering and shows compliance items for staff/CEO
- [x] No new sidebar navigation entries for notifications
- [ ] Unread count uses existing `/api/notifications/counts` data (no schema changes)
- [x] Messaging scroll: conversation list and chat window scroll independently; composer always visible without page scroll
- [x] Auto-scroll only if user is near the bottom; never yank them while reading history
- [ ] Do not change existing routes, access control, or chat stack; reuse current messaging tables/components
- [ ] Typecheck passes

---

### US-020: Compliance Documentation & Suitability Questionnaire (V003)
**Description:** As Valerie, I want to archive compliance documentation and run the annual suitability questionnaire so records stay current.

**Acceptance Criteria:**
- [ ] Archive all signed legal documents per user/entity (reuse existing Documents module)
- [ ] Annual suitability questionnaire is in-app only (no email); delivered via notification + dashboard reminder
- [ ] Track questionnaire status per persona/entity (sent, in_progress, completed)
- [ ] Reminders are branded from Valerie
- [ ] Typecheck passes

---

## Functional Requirements

### Agent System
- FR-1: System must maintain a registry of AI agents with name, role, avatar, and status
- FR-2: Each notification/task type must be assignable to exactly one agent
- FR-3: CEO must be able to reassign task types to different agents
- FR-4: All agent-generated communications must display agent name and avatar
- FR-4b: If an assigned agent is inactive, route to a fallback agent (default: Uma) or mark unassigned and alert CEO

### Risk Profile System
- FR-5: System must store risk scoring matrices for countries (159), industries (11), and investment types (64)
- FR-6: System must calculate composite risk grade for each investor based on country + PEP status + sanctions status
- FR-7: System must calculate composite risk grade for each deal based on country + industry + investment type
- FR-8: Risk profiles must auto-recalculate when underlying data changes
- FR-9: Risk calculation must log inputs as JSONB for audit trail

### Blacklist System
- FR-10: System must maintain blacklist with email, name, entity, tax_id matching
- FR-11: System must screen users on signup, entity creation, and subscription
- FR-12: Blacklist matches must be logged with confidence scores
- FR-13: Blocked/banned users must be prevented from proceeding with flagged action

### KYC Monitoring
- FR-14: System must track document expiry dates and alert before expiration
- FR-15: System must allow bulk reminder sending for expiring documents
- FR-16: All reminders must be branded with Valerie's persona
- FR-16b: KYC monitoring must cover all persona entities and member-level submissions (investors, counterparty entities, partners, introducers, lawyers, commercial partners, arrangers)

### Activity Logging (W001)
- FR-17: All compliance events must be logged with timestamp, type, and related entities
- FR-18: CEO must be able to filter and search compliance activity log
- FR-19: Compliance Q&A from chatbox must be flagged for Wayne to review
- FR-20: Manual event logging must be supported for non-automated events

### Suitability Questionnaire (V003)
- FR-21: Annual suitability questionnaire must be in-app only with notifications (no email)
- FR-22: Questionnaire status must be tracked per persona/entity
- FR-23: Reminders must be branded from Valerie

### Compliance Enquiry Intake (W003)
- FR-24: New compliance enquiries must be logged in `compliance_activity_log`
- FR-25: Each enquiry must alert CEO/Admin (notification or task)

---

## Non-Goals (Out of Scope)

- **OFAC API Integration** - MVP uses manual screening; automated API integration is future phase
- **AI Auto-Responses in Chat** - Wayne uses existing messaging inbox; no chatbot or auto-reply engine
- **Email Communications from Agents** - In-app notifications only; email integration is future
- **Machine Learning Risk Scoring** - Risk uses static matrices from Excel, not ML models
- **User Wealth Profiling** - Not part of Compliance Team scope in this PRD
- **Annual Issuer Reports** - Not part of Compliance Team scope in this PRD
- **Analytics/Management Team Agents** - Only Compliance Team (Uma, Valerie, Wayne) in this PRD
- **Mobile Push Notifications** - Web/in-app only
- **Multi-language Agent Communications** - English only

---

## Design Considerations

### Agent Personas
- Each agent should have a professional avatar (stock photo or generated)
- Consistent avatar displayed in all contexts (notifications, dashboard, logs)
- Agent "voice" should be professional but approachable

### Risk Grade Visualization
- Use color-coded badges matching Excel spec:
  - A1: Capital Preservation (Dark Green)
  - A2: Very Low Risk (Green)
  - A3: Low Risk (Light Green)
  - A4: Moderate Risk (Yellow)
  - B: Elevated Risk (Orange)
  - C: High Risk (Red)
  - D: Very High Risk (Dark Red)
  - E: Extreme / Speculative (Black)
- Consistent color usage across all risk displays

### Admin Dashboard Layout
- Follow existing admin patterns (cards, tables, tabs)
- Agent cards should be visually prominent
- Quick stats should highlight items needing attention (red badges for alerts)

---

## Technical Considerations

### Database
- New tables: `ai_agents`, `agent_task_assignments`, `risk_grades`, `country_risks`, `industry_risks`, `investment_type_risks`, `investor_risk_profiles`, `deal_risk_profiles`, `compliance_blacklist`, `blacklist_matches`, `compliance_activity_log`, `ofac_screenings`
- Foreign keys to existing: `investors`, `deals`, `auth.users`
- RLS policies restricting UI access to CEO persona; system jobs run with service role and are audited
- No new fields on existing deal/investor records for country or investment type; use mapping tables and store normalized values in risk profile records

### API Routes
- `/api/admin/agents/*` - Agent management
- `/api/admin/agents/compliance/*` - Compliance-specific endpoints
- `/api/admin/compliance/risk-profiles/*` - Risk profile CRUD
- `/api/admin/compliance/blacklist/*` - Blacklist CRUD
- `/api/admin/compliance/activity-log/*` - Activity log queries

### Existing Integration Points
- `investors` table - source for risk calculation (country, is_pep, is_sanctioned)
- `deals` table - source for deal risk calculation (sector)
- `kyc_submissions` table - source for document expiry tracking across all persona entities and members
- Notification system - extend with agent branding
- NDA/signature system - enhance for V001 automation
- Messaging system (`conversations`, `messages`, `conversation_participants`) - use for Compliance Q&A without new providers

### Performance
- Risk calculations should complete in <500ms
- Blacklist screening should not add >100ms to user actions
- Dashboard queries should use pagination for large datasets

---

## Success Metrics

- All 9 Compliance Team tasks (U001-U003, V001-V003, W001-W003) implemented and functional
- 100% of investors have calculated risk profiles
- 100% of active deals have calculated risk profiles
- Blacklist screening triggers on all specified user actions
- CEO can view complete compliance status in single dashboard
- All compliance notifications display correct agent persona
- Task reassignment works correctly (notifications switch to new agent)
- Annual suitability questionnaire distributed in-app to all active users (V003)
- Compliance activity log captures all key events (W002)
- Compliance enquiries are logged and routed to Admin (W003)

---

## Resolved Decisions

1. **Agent Avatars** → Use the stock photos from the PDF (extract and store the actual photos shown in the AI Agents presentation)
2. **Risk Calculation Frequency** → All three triggers: auto on data change + daily batch job + manual "Recalculate" button
3. **Blacklist Fuzzy Matching** → 90% strict threshold (fewer false positives, prioritize precision)
4. **NDA Auto-Generation** → Already implemented - existing NDA system supports this workflow
5. **Historical Risk Tracking** → Full history - keep every risk calculation as a new row for complete audit trail
6. **Annual Suitability Questionnaire** → In-app only with notification + dashboard reminder (no email)

---

## Appendix: Risk Scoring Formula

### Investor Risk Score
```
total_points = country_risk_points
             + (is_pep ? 10 : 0)
             + (is_sanctioned ? 20 : 0)

composite_grade =
  total_points <= 0  → A1
  total_points <= 1  → A2
  total_points <= 2  → A3
  total_points <= 3  → A4
  total_points <= 5  → B
  total_points <= 10 → C
  total_points <= 15 → D
  total_points > 15  → E
```

### Deal Risk Score
```
total_points = country_risk_points + industry_risk_points + investment_type_risk_points
composite_grade = (same mapping as above)
```

---

## Appendix: Data to Import from Excel

### Risk Grades (8 rows)
| Code | Label | Points |
|------|-------|--------|
| A1 | Very Low Risk | 0 |
| A2 | Low Risk | 1 |
| A3 | Satisfactory Risk | 2 |
| A4 | Appropriate Risk | 3 |
| B | Rather High Risk | 5 |
| C | High Risk | 10 |
| D | Very High Risk | 15 |
| E | Extreme Risk | 20 |

### Sample Country Risks (159 total)
| Country | Country Risk | Business Climate |
|---------|--------------|------------------|
| United States | A2 | A1 |
| United Kingdom | A3 | A1 |
| Germany | A3 | A1 |

### Investment Types (64 total)
Stored as Investment Type + Key Risk Drivers + Risk Grade from Excel.
| France | A3 | A1 |
| UAE | A2 | A2 |
| Brazil | B | A4 |
| China | B | B |
| Russia | D | D |
| Venezuela | E | E |

### Industry Risks (11 GICS Sectors)
| Sector | Risk Grade |
|--------|------------|
| Consumer Staples | A3 |
| Health Care | A3 |
| Utilities | A3 |
| Information Technology | A4 |
| Financials | B |
| Materials | B |
| Industrials | B |
| Consumer Discretionary | B |
| Communication Services | B |
| Real Estate | B |
| Energy | C |

### Sample Investment Type Risks (40+ total)
| Investment Type | Risk Grade |
|-----------------|------------|
| Sovereign bonds (AAA-AA) | A1-A2 |
| Money market funds | A1-A2 |
| Investment-grade corporate bonds | A3 |
| Developed market equities | A4 |
| Private equity - buyout | B |
| Venture capital (early stage) | C-D |
| Cryptoassets (BTC/ETH) | D |
| Altcoins / DeFi | E |
