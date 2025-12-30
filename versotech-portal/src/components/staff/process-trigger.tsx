'use client'

import { useEffect, useMemo, useState } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { workflowInputSchema, workflowInputFieldSchema } from '@/lib/workflows'
import { z } from 'zod'

interface ProcessTriggerProps {
  workflowKey: string
  title: string
  description: string
  iconName?: string
  schema?: Record<string, z.infer<typeof workflowInputFieldSchema>>
  className?: string
  requiredRole?: string
  requiredTitles?: string[]
  category?: string
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
  className,
  requiredRole,
  requiredTitles,
  category
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
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [recentRuns, setRecentRuns] = useState<WorkflowRun[]>([])

  const normalizedSchema = useMemo(() => {
    try {
      return workflowInputSchema.parse(schema)
    } catch (error) {
      console.error('Invalid workflow schema', error)
      return schema
    }
  }, [schema])

  useEffect(() => {
    const defaults: Record<string, any> = {}
    Object.entries(normalizedSchema).forEach(([key, config]) => {
      if (config?.defaultValue !== undefined) {
        defaults[key] = config.defaultValue
      } else if (config?.type === 'checkbox') {
        defaults[key] = false
      }
    })

    if (Object.keys(defaults).length > 0) {
      setFormData((prev) => ({ ...defaults, ...prev }))
    }
  }, [normalizedSchema])

  useEffect(() => {
    const fetchRecentRuns = async () => {
      try {
        const response = await fetch(`/api/workflows/${workflowKey}/recent`)
        if (!response.ok) return
        const data = await response.json()
        if (Array.isArray(data.recentRuns)) {
          setRecentRuns(data.recentRuns)
        }
      } catch (error) {
        console.error('Failed to load recent runs', error)
      }
    }

    fetchRecentRuns()
  }, [workflowKey])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    Object.entries(normalizedSchema).forEach(([key, config]) => {
      if (!config) return

      const value = formData[key]

      if (config.required && (value === undefined || value === '' || value === null)) {
        newErrors[key] = `${config.label || key} is required`
        return
      }

      if (value === undefined || value === null || value === '') {
        return
      }

      if (config.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(String(value))) {
          newErrors[key] = `${config.label || key} must be a valid email`
        }
      }

      if (config.type === 'number') {
        if (Number.isNaN(Number(value))) {
          newErrors[key] = `${config.label || key} must be a number`
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleTrigger = async () => {
    if (!validateForm()) {
      toast.error('Please fix validation errors before triggering')
      return
    }

    setIsTriggering(true)
    
    try {
      const response = await fetch(`/api/workflows/${workflowKey}/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entity_type: 'process',
          workflow_category: category,
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
          onClick: () => window.open(`/versotech_main/workflows/${result.workflow_run_id}`, '_blank')
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

  const renderField = (key: string, config: z.infer<typeof workflowInputFieldSchema>) => {
    const fieldError = errors[key]
    const helperText = config.helperText

    switch (config.type) {
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={key}
              checked={Boolean(formData[key])}
              onCheckedChange={(checked) => {
                setFormData((prev) => ({
                  ...prev,
                  [key]: checked === true
                }))
                setErrors((prev) => ({ ...prev, [key]: '' }))
              }}
            />
            <Label htmlFor={key} className="text-sm font-medium leading-none">
              {config.label || key}
            </Label>
          </div>
        )
      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={key}>{config.label || key}</Label>
            <Select
              value={formData[key] ?? ''}
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, [key]: value }))
                setErrors((prev) => ({ ...prev, [key]: '' }))
              }}
            >
              <SelectTrigger id={key}>
                <SelectValue placeholder={config.placeholder || 'Select option'} />
              </SelectTrigger>
              <SelectContent>
                {config.options?.map((option) => (
                  <SelectItem key={option.toString()} value={option.toString()}>
                    {option.toString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {helperText && !fieldError && (
              <p className="text-xs text-muted-foreground">{helperText}</p>
            )}
            {fieldError && <p className="text-xs text-destructive">{fieldError}</p>}
          </div>
        )
      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={key}>{config.label || key}</Label>
            <Input
              id={key}
              type={config.type || 'text'}
              placeholder={config.placeholder}
              value={formData[key] ?? ''}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  [key]: e.target.value
                }))
                setErrors((prev) => ({ ...prev, [key]: '' }))
              }}
            />
            {helperText && !fieldError && (
              <p className="text-xs text-muted-foreground">{helperText}</p>
            )}
            {fieldError && <p className="text-xs text-destructive">{fieldError}</p>}
          </div>
        )
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription className="space-y-1">
          <span>{description}</span>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {requiredRole && (
              <Badge variant="outline" className="border-dashed">
                Role • {requiredRole}
              </Badge>
            )}
            {requiredTitles && requiredTitles.length > 0 && (
              <Badge variant="outline" className="border-dashed">
                Titles • {requiredTitles.join(', ')}
              </Badge>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Dynamic form fields based on schema */}
        {Object.entries(normalizedSchema).map(([key, config]) => (
          <div key={key}>{renderField(key, config)}</div>
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
