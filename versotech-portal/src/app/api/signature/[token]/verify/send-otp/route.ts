import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createHash, randomInt } from 'crypto'

/**
 * POST /api/signature/[token]/verify/send-otp
 *
 * Sends a 6-digit OTP to the signer's email for external signer verification.
 * This is required for eIDAS AES compliance when email links are shared.
 *
 * Rules:
 * - 6-digit numeric code
 * - 10-minute expiry
 * - Max 1 request per 60 seconds (rate limiting)
 * - OTP is hashed before storage (SHA-256)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Get signature request
    const { data: signatureRequest, error: reqError } = await supabase
      .from('signature_requests')
      .select('id, signer_email, signer_name, verification_required, verification_completed_at, status')
      .eq('signing_token', token)
      .single()

    if (reqError || !signatureRequest) {
      return NextResponse.json({ error: 'Invalid signature link' }, { status: 404 })
    }

    // Check if already signed
    if (signatureRequest.status === 'signed') {
      return NextResponse.json({ error: 'Document already signed' }, { status: 400 })
    }

    // Check if already verified
    if (signatureRequest.verification_completed_at) {
      return NextResponse.json({
        success: true,
        message: 'Already verified',
        already_verified: true
      })
    }

    // Rate limiting: Check for recent OTP requests (within last 60 seconds)
    const { data: recentVerification } = await supabase
      .from('signature_verifications')
      .select('created_at')
      .eq('signature_request_id', signatureRequest.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (recentVerification) {
      const lastRequestTime = new Date(recentVerification.created_at).getTime()
      const timeSinceLastRequest = Date.now() - lastRequestTime
      const cooldownMs = 60 * 1000 // 60 seconds

      if (timeSinceLastRequest < cooldownMs) {
        const waitSeconds = Math.ceil((cooldownMs - timeSinceLastRequest) / 1000)
        return NextResponse.json({
          error: `Please wait ${waitSeconds} seconds before requesting a new code`,
          wait_seconds: waitSeconds
        }, { status: 429 })
      }
    }

    // Generate 6-digit OTP
    const otp = randomInt(100000, 999999).toString()

    // Hash OTP for storage (SHA-256)
    const otpHash = createHash('sha256').update(otp).digest('hex')

    // Calculate expiry (10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    // Get client info for audit
    const clientIp = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Store verification record
    const { error: insertError } = await supabase
      .from('signature_verifications')
      .insert({
        signature_request_id: signatureRequest.id,
        otp_hash: otpHash,
        otp_expires_at: expiresAt.toISOString(),
        otp_attempts: 0,
        client_ip: clientIp,
        user_agent: userAgent.substring(0, 500)
      })

    if (insertError) {
      console.error('Failed to create verification record:', insertError)
      return NextResponse.json({ error: 'Failed to generate verification code' }, { status: 500 })
    }

    // Send OTP via email
    // TODO: Integrate with actual email service (Resend, SendGrid, etc.)
    // For now, log the OTP for testing purposes
    console.log(`[OTP] Verification code for ${signatureRequest.signer_email}: ${otp}`)

    // In production, this would call an email service:
    // await sendVerificationEmail({
    //   to: signatureRequest.signer_email,
    //   name: signatureRequest.signer_name,
    //   otp: otp,
    //   expiresIn: '10 minutes'
    // })

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
      email_sent_to: maskEmail(signatureRequest.signer_email),
      expires_in_seconds: 600 // 10 minutes
    })

  } catch (error) {
    console.error('OTP send error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Mask email for privacy (show first 2 chars and domain)
 * Example: john.doe@example.com -> jo***@example.com
 */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return '***'

  const visibleChars = Math.min(2, local.length)
  return `${local.substring(0, visibleChars)}***@${domain}`
}
