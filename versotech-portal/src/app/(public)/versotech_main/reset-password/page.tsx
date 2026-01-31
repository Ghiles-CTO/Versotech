'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPassword, updatePassword, AuthError } from '@/lib/auth-client'
import { createClient } from '@/lib/supabase/client'
import {
  Loader2,
  Eye,
  EyeOff,
  Shield,
  Mail,
  Lock,
  ArrowLeft,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success' | 'info', text: string } | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [isRecoveryMode, setIsRecoveryMode] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  // Check if user came from a password reset email link (or was redirected from auth callback)
  useEffect(() => {
    const checkRecoverySession = async () => {
      const supabase = createClient()

      // Check for hash fragment (Supabase sends recovery token in hash)
      if (typeof window !== 'undefined' && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const type = hashParams.get('type')
        const refreshToken = hashParams.get('refresh_token')

        if (type === 'recovery' && accessToken && refreshToken) {
          // Set the session from recovery tokens
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (!error) {
            console.log('[reset-password] Recovery session set from hash')
            setIsRecoveryMode(true)
            // Clear the hash from URL for cleaner display
            window.history.replaceState(null, '', window.location.pathname)
          } else {
            setMessage({ type: 'error', text: 'Recovery link expired or invalid. Please request a new one.' })
          }
          setCheckingSession(false)
          return
        }
      }

      // Also check URL params (alternative flow)
      const code = searchParams.get('code')
      if (code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (!error) {
            console.log('[reset-password] Recovery session set from code')
            setIsRecoveryMode(true)
          } else {
            setMessage({ type: 'error', text: 'Recovery link expired or invalid. Please request a new one.' })
          }
        } catch {
          setMessage({ type: 'error', text: 'Failed to process recovery link.' })
        }
        setCheckingSession(false)
        return
      }

      // Check if we were redirected from auth/callback with recovery flag
      // This is the ONLY way to enter recovery mode via redirect (not just any session)
      const fromRecovery = searchParams.get('from') === 'recovery'
      if (fromRecovery) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          console.log('[reset-password] Recovery redirect from auth callback, user:', user.email)
          setIsRecoveryMode(true)
          setCheckingSession(false)
          return
        } else {
          // Had the flag but no session - session may have expired
          console.log('[reset-password] Recovery flag present but no session')
          setMessage({ type: 'error', text: 'Your session has expired. Please request a new password reset link.' })
        }
      }

      // No recovery indicators - show the email request form
      console.log('[reset-password] No recovery indicators, showing request form')
      setCheckingSession(false)
    }

    checkRecoverySession()
  }, [searchParams])

  // Handle email submission (request reset)
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      await resetPassword(email)
      setEmailSent(true)
      setMessage({
        type: 'success',
        text: 'Password reset email sent! Check your inbox and click the link to reset your password.'
      })
    } catch (error) {
      if (error instanceof AuthError) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'error', text: 'Failed to send reset email. Please try again.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle new password submission
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' })
      setIsLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' })
      setIsLoading(false)
      return
    }

    try {
      await updatePassword(newPassword)
      setMessage({ type: 'success', text: 'Password updated successfully! Redirecting to login...' })

      // Sign out and redirect to login
      const supabase = createClient()
      await supabase.auth.signOut()

      setTimeout(() => {
        router.push('/versotech_main/login?message=password_reset')
      }, 2000)
    } catch (error) {
      if (error instanceof AuthError) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'error', text: 'Failed to update password. Please try again.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] p-4 font-sans text-zinc-100">

      <Link href="/versotech_main/login" className="absolute top-8 left-8 text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-2 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Login
      </Link>

      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-700">

        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
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
          <p className="text-zinc-500 text-sm tracking-wide uppercase">
            {isRecoveryMode ? 'Set New Password' : 'Reset Your Password'}
          </p>
        </div>

        <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-sm shadow-2xl shadow-black">
          <CardContent className="p-8 space-y-6">

            <div className="flex items-center justify-center gap-2 text-emerald-500/80 bg-emerald-500/5 py-2 rounded-md border border-emerald-500/10">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-mono uppercase tracking-wider">Secure Connection</span>
            </div>

            {message && (
              <div className={`p-3 rounded-md text-sm font-medium border ${
                message.type === 'error' ? 'bg-red-900/20 border-red-900/50 text-red-400' :
                message.type === 'success' ? 'bg-emerald-900/20 border-emerald-900/50 text-emerald-400' :
                'bg-blue-900/20 border-blue-900/50 text-blue-400'
              }`}>
                {message.text}
              </div>
            )}

            {isRecoveryMode ? (
              // Password update form (after clicking email link)
              <form onSubmit={handlePasswordUpdate} className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-500 uppercase">New Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="h-11 bg-black/50 border-white/10 text-white placeholder:text-zinc-700 focus:border-white/30 focus:ring-0 transition-all pr-10"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
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

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-500 uppercase">Confirm Password</Label>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-11 bg-black/50 border-white/10 text-white placeholder:text-zinc-700 focus:border-white/30 focus:ring-0 transition-all"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>

                <p className="text-xs text-zinc-600">
                  Password must be at least 8 characters long.
                </p>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-white hover:bg-zinc-200 text-black font-medium tracking-wide transition-all mt-4"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                      <span className="flex items-center gap-2">
                          <Lock className="w-4 h-4" /> UPDATE PASSWORD
                      </span>
                  )}
                </Button>
              </form>
            ) : emailSent ? (
              // Email sent confirmation
              <div className="text-center py-6 space-y-4">
                <CheckCircle className="w-16 h-16 mx-auto text-emerald-500" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-white">Check Your Email</h3>
                  <p className="text-sm text-zinc-400">
                    We&apos;ve sent a password reset link to <span className="text-white font-medium">{email}</span>
                  </p>
                  <p className="text-xs text-zinc-600 pt-2">
                    Didn&apos;t receive the email? Check your spam folder or{' '}
                    <button
                      onClick={() => { setEmailSent(false); setMessage(null); }}
                      className="text-white hover:underline"
                    >
                      try again
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              // Email request form
              <form onSubmit={handleRequestReset} className="space-y-5">
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

                <p className="text-xs text-zinc-600">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-white hover:bg-zinc-200 text-black font-medium tracking-wide transition-all mt-4"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                      <span className="flex items-center gap-2">
                          <Mail className="w-4 h-4" /> SEND RESET LINK
                      </span>
                  )}
                </Button>
              </form>
            )}

          </CardContent>
        </Card>

        <div className="text-center space-y-2">
           <div className="flex items-center justify-center gap-2 text-xs text-zinc-600">
              <Shield className="h-3 w-3" />
              <span>Bank-Level 256-bit Encryption</span>
           </div>
           <p className="text-[10px] text-zinc-700 font-mono">VERSO PLATFORM // PASSWORD RECOVERY</p>
        </div>

      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
