# ADR-006: Implement Webhook-Based Integrations

## Status

Accepted

## Date

2024-03-15

## Context

VERSO Holdings integrates with multiple external systems:

1. **n8n**: Workflow automation (bidirectional)
2. **DocuSign/Dropbox Sign**: E-signature (bidirectional)
3. **Bank Systems**: Transaction imports (inbound)
4. **Email Services**: Notifications (outbound)

These integrations require:
- **Asynchronous communication**: External processes take time (signing, processing)
- **Reliable delivery**: Critical for financial operations
- **Security**: Prevent unauthorized calls to our API
- **Auditability**: Track all external interactions

The challenge was choosing an integration pattern that balances simplicity, security, and reliability.

## Decision

We implemented a **webhook-based integration architecture** with HMAC signature verification for all external system communication.

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        VERSO Platform                                │
│                                                                      │
│  ┌──────────────────┐     ┌──────────────────┐                     │
│  │  Trigger Service │     │  Webhook Handler │                     │
│  │  (Outbound)      │     │  (Inbound)       │                     │
│  └────────┬─────────┘     └────────┬─────────┘                     │
│           │                        │                                 │
│           ↓                        ↑                                 │
│  ┌────────────────────────────────────────────┐                    │
│  │          HMAC Signature Layer              │                    │
│  │  • Sign outbound payloads                   │                    │
│  │  • Verify inbound signatures                │                    │
│  │  • Reject invalid requests                  │                    │
│  └────────────────────────────────────────────┘                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                    ↑↓                      ↑↓
            ┌───────────────┐       ┌───────────────┐
            │     n8n       │       │   DocuSign    │
            └───────────────┘       └───────────────┘
```

### Key Components

1. **Outbound Webhooks**: Trigger external workflows with HMAC-signed payloads
2. **Inbound Webhooks**: Receive callbacks with signature verification
3. **Idempotency**: Prevent duplicate processing with idempotency tokens
4. **Audit Logging**: Record all webhook events

## Consequences

### Positive

- **Loose Coupling**: External systems operate independently
- **Scalability**: Async processing handles varying loads
- **Security**: HMAC signatures prevent unauthorized calls
- **Resilience**: Failed webhooks can be retried
- **Auditability**: Full record of external interactions
- **Standard Pattern**: Well-understood integration model

### Negative

- **Complexity**: Webhook handling adds code complexity
- **Debugging**: Async flows harder to trace
- **Delivery Guarantees**: Need retry mechanisms for failures
- **State Management**: Need to track pending callbacks
- **Testing**: Harder to test without mock servers

### Neutral

- **Infrastructure**: Webhook endpoints must be publicly accessible
- **Monitoring**: Need webhook-specific monitoring

## Alternatives Considered

### Alternative 1: Polling-Based Integration

Poll external systems periodically for updates.

```typescript
// Poll every 5 minutes for signature status
cron.schedule('*/5 * * * *', async () => {
  const pendingEnvelopes = await getPendingEnvelopes();
  for (const envelope of pendingEnvelopes) {
    const status = await docusign.getStatus(envelope.id);
    if (status === 'completed') {
      await processSignedDocument(envelope);
    }
  }
});
```

**Rejected because**:
- Wasteful (many empty polls)
- Higher latency (up to 5 minutes)
- More complex state management
- Higher API rate limits consumed

### Alternative 2: Message Queue (RabbitMQ/SQS)

Use message queues for all async communication.

**Rejected because**:
- Additional infrastructure to manage
- External systems would need queue access
- Overkill for current integration volume
- Webhooks already supported by external services

### Alternative 3: GraphQL Subscriptions

Use GraphQL subscriptions for real-time updates.

**Rejected because**:
- External systems don't support GraphQL
- Adds complexity without benefit
- Webhook is standard for e-signature providers

## Implementation Details

### HMAC Signing (Outbound)

```typescript
// src/lib/trigger-workflow.ts
export async function triggerWorkflow(options: TriggerOptions) {
  const payload = {
    workflowKey: options.workflowKey,
    data: options.data,
    runId: crypto.randomUUID(),
    timestamp: Date.now(),
  };

  const signature = crypto
    .createHmac('sha256', process.env.N8N_OUTBOUND_SECRET!)
    .update(JSON.stringify(payload))
    .digest('hex');

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Verso-Signature': signature,
      'X-Idempotency-Key': payload.runId,
      'X-Workflow-Run-Id': payload.runId,
    },
    body: JSON.stringify(payload),
  });

  return { success: response.ok, runId: payload.runId };
}
```

### HMAC Verification (Inbound)

```typescript
// src/app/api/automation/[...path]/route.ts
export async function POST(req: Request) {
  const rawBody = await req.text();
  const receivedSignature = req.headers.get('X-Verso-Signature');

  const expectedSignature = crypto
    .createHmac('sha256', process.env.N8N_INBOUND_SECRET!)
    .update(rawBody)
    .digest('hex');

  if (receivedSignature !== expectedSignature) {
    await logSecurityEvent('invalid_webhook_signature', {
      path: req.url,
      ip: req.headers.get('x-forwarded-for')
    });
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  await processWebhook(payload);

  return Response.json({ success: true });
}
```

### Idempotency Handling

```typescript
// Prevent duplicate processing
export async function processWebhookIdempotently(
  idempotencyKey: string,
  processor: () => Promise<void>
) {
  // Check if already processed
  const existing = await db.webhookEvents.findUnique({
    where: { idempotency_key: idempotencyKey }
  });

  if (existing?.processed_at) {
    return { success: true, message: 'Already processed' };
  }

  // Mark as processing
  await db.webhookEvents.upsert({
    where: { idempotency_key: idempotencyKey },
    create: { idempotency_key: idempotencyKey, started_at: new Date() },
    update: { started_at: new Date() }
  });

  try {
    await processor();

    // Mark as completed
    await db.webhookEvents.update({
      where: { idempotency_key: idempotencyKey },
      data: { processed_at: new Date() }
    });

    return { success: true };
  } catch (error) {
    // Mark as failed for retry
    await db.webhookEvents.update({
      where: { idempotency_key: idempotencyKey },
      data: { error: error.message }
    });

    throw error;
  }
}
```

### Webhook Endpoints

| Endpoint | Purpose | Source |
|----------|---------|--------|
| `/api/automation/nda-complete` | NDA signed callback | n8n/DocuSign |
| `/api/automation/subscription-complete` | Subscription signed | n8n/DocuSign |
| `/api/automation/workflow-result` | General workflow result | n8n |
| `/api/esign/webhook` | E-signature events | DocuSign/Dropbox |

### Environment Variables

```bash
# Outbound webhook signing
N8N_OUTBOUND_SECRET=long-random-secret-for-outbound

# Inbound webhook verification
N8N_INBOUND_SECRET=long-random-secret-for-inbound

# E-signature webhook verification
ESIGN_WEBHOOK_SECRET=provider-webhook-secret
```

## Security Measures

1. **HMAC-SHA256 Signatures**: All webhooks signed with shared secrets
2. **Timestamp Validation**: Reject webhooks older than 5 minutes
3. **IP Allowlisting**: Optional IP restrictions for known sources
4. **Rate Limiting**: Prevent webhook flooding
5. **Audit Logging**: Record all webhook events (success and failure)

## Monitoring

### Webhook Health Dashboard

```sql
SELECT
  endpoint,
  status,
  COUNT(*) as count,
  AVG(processing_time_ms) as avg_time
FROM webhook_events
WHERE created_at > now() - interval '1 hour'
GROUP BY endpoint, status;
```

### Alerts

- Failed webhook verification (security event)
- High webhook error rate (>5% in 5 minutes)
- Webhook processing time (>10 seconds)
- Duplicate webhook attempts (>3 for same idempotency key)

## References

- [HMAC Security](https://en.wikipedia.org/wiki/HMAC)
- [n8n Webhook Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [DocuSign Connect](https://developers.docusign.com/platform/webhooks/connect/)

## Notes

- Secrets stored in environment variables, never in code
- Rotate webhook secrets quarterly
- Monitor for signature verification failures
- Consider webhook replay protection for critical endpoints
