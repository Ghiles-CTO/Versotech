'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Shield,
  User,
  FileText,
  Database,
  Activity,
  Eye,
  Globe,
  AlertTriangle
} from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface AuditLog {
  id: string
  timestamp: string
  actor_email: string | null
  actor_role: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  details: string | null
  ip_address: string | null
  user_agent: string | null
  risk_level: string | null
  compliance_flag: boolean | null
  before_value: any
  after_value: any
}

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
    default:
      return <Shield className="h-4 w-4" />
  }
}

function getRiskColor(risk: string | null) {
  switch (risk) {
    case 'low':
      return 'bg-green-100 text-green-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'high':
      return 'bg-red-100 text-red-800'
    case 'critical':
      return 'bg-red-200 text-red-900'
    default:
      return 'bg-gray-100 text-foreground'
  }
}

function getRoleColor(role: string | null) {
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

export function AuditLogTable({ logs }: { logs: AuditLog[] }) {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  if (!logs || logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>
            Comprehensive log of all system activities and user actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            No audit logs found. Try adjusting your filters.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>
            Showing {logs.length} audit events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="border border-gray-800 rounded-lg p-4 hover:bg-gray-900/50 transition-colors cursor-pointer"
                onClick={() => setSelectedLog(log)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                        log.risk_level === 'high' || log.risk_level === 'critical'
                          ? 'bg-red-950/30 border-red-800'
                          : log.risk_level === 'medium'
                          ? 'bg-yellow-950/30 border-yellow-800'
                          : 'bg-green-950/30 border-green-800'
                      }`}
                    >
                      {getActionIcon(log.action)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">
                          {log.action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </h3>
                        {log.compliance_flag && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Compliance
                          </Badge>
                        )}
                        {log.risk_level && (
                          <Badge className={getRiskColor(log.risk_level)}>
                            {log.risk_level} risk
                          </Badge>
                        )}
                      </div>

                      <p className="text-foreground mb-3">{log.details || 'No details provided'}</p>

                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-foreground">Actor</div>
                          <div className="text-muted-foreground">{log.actor_email || 'Unknown'}</div>
                          {log.actor_role && (
                            <Badge className={`${getRoleColor(log.actor_role)} text-xs`}>
                              {log.actor_role.replace('_', ' ')}
                            </Badge>
                          )}
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
                            {log.entity_type || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">IP Address</div>
                          <div className="text-muted-foreground flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {log.ip_address || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">ID</div>
                          <div className="text-muted-foreground font-mono text-xs">
                            {log.id.substring(0, 8)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" onClick={() => setSelectedLog(log)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Complete information for this audit event
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Event ID</h4>
                  <p className="text-sm text-muted-foreground font-mono">{selectedLog.id}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Timestamp</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Actor</h4>
                  <p className="text-sm text-muted-foreground">{selectedLog.actor_email}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Role</h4>
                  <Badge className={getRoleColor(selectedLog.actor_role)}>
                    {selectedLog.actor_role || 'Unknown'}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Action</h4>
                  <p className="text-sm text-muted-foreground">{selectedLog.action}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Risk Level</h4>
                  <Badge className={getRiskColor(selectedLog.risk_level)}>
                    {selectedLog.risk_level || 'Unknown'}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-1">IP Address</h4>
                  <p className="text-sm text-muted-foreground">{selectedLog.ip_address || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Entity</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedLog.entity_type} ({selectedLog.entity_id || 'N/A'})
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-1">Details</h4>
                <p className="text-sm text-muted-foreground">{selectedLog.details}</p>
              </div>

              {selectedLog.user_agent && (
                <div>
                  <h4 className="font-medium mb-1">User Agent</h4>
                  <p className="text-sm text-muted-foreground font-mono text-xs break-all">
                    {selectedLog.user_agent}
                  </p>
                </div>
              )}

              {selectedLog.before_value && (
                <div>
                  <h4 className="font-medium mb-1">Before Value</h4>
                  <pre className="text-sm bg-gray-900 p-3 rounded-lg overflow-auto">
                    {JSON.stringify(selectedLog.before_value, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.after_value && (
                <div>
                  <h4 className="font-medium mb-1">After Value</h4>
                  <pre className="text-sm bg-gray-900 p-3 rounded-lg overflow-auto">
                    {JSON.stringify(selectedLog.after_value, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
