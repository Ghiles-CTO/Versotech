'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import {
  PlayCircle,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  BarChart3,
  FileText,
  Database,
  MessageSquare,
  Target,
  TrendingUp,
  Shield,
  Calendar,
  Users
} from 'lucide-react'

interface ProcessTriggerProps {
  workflowKey: string
  title: string
  description: string
  iconName?: string
  schema?: Record<string, any>
  className?: string
}

interface WorkflowRun {
  id: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

export function ProcessTrigger({ 
  workflowKey, 
  title, 
  description, 
  iconName = 'PlayCircle',
  schema = {},
  className 
}: ProcessTriggerProps) {
  
  const getIcon = () => {
    switch (iconName) {
      case 'BarChart3': return BarChart3
      case 'FileText': return FileText
      case 'Database': return Database
      case 'MessageSquare': return MessageSquare
      case 'Target': return Target
      case 'TrendingUp': return TrendingUp
      case 'Shield': return Shield
      case 'Calendar': return Calendar
      case 'Users': return Users
      default: return PlayCircle
    }
  }
  
  const Icon = getIcon()
  const [isTriggering, setIsTriggering] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [recentRuns, setRecentRuns] = useState<WorkflowRun[]>([])

  const handleTrigger = async () => {
    setIsTriggering(true)
    
    try {
      const response = await fetch(`/api/workflows/${workflowKey}/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entity_type: 'process',
          payload: formData
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to trigger workflow')
      }

      toast.success(`${title} workflow triggered successfully`, {
        description: `Workflow run ID: ${result.workflow_run_id}`,
        action: {
          label: 'View',
          onClick: () => window.open(`/versotech/staff/workflows/${result.workflow_run_id}`, '_blank')
        }
      })

      // Add to recent runs
      const newRun: WorkflowRun = {
        id: result.workflow_run_id,
        status: 'running',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setRecentRuns(prev => [newRun, ...prev.slice(0, 4)])

    } catch (error) {
      console.error('Workflow trigger error:', error)
      toast.error('Failed to trigger workflow', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setIsTriggering(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-3 w-3 text-blue-500" />
      case 'running':
        return <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'failed':
        return <XCircle className="h-3 w-3 text-red-500" />
      default:
        return <AlertCircle className="h-3 w-3 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued':
        return 'bg-blue-100 text-blue-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Dynamic form fields based on schema */}
        {Object.entries(schema).map(([key, config]: [string, any]) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{config.label || key}</Label>
            <Input
              id={key}
              type={config.type || 'text'}
              placeholder={config.placeholder}
              value={formData[key] || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                [key]: e.target.value 
              }))}
            />
          </div>
        ))}

        <Button 
          onClick={handleTrigger} 
          disabled={isTriggering}
          className="w-full"
        >
          {isTriggering ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Triggering...
            </>
          ) : (
            <>
              <PlayCircle className="mr-2 h-4 w-4" />
              Trigger {title}
            </>
          )}
        </Button>

        {/* Recent workflow runs */}
        {recentRuns.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Recent Runs</h4>
            <div className="space-y-2">
              {recentRuns.map((run) => (
                <div key={run.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(run.status)}
                    <span className="font-mono">{run.id.slice(0, 8)}...</span>
                  </div>
                  <Badge variant="secondary" className={getStatusColor(run.status)}>
                    {run.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
