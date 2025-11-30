'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { signIn, signUp, signInWithGoogle, AuthError } from '@/lib/auth-client'
import {
  Loader2,
  Eye,
  EyeOff,
  Shield,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

function InvestorLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
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
      if (isSignUp) {
        if (!displayName.trim()) {
          setMessage({ type: 'error', text: 'Please enter your full name' })
          setIsLoading(false)
          return
        }
        await signUp(email, password, displayName, 'investor')
        setMessage({ type: 'success', text: 'Account created! Please verify email.' })
        setIsSignUp(false)
      } else {
        const result = await signIn(email, password, 'investor')
        if (result?.success) {
          if ((result.user as any)?.demo) {
            window.location.href = result.redirect ?? '/versoholdings/dashboard'
          } else {
            router.replace(result.redirect ?? '/versoholdings/dashboard')
          }
        }
      }
    } catch (error) {
      if (error instanceof AuthError) setMessage({ type: 'error', text: error.message })
      else setMessage({ type: 'error', text: 'Authentication failed.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      await signInWithGoogle('investor')
    } catch (error) {
      if (error instanceof AuthError) setMessage({ type: 'error', text: error.message })
      else setMessage({ type: 'error', text: 'Google sign in failed.' })
      setIsLoading(false)
    }
  }

  const switchMode = () => {
    setIsSignUp(!isSignUp)
    setMessage(null)
    setEmail('')
    setPassword('')
    setDisplayName('')
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

            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-12 border-slate-200 hover:bg-slate-50 text-slate-700 font-medium relative"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>

            <div className="relative flex items-center py-2 overflow-hidden">
              <Separator className="flex-grow border-t border-slate-100" />
              <span className="flex-shrink-0 px-4 text-xs text-slate-400 uppercase tracking-wide font-medium whitespace-nowrap">Or using email</span>
              <Separator className="flex-grow border-t border-slate-100" />
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase">Full Name</Label>
                  <Input 
                    type="text" 
                    placeholder="John Doe" 
                    className="h-11 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required={isSignUp}
                  />
                </div>
              )}
              
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
                <Label className="text-xs font-semibold text-slate-500 uppercase">Password</Label>
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
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isSignUp ? 'Create Account' : 'Sign In')}
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={switchMode}
                className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign In' : 'New investor? Create Account'}
              </button>
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
