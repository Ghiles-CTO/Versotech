import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Shield,
  Search,
  Filter,
  Download,
  Eye,
  User,
  FileText,
  Database,
  Lock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Globe,
  Activity
} from 'lucide-react'

const mockAuditLogs = [
  {
    id: 'audit-001',
    timestamp: '2024-01-15T16:45:23Z',
    actor: 'Sarah Chen',
    actorRole: 'staff_rm',
    action: 'document_download',
    entity: 'document',
    entityId: 'doc-001',
    entityName: 'Q4-2024-Position-Statement.pdf',
    details: 'Downloaded position statement for Acme Fund LP',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    riskLevel: 'low',
    complianceFlag: false
  },
  {
    id: 'audit-002',
    timestamp: '2024-01-15T16:30:15Z',
    actor: 'john.smith@email.com',
    actorRole: 'investor',
    action: 'login_success',
    entity: 'user_session',
    entityId: 'session-abc123',
    details: 'Successful login via magic link',
    ipAddress: '203.0.113.42',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    riskLevel: 'low',
    complianceFlag: false
  },
  {
    id: 'audit-003',
    timestamp: '2024-01-15T16:15:08Z',
    actor: 'Michael Rodriguez',
    actorRole: 'staff_admin',
    action: 'investor_data_modify',
    entity: 'investor',
    entityId: 'inv-002',
    entityName: 'Tech Ventures Fund',
    details: 'Updated KYC status from pending to completed',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    riskLevel: 'medium',
    complianceFlag: true
  },
  {
    id: 'audit-004',
    timestamp: '2024-01-15T15:45:33Z',
    actor: 'system',
    actorRole: 'system',
    action: 'workflow_execution',
    entity: 'workflow',
    entityId: 'wf-positions-statement',
    entityName: 'Positions Statement Generator',
    details: 'Automated generation of position statement for investor inv-001',
    ipAddress: '127.0.0.1',
    userAgent: 'n8n-workflow-engine/1.0',
    riskLevel: 'low',
    complianceFlag: false
  },
  {
    id: 'audit-005',
    timestamp: '2024-01-15T15:20:45Z',
    actor: 'contact@acmefund.com',
    actorRole: 'investor',
    action: 'failed_login_attempt',
    entity: 'user_session',
    entityId: null,
    details: 'Failed login attempt - invalid credentials',
    ipAddress: '198.51.100.23',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    riskLevel: 'medium',
    complianceFlag: true
  },
  {
    id: 'audit-006',
    timestamp: '2024-01-15T14:30:12Z',
    actor: 'Sarah Chen',
    actorRole: 'staff_rm',
    action: 'report_request_create',
    entity: 'report_request',
    entityId: 'req-001',
    entityName: 'Custom Performance Analysis',
    details: 'Created custom report request for Global Investments LLC',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    riskLevel: 'low',
    complianceFlag: false
  },
  {
    id: 'audit-007',
    timestamp: '2024-01-15T13:45:55Z',
    actor: 'admin@verso.com',
    actorRole: 'staff_admin',
    action: 'user_role_change',
    entity: 'user',
    entityId: 'user-123',
    entityName: 'new.staff@verso.com',
    details: 'Changed user role from investor to staff_ops',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    riskLevel: 'high',
    complianceFlag: true
  },
  {
    id: 'audit-008',
    timestamp: '2024-01-15T12:15:30Z',
    actor: 'maria.rodriguez@email.com',
    actorRole: 'investor',
    action: 'document_access',
    entity: 'document',
    entityId: 'doc-025',
    entityName: 'Annual-Tax-Summary-2023.pdf',
    details: 'Viewed tax summary document',
    ipAddress: '203.0.113.89',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    riskLevel: 'low',
    complianceFlag: false
  }
]

function getActionIcon(action: string) {
  switch (action) {
    case 'login_success':
    case 'login_failed':
    case 'failed_login_attempt':
      return <User className="h-4 w-4" />
    case 'document_download':
    case 'document_access':
      return <FileText className="h-4 w-4" />
    case 'investor_data_modify':
    case 'user_role_change':
      return <Database className="h-4 w-4" />
    case 'workflow_execution':
      return <Activity className="h-4 w-4" />
    case 'report_request_create':
      return <FileText className="h-4 w-4" />
    default:
      return <Shield className="h-4 w-4" />
  }
}

function getRiskColor(risk: string) {
  switch (risk) {
    case 'low':
      return 'bg-green-100 text-green-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'high':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-foreground'
  }
}

function getRoleColor(role: string) {
  switch (role) {
    case 'staff_admin':
      return 'bg-purple-100 text-purple-800'
    case 'staff_rm':
      return 'bg-blue-100 text-blue-800'
    case 'staff_ops':
      return 'bg-green-100 text-green-800'
    case 'investor':
      return 'bg-gray-100 text-foreground'
    case 'system':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-foreground'
  }
}

export default function AuditPage() {
  const stats = {
    totalEvents: mockAuditLogs.length,
    todayEvents: mockAuditLogs.filter(log => {
      const today = new Date().toDateString()
      return new Date(log.timestamp).toDateString() === today
    }).length,
    complianceFlags: mockAuditLogs.filter(log => log.complianceFlag).length,
    highRiskEvents: mockAuditLogs.filter(log => log.riskLevel === 'high').length,
    uniqueUsers: new Set(mockAuditLogs.map(log => log.actor)).size
  }

  return (
    <AppLayout brand="versotech">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Audit & Compliance</h1>
            <p className="text-muted-foreground mt-1">
              Monitor system activity and maintain compliance records
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <div className="text-sm text-muted-foreground mt-1">Last 30 days</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.todayEvents}</div>
              <div className="text-sm text-muted-foreground mt-1">Current activity</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Compliance Flags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.complianceFlags}</div>
              <div className="text-sm text-muted-foreground mt-1">Require review</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">High Risk Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.highRiskEvents}</div>
              <div className="text-sm text-muted-foreground mt-1">Critical attention</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.uniqueUsers}</div>
              <div className="text-sm text-muted-foreground mt-1">Unique actors</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search audit logs by actor, action, or entity..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  Date Range
                </Button>
                <Button variant="outline" size="sm">
                  Risk Level
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Log Table */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
            <CardDescription>
              Comprehensive log of all system activities and user actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAuditLogs.map((log) => (
                <div key={log.id} className="border border-gray-800 rounded-lg p-4 hover:bg-gray-900/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                        log.riskLevel === 'high' ? 'bg-red-950/30 border-red-800' :
                        log.riskLevel === 'medium' ? 'bg-yellow-950/30 border-yellow-800' : 'bg-green-950/30 border-green-800'
                      }`}>
                        {getActionIcon(log.action)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">
                            {log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h3>
                          {log.complianceFlag && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Compliance
                            </Badge>
                          )}
                          <Badge className={getRiskColor(log.riskLevel)}>
                            {log.riskLevel} risk
                          </Badge>
                        </div>

                        <p className="text-foreground mb-3">{log.details}</p>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <div className="font-medium text-foreground">Actor</div>
                            <div className="text-muted-foreground">{log.actor}</div>
                            <Badge className={`${getRoleColor(log.actorRole)} text-xs`}>
                              {log.actorRole.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div>
                            <div className="font-medium text-foreground">Timestamp</div>
                            <div className="text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-foreground">Entity</div>
                            <div className="text-muted-foreground">
                              {log.entityName || log.entityId || log.entity}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-foreground">IP Address</div>
                            <div className="text-muted-foreground flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {log.ipAddress}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-foreground">ID</div>
                            <div className="text-muted-foreground font-mono text-xs">{log.id}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Compliance Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Alerts</CardTitle>
              <CardDescription>
                Events requiring compliance review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAuditLogs.filter(log => log.complianceFlag).slice(0, 3).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-yellow-950/20 border border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      <div>
                        <div className="font-medium text-foreground">{log.action.replace(/_/g, ' ')}</div>
                        <div className="text-sm text-muted-foreground">{log.actor}</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Summary</CardTitle>
              <CardDescription>
                System security and access patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">All admin actions logged</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Document access tracking</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Failed login attempts detected</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Monitoring</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Data encryption active</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Enabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}