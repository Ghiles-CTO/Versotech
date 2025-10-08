# Process Center Implementation Summary

## Overview

The Process Center has been completely redesigned with a scalable, professional architecture that supports unlimited processes without cluttering the UI. The new design features category-based navigation, side drawer interfaces, and real database integration.

## What Was Implemented

### 1. **Updated Workflow Data Structure** ✅
- **File**: `versotech-portal/src/lib/workflows.ts`
- Added support for new field types: `investor_select`, `vehicle_select`, `conversation_select`
- Added conditional field rendering with `dependsOn` and `showWhen` properties
- Added `triggerType` to workflows: `manual`, `scheduled`, or `both`
- Added `detailedDescription` for rich process descriptions in drawers
- Created `categoryMetadata` for beautiful category cards
- Updated all 9 process definitions with complete schemas

### 2. **New UI Components** ✅

#### Sheet Component
- **File**: `versotech-portal/src/components/ui/sheet.tsx`
- Professional side drawer using Radix UI Dialog primitive
- Smooth animations and backdrop overlay
- Dark theme compatible

#### Process Category Card
- **File**: `versotech-portal/src/components/staff/process-category-card.tsx`
- Beautiful gradient cards with glassmorphism effects
- Shows process count per category
- Hover effects and smooth transitions
- Click to open category processes

#### Process Form Builder
- **File**: `versotech-portal/src/components/staff/process-form-builder.tsx`
- Dynamic form rendering based on workflow schema
- Special field types with database integration:
  - `investor_select`: Fetches from `/api/staff/investors`
  - `vehicle_select`: Fetches from `/api/staff/vehicles`
  - `conversation_select`: Fetches from `/api/conversations`
- Conditional field rendering (e.g., Inbox Manager email vs messaging)
- Real-time validation and error display
- Dark theme styling

#### Process Drawer
- **File**: `versotech-portal/src/components/staff/process-drawer.tsx`
- Full-height side drawer with tabs:
  - **Configure**: Process form and trigger button
  - **Schedule**: Placeholder for scheduling (coming soon)
  - **History**: Recent execution runs
- Shows detailed process description
- Role and trigger type badges
- Recent runs with status indicators

#### Process Center Client
- **File**: `versotech-portal/src/components/staff/process-center-client.tsx`
- Main orchestration component
- Stats cards showing total processes, categories, and user access
- Category cards grid
- Nested drawer system (category drawer → process drawer)
- Getting started guide

### 3. **API Routes for Dropdowns** ✅

#### Investors API
- **File**: `versotech-portal/src/app/api/staff/investors/route.ts`
- Returns: `{ investors: [{ id, legal_name, email, status, investor_type }] }`
- Supports search with `?search=query`
- Staff role verification
- Limited to 50 results

#### Vehicles API
- **File**: `versotech-portal/src/app/api/staff/vehicles/route.ts`
- Returns: `{ vehicles: [{ id, name, vehicle_type, status, currency }] }`
- Supports investor filtering with `?investor_id=xxx`
- Staff role verification
- Filters to vehicles where investor has holdings

### 4. **Redesigned Processes Page** ✅
- **File**: `versotech-portal/src/app/(staff)/versotech/staff/processes/page.tsx`
- Simplified to server component that fetches profile
- Delegates to ProcessCenterClient for UI

### 5. **Database Migration** ✅
- **File**: `versotech-portal/database/migrations/018_update_workflow_seeds.sql`
- Updates all 9 workflow definitions with new schemas
- Adds `trigger_type` column to workflows table
- Seeds workflows with complete field configurations

## Process Definitions

### 1. Position Statement (Manual)
- **Category**: Documents
- **Fields**: Investor (select), Vehicle (select, optional), As of Date
- **Role**: staff_ops

### 2. NDA Agent (Manual)
- **Category**: Compliance
- **Fields**: Investor Email, Investment Type, NDA Template (select)
- **Role**: staff_rm

### 3. Shared Drive Notification (Scheduled)
- **Category**: Communications
- **Fields**: Document Category (select), Notification Group (select)
- **Role**: staff_ops

### 4. Inbox Manager (Both)
- **Category**: Communications
- **Fields**: 
  - Inbox Type (email/versotech_messaging)
  - Command/Action
  - Email Subject (conditional on email)
  - Conversation (conditional on versotech_messaging)
- **Role**: staff_ops

### 5. LinkedIn Leads Scraper (Manual)
- **Category**: Data Processing
- **Fields**: LinkedIn Search URL, Purpose (linkedin_outreach/cold_email_campaign)
- **Role**: staff_rm

### 6. Reporting Agent (Both)
- **Category**: Documents
- **Fields**: Report Category, Investor (select), Vehicle (select), Frequency, Include Charts (checkbox)
- **Role**: staff_rm

### 7. KYC/AML Processing (Manual)
- **Category**: Compliance
- **Fields**: Investor (select), Investor Type, Jurisdiction, Enhanced DD (checkbox)
- **Role**: staff_admin

### 8. Capital Call Processing (Manual)
- **Category**: Communications
- **Fields**: Vehicle (select), Call Percentage, Due Date, Wire Deadline
- **Role**: staff_admin
- **Required Title**: bizops

### 9. Investor Onboarding (Manual)
- **Category**: Multi-Step
- **Fields**: Investor Email, Investment Amount, Target Vehicle (select), Investor Type
- **Role**: staff_ops

## How to Use

### 1. Run Database Migration

```bash
cd versotech-portal/database
psql -h YOUR_HOST -U YOUR_USER -d YOUR_DB -f migrations/018_update_workflow_seeds.sql
```

Or apply via Supabase Dashboard SQL Editor.

### 2. Access the Process Center

Navigate to: `/versotech/staff/processes`

### 3. Using Processes

1. **View Categories**: Click any category card to see available processes
2. **Select Process**: Click a process to open the configuration drawer
3. **Configure**: Fill in the required fields (uses real database data for dropdowns)
4. **Trigger**: Click the trigger button to execute the workflow
5. **View History**: Switch to the History tab to see recent runs

### 4. Conditional Fields Example

The Inbox Manager process demonstrates conditional fields:
- Select "email" → Email Subject field appears
- Select "versotech_messaging" → Conversation selector appears

## Architecture Benefits

1. **Scalable**: Add unlimited processes without UI clutter
2. **Professional**: Beautiful dark theme with glassmorphism effects
3. **Database-Integrated**: Real data in all dropdowns
4. **Conditional Logic**: Show/hide fields based on other selections
5. **Role-Based**: Respects staff roles and title requirements
6. **History Tracking**: Recent runs displayed per process
7. **Deep Linking**: URL-based state for sharing links to specific processes

## Dark Theme Styling

All components follow these standards:
- Background: `bg-black` or `bg-white/5`
- Borders: `border-white/10`
- Text: `text-foreground` (white), `text-muted-foreground` (gray)
- Hover: `hover:bg-white/10`, `hover:border-white/20`
- Glassmorphism: `backdrop-blur-sm`

## Future Enhancements

1. **Schedule Tab**: Cron expression builder for scheduled processes
2. **Workflow Status**: Real-time n8n execution updates
3. **Bulk Actions**: Trigger multiple instances at once
4. **Templates**: Save and reuse common configurations
5. **Analytics**: Process execution metrics and dashboards

## Testing Checklist

- [ ] Run migration 018_update_workflow_seeds.sql
- [ ] Verify all 9 processes appear in categories
- [ ] Test investor dropdown loads data
- [ ] Test vehicle dropdown loads data
- [ ] Test conditional fields in Inbox Manager
- [ ] Trigger a test workflow and verify API call
- [ ] Check recent runs appear in History tab
- [ ] Verify role-based access (staff_admin vs staff_ops)
- [ ] Test on mobile/tablet responsive layouts

## Troubleshooting

### Dropdowns show "Loading..." indefinitely
- Check that API routes are accessible
- Verify database has investor and vehicle data
- Check browser console for errors

### Workflow trigger fails
- Ensure n8n webhook URLs are configured in database
- Check N8N_WEBHOOK_SECRET environment variable is set
- Verify staff user has correct role/title

### Conditional fields don't appear/disappear
- Check `dependsOn` and `showWhen` values match exactly
- Verify parent field value is being set correctly

## Files Modified/Created

**New Files:**
- `versotech-portal/src/components/ui/sheet.tsx`
- `versotech-portal/src/components/staff/process-category-card.tsx`
- `versotech-portal/src/components/staff/process-drawer.tsx`
- `versotech-portal/src/components/staff/process-form-builder.tsx`
- `versotech-portal/src/components/staff/process-center-client.tsx`
- `versotech-portal/src/app/api/staff/investors/route.ts`
- `versotech-portal/src/app/api/staff/vehicles/route.ts`
- `versotech-portal/database/migrations/018_update_workflow_seeds.sql`

**Modified Files:**
- `versotech-portal/src/lib/workflows.ts`
- `versotech-portal/src/app/(staff)/versotech/staff/processes/page.tsx`

**Deprecated (can be removed later):**
- `versotech-portal/src/components/staff/process-trigger.tsx`

## Summary

The Process Center has been transformed from a grid of individual process cards into a professional, scalable system with:

- ✅ 5 category cards organizing 9 processes
- ✅ Side drawer navigation (category → process)
- ✅ Dynamic forms with database-integrated dropdowns
- ✅ Conditional field rendering
- ✅ Real-time validation
- ✅ Execution history tracking
- ✅ Beautiful dark theme UI
- ✅ Role-based access control
- ✅ Mobile-responsive design

The implementation is complete and ready for testing!

