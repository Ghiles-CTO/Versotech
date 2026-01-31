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
  Lock,
  ArrowLeft,
  Mail
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

/**
 * LEGACY STAFF LOGIN PAGE - INVITE ONLY
 *
 * This page redirects to /versotech_main/login but is kept for backwards compatibility.
 * Google OAuth has been removed for security - all access is via admin invitation.
 */
function StaffLoginContent() {
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
      setMessage({ type: 'success', text: 'Passkey set successfully! Please log in with your new credentials.' })
    }
  }, [searchParams])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await signIn(email, password, 'staff')
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] p-4 font-sans text-zinc-100">

      <Link href="/" className="absolute top-8 left-8 text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-2 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Return Home
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
          <h1 className="text-3xl font-light tracking-tight text-white sr-only">VERSO TECH</h1>
          <p className="text-zinc-500 text-sm tracking-wide uppercase">Authorized Personnel Only</p>
        </div>

        <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-sm shadow-2xl shadow-black">
          <CardContent className="p-8 space-y-6">

            <div className="flex items-center justify-center gap-2 text-emerald-500/80 bg-emerald-500/5 py-2 rounded-md border border-emerald-500/10">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-mono uppercase tracking-wider">Secure Connection Established</span>
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

            <form onSubmit={handleEmailAuth} className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-500 uppercase">System ID / Email</Label>
                <Input
                  type="email"
                  placeholder="staff@versotech.com"
                  className="h-11 bg-black/50 border-white/10 text-white placeholder:text-zinc-700 focus:border-white/30 focus:ring-0 transition-all font-mono"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-zinc-500 uppercase">Passkey</Label>
                  <Link
                    href="/versotech_main/reset-password"
                    className="text-xs text-zinc-500 hover:text-white transition-colors"
                  >
                    Forgot Passkey?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-11 bg-black/50 border-white/10 text-white placeholder:text-zinc-700 focus:border-white/30 focus:ring-0 transition-all font-mono pr-10"
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
                        <Lock className="w-4 h-4" /> ACCESS TERMINAL
                    </span>
                )}
              </Button>
            </form>

            {/* Invite-only notice */}
            <div className="text-center space-y-3 pt-2">
              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                <Mail className="h-3 w-3" />
                <span>Staff access requires invitation</span>
              </div>
              <p className="text-xs text-zinc-600">
                Contact your system administrator for access.
              </p>
            </div>

          </CardContent>
        </Card>

        <div className="text-center">
           <p className="text-[10px] text-zinc-700 font-mono">SYSTEM VERSION 2.4.0 // AUTHORIZED USE ONLY</p>
        </div>

      </div>
    </div>
  )
}

export default function StaffLogin() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    }>
      <StaffLoginContent />
    </Suspense>
  )
}
