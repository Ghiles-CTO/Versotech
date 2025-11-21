'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp, signIn, AuthError } from '@/lib/auth-client'
import { 
  Loader2, 
  Eye, 
  EyeOff, 
  Shield, 
  Lock, 
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function StaffLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)

  const handleAuth = async (e: React.FormEvent) => {
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
        await signUp(email, password, displayName, 'staff')
        setMessage({ type: 'success', text: 'Account created! Please verify email.' })
        setIsSignUp(false)
      } else {
        const result = await signIn(email, password, 'staff')
        if (result?.success) {
          if ((result.user as any)?.demo) {
            window.location.href = result.redirect ?? '/versotech/staff'
          } else {
            router.replace(result.redirect ?? '/versotech/staff')
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

  const switchMode = () => {
    setIsSignUp(!isSignUp)
    setMessage(null)
    setEmail('')
    setPassword('')
    setDisplayName('')
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
                  src="/versotech-logo.jpg" 
                  alt="VERSO Tech" 
                  fill
                  className="object-contain invert" // Inverting for dark mode compatibility if the logo is dark
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
                'bg-emerald-900/20 border-emerald-900/50 text-emerald-400'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-5">
              {isSignUp && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-500 uppercase">Full Name</Label>
                  <Input 
                    type="text" 
                    placeholder="OPERATOR NAME" 
                    className="h-11 bg-black/50 border-white/10 text-white placeholder:text-zinc-700 focus:border-white/30 focus:ring-0 transition-all font-mono"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required={isSignUp}
                  />
                </div>
              )}
              
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
                <Label className="text-xs font-semibold text-zinc-500 uppercase">Passkey</Label>
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
                        <Lock className="w-4 h-4" /> {isSignUp ? 'INITIALIZE ACCOUNT' : 'ACCESS TERMINAL'}
                    </span>
                )}
              </Button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={switchMode}
                className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors uppercase tracking-wider"
              >
                {isSignUp ? '>> Return to Login' : '>> Register New Operator'}
              </button>
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
