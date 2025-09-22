# VERSO Holdings Investor & Staff Portal

## Complete Feature Specification

  

---

  

## 🏢 **Platform Purpose**

  

The VERSO Holdings Portal is a secure, two-sided platform that connects investors with VERSO staff across multiple investment vehicles. The platform manages investor relations, fund operations, and compliance for VERSO Holdings' merchant banking operations covering private equity, venture capital, and real estate investments.

  

### **Business Context**

- **Assets Under Management**: $800M+

- **Investment Vehicles**: VERSO FUND (BVI), REAL Empire, SPVs, Direct Notes

- **Regulatory Requirements**: BVI Professional Mutual Fund regulations, GDPR compliance

- **Geographic Scope**: Luxembourg entities, international investor base

  

---

  

## 👥 **User Types & Access Control**

  

### **Investor Users**

External users representing individual or institutional investors with access restricted to their own investment data through row-level security.

  

### **Staff Users**

Internal VERSO team members with three permission levels:

  

#### **Staff Admin**

Complete system access including user management, vehicle configuration, and system administration.

  

#### **Staff Operations**

Handles investor onboarding, KYC processing, document workflows, and operational compliance tasks.

  

#### **Staff Relationship Manager/Portfolio Manager**

Manages investor communications, performance reporting, and relationship management activities.

  

---

  

## 🎯 **Core Platform Features**

  

### **1. INVESTOR DASHBOARD**

  

#### **Key Performance Indicators Display**

- **Current Net Asset Value**: Aggregated NAV across all entitled vehicles

- **Total Capital Contributed**: Cumulative capital calls paid to date

- **Total Distributions**: All distributions received across vehicles

- **Unfunded Commitment**: Remaining capital obligation

- **Performance Metrics**: IRR, DPI, TVPI calculations where applicable

  

#### **Holdings Overview**

- **Vehicle Summary Table**: List of all vehicles with position details

- **Investment Details**: Units held, cost basis, current valuation, acquisition dates

- **Performance Charts**: NAV trends, cash flow timelines, return analysis

- **Upcoming Events**: Capital call deadlines, expected distributions, important dates

  

#### **Activity Feed**

- **Recent Documents**: Newly available reports, statements, legal documents

- **Messages**: Unread communications from VERSO staff

- **Tasks**: Outstanding onboarding or compliance requirements

- **Notifications**: System alerts, process updates, deadline reminders

  

### **2. STAFF OPERATIONS DASHBOARD**

  

#### **Pipeline Management**

- **Onboarding Funnel**: Investors at each stage of the onboarding process

- **KYC Queue**: Pending identity verifications and compliance reviews

- **Document Processing**: E-signature status, document generation queue

- **Report Requests**: Open investor report requests with SLA tracking

  

#### **Process Monitoring**

- **Workflow Status**: Active n8n processes and completion status

- **System Health**: Integration monitoring, error tracking, performance metrics

- **Compliance Tracking**: Regulatory deadlines, renewal requirements, audit preparations

- **Communication Queue**: Unread investor messages, response time tracking

  

#### **Operational Metrics**

- **Performance KPIs**: Task completion rates, response times, SLA adherence

- **User Activity**: Login patterns, feature usage, engagement metrics

- **System Utilization**: Document downloads, report generation frequency

- **Error Monitoring**: Failed processes, system issues, user-reported problems

  

### **3. INVESTMENT HOLDINGS & PERFORMANCE**

  

#### **Multi-Vehicle Portfolio Management**

- **Vehicle Types**:

  - **VERSO FUND**: BVI Professional Mutual Fund with FSC regulation compliance

  - **REAL Empire**: Real estate securitization products and compartments

  - **Special Purpose Vehicles**: Deal-specific investment structures

  - **Direct Investment Notes**: Individual investment instruments

  

#### **Position Details**

- **Current Holdings**: Units/shares owned, percentage ownership, cost basis

- **Valuation Information**: Current NAV per unit, total position value, unrealized gains/losses

- **Investment History**: Acquisition dates, capital call history, distribution record

- **Performance Analytics**: Time-weighted and money-weighted returns, benchmark comparisons

  

#### **Cash Flow Management**

- **Capital Calls**: Historical payments, upcoming obligations, wire instructions

- **Distributions**: Received payments, classification (return of capital, income, capital gains)

- **Commitment Tracking**: Original commitment, funded amount, remaining obligation

- **Cash Flow Timeline**: Visual representation of payments and receipts over time

  

### **4. DOCUMENT MANAGEMENT SYSTEM**

  

#### **Secure Document Vault**

- **Document Categories**:

  - **Legal Documents**: NDAs, subscription agreements, partnership documents, amendments

  - **Financial Reports**: Position statements, performance reports, tax documents, K-1s

  - **Compliance Materials**: KYC documentation, regulatory filings, audit reports

  - **Operational Communications**: Capital call notices, distribution memos, investor letters

  - **Marketing Materials**: Quarterly reports, investment presentations, market updates

  

#### **Security Features**

- **Document Watermarking**: Automatic watermarking with investor name, download timestamp, unique identifier

- **Access Control**: Document-level permissions based on vehicle entitlements and user roles

- **Secure Downloads**: Pre-signed URLs with short expiration times (15 minutes maximum)

- **Audit Trail**: Complete logging of document access, downloads, and sharing activities

- **Version Control**: Historical document versions with change tracking and approval workflows

  

#### **Document Processing**

- **Upload Security**: Virus scanning, malware detection, file type validation

- **Metadata Extraction**: Automatic tagging, categorization, searchable content indexing

- **Distribution Management**: Automated document sharing to entitled investors based on vehicle access

- **Retention Policies**: Automated archival and deletion based on document type and regulatory requirements

  

### **5. ONBOARDING & TASK MANAGEMENT**

  

#### **Investor Onboarding Workflow**

- **Account Creation**: User registration, email verification, initial access setup

- **Identity Verification**: Document upload, identity confirmation, beneficial ownership disclosure

- **KYC/AML Processing**: Sanctions screening, risk assessment, professional investor qualification

- **Legal Documentation**: NDA execution, subscription agreement completion, banking information collection

- **Investment Activation**: Initial capital call processing, position setup, portal access completion

  

#### **Task Management System**

- **Dynamic Task Generation**: Automatic task creation based on investor type, vehicle selection, and regulatory requirements

- **Progress Tracking**: Real-time status updates, completion percentages, milestone achievements

- **Deadline Management**: Automated reminders, escalation procedures, overdue task highlighting

- **Staff Assignment**: Automatic task routing to appropriate team members based on expertise and workload

- **Dependency Management**: Task sequencing, prerequisite validation, workflow coordination

  

#### **Compliance Tracking**

- **Regulatory Requirements**: BVI professional investor criteria, GDPR consent management, AML compliance

- **Documentation Status**: Required document collection, approval status, renewal tracking

- **Risk Assessment**: Ongoing monitoring, periodic reviews, risk rating updates

- **Audit Preparation**: Compliance documentation, audit trail maintenance, regulatory reporting

  

### **6. REPORTING & ANALYTICS ENGINE**

  

#### **Standard Report Library**

- **Position Statements**: Current holdings across all vehicles with detailed breakdowns

- **Performance Reports**: Return analysis with benchmark comparisons and peer group data

- **Cash Flow Statements**: Historical and projected capital movements with timing analysis

- **Tax Documentation**: Annual K-1 packages, foreign tax credits, withholding summaries

- **Compliance Reports**: Regulatory filings, beneficial ownership updates, audit documentation

  

#### **Custom Report Generation**

- **Self-Service Portal**: Investor-initiated report requests with flexible parameter selection

- **Filter Options**:

  - **Date Ranges**: Inception to date, calendar year, fiscal year, custom periods

  - **Vehicle Selection**: Single vehicle, multiple vehicles, or entire portfolio

  - **Currency Options**: USD, EUR, GBP, or investor's base currency

  - **Output Formats**: PDF, Excel, CSV with customizable layouts

- **Automated Processing**: n8n workflow engine for report generation and delivery

- **SLA Management**: Service level agreement tracking, escalation procedures, quality assurance

  

#### **Performance Analytics**

- **Return Calculations**: IRR (money-weighted), TWR (time-weighted), DPI, TVPI, MOIC

- **Risk Metrics**: Volatility analysis, drawdown measurements, correlation studies

- **Benchmarking**: Comparison against relevant indices, peer groups, and target returns

- **Attribution Analysis**: Performance decomposition by asset class, geography, time period

- **Scenario Analysis**: Stress testing, sensitivity analysis, what-if modeling

  

### **7. COMMUNICATION & MESSAGING**

  

#### **In-Portal Messaging System**

- **Secure Communications**: End-to-end encrypted messaging between investors and staff

- **Real-Time Features**: Live chat functionality, typing indicators, read receipts

- **File Sharing**: Document attachments, image sharing, spreadsheet exchange

- **Conversation Management**: Message threading, search functionality, archival system

- **Group Communications**: Multi-participant discussions for complex topics or announcements

  

#### **Notification Management**

- **Multi-Channel Delivery**: In-app notifications, email alerts, SMS notifications (optional)

- **Customizable Preferences**: User-controlled notification settings by category and delivery method

- **Content Categories**:

  - **Transactional**: Capital calls, distributions, document availability

  - **Informational**: Market updates, performance summaries, system announcements

  - **Operational**: Task reminders, deadline alerts, process completions

  - **Security**: Login alerts, password changes, suspicious activity warnings

  

#### **Signal Integration (Optional)**

- **Matrix Bridge**: Professional Signal connectivity through Element Matrix Services

- **Message Synchronization**: Bidirectional message flow between Signal and portal

- **Contact Management**: Automatic contact discovery and group management

- **Compliance Features**: Message archival, audit trail maintenance, regulatory compliance

  

### **8. WORKFLOW AUTOMATION & PROCESS MANAGEMENT**

  

#### **n8n Integration Framework**

- **Process Categories**:

  - **Onboarding Automation**: KYC verification, document generation, account setup

  - **Reporting Engine**: Automated report creation, data compilation, delivery workflows

  - **Compliance Monitoring**: Deadline tracking, renewal alerts, regulatory submissions

  - **Communication Workflows**: Notification distribution, escalation procedures, response tracking

  - **Data Management**: External system integration, data validation, synchronization processes

  

#### **Staff Process Triggers**

- **One-Click Operations**: Button-driven workflow initiation from staff dashboard

- **Process Types**:

  - **"Generate Position Statement"**: Instant investor position report creation

  - **"Run KYC Check"**: Comprehensive compliance verification workflow

  - **"Issue Capital Call"**: Multi-step capital call generation and distribution

  - **"Process Distribution"**: Distribution calculation and payment workflow

  - **"Send Document Package"**: Bulk document distribution to entitled investors

  

#### **Event-Driven Automation**

- **Trigger Events**:

  - **Document Upload**: Automatic virus scanning and metadata processing

  - **E-Signature Completion**: Task status updates and next-step initiation

  - **Report Request**: Immediate workflow start and processing queue entry

  - **Performance Update**: Automatic investor notification and dashboard refresh

  - **Deadline Approach**: Proactive alert generation and escalation procedures

  

#### **Webhook Security & Integration**

- **HMAC Verification**: Cryptographic signature validation for all webhook communications

- **Timestamp Validation**: Protection against replay attacks and stale requests

- **Idempotency Controls**: Duplicate request prevention and transaction integrity

- **Rate Limiting**: Protection against abuse and system overload

- **Error Handling**: Automatic retry mechanisms and failure notification systems

  

### **9. SECURITY & COMPLIANCE FRAMEWORK**

  

#### **Authentication & Authorization**

- **Multi-Factor Authentication**: Required for all staff users, optional for investors

- **Role-Based Access Control**: Granular permissions based on user role and vehicle entitlements

- **Row-Level Security**: Database-level data isolation ensuring investors see only their data

- **Session Management**: Automatic timeouts, concurrent session limits, secure session handling

  

#### **Data Protection**

- **Encryption Standards**:

  - **In Transit**: TLS 1.3 for all communications

  - **At Rest**: AES-256 encryption for stored data

  - **Field-Level**: Additional encryption for sensitive PII and financial data

- **Key Management**: Automatic key rotation, secure key storage, access auditing

- **Data Residency**: EU-based data storage for GDPR compliance requirements

  

#### **Regulatory Compliance**

- **GDPR Framework**:

  - **Data Subject Rights**: Right to erasure, data portability, access requests

  - **Consent Management**: Granular consent tracking and withdrawal mechanisms

  - **Privacy Controls**: Data minimization, purpose limitation, storage limitation

- **BVI Compliance**:

  - **Professional Investor Verification**: Automated qualification checking

  - **Offering Document Management**: Regulatory document distribution and tracking

  - **Reporting Requirements**: Automated regulatory submission preparation

- **KYC/AML Standards**:

  - **Customer Due Diligence**: Comprehensive identity verification workflows

  - **Sanctions Screening**: Real-time checking against global sanctions lists

  - **Ongoing Monitoring**: Periodic review cycles and risk assessment updates

  

#### **Audit & Monitoring**

- **Immutable Audit Log**: Hash-chained entries preventing tampering or deletion

- **Activity Tracking**: Complete user action logging with detailed context information

- **Access Monitoring**: Failed login attempts, unusual access patterns, privilege escalation alerts

- **Data Flow Tracking**: Complete data lineage and processing audit trails

- **Incident Response**: Automated alert systems and investigation workflow triggers

  

### **10. ADMINISTRATIVE FUNCTIONS**

  

#### **User Management**

- **Account Lifecycle**: User provisioning, role assignment, access modification, deactivation

- **Bulk Operations**: Mass user import, role updates, vehicle entitlement changes

- **Access Reviews**: Periodic certification, unused account cleanup, privilege validation

- **Self-Service Features**: Password reset, profile updates, notification preferences

  

#### **Vehicle & Investment Management**

- **Vehicle Configuration**: New vehicle setup, entitlement rules, performance benchmarks

- **Investment Processing**: Position updates, valuation imports, cash flow recording

- **Performance Calculation**: Automated return computations, benchmark comparisons

- **Reporting Configuration**: Custom report templates, data source mapping

  

#### **System Configuration**

- **Feature Management**: Environment-specific feature flags and capability controls

- **Integration Settings**: Third-party service configuration, API key management

- **Workflow Customization**: n8n process modification, approval workflows, escalation rules

- **Template Management**: Communication templates, document templates, report formats

  

#### **Monitoring & Analytics**

- **System Health**: Performance monitoring, error tracking, capacity planning

- **Usage Analytics**: Feature utilization, user engagement, adoption metrics

- **Business Intelligence**: Executive dashboards, trend analysis, operational insights

- **Capacity Planning**: Resource utilization monitoring and scaling recommendations

  

---

  

## 🛠 **Technical Requirements**

  

### **Frontend Specifications**

- **Framework**: Next.js with App Router for server-side rendering and optimal performance

- **Language**: TypeScript for type safety and enhanced developer experience

- **Styling**: Tailwind CSS for responsive design and consistent UI components

- **Component Library**: Custom components with shadcn/ui foundation for design consistency

- **Form Management**: React Hook Form with Zod validation for robust data handling

- **Data Visualization**: Chart.js integration for performance charts and analytics display

  

### **Backend Architecture**

- **Database**: PostgreSQL with Supabase for managed hosting, authentication, and real-time features

- **Authentication**: Supabase Auth with Row-Level Security policies for data isolation

- **API Layer**: Next.js API routes with server-side validation and error handling

- **File Storage**: Supabase Storage with pre-signed URLs and access control

- **Real-Time Features**: Supabase Realtime for live chat and notification delivery

  

### **Integration Ecosystem**

- **Workflow Engine**: n8n for process automation and external system integration

- **Back-Office Tools**: NocoDB for staff operational views and data management

- **E-Signature Platform**: DocuSign or Dropbox Sign for legal document execution

- **Document Processing**: Server-side PDF generation, watermarking, and manipulation

- **Monitoring Solutions**: Sentry for error tracking, performance monitoring, and alerting

  

### **Infrastructure & Deployment**

- **Application Hosting**: Vercel for Next.js deployment with global CDN

- **Database Hosting**: Supabase managed PostgreSQL with automatic backups

- **Environment Management**: Development, staging, and production environments

- **Security Monitoring**: Automated vulnerability scanning and penetration testing

- **Backup & Recovery**: Automated daily backups with point-in-time recovery capabilities

  

---

  

## 📊 **Performance & Quality Standards**

  

### **Performance Requirements**

- **Page Load Times**: Initial page load under 2 seconds, subsequent navigation under 500ms

- **API Response Times**: Database queries under 100ms, complex operations under 500ms

- **Availability**: 99.9% uptime with planned maintenance windows

- **Scalability**: Support for 1000+ concurrent users and 10,000+ total users

- **Data Processing**: Large report generation under 30 seconds, real-time notifications under 5 seconds

  

### **Security Standards**

- **Zero Critical Vulnerabilities**: No unpatched critical security vulnerabilities

- **Penetration Testing**: Annual third-party security assessments with remediation

- **Compliance Audits**: Regular SOC 2 Type II compliance validation

- **Incident Response**: Complete incident response plan with 24-hour maximum resolution time

- **Data Breach Prevention**: Multi-layered security controls with continuous monitoring

  

### **User Experience Standards**

- **Mobile Responsiveness**: Full functionality across desktop, tablet, and mobile devices

- **Accessibility**: WCAG 2.1 AA compliance for users with disabilities

- **Browser Support**: Latest versions of Chrome, Firefox, Safari, and Edge

- **Offline Capability**: Graceful degradation when network connectivity is limited

- **Internationalization**: Support for multiple languages and currency formats

  

---

  

*This specification defines the complete feature set for the VERSO Holdings Investor & Staff Portal, serving as the definitive reference for platform capabilities and requirements.*