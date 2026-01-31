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

    if (error) {
      let errorMessage = 'Authentication error occurred'
      switch (error) {
        case 'session_expired': errorMessage = 'Your session has expired. Please sign in again.'; break
        case 'profile_not_found': errorMessage = 'User profile not found. Please contact support.'; break
        case 'auth_failed': errorMessage = 'Authentication failed. Please try again.'; break
        case 'auth_required': errorMessage = 'Please sign in to continue.'; break
        case 'session_not_found': errorMessage = 'Session not found. Please try your invitation link again or contact support.'; break
        case 'no_personas': errorMessage = 'No access configured. Please contact your administrator.'; break
        case 'link_expired': errorMessage = 'This link has expired. Please request a new password reset.'; break
        case 'access_denied': errorMessage = 'Access denied. The link may be invalid or already used.'; break
        default: errorMessage = 'An error occurred. Please try again.';
      }
      setMessage({ type: 'error', text: errorMessage })
    } else if (messageParam === 'password_set') {
      setMessage({ type: 'success', text: 'Password set successfully! Please sign in with your new credentials.' })
    } else if (messageParam === 'password_reset') {
      setMessage({ type: 'success', text: 'Password reset successfully! Please sign in with your new password.' })
    } else if (messageParam === 'signed_out') {
      setMessage({ type: 'info', text: 'You have been signed out.' })
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] p-4 font-sans text-zinc-100">

      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-700">

        <div className="text-center">
          <div className="flex justify-center mb-6">
             <div className="relative w-48 h-16">
                <Image
                  src="/versotech-logo-dark.png"
                  alt="VERSOTECH"
                  fill
                  className="object-contain"
                  priority
                />
             </div>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white sr-only">VERSO</h1>
        </div>

        <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-sm shadow-2xl shadow-black">
          <CardContent className="p-8 space-y-6">

            {message && (
              <div className={`p-3 rounded-md text-sm font-medium border ${
                message.type === 'error' ? 'bg-red-900/20 border-red-900/50 text-red-400' :
                message.type === 'success' ? 'bg-emerald-900/20 border-emerald-900/50 text-emerald-400' :
                'bg-blue-900/20 border-blue-900/50 text-blue-400'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-500 uppercase">Email Address</Label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="h-11 bg-black/50 border-white/10 text-white placeholder:text-zinc-700 focus:border-white/30 focus:ring-0 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-zinc-500 uppercase">Password</Label>
                  <Link
                    href="/versotech_main/reset-password"
                    className="text-xs text-zinc-500 hover:text-white transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-11 bg-black/50 border-white/10 text-white placeholder:text-zinc-700 focus:border-white/30 focus:ring-0 transition-all pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-zinc-600 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-white hover:bg-zinc-200 text-black font-medium tracking-wide transition-all mt-4"
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
              <p className="text-sm text-zinc-400">
                Request Access: Please contact us at{' '}
                <a
                  href="mailto:contact@versotech.com"
                  className="text-white hover:text-zinc-300 underline underline-offset-2 transition-colors"
                >
                  contact@versotech.com
                </a>
              </p>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  )
}

export default function UnifiedLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    }>
      <UnifiedLoginContent />
    </Suspense>
  )
}
