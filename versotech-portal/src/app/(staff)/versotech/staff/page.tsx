import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Users,
  FileText,
  Clock,
  MessageSquare,
  TrendingUp,
  Settings,
  Shield,
  Database,
  Workflow,
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  Building2,
  Activity,
  PlayCircle,
  Zap,
  BarChart3,
  Target,
  Globe
} from 'lucide-react'

export default async function StaffDashboard() {
  return (
    <AppLayout brand="versotech">
      <div className="p-6 space-y-6 text-foreground">

        {/* VERSO Operations Header */}
        <div className="border-b border-border/60 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">VERSO Operations</h1>
              <p className="text-lg text-muted-foreground mt-1">
                Merchant Banking Operations • Multi-Vehicle Management • BVI/GDPR Compliant
              </p>
              <div className="flex items-center gap-4 mt-3">
              <Badge variant="outline" className="text-xs border-white/20 text-foreground">
                  <Shield className="h-3 w-3 mr-1" />
                  BVI FSC Regulated
                </Badge>
              <Badge variant="outline" className="text-xs border-white/20 text-foreground">
                  <Globe className="h-3 w-3 mr-1" />
                  GDPR Compliant
                </Badge>
              <Badge variant="outline" className="text-xs border-white/20 text-foreground">
                  <Activity className="h-3 w-3 mr-1" />
                  n8n Workflows Active
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Operations Dashboard</p>
              <p className="text-lg font-semibold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Operational KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/5 border border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active LPs
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">127</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-emerald-200">+4</span> this month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending KYC/AML
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">8</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-amber-200">3</span> high priority
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Workflow Runs
              </CardTitle>
              <Workflow className="h-4 w-4 text-sky-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">342</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Compliance Rate
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">99.7%</div>
              <p className="text-xs text-muted-foreground">BVI/GDPR standard</p>
            </CardContent>
          </Card>
        </div>

        {/* Process Center & Workflows */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* n8n Process Center */}
          <Card className="lg:col-span-1 border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Zap className="h-5 w-5 text-sky-300" />
                Process Center
              </CardTitle>
              <CardDescription>
                n8n automation workflows for VERSO operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/versotech/staff/processes">
                <Button className="w-full justify-start border-white/10 text-foreground hover:bg-white/10" variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4 text-sky-200" />
                  Positions Statement
                </Button>
              </Link>
              <Link href="/versotech/staff/processes">
                <Button className="w-full justify-start border-white/10 text-foreground hover:bg-white/10" variant="outline">
                  <FileText className="mr-2 h-4 w-4 text-emerald-200" />
                  NDA Agent
                </Button>
              </Link>
              <Link href="/versotech/staff/processes">
                <Button className="w-full justify-start border-white/10 text-foreground hover:bg-white/10" variant="outline">
                  <Database className="mr-2 h-4 w-4 text-purple-200" />
                  Shared-Drive Notification
                </Button>
              </Link>
              <Link href="/versotech/staff/processes">
                <Button className="w-full justify-start border-white/10 text-foreground hover:bg-white/10" variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4 text-sky-200" />
                  Inbox Manager
                </Button>
              </Link>
              <Link href="/versotech/staff/processes">
                <Button className="w-full justify-start border-white/10 text-foreground hover:bg-white/10" variant="outline">
                  <Target className="mr-2 h-4 w-4 text-rose-200" />
                  LinkedIn Leads Scraper
                </Button>
              </Link>
              <Link href="/versotech/staff/processes">
                <Button className="w-full justify-start border-white/10 text-foreground hover:bg-white/10" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4 text-amber-200" />
                  Reporting Agent
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Operations Pipeline */}
          <Card className="lg:col-span-2 border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-foreground">Operations Pipeline</CardTitle>
              <CardDescription>
                Current onboarding funnel and operational status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-sky-400/30 bg-sky-500/10">
                  <div className="flex items-center gap-3">
                    <PlayCircle className="h-5 w-5 text-sky-200" />
                    <div>
                      <p className="font-medium text-foreground">KYC Processing</p>
                      <p className="text-sm text-muted-foreground">Professional investor verification</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-white/10 text-foreground">8 pending</Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-emerald-400/30 bg-emerald-500/10">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-emerald-200" />
                    <div>
                      <p className="font-medium text-foreground">NDA Execution</p>
                      <p className="text-sm text-muted-foreground">DocuSign/Dropbox Sign processing</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-white/10 text-foreground">5 in progress</Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-amber-400/30 bg-amber-500/10">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-amber-200" />
                    <div>
                      <p className="font-medium text-foreground">Subscription Processing</p>
                      <p className="text-sm text-muted-foreground">VERSO FUND & REAL Empire subscriptions</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-white/10 text-foreground">12 review</Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-purple-400/30 bg-purple-500/10">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-purple-200" />
                    <div>
                      <p className="font-medium text-foreground">Capital Calls</p>
                      <p className="text-sm text-muted-foreground">Upcoming capital call notifications</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-white/10 text-foreground">Feb 15</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Operations & Activity */}
        <Card className="border border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Operations</CardTitle>
            <CardDescription>
              Latest workflow executions and system events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-emerald-400/30 bg-emerald-500/10">
                <div className="w-2 h-2 rounded-full bg-emerald-300"></div>
                <BarChart3 className="h-5 w-5 text-sky-200" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Position Statement Generated</p>
                  <p className="text-xs text-muted-foreground">VERSO FUND - Luxembourg Entity LP #47 - Completed</p>
                </div>
                <span className="text-xs text-muted-foreground">12 min ago</span>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border border-sky-400/30 bg-sky-500/10">
                <div className="w-2 h-2 rounded-full bg-sky-300"></div>
                <FileText className="h-5 w-5 text-emerald-200" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">NDA Agent Processing</p>
                  <p className="text-xs text-muted-foreground">Professional Investor Qualification - High Net Worth Individual</p>
                </div>
                <span className="text-xs text-muted-foreground">1 hour ago</span>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border border-amber-400/30 bg-amber-500/10">
                <div className="w-2 h-2 rounded-full bg-amber-300"></div>
                <AlertTriangle className="h-5 w-5 text-amber-200" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">KYC Review Required</p>
                  <p className="text-xs text-muted-foreground">Enhanced Due Diligence - Institutional Investor</p>
                </div>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border border-purple-400/30 bg-purple-500/10">
                <div className="w-2 h-2 rounded-full bg-purple-300"></div>
                <Database className="h-5 w-5 text-purple-200" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Shared Drive Sync</p>
                  <p className="text-xs text-muted-foreground">REAL Empire Compartment III - Document Update Notification Sent</p>
                </div>
                <span className="text-xs text-muted-foreground">4 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Link href="/versotech/staff/deals">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Building2 className="h-5 w-5 text-sky-200" />
                  Deal Management
                </CardTitle>
                <CardDescription>
                  Manage opportunities with inventory and collaboration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2 text-foreground">8</div>
                <p className="text-sm text-muted-foreground">Active deals</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/versotech/staff/requests">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <ClipboardList className="h-5 w-5 text-amber-200" />
                  Request Management
                </CardTitle>
                <CardDescription>
                  Handle LP requests and track fulfillment status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2 text-foreground">23</div>
                <p className="text-sm text-muted-foreground">Active requests</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/versotech/staff/audit">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Shield className="h-5 w-5 text-emerald-200" />
                  Compliance & Audit
                </CardTitle>
                <CardDescription>
                  BVI/FSC compliance monitoring and audit trails
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2 text-foreground">100%</div>
                <p className="text-sm text-muted-foreground">Regulatory compliance</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/versotech/staff/investors">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Users className="h-5 w-5 text-purple-200" />
                  LP Management
                </CardTitle>
                <CardDescription>
                  Investor onboarding and relationship management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2 text-foreground">127</div>
                <p className="text-sm text-muted-foreground">Active LPs</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}