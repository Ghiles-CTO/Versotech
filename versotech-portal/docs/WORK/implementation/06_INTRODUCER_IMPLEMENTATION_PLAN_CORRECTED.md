# Introducer Implementation - FINAL CORRECTED PLAN

## Key Insight from User Stories

> "There can be several fee models for one introducer"

The `introducer_agreements` table already embeds fee terms (commission_bps, cap, territory, deal_types, etc.). **Each agreement IS a fee model** - no separate entity needed.

---

## What ALREADY EXISTS (Verified)

### CEO/Staff Side - FULLY BUILT

| Feature | Built | Location |
|---------|-------|----------|
| Create/Edit/Delete Introducer | Yes | `add-introducer-dialog.tsx`, `edit-introducer-dialog.tsx` |
| List Introducers with metrics | Yes | `introducers-dashboard.tsx` |
| 6-Tab Detail View | Yes | `introducer-detail-client.tsx` |
| Create/Edit/Delete Introduction | Yes | `add-introduction-dialog.tsx` |
| Introduction status changes | Yes | Dropdown in activity feed |
| Commission creation (manual) | Yes | `/api/staff/fees/commissions/create` |
| Commission listing | Yes | `/api/staff/fees/commissions` |
| Agreement validation on commission | Yes | Checks valid signed agreement |
| KYC/Bank Details/Activity tabs | Yes | Shared components |
| Invite to portal | Yes | Shared dialog |

**Important:** Commission creation already requires valid `introducer_agreements` record!

### Introducer Side - PARTIALLY BUILT

| Feature | Built | Location |
|---------|-------|----------|
| Agreements list page | Yes | `/introducer-agreements/page.tsx` |
| Introductions list page | Yes | `/introductions/page.tsx` |
| Navigation | Yes | `persona-sidebar.tsx:103-108` |
| Dashboard | Generic | Uses PersonaDashboard |
| Agreement detail page | No | Missing |
| Approve/Reject actions | No | Missing |
| VersaSign for agreements | No | Missing |

---

## DETAILED UI SPECIFICATION

### CEO/Staff Side UI Components

#### 1. Agreements Tab in Introducer Detail (`introducer-detail-client.tsx`)

**Location:** Add as 7th tab in existing 6-tab layout

```tsx
// Tab trigger (add after Activity tab)
<TabsTrigger value="agreements" className="gap-2">
  <FileSignature className="h-4 w-4" />
  <span className="hidden sm:inline">Agreements</span>
</TabsTrigger>

// Tab content structure:
<TabsContent value="agreements">
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle>Fee Agreements</CardTitle>
        <CardDescription>
          Manage commission agreements for this introducer
        </CardDescription>
      </div>
      <Button onClick={() => setCreateAgreementOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Create Agreement
      </Button>
    </CardHeader>
    <CardContent>
      {/* Agreements table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Commission</TableHead>
            <TableHead>Territory</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agreements.map(agreement => (
            <TableRow key={agreement.id}>
              {/* ... columns ... */}
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => viewAgreement(agreement.id)}>
                      <Eye className="h-4 w-4 mr-2" /> View Details
                    </DropdownMenuItem>
                    {agreement.status === 'draft' && (
                      <>
                        <DropdownMenuItem onClick={() => editAgreement(agreement.id)}>
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => sendAgreement(agreement.id)}>
                          <Send className="h-4 w-4 mr-2" /> Send to Introducer
                        </DropdownMenuItem>
                      </>
                    )}
                    {agreement.status === 'approved' && (
                      <DropdownMenuItem onClick={() => signAgreement(agreement.id)}>
                        <FileSignature className="h-4 w-4 mr-2" /> Sign Agreement
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</TabsContent>
```

#### 2. Create Agreement Dialog (`create-agreement-dialog.tsx`)

**File:** `src/components/staff/introducers/create-agreement-dialog.tsx`

```tsx
interface CreateAgreementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  introducerId: string
  onSuccess?: () => void
}

// Form fields:
const formFields = {
  agreement_type: {
    type: 'select',
    options: ['referral', 'revenue_share', 'fixed_fee', 'hybrid'],
    required: true
  },
  default_commission_bps: {
    type: 'number',
    label: 'Commission Rate (bps)',
    placeholder: '100 = 1%',
    min: 0,
    max: 1000,
    required: true
  },
  commission_cap_amount: {
    type: 'number',
    label: 'Commission Cap ($)',
    placeholder: 'Optional max commission per deal'
  },
  territory: {
    type: 'text',
    label: 'Territory',
    placeholder: 'e.g., EMEA, Global, UK'
  },
  deal_types: {
    type: 'multiselect',
    label: 'Applicable Deal Types',
    options: ['equity', 'debt', 'hybrid', 'real_estate', 'infrastructure']
  },
  exclusivity_level: {
    type: 'select',
    options: ['exclusive', 'non_exclusive', 'semi_exclusive']
  },
  effective_date: {
    type: 'date',
    label: 'Effective Date',
    required: true
  },
  expiry_date: {
    type: 'date',
    label: 'Expiry Date'
  },
  payment_terms: {
    type: 'select',
    options: ['net_15', 'net_30', 'net_45', 'net_60']
  }
}

// On submit: POST /api/introducer-agreements
// Body: { introducer_id, ...formData }
```

#### 3. Edit Agreement Dialog

**Option A:** Reuse `create-agreement-dialog.tsx` with `mode="edit"` prop
**Option B:** Separate `edit-agreement-dialog.tsx`

```tsx
// Receives existing agreement data as prop
// Uses PATCH /api/introducer-agreements/[id]
// Only editable when status is 'draft'
```

#### 4. View Agreement Modal (`view-agreement-modal.tsx`)

```tsx
interface ViewAgreementModalProps {
  agreementId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Shows:
// - Agreement terms in read-only card
// - Status timeline/stepper
// - PDF viewer (if document attached)
// - Action buttons based on status
```

#### 5. CEO Sign Agreement Flow

When CEO clicks "Sign Agreement" on an approved agreement:

```tsx
// In Agreements tab, when status === 'approved':
async function handleSignAgreement(agreementId: string) {
  // 1. Create signature request via API
  const response = await fetch('/api/signature/initiate', {
    method: 'POST',
    body: JSON.stringify({
      document_type: 'introducer_agreement',
      introducer_agreement_id: agreementId,
      signature_position: 'party_a', // CEO is party_a
    })
  })

  // 2. Redirect to VersaSign page or open signing modal
  const { signature_request_id } = await response.json()
  router.push(`/versotech_main/versosign?sign=${signature_request_id}`)
}
```

---

### Introducer Side UI Components

#### 1. Agreement List Page Enhancement (`introducer-agreements/page.tsx`)

**Current:** List-only with no actions
**Needed:** Add row click navigation + Actions column

```tsx
// Modify existing TableRow to be clickable:
<TableRow
  key={agreement.id}
  className="cursor-pointer hover:bg-muted/50"
  onClick={() => router.push(`/versotech_main/introducer-agreements/${agreement.id}`)}
>
  {/* existing columns */}
  <TableCell>
    <Button variant="ghost" size="sm" onClick={(e) => {
      e.stopPropagation()
      router.push(`/versotech_main/introducer-agreements/${agreement.id}`)
    }}>
      View Details
      <ChevronRight className="h-4 w-4 ml-1" />
    </Button>
  </TableCell>
</TableRow>

// Update STATUS_STYLES to include new statuses:
const STATUS_STYLES = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  pending_ceo_signature: 'bg-purple-100 text-purple-800',
  pending_introducer_signature: 'bg-orange-100 text-orange-800',
  active: 'bg-green-500 text-white',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800',
}
```

#### 2. Agreement Detail Page (`introducer-agreements/[id]/page.tsx`)

**File:** `src/app/(main)/versotech_main/introducer-agreements/[id]/page.tsx`

```tsx
export default async function AgreementDetailPage({
  params
}: { params: { id: string } }) {
  // Fetch agreement with introducer info
  // Verify user has access (is this introducer)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/versotech_main/introducer-agreements">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Agreements
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Fee Agreement</h1>
            <p className="text-muted-foreground">
              {AGREEMENT_TYPE_LABELS[agreement.agreement_type]}
            </p>
          </div>
        </div>
        <Badge className={STATUS_STYLES[agreement.status]}>
          {agreement.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Agreement Status</CardTitle>
        </CardHeader>
        <CardContent>
          <AgreementStatusTimeline status={agreement.status} />
        </CardContent>
      </Card>

      {/* Agreement Terms */}
      <Card>
        <CardHeader>
          <CardTitle>Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">Commission Rate</Label>
            <p className="font-medium">{formatBps(agreement.default_commission_bps)}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Commission Cap</Label>
            <p className="font-medium">
              {agreement.commission_cap_amount
                ? formatCurrency(agreement.commission_cap_amount)
                : 'No cap'}
            </p>
          </div>
          <div>
            <Label className="text-muted-foreground">Territory</Label>
            <p className="font-medium">{agreement.territory || 'Global'}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Deal Types</Label>
            <p className="font-medium">
              {agreement.deal_types?.join(', ') || 'All types'}
            </p>
          </div>
          <div>
            <Label className="text-muted-foreground">Effective Date</Label>
            <p className="font-medium">{formatDate(agreement.effective_date)}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Expiry Date</Label>
            <p className="font-medium">
              {agreement.expiry_date ? formatDate(agreement.expiry_date) : 'No expiry'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Document Preview (if PDF attached) */}
      {agreement.document_url && (
        <Card>
          <CardHeader>
            <CardTitle>Agreement Document</CardTitle>
          </CardHeader>
          <CardContent>
            <PDFViewer url={agreement.document_url} />
          </CardContent>
        </Card>
      )}

      {/* Action Buttons (conditional on status) */}
      <AgreementActions agreement={agreement} />
    </div>
  )
}
```

#### 3. Agreement Actions Component

```tsx
function AgreementActions({ agreement }: { agreement: Agreement }) {
  const router = useRouter()

  // PENDING_APPROVAL: Show Approve + Reject buttons
  if (agreement.status === 'pending_approval') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Action Required</CardTitle>
          <CardDescription>
            Please review the terms above and approve or reject this agreement.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button
            variant="default"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => handleApprove(agreement.id)}
          >
            <Check className="h-4 w-4 mr-2" />
            Approve Agreement
          </Button>
          <Button
            variant="destructive"
            onClick={() => setRejectDialogOpen(true)}
          >
            <X className="h-4 w-4 mr-2" />
            Reject Agreement
          </Button>
        </CardContent>
      </Card>
    )
  }

  // PENDING_INTRODUCER_SIGNATURE: Show Sign button
  if (agreement.status === 'pending_introducer_signature') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Signature Required</CardTitle>
          <CardDescription>
            The CEO has signed this agreement. Please sign to activate it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => handleSign(agreement.id)}>
            <FileSignature className="h-4 w-4 mr-2" />
            Sign Agreement
          </Button>
        </CardContent>
      </Card>
    )
  }

  // APPROVED: Waiting for CEO signature
  if (agreement.status === 'approved') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Awaiting CEO Signature</CardTitle>
          <CardDescription>
            You have approved this agreement. Waiting for the CEO to sign.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>You will be notified when it's ready for your signature</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ACTIVE: Show "Agreement Active" status
  if (agreement.status === 'active') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">
              Agreement is active. You can now make introductions.
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
```

#### 4. Agreement Status Timeline Component

```tsx
function AgreementStatusTimeline({ status }: { status: string }) {
  const steps = [
    { key: 'draft', label: 'Created', icon: FileText },
    { key: 'sent', label: 'Sent', icon: Send },
    { key: 'pending_approval', label: 'Under Review', icon: Clock },
    { key: 'approved', label: 'Approved', icon: Check },
    { key: 'pending_ceo_signature', label: 'CEO Signing', icon: FileSignature },
    { key: 'pending_introducer_signature', label: 'Your Signature', icon: FileSignature },
    { key: 'active', label: 'Active', icon: CheckCircle2 },
  ]

  const currentIndex = steps.findIndex(s => s.key === status)

  // Handle rejected/expired as terminal states
  if (status === 'rejected') {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <XCircle className="h-5 w-5" />
        <span>Agreement was rejected</span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isCompleted = index < currentIndex
        const isCurrent = index === currentIndex
        const isPending = index > currentIndex

        return (
          <div key={step.key} className="flex flex-col items-center">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isCompleted && "bg-green-500 text-white",
              isCurrent && "bg-blue-500 text-white",
              isPending && "bg-gray-200 text-gray-400"
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <span className={cn(
              "text-xs mt-2",
              isCurrent ? "font-medium" : "text-muted-foreground"
            )}>
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
```

#### 5. Introducer Navigation Enhancement

**File:** `src/components/layout/persona-sidebar.tsx`

```tsx
// Add VersoSign to introducer navigation (line 103-108)
introducer: [
  { name: 'Dashboard', href: '/versotech_main/dashboard', icon: LayoutDashboard },
  { name: 'Introductions', href: '/versotech_main/introductions', icon: UserPlus },
  { name: 'Agreements', href: '/versotech_main/introducer-agreements', icon: FileText },
  { name: 'VersoSign', href: '/versotech_main/versosign', icon: FileSignature }, // ADD THIS
  { name: 'Messages', href: '/versotech_main/messages', icon: MessageSquare },
],
```

---

### VersaSign Page Modifications

#### 1. Support Introducer Agreement Tasks

**File:** `src/app/(main)/versotech_main/versosign/page.tsx`

```tsx
// Update task query to include introducer_agreement tasks:
let tasksQuery = serviceSupabase
  .from('tasks')
  .select('*')
  .in('kind', [
    'countersignature',
    'subscription_pack_signature',
    'introducer_agreement_signature', // ADD THIS
    'other'
  ])

// Add new signature group for introducer agreements:
const signatureGroups: SignatureGroup[] = [
  // ... existing groups ...
  {
    category: 'introducer_agreements',
    title: 'Introducer Agreement Signatures',
    description: 'Fee agreements awaiting your signature',
    tasks: allTasks.filter(t =>
      t.kind === 'introducer_agreement_signature' &&
      (t.status === 'pending' || t.status === 'in_progress')
    )
  },
]
```

#### 2. Introducer-Specific View

When introducer persona is active, filter to show only their signature tasks:

```tsx
// Get introducer IDs if user has introducer persona
let introducerIds: string[] = []
const hasIntroducerAccess = personas?.some((p: any) => p.persona_type === 'introducer') || false
if (hasIntroducerAccess) {
  const { data: introducerLinks } = await serviceSupabase
    .from('introducer_users')
    .select('introducer_id')
    .eq('user_id', user.id)

  introducerIds = introducerLinks?.map(link => link.introducer_id) || []
}

// Filter signature requests for introducers
if (introducerIds.length > 0 && !isStaff) {
  tasksQuery = tasksQuery.or(
    `owner_user_id.eq.${user.id},metadata->introducer_id.in.(${introducerIds.join(',')})`
  )
}
```

---

### Introduction Dialog Enhancement

**File:** `src/components/staff/introducers/add-introduction-dialog.tsx`

```tsx
// Add state for agreement status
const [hasValidAgreement, setHasValidAgreement] = useState<boolean | null>(null)
const [checkingAgreement, setCheckingAgreement] = useState(false)

// Check agreement when introducer changes
useEffect(() => {
  async function checkAgreement() {
    if (!introducerId) {
      setHasValidAgreement(null)
      return
    }

    setCheckingAgreement(true)
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('introducer_agreements')
      .select('id')
      .eq('introducer_id', introducerId)
      .eq('status', 'active')
      .not('signed_date', 'is', null)
      .or(`expiry_date.is.null,expiry_date.gte.${today}`)
      .limit(1)

    setHasValidAgreement(!error && data && data.length > 0)
    setCheckingAgreement(false)
  }

  checkAgreement()
}, [introducerId])

// Show warning in form:
{introducerId && hasValidAgreement === false && (
  <Alert variant="destructive" className="mt-4">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>No Valid Agreement</AlertTitle>
    <AlertDescription>
      This introducer does not have a signed fee agreement.
      <Link
        href={`/versotech_main/introducers/${introducerId}?tab=agreements`}
        className="underline ml-1"
      >
        Create an agreement first
      </Link>
    </AlertDescription>
  </Alert>
)}

// Disable submit button:
<Button
  type="submit"
  disabled={isPending || !hasValidAgreement || checkingAgreement}
>
  {isPending ? 'Creating...' : 'Create Introduction'}
</Button>
```

---

### Introducer Dashboard

**File:** `src/components/dashboard/introducer-dashboard.tsx`

```tsx
export function IntroducerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get introducer ID
      const { data: introducerUser } = await supabase
        .from('introducer_users')
        .select('introducer_id')
        .eq('user_id', user.id)
        .single()

      if (!introducerUser) return

      const introducerId = introducerUser.introducer_id

      // Fetch all data in parallel
      const [agreementsRes, introductionsRes, commissionsRes] = await Promise.all([
        supabase.from('introducer_agreements')
          .select('status')
          .eq('introducer_id', introducerId),
        supabase.from('introductions')
          .select('status')
          .eq('introducer_id', introducerId),
        supabase.from('introducer_commissions')
          .select('status, accrual_amount')
          .eq('introducer_id', introducerId)
      ])

      // Process data...
    }
    fetchData()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Welcome Back</h1>

      {/* Agreement Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Agreement Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.agreements.active > 0 ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span>{data.agreements.active} Active Agreement(s)</span>
            </div>
          ) : data?.agreements.pending > 0 ? (
            <div className="flex items-center gap-2 text-yellow-600">
              <Clock className="h-5 w-5" />
              <span>{data.agreements.pending} Pending Agreement(s)</span>
              <Link href="/versotech_main/introducer-agreements">
                <Button size="sm" variant="outline">Review</Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-5 w-5" />
              <span>No active agreements</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Introductions Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Introductions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.introductions.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Converted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data?.introductions.converted}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {data?.introductions.pending}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Commissions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Paid</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(data?.commissions.paid || 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {formatCurrency(data?.commissions.pending || 0)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Link href="/versotech_main/introducer-agreements">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              View Agreements
            </Button>
          </Link>
          <Link href="/versotech_main/introductions">
            <Button variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              View Introductions
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## What ACTUALLY Needs to Be Built

### Phase 1: Database Migration (P0 - FIRST)

**Migration: `20251225000000_introducer_agreement_signing.sql`**

```sql
-- Add columns to signature_requests for introducer agreement signing
ALTER TABLE signature_requests
ADD COLUMN IF NOT EXISTS introducer_id UUID REFERENCES introducers(id),
ADD COLUMN IF NOT EXISTS introducer_agreement_id UUID REFERENCES introducer_agreements(id);

-- Add signature request tracking to introducer_agreements
ALTER TABLE introducer_agreements
ADD COLUMN IF NOT EXISTS ceo_signature_request_id UUID REFERENCES signature_requests(id),
ADD COLUMN IF NOT EXISTS introducer_signature_request_id UUID REFERENCES signature_requests(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_signature_requests_introducer_agreement
ON signature_requests(introducer_agreement_id) WHERE introducer_agreement_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_signature_requests_introducer
ON signature_requests(introducer_id) WHERE introducer_id IS NOT NULL;
```

**Note:** `introducer_agreements.status` is a text column, not an enum. We use these status values:
- `draft` - Agreement created, not yet sent
- `sent` - Sent to introducer for review
- `pending_approval` - Awaiting introducer approval
- `approved` - Introducer approved, awaiting CEO signature
- `pending_ceo_signature` - CEO is signing
- `pending_introducer_signature` - CEO signed, awaiting introducer signature
- `active` - Both parties signed, agreement is active
- `rejected` - Introducer rejected (terminal)
- `expired` - Agreement expired (terminal)

---

### Phase 2: Agreement CRUD APIs (P0)

| File | Method | Purpose |
|------|--------|---------|
| `src/app/api/introducer-agreements/route.ts` | GET | List agreements (role-filtered) |
| | POST | Create new agreement with fee terms |
| `src/app/api/introducer-agreements/[id]/route.ts` | GET | Single agreement detail |
| | PATCH | Update agreement (Row 40) |
| `src/app/api/introducer-agreements/[id]/send/route.ts` | POST | Send to introducer (Row 39) |
| `src/app/api/introducer-agreements/[id]/approve/route.ts` | POST | Introducer approves (Row 84) |
| `src/app/api/introducer-agreements/[id]/reject/route.ts` | POST | Introducer rejects (Row 87) |

---

### Phase 3: Introduction Blocking (P0 - CRITICAL)

**Problem:** Currently `/api/staff/introductions/route.ts` does NOT validate that the introducer has a valid signed agreement before creating an introduction.

**Solution - Modify `src/app/api/staff/introductions/route.ts`:**

```typescript
// After validating request body, BEFORE inserting introduction:

// Check if introducer has a valid signed agreement
const today = new Date().toISOString().split('T')[0]
const { data: validAgreement, error: agreementError } = await supabase
  .from('introducer_agreements')
  .select('id')
  .eq('introducer_id', parsed.introducer_id)
  .eq('status', 'active')
  .not('signed_date', 'is', null)
  .or(`expiry_date.is.null,expiry_date.gte.${today}`)
  .limit(1)
  .single()

if (agreementError || !validAgreement) {
  return NextResponse.json(
    { error: 'Introducer must have a valid signed agreement before making introductions' },
    { status: 403 }
  )
}

// Then proceed with introduction creation...
```

**Pattern Reference:** See `/api/deals/[id]/dispatch/route.ts:66-112` which already implements this check for `introducer_investor` role.

---

### Phase 4: CEO Agreement Management UI (P0)

See **DETAILED UI SPECIFICATION > CEO/Staff Side UI Components** above.

Files to modify/create:
- MODIFY: `src/components/staff/introducers/introducer-detail-client.tsx` - Add 7th "Agreements" tab
- CREATE: `src/components/staff/introducers/create-agreement-dialog.tsx`
- CREATE: `src/components/staff/introducers/view-agreement-modal.tsx` (optional - can use inline)

---

### Phase 5: Introducer Agreement Detail Page (P0)

See **DETAILED UI SPECIFICATION > Introducer Side UI Components** above.

Files to create:
- CREATE: `src/app/(main)/versotech_main/introducer-agreements/[id]/page.tsx`
- CREATE: `src/components/introducer/agreement-detail.tsx` (client component)
- CREATE: `src/components/introducer/agreement-actions.tsx`
- CREATE: `src/components/introducer/agreement-status-timeline.tsx`

---

### Phase 6: VersaSign Integration (P0)

**Modify `src/lib/signature/types.ts`:**
```typescript
export type DocumentType = 'nda' | 'subscription' | 'amendment' | 'introducer_agreement' | 'other'
export type SignerRole = 'investor' | 'admin' | 'arranger' | 'introducer'
```

**Modify `src/lib/signature/handlers.ts`:**
```typescript
case 'introducer_agreement':
  return handleIntroducerAgreementSignature(params)

async function handleIntroducerAgreementSignature(params: PostSignatureHandlerParams) {
  const { signatureRequest, supabase } = params

  // Get agreement from the new column
  const agreementId = signatureRequest.introducer_agreement_id

  // Check which signer just signed
  if (signatureRequest.signature_position === 'party_a') {
    // CEO signed first -> update status, create request for introducer
    await supabase.from('introducer_agreements')
      .update({
        status: 'pending_introducer_signature',
        ceo_signature_request_id: signatureRequest.id
      })
      .eq('id', agreementId)

    // Create signature request for introducer (party_b)
    const { data: agreement } = await supabase
      .from('introducer_agreements')
      .select('introducer_id, introducers(user_id, legal_name, email)')
      .eq('id', agreementId)
      .single()

    await supabase.from('signature_requests').insert({
      document_type: 'introducer_agreement',
      introducer_agreement_id: agreementId,
      introducer_id: agreement.introducer_id,
      signer_user_id: agreement.introducers.user_id,
      signer_email: agreement.introducers.email,
      signer_name: agreement.introducers.legal_name,
      signature_position: 'party_b',
      status: 'pending',
      // ... other fields
    })
  } else {
    // Introducer signed (party_b) -> agreement is now active
    await supabase.from('introducer_agreements')
      .update({
        status: 'active',
        signed_date: new Date().toISOString(),
        introducer_signature_request_id: signatureRequest.id
      })
      .eq('id', agreementId)

    // Notify CEO
    await supabase.from('notifications').insert({
      user_id: 'CEO_USER_ID', // Fetch from profiles where role = staff_admin
      type: 'introducer_agreement_signed',
      title: 'Agreement Signed',
      message: `Introducer agreement has been fully signed and is now active`,
      link: `/versotech_main/introducers/...`,
    })
  }
}
```

**Modify VersaSign page:** See **DETAILED UI SPECIFICATION > VersaSign Page Modifications** above.

**Signing flow (CEO first, as confirmed):**
1. Introducer approves agreement -> status='approved'
2. CEO receives notification -> clicks "Sign Agreement"
3. CEO signs (party_a) -> status='pending_introducer_signature'
4. Introducer receives email with signing link
5. Introducer signs (party_b) -> status='active', signed_date set
6. Introducer can now make introductions

---

### Phase 7: Notifications (P1)

Add triggers to agreement action APIs:

```typescript
// In approve/route.ts:
await supabase.from('notifications').insert({
  user_id: ceo_user_id,
  type: 'introducer_agreement_approved',
  title: 'Agreement Approved',
  message: `${introducer.legal_name} approved agreement`,
  link: `/versotech_main/introducers/${introducerId}`,
})

// Similar for: rejected, signed
```

---

### Phase 8: Introducer Dashboard (P1)

See **DETAILED UI SPECIFICATION > Introducer Dashboard** above.

Wire in `persona-dashboard.tsx`:
```typescript
if (persona?.type === 'introducer') {
  return <IntroducerDashboard />
}
```

---

### Phase 9: Reminders (P2 - Optional)

If needed for launch:
- Edge function for auto-reminders (pending > 3 days)
- Manual "Send Reminder" button in CEO UI

---

## Files to CREATE (14 files)

```
# Database Migration (1 file)
supabase/migrations/20251225000000_introducer_agreement_signing.sql

# APIs (6 files)
src/app/api/introducer-agreements/route.ts
src/app/api/introducer-agreements/[id]/route.ts
src/app/api/introducer-agreements/[id]/send/route.ts
src/app/api/introducer-agreements/[id]/approve/route.ts
src/app/api/introducer-agreements/[id]/reject/route.ts

# Pages (1 file)
src/app/(main)/versotech_main/introducer-agreements/[id]/page.tsx

# Components (6 files)
src/components/staff/introducers/create-agreement-dialog.tsx
src/components/staff/introducers/view-agreement-modal.tsx
src/components/introducer/agreement-detail.tsx
src/components/introducer/agreement-actions.tsx
src/components/introducer/agreement-status-timeline.tsx
src/components/dashboard/introducer-dashboard.tsx
```

## Files to MODIFY (7 files)

```
src/lib/signature/types.ts
  - Add 'introducer_agreement' to DocumentType
  - Add 'introducer' to SignerRole

src/lib/signature/handlers.ts
  - Add handleIntroducerAgreementSignature()
  - Handle dual-party signing (CEO first -> Introducer second)

src/components/staff/introducers/introducer-detail-client.tsx
  - Add 7th "Agreements" tab with list, create button, and actions

src/components/staff/introducers/add-introduction-dialog.tsx
  - Add agreement validation check
  - Show warning banner when no valid agreement
  - Disable submit when no agreement

src/app/api/staff/introductions/route.ts
  - ADD agreement validation BEFORE creating introduction
  - Return 403 if no valid signed agreement exists

src/app/(main)/versotech_main/introducer-agreements/page.tsx
  - Add row click navigation to detail page
  - Add Actions column with View Details button
  - Update STATUS_STYLES for new statuses

src/components/layout/persona-sidebar.tsx
  - Add VersoSign link to introducer navigation (line 108)

src/app/(main)/versotech_main/versosign/page.tsx
  - Add introducer_agreement_signature to task kinds
  - Add introducer-specific filtering

src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx
  - Route introducer persona to IntroducerDashboard
```

---

## User Story Coverage

### CEO Side (Section 1.2.1)

| Row | Story | Solution |
|-----|-------|----------|
| 36 | Create fees model | Each agreement IS a fee model (has commission terms) |
| 37 | Update fees model | PATCH `/introducer-agreements/[id]` |
| 39 | Send fees model | POST `/introducer-agreements/[id]/send` |
| 40 | Update agreement | PATCH `/introducer-agreements/[id]` |
| 42-43 | Notifications approved/rejected | Triggers in action APIs |
| 44 | Digitally sign | VersaSign integration (CEO signs first) |
| 47 | Notification signed | Trigger in signature handler |

### Introducer Side (Section 6.6.2)

| Row | Story | Solution |
|-----|-------|----------|
| 81 | Display dispatched agreements | List page + status filter |
| 84 | Approve agreement | POST `/introducer-agreements/[id]/approve` |
| 85 | Sign agreement | VersaSign (after CEO signs) |
| 86 | Notification signed | Trigger in handler |
| 87 | Reject agreement | POST `/introducer-agreements/[id]/reject` |
| 88 | Notification rejected | Trigger in action API |
| 89 | Display list | Already exists (enhanced with row click) |
| 90 | View details | New `[id]` page |

### Implicit Requirement: Introduction Blocking

| Requirement | Solution |
|-------------|----------|
| Cannot introduce without signed agreement | API validation in `/api/staff/introductions/route.ts` |
| UI feedback when no agreement | Warning banner + disabled submit in `add-introduction-dialog.tsx` |

---

## Implementation Order

1. **Phase 1** - Database Migration (signature_requests columns)
2. **Phase 2** - Agreement CRUD APIs
3. **Phase 3** - Introduction Blocking (API + UI)
4. **Phase 4** - CEO Agreement UI (in introducer detail)
5. **Phase 5** - Introducer Agreement Detail Page
6. **Phase 6** - VersaSign Integration
7. **Phase 7** - Notifications
8. **Phase 8** - Introducer Dashboard

---

## Agreement Status Flow

```
draft -> sent -> pending_approval -> approved -> pending_ceo_signature
     -> pending_introducer_signature -> active

If rejected: -> rejected (terminal)
If expired: -> expired (terminal)
```

---

## Summary

| Category | Count |
|----------|-------|
| Files to CREATE | 14 |
| Files to MODIFY | 9 |
| Database Tables Affected | 2 (signature_requests, introducer_agreements) |
| Total Phases | 9 (P0: 6, P1: 2, P2: 1) |
