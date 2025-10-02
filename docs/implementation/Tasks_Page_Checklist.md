# Tasks Page Implementation Checklist

Quick reference checklist for implementing the Tasks & Onboarding page.

**Status Legend:**
- ⬜ Not Started
- 🟡 In Progress
- ✅ Complete
- ⚠️ Blocked

---

## Phase 1: Database Foundation (2-3 days)

### 1.1 Extend Tasks Table Schema
- ⬜ Create migration file `007_tasks_schema_enhancement.sql`
- ⬜ Add missing columns (owner_investor_id, category, title, description, priority, etc.)
- ⬜ Add check constraints for enums
- ⬜ Create 5 indexes for performance
- ⬜ Add auto-update trigger for updated_at
- ⬜ Test migration on local database
- ⬜ Verify constraints prevent invalid data

### 1.2 Create Supporting Tables
- ⬜ Create migration file `008_task_supporting_tables.sql`
- ⬜ Create task_templates table
- ⬜ Create task_actions table
- ⬜ Create task_dependencies table
- ⬜ Add foreign key relationships
- ⬜ Create indexes
- ⬜ Test self-referencing dependency constraint

### 1.3 Implement RLS Policies
- ⬜ Create migration file `009_tasks_rls_policies.sql`
- ⬜ Enable RLS on all task tables
- ⬜ Create investor read policy
- ⬜ Create staff read policy
- ⬜ Create update policies
- ⬜ Create insert policies (staff only)
- ⬜ Test with investor user (should see only own tasks)
- ⬜ Test with staff user (should see all tasks)

### 1.4 Automation Functions
- ⬜ Create migration file `010_task_automation_functions.sql`
- ⬜ Create create_tasks_from_templates() function
- ⬜ Create mark_overdue_tasks() function
- ⬜ Create unlock_dependent_tasks() function
- ⬜ Add trigger for auto-unlock
- ⬜ Add function comments/documentation
- ⬜ Test template creation (no duplicates)
- ⬜ Test overdue marking
- ⬜ Test dependency unlock

**Phase 1 Exit Criteria:**
- ✅ All migrations run successfully
- ✅ RLS policies tested with both investor and staff users
- ✅ Functions execute without errors
- ✅ Database ready for data layer integration

---

## Phase 2: Data Layer (1-2 days)

### 2.1 Server-Side Data Fetching
- ⬜ Update `versotech-portal/src/app/(investor)/versoholdings/tasks/page.tsx`
- ⬜ Convert to async Server Component
- ⬜ Import Supabase server client
- ⬜ Fetch current user
- ⬜ Fetch investor entity relationships
- ⬜ Build query with investor filter
- ⬜ Fetch tasks with related entities (documents, deals)
- ⬜ Implement sorting (priority DESC, due_at ASC)
- ⬜ Calculate category progress
- ⬜ Separate pending/completed tasks
- ⬜ Pass data to client component
- ⬜ Test with real database data

### 2.2 Create Client Component
- ⬜ Create `versotech-portal/src/app/(investor)/versoholdings/tasks/tasks-page-client.tsx`
- ⬜ Mark with 'use client' directive
- ⬜ Accept server data as props
- ⬜ Move UI rendering logic from page.tsx
- ⬜ Create helper functions (getStatusIcon, getStatusColor, etc.)
- ⬜ Render category summary cards
- ⬜ Render pending tasks list
- ⬜ Render completed tasks list
- ⬜ Add empty state
- ⬜ Test UI with real data
- ⬜ Verify responsive layout

**Phase 2 Exit Criteria:**
- ✅ Page loads with database data (not mock data)
- ✅ Category progress calculates correctly
- ✅ Tasks display in correct order
- ✅ Related entities show properly
- ✅ Empty states work

---

## Phase 3: API Routes (2-3 days)

### 3.1 Task Completion Endpoint
- ⬜ Create `versotech-portal/src/app/api/tasks/[id]/complete/route.ts`
- ⬜ Implement PATCH handler
- ⬜ Add authentication check
- ⬜ Parse completion_reason from body
- ⬜ Update task with completed status
- ⬜ Record completed_at and completed_by
- ⬜ Create activity feed entry (if applicable)
- ⬜ Return updated task
- ⬜ Test with Postman/curl
- ⬜ Verify RLS policies enforced

### 3.2 Task Status Update Endpoint
- ⬜ Create `versotech-portal/src/app/api/tasks/[id]/route.ts`
- ⬜ Implement PATCH handler
- ⬜ Define allowed status transitions
- ⬜ Add authentication check
- ⬜ Fetch current task
- ⬜ Validate status transition
- ⬜ Update task with new status
- ⬜ Auto-populate completion metadata
- ⬜ Return updated task
- ⬜ Test invalid transitions (should fail)
- ⬜ Test valid transitions

### 3.3 Bulk Operations (Staff Only)
- ⬜ Create `versotech-portal/src/app/api/tasks/bulk-complete/route.ts`
- ⬜ Implement POST handler
- ⬜ Add authentication check
- ⬜ Verify staff role
- ⬜ Parse task_ids array
- ⬜ Bulk update tasks
- ⬜ Return count and updated tasks
- ⬜ Test with staff user (should succeed)
- ⬜ Test with investor user (should fail 403)

### 3.4 Webhook Handler
- ⬜ Create `versotech-portal/src/app/api/webhooks/task-completion/route.ts`
- ⬜ Implement POST handler
- ⬜ Add HMAC signature verification
- ⬜ Parse webhook payload
- ⬜ Update task from external event
- ⬜ Link related entity (document, envelope, etc.)
- ⬜ Return success response
- ⬜ Add environment variable for WEBHOOK_SECRET
- ⬜ Test with valid signature
- ⬜ Test with invalid signature (should fail 401)

**Phase 3 Exit Criteria:**
- ✅ All endpoints accessible and functional
- ✅ Authentication/authorization working
- ✅ RLS policies respected
- ✅ Webhook signature verification works
- ✅ API documented

---

## Phase 4: Client Interactivity (3-4 days)

### 4.1 Real-Time Subscriptions
- ⬜ Update `tasks-page-client.tsx` with real-time logic
- ⬜ Add useState for pending/completed tasks
- ⬜ Add useEffect for Supabase channel subscription
- ⬜ Subscribe to tasks table changes
- ⬜ Handle UPDATE events (move between pending/completed)
- ⬜ Handle INSERT events (add new tasks)
- ⬜ Recalculate category progress on changes
- ⬜ Add cleanup on unmount
- ⬜ Test: Update task in DB → UI updates immediately
- ⬜ Test: Insert task in DB → appears in UI
- ⬜ Check for memory leaks

### 4.2 Task Action Buttons
- ⬜ Create `versotech-portal/src/components/tasks/task-action-button.tsx`
- ⬜ Accept taskId, taskStatus, taskActions props
- ⬜ Render appropriate icon based on action_type
- ⬜ Handle url_redirect action
- ⬜ Handle document_upload action (open modal)
- ⬜ Handle esign_flow action (redirect to signing URL)
- ⬜ Handle n8n_workflow action (trigger workflow)
- ⬜ Handle questionnaire action (navigate to form)
- ⬜ Add loading state
- ⬜ Create launchESignFlow helper function
- ⬜ Create launchWorkflow helper function
- ⬜ Test each action type

### 4.3 Document Upload Modal
- ⬜ Create `versotech-portal/src/components/tasks/document-upload-modal.tsx`
- ⬜ Use Dialog component from shadcn/ui
- ⬜ Add file input with accept filters
- ⬜ Implement file upload to Supabase Storage
- ⬜ Show upload progress bar
- ⬜ Create document record in database
- ⬜ Update task with completed status
- ⬜ Link task to document via related_entity_id
- ⬜ Show success state
- ⬜ Show error state with retry
- ⬜ Auto-close modal on success
- ⬜ Test upload flow end-to-end

### 4.4 Update Tasks List to Use Action Buttons
- ⬜ Import TaskActionButton in tasks-page-client.tsx
- ⬜ Replace generic button with TaskActionButton
- ⬜ Pass task data to button component
- ⬜ Handle onComplete callback (refresh data)
- ⬜ Test all action types from UI

**Phase 4 Exit Criteria:**
- ✅ Real-time updates working (<1 sec latency)
- ✅ All action buttons functional
- ✅ Document upload completes tasks
- ✅ E-sign flow redirects correctly
- ✅ No console errors or warnings

---

## Phase 5: Integrations & Automation (2-3 days)

### 5.1 Automated Task Creation
- ⬜ Create migration file `011_task_automation_triggers.sql`
- ⬜ Seed task_templates with initial templates
  - ⬜ onboarding_profile
  - ⬜ onboarding_bank_details
  - ⬜ kyc_individual
  - ⬜ compliance_nda
  - ⬜ deal_nda_signature
  - ⬜ investment_allocation_confirmation
- ⬜ Create trigger_onboarding_tasks() function
- ⬜ Add trigger on investors table INSERT
- ⬜ Create trigger_deal_invitation_tasks() function
- ⬜ Add trigger on deal_memberships INSERT
- ⬜ Test: Create investor → tasks auto-created
- ⬜ Test: Invite to deal → deal tasks created
- ⬜ Test: No duplicate tasks created

### 5.2 Overdue Detection Cron
- ⬜ Create `versotech-portal/src/app/api/cron/mark-overdue-tasks/route.ts`
- ⬜ Implement GET handler
- ⬜ Add cron secret authorization
- ⬜ Call mark_overdue_tasks() function
- ⬜ Log execution results
- ⬜ Return updated count
- ⬜ Add CRON_SECRET to environment variables
- ⬜ Configure vercel.json with cron schedule
- ⬜ Deploy and test cron execution
- ⬜ Monitor logs for hourly runs

### 5.3 Email Notifications (Optional)
- ⬜ Create `versotech-portal/src/lib/notifications/task-notifications.ts`
- ⬜ Set up Resend or email service
- ⬜ Create sendTaskCompletionEmail() function
- ⬜ Create sendOverdueTaskReminder() function
- ⬜ Design email templates (HTML)
- ⬜ Add unsubscribe links
- ⬜ Trigger on task completion
- ⬜ Trigger on overdue detection
- ⬜ Test email delivery
- ⬜ Add email preferences to user settings

### 5.4 Activity Feed Integration
- ⬜ Verify activity_feed table exists
- ⬜ Add task completion entries in API
- ⬜ Add task creation entries (optional)
- ⬜ Test activity feed displays task events

**Phase 5 Exit Criteria:**
- ✅ Tasks auto-create on signup/invitation
- ✅ Overdue tasks marked hourly
- ✅ Email notifications sent
- ✅ Activity feed tracking works
- ✅ Zero duplicate task creation

---

## Testing & QA

### Unit Tests
- ⬜ Test calculateProgress() function
- ⬜ Test status transition validation
- ⬜ Test task sorting logic
- ⬜ Test helper functions (getStatusIcon, etc.)

### Integration Tests
- ⬜ Test task creation from templates
- ⬜ Test dependency unlock on completion
- ⬜ Test webhook processing
- ⬜ Test real-time subscription updates

### E2E Tests
- ⬜ Complete onboarding flow (investor POV)
- ⬜ Upload document task → task completes
- ⬜ Sign document task → task completes
- ⬜ Staff bulk complete tasks
- ⬜ Real-time updates across browser tabs

### Security Tests
- ⬜ Verify RLS: Investor A cannot see Investor B tasks
- ⬜ Verify RLS: Investor cannot update staff tasks
- ⬜ Verify API: Non-staff cannot bulk complete
- ⬜ Verify webhook: Invalid signature rejected
- ⬜ SQL injection tests on API endpoints

---

## Deployment

### Pre-Deployment
- ⬜ Run all migrations on staging database
- ⬜ Test migrations rollback procedure
- ⬜ Seed task templates on staging
- ⬜ Test full flow on staging environment
- ⬜ Performance test (100+ concurrent users)
- ⬜ Review all environment variables set
- ⬜ Document API endpoints

### Deployment Steps
- ⬜ Create database backup
- ⬜ Run migrations on production
- ⬜ Verify migration success
- ⬜ Seed task templates
- ⬜ Deploy application code
- ⬜ Configure cron jobs
- ⬜ Set webhook secrets
- ⬜ Test production smoke tests
- ⬜ Monitor error logs for 24 hours

### Post-Deployment
- ⬜ Monitor task creation rates
- ⬜ Monitor API error rates
- ⬜ Check RLS policy violations (should be 0)
- ⬜ Verify cron executions
- ⬜ Collect initial user feedback
- ⬜ Document any issues/learnings

---

## Documentation

- ⬜ API endpoint documentation
- ⬜ Task template creation guide (for staff)
- ⬜ Troubleshooting guide
- ⬜ User guide (investor portal)
- ⬜ Admin guide (staff portal)
- ⬜ Database schema documentation
- ⬜ Webhook integration guide

---

## Success Metrics (Post-Launch)

### Week 1
- ⬜ >90% of new investors receive automated tasks
- ⬜ <5% task creation errors
- ⬜ Average task completion time measured

### Month 1
- ⬜ 50% reduction in manual reminder emails
- ⬜ >80% onboarding task completion rate
- ⬜ <10% overdue tasks older than 7 days

### Quarter 1
- ⬜ Average onboarding time <14 days
- ⬜ Investor satisfaction score >4.5/5
- ⬜ Zero RLS policy violations

---

## Known Issues / Technical Debt

_Track issues discovered during implementation here_

- [ ]
- [ ]
- [ ]

---

**Last Updated:** October 2, 2025
**Completion:** 0/150 tasks (0%)
