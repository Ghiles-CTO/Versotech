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
  Target,
  Play,
  ChevronRight
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
  high: 'bg-rose-50 text-rose-700 border-rose-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-slate-50 text-slate-600 border-slate-200'
}

const statusLabels: Record<DashboardTask['status'], string> = {
  pending: 'To Do',
  in_progress: 'In Progress',
  completed: 'Completed',
  overdue: 'Overdue',
  waived: 'Waived',
  blocked: 'Blocked'
}

const activityIconMap: Record<string, { icon: ElementType; tone: string }> = {
  document: { icon: FileText, tone: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
  valuation: { icon: Target, tone: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  distribution: { icon: ShieldCheck, tone: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  deal: { icon: Layers, tone: 'text-amber-600 bg-amber-50 border-amber-100' },
  message: { icon: MessageSquare, tone: 'text-purple-600 bg-purple-50 border-purple-100' },
  task: { icon: CheckSquare, tone: 'text-blue-600 bg-blue-50 border-blue-100' },
  capital_call: { icon: CalendarClock, tone: 'text-rose-600 bg-rose-50 border-rose-100' },
  allocation: { icon: Target, tone: 'text-indigo-600 bg-indigo-50 border-indigo-100' }
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
    tone: 'text-slate-500 bg-slate-50 border-slate-100'
  }
  return meta
}

export function InvestorActionCenter({ tasks, tasksTotal, recentActivity }: InvestorActionCenterProps) {
  const outstandingTasks = tasks.filter(task => task.status !== 'completed')
  const urgentTasks = outstandingTasks.filter(task => task.priority === 'high')

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-medium font-serif text-slate-900">Action Centre</h2>
          <p className="text-sm text-slate-500">
            Priority items requiring your attention and recent updates.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
            {tasksTotal} open task{tasksTotal === 1 ? '' : 's'}
          </Badge>
          {urgentTasks.length > 0 && (
            <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">
              {urgentTasks.length} high priority
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        {/* Task Queue */}
        <Card className="glass-panel flex flex-col border-0">
          <CardHeader className="border-b border-slate-100/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900">Outstanding Tasks</CardTitle>
                <CardDescription className="mt-1 text-sm text-slate-500">
                  Pending actions for onboarding and compliance.
                </CardDescription>
              </div>
              {outstandingTasks.length > 0 && (
                <Link href="/versoholdings/tasks">
                  <Button variant="ghost" size="sm" className="text-xs hover:bg-slate-100/50">
                    View all
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-5">
            {outstandingTasks.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center">
                <div className="mb-3 rounded-full bg-emerald-50 p-3">
                  <CheckSquare className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-slate-900">All caught up!</p>
                <p className="mt-1 text-xs text-slate-500">
                  You have no pending tasks. We&apos;ll notify you when new items arrive.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {outstandingTasks.slice(0, 5).map((task) => {
                  const dueCopy = formatDueCopy(task.due_at, task.status)
                  const isOverdue = dueCopy.includes('overdue') || task.status === 'overdue'

                  return (
                    <div
                      key={task.id}
                      className={cn(
                        'group relative flex items-center justify-between gap-4 rounded-xl border p-4 transition-all',
                        isOverdue
                          ? 'border-rose-200 bg-rose-50/30 hover:border-rose-300'
                          : 'border-slate-200 bg-white/50 hover:bg-white hover:border-amber-200 hover:shadow-sm'
                      )}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900">{task.title}</p>
                          {isOverdue && (
                            <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">Overdue</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium', priorityStyles[task.priority])}>
                            {task.priority === 'high' && <AlertTriangle className="h-3 w-3" />}
                            {task.priority}
                          </span>
                          <Separator orientation="vertical" className="h-3" />
                          <span className="inline-flex items-center gap-1">
                            <CalendarClock className="h-3.5 w-3.5 text-slate-400" />
                            {dueCopy}
                          </span>
                        </div>
                      </div>

                      <Link href={`/versoholdings/tasks?id=${task.id}`}>
                        <Button size="sm" className={cn(
                          "gap-1 shadow-sm transition-all",
                          isOverdue ? "bg-rose-600 hover:bg-rose-700" : "bg-slate-900 hover:bg-slate-800 group-hover:bg-amber-900"
                        )}>
                          Start
                          <Play className="h-3 w-3 fill-current" />
                        </Button>
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-panel flex flex-col border-0">
          <CardHeader className="border-b border-slate-100/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900">Recent Updates</CardTitle>
                <CardDescription className="mt-1 text-sm text-slate-500">
                  Portfolio activity stream.
                </CardDescription>
              </div>
              <Link href="/versoholdings/messages">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100/50">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-5">
            {recentActivity.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/30 p-6 text-center">
                <Clock className="mb-3 h-8 w-8 text-slate-300" />
                <p className="text-xs text-slate-500">No recent activity to report.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity) => {
                  const { icon: Icon, tone } = getActivityMeta(activity)
                  const createdAt = new Date(activity.created_at)
                  const timestamp = createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

                  return (
                    <div key={activity.id} className="flex gap-3 group">
                      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full border shadow-sm transition-transform group-hover:scale-110', tone)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-amber-900 transition-colors">
                            {activity.title || 'Update'}
                          </p>
                          <span className="shrink-0 text-[10px] text-slate-400">{timestamp}</span>
                        </div>
                        {activity.description && (
                          <p className="text-xs text-slate-500 line-clamp-1">{activity.description}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
          {recentActivity.length > 0 && (
            <CardFooter className="border-t border-slate-100/50 p-3">
              <Link href="/versoholdings/messages" className="w-full">
                <Button variant="ghost" size="sm" className="w-full justify-between text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100/50">
                  View full history
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <Card className="glass-panel border-0">
        <CardContent className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-5">
          {[
            {
              href: '/versoholdings/holdings',
              label: 'Holdings',
              description: 'Portfolio & NAV',
              icon: Target,
              color: 'text-indigo-600'
            },
            {
              href: '/versoholdings/tasks',
              label: 'Tasks',
              description: 'Action items',
              icon: CheckSquare,
              color: 'text-blue-600'
            },
            {
              href: '/versoholdings/reports?view=documents',
              label: 'Documents',
              description: 'Statements',
              icon: FileText,
              color: 'text-emerald-600'
            },
            {
              href: '/versoholdings/calendar',
              label: 'Calendar',
              description: 'Deadlines',
              icon: CalendarDays,
              color: 'text-amber-600'
            },
            {
              href: '/versoholdings/messages',
              label: 'Support',
              description: 'Contact team',
              icon: MessageSquare,
              color: 'text-purple-600'
            }
          ].map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                href={action.href}
                className="glass-card group flex flex-col gap-3 rounded-xl border-0 ring-1 ring-slate-200/50 p-4 hover:ring-amber-200/50"
              >
                <div className="flex items-center justify-between">
                  <div className={cn("rounded-lg bg-slate-50 p-2 transition-colors group-hover:bg-amber-50", action.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-amber-900 transition-colors">{action.label}</p>
                  <p className="text-xs text-slate-500">{action.description}</p>
                </div>
              </Link>
            )
          })}
        </CardContent>
      </Card>
    </section>
  )
}
