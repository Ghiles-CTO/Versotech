# Reconciliations Implementation Plan
**Based on actual client meeting transcript**

---

## The $850K Problem

**Quote from Julien:**
> "It took 11 months for auditors to find why there was $850,000 difference between what we had and what our lawyer had. Some lines in the banking extraction from ING Bank disappeared when creating the Excel. A $400,000 transaction had disappeared."

**This is why reconciliations is "the holy grail."**

---

## What We're Actually Building

### INPUT
- **Manual CSV/Excel upload** from lawyer's ING Bank account
- Platform subscription data (already have 636 subscriptions, $183.8M)

### PROCESS
- Match bank transactions to subscriptions (fuzzy matching)
- Flag discrepancies (amount differences, missing transactions)
- User investigates and resolves
- Override with notes (e.g., "bank fee €10")

### OUTPUT
- Verified transaction list
- Flagged unmatched items
- Audit trail of all resolutions
- Per-entity reconciliation status

---

## Database Schema (Minimal)

### 1. Enhance bank_transactions (already exists)
```sql
ALTER TABLE bank_transactions
ADD COLUMN IF NOT EXISTS matched_subscription_id UUID REFERENCES subscriptions(id),
ADD COLUMN IF NOT EXISTS match_confidence INTEGER, -- 0-100
ADD COLUMN IF NOT EXISTS match_status TEXT DEFAULT 'unmatched',
  -- 'unmatched', 'matched', 'discrepancy', 'resolved'
ADD COLUMN IF NOT EXISTS discrepancy_amount NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS resolution_notes TEXT,
ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_bank_txns_match_status
ON bank_transactions(match_status, value_date DESC);
```

### 2. Track capital call payments per investor
```sql
CREATE TABLE capital_call_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capital_call_id UUID REFERENCES capital_calls(id) NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) NOT NULL,
  investor_id UUID REFERENCES investors(id) NOT NULL,

  called_amount NUMERIC(15,2) NOT NULL,
  paid_amount NUMERIC(15,2) DEFAULT 0,
  balance_due NUMERIC(15,2) GENERATED ALWAYS AS (called_amount - paid_amount) STORED,

  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, paid, overdue

  bank_transaction_ids UUID[], -- array of matched bank_transactions
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_capital_call_items_subscription ON capital_call_items(subscription_id);
CREATE INDEX idx_capital_call_items_status ON capital_call_items(status, due_date);
```

### 3. Track distributions per investor
```sql
CREATE TABLE distribution_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_id UUID REFERENCES distributions(id) NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) NOT NULL,
  investor_id UUID REFERENCES investors(id) NOT NULL,

  distribution_amount NUMERIC(15,2) NOT NULL,
  sent_amount NUMERIC(15,2) DEFAULT 0,

  sent_date DATE,
  wire_reference TEXT,
  status TEXT DEFAULT 'pending', -- pending, sent, confirmed

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_distribution_items_subscription ON distribution_items(subscription_id);
```

### 4. Suggested matches (fuzzy matching results)
```sql
CREATE TABLE suggested_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_transaction_id UUID REFERENCES bank_transactions(id) NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) NOT NULL,

  confidence INTEGER NOT NULL, -- 0-100
  match_reason TEXT,
  amount_difference NUMERIC(15,2),

  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(bank_transaction_id, subscription_id)
);
```

---

## Matching Algorithm

### Fuzzy Match Logic
```sql
CREATE OR REPLACE FUNCTION run_auto_match()
RETURNS TABLE (
  txn_id UUID,
  sub_id UUID,
  confidence INT,
  reason TEXT
) LANGUAGE plpgsql AS $$
DECLARE
  v_txn RECORD;
  v_sub RECORD;
  v_conf INT;
  v_reason TEXT;
BEGIN
  FOR v_txn IN
    SELECT * FROM bank_transactions
    WHERE match_status = 'unmatched' AND amount > 0
  LOOP
    FOR v_sub IN
      SELECT s.*, i.legal_name,
        similarity(LOWER(i.legal_name), LOWER(v_txn.counterparty)) as name_sim
      FROM subscriptions s
      JOIN investors i ON s.investor_id = i.id
      WHERE s.funded_amount < s.commitment
        AND s.currency = v_txn.currency
      ORDER BY
        similarity(LOWER(i.legal_name), LOWER(v_txn.counterparty)) DESC,
        ABS(s.commitment - s.funded_amount - v_txn.amount) ASC
      LIMIT 3
    LOOP
      v_conf := 0;
      v_reason := '';

      -- Name match (40 points)
      IF v_sub.name_sim > 0.8 THEN
        v_conf := v_conf + 40;
        v_reason := 'Strong name match';
      ELSIF v_sub.name_sim > 0.6 THEN
        v_conf := v_conf + 25;
        v_reason := 'Good name match';
      END IF;

      -- Amount match (40 points)
      DECLARE
        v_expected NUMERIC := v_sub.commitment - v_sub.funded_amount;
        v_diff NUMERIC := ABS(v_txn.amount - v_expected);
      BEGIN
        IF v_diff < 1 THEN
          v_conf := v_conf + 40;
          v_reason := v_reason || ', exact amount';
        ELSIF v_diff < 100 THEN
          v_conf := v_conf + 30;
          v_reason := v_reason || ', amount within $100';
        ELSIF v_diff / v_expected < 0.05 THEN
          v_conf := v_conf + 20;
          v_reason := v_reason || ', amount within 5%';
        END IF;
      END;

      -- Date proximity (20 points)
      IF v_txn.value_date BETWEEN v_sub.created_at::DATE AND v_sub.created_at::DATE + 30 THEN
        v_conf := v_conf + 20;
      END IF;

      IF v_conf >= 50 THEN
        INSERT INTO suggested_matches (
          bank_transaction_id, subscription_id, confidence,
          match_reason, amount_difference
        ) VALUES (
          v_txn.id, v_sub.id, v_conf, v_reason,
          v_txn.amount - (v_sub.commitment - v_sub.funded_amount)
        ) ON CONFLICT DO NOTHING;

        RETURN QUERY SELECT v_txn.id, v_sub.id, v_conf, v_reason;
        EXIT;
      END IF;
    END LOOP;
  END LOOP;
END;
$$;
```

---

## UI Structure

### Page: `/versotech/staff/reconciliation`

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Reconciliation Dashboard                        │
│ [Upload CSV] [Run Auto-Match] [Export Report]  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ STATS                                           │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ │Total Txns│ │Matched   │ │Unmatched │         │
│ │247       │ │189 (77%) │ │58 (23%)  │         │
│ └──────────┘ └──────────┘ └──────────┘         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ TABS                                            │
│ [Suggested Matches] [All Transactions]          │
│ [Discrepancies] [By Entity] [Audit Trail]      │
└─────────────────────────────────────────────────┘

[CONTENT AREA - Changes per tab]
```

### Tab 1: Suggested Matches
```
┌───────────────────────────────────────────────────────┐
│ 🟢 95% confidence                                     │
│ Bank: $100,000 from "Acme Corp" (Oct 15)            │
│ ↓                                                     │
│ Subscription: Acme Corporation - $100K commitment     │
│ Match reason: Strong name match, exact amount        │
│ [Accept] [Reject]                                     │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│ 🟡 72% confidence                                     │
│ Bank: $49,990 from "Smith LLC" (Oct 18)             │
│ ↓                                                     │
│ Subscription: Smith & Associates - $50K commitment    │
│ Discrepancy: -$10 (likely bank fee)                 │
│ [Accept] [Reject] [Investigate]                      │
└───────────────────────────────────────────────────────┘
```

### Tab 2: All Transactions
Table with columns:
- Date | Amount | Counterparty | Status | Matched To | Actions

Filters:
- Status: All / Matched / Unmatched / Discrepancy
- Date range
- Entity
- Amount range

### Tab 3: Discrepancies
List all transactions with discrepancies requiring resolution:
- Missing transactions (in platform, not in bank)
- Extra transactions (in bank, not in platform)
- Amount mismatches

**Resolution UI:**
```
┌───────────────────────────────────────────────────────┐
│ Discrepancy: -$10                                     │
│ Expected: $50,000                                     │
│ Received: $49,990                                     │
│                                                       │
│ Resolution:                                           │
│ ○ Bank fee                                           │
│ ○ Partial payment                                    │
│ ○ Amount error in platform                          │
│ ○ Other: [________]                                  │
│                                                       │
│ Notes: [Wire transfer fee charged by ING Bank]       │
│                                                       │
│ [Mark as Resolved] [Cancel]                          │
└───────────────────────────────────────────────────────┘
```

### Tab 4: By Entity
Show reconciliation status per vehicle:
```
Vehicle: Series 106
├─ Total subscriptions: $2.5M (25 investors)
├─ Bank transactions: $2.49M (24 matched)
├─ Discrepancies: $10K (2 flagged)
└─ Status: 96% reconciled

[View Details]
```

### Tab 5: Audit Trail
Complete log of all reconciliation actions:
- Who matched what, when
- Resolution notes
- Overrides with justification

---

## API Routes

### 1. Upload bank CSV
```typescript
// POST /api/staff/reconciliation/upload
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  // Parse CSV
  const transactions = await parseCSV(file);

  // Insert into bank_transactions
  const { data, error } = await supabase
    .from('bank_transactions')
    .insert(transactions.map(t => ({
      value_date: t.date,
      amount: t.amount,
      currency: t.currency,
      counterparty: t.counterparty,
      memo: t.memo,
      account_ref: t.account_ref,
      import_method: 'csv_upload',
      match_status: 'unmatched'
    })));

  return NextResponse.json({ imported: data.length });
}
```

### 2. Run auto-match
```typescript
// POST /api/staff/reconciliation/auto-match
export async function POST() {
  const { data: matches } = await supabase.rpc('run_auto_match');
  return NextResponse.json({ matches: matches?.length || 0 });
}
```

### 3. Accept match
```typescript
// POST /api/staff/reconciliation/match/accept
export async function POST(req: Request) {
  const { bank_transaction_id, subscription_id } = await req.json();

  // Update bank transaction
  await supabase
    .from('bank_transactions')
    .update({
      matched_subscription_id: subscription_id,
      match_status: 'matched'
    })
    .eq('id', bank_transaction_id);

  // Update subscription funded_amount
  const { data: txn } = await supabase
    .from('bank_transactions')
    .select('amount')
    .eq('id', bank_transaction_id)
    .single();

  await supabase
    .from('subscriptions')
    .update({
      funded_amount: sql`funded_amount + ${txn.amount}`
    })
    .eq('id', subscription_id);

  return NextResponse.json({ success: true });
}
```

### 4. Resolve discrepancy
```typescript
// POST /api/staff/reconciliation/resolve
export async function POST(req: Request) {
  const { bank_transaction_id, resolution_type, notes } = await req.json();
  const profile = await requireStaffAuth();

  await supabase
    .from('bank_transactions')
    .update({
      match_status: 'resolved',
      resolution_notes: `${resolution_type}: ${notes}`,
      resolved_by: profile.id,
      resolved_at: new Date().toISOString()
    })
    .eq('id', bank_transaction_id);

  return NextResponse.json({ success: true });
}
```

---

## Implementation Phases

### Phase 1: Core Matching (Week 1)
- [ ] Database migrations (capital_call_items, distribution_items, suggested_matches)
- [ ] CSV upload API
- [ ] Auto-match RPC function
- [ ] Basic reconciliation page with stats

### Phase 2: Manual Matching UI (Week 1-2)
- [ ] Suggested matches tab with accept/reject
- [ ] All transactions table with filters
- [ ] Manual match interface (click to link)
- [ ] Discrepancy resolution UI

### Phase 3: Per-Entity Views (Week 2)
- [ ] By Entity tab showing per-vehicle status
- [ ] Entity-specific transaction lists
- [ ] Entity reconciliation reports

### Phase 4: Capital Calls & Distributions (Week 3)
- [ ] Capital call items tracking
- [ ] Distribution items tracking
- [ ] Match bank txns to capital call items
- [ ] Distribution send/confirm workflow

### Phase 5: Audit & Reports (Week 3)
- [ ] Complete audit trail
- [ ] Export reconciliation reports (PDF/Excel)
- [ ] Discrepancy summary reports
- [ ] Per-entity reconciliation certificates

---

## Success Criteria

**Prevent another $850K disaster:**
- ✅ All bank transactions imported and tracked
- ✅ Missing transactions flagged immediately
- ✅ Complete audit trail (who matched what, when)
- ✅ Discrepancies resolved with notes

**Replace Fred's manual Excel:**
- ✅ Time to reconcile 1 entity: 2 hours → 15 minutes
- ✅ Auto-match rate: >75% of transactions
- ✅ All 40 entities reconciled in <10 hours total

**Trust & accuracy:**
- ✅ Zero unaccounted transactions
- ✅ All discrepancies explained and documented
- ✅ Investor confidence in amounts

---

## Critical Questions for Client

Before building:
1. **CSV Format:** Can you share sample bank CSV from ING? (anonymized)
2. **Access:** Who can upload/reconcile? (Fred + Julien only?)
3. **Approval:** Should discrepancies need dual approval?
4. **Tolerance:** Auto-accept bank fees <$50?
5. **Historical:** Import past transactions or start fresh?

---

**This is the plan. One page. Based on what Julien actually said. No bullshit.**
