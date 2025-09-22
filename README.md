# VERSO Holdings Investor & Staff Portal

A secure, dual-brand platform for managing investor relations and operations across VERSO Holdings' $800M+ investment vehicles.

## 🏗️ Architecture

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **UI Components**: shadcn/ui with custom VERSO branding
- **Automation**: n8n workflow engine integration
- **Security**: Row-Level Security (RLS), HMAC webhook verification

## 🚀 Quick Start

### Prerequisites

1. **Supabase Account**: Create a project at [supabase.com](https://supabase.com)
2. **Node.js 18+**: Required for Next.js 15

### Environment Setup

1. **Clone and install dependencies:**
   ```bash
   cd versotech-portal
   npm install
   ```

2. **Create environment variables:**
   Create a `.env.local` file in the project root:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # n8n Webhook Configuration
   N8N_OUTBOUND_SECRET=your-secure-random-secret-for-outbound-webhooks
   N8N_INBOUND_SECRET=your-secure-random-secret-for-inbound-webhooks

   # E-Signature Configuration (DocuSign or Dropbox Sign)
   ESIGN_API_KEY=your-esign-api-key
   ESIGN_WEBHOOK_SECRET=your-esign-webhook-secret

   # Storage Configuration
   DOCS_BUCKET=docs

   # Environment
   NODE_ENV=development
   ```

### Database Setup

1. **Run the database schema:**
   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Copy and run the contents of `database/schema.sql`

2. **Apply Row-Level Security policies:**
   - Copy and run the contents of `database/rls-policies.sql`

3. **Create storage bucket:**
   - Go to Storage in your Supabase dashboard
   - Create a bucket named `docs`
   - Configure appropriate policies for document access

### Development

```bash
npm run dev
```

The application will be available at:
- **Investor Portal**: http://localhost:3000/versoholdings/login
- **Staff Portal**: http://localhost:3000/versotech/login

## 🎨 Dual-Brand Architecture

The platform serves two distinct user bases with separate branding:

### VERSO Holdings (Investor Portal)
- Route prefix: `/versoholdings`
- Purpose: Investor self-service portal
- Features: Portfolio views, document access, report requests

### VERSO Tech (Staff Portal)  
- Route prefix: `/versotech`
- Purpose: Operations and management
- Features: Workflow automation, request management, audit logs

## 📁 Project Structure

```
src/
├── app/
│   ├── (public)/          # Public routes (login pages)
│   ├── (investor)/        # Investor portal routes
│   ├── (staff)/          # Staff portal routes
│   └── api/              # API endpoints
├── lib/                  # Utilities and configurations
├── components/           # Reusable UI components
└── middleware.ts         # Route protection and auth
```

## 🔐 Security Features

- **Row-Level Security**: Database-level data isolation
- **Multi-Factor Authentication**: Required for staff, optional for investors
- **Role-Based Access Control**: Fine-grained permissions
- **Audit Logging**: Complete activity tracking
- **Document Watermarking**: Secure document access
- **Webhook Verification**: HMAC-signed webhook communications

## 🔧 Key Features

### For Investors
- **Portfolio Dashboard**: Real-time NAV, performance metrics, cash flows
- **Document Library**: Secure access to statements, contracts, reports
- **Quick Requests**: Self-service report generation
- **Vehicle Directory**: Detailed views of investment vehicles
- **Secure Messaging**: Direct communication with VERSO staff

### For Staff
- **Operations Dashboard**: KYC pipeline, pending requests, system health
- **Process Center**: Automated workflow triggers (6 key processes)
- **Request Management**: Handle custom investor requests
- **Document Management**: Upload, e-sign, distribute documents
- **Audit Tools**: Complete activity logs and compliance tracking

## 📊 Workflow Integration

The platform integrates with n8n for process automation:

- **Inbox Manager**: Email processing and routing
- **Shared-Drive Notification**: Document sync alerts  
- **LinkedIn Leads Scraper**: Lead generation automation
- **Positions Statement**: Automated report generation
- **NDA Agent**: Contract processing workflow
- **Reporting Agent**: Custom report creation

## 🌍 Production Deployment

### Vercel Deployment
```bash
npm run build
vercel deploy
```

### Environment Variables
Ensure all production environment variables are configured in your deployment platform.

### Database Considerations
- Use Supabase's EU region for GDPR compliance
- Configure automated backups
- Set up monitoring and alerting

## 📜 License

Proprietary software for VERSO Holdings.

## 🆘 Support

For technical support or questions about the platform, contact the development team.

