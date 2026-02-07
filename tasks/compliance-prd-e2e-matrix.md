# Compliance PRD E2E Matrix

Date: 2026-02-07
Branch: `dev`
Scope source: `tasks/prd-ai-agents-compliance-team.md`

## Result Scale
- `PASS`: UI/API/DB evidence captured
- `PARTIAL`: feature exists but one required proof missing
- `FAIL`: broken behavior or missing requirement
- `NOT RUN`: not executed yet

## User Story Coverage

| User Story | What Must Be Proven | Test Method | Evidence | Result |
|---|---|---|---|---|
| US-001 Agent registry | tables, seed agents, assignments, RLS path | DB schema + data query | `ai_agents=3`, `agent_task_assignments=9`, required tables exist in both `versotech-dev` and `versotech-prod` | PASS |
| US-002 Risk matrices import | grades/countries/sectors/investment types loaded | DB counts query | `country_risks=159`, `industry_risks=11`, `investment_type_risks=51`, `risk_grades=8` | PASS |
| US-003 Investor risk calc | function output + history/current view + trigger path | DB function + update-trigger replay | function exists, `investor_risk_profiles_current=404`; replayed investor update trigger and captured new profile row for `fbb82377-3253-4d88-9180-3c81ee1845b8` at `2026-02-07 15:49:30+00` | PASS |
| US-004 Deal risk calc | function output + mapping behavior | DB function + update-trigger replay | function exists and trigger replay verified: updating `deals.stock_type` (`common -> preferred -> common`) for `d52d0d1c-e2e0-438c-9798-b9eb3a847638` produced new `deal_risk_profiles` rows and refreshed `calculated_at` (`2026-02-07 17:25:58+00`, `17:26:05+00`) | PASS |
| US-005 Blacklist system | tables + matching function | DB schema + function call | fixed `screen_against_blacklist` ambiguity; function now returns exact/fuzzy matches in `versotech-dev`; migration applied to both DBs | PASS |
| US-006 Blacklist screening hooks | signup/entity/subscription hooks log alerts | DB trigger replay + match log query | created test investor with blacklisted email and captured fresh `blacklist_matches` row `ecb44180-6b30-48fb-922e-ee2b7443bdde` (`email_exact`, confidence `1.000`) | PASS |
| US-007 Agents overview UI | cards/stats render in admin agents | UI walkthrough | `screenshots/compliance_e2e_20260207_agentbrowser/01_agents_risk.png` | PASS |
| US-008 Compliance dashboard UI | KPI + tabs available | UI walkthrough | `screenshots/compliance_e2e_20260207_agentbrowser/01_agents_risk.png` | PASS |
| US-009 Risk profiles tab | filters/sort/detail/recalculate | UI + recalc action + DB log | `screenshots/compliance_e2e_20260207_agentbrowser/10_risk_recalc.png`, `compliance_activity_log.event_type='risk_calculated'` | PASS |
| US-010 Blacklist tab | add/edit/filter/match history | UI action + DB row | `screenshots/compliance_e2e_20260207_agentbrowser/03_blacklist_create_success.png`, inserted row `agentbrowser.test+compliance@versotech.dev` | PASS |
| US-011 KYC monitor tab | all persona rows/filter/reminders/bulk + AI expiry suggest/confirm | UI actions + DB notification + metadata update | `screenshots/compliance_e2e_20260207_agentbrowser/04_kyc_tab.png`, `05_kyc_reminder_success.png`, `29_kyc_ai_confirmed.png`; reminder notifications verified, AI suggestion metadata stored, and confirm action verified (`kyc_submissions.expiry_date` + `documents.document_expiry_date` updated, `compliance_activity_log.event_type='kyc_expiry_confirmed'`) | PASS |
| US-012 Compliance Q&A in chat | compliance-tagged thread flow on existing chat | UI chat + flagged metadata | `screenshots/compliance_e2e_20260207_agentbrowser/09_messages_compliance_filter.png`, `conversations.metadata.compliance.flagged=true` | PASS |
| US-012A AI chat assistant | AI-labeled reply + trace + escalation | UI/API send + DB message metadata/log | AI message metadata (`ai_generated=true`,`source=compliance_assistant`,`assistant_name=Wayne`) + escalation notifications and log rows present | PASS |
| US-013 Activity log | manual + auto events visible and persisted | UI + DB event rows | `screenshots/compliance_e2e_20260207_agentbrowser/06_activity_tab.png`; confirmed `compliance_enquiry`, `agent_assignment_change`, `ofac_screening`, `survey_sent`, `nda_modification_request` events in `compliance_activity_log` | PASS |
| US-014 Enquiry intake | log enquiry and CEO notification | UI form + DB notification | `screenshots/compliance_e2e_20260207_agentbrowser/14_enquiry_logged.png`; logged `compliance_enquiry` and generated CEO/Admin notifications titled `Compliance enquiry logged` (Wayne `agent_id`) | PASS |
| US-015 Task assignment config | update assignment and persist | UI update + DB assignment row | `screenshots/compliance_e2e_20260207_agentbrowser/15_assignment_changed_u001_to_wayne.png`, `16_assignment_reverted_u001_to_uma.png`; assignment changes persisted and audit events logged | PASS |
| US-016 Agent-branded notifications | notification from assigned agent identity | UI notification + DB row agent_id | `investor_notifications` rows for KYC/compliance include `agent_id` | PASS |
| US-017 NDA enhancement | status automation/logging path | UI/API + DB smoke | created NDA modification request (`request_tickets.id=9253517f-7418-4459-a79c-655002e04f17`), captured `nda_modification_request` logs/notifications from Valerie, and verified NDA completion path (`deal_activity_events.event_type='nda_completed'`, `deal_data_room_access.auto_granted=true`) | PASS |
| US-018 OFAC foundation | log manual check + report link + potential match flow | UI form + DB rows | `screenshots/compliance_e2e_20260207_agentbrowser/18_ofac_modal_open.png`, `19_ofac_logged.png`, `22_ofac_match_logged.png`; verified `ofac_screenings` rows (`potential_match`,`match`) and auto-blacklist creation on match | PASS |
| US-019 UX hardening | notification access and chat usability constraints | UI walkthrough | bell dropdown + page access verified (`20_bell_dropdown.png`, `21_notifications_page.png`, `26_notifications_page_filters.png`, `27_notifications_compliance_tab.png`); existing messaging flow retained with compliance filters (`09_messages_compliance_filter.png`) | PASS |
| US-020 Compliance docs/suitability | annual survey lifecycle and status update | UI + DB activity/notifications | `screenshots/compliance_e2e_20260207_agentbrowser/23_kyc_tab_for_survey.png`, `24_survey_sent_row.png`; `survey_sent` logged and annual suitability notification sent from Valerie (`agent_id=1f92778f-a8fc-4e5f-bec9-665ec12fe325`) | PASS |
