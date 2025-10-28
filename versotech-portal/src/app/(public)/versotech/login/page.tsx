'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { signUp, signIn, signInWithGoogle, AuthError } from '@/lib/auth-client'
import { 
  Loader2, 
  Eye, 
  EyeOff, 
  Shield, 
  Lock, 
  Settings,
  Building2,
  User
} from 'lucide-react'

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
          setMessage({
            type: 'error',
            text: 'Please enter your full name'
          })
          setIsLoading(false)
          return
        }

        // Sign up new staff user
        await signUp(email, password, displayName, 'staff')
        setMessage({
          type: 'success',
          text: 'Account created! Please check your email to verify your account.'
        })
        setIsSignUp(false)
      } else {
        // Sign in existing user
        const result = await signIn(email, password, 'staff')
        
        console.log('[StaffLogin] SignIn result:', result)
        
        if (result?.success) {
          if ((result.user as any)?.demo) {
            window.location.href = result.redirect ?? '/versotech/staff'
          } else {
            router.replace(result.redirect ?? '/versotech/staff')
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

  const quickLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setIsSignUp(false)
  }

  const switchMode = () => {
    setIsSignUp(!isSignUp)
    setMessage(null)
    setEmail('')
    setPassword('')
    setDisplayName('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Login Form */}
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Settings className="h-12 w-12 text-slate-700" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">VERSO Tech</h1>
                <p className="text-slate-600 font-medium">Operations Portal</p>
              </div>
            </div>
          </div>
          
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-3 pb-6">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-slate-700" />
                <CardTitle className="text-xl">{isSignUp ? 'Create Staff Account' : 'Staff Access'}</CardTitle>
              </div>
              <CardDescription className="text-base">
                {isSignUp ? 'Register a new staff account for operations access' : 'Operations dashboard for workflow automation and management'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {message && (
                <div className={`p-4 rounded-lg border ${
                  message.type === 'error' 
                    ? 'bg-red-50 border-red-200 text-red-700' 
                    : 'bg-green-50 border-green-200 text-green-700'
                }`}>
                  {message.text}
                </div>
              )}
              
              <form onSubmit={handleAuth} className="space-y-5">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="Enter your full name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required={isSignUp}
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Staff Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="staff@versotech.com"
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
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-11 pr-10"
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
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isLoading || !email || !password || (isSignUp && !displayName)}
                  className="w-full h-11 bg-slate-700 hover:bg-slate-800 text-white font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isSignUp ? 'Creating Account...' : 'Authenticating...'}
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      {isSignUp ? 'Create Staff Account' : 'Access Operations'}
                    </>
                  )}
                </Button>
              </form>
              
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={switchMode}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">VERSO Tech Operations Dashboard</p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Secure Access
              </span>
              <span>•</span>
              <span>Staff Only</span>
              <span>•</span>
              <span>Enterprise Grade</span>
            </div>
          </div>
        </div>

        {/* Operations Features */}
        <div className="space-y-6 lg:pl-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Operations Platform</h2>
            <p className="text-gray-600">Powerful workflow automation and investor management tools</p>
          </div>

          <Card className="bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-slate-600" />
                Operations Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>n8n Workflows</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>Investor Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>Document Processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>Compliance Monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>Audit Logs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>Process Automation</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">Need investor access?</p>
            <a href="/versoholdings/login">
              <Button variant="outline" size="sm">
                <User className="mr-2 h-4 w-4" />
                Investor Portal
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}