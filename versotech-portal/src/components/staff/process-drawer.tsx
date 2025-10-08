'use client'

import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ProcessFormBuilder } from './process-form-builder'
import { WorkflowDefinition } from '@/lib/workflows'
import { 
  PlayCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Calendar,
  BarChart3,
  FileText,
  Database,
  MessageSquare,
  Target,
  TrendingUp,
  Shield,
  Users,
  History
} from 'lucide-react'
import { toast } from 'sonner'

interface ProcessDrawerProps {
  workflow: WorkflowDefinition | null
  open: boolean
  onClose: () => void
}

const iconMap: Record<string, any> = {
  BarChart3,
  FileText,
  Database,
  MessageSquare,
  Target,
  TrendingUp,
  Shield,
  Calendar,
  Users
}

interface WorkflowRun {
  id: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

export function ProcessDrawer({ workflow, open, onClose }: ProcessDrawerProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isTriggering, setIsTriggering] = useState(false)
  const [recentRuns, setRecentRuns] = useState<WorkflowRun[]>([])
  const [activeTab, setActiveTab] = useState('configure')

  // Reset form when workflow changes
  useEffect(() => {
    if (workflow) {
      // Set default values
      const defaults: Record<string, any> = {}
      Object.entries(workflow.inputSchema).forEach(([key, config]) => {
        if (config?.defaultValue !== undefined) {
          defaults[key] = config.defaultValue
        } else if (config?.type === 'checkbox') {
          defaults[key] = false
        }
      })
      setFormData(defaults)
      setErrors({})
      setActiveTab('configure')
    }
  }, [workflow])

  // Fetch recent runs when workflow changes
  useEffect(() => {
    if (!workflow) return

    const fetchRecentRuns = async () => {
      try {
        const response = await fetch(`/api/workflows/${workflow.key}/recent`)
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data.recentRuns)) {
            setRecentRuns(data.recentRuns)
          }
        }
      } catch (error) {
        console.error('Failed to load recent runs', error)
      }
    }

    fetchRecentRuns()
  }, [workflow])

  if (!workflow) return null

  const Icon = iconMap[workflow.icon] || PlayCircle

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    Object.entries(workflow.inputSchema).forEach(([key, config]) => {
      if (!config) return

      const value = formData[key]

      // Skip validation for conditional fields that are hidden
      if (config.dependsOn && config.showWhen !== undefined) {
        const dependentValue = formData[config.dependsOn]
        if (dependentValue !== config.showWhen) {
          return // Field is hidden, skip validation
        }
      }

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
      const response = await fetch(`/api/workflows/${workflow.key}/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entity_type: 'process',
          workflow_category: workflow.category,
          payload: formData
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to trigger workflow')
      }

      toast.success(`${workflow.title} workflow triggered successfully`, {
        description: `Workflow run ID: ${result.workflow_run_id}`,
      })

      // Add to recent runs
      const newRun: WorkflowRun = {
        id: result.workflow_run_id,
        status: 'running',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setRecentRuns(prev => [newRun, ...prev.slice(0, 4)])

      // Reset form
      const defaults: Record<string, any> = {}
      Object.entries(workflow.inputSchema).forEach(([key, config]) => {
        if (config?.defaultValue !== undefined) {
          defaults[key] = config.defaultValue
        } else if (config?.type === 'checkbox') {
          defaults[key] = false
        }
      })
      setFormData(defaults)

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
        return <Clock className="h-3 w-3 text-blue-400" />
      case 'running':
        return <Loader2 className="h-3 w-3 text-blue-400 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-400" />
      case 'failed':
        return <XCircle className="h-3 w-3 text-red-400" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued':
      case 'running':
        return 'bg-blue-500/30 text-blue-300 border-blue-500/50'
      case 'completed':
        return 'bg-green-500/30 text-green-300 border-green-500/50'
      case 'failed':
        return 'bg-red-500/30 text-red-300 border-red-500/50'
      default:
        return 'bg-white/20 text-gray-300 border-white/30'
    }
  }

  return (
    <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl bg-zinc-950 border-white/20">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20 border border-white/30">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-white text-xl">{workflow.title}</SheetTitle>
              <SheetDescription className="text-gray-300">
                {workflow.description}
              </SheetDescription>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            {workflow.triggerType === 'manual' && (
              <Badge variant="outline" className="border-sky-500/50 text-sky-300 bg-sky-500/20">
                Manual Trigger
              </Badge>
            )}
            {workflow.triggerType === 'scheduled' && (
              <Badge variant="outline" className="border-purple-500/50 text-purple-300 bg-purple-500/20">
                Scheduled
              </Badge>
            )}
            {workflow.triggerType === 'both' && (
              <>
                <Badge variant="outline" className="border-sky-500/50 text-sky-300 bg-sky-500/20">
                  Manual
                </Badge>
                <Badge variant="outline" className="border-purple-500/50 text-purple-300 bg-purple-500/20">
                  Scheduled
                </Badge>
              </>
            )}
            {workflow.requiredRole && (
              <Badge variant="outline" className="border-white/40 text-gray-300 bg-white/10">
                {workflow.requiredRole.replace('staff_', '').toUpperCase()}
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 bg-zinc-900 border border-white/20">
              <TabsTrigger 
                value="configure" 
                className="text-gray-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
              >
                Configure
              </TabsTrigger>
              <TabsTrigger 
                value="schedule" 
                className="text-gray-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
                disabled={workflow.triggerType === 'manual'}
              >
                Schedule
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="text-gray-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
              >
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="configure" className="mt-6">
              <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
                {workflow.detailedDescription && (
                  <div className="mb-6 p-4 bg-zinc-900/60 border border-white/20 rounded-lg">
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {workflow.detailedDescription}
                    </p>
                  </div>
                )}
                
                <ProcessFormBuilder
                  schema={workflow.inputSchema}
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  setErrors={setErrors}
                />

                <div className="mt-6 pt-6 border-t border-white/20">
                  <Button
                    onClick={handleTrigger}
                    disabled={isTriggering}
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white border-0 shadow-lg hover:shadow-sky-500/50"
                    size="lg"
                  >
                    {isTriggering ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Triggering...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Trigger {workflow.title}
                      </>
                    )}
                  </Button>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="schedule" className="mt-6">
              <div className="flex flex-col items-center justify-center h-[calc(100vh-20rem)] text-center">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Schedule Configuration</h3>
                <p className="text-sm text-gray-400 max-w-sm">
                  Schedule functionality will be available in the next update. Configure cron expressions, frequency, and timezone settings.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <ScrollArea className="h-[calc(100vh-20rem)]">
                {recentRuns.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <History className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Recent Runs</h3>
                    <p className="text-sm text-gray-400">
                      Workflow execution history will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-white mb-4">Recent Executions</h4>
                    {recentRuns.map((run) => (
                      <div
                        key={run.id}
                        className="p-4 bg-zinc-900/60 border border-white/20 rounded-lg hover:bg-zinc-800/60 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(run.status)}
                            <span className="font-mono text-xs text-gray-400">
                              {run.id.slice(0, 12)}...
                            </span>
                          </div>
                          <Badge variant="outline" className={getStatusColor(run.status)}>
                            {run.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(run.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}

