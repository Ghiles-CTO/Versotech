import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendPasswordResetEmail } from '@/lib/email/resend-service'

/**
 * POST /api/auth/request-reset
 *
 * Custom password reset flow using Resend instead of Supabase's default email.
 * Uses Supabase admin API to generate the reset link, then sends via Resend.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const serviceSupabase = createServiceClient()

    // Check if user exists in profiles
    // Note: profile.id IS the auth user id (by design - profiles.id references auth.users.id)
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('id, display_name, email')
      .eq('email', normalizedEmail)
      .maybeSingle()

    // For security, always return success even if email doesn't exist
    // This prevents email enumeration attacks
    if (!profile) {
      console.log(`[password-reset] No account found for: ${normalizedEmail}`)
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      })
    }

    // Generate password reset link using Supabase admin API
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const redirectTo = `${appUrl}/versotech_main/reset-password`

    const { data: linkData, error: linkError } = await serviceSupabase.auth.admin.generateLink({
      type: 'recovery',
      email: normalizedEmail,
      options: {
        redirectTo
      }
    })

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error('[password-reset] Error generating link:', linkError)
      return NextResponse.json(
        { error: 'Failed to generate reset link' },
        { status: 500 }
      )
    }

    // The generated link includes the token in hash format
    // We need to construct the URL that will work with our reset-password page
    const resetUrl = linkData.properties.action_link

    // Send email via Resend
    const emailResult = await sendPasswordResetEmail({
      email: normalizedEmail,
      displayName: profile.display_name,
      resetUrl
    })

    if (!emailResult.success) {
      console.error('[password-reset] Email send failed:', emailResult.error)
      // Include the actual error for debugging (safe to show since it's internal config errors)
      const errorDetail = emailResult.error || 'Unknown email error'
      return NextResponse.json(
        {
          error: 'Failed to send reset email. Please try again.',
          debug: process.env.NODE_ENV === 'development' ? errorDetail : undefined,
          // Also include in prod for now to debug
          detail: errorDetail
        },
        { status: 500 }
      )
    }

    console.log(`[password-reset] Reset email sent to: ${normalizedEmail}`)

    // Log the action for audit (non-blocking)
    try {
      await serviceSupabase.from('audit_logs').insert({
        event_type: 'authentication',
        actor_id: profile.id,
        action: 'password_reset_requested',
        entity_type: 'user',
        entity_id: profile.id,
        action_details: {
          email: normalizedEmail,
          email_sent: true
        },
        timestamp: new Date().toISOString()
      })
    } catch (auditErr) {
      console.error('[password-reset] Audit log failed:', auditErr)
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.'
    })

  } catch (error: any) {
    console.error('[password-reset] Error:', error?.message || error)
    console.error('[password-reset] Stack:', error?.stack)
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    )
  }
}
