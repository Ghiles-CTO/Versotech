# ADR-004: Integrate n8n for Workflow Automation

## Status

Accepted

## Date

2024-03-01

## Context

VERSO Holdings operations involve many repetitive, multi-step processes:

1. **Position Statement Generation**: Monthly investor statements from portfolio data
2. **NDA Processing**: Generate, send, track, and file signed NDAs
3. **KYC Renewal**: Automated reminders and document collection
4. **Capital Call Notices**: Generate and distribute capital call documents
5. **Document Distribution**: Bulk document uploads with notifications
6. **Reporting**: Custom report generation from templates

These workflows are:
- Too complex for simple cron jobs
- Require human review at certain steps
- Need to integrate multiple systems (email, e-signature, storage)
- Must handle errors gracefully with retries

The team needed a workflow automation solution that could:
- Handle complex multi-step processes
- Integrate with external APIs (DocuSign, email providers)
- Be managed by non-developers for simple changes
- Scale with the business

## Decision

We chose **n8n** as our workflow automation engine, integrated via webhooks with HMAC signature verification.

### Integration Architecture

```
┌─────────────────┐     HMAC-signed      ┌─────────────┐
│  VERSO Platform │ ───────────────────→ │    n8n      │
│  (Next.js API)  │     webhook POST     │  Workflows  │
│                 │ ←─────────────────── │             │
│                 │     webhook POST     │             │
└─────────────────┘     with results     └─────────────┘
```

### Key Components

1. **Workflow Definitions** (`src/lib/workflows.ts`): TypeScript definitions with input schemas
2. **Trigger Service** (`src/lib/trigger-workflow.ts`): HMAC signing, idempotency, error handling
3. **Workflow Runs Table**: Track execution status, store results
4. **Webhook Handlers**: Receive n8n callbacks with results

## Consequences

### Positive

- **Visual Workflow Builder**: Non-developers can understand and modify simple workflows
- **Extensive Integrations**: 400+ built-in nodes for external services
- **Self-Hosted Option**: Control over data residency and security
- **Retry Logic**: Built-in error handling and retry mechanisms
- **Webhook Support**: Native HTTP trigger and response capabilities
- **Scalable**: Can run multiple workflows concurrently

### Negative

- **Additional Infrastructure**: Need to host and maintain n8n instance
- **Debugging Complexity**: Errors span two systems (platform + n8n)
- **Webhook Security**: Must implement HMAC verification carefully
- **State Management**: Workflow state lives outside main database
- **Learning Curve**: Team needs to learn n8n patterns

### Neutral

- **Decoupled Architecture**: Workflows independent of main application
- **Version Control**: Workflow definitions in JSON (can be exported)

## Alternatives Considered

### Alternative 1: In-Application Background Jobs

Use a job queue library like Bull/BullMQ with Redis.

```typescript
const emailQueue = new Queue('email');

emailQueue.process(async (job) => {
  await sendEmail(job.data);
});
```

**Rejected because**:
- All workflow logic in application code
- Harder for non-developers to modify
- Custom integration code for each external service
- No visual representation of workflows

### Alternative 2: Temporal.io

Use Temporal for durable workflow orchestration.

**Rejected because**:
- Overkill for current workflow complexity
- Steeper learning curve
- Higher infrastructure requirements
- No visual workflow builder

### Alternative 3: AWS Step Functions

Use AWS managed workflow service.

**Rejected because**:
- Tightly coupled to AWS ecosystem
- More expensive for our usage patterns
- Less flexible for rapid iteration
- JSON-based workflow definitions harder to maintain

### Alternative 4: Zapier/Make.com

Use hosted no-code automation platforms.

**Rejected because**:
- Data leaves our infrastructure
- Limited customization for complex logic
- Per-task pricing expensive at scale
- Less control over security

## Implementation Details

### Workflow Definition Structure

```typescript
interface WorkflowDefinition {
  key: string;           // Unique identifier
  title: string;         // Display name
  category: 'documents' | 'compliance' | 'communications' | 'data_processing' | 'multi_step';
  inputSchema: WorkflowField[];  // Zod-validated input fields
  requiredRole?: string;  // Role restriction
}
```

### Trigger Flow

```typescript
// 1. Define workflow input
const input = {
  investor_id: 'uuid',
  as_of_date: '2024-12-01'
};

// 2. Trigger workflow
const result = await triggerWorkflow({
  workflowKey: 'generate-position-statement',
  data: input,
  triggeredBy: userId
});

// 3. Handle result
if (result.success) {
  // result.runId contains the workflow_runs record ID
  // Poll for completion or wait for webhook
}
```

### HMAC Security

```typescript
// Outbound (Platform → n8n)
const signature = crypto
  .createHmac('sha256', process.env.N8N_OUTBOUND_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');

headers['x-verso-signature'] = signature;

// Inbound (n8n → Platform)
const expectedSignature = crypto
  .createHmac('sha256', process.env.N8N_INBOUND_SECRET)
  .update(rawBody)
  .digest('hex');

if (receivedSignature !== expectedSignature) {
  throw new Error('Invalid webhook signature');
}
```

### Production Workflows

| Key | Purpose | Trigger | Outputs |
|-----|---------|---------|---------|
| `generate-position-statement` | Monthly statements | Manual/Scheduled | PDF document |
| `process-nda` | NDA signing workflow | Manual | Signed PDF, data room access |
| `inbox-manager` | Email categorization | Scheduled | Task assignments |
| `kyc-aml-processing` | Due diligence | Scheduled | Risk assessments |
| `capital-call-processing` | Capital call notices | Scheduled | PDF notices, emails |
| `reporting-agent` | Custom reports | Manual | Excel/PDF reports |
| `investor-onboarding` | Onboarding flow | Scheduled | Task creation |

## Monitoring

### Workflow Status Tracking

```sql
SELECT
  workflow_key,
  status,
  COUNT(*) as count,
  AVG(duration_ms) as avg_duration
FROM workflow_runs
WHERE created_at > now() - interval '7 days'
GROUP BY workflow_key, status;
```

### Error Monitoring

- All workflow errors logged to `workflow_runs.error_message`
- Failed workflows create compliance alerts
- Dashboard shows workflow health metrics

## References

- [n8n Documentation](https://docs.n8n.io/)
- [Workflow Definitions](../../src/lib/workflows.ts)
- [Trigger Service](../../src/lib/trigger-workflow.ts)
- [Webhook Security Guide](../security/webhooks.md)

## Notes

- n8n hosted on dedicated Docker container
- Consider n8n Cloud for reduced maintenance
- Workflow JSON definitions should be version-controlled
- Test workflows in staging before production deployment
