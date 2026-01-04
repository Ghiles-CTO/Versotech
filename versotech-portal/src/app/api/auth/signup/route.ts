import { NextRequest, NextResponse } from 'next/server'

/**
 * SIGNUP ENDPOINT - DISABLED
 *
 * This platform is INVITE-ONLY. Self-registration is not allowed.
 * All user accounts must be created by administrators via the Users page.
 *
 * This endpoint is kept to return a proper error message if someone
 * attempts to call it directly (e.g., via API).
 *
 * User creation flow:
 * 1. Admin goes to /versotech_main/users
 * 2. Clicks "Add Account" → selects entity type
 * 3. Creates entity with "Invite User" toggle enabled
 * 4. OR uses "Invite User" button on entity detail page
 * 5. User receives invitation email with magic link
 * 6. User sets password on first login
 */
export async function POST(request: NextRequest) {
  console.warn('[signup] BLOCKED - Self-registration attempt detected')

  return NextResponse.json({
    error: 'Self-registration is disabled. This platform is invite-only. Please contact your administrator or relationship manager to request access.',
    code: 'SIGNUP_DISABLED'
  }, { status: 403 })
}
