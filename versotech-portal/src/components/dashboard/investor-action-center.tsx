'use client'

import type { ElementType } from 'react'

import Link from 'next/link'
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  CalendarDays,
  CheckSquare,
  Clock,
  FileText,
  Inbox,
  Layers,
  MessageSquare,
  ShieldCheck,
  Target
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export interface DashboardTask {
  id: string
  title: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'waived' | 'blocked'
  priority: 'low' | 'medium' | 'high'
  due_at: string | null
  category: string | null
}

export interface DashboardActivity {
  id: string
  title?: string | null
  description?: string | null
  activity_type?: string | null
  created_at: string
  importance?: string | null
  read_status?: boolean | null
}

interface InvestorActionCenterProps {
  tasks: DashboardTask[]
  tasksTotal: number
  recentActivity: DashboardActivity[]
}

const priorityStyles: Record<DashboardTask['priority'], string> = {
  high: 'bg-rose-100 text-rose-700 border-rose-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-slate-100 text-slate-600 border-slate-200'
}

const statusLabels: Record<DashboardTask['status'], string> = {
  pending: 'Awaiting start',
  in_progress: 'In progress',
  completed: 'Completed',
  overdue: 'Overdue',
  waived: 'Waived',
  blocked: 'Blocked'
}

const activityIconMap: Record<string, { icon: ElementType; tone: string }> = {
  document: { icon: FileText, tone: 'text-blue-600' },
  valuation: { icon: Target, tone: 'text-emerald-600' },
  distribution: { icon: ShieldCheck, tone: 'text-emerald-600' },
  deal: { icon: Layers, tone: 'text-indigo-600' },
  message: { icon: MessageSquare, tone: 'text-purple-600' },
  task: { icon: CheckSquare, tone: 'text-amber-600' },
  capital_call: { icon: CalendarClock, tone: 'text-rose-600' },
  allocation: { icon: Target, tone: 'text-indigo-600' }
}

function formatDueCopy(dueDate: string | null, status: DashboardTask['status']) {
  if (!dueDate) return status === 'completed' ? 'Completed' : 'No due date'

  const date = new Date(dueDate)
  const now = new Date()
  const formatted = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

  if (status === 'completed') return `Completed ${formatted}`

  if (date < now) {
    const diffDays = Math.ceil((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays > 1 ? `${diffDays} days overdue` : 'Overdue'
  }

  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays <= 1) return 'Due tomorrow'
  if (diffDays <= 3) return `Due in ${diffDays} days`

  return `Due ${formatted}`
}

function getActivityMeta(activity: DashboardActivity) {
  const meta = activityIconMap[activity.activity_type ?? ''] ?? {
    icon: Inbox,
    tone: 'text-slate-500'
  }
  return meta
}

export function InvestorActionCenter({ tasks, tasksTotal, recentActivity }: InvestorActionCenterProps) {
  const outstandingTasks = tasks.filter(task => task.status !== 'completed')
  const urgentTasks = outstandingTasks.filter(task => task.priority === 'high')

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Action centre</h2>
          <p className="text-sm text-muted-foreground">
            Stay ahead of investor tasks, capital movements, and communications.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
            {tasksTotal} open task{tasksTotal === 1 ? '' : 's'}
          </Badge>
          {urgentTasks.length > 0 && (
            <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">
              {urgentTasks.length} high priority
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Outstanding tasks</CardTitle>
            <CardDescription>
              Focus on what needs your attention next across onboarding, compliance, and investments.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {outstandingTasks.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                <CheckSquare className="mx-auto mb-3 h-8 w-8 text-emerald-500" />
                You&apos;re all caught up. We&apos;ll surface new requests here as they arrive.
              </div>
            ) : (
              outstandingTasks.slice(0, 4).map((task) => {
                const dueCopy = formatDueCopy(task.due_at, task.status)
                const isOverdue = dueCopy.includes('overdue') || task.status === 'overdue'

                return (
                  <div
                    key={task.id}
                    className={cn(
                      'rounded-xl border bg-background/80 p-4 transition-colors',
                      isOverdue ? 'border-rose-200 bg-rose-50/70' : 'hover:bg-muted/40'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <p className="text-sm font-semibold text-foreground">{task.title}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5', priorityStyles[task.priority])}>
                            <AlertTriangle className="h-3 w-3" />
                            {task.priority} priority
                          </span>
                          <Separator orientation="vertical" className="h-3" />
                          <span className="inline-flex items-center gap-1">
                            <CalendarClock className="h-3.5 w-3.5" />
                            {dueCopy}
                          </span>
                          {task.category && (
                            <>
                              <Separator orientation="vertical" className="h-3" />
                              <span className="capitalize">{task.category.replace(/_/g, ' ')}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="rounded-full border-slate-200 text-[10px] uppercase tracking-wide">
                        {statusLabels[task.status] ?? task.status}
                      </Badge>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
          <CardFooter className="justify-between">
            <div className="text-xs text-muted-foreground">
              Showing {Math.min(outstandingTasks.length, 4)} of {outstandingTasks.length} active task{outstandingTasks.length === 1 ? '' : 's'}.
            </div>
            <Link href="/versoholdings/tasks">
              <Button variant="outline" size="sm">
                View task queue
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent portfolio updates</CardTitle>
            <CardDescription>
              Latest activity across vehicles, documents, and communications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                <Clock className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                No new updates yet. We&apos;ll notify you here when something changes.
              </div>
            ) : (
              recentActivity.slice(0, 4).map((activity) => {
                const { icon: Icon, tone } = getActivityMeta(activity)
                const createdAt = new Date(activity.created_at)
                const timestamp = `${createdAt.toLocaleDateString()} · ${createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

                return (
                  <div
                    key={activity.id}
                    className={cn(
                      'flex items-start gap-3 rounded-xl border p-3 transition-colors',
                      activity.read_status ? 'bg-background' : 'border-blue-200 bg-blue-50/60'
                    )}
                  >
                    <div className={cn('rounded-full border bg-white p-2 shadow-sm', tone)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {activity.title || 'Portfolio update'}
                      </p>
                      {activity.description && (
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                      )}
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{timestamp}</p>
                    </div>
                    {!activity.read_status && (
                      <Badge variant="secondary" className="bg-blue-600 text-white">
                        New
                      </Badge>
                    )}
                  </div>
                )
              })
            )}
          </CardContent>
          <CardFooter className="justify-between">
            <div className="text-xs text-muted-foreground">
              Keep an eye on messages and data room updates for the full context.
            </div>
            <Link href="/versoholdings/messages">
              <Button variant="outline" size="sm">
                Open communications
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Quick actions</CardTitle>
          <CardDescription>Jump directly into the areas investors check most frequently.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          {[
            {
              href: '/versoholdings/holdings',
              label: 'Holdings workspace',
              description: 'Monitor NAV, contributions, and performance',
              icon: Target
            },
            {
              href: '/versoholdings/tasks',
              label: 'Complete tasks',
              description: 'Resolve outstanding action items',
              icon: CheckSquare
            },
            {
              href: '/versoholdings/reports?view=documents',
              label: 'Reports & documents',
              description: 'Statements, notices, and deliverables',
              icon: FileText
            },
            {
              href: '/versoholdings/calendar',
              label: 'Calendar & deadlines',
              description: 'Deal closes, capital calls, meetings',
              icon: CalendarDays
            },
            {
              href: '/versoholdings/messages',
              label: 'Message VERSO',
              description: 'Start a conversation with the team',
              icon: MessageSquare
            }
          ].map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group rounded-xl border p-4 transition-all hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-600/10 p-2 text-blue-700">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground group-hover:text-blue-700">
                      {action.label}
                    </p>
                    <p className="text-xs text-muted-foreground group-hover:text-blue-600">
                      {action.description}
                    </p>
                  </div>
                  <ArrowUpRight className="ml-auto hidden h-4 w-4 text-blue-600 group-hover:block" />
                </div>
              </Link>
            )
          })}
        </CardContent>
      </Card>
    </section>
  )
}
