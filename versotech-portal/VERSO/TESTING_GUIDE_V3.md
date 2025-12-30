# VERSO Testing Guide V3

## The Investment Flow (How It All Works)

```
CEO creates Deal → Dispatches to Investor → Investor signs NDA →
Data Room access → Investor subscribes → Signs pack → Funds → Done
```

**Who gets paid:** Partner/Introducer/Commercial Partner earn commission when investor funds.

---

# 1. CEO / STAFF

**WHO:** Platform admin. Creates deals, manages all users, approves everything.

## Sidebar Menu
| Menu Item | Route | What It Does |
|-----------|-------|--------------|
| Dashboard | `/dashboard` | Platform KPIs, pending items |
| Messages | `/messages` | All conversations |
| Approvals | `/approvals` | Approve new user profiles |
| Deals | `/deals` | Create/manage investment opportunities |
| Entities | `/entities` | View all entities (investors, partners, etc.) |
| Investors | `/investors` | Manage investor profiles |
| Subscriptions | `/subscriptions` | Track all subscriptions |
| Requests | `/requests` | Pending requests queue |
| Documents | `/documents` | All platform documents |
| VersoSign | `/versosign` | Signature queue |
| Introducers | `/introducers` | Manage introducers |
| Arrangers | `/arrangers` | Manage arrangers |
| Users | `/users` | All users consolidated |
| Calendar | `/calendar` | Shared calendar |

**CEO Extras (only for role = 'ceo' or 'staff_admin'):**
| KYC Review | `/kyc-review` | Approve/reject KYC submissions |
| Fees | `/fees` | Fee tracking & reconciliation |
| Reconciliation | `/reconciliation` | Financial reports |
| Audit | `/audit` | Activity logs |
| Processes | `/processes` | Business workflows |
| Admin | `/admin` | Platform settings |

## Workflows

### WF1: Create a Deal
1. Go to **Deals** → Click "New Deal"
2. Fill: Name, Vehicle (REQUIRED), Target Amount
3. Save → Deal created as 'draft'

### WF2: Dispatch Deal to Investor
1. Go to **Deals** → Click deal → "Dispatch" tab
2. Select investors → Click "Dispatch"
3. Investor receives notification

### WF3: Approve KYC
1. Go to **KYC Review** → See pending queue
2. Click submission → Review documents
3. Approve or Reject

### WF4: Track Subscription
1. Go to **Subscriptions** → Filter by deal
2. See status: pending → committed → active
3. When funded: status = 'active'

---

# 2. INVESTOR

**WHO:** Person or company investing money in deals.

## Sidebar Menu
| Menu Item | Route | What It Does |
|-----------|-------|--------------|
| Dashboard | `/dashboard` | Portfolio summary, pending tasks |
| Investment Opportunities | `/opportunities` | Deals dispatched to me |
| Portfolio | `/portfolio` | My funded investments |
| Documents | `/documents` | My NDAs, packs, certificates |
| Inbox | `/inbox` | Messages & notifications |
| Calendar | `/calendar` | Shared calendar |

## The 10-Stage Journey
```
1. Received → 2. Viewed → 3. Interested → 4. NDA Signed → 5. Data Room →
6. Pack Generated → 7. Pack Sent → 8. Signed → 9. Funded → 10. Active
```

## Workflows

### WF1: View Opportunity
1. Go to **Investment Opportunities**
2. Click deal card → See details & term sheet

### WF2: Express Interest
1. In opportunity detail → Click "I'm Interested"
2. Enter commitment amount
3. System generates NDA

### WF3: Sign NDA & Access Data Room
1. Go to **Inbox** or **Documents** → Find NDA
2. Sign digitally
3. **Individual:** Sign once → Data room unlocked
4. **Entity:** ALL signatories must sign → Then data room unlocks for everyone

### WF4: Subscribe
1. In opportunity detail → Click "Invest $X"
2. System auto-generates subscription pack
3. Pack sent to you for signature

### WF5: Sign Pack & Fund
1. Sign subscription pack
2. **Entity:** ALL signatories sign same pack
3. Receive wire instructions
4. Transfer funds to escrow
5. Status becomes 'active' when funded

---

# 3. ARRANGER

**WHO:** Regulated entity that structures deals. Assigned by CEO to manage specific deals.

## Sidebar Menu
| Menu Item | Route | What It Does |
|-----------|-------|--------------|
| Dashboard | `/dashboard` | Mandate summary, fee performance |
| My Mandates | `/my-mandates` | Deals I'm assigned to |
| Subscription Packs | `/subscription-packs` | Packs for my mandates |
| Escrow | `/escrow` | Escrow funding status |
| Reconciliation | `/lawyer-reconciliation` | Financial reports |
| Fee Plans | `/fee-plans` | Create/manage fee structures |
| Payment Requests | `/payment-requests` | Payment queue |
| My Partners | `/my-partners` | Partner relationships |
| My Introducers | `/my-introducers` | Introducer relationships |
| My Commercial Partners | `/my-commercial-partners` | CP relationships |
| My Lawyers | `/my-lawyers` | Assigned lawyers |
| VERSOSign | `/versosign` | Signature queue |
| Profile | `/arranger-profile` | My entity profile |
| Messages | `/messages` | Conversations |

## Workflows

### WF1: View My Mandates
1. Go to **My Mandates** → See deals I manage
2. Click deal → See subscriptions, data room, etc.

### WF2: Sign Subscription Pack
1. CEO signs first → Then Arranger signs
2. Go to **VERSOSign** → Find pack → Sign

### WF3: Manage Fee Plans
1. Go to **Fee Plans** → Create new or edit
2. Assign to deal

---

# 4. LAWYER

**WHO:** Legal counsel. Only sees deals assigned to them. Manages escrow and confirms payments.

## Sidebar Menu
| Menu Item | Route | What It Does |
|-----------|-------|--------------|
| Dashboard | `/dashboard` | Assigned deals summary |
| Assigned Deals | `/assigned-deals` | ONLY deals I'm assigned to |
| Escrow | `/escrow` | Manage escrow accounts |
| Subscription Packs | `/subscription-packs` | View signed packs (read-only) |
| Reconciliation | `/lawyer-reconciliation` | Financial reports |
| Profile | `/lawyer-profile` | My profile & signature specimen |
| Notifications | `/notifications` | My notifications |
| Messages | `/messages` | Conversations |

## Workflows

### WF1: View Assigned Deals
1. Go to **Assigned Deals** → ONLY see deals assigned via `deal_lawyer_assignments`
2. Cannot see other deals

### WF2: Manage Escrow
1. Go to **Escrow** → See funding status per deal
2. Confirm when funds received
3. Confirm payments to partners/introducers

### WF3: Upload Signature Specimen
1. Go to **Profile** → Upload signature image
2. Auto-inserted on certificates

---

# 5. PARTNER

**WHO:** Refers investors and earns commission. May also invest personally if given access.

## Sidebar Menu
| Menu Item | Route | What It Does |
|-----------|-------|--------------|
| Dashboard | `/dashboard` | Referral summary, commissions |
| Opportunities | `/opportunities` | Deals I can view/invest in |
| Transactions | `/partner-transactions` | Track referred investors |
| Shared Deals | `/shared-transactions` | Co-referred deals |
| Messages | `/messages` | Conversations |

## Key Rule: Conditional Investor Access
- `role = 'partner'` → Can only TRACK referrals, CANNOT invest
- `role = 'partner_investor'` → Can invest like regular investor

## Workflows

### WF1: Track Referred Investors
1. Go to **Transactions** → See investors I referred
2. Track their status: interested → signed → funded
3. CANNOT sign on their behalf

### WF2: Invest Personally (if allowed)
1. Only if role = 'partner_investor'
2. Go to **Opportunities** → Same flow as Investor

---

# 6. INTRODUCER

**WHO:** Brings investors for commission. MUST sign agreement before introducing anyone.

## Sidebar Menu
| Menu Item | Route | What It Does |
|-----------|-------|--------------|
| Dashboard | `/dashboard` | Introduction stats, commissions |
| Introductions | `/introductions` | Track my introductions |
| Agreements | `/introducer-agreements` | My fee agreements |
| VersoSign | `/versosign` | Signature queue |
| Messages | `/messages` | Conversations |

## Key Rule: Agreement Required First
- CEO sends fee agreement (e.g., "1% commission")
- Introducer MUST sign agreement
- ONLY THEN can make introductions
- Without agreement: introduction functionality BLOCKED

## Workflows

### WF1: Sign Agreement (REQUIRED FIRST)
1. Go to **Agreements** → See pending agreement
2. Review terms → Sign
3. Now introduction functionality is enabled

### WF2: Track Introductions
1. Go to **Introductions** → See my introductions
2. Status: `invited` → `joined` → `allocated` → or `lost`
3. Cannot see investor's detailed journey (only status)

### WF3: Invest Personally (if allowed)
- Only if role = 'introducer_investor'
- Same flow as Investor

---

# 7. COMMERCIAL PARTNER

**WHO:** Places client money (proxy mode) OR invests own money. Can sign on behalf of clients.

## Sidebar Menu
| Menu Item | Route | What It Does |
|-----------|-------|--------------|
| Dashboard | `/dashboard` | Client summary, placements |
| Opportunities | `/opportunities` | Deals for me/my clients |
| Client Transactions | `/client-transactions` | Track client investors |
| Portfolio | `/portfolio` | My OWN investments |
| Agreements | `/placement-agreements` | My placement agreements |
| Notifications | `/notifications` | My notifications |
| Messages | `/messages` | Conversations |

## Two Modes

**MODE 1: Direct Investment** (`role = 'commercial_partner_investor'`)
- CP invests OWN money
- Same flow as regular Investor

**MODE 2: Proxy Mode** (`role = 'commercial_partner_proxy'`)
- CP acts on behalf of client
- UI shows "Acting on behalf of: [Client Name]"
- CP signs documents FOR the client
- Documents show CLIENT as investing party

## Workflows

### WF1: Track Client Transactions
1. Go to **Client Transactions** → See all clients
2. Filter by stage: New Lead → Interested → Subscribed → Funded

### WF2: Invest for Client (Proxy Mode)
1. Go to **Opportunities** → See banner "Acting on behalf of: [Client]"
2. Submit subscription → Uses client details
3. Sign pack → Documents show client name

### WF3: My Own Portfolio
1. Go to **Portfolio** → See only MY investments
2. Separate from client placements

---

# KEY RULES

## Entity Signatories
- Entity with N signatories = **N separate NDAs**
- Each signatory signs their own NDA
- Data room access: ALL must sign before ANYONE gets access
- Subscription pack: 1 pack with N signature blocks (max 10)

## Status Values
| Table | Statuses |
|-------|----------|
| `subscriptions.status` | pending → committed → active (or cancelled) |
| `introductions.status` | invited → joined → allocated (or lost) |
| `fee_events.status` | accrued → invoiced → paid |

## Persona Detection
- Single persona: No switcher in header
- Multiple personas: Switcher visible, navigation changes per persona
- CEO/Staff Admin: Gets extra menu items (KYC Review, Fees, Audit, etc.)

## Access Restrictions
- **Lawyer:** Only sees assigned deals
- **Partner:** Cannot sign for referred investors
- **Introducer:** Cannot see investor's detailed journey
- **Introducer:** MUST sign agreement before introducing

---

# QUICK TEST CHECKLIST

## For Each Persona:
1. Login → Correct sidebar appears?
2. Dashboard → Shows relevant metrics?
3. Each menu item → Opens correct page?
4. Actions → Work as expected?

## Cross-Persona Flow:
1. CEO creates deal ✓
2. CEO dispatches to Investor ✓
3. Investor sees in Opportunities ✓
4. Investor expresses interest ✓
5. Investor signs NDA ✓
6. Investor accesses data room ✓
7. Investor subscribes ✓
8. Investor signs pack ✓
9. Investor funds ✓
10. Partner/Introducer sees status update ✓
11. Lawyer confirms funding ✓
12. Commissions calculated ✓
