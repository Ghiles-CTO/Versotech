'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import {
  Loader2,
  Eye,
  EyeOff,
  Shield,
  KeyRound
} from 'lucide-react'
import Image from 'next/image'

function SetPasswordContent() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Not logged in - redirect to login
        router.replace('/versotech_main/login')
        return
      }

      // Check if password is already set
      const { data: profile } = await supabase
        .from('profiles')
        .select('password_set')
        .eq('id', user.id)
        .single()

      if (profile?.password_set) {
        // Password already set - redirect to dashboard
        router.replace('/versotech_main/dashboard')
        return
      }

      setUserEmail(user.email ?? null)
      setIsCheckingAuth(false)
    }

    checkAuth()
  }, [router])

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    // Validate passwords
    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()

      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        console.error('[set-password] Error updating password:', updateError)
        setMessage({ type: 'error', text: updateError.message })
        setIsLoading(false)
        return
      }

      // Mark password as set in profile
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .update({ password_set: true })
          .eq('id', user.id)
      }

      setMessage({ type: 'success', text: 'Password set successfully! Redirecting to login...' })

      // Sign out the user so they have to log in with their new password
      await supabase.auth.signOut()

      // Redirect to login after a short delay
      setTimeout(() => {
        router.replace('/versotech_main/login?message=password_set')
      }, 2000)

    } catch (error) {
      console.error('[set-password] Unexpected error:', error)
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' })
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] p-4 font-sans text-zinc-100">

      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-700">

        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
             <div className="relative w-48 h-16">
                <Image
                  src="/versotech-logo.jpg"
                  alt="VERSO"
                  fill
                  className="object-contain invert"
                  priority
                />
             </div>
          </div>
          <h1 className="text-2xl font-light tracking-tight text-white">Set Your Password</h1>
          <p className="text-zinc-500 text-sm">Complete your account setup</p>
          {userEmail && (
            <p className="text-xs text-zinc-600 mt-2">
              Setting password for: <span className="font-medium text-zinc-400">{userEmail}</span>
            </p>
          )}
        </div>

        <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-sm shadow-2xl shadow-black">
          <CardContent className="p-8 space-y-6">

            <div className="flex items-center justify-center gap-3 p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
              <KeyRound className="h-5 w-5 text-emerald-500/80" />
              <p className="text-sm text-emerald-400/80">
                Create a secure password to access the portal
              </p>
            </div>

            {message && (
              <div className={`p-3 rounded-md text-sm font-medium border ${
                message.type === 'error' ? 'bg-red-900/20 border-red-900/50 text-red-400' :
                'bg-emerald-900/20 border-emerald-900/50 text-emerald-400'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSetPassword} className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-500 uppercase">New Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-11 bg-black/50 border-white/10 text-white placeholder:text-zinc-700 focus:border-white/30 focus:ring-0 transition-all pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                <p className="text-xs text-zinc-600">Minimum 8 characters</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-500 uppercase">Confirm Password</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-11 bg-black/50 border-white/10 text-white placeholder:text-zinc-700 focus:border-white/30 focus:ring-0 transition-all pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-zinc-600 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-white hover:bg-zinc-200 text-black font-medium tracking-wide transition-all mt-4"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Set Password & Continue'}
              </Button>
            </form>

          </CardContent>
        </Card>

        <div className="text-center space-y-2">
           <div className="flex items-center justify-center gap-2 text-xs text-zinc-600">
              <Shield className="h-3 w-3" />
              <span>Bank-Level 256-bit Encryption</span>
           </div>
           <p className="text-[10px] text-zinc-700 font-mono">VERSO PLATFORM // SECURE SETUP</p>
        </div>

      </div>
    </div>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    }>
      <SetPasswordContent />
    </Suspense>
  )
}
