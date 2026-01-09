'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  AlertCircle,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react'
import Link from 'next/link'
import { signIn } from '@/lib/auth-client'

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
  email_has_account?: boolean // NEW: indicates if the invited email has an existing account
}

const ENTITY_TYPE_LABELS: Record<string, string> = {
  partner: 'Partner',
  investor: 'Investor Entity',
  introducer: 'Introducer',
  commercial_partner: 'Commercial Partner',
  lawyer: 'Law Firm',
  arranger: 'Arranger',
  ceo: 'CEO Office',
  staff: 'VERSO Staff'
}

function AcceptInvitationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  // Core states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invitation, setInvitation] = useState<InvitationResponse | null>(null)

  // Accept states
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [acceptResult, setAcceptResult] = useState<{
    message: string
    is_signatory: boolean
    redirect_url: string
  } | null>(null)

  // Account creation states (for new users)
  const [showCreateAccountForm, setShowCreateAccountForm] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [creatingAccount, setCreatingAccount] = useState(false)

  // Sign-in states (for existing users without session)
  const [showSignInForm, setShowSignInForm] = useState(false)
  const [signInPassword, setSignInPassword] = useState('')
  const [signingIn, setSigningIn] = useState(false)

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

  // For logged-in users accepting invitation
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

  // For new users creating account
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    // Validation
    if (displayName.length < 2) {
      setError('Display name must be at least 2 characters')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setCreatingAccount(true)
    setError(null)

    try {
      const response = await fetch(`/api/invitations/${token}/accept-new-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: displayName, password })
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create account')
        if (data.has_account) {
          // User already has account, show sign-in instead
          setShowCreateAccountForm(false)
          setShowSignInForm(true)
        }
        return
      }

      // Account created successfully - now sign in
      try {
        const signInResult = await signIn(invitation!.invitation.email, password, 'investor')
        if (signInResult?.success) {
          setAccepted(true)
          setAcceptResult({
            message: data.message,
            is_signatory: data.is_signatory,
            redirect_url: data.redirect_url
          })

          // Redirect after 3 seconds
          setTimeout(() => {
            router.push(data.redirect_url || '/versotech_main/dashboard')
          }, 3000)
        }
      } catch (signInErr) {
        // Account created but sign-in failed - redirect to login
        router.push(`/versotech_main/login?message=account_created&redirect=${encodeURIComponent(`/invitation/accept?token=${token}`)}`)
      }
    } catch (err) {
      setError('Failed to create account. Please try again.')
    } finally {
      setCreatingAccount(false)
    }
  }

  // For existing users signing in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invitation) return

    setSigningIn(true)
    setError(null)

    try {
      const result = await signIn(invitation.invitation.email, signInPassword, 'investor')
      if (result?.success) {
        // Refresh invitation data after sign-in
        await fetchInvitation()
        setShowSignInForm(false)
      }
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Please check your password.')
    } finally {
      setSigningIn(false)
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

  // Determine if invited email already has an account
  const emailHasAccount = invitation?.email_has_account ?? false

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
            <Link href="/versotech_main/login">
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

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Create Account Form (for new users) */}
          {!user_logged_in && showCreateAccountForm && (
            <form onSubmit={handleCreateAccount} className="space-y-4 pt-2 border-t">
              <div className="text-center mb-4">
                <h3 className="font-semibold">Create Your Account</h3>
                <p className="text-sm text-muted-foreground">Set up your account to accept this invitation</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="displayName">Your Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="John Smith"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  minLength={2}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <Button type="submit" className="w-full" disabled={creatingAccount}>
                {creatingAccount ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Create Account & Accept
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowCreateAccountForm(false)}
              >
                Back
              </Button>
            </form>
          )}

          {/* Sign In Form (for existing users) */}
          {!user_logged_in && showSignInForm && (
            <form onSubmit={handleSignIn} className="space-y-4 pt-2 border-t">
              <div className="text-center mb-4">
                <h3 className="font-semibold">Sign In</h3>
                <p className="text-sm text-muted-foreground">Enter your password to continue</p>
              </div>

              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={inv.email} disabled className="bg-muted" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signInPassword">Password</Label>
                <Input
                  id="signInPassword"
                  type="password"
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={signingIn}>
                {signingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link
                  href="/versotech_main/reset-password"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowSignInForm(false)}
              >
                Back
              </Button>
            </form>
          )}
        </CardContent>

        {/* Footer Actions */}
        {!showCreateAccountForm && !showSignInForm && (
          <CardFooter className="flex flex-col gap-3">
            {user_logged_in ? (
              // Logged in - show accept button
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
            ) : emailHasAccount ? (
              // Not logged in + has account - show sign in
              <Button
                className="w-full"
                size="lg"
                onClick={() => setShowSignInForm(true)}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In to Accept
              </Button>
            ) : (
              // Not logged in + no account - show create account
              <>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setShowCreateAccountForm(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Account to Accept
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Already have an account?{' '}
                  <button
                    onClick={() => setShowSignInForm(true)}
                    className="text-primary hover:underline"
                  >
                    Sign in instead
                  </button>
                </p>
              </>
            )}
          </CardFooter>
        )}
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
