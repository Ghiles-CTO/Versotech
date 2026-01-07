import path from 'path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: process.env.NEXT_IGNORE_TYPECHECK === '1',
  },
  // Tell Turbopack that the monorepo root is one level up (must be absolute)
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
  // Ensure proper static file handling
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },

  // Redirects from legacy routes to unified portal
  async redirects() {
    return [
      // Legacy login redirects to unified login
      { source: '/versoholdings/login', destination: '/versotech_main/login', permanent: false },
      { source: '/versotech/login', destination: '/versotech_main/login', permanent: false },

      // Investor portal redirects
      { source: '/versoholdings/dashboard', destination: '/versotech_main/dashboard', permanent: false },
      { source: '/versoholdings/deals', destination: '/versotech_main/opportunities', permanent: false },
      { source: '/versoholdings/holdings', destination: '/versotech_main/portfolio', permanent: false },
      { source: '/versoholdings/messages', destination: '/versotech_main/messages', permanent: false },
      { source: '/versoholdings/documents', destination: '/versotech_main/documents', permanent: false },
      { source: '/versoholdings/tasks', destination: '/versotech_main/tasks', permanent: false },
      { source: '/versoholdings/notifications', destination: '/versotech_main/notifications', permanent: false },
      { source: '/versoholdings/calendar', destination: '/versotech_main/calendar', permanent: false },
      { source: '/versoholdings/profile', destination: '/versotech_main/profile', permanent: false },
      { source: '/versoholdings/reports', destination: '/versotech_main/reports', permanent: false },
      { source: '/versoholdings/data-rooms', destination: '/versotech_main/documents', permanent: false },
      // Phase 3: Legacy investor routes redirect to new opportunity detail pages
      { source: '/versoholdings/deal/:id', destination: '/versotech_main/opportunities/:id', permanent: false },
      { source: '/versoholdings/vehicle/:id', destination: '/versotech_main/portfolio', permanent: false },
      { source: '/versoholdings/data-rooms/:dealId', destination: '/versotech_main/opportunities/:dealId', permanent: false },
      // Staff portal redirects
      { source: '/versotech/staff', destination: '/versotech_main/dashboard', permanent: false },
      { source: '/versotech/staff/deals', destination: '/versotech_main/deals', permanent: false },
      { source: '/versotech/staff/deals/new', destination: '/versotech_main/deals', permanent: false },
      { source: '/versotech/staff/deals/:id', destination: '/versotech_main/deals?deal_id=:id', permanent: false },
      { source: '/versotech/staff/investors', destination: '/versotech_main/investors', permanent: false },
      { source: '/versotech/staff/investors/:id', destination: '/versotech_main/investors?investor_id=:id', permanent: false },
      { source: '/versotech/staff/messages', destination: '/versotech_main/messages', permanent: false },
      { source: '/versotech/staff/subscriptions', destination: '/versotech_main/subscriptions', permanent: false },
      { source: '/versotech/staff/subscriptions/vehicle-summary', destination: '/versotech_main/subscriptions', permanent: false },
      { source: '/versotech/staff/subscriptions/:id', destination: '/versotech_main/subscriptions?subscription_id=:id', permanent: false },
      { source: '/versotech/staff/processes', destination: '/versotech_admin/processes', permanent: false },
      { source: '/versotech/staff/requests', destination: '/versotech_main/requests', permanent: false },
      { source: '/versotech/staff/requests/analytics', destination: '/versotech_main/requests', permanent: false },
      { source: '/versotech/staff/approvals', destination: '/versotech_main/approvals', permanent: false },
      { source: '/versotech/staff/documents', destination: '/versotech_main/documents', permanent: false },
      { source: '/versotech/staff/versosign', destination: '/versotech_main/versosign', permanent: false },
      { source: '/versotech/staff/introducers', destination: '/versotech_main/introducers', permanent: false },
      { source: '/versotech/staff/introducers/:id', destination: '/versotech_main/introducers?introducer_id=:id', permanent: false },
      { source: '/versotech/staff/arrangers', destination: '/versotech_main/arrangers', permanent: false },
      { source: '/versotech/staff/entities', destination: '/versotech_main/entities', permanent: false },
      { source: '/versotech/staff/entities/:id', destination: '/versotech_main/entities?entity_id=:id', permanent: false },
      { source: '/versotech/staff/calendar', destination: '/versotech_main/calendar', permanent: false },
      { source: '/versotech/staff/kyc-review', destination: '/versotech_main/kyc-review', permanent: false },
      { source: '/versotech/staff/fees', destination: '/versotech_main/fees', permanent: false },
      { source: '/versotech/staff/reconciliation', destination: '/versotech_main/reconciliation', permanent: false },
      { source: '/versotech/staff/reconciliation/:id', destination: '/versotech_main/reconciliation?reconciliation_id=:id', permanent: false },
      { source: '/versotech/staff/audit', destination: '/versotech_main/audit', permanent: false },
      { source: '/versotech/staff/admin', destination: '/versotech_admin', permanent: false },
      { source: '/versotech/staff/profile', destination: '/versotech_main/profile', permanent: false },
    ]
  },
}

export default nextConfig
