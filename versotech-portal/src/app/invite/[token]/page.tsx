'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import {
  Loader2,
  Shield,
  ArrowRight,
  ArrowLeft,
  XCircle,
  CheckCircle,
  Briefcase,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface InviteInfo {
  id: string
  role: string
  deal: {
    id: string
    name: string
    vehicle_name?: string
  }
}

export default function InviteRedemptionPage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [status, setStatus] = useState<'loading' | 'valid' | 'redeeming' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  // Check authentication and validate invite on mount
  useEffect(() => {
    const checkAuthAndValidate = async () => {
      const supabase = createClient()

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)

      // Validate the invite token
      try {
        const response = await fetch(`/api/invite/${token}`)
        const data = await response.json()

        if (!response.ok) {
          setStatus('error')
          setMessage(data.error || 'Invalid invite link')
          return
        }

        setInviteInfo(data.inviteLink)
        setStatus('valid')
      } catch {
        setStatus('error')
        setMessage('Failed to validate invite link')
      }
    }

    if (token) {
      checkAuthAndValidate()
    } else {
      setStatus('error')
      setMessage('Invalid invite link')
    }
  }, [token])

  const handleRedeem = useCallback(async () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(`/invite/${token}`)
      router.push(`/versotech_main/login?redirect=${returnUrl}`)
      return
    }

    setStatus('redeeming')

    try {
      const response = await fetch(`/api/invite/${token}`, {
        method: 'POST'
      })
      const data = await response.json()

      if (!response.ok) {
        setStatus('error')
        setMessage(data.error || 'Failed to redeem invite')
        return
      }

      setStatus('success')
      setMessage(data.message || 'Invite redeemed successfully!')

      // Redirect to the deal page
      setTimeout(() => {
        if (data.redirect) {
          router.push(data.redirect)
        } else if (inviteInfo?.deal.id) {
          router.push(`/versotech_main/opportunities/${inviteInfo.deal.id}`)
        }
      }, 2000)
    } catch {
      setStatus('error')
      setMessage('Failed to process invite')
    }
  }, [isAuthenticated, token, router, inviteInfo])

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      investor: 'Investor',
      co_investor: 'Co-Investor',
      spouse: 'Spouse/Partner',
      advisor: 'Advisor',
      lawyer: 'Legal Counsel',
      banker: 'Banking Contact',
      introducer: 'Introducer',
      viewer: 'Viewer'
    }
    return labels[role] || role
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
                  alt="VERSO"
                  fill
                  className="object-contain invert"
                  priority
                />
             </div>
          </div>
          <p className="text-zinc-500 text-sm tracking-wide uppercase">
            Deal Invitation
          </p>
        </div>

        <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-sm shadow-2xl shadow-black">
          <CardContent className="p-8 space-y-6">

            {status === 'loading' && (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-white animate-spin" />
                <p className="text-zinc-400">Validating invite link...</p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center py-8 space-y-4">
                <XCircle className="w-16 h-16 mx-auto text-red-500" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-white">Invite Link Invalid</h3>
                  <p className="text-sm text-zinc-400">{message}</p>
                </div>
                <Link href="/versotech_main/login">
                  <Button variant="outline" className="mt-4 bg-white/5 border-white/10 hover:bg-white/10 text-white">
                    Go to Login
                  </Button>
                </Link>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center py-8 space-y-4">
                <CheckCircle className="w-16 h-16 mx-auto text-emerald-500" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-white">Invite Redeemed!</h3>
                  <p className="text-sm text-zinc-400">{message}</p>
                  <p className="text-xs text-zinc-600">Redirecting to deal...</p>
                </div>
              </div>
            )}

            {status === 'redeeming' && (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-emerald-500 animate-spin" />
                <p className="text-zinc-400">Processing your invite...</p>
              </div>
            )}

            {status === 'valid' && inviteInfo && (
              <>
                <div className="flex items-center justify-center gap-2 text-emerald-500/80 bg-emerald-500/5 py-2 rounded-md border border-emerald-500/10">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-wider">Valid Invitation</span>
                </div>

                <div className="space-y-4">
                  <div className="bg-black/30 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-zinc-500" />
                      <div>
                        <p className="text-xs text-zinc-500 uppercase">Deal</p>
                        <p className="text-white font-medium">{inviteInfo.deal.name}</p>
                        {inviteInfo.deal.vehicle_name && (
                          <p className="text-xs text-zinc-600">{inviteInfo.deal.vehicle_name}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-zinc-500" />
                      <div>
                        <p className="text-xs text-zinc-500 uppercase">Your Role</p>
                        <p className="text-white font-medium">{getRoleLabel(inviteInfo.role)}</p>
                      </div>
                    </div>
                  </div>

                  {!isAuthenticated && (
                    <p className="text-xs text-zinc-500 text-center">
                      You need to sign in or create an account to access this deal.
                    </p>
                  )}

                  <Button
                    onClick={handleRedeem}
                    className="w-full h-12 bg-white hover:bg-zinc-200 text-black font-medium tracking-wide transition-all"
                  >
                    <span className="flex items-center gap-2">
                      {isAuthenticated ? (
                        <>
                          <ArrowRight className="w-4 h-4" /> Access Deal
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4" /> Sign In to Continue
                        </>
                      )}
                    </span>
                  </Button>

                  {!isAuthenticated && (
                    <p className="text-xs text-center text-zinc-600">
                      Don&apos;t have an account?{' '}
                      <Link
                        href={`/versotech_main/login?redirect=${encodeURIComponent(`/invite/${token}`)}`}
                        className="text-white hover:underline"
                      >
                        Create one now
                      </Link>
                    </p>
                  )}
                </div>
              </>
            )}

          </CardContent>
        </Card>

        <div className="text-center space-y-2">
           <div className="flex items-center justify-center gap-2 text-xs text-zinc-600">
              <Shield className="h-3 w-3" />
              <span>Bank-Level 256-bit Encryption</span>
           </div>
           <p className="text-[10px] text-zinc-700 font-mono">VERSO PLATFORM // INVITE ACCESS</p>
        </div>

      </div>
    </div>
  )
}
