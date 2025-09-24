# VERSO Holdings Portal

A secure, comprehensive platform for investor relations and fund operations management.

## Overview

The VERSO Holdings Portal is a two-sided platform that connects investors with fund managers through secure, deal-scoped collaboration. Built with Next.js 15 and Supabase, it provides advanced features for portfolio management, fee accounting, document automation, and real-time communication.

## Features

### Core Platform
- **Deal-scoped Collaboration**: Secure investor access limited to their specific investments
- **Dual-brand Architecture**: Separate portals for VERSO Holdings (investor-facing) and VersoTech (staff operations)
- **Advanced Authentication**: Role-based access control with staff/investor segregation
- **Real-time Updates**: Live notifications and messaging using Supabase Realtime

### Investment Management
- **Inventory Management**: No-oversell protection with automatic allocation tracking
- **Reservation System**: Temporary inventory holds with automatic expiration
- **Fee Accounting**: Automated fee computation, accrual, and invoicing
- **Document Automation**: Template-based document generation with e-signature workflows

### Advanced Admin Features
- **Introducer Management**: Commission tracking and relationship management
- **Bank Reconciliation**: AI-powered transaction matching and manual reconciliation tools
- **Advanced Fee Configuration**: Flexible fee structures with investor-specific overrides
- **Document Package Automation**: Automated document workflows and template management

## Tech Stack

### Frontend
- **Next.js 15** with App Router and Server Components
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Lucide React** for icons

### Backend & Database
- **Supabase** (PostgreSQL + Authentication + Storage + Realtime)
- **Row-Level Security (RLS)** for data isolation
- **Database Functions** for complex business logic
- **Service Role** for privileged operations

### External Integrations
- **n8n** for workflow automation
- **Sonner** for toast notifications
- **Chart.js** for data visualization

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (investor)/              # Investor-facing routes
│   │   └── versoholdings/       # VERSO Holdings portal
│   ├── (staff)/                 # Staff-facing routes
│   │   └── versotech/           # VersoTech operations portal
│   └── api/                     # API routes
├── components/                  # Reusable React components
│   ├── layout/                  # Layout components
│   ├── ui/                      # Base UI components
│   └── deals/                   # Deal-specific components
├── lib/                         # Utilities and configurations
│   ├── supabase/               # Supabase client configurations
│   ├── auth.ts                 # Authentication helpers
│   └── utils.ts                # General utilities
└── types/                      # TypeScript type definitions
```

## Database Schema

The platform uses a comprehensive 48-table PostgreSQL schema with 29 ENUMs:

### Core Entities
- **Deals**: Investment opportunities and vehicles
- **Investors**: Accredited investors and institutions
- **Share Lots**: Inventory tracking with source attribution
- **Reservations**: Temporary inventory allocation
- **Fee Events**: Automated fee calculation and tracking
- **Invoices**: Fee billing and payment tracking

### Advanced Features
- **Introducers**: Referral partner management
- **Bank Transactions**: Reconciliation and payment processing
- **Document Packages**: Automated document workflows
- **Conversations**: Secure messaging system

## Getting Started

### Prerequisites
- Node.js 20+ (recommended)
- npm or yarn package manager
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd versotech-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Copy `.env.example` to `.env.local` and configure:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Database Setup**
   ```bash
   # Run the migrations in order
   psql -h your-host -d your-db -f database/migrations/001_create_deals_schema.sql
   psql -h your-host -d your-db -f database/migrations/002_create_inventory_schema.sql
   psql -h your-host -d your-db -f database/migrations/003_create_fees_documents_schema.sql
   psql -h your-host -d your-db -f database/migrations/004_create_rls_policies.sql
   psql -h your-host -d your-db -f database/migrations/005_create_inventory_functions.sql
   psql -h your-host -d your-db -f database/migrations/006_sample_data.sql
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   - **VERSO Holdings** (Investor Portal): `http://localhost:3000/versoholdings`
   - **VersoTech** (Staff Portal): `http://localhost:3000/versotech`

## Demo Credentials

### Investor Portal
- **Email**: investor@demo.com
- **Portal**: VERSO Holdings (`/versoholdings`)

### Staff Portal
- **Email**: admin@demo.com
- **Portal**: VersoTech (`/versotech`)

## Recent Updates

### December 2024 - Advanced Admin Panels & Bug Fixes
- ✅ Added **Introducer Management Panel** with commission tracking
- ✅ Added **Bank Reconciliation Interface** with AI-powered matching
- ✅ Added **Advanced Fee Configuration UI** with investor overrides
- ✅ Added **Document Package Automation Panel** with workflow management
- ✅ Fixed **Next.js 15 params await issues** in dynamic API routes
- ✅ Fixed **401 authentication errors** in fee computation APIs
- ✅ Fixed **missing dependency** for @radix-ui/react-switch
- ✅ Fixed **property name mismatch** in messages page (displayName vs display_name)

### Key Technical Improvements
- **Service Client Authentication**: Fixed API routes to properly use both regular client (for auth) and service client (for privileged DB operations)
- **Component Dependencies**: Resolved missing Radix UI components for admin panels
- **Type Safety**: Fixed property name mismatches between interfaces and usage
- **Error Handling**: Improved error reporting and debugging capabilities

## Architecture Highlights

### Security Model
- **Row-Level Security (RLS)**: Database-level access control
- **Deal-scoped Access**: Investors only see their investments
- **Role-based Permissions**: Staff/investor segregation with granular permissions
- **Service Role Operations**: Privileged database operations with proper authentication flow

### Data Flow
1. **Authentication**: Simple auth system with session management
2. **Authorization**: RLS policies enforce access control at database level
3. **API Routes**: Next.js API routes with proper client/service client usage
4. **Real-time Updates**: Supabase Realtime for live notifications
5. **Background Jobs**: Database functions for complex operations

### Performance Features
- **Server Components**: Reduced client-side JavaScript
- **Optimistic Updates**: Real-time UI updates
- **Database Functions**: Complex business logic in PostgreSQL
- **Efficient Queries**: Optimized database interactions with proper indexing

## Development Guidelines

### Code Style
- **TypeScript**: Strict type checking enabled
- **ESLint**: Configured for Next.js and React best practices
- **Components**: Prefer server components, use client components only when needed
- **Database**: Use service client for privileged operations, regular client for user operations

### Authentication Pattern
```typescript
// Correct pattern for API routes requiring staff access
const supabase = await createClient() // For user authentication
const { data: { user }, error } = await supabase.auth.getUser()

// Verify staff role
const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
if (!profile || !['staff_admin', 'staff_ops'].includes(profile.role)) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}

// Use service client for database operations
const serviceSupabase = createServiceClient()
const { data } = await serviceSupabase.rpc('privileged_function', { params })
```

## Deployment

### Production Checklist
- [ ] Configure production Supabase project
- [ ] Set up proper environment variables
- [ ] Run database migrations
- [ ] Configure domain and SSL
- [ ] Set up monitoring and logging
- [ ] Test all authentication flows
- [ ] Verify RLS policies are working

### Environment Variables
```env
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Optional
NEXT_PUBLIC_APP_ENV=production
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with descriptive messages: `git commit -m 'Add amazing feature'`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## Support

For questions or issues:
- Check the `/database/README.md` for schema documentation
- Review the PRD.md for business requirements
- Examine the migration files for database structure

## License

This project is proprietary software for VERSO Holdings.

---

**Last Updated**: December 2024
**Version**: 2.0.0
**Status**: ✅ Production Ready