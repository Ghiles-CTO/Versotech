# Email Notification Implementation Guide

## Overview

Email notifications are currently **NOT IMPLEMENTED** in the signature workflow. The Resend package is installed but not configured. This guide explains how to complete the email implementation.

## Current Status

- ✅ Resend package installed (`package.json`: `"resend": "^6.4.2"`)
- ❌ Resend API key not configured
- ❌ Email templates not created
- ❌ Email sending functions not implemented

## Implementation Steps

### 1. Configure Resend API Key

Add to `.env.local`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

### 2. Create Email Service

Create `/src/lib/email/resend-service.ts`:
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendSignatureReadyEmail(params: {
  to: string
  investorName: string
  documentType: string
  signingUrl: string
  dueDate: Date
}) {
  const { data, error } = await resend.emails.send({
    from: 'VERSO Holdings <noreply@versoholdings.com>',
    to: params.to,
    subject: 'Signature Required: Subscription Agreement',
    html: `
      <h2>Document Ready for Signature</h2>
      <p>Dear ${params.investorName},</p>
      <p>Your ${params.documentType} is ready for signature.</p>
      <p>Please sign by: ${params.dueDate.toLocaleDateString()}</p>
      <a href="${params.signingUrl}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
        Sign Document
      </a>
      <p>This link will expire in 7 days.</p>
    `
  })

  return { data, error }
}

export async function sendSignatureCompleteEmail(params: {
  to: string
  investorName: string
  documentType: string
  commitment: number
}) {
  const { data, error } = await resend.emails.send({
    from: 'VERSO Holdings <noreply@versoholdings.com>',
    to: params.to,
    subject: 'Subscription Agreement Fully Executed',
    html: `
      <h2>Investment Commitment Confirmed</h2>
      <p>Dear ${params.investorName},</p>
      <p>Your ${params.documentType} has been fully executed by all parties.</p>
      <p>Commitment Amount: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(params.commitment)}</p>
      <p>You can view your documents in the investor portal.</p>
    `
  })

  return { data, error }
}

export async function sendSignatureReminderEmail(params: {
  to: string
  investorName: string
  documentType: string
  signingUrl: string
  daysRemaining: number
}) {
  const { data, error } = await resend.emails.send({
    from: 'VERSO Holdings <noreply@versoholdings.com>',
    to: params.to,
    subject: `Reminder: ${params.daysRemaining} days left to sign`,
    html: `
      <h2>Signature Reminder</h2>
      <p>Dear ${params.investorName},</p>
      <p>This is a reminder that your ${params.documentType} is awaiting signature.</p>
      <p>You have ${params.daysRemaining} days remaining to sign.</p>
      <a href="${params.signingUrl}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
        Sign Now
      </a>
    `
  })

  return { data, error }
}
```

### 3. Update Signature Request Endpoint

In `/api/subscriptions/[id]/documents/[documentId]/ready-for-signature/route.ts`:

After creating signature request (line 99):
```typescript
import { sendSignatureReadyEmail } from '@/lib/email/resend-service'
import { SIGNATURE_CONFIG } from '@/lib/config/signature-config'

// Send email if configured
if (SIGNATURE_CONFIG.emailNotifications.enabled) {
  // Email to investor
  if (subscription.investor?.email) {
    await sendSignatureReadyEmail({
      to: subscription.investor.email,
      investorName: subscription.investor.legal_name || subscription.investor.display_name,
      documentType: 'Subscription Agreement',
      signingUrl: investorSigData.signing_url,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })
  }

  // Email to staff
  await sendSignatureReadyEmail({
    to: designatedSigner.email,
    investorName: `${subscription.investor?.legal_name} (Countersignature)`,
    documentType: 'Subscription Agreement',
    signingUrl: staffSigData.signing_url,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  })
}
```

### 4. Update Signature Handler

In `/lib/signature/handlers.ts`, after subscription is committed:

```typescript
import { sendSignatureCompleteEmail } from '@/lib/email/resend-service'
import { SIGNATURE_CONFIG } from '@/lib/config/signature-config'

// Send completion email
if (SIGNATURE_CONFIG.emailNotifications.enabled && subscription.investor?.email) {
  await sendSignatureCompleteEmail({
    to: subscription.investor.email,
    investorName: subscription.investor.legal_name || subscription.investor.display_name,
    documentType: 'Subscription Agreement',
    commitment: subscription.commitment
  })
}
```

### 5. Create Reminder Cron Job

Create `/api/cron/signature-reminders/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendSignatureReminderEmail } from '@/lib/email/resend-service'
import { shouldSendReminder } from '@/lib/config/signature-config'

export async function GET() {
  const supabase = createServiceClient()

  // Get pending signature requests
  const { data: pendingSignatures } = await supabase
    .from('signature_requests')
    .select(`
      *,
      tasks!inner(
        id,
        due_at,
        created_at,
        owner_user_id,
        owner_investor_id
      )
    `)
    .eq('status', 'pending')

  for (const sig of pendingSignatures || []) {
    const task = sig.tasks[0]
    if (!task?.due_at) continue

    const dueDate = new Date(task.due_at)
    const createdDate = new Date(task.created_at)

    if (shouldSendReminder(createdDate, dueDate)) {
      // Send reminder
      const daysRemaining = Math.floor((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

      await sendSignatureReminderEmail({
        to: sig.signer_email,
        investorName: sig.signer_name,
        documentType: sig.document_type,
        signingUrl: sig.signing_url,
        daysRemaining
      })

      // Log reminder sent
      await supabase.from('audit_logs').insert({
        action: 'signature_reminder_sent',
        entity_type: 'signature_request',
        entity_id: sig.id,
        metadata: { days_remaining: daysRemaining }
      })
    }
  }

  return NextResponse.json({ success: true })
}
```

### 6. Update Configuration

In `/lib/config/signature-config.ts`, enable emails:
```typescript
emailNotifications: {
  enabled: true, // Change from false to true
  sendToInvestor: true,
  sendToStaff: true,
  ccOperations: true,
  operationsEmail: 'operations@versoholdings.com'
}
```

## Testing

1. Set up Resend account and get API key
2. Add key to environment variables
3. Test with a single signature request
4. Monitor Resend dashboard for delivery status
5. Check spam folders

## Email Best Practices

1. **SPF/DKIM/DMARC**: Configure domain authentication in Resend
2. **Unsubscribe Links**: Add to transactional emails for compliance
3. **Plain Text Fallback**: Include text version for better deliverability
4. **Rate Limiting**: Resend has limits - batch sends if needed
5. **Error Handling**: Log failed emails for manual follow-up

## Alternative: SendGrid

If Resend doesn't work, SendGrid is a good alternative:

```bash
npm install @sendgrid/mail
```

```typescript
import sgMail from '@sendgrid/mail'
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const msg = {
  to: 'recipient@example.com',
  from: 'noreply@versoholdings.com',
  subject: 'Signature Required',
  text: 'Please sign your document',
  html: '<strong>Please sign your document</strong>',
}

sgMail.send(msg)
```

## Monitoring

Create dashboard to track:
- Emails sent per day
- Delivery rate
- Open rate (if tracking enabled)
- Click rate on signature links
- Bounce rate
- Spam complaints

## Compliance

- Include physical mailing address (CAN-SPAM requirement)
- Clear identification of sender
- Accurate subject lines
- Option to opt-out of non-transactional emails
- Store email consent preferences