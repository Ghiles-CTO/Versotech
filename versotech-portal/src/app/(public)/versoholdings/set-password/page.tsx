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
        router.replace('/versoholdings/login')
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
        router.replace('/versoholdings/dashboard')
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
        router.replace('/versoholdings/login?message=password_set')
      }, 2000)

    } catch (error) {
      console.error('[set-password] Unexpected error:', error)
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' })
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 font-sans text-slate-900">

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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Set Your Password</h1>
          <p className="text-slate-500">Complete your account setup</p>
          {userEmail && (
            <p className="text-sm text-slate-400 mt-2">
              Setting password for: <span className="font-medium text-slate-600">{userEmail}</span>
            </p>
          )}
        </div>

        <Card className="border-slate-100 shadow-2xl shadow-slate-200/50 bg-white">
          <CardContent className="p-8 space-y-6">

            <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <KeyRound className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-blue-700">
                Create a secure password to access your investor portal
              </p>
            </div>

            {message && (
              <div className={`p-3 rounded-md text-sm font-medium border ${
                message.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' :
                'bg-emerald-50 border-emerald-100 text-emerald-600'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500 uppercase">New Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-11 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400">Minimum 8 characters</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500 uppercase">Confirm Password</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-11 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-600/20 transition-all"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Set Password & Continue'}
              </Button>
            </form>

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

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <SetPasswordContent />
    </Suspense>
  )
}
