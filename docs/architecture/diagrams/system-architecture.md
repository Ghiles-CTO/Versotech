# VERSO Holdings - System Architecture Diagrams

This document contains all major architecture diagrams in Mermaid format for the VERSO Holdings Platform.

## 1. High-Level System Overview

```mermaid
graph TB
    subgraph Users["Users"]
        INV[("👤 Investors")]
        STAFF[("👤 Staff")]
        INTRO[("👤 Introducers")]
    end

    subgraph Platform["VERSO Holdings Platform"]
        direction TB
        WEB["🌐 Next.js Web App<br/>Vercel"]
        API["⚡ API Routes"]
        MW["🔐 Auth Middleware"]
    end

    subgraph Supabase["Supabase Cloud"]
        direction TB
        DB[("🗄️ PostgreSQL<br/>+ RLS")]
        AUTH["🔑 Auth Service"]
        STORAGE["📁 Object Storage"]
        RT["📡 Realtime"]
    end

    subgraph External["External Services"]
        N8N["🔄 n8n Workflows"]
        ESIGN["✍️ E-Signature"]
        EMAIL["📧 Email Service"]
    end

    INV --> WEB
    STAFF --> WEB
    INTRO --> WEB

    WEB --> MW
    MW --> API
    MW --> AUTH

    API --> DB
    API --> STORAGE
    WEB --> RT
    RT --> DB

    API <--> N8N
    API <--> ESIGN
    API --> EMAIL

    classDef primary fill:#4F46E5,color:#fff,stroke:#4F46E5
    classDef secondary fill:#0EA5E9,color:#fff,stroke:#0EA5E9
    classDef external fill:#10B981,color:#fff,stroke:#10B981
    classDef storage fill:#8B5CF6,color:#fff,stroke:#8B5CF6

    class WEB,API,MW primary
    class DB,AUTH,STORAGE,RT secondary
    class N8N,ESIGN,EMAIL external
```

## 2. Dual-Portal Architecture

```mermaid
graph LR
    subgraph Browser
        USER[User Browser]
    end

    subgraph Portal["Portal Selection"]
        INV_LOGIN["/versoholdings/login"]
        STAFF_LOGIN["/versotech/login"]
    end

    subgraph Investor["Investor Portal<br/>/versoholdings/*"]
        INV_DASH["Dashboard"]
        INV_HOLD["Holdings"]
        INV_DEAL["Deals"]
        INV_DOC["Documents"]
        INV_MSG["Messages"]
    end

    subgraph Staff["Staff Portal<br/>/versotech/staff/*"]
        STAFF_DASH["Dashboard"]
        STAFF_INV["Investors"]
        STAFF_DEAL["Deals"]
        STAFF_APPR["Approvals"]
        STAFF_FEES["Fees"]
        STAFF_AUDIT["Audit"]
    end

    subgraph Shared["Shared Backend"]
        API["API Routes<br/>/api/*"]
        DB[("PostgreSQL")]
    end

    USER --> INV_LOGIN
    USER --> STAFF_LOGIN

    INV_LOGIN --> INV_DASH
    INV_DASH --> INV_HOLD
    INV_DASH --> INV_DEAL
    INV_DASH --> INV_DOC
    INV_DASH --> INV_MSG

    STAFF_LOGIN --> STAFF_DASH
    STAFF_DASH --> STAFF_INV
    STAFF_DASH --> STAFF_DEAL
    STAFF_DASH --> STAFF_APPR
    STAFF_DASH --> STAFF_FEES
    STAFF_DASH --> STAFF_AUDIT

    INV_DASH --> API
    STAFF_DASH --> API
    API --> DB
```

## 3. Authentication Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant MW as Middleware
    participant AUTH as Supabase Auth
    participant DB as PostgreSQL
    participant PAGE as Protected Page

    B->>AUTH: 1. POST /auth/signin
    AUTH->>AUTH: Validate credentials
    AUTH->>B: 2. Set cookies (access_token, refresh_token)

    B->>MW: 3. GET /versoholdings/dashboard
    MW->>AUTH: 4. Validate access_token
    alt Token Valid
        AUTH->>MW: Token OK
        MW->>DB: 5. Fetch user profile
        DB->>MW: Profile with role
        MW->>MW: 6. Check role permissions
        MW->>PAGE: 7. Allow request
        PAGE->>B: 8. Render page
    else Token Expired
        AUTH->>MW: Token expired
        MW->>AUTH: 9. Refresh with refresh_token
        AUTH->>MW: New access_token
        MW->>DB: Fetch profile
        MW->>PAGE: Allow request
    else Invalid Token
        AUTH->>MW: Invalid
        MW->>B: 10. Redirect to login
    end
```

## 4. Deal Subscription Workflow

```mermaid
stateDiagram-v2
    [*] --> DealOpen: Deal Published

    DealOpen --> InterestExpressed: Investor expresses interest
    InterestExpressed --> NDARequested: Request data room access

    NDARequested --> NDASent: n8n sends NDA via DocuSign
    NDASent --> NDASigned: Investor signs NDA
    NDASigned --> DataRoomAccess: Grant 7-day access

    DataRoomAccess --> SubscriptionSubmitted: Investor submits commitment
    SubscriptionSubmitted --> PendingApproval: Create approval record

    PendingApproval --> Approved: Staff approves
    PendingApproval --> Rejected: Staff rejects
    Rejected --> [*]

    Approved --> SubPackSent: n8n sends subscription pack
    SubPackSent --> SubPackSigned: Investor signs documents
    SubPackSigned --> CounterSigned: Staff countersigns

    CounterSigned --> FormalSubscription: Create subscription record
    FormalSubscription --> [*]

    note right of DataRoomAccess: Access expires after 7 days<br/>Can request extension
    note right of PendingApproval: May require secondary approval
```

## 5. Data Flow - Investor Dashboard

```mermaid
flowchart TB
    subgraph Client["Browser"]
        PAGE["Dashboard Page"]
        CHART["Portfolio Chart"]
        TABLE["Holdings Table"]
    end

    subgraph Server["Next.js Server"]
        SSR["Server Component"]
        CACHE["5-min Cache"]
    end

    subgraph Database["Supabase"]
        RLS["RLS Filter"]
        POS["positions"]
        SUB["subscriptions"]
        VEH["vehicles"]
    end

    PAGE --> SSR
    SSR --> CACHE
    CACHE -->|Cache Miss| RLS
    RLS --> POS
    RLS --> SUB
    RLS --> VEH

    POS --> AGG["Aggregate"]
    SUB --> AGG
    VEH --> AGG

    AGG --> SSR
    SSR --> PAGE
    PAGE --> CHART
    PAGE --> TABLE

    style RLS fill:#f59e0b,color:#000
```

## 6. Fee Processing Flow

```mermaid
flowchart LR
    subgraph Input["Fee Configuration"]
        FP["Fee Plan"]
        FC["Fee Components"]
        SUB["Subscriptions"]
    end

    subgraph Processing["Fee Calculation"]
        CALC["Calculate Fees"]
        VAL["Validate Amounts"]
    end

    subgraph Output["Invoice Generation"]
        INV["Create Invoice"]
        LINES["Invoice Lines"]
        PDF["Generate PDF"]
    end

    subgraph Delivery["Distribution"]
        NOTIFY["Email Notification"]
        PORTAL["Investor Portal"]
    end

    FP --> CALC
    FC --> CALC
    SUB --> CALC
    CALC --> VAL
    VAL --> INV
    INV --> LINES
    LINES --> PDF
    PDF --> NOTIFY
    PDF --> PORTAL
```

## 7. Document Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft: Upload Document

    Draft --> PendingApproval: Submit for Review
    PendingApproval --> Approved: Reviewer Approves
    PendingApproval --> Draft: Reviewer Requests Changes

    Approved --> Published: Publish to Investors
    Published --> Archived: Archive

    Draft --> Archived: Discard
    PendingApproval --> Archived: Cancelled

    Archived --> [*]

    note right of Draft: Only staff can see
    note right of Approved: Approved but not yet visible
    note right of Published: Visible to assigned investors
```

## 8. Workflow Integration

```mermaid
flowchart TB
    subgraph Platform["VERSO Platform"]
        TRIGGER["Trigger Service"]
        HANDLER["Webhook Handler"]
        RUNS["workflow_runs Table"]
    end

    subgraph N8N["n8n Workflows"]
        W1["Position Statement"]
        W2["NDA Processing"]
        W3["KYC Renewal"]
        W4["Capital Calls"]
        W5["Reporting Agent"]
    end

    subgraph External["External Services"]
        DOC["DocuSign"]
        EMAIL["Email"]
        STORAGE["Document Storage"]
    end

    TRIGGER -->|HMAC Signed| W1
    TRIGGER -->|HMAC Signed| W2
    TRIGGER -->|HMAC Signed| W3
    TRIGGER -->|HMAC Signed| W4
    TRIGGER -->|HMAC Signed| W5

    W1 -->|Generate PDF| STORAGE
    W2 -->|Send for Signing| DOC
    W3 -->|Send Reminder| EMAIL
    W4 -->|Generate Notice| STORAGE
    W5 -->|Generate Report| STORAGE

    W1 -->|Webhook Result| HANDLER
    W2 -->|Webhook Result| HANDLER
    DOC -->|Signature Complete| HANDLER

    HANDLER --> RUNS
```

## 9. Entity Relationship Diagram (Core Entities)

```mermaid
erDiagram
    PROFILES ||--o{ INVESTOR_USERS : "has"
    INVESTORS ||--o{ INVESTOR_USERS : "belongs_to"

    INVESTORS ||--o{ SUBSCRIPTIONS : "commits_to"
    VEHICLES ||--o{ SUBSCRIPTIONS : "receives"
    DEALS ||--o{ SUBSCRIPTIONS : "originates"

    VEHICLES ||--o{ DEALS : "offers"
    DEALS ||--o{ DEAL_MEMBERSHIPS : "has"
    INVESTORS ||--o{ DEAL_MEMBERSHIPS : "participates"

    INVESTORS ||--o{ DOCUMENTS : "owns"
    VEHICLES ||--o{ DOCUMENTS : "related_to"
    DEALS ||--o{ DOCUMENTS : "contains"

    PROFILES ||--o{ APPROVALS : "creates"
    INVESTORS ||--o{ APPROVALS : "relates_to"
    DEALS ||--o{ APPROVALS : "relates_to"

    FEE_PLANS ||--o{ FEE_COMPONENTS : "contains"
    DEALS ||--o{ FEE_PLANS : "uses"
    SUBSCRIPTIONS }o--|| FEE_PLANS : "applies"

    PROFILES {
        uuid id PK
        text email
        user_role role
        text display_name
    }

    INVESTORS {
        uuid id PK
        text legal_name
        text kyc_status
        text type
    }

    VEHICLES {
        uuid id PK
        text name
        vehicle_type type
        text currency
    }

    DEALS {
        uuid id PK
        text name
        deal_status_enum status
        uuid vehicle_id FK
    }

    SUBSCRIPTIONS {
        uuid id PK
        uuid investor_id FK
        uuid vehicle_id FK
        numeric commitment
        text status
    }
```

## 10. Deployment Architecture

```mermaid
graph TB
    subgraph Internet
        CDN["Vercel Edge Network<br/>CDN + SSL + DDoS"]
    end

    subgraph Vercel["Vercel Platform"]
        FUNC["Serverless Functions<br/>Next.js App"]
        STATIC["Static Assets<br/>Public Files"]
    end

    subgraph Supabase["Supabase Cloud (AWS)"]
        PG["PostgreSQL<br/>Primary DB"]
        PGPOOL["Connection Pooler<br/>PgBouncer"]
        S3["Object Storage<br/>S3-Compatible"]
        AUTH["Auth Service<br/>GoTrue"]
        REALTIME["Realtime<br/>Elixir/Phoenix"]
    end

    subgraph External["External Infrastructure"]
        N8N["n8n<br/>Docker Container"]
        ESIGN["DocuSign/Dropbox<br/>SaaS"]
    end

    CDN --> FUNC
    CDN --> STATIC
    FUNC --> PGPOOL
    PGPOOL --> PG
    FUNC --> S3
    FUNC --> AUTH
    FUNC --> REALTIME
    FUNC <--> N8N
    FUNC <--> ESIGN

    style CDN fill:#000,color:#fff
    style FUNC fill:#000,color:#fff
```

## 11. Security Layers

```mermaid
flowchart TB
    subgraph Layer1["Layer 1: Network"]
        TLS["TLS 1.3 Encryption"]
        CORS["CORS Policy"]
        RATE["Rate Limiting"]
    end

    subgraph Layer2["Layer 2: Authentication"]
        JWT["JWT Tokens"]
        REFRESH["Token Refresh"]
        MFA["MFA (Optional)"]
    end

    subgraph Layer3["Layer 3: Authorization"]
        RBAC["Role-Based Access"]
        MW["Middleware Checks"]
        PORTAL["Portal Boundaries"]
    end

    subgraph Layer4["Layer 4: Data"]
        RLS["Row-Level Security"]
        ENCRYPT["Encryption at Rest"]
        AUDIT["Audit Logging"]
    end

    subgraph Layer5["Layer 5: Integration"]
        HMAC["HMAC Signatures"]
        SECRET["Secret Management"]
        WEBHOOK["Webhook Verification"]
    end

    Layer1 --> Layer2
    Layer2 --> Layer3
    Layer3 --> Layer4
    Layer4 --> Layer5

    style Layer1 fill:#ef4444,color:#fff
    style Layer2 fill:#f97316,color:#fff
    style Layer3 fill:#eab308,color:#000
    style Layer4 fill:#22c55e,color:#fff
    style Layer5 fill:#3b82f6,color:#fff
```

## 12. Real-time Communication

```mermaid
sequenceDiagram
    participant Client1 as Investor Browser
    participant Client2 as Staff Browser
    participant RT as Supabase Realtime
    participant DB as PostgreSQL

    Client1->>RT: Subscribe to conversations:*
    Client2->>RT: Subscribe to conversations:*
    RT->>RT: Register subscriptions

    Client1->>DB: INSERT message
    DB->>DB: Trigger CDC
    DB->>RT: Broadcast change
    RT->>Client1: New message event
    RT->>Client2: New message event

    Note over Client1,Client2: Both users see<br/>message instantly
```

## Usage Notes

### Viewing Diagrams

These diagrams are written in [Mermaid](https://mermaid.js.org/) syntax and can be rendered:

1. **GitHub**: Automatically renders in markdown files
2. **VS Code**: Use Mermaid preview extension
3. **Mermaid Live Editor**: https://mermaid.live/
4. **Documentation Tools**: Docusaurus, GitBook, etc.

### Exporting Diagrams

To export as images:

1. Use Mermaid Live Editor → Export as PNG/SVG
2. Use mermaid-cli: `mmdc -i diagram.mmd -o diagram.png`
3. Use VS Code extension export feature

### Updating Diagrams

When updating architecture:

1. Update relevant diagrams in this file
2. Reference changes in ADRs if significant
3. Update C4 model documentation if structure changes
