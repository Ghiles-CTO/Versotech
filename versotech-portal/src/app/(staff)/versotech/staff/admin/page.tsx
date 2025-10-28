import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Settings,
  Users,
  Database,
  Shield,
  Workflow,
  Bell,
  Globe,
  Key,
  Monitor,
  HardDrive,
  Cpu,
  Activity,
  CheckCircle,
  AlertTriangle,
  Plus,
  Edit,
  Trash2
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const systemMetrics = {
  uptime: '99.97%',
  responseTime: '145ms',
  activeUsers: 47,
  totalStorage: '2.4TB',
  usedStorage: '1.8TB',
  storagePercent: 75,
  apiCalls: 15420,
  errorRate: '0.03%'
}

const integrations = [
  {
    name: 'n8n Workflow Engine',
    status: 'connected',
    lastSync: '2024-01-15T16:45:00Z',
    version: '1.19.4',
    health: 'healthy'
  },
  {
    name: 'Supabase Database',
    status: 'connected',
    lastSync: '2024-01-15T16:47:00Z',
    version: 'Latest',
    health: 'healthy'
  },
  {
    name: 'DocuSign E-Signature',
    status: 'connected',
    lastSync: '2024-01-15T16:30:00Z',
    version: 'API v2.1',
    health: 'healthy'
  },
  {
    name: 'NocoDB Back Office',
    status: 'warning',
    lastSync: '2024-01-15T14:20:00Z',
    version: '0.204.0',
    health: 'degraded'
  }
]

const featureFlags = [
  {
    name: 'Chat System',
    description: 'Enable in-portal messaging between investors and staff',
    enabled: true,
    environment: 'production'
  },
  {
    name: 'Advanced Reports',
    description: 'Allow custom report generation with advanced filters',
    enabled: true,
    environment: 'production'
  },
  {
    name: 'Beta Dashboard',
    description: 'New dashboard design with enhanced analytics',
    enabled: false,
    environment: 'staging'
  },
  {
    name: 'Bulk Operations',
    description: 'Enable bulk investor data import/export functionality',
    enabled: true,
    environment: 'production'
  },
  {
    name: 'Real-time Notifications',
    description: 'Push notifications for time-sensitive updates',
    enabled: false,
    environment: 'development'
  }
]

const vehicles = [
  {
    id: 'vehicle-001',
    name: 'VERSO FUND',
    type: 'Professional Mutual Fund',
    domicile: 'BVI',
    currency: 'USD',
    status: 'active',
    totalNAV: 25000000,
    investors: 15,
    created: '2023-01-15'
  },
  {
    id: 'vehicle-002',
    name: 'REAL Empire',
    type: 'Real Estate Securitization',
    domicile: 'Luxembourg',
    currency: 'EUR',
    status: 'active',
    totalNAV: 18500000,
    investors: 8,
    created: '2023-03-20'
  },
  {
    id: 'vehicle-003',
    name: 'SPV Delta',
    type: 'Special Purpose Vehicle',
    domicile: 'Delaware',
    currency: 'USD',
    status: 'active',
    totalNAV: 5000000,
    investors: 4,
    created: '2023-09-10'
  }
]

export default function AdminPage() {
  return (
    <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Administration</h1>
          <p className="text-muted-foreground mt-1">
            Manage system settings, integrations, and platform configuration
          </p>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                System Uptime
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{systemMetrics.uptime}</div>
              <div className="text-sm text-muted-foreground mt-1">Last 30 days</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{systemMetrics.responseTime}</div>
              <div className="text-sm text-muted-foreground mt-1">Average API response</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics.activeUsers}</div>
              <div className="text-sm text-muted-foreground mt-1">Currently online</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                Storage Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics.storagePercent}%</div>
              <div className="text-sm text-muted-foreground mt-1">{systemMetrics.usedStorage} of {systemMetrics.totalStorage}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks and system management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    User Management
                  </div>
                  <div className="text-sm text-muted-foreground">Add, edit, or deactivate users</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-semibold flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Backup System
                  </div>
                  <div className="text-sm text-muted-foreground">Create system backup</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Security Audit
                  </div>
                  <div className="text-sm text-muted-foreground">Run security assessment</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-semibold flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Send Announcement
                  </div>
                  <div className="text-sm text-muted-foreground">Notify all users</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Integrations */}
        <Card>
          <CardHeader>
            <CardTitle>System Integrations</CardTitle>
            <CardDescription>
              Status and health of external service connections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrations.map((integration, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      integration.status === 'connected' ? 'bg-green-500' :
                      integration.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <h3 className="font-semibold">{integration.name}</h3>
                      <div className="text-sm text-muted-foreground">
                        Version {integration.version} • Last sync: {new Date(integration.lastSync).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={
                      integration.health === 'healthy' ? 'bg-green-100 text-green-800' :
                      integration.health === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {integration.health}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Feature Flags */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Flags</CardTitle>
            <CardDescription>
              Control feature availability across different environments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {featureFlags.map((flag, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{flag.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {flag.environment}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{flag.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={flag.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-foreground'}>
                      {flag.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Toggle
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Investment Vehicles</CardTitle>
              <CardDescription>
                Manage investment vehicles and their configurations
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Database className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{vehicle.name}</h3>
                      <div className="text-sm text-muted-foreground">
                        {vehicle.type} • {vehicle.domicile} • {vehicle.currency}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {vehicle.investors} investors • Created {new Date(vehicle.created).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: vehicle.currency,
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(vehicle.totalNAV)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total NAV</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {vehicle.status}
                    </Badge>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security policies and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Multi-Factor Authentication</div>
                  <div className="text-sm text-muted-foreground">Required for all staff accounts</div>
                </div>
                <Badge className="bg-green-100 text-green-800">Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Session Timeout</div>
                  <div className="text-sm text-muted-foreground">Auto-logout after inactivity</div>
                </div>
                <div className="text-sm text-muted-foreground">8 hours</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Password Policy</div>
                  <div className="text-sm text-muted-foreground">Minimum security requirements</div>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">API Rate Limiting</div>
                  <div className="text-sm text-muted-foreground">Requests per hour limit</div>
                </div>
                <div className="text-sm text-muted-foreground">1000/hour</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure system alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">System Alerts</div>
                  <div className="text-sm text-muted-foreground">Critical system notifications</div>
                </div>
                <Badge className="bg-green-100 text-green-800">Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Security Notifications</div>
                  <div className="text-sm text-muted-foreground">Failed login attempts and breaches</div>
                </div>
                <Badge className="bg-green-100 text-green-800">Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Performance Monitoring</div>
                  <div className="text-sm text-muted-foreground">System performance degradation alerts</div>
                </div>
                <Badge className="bg-green-100 text-green-800">Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Email Notifications</div>
                  <div className="text-sm text-muted-foreground">Admin email alerts</div>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
}