# Process Center Testing Guide

## ✅ All Visibility & Color Issues Fixed

### What Was Fixed:
1. **Category Cards**: Changed to `bg-zinc-900/80` with `border-white/20` (highly visible)
2. **All Text**: White text (`text-white`) for titles, `text-gray-300` for descriptions
3. **Input Fields**: `bg-zinc-900` with `border-white/30` (strong borders)
4. **Dropdowns**: `bg-zinc-900` background with white text and visible hover states
5. **Tabs**: `bg-zinc-900` with clear active states (`bg-zinc-800`)
6. **Badges**: Stronger colors with better opacity (`/30` backgrounds, `/50` borders)
7. **Buttons**: No black hover states - uses `bg-sky-500 hover:bg-sky-600`
8. **Close Button**: White X icon with `hover:bg-white/10`
9. **Empty States**: Gray text that's clearly visible

## 🧪 Testing Each Process (All 9)

### 1. Position Statement (Documents Category)
**What You Should See:**
- Category: "Document Generation" (blue gradient)
- Trigger Type: Manual
- Required Role: OPS

**Fields:**
- ✅ **Investor** (dropdown) - Should load 14 investors from database
  - Shows: Legal name + email
  - Example: "John Smith (john@example.com)"
- ✅ **Vehicle (Optional)** (dropdown) - Should load 10 vehicles
  - Shows: Vehicle name + type
  - Example: "VERSO FUND I (fund)"
- ✅ **As of Date** (date picker) - Select any date

**How to Test:**
1. Click "Document Generation" category card
2. Click "Position Statement"
3. Check console for: "Loaded investors: 14 investors"
4. Check console for: "Loaded vehicles: 10 vehicles"
5. Open investor dropdown - should see 14 investors
6. Open vehicle dropdown - should see 10 vehicles

---

### 2. NDA Agent (Compliance Category)
**What You Should See:**
- Category: "Compliance & Verification" (green gradient)
- Trigger Type: Manual
- Required Role: RM

**Fields:**
- ✅ **Investor Email** (text input) - Type email address
- ✅ **Investment Type** (text input) - Type fund name
- ✅ **NDA Template** (dropdown) - 3 options:
  - Standard
  - Institutional
  - High-Net-Worth

**How to Test:**
1. Click "Compliance & Verification" category card
2. Click "NDA Agent"
3. Type an email in Investor Email field
4. Type "VERSO FUND" in Investment Type
5. Select a template from dropdown

---

### 3. Shared-Drive Notification (Communications Category)
**What You Should See:**
- Category: "Communications" (purple gradient)
- Trigger Type: **Scheduled** (purple badge)
- Required Role: OPS

**Fields:**
- ✅ **Document Category** (dropdown) - 5 options:
  - Legal
  - Financial
  - Marketing
  - Compliance
  - Reports
- ✅ **Notification Group** (dropdown) - 4 options:
  - Investors
  - Staff
  - Compliance
  - All

**How to Test:**
1. Click "Communications" category card
2. Click "Shared-Drive Notification"
3. Notice the "Scheduled" badge (purple)
4. Select document category
5. Select notification group
6. Click "Schedule" tab - should show placeholder

---

### 4. Inbox Manager (Communications Category) ⭐ **CONDITIONAL FIELDS**
**What You Should See:**
- Category: "Communications" (purple gradient)
- Trigger Type: **Both** (Manual + Scheduled badges)
- Required Role: OPS

**Fields:**
- ✅ **Inbox Type** (dropdown) - 2 options:
  - Email
  - Versotech Messaging
- ✅ **Command/Action** (text input) - Always visible
- ✅ **Email Subject Filter** (text input) - **Only shows when "email" selected**
- ✅ **Conversation** (dropdown) - **Only shows when "versotech_messaging" selected**
  - Should load 2 conversations from database

**How to Test - CONDITIONAL LOGIC:**
1. Click "Communications" category card
2. Click "Inbox Manager"
3. Notice **both** Manual and Scheduled badges
4. Select "Email" from Inbox Type
   - ✅ Email Subject Filter field should appear
   - ✅ Conversation field should be hidden
5. Select "Versotech Messaging" from Inbox Type
   - ✅ Email Subject Filter should disappear
   - ✅ Conversation field should appear
6. Check console for: "Loaded conversations: 2 conversations"

---

### 5. LinkedIn Leads Scraper (Data Processing Category)
**What You Should See:**
- Category: "Data Processing" (orange gradient)
- Trigger Type: Manual
- Required Role: RM

**Fields:**
- ✅ **LinkedIn Search URL** (text input) - Paste full LinkedIn URL
- ✅ **Campaign Purpose** (dropdown) - 2 options:
  - LinkedIn Outreach
  - Cold Email Campaign

**How to Test:**
1. Click "Data Processing" category card
2. Click "LinkedIn Leads Scraper"
3. Paste a LinkedIn search URL
4. Select a campaign purpose

---

### 6. Reporting Agent (Documents Category)
**What You Should See:**
- Category: "Document Generation" (blue gradient)
- Trigger Type: **Both** (Manual + Scheduled badges)
- Required Role: RM

**Fields:**
- ✅ **Report Category** (dropdown) - 3 options:
  - Public
  - Corporate
  - Both
- ✅ **Investor** (dropdown) - Should load 14 investors
- ✅ **Vehicle** (dropdown) - Should load 10 vehicles
- ✅ **Report Frequency** (dropdown) - 4 options:
  - One-Time
  - Monthly
  - Quarterly
  - Annual
- ✅ **Include Charts** (checkbox) - Checked by default

**How to Test:**
1. Click "Document Generation" category card
2. Click "Reporting Agent"
3. Notice **both** Manual and Scheduled badges
4. Check console for investor and vehicle loading
5. Verify all dropdowns have data
6. Notice "Include Charts" is checked by default

---

### 7. KYC/AML Processing (Compliance Category)
**What You Should See:**
- Category: "Compliance & Verification" (green gradient)
- Trigger Type: Manual
- Required Role: **ADMIN** (restricted)

**Fields:**
- ✅ **Investor** (dropdown) - Should load 14 investors
- ✅ **Investor Type** (dropdown) - 3 options:
  - Individual
  - Institution
  - Corporate
- ✅ **Jurisdiction** (text input) - Type country name
- ✅ **Enhanced Due Diligence** (checkbox) - Optional

**How to Test:**
1. Click "Compliance & Verification" category card
2. Click "KYC/AML Processing"
3. Notice "ADMIN" role badge
4. Select investor from dropdown
5. Select investor type
6. Type jurisdiction

---

### 8. Capital Call Processing (Communications Category)
**What You Should See:**
- Category: "Communications" (purple gradient)
- Trigger Type: Manual
- Required Role: **ADMIN**
- Required Title: **bizops** (extra restriction)

**Fields:**
- ✅ **Vehicle** (dropdown) - Should load 10 vehicles
- ✅ **Call Percentage** (number input) - Enter percentage
- ✅ **Due Date** (date picker) - Select date
- ✅ **Wire Deadline** (datetime picker) - Select date and time

**How to Test:**
1. Click "Communications" category card
2. Click "Capital Call Processing"
3. Notice both "ADMIN" badge and title restriction
4. Select vehicle from dropdown
5. Enter call percentage (e.g., 30)
6. Select due date and wire deadline

---

### 9. Investor Onboarding (Multi-Step Category)
**What You Should See:**
- Category: "Multi-Step Workflows" (indigo/violet gradient)
- Trigger Type: Manual
- Required Role: OPS

**Fields:**
- ✅ **Investor Email** (email input) - Type email
- ✅ **Initial Investment** (number input) - Enter amount
- ✅ **Target Vehicle** (dropdown) - Should load 10 vehicles
- ✅ **Investor Type** (dropdown) - 3 options:
  - Individual
  - Institution
  - Corporate

**How to Test:**
1. Click "Multi-Step Workflows" category card
2. Click "Investor Onboarding"
3. Enter email address
4. Enter investment amount (e.g., 1000000)
5. Select vehicle from dropdown
6. Select investor type

---

## 🔍 Console Debugging

Open browser DevTools (F12) and check Console tab. You should see:

```
Loaded investors: 14 investors
Loaded vehicles: 10 vehicles
Loaded conversations: 2 conversations
```

If you see errors like:
- "Failed to fetch investors: 403" → Check you're logged in as staff
- "Failed to fetch investors: 500" → Check API route and database connection
- "No investors found" → Check your database has data in `investors` table

## ✅ What to Verify

### Visual Elements (All Should Be Clearly Visible):
- [ ] Category card titles are white and readable
- [ ] Category card descriptions are gray-300 and readable
- [ ] Process count badges are visible
- [ ] Stats cards show white numbers
- [ ] All form labels are white
- [ ] All input fields have visible borders
- [ ] Dropdown options are white on dark background
- [ ] Hover states don't turn black
- [ ] Trigger button is bright blue
- [ ] Close X button is visible in top-right
- [ ] Tab labels are readable (gray when inactive, white when active)
- [ ] Badges have colored backgrounds (blue, purple, green)

### Functional Elements:
- [ ] Category cards click to open drawer
- [ ] Process cards in drawer open detailed view
- [ ] Investor dropdown loads 14 investors
- [ ] Vehicle dropdown loads 10 vehicles
- [ ] Conversation dropdown loads 2 conversations
- [ ] Conditional fields show/hide (Inbox Manager)
- [ ] Trigger button is clickable
- [ ] History tab shows empty state message
- [ ] Schedule tab shows coming soon message

## 🐛 Common Issues & Fixes

### Issue: Dropdowns are empty
**Fix:** Check browser console for error messages. Verify:
1. You're logged in as a staff user (not investor)
2. Database has data in investors/vehicles tables
3. API routes are responding (check Network tab)

### Issue: Elements turn black on hover
**Fix:** Already fixed! All hover states now use:
- Buttons: `hover:bg-sky-600` (blue, not black)
- Cards: `hover:bg-zinc-800/80` (dark gray, not black)
- Dropdowns: `hover:bg-white/20` (light overlay)

### Issue: Can't see text
**Fix:** Already fixed! All text now uses:
- Titles: `text-white`
- Descriptions: `text-gray-300`
- Helper text: `text-gray-400`
- Labels: `text-white font-medium`

## 📊 Database Requirements

For full testing, ensure your database has:
- ✅ At least 1 investor in `investors` table
- ✅ At least 1 vehicle in `vehicles` table
- ✅ At least 1 conversation in `conversations` table (for Inbox Manager)
- ✅ Staff user with role: `staff_ops`, `staff_rm`, or `staff_admin`

## 🚀 Success Criteria

Your Process Center is working perfectly when:
1. All 5 category cards are clearly visible with colored gradients
2. Clicking a category shows processes in side drawer
3. Clicking a process shows configuration form
4. All dropdown fields load real data from database
5. Conditional fields appear/disappear correctly
6. All text is readable (white/gray on dark background)
7. No elements turn black on hover
8. Trigger button is bright blue and clickable
9. Console shows successful data loading messages
10. No errors in browser console

---

**Everything is now properly styled with excellent contrast and visibility! 🎨**

