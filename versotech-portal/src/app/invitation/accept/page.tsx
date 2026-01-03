'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Mail,
  PenTool,
  UserPlus,
  LogIn,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface InvitationDetails {
  id: string
  entity_type: string
  entity_name: string
  email: string
  role: string
  is_signatory: boolean
  invited_by_name: string
  expires_at: string
}

interface InvitationResponse {
  invitation: InvitationDetails
  user_logged_in: boolean
  email_match: boolean
  user_email?: string
}

const ENTITY_TYPE_LABELS: Record<string, string> = {
  partner: 'Partner',
  investor: 'Investor Entity',
  introducer: 'Introducer',
  commercial_partner: 'Commercial Partner',
  lawyer: 'Law Firm',
  arranger: 'Arranger'
}

function AcceptInvitationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invitation, setInvitation] = useState<InvitationResponse | null>(null)
  const [accepted, setAccepted] = useState(false)
  const [acceptResult, setAcceptResult] = useState<{
    message: string
    is_signatory: boolean
    redirect_url: string
  } | null>(null)

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link - no token provided')
      setLoading(false)
      return
    }

    fetchInvitation()
  }, [token])

  const fetchInvitation = async () => {
    try {
      const response = await fetch(`/api/invitations/${token}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to load invitation')
        return
      }

      setInvitation(data)
    } catch (err) {
      setError('Failed to load invitation details')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!token) return

    setAccepting(true)
    setError(null)

    try {
      const response = await fetch(`/api/invitations/${token}`, {
        method: 'POST'
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to accept invitation')
        return
      }

      setAccepted(true)
      setAcceptResult(data)

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push(data.redirect_url || '/versotech_main/dashboard')
      }, 3000)
    } catch (err) {
      setError('Failed to accept invitation')
    } finally {
      setAccepting(false)
    }
  }

  const formatExpiry = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) return 'Expired'
    if (diffDays === 1) return 'Expires tomorrow'
    return `Expires in ${diffDays} days`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Loading invitation...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/auth/signin">
              <Button variant="outline">Go to Sign In</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (accepted && acceptResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <CardTitle>Welcome!</CardTitle>
            <CardDescription>{acceptResult.message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {acceptResult.is_signatory && (
              <Alert>
                <PenTool className="h-4 w-4" />
                <AlertDescription>
                  As an authorized signatory, you'll need to upload your signature specimen
                  to sign documents. You can do this from your profile page.
                </AlertDescription>
              </Alert>
            )}
            <p className="text-center text-sm text-muted-foreground">
              Redirecting you to the portal...
            </p>
            <div className="flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invitation) return null

  const { invitation: inv, user_logged_in, email_match, user_email } = invitation

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>You're Invited!</CardTitle>
          <CardDescription>
            {inv.invited_by_name} has invited you to join
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Entity Info */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{inv.entity_name}</p>
                <p className="text-sm text-muted-foreground">
                  {ENTITY_TYPE_LABELS[inv.entity_type] || inv.entity_type}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="capitalize">
                {inv.role}
              </Badge>
              {inv.is_signatory && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <PenTool className="h-3 w-3" />
                  Signatory
                </Badge>
              )}
            </div>
          </div>

          {/* Invitation Details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>Sent to: {inv.email}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatExpiry(inv.expires_at)}</span>
            </div>
          </div>

          {/* Signatory Note */}
          {inv.is_signatory && (
            <Alert>
              <PenTool className="h-4 w-4" />
              <AlertDescription>
                You're being invited as an authorized signatory. After joining,
                you'll need to upload your signature specimen to sign documents.
              </AlertDescription>
            </Alert>
          )}

          {/* Login Required Notice */}
          {!user_logged_in && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need to sign in or create an account to accept this invitation.
              </AlertDescription>
            </Alert>
          )}

          {/* Email Mismatch Warning */}
          {user_logged_in && !email_match && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You're signed in as {user_email}, but this invitation was sent to {inv.email}.
                You can still accept it with your current account.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          {user_logged_in ? (
            <Button
              className="w-full"
              size="lg"
              onClick={handleAccept}
              disabled={accepting}
            >
              {accepting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Accept Invitation
                </>
              )}
            </Button>
          ) : (
            <>
              <Link href={`/auth/signin?redirect=/invitation/accept?token=${token}`} className="w-full">
                <Button className="w-full" size="lg">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In to Accept
                </Button>
              </Link>
              <Link href={`/auth/signup?email=${encodeURIComponent(inv.email)}&redirect=/invitation/accept?token=${token}`} className="w-full">
                <Button variant="outline" className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
              </Link>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading invitation...</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Main page component with Suspense boundary
export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AcceptInvitationContent />
    </Suspense>
  )
}
