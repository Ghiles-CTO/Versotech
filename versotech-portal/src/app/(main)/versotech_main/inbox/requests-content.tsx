'use client'

import { RequestManagementPage } from '@/components/staff/requests/request-management-page'

/**
 * Requests Content for Unified Inbox
 *
 * Renders the RequestManagementPage component which handles
 * its own data fetching and state management.
 */
export default function RequestsContent() {
  return <RequestManagementPage />
}
