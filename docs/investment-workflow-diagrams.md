flowchart TB
    subgraph KYC["0. INVESTOR ONBOARDING & KYC"]
        K1[Investor Registers] --> K2[Complete KYC Questionnaire]
        K2 --> K3[Upload Identity Documents]
        K3 --> K4[Sanctions/PEP Screening]
        K4 --> K5{Clear?}
        K5 -->|No| K6[Enhanced Due Diligence Required]
        K5 -->|Yes| K7[Assign AML Risk Rating]
        K6 --> K7
        K7 --> K8[Entity Onboarding]
        K8 --> K9[Register Beneficial Owners]
        K9 --> K10[Designate Authorized Signatories]
        K10 --> K11[Accreditation Verification]
        K11 --> K12{Qualified?}
        K12 -->|No| K13[Limited Investment Options]
        K12 -->|Yes| K14[Full Access Granted]
        K13 --> K15[Collect W-8/W-9 Tax Forms]
        K14 --> K15
        K15 --> K16[Setup Bank Account]
        K16 --> K17[KYC Status: APPROVED]
    end

    subgraph DEAL["1. DEAL SETUP"]
        K17 --> D1[Staff Creates Deal]
        D1 --> D2[Status: DRAFT]
        D2 --> D3[Auto-Create Deal Folder]
        D3 --> D4[Create 6 Subfolders]
        D4 --> D5[Link Vehicle + Inherit Logo]
        D5 --> D6[Configure Fee Structure]
        D6 --> D7[Set Price Per Share]
        D7 --> D8[Set Payment Deadline Days]
        D8 --> D9[Publish Fee Structure]
        D9 --> D10[Create Share Lot Inventory]
        D10 --> D11[Upload Data Room Documents]
        D11 --> D12[Set Document Visibility Rules]
        D12 --> D13[Publish Deal]
        D13 --> D14[Status: OPEN]
    end

    subgraph INTEREST["2. INVESTOR INTEREST"]
        D14 --> I1[Investor Clicks Interested]
        I1 --> I2[Interest Created: PENDING]
        I2 --> I3{Amount Check}
        I3 -->|Over $1M| I4[Priority: CRITICAL - SLA 2hr]
        I3 -->|$250K-$1M| I5[Priority: HIGH - SLA 4hr]
        I3 -->|$50K-$250K| I6[Priority: MEDIUM - SLA 24hr]
        I3 -->|Under $50K| I7[Priority: LOW - SLA 72hr]
        I4 --> I8[Auto-Assign to Staff by Type]
        I5 --> I8
        I6 --> I8
        I7 --> I8
        I8 --> I9{Staff Approves?}
        I9 -->|No| I10[Rejected - Audit Logged]
        I9 -->|Yes| I11[Interest: APPROVED]
    end

    subgraph NDA["3. NDA PROCESS"]
        I11 --> N1[Trigger n8n NDA Workflow]
        N1 --> N2[n8n Generates NDA Document]
        N2 --> N3[Returns Google Drive URL]
        N3 --> N4[Download PDF from Drive]
        N4 --> N5[Upload to Signatures Bucket]
        N5 --> N6[Create Signature Request]
        N6 --> N7[Generate Token - 48hr Expiry]
        N7 --> N8[Create Tasks for Both Parties]
        N8 --> N9[Send Email: NDA Ready]
        N9 --> N10[Investor Signs as Party A]
        N10 --> N11[Admin Counter-Signs as Party B]
        N11 --> N12[NDA Status: COMPLETED]
    end

    subgraph DATAROOM["4. DATA ROOM ACCESS"]
        N12 --> DR1[Auto-Grant Data Room Access]
        DR1 --> DR2[Access Window: 7 Days]
        DR2 --> DR3[Investor Reviews Documents]
        DR3 --> DR4{Day 4?}
        DR4 -->|Yes| DR5[Cron: Send 3-Day Warning]
        DR4 -->|No| DR3
        DR5 --> DR6{Day 7?}
        DR6 -->|No| DR7{Extension Request?}
        DR7 -->|Yes| DR8[Create Extension Approval]
        DR8 --> DR9{Approved?}
        DR9 -->|Yes| DR10[Reset: New 7 Days]
        DR9 -->|No| DR11[Access Expires]
        DR6 -->|Yes| DR12[Cron: Auto-Revoke]
        DR7 -->|No| DR6
        DR10 --> DR3
        DR11 --> DR13[Documents Hidden]
        DR12 --> DR13
    end

    subgraph SUBSCRIPTION["5. SUBSCRIPTION SUBMISSION"]
        DR3 --> S1[Investor Submits Subscription]
        S1 --> S2{Data Room Access?}
        S2 -->|No| S3[Error: Access Required]
        S2 -->|Yes| S4{Entity Ownership?}
        S4 -->|No| S5[Error: Entity Not Owned]
        S4 -->|Yes| S6{Ticket Size OK?}
        S6 -->|Below Min| S7[Warning: Below Minimum]
        S6 -->|Above Max| S8[Warning: Above Maximum]
        S6 -->|OK| S9[Continue]
        S7 --> S9
        S8 --> S9
        S9 --> S10{Oversubscription?}
        S10 -->|Yes| S11[Warning: May Be Reduced]
        S10 -->|No| S12[Continue]
        S11 --> S12
        S12 --> S13[Submission: PENDING]
        S13 --> S14{Staff Approves?}
        S14 -->|No| S15[Rejected]
        S14 -->|Yes| S16[Lookup Fee Structure]
        S16 --> S17[Calculate Price Per Share]
        S17 --> S18[Calculate Num Shares]
        S18 --> S19[Calculate Fees]
        S19 --> S20[Set Funding Due Date]
        S20 --> S21[Link Introducer if Exists]
        S21 --> S22[Subscription: DRAFT]
        S22 --> S23[Allocate from Share Lots - FIFO]
    end

    subgraph PACK["6. SUBSCRIPTION PACK SIGNATURE"]
        S22 --> P1[Trigger n8n Pack Workflow]
        P1 --> P2[n8n Generates DOCX Pack]
        P2 --> P3[Upload to Deal-Documents]
        P3 --> P4[Staff Reviews Pack]
        P4 --> P5[Staff Marks Ready]
        P5 --> P6{Lock Available?}
        P6 -->|No| P7[Wait - In Progress]
        P7 --> P6
        P6 -->|Yes| P8[Acquire Lock]
        P8 --> P9[Create Signature Request]
        P9 --> P10[Investor Signs Pack]
        P10 --> P11[Upload Investor-Signed PDF]
        P11 --> P12[Admin Counter-Signs]
        P12 --> P13[Upload Fully-Signed PDF]
        P13 --> P14[Release Lock]
        P14 --> P15[Set contract_date]
        P15 --> P16[Subscription: COMMITTED]
        P16 --> P17[Notify: Commitment Confirmed]
    end

    subgraph FEES["7. FEE EVENTS"]
        P16 --> F1[Trigger Fee Creation]
        F1 --> F2{Already Exist?}
        F2 -->|Yes| F3[Skip - Idempotent]
        F2 -->|No| F4[Create Commitment Fee]
        F4 --> F5[Create Subscription Fee]
        F5 --> F6[Schedule Management Fees]
        F6 --> F7[Create BD Fee]
        F7 --> F8[Create FINRA Fee]
        F8 --> F9[Create Spread Fee]
        F9 --> F10{Performance Tiers?}
        F10 -->|Tier 1| F11[Create Tier 1 Fee]
        F10 -->|Tier 2| F12[Create Tier 2 Fee]
        F10 -->|No| F13[Continue]
        F11 --> F13
        F12 --> F13
        F13 --> F14[Fee Status: ACCRUED]
    end

    subgraph INVOICE["8. INVOICING"]
        F14 --> INV1[Staff Creates Invoice]
        INV1 --> INV2[Generate: INV-YYYY-NNNN]
        INV2 --> INV3[Invoice: DRAFT]
        INV3 --> INV4[Create Line Items]
        INV4 --> INV5[Calculate Total Due]
        INV5 --> INV6[Staff Sends Invoice]
        INV6 --> INV7[Trigger n8n PDF]
        INV7 --> INV8[Upload PDF]
        INV8 --> INV9[Invoice: SENT]
        INV9 --> INV10[Fee Status: INVOICED]
        INV10 --> INV11[Email Invoice to Investor]
    end

    subgraph PAYMENT["9. PAYMENT & RECONCILIATION"]
        INV11 --> PAY1[Investor Wires Funds]
        PAY1 --> PAY2[Upload Bank Statement CSV]
        PAY2 --> PAY3[Parse Transactions]
        PAY3 --> PAY4[Auto-Match Algorithm]
        PAY4 --> PAY5[Amount Score: 0-50pts]
        PAY5 --> PAY6[Counterparty Score: 0-40pts]
        PAY6 --> PAY7[Timeliness Score: 0-10pts]
        PAY7 --> PAY8{Score >= 50?}
        PAY8 -->|No| PAY9[Manual Match]
        PAY8 -->|Yes| PAY10[Suggest Match]
        PAY9 --> PAY11[Staff Selects Type]
        PAY10 --> PAY11
        PAY11 --> PAY12{Match Type}
        PAY12 -->|Exact| PAY13[Full Match]
        PAY12 -->|Split| PAY14[Split Across Invoices]
        PAY12 -->|Combined| PAY15[Multiple to One]
        PAY12 -->|Partial| PAY16[Partial Payment]
        PAY13 --> PAY17[Apply Match]
        PAY14 --> PAY17
        PAY15 --> PAY17
        PAY16 --> PAY17
        PAY17 --> PAY18[Update Invoice]
        PAY18 --> PAY19[Update funded_amount]
        PAY19 --> PAY20[Fee Status: PAID]
    end

    subgraph PORTFOLIO["10. POSITION CREATION"]
        PAY19 --> POS1{Fully Funded?}
        POS1 -->|No| POS2[Invoice: PARTIALLY_PAID]
        POS2 --> PAY1
        POS1 -->|Yes| POS3[Invoice: PAID]
        POS3 --> POS4[Subscription: ACTIVE]
        POS4 --> POS5{Position Exists?}
        POS5 -->|Yes| POS6[Update Position]
        POS5 -->|No| POS7[Calculate Units]
        POS7 --> POS8[Set cost_basis]
        POS8 --> POS9[Set last_nav]
        POS9 --> POS10[Create Position]
        POS10 --> POS11[Visible in Portfolio]
        POS6 --> POS11
    end

    subgraph CAPITALCALL["11. CAPITAL CALLS"]
        POS11 --> CC1[Staff Creates Capital Call]
        CC1 --> CC2[Set % of Commitment]
        CC2 --> CC3[Calculate Amount Per Investor]
        CC3 --> CC4[Set Due Date]
        CC4 --> CC5[Generate Wire Instructions]
        CC5 --> CC6[Notify Investors]
        CC6 --> CC7[Track Responses]
        CC7 --> CC8[Reconcile Payments]
    end

    subgraph DISTRIBUTION["12. DISTRIBUTIONS"]
        CC8 --> DIST1[Record Distribution Event]
        DIST1 --> DIST2[Set Distribution Type]
        DIST2 --> DIST3[Calculate Per Investor]
        DIST3 --> DIST4[Process Payments]
        DIST4 --> DIST5[Update DPI Metrics]
    end

    subgraph NAV["13. NAV & VALUATIONS"]
        DIST5 --> NAV1[Staff Uploads Valuation]
        NAV1 --> NAV2[Update nav_per_unit]
        NAV2 --> NAV3[Update Position last_nav]
        NAV3 --> NAV4[Recalculate KPIs]
        NAV4 --> NAV5[Update TVPI/IRR]
        NAV5 --> NAV6[Investor Portfolio Updated]
    end

    subgraph DEALCLOSE["14. DEAL CLOSING"]
        NAV6 --> DC1{All Positions Funded?}
        DC1 -->|No| DC2[Status: ALLOCATION_PENDING]
        DC2 --> POS11
        DC1 -->|Yes| DC3[Deal Status: CLOSED]
        DC3 --> DC4[Final Reconciliation]
        DC4 --> DC5[Archive Deal Documents]
    end

    subgraph CRON["BACKGROUND JOBS"]
        CRON1[Daily: Data Room Expiry]
        CRON2[Daily: 3-Day Warnings]
        CRON3[5min: Lock Cleanup]
        CRON4[6hr: Auto-Match]
        CRON5[Daily: Scheduled Fees]
        CRON6[Daily: KYC Expiry Check]
    end

    subgraph TRIGGERS["DATABASE TRIGGERS"]
        TR1[Auto-Assign Approval]
        TR2[Set SLA Deadline]
        TR3[Log Approval History]
        TR4[Unlock Tasks]
        TR5[Audit Hash Chain]
        TR6[Auto-Create Folder]
    end