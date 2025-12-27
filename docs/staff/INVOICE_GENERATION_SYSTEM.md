# Invoice Generation System

## Overview

The invoice generation system automates the creation and distribution of fee invoices to investors. It integrates with n8n for PDF generation, email delivery, and document storage.

## Architecture

### Flow Diagram

```
Subscription (committed)
    ↓
[1] Calculate Fee Events → fee_events table (status: accrued)
    ↓
[2] Generate Invoice → invoices table (status: draft)
    ↓
[3] Webhook to n8n → PDF generation + Email + Storage
    ↓
[4] n8n Callback → Update invoice (status: sent)
    ↓
[5] Create Document + Task + Reconciliation Expectation
```

### Components

#### 1. Fee Event Calculation (`/api/staff/fees/events/calculate`)

**Trigger**: When subscription status changes to 'committed'

**Source of Truth**:
- **Amounts**: From `subscriptions` table (subscription_fee_percent, bd_fee_amount, etc.)
- **Frequency**: From linked `fee_plan` → `fee_components` (frequency, payment_schedule)
- **Fallback**: If no fee_plan_id, defaults to `one_time` / `upfront`

**Output**: Creates `fee_events` records with status `accrued`

**Fee Types Supported**:
- `subscription` - Subscription fee (% or flat)
- `bd_fee` - Broker-dealer fee (% or flat)
- `finra_fee` - FINRA regulatory fee (flat)
- `spread_markup` - Spread markup fee (flat)
- `performance` - Performance fee (tiered, calculated on exit)

**Example Request**:
```json
POST /api/staff/fees/events/calculate
{
  "subscription_id": "uuid"
}
```

**Example Response**:
```json
{
  "success": true,
  "message": "Created 3 fee events",
  "data": {
    "subscription_id": "uuid",
    "investor_name": "Acme Fund LP",
    "deal_name": "Series A Investment",
    "fee_event_ids": ["uuid1", "uuid2", "uuid3"],
    "fee_events_summary": [
      {
        "type": "subscription",
        "amount": 50000,
        "frequency": "one_time",
        "payment_schedule": "upfront"
      },
      {
        "type": "bd_fee",
        "amount": 10000,
        "frequency": "one_time",
        "payment_schedule": "upfront"
      },
      {
        "type": "finra_fee",
        "amount": 500,
        "frequency": "one_time",
        "payment_schedule": "upfront"
      }
    ]
  }
}
```

#### 2. Invoice Generation (`/api/staff/fees/invoices/generate`)

**Trigger**: Staff clicks "Generate Invoice" button in Fees page

**Inputs**:
- `investor_id` - UUID of investor
- `deal_id` - UUID of deal (optional)
- `fee_event_ids` - Array of fee event UUIDs (must be status: accrued)
- `due_date` - ISO date string
- `notes` - Optional invoice notes
- `custom_line_items` - Optional array of custom charges

**Process**:
1. Validates all fee events are in `accrued` status
2. Fetches investor and deal details
3. Calculates totals from fee events + custom line items
4. Generates invoice number: `INV-YYYY-NNNN` format
5. Creates `invoices` record (status: `draft`)
6. Creates `invoice_lines` records
7. Updates fee events to status: `invoiced`
8. Sends webhook to n8n with HMAC signature

**Webhook Payload to n8n**:
```json
{
  "invoice_id": "uuid",
  "invoice_number": "INV-2025-0001",
  "investor": {
    "id": "uuid",
    "legal_name": "Acme Fund LP",
    "email": "finance@acmefund.com"
  },
  "deal": {
    "id": "uuid",
    "name": "Series A Investment"
  },
  "due_date": "2025-02-28",
  "subtotal": 60500,
  "total": 60500,
  "currency": "USD",
  "line_items": [
    {
      "description": "Subscription fee for 5000000 commitment",
      "quantity": 1,
      "unit_price": 50000,
      "amount": 50000
    },
    {
      "description": "Broker-dealer fee for 5000000 commitment",
      "quantity": 1,
      "unit_price": 10000,
      "amount": 10000
    },
    {
      "description": "FINRA regulatory fee",
      "quantity": 1,
      "unit_price": 500,
      "amount": 500
    }
  ],
  "notes": "Payment due within 30 days",
  "callback_url": "https://app.versoholdings.com/api/webhooks/invoice-generated"
}
```

**Security**: HMAC-SHA256 signature sent in `X-VERSO-Signature` header

#### 3. n8n Workflow

**Expected n8n Actions**:
1. Verify HMAC signature (`X-VERSO-Signature` header)
2. Generate PDF invoice from template
3. Upload PDF to Supabase Storage
4. Upload PDF to Google Drive (optional)
5. Send email to investor with PDF attachment
6. Call back to `/api/webhooks/invoice-generated`

**n8n Callback Payload**:
```json
{
  "invoice_id": "uuid",
  "invoice_number": "INV-2025-0001",
  "supabase_url": "https://project.supabase.co/storage/v1/object/public/documents/invoices/INV-2025-0001.pdf",
  "gdrive_url": "https://drive.google.com/file/d/xxxx/view",
  "email_sent": true,
  "metadata": {
    "file_size": 152048,
    "mime_type": "application/pdf"
  }
}
```

#### 4. Invoice Callback Handler (`/api/webhooks/invoice-generated`)

**Trigger**: n8n calls this endpoint after PDF generation

**Security**: Verifies HMAC signature in `X-N8N-Signature` header

**Process**:
1. Verifies webhook signature
2. Fetches invoice with investor details
3. Creates `documents` record:
   - type: `invoice`
   - category: `invoices`
   - file_key: Supabase Storage URL
   - external_url: Google Drive URL
4. Creates `tasks` record for investor:
   - title: "Pay Invoice INV-YYYY-NNNN"
   - assignee: investor's user_id
   - category: `payment`
   - priority: `high`
   - due_date: invoice.due_date
   - status: `pending`
   - metadata: invoice details
5. Updates `invoices` record:
   - status: `sent`
   - sent_at: current timestamp
   - doc_id: created document ID
6. Creates `reconciliation_matches` expectation:
   - match_type: `expected`
   - matched_amount: invoice.total
   - match_confidence: 100
   - status: `pending`

**Response**:
```json
{
  "success": true,
  "message": "Invoice processed successfully",
  "data": {
    "invoice_id": "uuid",
    "document_id": "uuid",
    "task_created": true
  }
}
```

## Environment Variables

Required environment variables in `.env.local`:

```bash
# n8n Invoice Generation Webhook
N8N_INVOICE_GENERATION_WEBHOOK_URL=https://your-n8n.com/webhook/invoice-generation

# Webhook Security Secrets
N8N_OUTBOUND_SECRET=your-secret-for-signing-outbound-webhooks
N8N_INBOUND_SECRET=your-secret-for-verifying-inbound-webhooks

# Application URL (for callbacks)
NEXT_PUBLIC_APP_URL=https://app.versoholdings.com
```

## Database Tables

### `fee_events`
**Purpose**: Stores individual fee charges that can be invoiced

**Key Columns**:
- `allocation_id` - Links to subscription
- `fee_type` - Type of fee (subscription, bd_fee, etc.)
- `status` - Lifecycle: accrued → invoiced → paid
- `computed_amount` - Final fee amount
- `rate_bps` - Fee rate in basis points (if percentage-based)
- `base_amount` - Base amount fee was calculated from

### `invoices`
**Purpose**: Invoice header records

**Key Columns**:
- `invoice_number` - Format: INV-YYYY-NNNN
- `investor_id` - Invoice recipient
- `deal_id` - Associated deal (optional)
- `status` - Lifecycle: draft → sent → paid
- `total` - Total invoice amount
- `balance_due` - Remaining unpaid amount
- `due_date` - Payment due date
- `sent_at` - When invoice was sent
- `doc_id` - Links to documents table (PDF)

### `invoice_lines`
**Purpose**: Line items on invoices

**Key Columns**:
- `invoice_id` - Parent invoice
- `fee_event_id` - Source fee event (if applicable)
- `kind` - Fee type
- `description` - Line item description
- `quantity` - Quantity
- `unit_price` - Price per unit
- `amount` - Total line amount

### `reconciliation_matches`
**Purpose**: Tracks expected and actual payment matches

**Key Columns**:
- `invoice_id` - Expected invoice payment
- `transaction_id` - Actual bank transaction (when matched)
- `match_type` - `expected` or `confirmed`
- `matched_amount` - Amount matched
- `match_confidence` - 0-100 confidence score
- `status` - `pending` → `matched` → `reconciled`

## Integration with Reconciliation System

When an invoice is sent, a reconciliation expectation is created:

```sql
INSERT INTO reconciliation_matches (
  invoice_id,
  match_type,
  matched_amount,
  match_confidence,
  match_reason,
  status
) VALUES (
  invoice.id,
  'expected',
  invoice.total,
  100,
  'Invoice sent, awaiting payment',
  'pending'
);
```

When a bank transaction is imported (via reconciliation page):
1. System searches for pending reconciliation matches
2. Matches based on:
   - Amount (within tolerance)
   - Investor name/reference
   - Date proximity
3. Updates match:
   - `transaction_id` = matched transaction
   - `match_type` = 'confirmed'
   - `status` = 'matched'
4. Updates invoice:
   - `balance_due` -= matched amount
   - `status` = 'paid' (if fully paid)

## Testing

### 1. Test Fee Event Calculation

```bash
curl -X POST http://localhost:3000/api/staff/fees/events/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "subscription_id": "subscription-uuid"
  }'
```

### 2. Test Invoice Generation

```bash
curl -X POST http://localhost:3000/api/staff/fees/invoices/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "investor_id": "investor-uuid",
    "deal_id": "deal-uuid",
    "fee_event_ids": ["fee-event-uuid-1", "fee-event-uuid-2"],
    "due_date": "2025-02-28",
    "notes": "Payment due within 30 days"
  }'
```

### 3. Test Webhook Callback (from n8n)

```bash
# Generate HMAC signature
echo -n '{"invoice_id":"..."}' | openssl dgst -sha256 -hmac "your-inbound-secret"

curl -X POST http://localhost:3000/api/webhooks/invoice-generated \
  -H "Content-Type: application/json" \
  -H "X-N8N-Signature: CALCULATED_HMAC" \
  -d '{
    "invoice_id": "invoice-uuid",
    "invoice_number": "INV-2025-0001",
    "supabase_url": "https://project.supabase.co/storage/...",
    "gdrive_url": "https://drive.google.com/...",
    "email_sent": true,
    "metadata": {
      "file_size": 152048,
      "mime_type": "application/pdf"
    }
  }'
```

## Error Handling

### Common Errors

**1. Fee events already exist**
```json
{
  "warning": "Fee events already exist for this subscription",
  "subscription_id": "uuid",
  "existing_events_count": 3
}
```
**Solution**: Fee events are idempotent per subscription. Delete existing events if recalculation is needed.

**2. Invalid subscription status**
```json
{
  "error": "Invalid subscription status",
  "details": "Subscription must be in 'committed' status. Current status: active"
}
```
**Solution**: Only committed subscriptions can have initial fee events calculated.

**3. No accrued fee events found**
```json
{
  "error": "No valid accrued fee events found"
}
```
**Solution**: Fee events must be in `accrued` status to be invoiced. Check fee_events table.

**4. Webhook signature verification failed**
```json
{
  "error": "Invalid signature"
}
```
**Solution**: Verify N8N_INBOUND_SECRET matches the secret used by n8n workflow.

## Future Enhancements

1. **Recurring Invoices**: Auto-generate invoices based on fee frequency (quarterly, annual)
2. **Invoice Templates**: Customizable PDF templates per investor or deal
3. **Multi-Currency Support**: Support for non-USD invoices
4. **Partial Payments**: Track partial payments and update balance_due
5. **Credit Notes**: Support for invoice credits and refunds
6. **Payment Reminders**: Auto-send reminders when invoices are overdue
7. **Invoice Approval Workflow**: Multi-level approval before sending
8. **Batch Invoicing**: Generate multiple invoices in one operation
