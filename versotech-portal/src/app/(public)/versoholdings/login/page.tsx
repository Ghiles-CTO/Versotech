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
  Shield,
  ArrowLeft,
  Lock,
  Mail
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

/**
 * LEGACY INVESTOR LOGIN PAGE - INVITE ONLY
 *
 * This page redirects to /versotech_main/login but is kept for backwards compatibility.
 * Self-signup and Google OAuth have been removed for security.
 */
function InvestorLoginContent() {
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
        case 'session_expired': errorMessage = 'Your session has expired.'; break
        case 'profile_not_found': errorMessage = 'User profile not found.'; break
        case 'auth_failed': errorMessage = 'Authentication failed.'; break
        default: errorMessage = 'An error occurred.';
      }
      setMessage({ type: 'error', text: errorMessage })
    } else if (messageParam === 'password_set') {
      setMessage({ type: 'success', text: 'Password set successfully! Please log in with your new password.' })
    }
  }, [searchParams])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await signIn(email, password, 'investor')
      if (result?.success) {
        if ((result.user as any)?.demo) {
          window.location.href = result.redirect ?? '/versotech_main/dashboard'
        } else {
          router.replace(result.redirect ?? '/versotech_main/dashboard')
        }
      }
    } catch (error) {
      if (error instanceof AuthError) setMessage({ type: 'error', text: error.message })
      else setMessage({ type: 'error', text: 'Authentication failed.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 font-sans text-slate-900">

      <Link href="/" className="absolute top-8 left-8 text-sm text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
      </Link>

      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">

        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
             <div className="relative w-48 h-16">
                <Image
                  src="/versoholdings-logo.jpg"
                  alt="VERSO Holdings"
                  fill
                  className="object-contain"
                  priority
                />
             </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sr-only">VERSO Holdings</h1>
          <p className="text-slate-500">Investor Access Portal</p>
        </div>

        <Card className="border-slate-100 shadow-2xl shadow-slate-200/50 bg-white">
          <CardContent className="p-8 space-y-6">

            {message && (
              <div className={`p-3 rounded-md text-sm font-medium border ${
                message.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' :
                message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                'bg-blue-50 border-blue-100 text-blue-600'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500 uppercase">Email Address</Label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="h-11 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-500 uppercase">Password</Label>
                  <Link
                    href="/versotech_main/reset-password"
                    className="text-xs text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-11 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-600/20 transition-all"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Sign In
                  </span>
                )}
              </Button>
            </form>

            {/* Invite-only notice */}
            <div className="text-center space-y-3 pt-2">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <Mail className="h-3 w-3" />
                <span>This platform is invite-only</span>
              </div>
              <p className="text-xs text-slate-400">
                Need access? Contact your relationship manager.
              </p>
            </div>

          </CardContent>
        </Card>

        <div className="text-center space-y-2">
           <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <Shield className="h-3 w-3" />
              <span>Bank-Level 256-bit Encryption</span>
           </div>
           <p className="text-xs text-slate-300">© 2024 VERSO Holdings. All rights reserved.</p>
        </div>

      </div>
    </div>
  )
}

export default function InvestorLogin() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <InvestorLoginContent />
    </Suspense>
  )
}
