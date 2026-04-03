'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn, AuthError } from '@/lib/auth-client'
import {
  Loader2,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

/**
 * INVITE-ONLY LOGIN PAGE
 *
 * This platform is invite-only. Users cannot self-register.
 * All accounts are created via admin invitation from the Users page.
 *
 * Removed:
 * - Google OAuth (security risk, bypass invite flow)
 * - Self-signup (must be invited by admin)
 */

function UnifiedLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success' | 'info', text: string } | null>(null)


  useEffect(() => {
    const error = searchParams.get('error')
    const messageParam = searchParams.get('message')
    const getRecentLogoutMessage = () => {
      if (typeof window === 'undefined') {
        return null
      }

      try {
        const rawLogoutEvent = window.localStorage.getItem('verso.session.logout')
        if (!rawLogoutEvent) {
          return null
        }

        const parsed = JSON.parse(rawLogoutEvent) as { at?: number; reason?: string }
        if (!parsed.at || Date.now() - parsed.at > 60_000) {
          return null
        }

        if (parsed.reason === 'idle_timeout') {
          return { type: 'info' as const, text: 'Your session was closed due to inactivity.' }
        }

        if (parsed.reason === 'signed_out') {
          return { type: 'info' as const, text: 'You have been signed out.' }
        }
      } catch {
        return null
      }

      return null
    }

    if (error) {
      let nextMessage: { type: 'error' | 'success' | 'info', text: string } = {
        type: 'error',
        text: 'Authentication error occurred',
      }

      switch (error) {
        case 'session_expired':
          nextMessage = { type: 'error', text: 'Your session has expired. Please sign in again.' }
          break
        case 'idle_timeout':
          nextMessage = { type: 'info', text: 'Your session was closed due to inactivity.' }
          break
        case 'signed_out':
          nextMessage = { type: 'info', text: 'You have been signed out.' }
          break
        case 'profile_not_found':
          nextMessage = { type: 'error', text: 'User profile not found. Please contact support.' }
          break
        case 'auth_failed':
          nextMessage = { type: 'error', text: 'Authentication failed. Please try again.' }
          break
        case 'auth_required':
          nextMessage = { type: 'error', text: 'Please sign in to continue.' }
          break
        case 'session_not_found':
          nextMessage = { type: 'error', text: 'Session not found. Please try your invitation link again or contact support.' }
          break
        case 'no_personas':
          nextMessage = { type: 'error', text: 'No access configured. Please contact your administrator.' }
          break
        case 'link_expired':
          nextMessage = { type: 'error', text: 'This link has expired. Please request a new password reset.' }
          break
        case 'access_denied':
          nextMessage = { type: 'error', text: 'Access denied. The link may be invalid or already used.' }
          break
        default:
          nextMessage = { type: 'error', text: 'An error occurred. Please try again.' }
      }

      setMessage(nextMessage)
    } else if (messageParam === 'password_set') {
      setMessage({ type: 'success', text: 'Password set successfully! Please sign in with your new credentials.' })
    } else if (messageParam === 'password_reset') {
      setMessage({ type: 'success', text: 'Password reset successfully! Please sign in with your new password.' })
    } else if (messageParam === 'signed_out') {
      setMessage({ type: 'info', text: 'You have been signed out.' })
    } else {
      setMessage(getRecentLogoutMessage())
    }
  }, [searchParams])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      console.log('[login] Attempting sign in for:', email)
      const result = await signIn(email, password, 'investor')
      console.log('[login] SignIn result:', JSON.stringify(result, null, 2))

      if (result?.success) {
        // Check for redirect param (e.g., from invite link), otherwise go to dashboard
        const redirectParam = searchParams.get('redirect')
        const redirectUrl = redirectParam && redirectParam.startsWith('/')
          ? decodeURIComponent(redirectParam)
          : '/versotech_main/dashboard'

        console.log('[login] Redirecting to:', redirectUrl)

        // CRITICAL: Use window.location.href for reliable redirect on all browsers/mobile
        // router.replace() can fail silently on some browsers (especially mobile Safari)
        window.location.href = redirectUrl

        // Keep loading state while redirecting to prevent button flicker
        return
      } else {
        // Sign in returned but success was false/undefined
        console.error('[login] SignIn returned without success:', result)
        setMessage({ type: 'error', text: result?.error || 'Sign in failed. Please try again.' })
      }
    } catch (error) {
      console.error('[login] SignIn error:', error)
      if (error instanceof AuthError) setMessage({ type: 'error', text: error.message })
      else setMessage({ type: 'error', text: 'Authentication failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-white p-4 font-sans text-slate-900">
      {/* Override Chrome autofill gray/blue overlay on saved credentials */}
      <style>{`
        .login-card input:-webkit-autofill,
        .login-card input:-webkit-autofill:hover,
        .login-card input:-webkit-autofill:focus,
        .login-card input:-webkit-autofill:active {
          -webkit-text-fill-color: #0f172a !important;
          -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
          box-shadow: 0 0 0px 1000px #ffffff inset !important;
          background-color: #ffffff !important;
          color: #0f172a !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      {/* Logo — centered in the space between top and card */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-3 animate-in fade-in duration-700">
          <div className="relative w-10 h-10 flex-shrink-0">
            <Image src="/versotech-icon.png" alt="" fill className="object-contain" priority />
          </div>
          <span style={{ fontFamily: 'var(--font-spartan), sans-serif' }} className="text-2xl font-extrabold tracking-wide text-slate-900">
            VERSOTECH
          </span>
        </div>
      </div>

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
        <h1 className="sr-only">VERSO</h1>

        <Card
          className="login-card border-[#E2E8F0] shadow-lg shadow-slate-900/5 bg-[#F1F5F9] rounded-2xl"
          style={{
            '--background': '0 0% 100%',
            '--foreground': '222.2 84% 4.9%',
            '--input': '214.3 31.8% 91.4%',
            '--muted-foreground': '215.4 16.3% 46.9%',
          } as React.CSSProperties}
        >
          <CardContent className="p-8 space-y-6">

            {message && (
              <div
                className="p-4 rounded-lg text-base font-semibold border-2"
                style={
                  message.type === 'error'
                    ? { backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#b91c1c' }
                    : message.type === 'success'
                    ? { backgroundColor: '#ecfdf5', borderColor: '#6ee7b7', color: '#047857' }
                    : { backgroundColor: '#dbeafe', borderColor: '#93c5fd', color: '#1e3a8a' }
                }
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-semibold uppercase" style={{ color: '#0f172a' }}>Email Address</Label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="h-12 text-base border-[#E2E8F0] placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                  style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold uppercase" style={{ color: '#0f172a' }}>Password</Label>
                  <Link
                    href="/versotech_main/reset-password"
                    className="text-sm hover:text-[#1E3A8A] transition-colors cursor-pointer"
                    style={{ color: '#0f172a' }}
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-12 text-base border-[#E2E8F0] placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all pr-10"
                    style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 transition-colors cursor-pointer"
                    style={{ color: '#475569' }}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-13 text-base bg-[#0F172A] hover:bg-[#1E293B] text-white font-medium tracking-wide transition-all mt-4 cursor-pointer"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <span className="flex items-center gap-2">
                        <Lock className="w-4 h-4" /> SIGN IN
                    </span>
                )}
              </Button>
            </form>

            {/* Request Access */}
            <div className="text-center pt-2">
              <p className="text-base" style={{ color: '#475569' }}>
                Request Access: Please contact us at{' '}
                <a
                  href="mailto:contact@versotech.com"
                  className="font-medium underline underline-offset-2 transition-colors"
                  style={{ color: '#0f172a' }}
                >
                  contact@versotech.com
                </a>
              </p>
            </div>

          </CardContent>
        </Card>

      </div>

      {/* Bottom spacer to keep card centered */}
      <div className="flex-1" />
    </div>
  )
}

export default function UnifiedLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0F172A]" />
      </div>
    }>
      <UnifiedLoginContent />
    </Suspense>
  )
}
