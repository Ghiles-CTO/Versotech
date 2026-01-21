'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Settings,
  Shield,
  Bell,
  Plug,
  FileText,
  Globe,
  Clock,
  DollarSign,
  KeyRound,
  Smartphone,
  Timer,
  Mail,
  FileEdit,
  Webhook,
  Key,
  Eye,
  EyeOff,
  Copy,
  Download,
  Database,
  Trash2,
  CheckCircle,
  Info
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Mock configuration data (in real implementation, this would come from API/environment)
const platformConfig = {
  general: {
    platformName: 'VERSO Holdings',
    timezone: 'Europe/London',
    defaultCurrency: 'GBP'
  },
  security: {
    mfaPolicy: 'required', // 'optional' | 'required' | 'disabled'
    sessionTimeout: 30, // minutes
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecial: true
    }
  },
  notifications: {
    emailTemplates: [
      { id: '1', name: 'Welcome Email', status: 'active', lastModified: '2025-12-01' },
      { id: '2', name: 'KYC Approved', status: 'active', lastModified: '2025-11-28' },
      { id: '3', name: 'KYC Rejected', status: 'active', lastModified: '2025-11-28' },
      { id: '4', name: 'Subscription Confirmation', status: 'active', lastModified: '2025-12-10' },
      { id: '5', name: 'Password Reset', status: 'active', lastModified: '2025-10-15' },
      { id: '6', name: 'Two-Factor Auth Code', status: 'active', lastModified: '2025-09-20' }
    ]
  },
  integrations: {
    apiKeys: [
      { id: '1', name: 'Production API Key', key: 'pk_live_xxxxxxxxxxxxxxxx', created: '2025-06-01', lastUsed: '2026-01-21' },
      { id: '2', name: 'Test API Key', key: 'pk_test_xxxxxxxxxxxxxxxx', created: '2025-06-01', lastUsed: '2026-01-20' }
    ],
    webhooks: [
      { id: '1', name: 'Subscription Events', url: 'https://api.verso.com/webhooks/subscriptions', status: 'active' },
      { id: '2', name: 'KYC Updates', url: 'https://api.verso.com/webhooks/kyc', status: 'active' }
    ]
  },
  audit: {
    logRetention: 365, // days
    totalLogs: 1247582,
    storageUsed: '2.4 GB'
  }
}

export default function AdminSettingsPage() {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev)
      if (next.has(keyId)) {
        next.delete(keyId)
      } else {
        next.add(keyId)
      }
      return next
    })
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const handleExportLogs = () => {
    toast.success('Audit log export started', {
      description: 'You will receive an email when the export is ready.'
    })
  }

  const getMfaPolicyBadge = (policy: string) => {
    switch (policy) {
      case 'required':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Required for All</Badge>
      case 'optional':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Optional</Badge>
      case 'disabled':
        return <Badge variant="destructive">Disabled</Badge>
      default:
        return null
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground mt-1">
          System configuration and administration
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 md:gap-0 md:h-10 md:flex-nowrap">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Audit</span>
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Platform Configuration
              </CardTitle>
              <CardDescription>
                Core platform settings and regional configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Platform Name</label>
                  <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 border">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{platformConfig.general.platformName}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Timezone</label>
                  <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 border">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{platformConfig.general.timezone}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Default Currency</label>
                  <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 border">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{platformConfig.general.defaultCurrency}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-md bg-blue-500/10 border border-blue-500/20">
                <Info className="h-4 w-4 text-blue-400 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Contact your system administrator to modify these settings.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                Multi-Factor Authentication
              </CardTitle>
              <CardDescription>
                MFA policy and enforcement settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                <div className="space-y-1">
                  <div className="font-medium">MFA Policy Status</div>
                  <p className="text-sm text-muted-foreground">
                    Controls whether users must enable two-factor authentication
                  </p>
                </div>
                {getMfaPolicyBadge(platformConfig.security.mfaPolicy)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-primary" />
                Session Management
              </CardTitle>
              <CardDescription>
                User session timeout and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                <div className="space-y-1">
                  <div className="font-medium">Session Timeout</div>
                  <p className="text-sm text-muted-foreground">
                    Users will be logged out after this period of inactivity
                  </p>
                </div>
                <Badge variant="outline" className="text-base">
                  {platformConfig.security.sessionTimeout} minutes
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                Password Policy
              </CardTitle>
              <CardDescription>
                Password requirements for user accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 border">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm">Minimum {platformConfig.security.passwordPolicy.minLength} characters</span>
                </div>
                {platformConfig.security.passwordPolicy.requireUppercase && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 border">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm">Uppercase letters required</span>
                  </div>
                )}
                {platformConfig.security.passwordPolicy.requireNumbers && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 border">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm">Numbers required</span>
                  </div>
                )}
                {platformConfig.security.passwordPolicy.requireSpecial && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 border">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm">Special characters required</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Email Templates
              </CardTitle>
              <CardDescription>
                Manage email templates sent to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {platformConfig.notifications.emailTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                        <FileEdit className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Last modified: {template.lastModified}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        template.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-muted'
                      )}
                    >
                      {template.status}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 p-3 rounded-md bg-amber-500/10 border border-amber-500/20">
                <Info className="h-4 w-4 text-amber-400 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Email template editing is coming soon. Templates are currently managed through Resend.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                API Keys
              </CardTitle>
              <CardDescription>
                Manage API keys for external integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {platformConfig.integrations.apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="p-4 rounded-lg bg-muted/50 border space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{apiKey.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Last used: {apiKey.lastUsed}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 rounded bg-background border font-mono text-sm">
                        {visibleKeys.has(apiKey.id)
                          ? apiKey.key
                          : apiKey.key.replace(/./g, '•').slice(0, 24) + '...'
                        }
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                        title={visibleKeys.has(apiKey.id) ? 'Hide' : 'Show'}
                      >
                        {visibleKeys.has(apiKey.id) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(apiKey.key, 'API Key')}
                        title="Copy"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created: {apiKey.created}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5 text-primary" />
                Webhooks
              </CardTitle>
              <CardDescription>
                Webhook endpoints for real-time event notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {platformConfig.integrations.webhooks.map((webhook) => (
                  <div
                    key={webhook.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <Webhook className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm">{webhook.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {webhook.url}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          webhook.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        )}
                      >
                        {webhook.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(webhook.url, 'Webhook URL')}
                        title="Copy URL"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Log Retention Policy
              </CardTitle>
              <CardDescription>
                Audit log storage and retention settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 border text-center">
                  <div className="text-3xl font-bold text-primary">
                    {platformConfig.audit.logRetention}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Days Retention
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border text-center">
                  <div className="text-3xl font-bold text-primary">
                    {platformConfig.audit.totalLogs.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Total Log Entries
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border text-center">
                  <div className="text-3xl font-bold text-primary">
                    {platformConfig.audit.storageUsed}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Storage Used
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-medium">Export Audit Logs</div>
                  <p className="text-sm text-muted-foreground">
                    Download all audit logs as a CSV file
                  </p>
                </div>
                <Button onClick={handleExportLogs} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Logs
                </Button>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-md bg-amber-500/10 border border-amber-500/20">
                <Info className="h-4 w-4 text-amber-400 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Logs older than {platformConfig.audit.logRetention} days are automatically archived. Contact support to access archived logs.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-primary" />
                Data Retention
              </CardTitle>
              <CardDescription>
                Compliance and data management settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                  <span className="text-sm">Session Data</span>
                  <Badge variant="outline">90 days</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                  <span className="text-sm">Failed Login Attempts</span>
                  <Badge variant="outline">30 days</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                  <span className="text-sm">API Request Logs</span>
                  <Badge variant="outline">180 days</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                  <span className="text-sm">Document Audit Trail</span>
                  <Badge variant="outline">7 years</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
