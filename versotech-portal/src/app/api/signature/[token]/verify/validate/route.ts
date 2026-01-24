import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createHash, timingSafeEqual } from 'crypto'

/**
 * POST /api/signature/[token]/verify/validate
 *
 * Validates the OTP code entered by the external signer.
 * On successful validation, marks the signature request as verified.
 *
 * Rules:
 * - Max 3 attempts before lockout
 * - OTP must not be expired
 * - Updates signature_request.verification_completed_at on success
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()
    const { otp } = body

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    if (!otp || typeof otp !== 'string' || otp.length !== 6) {
      return NextResponse.json({ error: 'Invalid verification code format' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Get signature request
    const { data: signatureRequest, error: reqError } = await supabase
      .from('signature_requests')
      .select('id, signer_email, verification_completed_at, status')
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

    // Get the latest verification record
    const { data: verification, error: verifyError } = await supabase
      .from('signature_verifications')
      .select('id, otp_hash, otp_expires_at, otp_attempts, verified_at')
      .eq('signature_request_id', signatureRequest.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (verifyError || !verification) {
      return NextResponse.json({
        error: 'No verification code found. Please request a new code.'
      }, { status: 400 })
    }

    // Check if already verified through this verification record
    if (verification.verified_at) {
      return NextResponse.json({
        success: true,
        message: 'Already verified',
        already_verified: true
      })
    }

    // Check if max attempts exceeded
    const MAX_ATTEMPTS = 3
    if (verification.otp_attempts >= MAX_ATTEMPTS) {
      return NextResponse.json({
        error: 'Too many failed attempts. Please request a new code.',
        attempts_exceeded: true
      }, { status: 429 })
    }

    // Check if OTP expired
    const expiresAt = new Date(verification.otp_expires_at)
    if (Date.now() > expiresAt.getTime()) {
      return NextResponse.json({
        error: 'Verification code has expired. Please request a new code.',
        expired: true
      }, { status: 410 })
    }

    // Hash the submitted OTP and compare using constant-time comparison
    // SECURITY: timingSafeEqual prevents timing attacks where response times
    // could leak information about how many characters matched
    const submittedHash = createHash('sha256').update(otp).digest('hex')
    const submittedHashBuffer = Buffer.from(submittedHash, 'hex')
    const storedHashBuffer = Buffer.from(verification.otp_hash, 'hex')
    const isValid = timingSafeEqual(submittedHashBuffer, storedHashBuffer)

    if (!isValid) {
      // Increment attempt counter
      const newAttempts = verification.otp_attempts + 1
      await supabase
        .from('signature_verifications')
        .update({ otp_attempts: newAttempts })
        .eq('id', verification.id)

      const attemptsRemaining = MAX_ATTEMPTS - newAttempts

      if (attemptsRemaining <= 0) {
        return NextResponse.json({
          error: 'Too many failed attempts. Please request a new code.',
          attempts_exceeded: true
        }, { status: 429 })
      }

      return NextResponse.json({
        error: `Invalid code. ${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining.`,
        invalid: true,
        attempts_remaining: attemptsRemaining
      }, { status: 400 })
    }

    // OTP is valid - mark verification as complete
    const now = new Date().toISOString()

    // Update verification record
    await supabase
      .from('signature_verifications')
      .update({
        verified_at: now,
        verified_email: signatureRequest.signer_email
      })
      .eq('id', verification.id)

    // Update signature request
    const { error: updateError } = await supabase
      .from('signature_requests')
      .update({ verification_completed_at: now })
      .eq('id', signatureRequest.id)

    if (updateError) {
      console.error('Failed to update signature request verification:', updateError)
      return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 })
    }

    console.log(`[OTP] Verification successful for signature request ${signatureRequest.id}`)

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      verified_at: now
    })

  } catch (error) {
    console.error('OTP validation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
