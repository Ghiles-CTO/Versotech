'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { DEMO_CREDENTIALS } from '@/lib/simple-auth'
import { 
  Loader2, 
  Eye, 
  EyeOff, 
  Shield, 
  Lock, 
  Settings,
  ArrowRight,
  Building2,
  User
} from 'lucide-react'

export default function StaffLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          portal: 'staff'
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setMessage({
          type: 'error',
          text: result.error || 'Login failed'
        })
        setIsLoading(false)
        return
      }

      // Success - redirect to staff dashboard
      router.push(result.redirect)

    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Network error. Please try again.'
      })
      setIsLoading(false)
    }
  }

  const quickLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
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
                <CardTitle className="text-xl">Staff Access</CardTitle>
              </div>
              <CardDescription className="text-base">
                Operations dashboard for workflow automation and management
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
              
              <form onSubmit={handleSignIn} className="space-y-5">
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
                  disabled={isLoading || !email || !password}
                  className="w-full h-11 bg-slate-700 hover:bg-slate-800 text-white font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Access Operations
                    </>
                  )}
                </Button>
              </form>
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

        {/* Demo Staff Accounts */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Demo Staff Accounts</h2>
            <p className="text-gray-600">Click any account below to auto-fill and access operations</p>
          </div>

          <div className="space-y-4">
            {DEMO_CREDENTIALS.staff.map((cred, index) => {
              const icons = ['👑', '📊', '⚙️']
              const colors = ['amber', 'blue', 'slate']
              return (
                <Card 
                  key={index} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-slate-300 bg-gradient-to-r from-white to-slate-50/50"
                  onClick={() => quickLogin(cred.email, cred.password)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{icons[index]}</div>
                        <div>
                          <div className="font-semibold text-gray-900">{cred.name}</div>
                          <div className="font-mono text-sm text-slate-600">{cred.email}</div>
                          <div className="text-xs text-gray-500">Password: {cred.password}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-800">
                          Staff
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
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