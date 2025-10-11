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
   Copy `env.example` to `.env.local` and configure:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

   # Application URL (required for OAuth callbacks)
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   
   # For production:
   # NEXT_PUBLIC_APP_URL=https://your-production-domain.com
   # NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
   ```

4. **Authentication Setup**
   
   The platform supports two authentication methods:
   
   **Email/Password Authentication:**
   - Users sign up with email and password
   - Email verification required before first login
   - Passwords are securely hashed by Supabase Auth
   
   **Google OAuth (Recommended):**
   - One-click sign in with Google accounts
   - See [Google OAuth Setup Guide](docs/GOOGLE_OAUTH_SETUP.md) for detailed configuration
   - Requires configuring Google Cloud Console and Supabase
   
   **Quick OAuth Setup:**
   1. Enable Google provider in Supabase Dashboard → Authentication → Providers
   2. Add your Google Client ID and Secret from Google Cloud Console
   3. Configure Site URL and Redirect URLs in Supabase
   4. Set `NEXT_PUBLIC_APP_URL` in your `.env.local`
   
   **Role-Based Access:**
   - **Investors**: Access to `/versoholdings/*` routes only
   - **Staff** (`@versotech.com` emails): Access to `/versotech/*` routes
   - Automatic role assignment based on email domain
   - Profile creation during first login (signup or OAuth)

5. **Database Setup**
   ```bash
   # Run the migrations in order
   psql -h your-host -d your-db -f database/migrations/001_create_deals_schema.sql
   psql -h your-host -d your-db -f database/migrations/002_create_inventory_schema.sql
   psql -h your-host -d your-db -f database/migrations/003_create_fees_documents_schema.sql
   psql -h your-host -d your-db -f database/migrations/004_create_rls_policies.sql
   psql -h your-host -d your-db -f database/migrations/005_create_inventory_functions.sql
   psql -h your-host -d your-db -f database/migrations/006_sample_data.sql
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

7. **Access the Application**
   - **VERSO Holdings** (Investor Portal): `http://localhost:3000/versoholdings/login`
   - **VersoTech** (Staff Portal): `http://localhost:3000/versotech/login`

## Testing Authentication

### Testing Email/Password Sign Up

1. Navigate to the investor or staff portal login page
2. Click "Don't have an account? Create one now"
3. Fill in your details:
   - Full Name
   - Email address
   - Password (minimum 6 characters)
4. Click "Create Account"
5. Check your email for verification link
6. Click the verification link
7. Return to login page and sign in with your credentials

### Testing Google OAuth

1. Navigate to the login page
2. Click "Continue with Google"
3. Select your Google account
4. Grant permissions when prompted
5. You'll be automatically redirected to the appropriate portal based on your email domain

**Email Domain Routing:**
- `@versotech.com` or `@verso.com` → Staff Portal (`staff_ops` role)
- Other domains → Investor Portal (`investor` role)

### Testing Role-Based Access

**As an Investor:**
1. Sign in to investor portal
2. Access should be granted to `/versoholdings/*` routes
3. Attempting to access `/versotech/*` should redirect to investor dashboard

**As a Staff Member:**
1. Sign in with a `@versotech.com` email
2. Access should be granted to `/versotech/*` routes
3. Attempting to access `/versoholdings/*` should redirect to staff dashboard

### Troubleshooting

If you encounter authentication issues:
1. Check browser console for error messages
2. Verify environment variables are set correctly
3. Ensure Supabase project is properly configured
4. Review [Google OAuth Setup Guide](docs/GOOGLE_OAUTH_SETUP.md) for OAuth issues
5. Check that email verification is configured in Supabase Auth settings

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