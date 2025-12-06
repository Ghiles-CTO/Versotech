'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Building2,
  FileText,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  ListChecks,
  TrendingUp,
  X,
  Play,
  CheckCheck,
  FileCheck,
  Upload,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Task, TasksByVehicle } from './page'

interface TasksPageClientProps {
  userId: string
  investorIds?: string[] // BUG FIX 2.4: Add investorIds to match server query
  tasksByVehicle: TasksByVehicle[]
  onboardingTasks: Task[]
  staffCreatedTasks: Task[]
  generalComplianceTasks: Task[]
}

export function TasksPageClient({
  userId,
  investorIds = [], // BUG FIX 2.4: Add investorIds
  tasksByVehicle: initialTasksByVehicle,
  onboardingTasks: initialOnboardingTasks,
  staffCreatedTasks: initialStaffCreatedTasks,
  generalComplianceTasks: initialGeneralComplianceTasks
}: TasksPageClientProps) {
  const [tasksByVehicle, setTasksByVehicle] = useState(initialTasksByVehicle)
  const [onboardingTasks, setOnboardingTasks] = useState(initialOnboardingTasks)
  const [staffCreatedTasks, setStaffCreatedTasks] = useState(initialStaffCreatedTasks)
  const [generalComplianceTasks, setGeneralComplianceTasks] = useState(initialGeneralComplianceTasks)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    onboarding: true,
    staffCreated: true,
    compliance: true
  })

  // BUG FIX 2.4 & 2.5: Match server-side query logic with proper filters and all 3 orders
  const refreshTasks = useCallback(async () => {
    const supabase = createClient()

    // Build query to match server-side logic (page.tsx)
    let tasksQuery = supabase
      .from('tasks')
      .select('*')

    // BUG FIX 2.4: Include owner_investor_id in OR filter (matching server)
    if (investorIds.length > 0) {
      tasksQuery = tasksQuery.or(
        `owner_user_id.eq.${userId},owner_investor_id.in.(${investorIds.join(',')})`
      )
    } else {
      tasksQuery = tasksQuery.eq('owner_user_id', userId)
    }

    // BUG FIX 2.5: Add all 3 orders to match server-side query
    const { data: tasks } = await tasksQuery
      .order('due_at', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })

    if (tasks) {
      // Sort by priority (high → medium → low), then by due_at, then by created_at
      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
      const allTasks = (tasks as Task[]).sort((a, b) => {
        const pA = priorityOrder[a.priority] ?? 99
        const pB = priorityOrder[b.priority] ?? 99
        if (pA !== pB) return pA - pB
        if (a.due_at !== b.due_at) {
          if (!a.due_at) return 1
          if (!b.due_at) return -1
          return new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
        }
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      })

      setOnboardingTasks(allTasks.filter(t =>
        t.category === 'onboarding' && !t.related_entity_id
      ))

      setStaffCreatedTasks(allTasks.filter(t =>
        !t.category && !t.related_entity_id
      ))

      // BUG FIX 3.4: Include investment_setup in general compliance tasks (matching server)
      setGeneralComplianceTasks(allTasks.filter(t =>
        (t.category === 'compliance' || t.category === 'investment_setup') && (
          !t.related_entity_id ||
          t.related_entity_type === 'signature_request' ||
          t.related_entity_type === 'subscription'
        )
      ))

      setTasksByVehicle(prev => prev.map(group => ({
        ...group,
        tasks: allTasks.filter(t =>
          t.related_entity_type === 'vehicle' && t.related_entity_id === group.vehicle.id
        )
      })))
    }
  }, [userId, investorIds])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('tasks_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `owner_user_id=eq.${userId}`
      }, () => {
        refreshTasks()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, refreshTasks])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  async function startTask(taskId: string) {
    setIsUpdating(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('tasks')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)

    if (error) {
      console.error('Failed to start task:', error)
      toast.error('Failed to start task. Please try again.')
      setIsUpdating(false)
      return
    }

    setIsUpdating(false)
    await refreshTasks()
    setSelectedTask(null)
  }

  async function completeTask(taskId: string) {
    setIsUpdating(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)

    if (error) {
      console.error('Failed to complete task:', error)
      toast.error('Failed to complete task. Please try again.')
      setIsUpdating(false)
      return
    }

    toast.success('Task completed successfully')
    setIsUpdating(false)
    setSelectedTask(null)
    await refreshTasks()
  }

  async function cancelTask(taskId: string) {
    setIsUpdating(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('tasks')
      .update({
        status: 'pending',
        started_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)

    if (error) {
      console.error('Failed to cancel task:', error)
      toast.error('Failed to cancel task. Please try again.')
      setIsUpdating(false)
      return
    }

    setIsUpdating(false)
    setSelectedTask(null)
    await refreshTasks()
  }

  async function handleFileUpload(file: File, task: Task) {
    setUploading(true)
    setUploadError(null)

    try {
      // Determine document type from task title
      const documentType = getDocumentTypeFromTask(task)

      if (!documentType) {
        setUploadError('Unable to determine document type for this task')
        setUploading(false)
        return
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', documentType)
      formData.append('taskId', task.id)

      const response = await fetch('/api/investors/me/documents/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const result = await response.json()

      // Show success toast
      toast.success(
        result.task_completed
          ? 'Document uploaded successfully and task completed'
          : 'Document uploaded successfully and is pending review'
      )

      // Upload successful - refresh tasks (the task should be auto-completed by the API)
      await refreshTasks()
      setSelectedTask(null)
    } catch (error: any) {
      console.error('Upload error:', error)
      setUploadError(error.message || 'Failed to upload document')
      toast.error(error.message || 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  function getDocumentTypeFromTask(task: Task): string | null {
    const title = task.title.toLowerCase()

    if (title.includes('government id') || title.includes('passport') || title.includes('driver')) {
      return 'government_id'
    }
    if (title.includes('proof of address') || title.includes('utility bill')) {
      return 'proof_of_address'
    }
    if (title.includes('accreditation')) {
      return 'accreditation_letter'
    }
    if (title.includes('bank statement')) {
      return 'bank_statement'
    }
    if (title.includes('entity formation') || title.includes('incorporation')) {
      return 'entity_formation_docs'
    }
    if (title.includes('beneficial ownership')) {
      return 'beneficial_ownership'
    }

    return null
  }

  function isDocumentUploadTask(task: Task): boolean {
    const title = task.title.toLowerCase()
    return title.includes('upload') || getDocumentTypeFromTask(task) !== null
  }

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { label: 'Pending', className: 'bg-gray-100 text-gray-700 border-gray-200' },
      in_progress: { label: 'In Progress', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      completed: { label: 'Completed', className: 'bg-green-50 text-green-700 border-green-200' },
      overdue: { label: 'Overdue', className: 'bg-red-50 text-red-700 border-red-200' },
      blocked: { label: 'Blocked', className: 'bg-gray-100 text-gray-600 border-gray-300' }
    }
    const config = configs[status as keyof typeof configs] || configs.pending
    return <Badge variant="outline" className={cn('text-xs font-normal', config.className)}>{config.label}</Badge>
  }

  const getPriorityIndicator = (priority: string) => {
    if (priority === 'high') return <div className="w-2 h-2 rounded-full bg-red-500" />
    if (priority === 'medium') return <div className="w-2 h-2 rounded-full bg-yellow-500" />
    return <div className="w-2 h-2 rounded-full bg-gray-300" />
  }

  const isOverdue = (task: Task) => {
    return task.due_at && new Date(task.due_at) < new Date() && task.status !== 'completed'
  }

  const TaskItem = ({ task }: { task: Task }) => {
    const overdue = isOverdue(task)
    const isComplete = task.status === 'completed' || task.status === 'waived'

    return (
      <div
        className={cn(
          "group flex items-center justify-between px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors",
          isComplete && "bg-green-50/30"
        )}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedTask(task)}>
          <div className="flex-shrink-0">
            {isComplete ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : overdue ? (
              <AlertCircle className="h-5 w-5 text-red-600" />
            ) : (
              <Clock className="h-5 w-5 text-gray-400" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {getPriorityIndicator(task.priority)}
              <h3 className={cn(
                "text-sm font-medium text-gray-900 truncate",
                isComplete && "text-gray-500"
              )}>
                {task.title}
              </h3>
            </div>
            
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              {task.due_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span className={cn(overdue && "text-red-600 font-medium")}>
                    {new Date(task.due_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
              {task.estimated_minutes && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{task.estimated_minutes} min</span>
                </div>
              )}
              {task.started_at && !isComplete && (
                <div className="flex items-center gap-1 text-blue-600">
                  <Play className="h-3 w-3" />
                  <span>Started {new Date(task.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getStatusBadge(task.status)}
          </div>
        </div>

        {!isComplete && (
          <Button 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation()
              setSelectedTask(task)
            }}
            className="ml-3 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={task.status === 'blocked'}
          >
            {task.status === 'in_progress' ? 'Continue' : 'Start'}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    )
  }

  const TaskSection = ({ 
    title, 
    icon: Icon, 
    tasks, 
    sectionKey, 
    badge
  }: { 
    title: string
    icon: any
    tasks: Task[]
    sectionKey: string
    badge?: React.ReactNode
  }) => {
    const pendingTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'waived')
    const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'waived')
    const isExpanded = expandedSections[sectionKey] ?? true

    if (tasks.length === 0) return null

    return (
      <Card className="border border-gray-200">
        <div 
          className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
          onClick={() => toggleSection(sectionKey)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Icon className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                {badge}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {pendingTasks.length} pending · {completedTasks.length} completed
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white text-gray-600 border-gray-200">
              {tasks.length}
            </Badge>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>

        {isExpanded && (
          <CardContent className="p-0">
            {pendingTasks.length > 0 ? (
              <div>
                {pendingTasks.map(task => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500 text-sm">
                All tasks completed
              </div>
            )}

            {completedTasks.length > 0 && (
              <details className="border-t border-gray-100">
                <summary className="px-6 py-3 text-sm text-gray-600 cursor-pointer hover:bg-gray-50 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Completed ({completedTasks.length})</span>
                </summary>
                <div>
                  {completedTasks.map(task => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
              </details>
            )}
          </CardContent>
        )}
      </Card>
    )
  }

  const allTasks = [...onboardingTasks, ...staffCreatedTasks, ...generalComplianceTasks, ...tasksByVehicle.flatMap(g => g.tasks)]
  const totalPending = allTasks.filter(t => t.status !== 'completed' && t.status !== 'waived').length
  const totalCompleted = allTasks.filter(t => t.status === 'completed' || t.status === 'waived').length
  const totalInProgress = allTasks.filter(t => t.status === 'in_progress').length
  const totalOverdue = allTasks.filter(isOverdue).length
  const completionRate = allTasks.length > 0 ? Math.round((totalCompleted / allTasks.length) * 100) : 0

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header with Stats */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Tasks & Onboarding</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your investment tasks and requirements
              </p>
            </div>
            
            {totalOverdue > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-900">{totalOverdue} Overdue</span>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <ListChecks className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Total</span>
                </div>
                <div className="text-2xl font-semibold text-gray-900">{allTasks.length}</div>
              </CardContent>
            </Card>

            <Card className="border border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Pending</span>
                </div>
                <div className="text-2xl font-semibold text-blue-900">{totalPending}</div>
              </CardContent>
            </Card>

            <Card className="border border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-yellow-600 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Active</span>
                </div>
                <div className="text-2xl font-semibold text-yellow-900">{totalInProgress}</div>
              </CardContent>
            </Card>

            <Card className="border border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Done</span>
                </div>
                <div className="text-2xl font-semibold text-green-900">{totalCompleted}</div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Progress</span>
                </div>
                <div className="text-2xl font-semibold text-gray-900">{completionRate}%</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sections */}
        {staffCreatedTasks.length > 0 && (
          <TaskSection
            title="Created by VERSO Holdings for you"
            icon={User}
            tasks={staffCreatedTasks}
            sectionKey="staffCreated"
            badge={<Badge className="bg-blue-600 text-white text-xs">Custom</Badge>}
          />
        )}

        <TaskSection
          title="Account Onboarding"
          icon={FileText}
          tasks={onboardingTasks}
          sectionKey="onboarding"
        />

        {generalComplianceTasks.length > 0 && (
          <TaskSection
            title="General Compliance"
            icon={FileCheck}
            tasks={generalComplianceTasks}
            sectionKey="compliance"
          />
        )}

        {tasksByVehicle.map((group) => (
          <TaskSection
            key={group.vehicle.id}
            title={group.vehicle.name}
            icon={Building2}
            tasks={group.tasks}
            sectionKey={`vehicle-${group.vehicle.id}`}
            badge={
              <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
                {group.vehicle.type.toUpperCase()}
              </Badge>
            }
          />
        ))}

        {totalPending === 0 && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="p-12 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">All Tasks Completed</h3>
              <p className="text-gray-600">
                Excellent work! You&apos;ve completed all your pending tasks.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Task Details Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between pr-6">
              <div className="flex-1">
                <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedTask?.title}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  {selectedTask && getStatusBadge(selectedTask.status)}
                  {selectedTask?.priority && (
                    <Badge variant="outline" className={cn(
                      "text-xs",
                      selectedTask.priority === 'high' && "border-red-200 text-red-700",
                      selectedTask.priority === 'medium' && "border-yellow-200 text-yellow-700"
                    )}>
                      {selectedTask.priority} priority
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Description */}
            {selectedTask?.description && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Overview</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{selectedTask.description}</p>
              </div>
            )}

            {/* Task Breakdown */}
            {selectedTask?.instructions && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCheck className="h-4 w-4 text-blue-600" />
                  Task Breakdown
                </h4>
                
                {/* Steps */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">Steps to Complete</p>
                  <ol className="space-y-1.5 text-sm text-gray-700">
                    {selectedTask.instructions.steps.map((step, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-blue-600 font-medium">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Requirements */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">Requirements</p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {selectedTask.instructions.requirements.map((req, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-blue-600">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Wire Details if applicable */}
                {selectedTask.instructions.wire_details && (
                  <div className="bg-white border border-blue-200 rounded p-3">
                    <p className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">Wire Transfer Details</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Amount:</span>
                        <span className="ml-2 font-semibold">{selectedTask.instructions.wire_details.amount}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Bank:</span>
                        <span className="ml-2 font-semibold">{selectedTask.instructions.wire_details.bank}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assigned By */}
                {selectedTask.instructions.assigned_by && (
                  <div className="text-xs text-gray-600 pt-2 border-t border-blue-200">
                    <span>Assigned by: </span>
                    <span className="font-medium">{selectedTask.instructions.assigned_by}</span>
                  </div>
                )}
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {selectedTask?.due_at && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Due Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className={cn(
                      "font-medium",
                      isOverdue(selectedTask!) ? "text-red-600" : "text-gray-900"
                    )}>
                      {new Date(selectedTask.due_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              )}

              {selectedTask?.estimated_minutes && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Time Required</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900 font-medium">{selectedTask.estimated_minutes} minutes</span>
                  </div>
                </div>
              )}

              {selectedTask?.started_at && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Started On</p>
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-blue-400" />
                    <span className="text-gray-900 font-medium">
                      {new Date(selectedTask.started_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              )}

              {selectedTask?.completed_at && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Completed On</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="text-gray-900 font-medium">
                      {new Date(selectedTask.completed_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Document Upload Section */}
            {selectedTask && isDocumentUploadTask(selectedTask) && selectedTask.status !== 'completed' && selectedTask.status !== 'waived' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Upload className="h-4 w-4 text-blue-600" />
                  Upload Document
                </h4>
                <p className="text-xs text-gray-600 mb-3">
                  Upload your {getDocumentTypeFromTask(selectedTask)?.replace(/_/g, ' ')} to complete this task automatically.
                </p>

                <input
                  type="file"
                  id="task-document-upload"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.heic,.webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file && selectedTask) {
                      handleFileUpload(file, selectedTask)
                    }
                  }}
                  disabled={uploading}
                />
                <label htmlFor="task-document-upload">
                  <Button
                    variant="outline"
                    className="w-full border-blue-300 hover:bg-blue-100"
                    disabled={uploading}
                    asChild
                  >
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Choose File to Upload'}
                    </span>
                  </Button>
                </label>

                {uploadError && (
                  <p className="text-xs text-red-600 mt-2">{uploadError}</p>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  Accepted formats: PDF, JPG, PNG, HEIC, WEBP (Max 10MB)
                </p>
              </div>
            )}

            {/* Signature Action Button */}
            {selectedTask?.related_entity_type === 'signature_request' && selectedTask?.instructions?.action_url && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Ready to Sign</h4>
                <p className="text-xs text-gray-600 mb-3">
                  Click below to open the signature page and complete your signature.
                </p>
                <a
                  href={selectedTask.instructions.action_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Open Signature Page
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}

            {/* Action Buttons */}
            {selectedTask && selectedTask.status !== 'completed' && selectedTask.status !== 'waived' && (
              <div className="flex items-center gap-3 pt-4 border-t">
                {selectedTask.status === 'pending' ? (
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => startTask(selectedTask.id)}
                    disabled={isUpdating}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Task
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 border-gray-200 hover:bg-gray-50"
                      onClick={() => cancelTask(selectedTask.id)}
                      disabled={isUpdating}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel Task
                    </Button>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => completeTask(selectedTask.id)}
                      disabled={isUpdating}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark as Complete
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
