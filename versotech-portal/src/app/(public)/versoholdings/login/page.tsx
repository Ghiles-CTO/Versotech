'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { signIn, signUp, signInWithGoogle, AuthError } from '@/lib/auth-client'
import {
  Loader2,
  Eye,
  EyeOff,
  User,
  Lock,
  Building2,
  Crown,
  Briefcase,
  ArrowRight,
  Shield,
  Mail,
  UserPlus
} from 'lucide-react'

export default function InvestorLogin() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success' | 'info', text: string } | null>(null)

  // Handle URL error parameters
  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      let errorMessage = 'Authentication error occurred'

      switch (error) {
        case 'session_expired':
          errorMessage = 'Your session has expired. Please sign in again.'
          break
        case 'profile_not_found':
          errorMessage = 'User profile not found. Please contact support.'
          break
        case 'auth_failed':
          errorMessage = 'Authentication failed. Please try again.'
          break
        case 'profile_creation_failed':
          errorMessage = 'Failed to create user profile. Please try again.'
          break
        default:
          errorMessage = 'An authentication error occurred. Please try again.'
      }

      setMessage({
        type: 'error',
        text: errorMessage
      })
    }
  }, [searchParams])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          setMessage({
            type: 'error',
            text: 'Please enter your full name'
          })
          setIsLoading(false)
          return
        }

        // Sign up new user
        await signUp(email, password, displayName, 'investor')
        setMessage({
          type: 'success',
          text: 'Account created! Please check your email to verify your account.'
        })
        setIsSignUp(false)
      } else {
        // Sign in existing user
        const result = await signIn(email, password, 'investor')
        
        if (result?.success) {
          if (result.user?.demo) {
            window.location.href = result.redirect ?? '/versoholdings/dashboard'
          } else {
            router.replace(result.redirect ?? '/versoholdings/dashboard')
          }
        }
      }
    } catch (error) {
      if (error instanceof AuthError) {
        setMessage({
          type: 'error',
          text: error.message
        })
      } else {
        setMessage({
          type: 'error',
          text: 'Authentication failed. Please try again.'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      await signInWithGoogle('investor') // Pass portal context
      // The redirect will be handled by the OAuth flow
    } catch (error) {
      if (error instanceof AuthError) {
        setMessage({
          type: 'error',
          text: error.message
        })
      } else {
        setMessage({
          type: 'error',
          text: 'Google sign in failed. Please try again.'
        })
      }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Login/Sign Up Form */}
        <div className="space-y-8 lg:pr-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Building2 className="h-12 w-12 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">VERSO Holdings</h1>
                <p className="text-blue-600 font-medium">Investor Portal</p>
              </div>
            </div>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-3 pb-6">
              <div className="flex items-center gap-2">
                {isSignUp ? (
                  <>
                    <UserPlus className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-xl">Create Account</CardTitle>
                  </>
                ) : (
                  <>
                    <User className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-xl">Sign In</CardTitle>
                  </>
                )}
              </div>
              <CardDescription className="text-base">
                {isSignUp
                  ? 'Create your account to access VERSO Holdings investor portal'
                  : 'Access your investment portfolio and account information'
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {message && (
                <div className={`p-4 rounded-lg border ${
                  message.type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : message.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Google Sign In Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-11 border-2"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-5">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="John Doe"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required={isSignUp}
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={isSignUp ? "Create a secure password" : "Enter your password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-11 pr-10"
                      minLength={isSignUp ? 6 : undefined}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {isSignUp && (
                    <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !email || !password || (isSignUp && !displayName)}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isSignUp ? 'Creating Account...' : 'Signing In...'}
                    </>
                  ) : (
                    <>
                      {isSignUp ? (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Create Account
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Sign In to Portfolio
                        </>
                      )}
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={switchMode}
                    disabled={isLoading}
                    className="text-sm"
                  >
                    {isSignUp
                      ? 'Already have an account? Sign in instead'
                      : "Don't have an account? Create one now"
                    }
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">VERSO Holdings Investment Platform</p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Bank-level Security
              </span>
              <span>•</span>
              <span>$800M+ AUM</span>
              <span>•</span>
              <span>Since 1958</span>
            </div>
          </div>
        </div>

        {/* Platform Features Panel */}
        <div className="space-y-6 lg:pl-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Investment Platform</h2>
            <p className="text-gray-600">Comprehensive portfolio management and investor services</p>
          </div>

          <div className="space-y-4">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Real-Time Portfolio Dashboard</h3>
                    <p className="text-sm text-gray-600">Track your investments with live performance metrics, DPI, TVPI, and IRR calculations updated in real-time.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100/50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Secure Authentication</h3>
                    <p className="text-sm text-gray-600">Bank-level security with multi-factor authentication and Google OAuth integration for secure access.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100/50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Integrated Communication</h3>
                    <p className="text-sm text-gray-600">Direct messaging with your relationship manager, document sharing, and automated notifications.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-600" />
                Platform Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Portfolio Dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Performance Analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Document Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Real-time Messaging</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Report Requests</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Multi-vehicle Support</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">Need staff access?</p>
            <a href="/versotech/login">
              <Button variant="outline" size="sm">
                <Briefcase className="mr-2 h-4 w-4" />
                Staff Portal
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}