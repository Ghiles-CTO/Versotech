'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2, Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

interface VerificationState {
  loading: boolean
  sendingOtp: boolean
  verifying: boolean
  error: string | null
  success: boolean
  otpSent: boolean
  maskedEmail: string | null
  expiresIn: number
  waitSeconds: number
  attemptsRemaining: number | null
}

export default function VerifyPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [state, setState] = useState<VerificationState>({
    loading: true,
    sendingOtp: false,
    verifying: false,
    error: null,
    success: false,
    otpSent: false,
    maskedEmail: null,
    expiresIn: 600,
    waitSeconds: 0,
    attemptsRemaining: 3
  })

  const [otp, setOtp] = useState('')

  // Check if verification is needed
  const checkVerification = useCallback(async () => {
    try {
      const response = await fetch(`/api/signature/${token}`)

      if (!response.ok) {
        const errorData = await response.json()
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorData.error || 'Invalid signature link'
        }))
        return
      }

      const data = await response.json()

      // If no verification required or already verified, redirect to sign page
      if (!data.verification_required || data.verification_completed_at) {
        router.replace(`/sign/${token}`)
        return
      }

      setState(prev => ({
        ...prev,
        loading: false,
        maskedEmail: maskEmail(data.signer_email)
      }))
    } catch (err) {
      console.error('Error checking verification:', err)
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load verification page'
      }))
    }
  }, [token, router])

  useEffect(() => {
    if (!token) {
      setState(prev => ({ ...prev, loading: false, error: 'Invalid signature token' }))
      return
    }
    checkVerification()
  }, [token, checkVerification])

  // Countdown timer for rate limiting
  useEffect(() => {
    if (state.waitSeconds > 0) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, waitSeconds: prev.waitSeconds - 1 }))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [state.waitSeconds])

  const sendOtp = async () => {
    setState(prev => ({ ...prev, sendingOtp: true, error: null }))

    try {
      const response = await fetch(`/api/signature/${token}/verify/send-otp`, {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429 && data.wait_seconds) {
          setState(prev => ({
            ...prev,
            sendingOtp: false,
            waitSeconds: data.wait_seconds,
            error: data.error
          }))
          return
        }

        setState(prev => ({
          ...prev,
          sendingOtp: false,
          error: data.error || 'Failed to send verification code'
        }))
        return
      }

      if (data.already_verified) {
        router.replace(`/sign/${token}`)
        return
      }

      setState(prev => ({
        ...prev,
        sendingOtp: false,
        otpSent: true,
        maskedEmail: data.email_sent_to,
        expiresIn: data.expires_in_seconds || 600,
        error: null
      }))
    } catch (err) {
      console.error('Error sending OTP:', err)
      setState(prev => ({
        ...prev,
        sendingOtp: false,
        error: 'Failed to send verification code'
      }))
    }
  }

  const validateOtp = async () => {
    if (otp.length !== 6) {
      setState(prev => ({ ...prev, error: 'Please enter the 6-digit code' }))
      return
    }

    setState(prev => ({ ...prev, verifying: true, error: null }))

    try {
      const response = await fetch(`/api/signature/${token}/verify/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp })
      })

      const data = await response.json()

      if (!response.ok) {
        setState(prev => ({
          ...prev,
          verifying: false,
          error: data.error || 'Verification failed',
          attemptsRemaining: data.attempts_remaining ?? prev.attemptsRemaining
        }))

        // If attempts exceeded or expired, reset to allow requesting new code
        if (data.attempts_exceeded || data.expired) {
          setState(prev => ({
            ...prev,
            otpSent: false,
            attemptsRemaining: 3
          }))
          setOtp('')
        }

        return
      }

      if (data.already_verified || data.success) {
        setState(prev => ({ ...prev, verifying: false, success: true }))
        // Redirect to signing page after brief success message
        setTimeout(() => {
          router.replace(`/sign/${token}`)
        }, 1500)
      }
    } catch (err) {
      console.error('Error validating OTP:', err)
      setState(prev => ({
        ...prev,
        verifying: false,
        error: 'Verification failed. Please try again.'
      }))
    }
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
    if (state.error) {
      setState(prev => ({ ...prev, error: null }))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && otp.length === 6) {
      validateOtp()
    }
  }

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/50 to-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading verification...</p>
        </div>
      </div>
    )
  }

  if (state.error && !state.otpSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/50 to-background p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-600 dark:text-red-400 text-xl font-semibold mb-4">
            {state.error}
          </div>
          <p className="text-muted-foreground">
            This verification link may be invalid or expired.
          </p>
        </Card>
      </div>
    )
  }

  if (state.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/50 to-background p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Email Verified</h2>
          <p className="text-muted-foreground mb-4">
            Redirecting you to the signature page...
          </p>
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/50 to-background p-4">
      <div className="max-w-md mx-auto py-8">
        <Card className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Mail className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Verify Your Email
            </h1>
            <p className="text-muted-foreground">
              For security, please verify your email address before signing.
            </p>
          </div>

          {!state.otpSent ? (
            /* Send OTP Section */
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                We&apos;ll send a 6-digit verification code to:
              </p>
              <p className="text-center font-medium text-foreground">
                {state.maskedEmail || '***@***.***'}
              </p>

              <Button
                className="w-full"
                onClick={sendOtp}
                disabled={state.sendingOtp || state.waitSeconds > 0}
              >
                {state.sendingOtp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : state.waitSeconds > 0 ? (
                  `Wait ${state.waitSeconds}s`
                ) : (
                  'Send Verification Code'
                )}
              </Button>
            </div>
          ) : (
            /* Enter OTP Section */
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Enter the 6-digit code sent to:
                </p>
                <p className="font-medium text-foreground">
                  {state.maskedEmail}
                </p>
              </div>

              <div>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otp}
                  onChange={handleOtpChange}
                  onKeyDown={handleKeyDown}
                  placeholder="000000"
                  className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                  autoFocus
                />
              </div>

              {state.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                  {state.error}
                </div>
              )}

              <Button
                className="w-full"
                onClick={validateOtp}
                disabled={state.verifying || otp.length !== 6}
              >
                {state.verifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </Button>

              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={sendOtp}
                  disabled={state.sendingOtp || state.waitSeconds > 0}
                  className="text-muted-foreground"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {state.waitSeconds > 0 ? `Resend in ${state.waitSeconds}s` : 'Resend Code'}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Code expires in {Math.floor(state.expiresIn / 60)} minutes
              </p>
            </div>
          )}
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>
            This verification ensures only you can sign this document.
            If you did not request this, please ignore this page.
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Mask email for privacy
 */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return '***'
  const visibleChars = Math.min(2, local.length)
  return `${local.substring(0, visibleChars)}***@${domain}`
}
