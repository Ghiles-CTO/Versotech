import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Plus,
  Edit,
  Copy,
  Trash2,
  FileText,
  Package,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Upload,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Mail,
  PenTool,
  Eye,
  Workflow
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Mock data - in production this would come from the database
const docTemplates = [
  {
    id: '1',
    key: 'subscription_agreement',
    name: 'Subscription Agreement',
    provider: 'dropbox_sign',
    file_key: 'templates/subscription_agreement.pdf',
    schema: {
      investor_name: 'text',
      investment_amount: 'currency',
      fee_rate: 'percentage',
      vehicle_name: 'text'
    },
    created_at: '2024-01-15',
    usage_count: 25
  },
  {
    id: '2',
    key: 'term_sheet',
    name: 'Investment Term Sheet',
    provider: 'docusign',
    file_key: 'templates/term_sheet.pdf',
    schema: {
      deal_name: 'text',
      offer_price: 'currency',
      commitment_amount: 'currency',
      closing_date: 'date'
    },
    created_at: '2024-02-01',
    usage_count: 18
  },
  {
    id: '3',
    key: 'nda',
    name: 'Non-Disclosure Agreement',
    provider: 'server_pdf',
    file_key: 'templates/nda_template.pdf',
    schema: {
      counterparty_name: 'text',
      effective_date: 'date',
      jurisdiction: 'text'
    },
    created_at: '2024-02-15',
    usage_count: 42
  }
]

const docPackages = [
  {
    id: '1',
    kind: 'subscription_pack',
    investor_name: 'Goldman Sachs Private Wealth',
    deal_name: 'Tech Growth Opportunity',
    status: 'signed',
    esign_envelope_id: 'ENV-001',
    created_at: '2024-03-10',
    completed_at: '2024-03-12',
    templates: ['subscription_agreement', 'term_sheet'],
    progress: 100
  },
  {
    id: '2',
    kind: 'nda',
    investor_name: 'Meridian Capital Partners',
    deal_name: 'Real Estate Secondary',
    status: 'sent',
    esign_envelope_id: 'ENV-002',
    created_at: '2024-03-08',
    completed_at: null,
    templates: ['nda'],
    progress: 50
  },
  {
    id: '3',
    kind: 'term_sheet',
    investor_name: 'Family Office Network',
    deal_name: 'Credit Trade Finance',
    status: 'draft',
    esign_envelope_id: null,
    created_at: '2024-03-05',
    completed_at: null,
    templates: ['term_sheet'],
    progress: 25
  }
]

const automationRules = [
  {
    id: '1',
    name: 'Auto-send Term Sheets',
    description: 'Automatically generate and send term sheets when investor commits to deal',
    trigger: 'deal_commitment_created',
    template_key: 'term_sheet',
    active: true,
    success_rate: 95,
    last_run: '2024-03-10'
  },
  {
    id: '2',
    name: 'Subscription Pack Generation',
    description: 'Create subscription packages after term sheet acceptance',
    trigger: 'term_sheet_accepted',
    template_key: 'subscription_agreement',
    active: true,
    success_rate: 88,
    last_run: '2024-03-09'
  },
  {
    id: '3',
    name: 'NDA Auto-send',
    description: 'Send NDAs to new deal participants',
    trigger: 'deal_member_added',
    template_key: 'nda',
    active: false,
    success_rate: 92,
    last_run: '2024-03-05'
  }
]

export default async function DocumentAutomationPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/versotech/login')
  }

  return (
    <AppLayout brand="versotech">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Document Automation</h1>
            <p className="text-muted-foreground mt-1">
              Manage document templates, packages, and automation workflows
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Document Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template_name">Template Name</Label>
                    <Input id="template_name" placeholder="e.g. Subscription Agreement" />
                  </div>
                  <div>
                    <Label htmlFor="template_key">Template Key</Label>
                    <Input id="template_key" placeholder="subscription_agreement" />
                  </div>
                  <div>
                    <Label htmlFor="provider">E-sign Provider</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dropbox_sign">Dropbox Sign</SelectItem>
                        <SelectItem value="docusign">DocuSign</SelectItem>
                        <SelectItem value="server_pdf">Server PDF (No E-sign)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="file">Template File</Label>
                    <Input id="file" type="file" accept=".pdf,.docx" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Upload Template</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Package
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{docTemplates.length}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {docTemplates.reduce((sum, t) => sum + t.usage_count, 0)} total uses
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4" />
                Active Packages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {docPackages.filter(p => p.status === 'sent' || p.status === 'draft').length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {docPackages.filter(p => p.status === 'signed').length} completed
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Workflow className="h-4 w-4" />
                Automation Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {automationRules.filter(r => r.active).length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {automationRules.length} total rules
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(automationRules.reduce((sum, r) => sum + r.success_rate, 0) / automationRules.length)}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">Average automation</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="packages" className="space-y-4">
          <TabsList>
            <TabsTrigger value="packages">Document Packages</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="automation">Automation Rules</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="packages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Document Packages</CardTitle>
                <CardDescription>
                  Track document package generation and e-signature status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {docPackages.map((pkg) => (
                    <div key={pkg.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            pkg.status === 'signed' ? 'bg-green-100' :
                            pkg.status === 'sent' ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            {pkg.status === 'signed' ? <CheckCircle className="h-6 w-6 text-green-600" /> :
                             pkg.status === 'sent' ? <Send className="h-6 w-6 text-blue-600" /> :
                             <FileText className="h-6 w-6 text-muted-foreground" />}
                          </div>
                          <div>
                            <h3 className="font-semibold">{pkg.investor_name}</h3>
                            <div className="text-sm text-muted-foreground">{pkg.deal_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {pkg.kind.replace('_', ' ').charAt(0).toUpperCase() + pkg.kind.replace('_', ' ').slice(1)} •
                              Created {new Date(pkg.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <Progress value={pkg.progress} className="w-24 mb-1" />
                            <div className="text-sm text-muted-foreground">{pkg.progress}% complete</div>
                          </div>
                          <Badge className={
                            pkg.status === 'signed' ? 'bg-green-100 text-green-800' :
                            pkg.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            pkg.status === 'draft' ? 'bg-gray-100 text-foreground' :
                            'bg-red-100 text-red-800'
                          }>
                            {pkg.status}
                          </Badge>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {pkg.status === 'draft' && (
                              <Button variant="outline" size="sm">
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {pkg.templates.map((template) => (
                          <Badge key={template} variant="outline" className="text-xs">
                            {template.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Document Templates</CardTitle>
                <CardDescription>
                  Manage document templates for automation and package generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {docTemplates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{template.name}</h3>
                            <div className="text-sm text-muted-foreground">Key: {template.key}</div>
                            <div className="text-sm text-muted-foreground">
                              {template.provider.replace('_', ' ')} • Used {template.usage_count} times
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">
                            {template.provider.replace('_', ' ')}
                          </Badge>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(template.schema).map(([field, type]) => (
                          <Badge key={field} variant="outline" className="text-xs">
                            {field}: {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Automation Rules</CardTitle>
                  <CardDescription>
                    Configure automated document generation workflows
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {automationRules.map((rule) => (
                    <div key={rule.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${rule.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <div>
                            <h3 className="font-semibold">{rule.name}</h3>
                            <div className="text-sm text-muted-foreground">{rule.description}</div>
                            <div className="text-sm text-muted-foreground">
                              Trigger: {rule.trigger.replace('_', ' ')} • Template: {rule.template_key.replace('_', ' ')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Last run: {new Date(rule.last_run).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="font-semibold text-green-600">{rule.success_rate}%</div>
                            <div className="text-xs text-muted-foreground">Success rate</div>
                          </div>
                          <Badge className={rule.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-foreground'}>
                            {rule.active ? 'Active' : 'Inactive'}
                          </Badge>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              {rule.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Document History</CardTitle>
                <CardDescription>
                  View recent document automation activities and logs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Subscription package completed</div>
                      <div className="text-sm text-muted-foreground">Goldman Sachs Private Wealth - Tech Growth Opportunity</div>
                      <div className="text-xs text-muted-foreground">2 hours ago</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Send className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">NDA sent for signature</div>
                      <div className="text-sm text-muted-foreground">Meridian Capital Partners - Real Estate Secondary</div>
                      <div className="text-xs text-muted-foreground">6 hours ago</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <div>
                      <div className="font-medium">Term sheet generation pending</div>
                      <div className="text-sm text-muted-foreground">Family Office Network - Credit Trade Finance</div>
                      <div className="text-xs text-muted-foreground">1 day ago</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}