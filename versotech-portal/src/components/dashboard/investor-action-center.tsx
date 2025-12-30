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
import { useTheme } from '@/components/theme-provider'

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

function getPriorityStyles(priority: DashboardTask['priority'], isDark: boolean): string {
  const styles: Record<DashboardTask['priority'], { light: string; dark: string }> = {
    high: {
      light: 'bg-rose-50 text-rose-700 border-rose-200',
      dark: 'bg-rose-900/30 text-rose-400 border-rose-700'
    },
    medium: {
      light: 'bg-amber-50 text-amber-700 border-amber-200',
      dark: 'bg-amber-900/30 text-amber-400 border-amber-700'
    },
    low: {
      light: 'bg-slate-50 text-slate-600 border-slate-200',
      dark: 'bg-zinc-800 text-zinc-400 border-zinc-700'
    }
  }
  return isDark ? styles[priority].dark : styles[priority].light
}

const statusLabels: Record<DashboardTask['status'], string> = {
  pending: 'To Do',
  in_progress: 'In Progress',
  completed: 'Completed',
  overdue: 'Overdue',
  waived: 'Waived',
  blocked: 'Blocked'
}

type IconType = React.ComponentType<{ className?: string }>

function getActivityIconMap(isDark: boolean): Record<string, { icon: IconType; tone: string }> {
  return {
    document: {
      icon: FileText,
      tone: isDark
        ? 'text-indigo-400 bg-indigo-900/30 border-indigo-700'
        : 'text-indigo-600 bg-indigo-50 border-indigo-100'
    },
    valuation: {
      icon: Target,
      tone: isDark
        ? 'text-emerald-400 bg-emerald-900/30 border-emerald-700'
        : 'text-emerald-600 bg-emerald-50 border-emerald-100'
    },
    distribution: {
      icon: ShieldCheck,
      tone: isDark
        ? 'text-emerald-400 bg-emerald-900/30 border-emerald-700'
        : 'text-emerald-600 bg-emerald-50 border-emerald-100'
    },
    deal: {
      icon: Layers,
      tone: isDark
        ? 'text-amber-400 bg-amber-900/30 border-amber-700'
        : 'text-amber-600 bg-amber-50 border-amber-100'
    },
    message: {
      icon: MessageSquare,
      tone: isDark
        ? 'text-purple-400 bg-purple-900/30 border-purple-700'
        : 'text-purple-600 bg-purple-50 border-purple-100'
    },
    task: {
      icon: CheckSquare,
      tone: isDark
        ? 'text-blue-400 bg-blue-900/30 border-blue-700'
        : 'text-blue-600 bg-blue-50 border-blue-100'
    },
    capital_call: {
      icon: CalendarClock,
      tone: isDark
        ? 'text-rose-400 bg-rose-900/30 border-rose-700'
        : 'text-rose-600 bg-rose-50 border-rose-100'
    },
    allocation: {
      icon: Target,
      tone: isDark
        ? 'text-indigo-400 bg-indigo-900/30 border-indigo-700'
        : 'text-indigo-600 bg-indigo-50 border-indigo-100'
    }
  }
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

function getActivityMeta(activity: DashboardActivity, isDark: boolean): { icon: IconType; tone: string } {
  const iconMap = getActivityIconMap(isDark)
  const meta = iconMap[activity.activity_type ?? ''] ?? {
    icon: Inbox,
    tone: isDark
      ? 'text-zinc-400 bg-zinc-800 border-zinc-700'
      : 'text-slate-500 bg-slate-50 border-slate-100'
  }
  return meta
}

export function InvestorActionCenter({ tasks, tasksTotal, recentActivity }: InvestorActionCenterProps) {
  const { theme } = useTheme()
  const isDark = theme === 'staff-dark'
  const outstandingTasks = tasks.filter(task => task.status !== 'completed')
  const urgentTasks = outstandingTasks.filter(task => task.priority === 'high')

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className={cn(
            "text-2xl font-medium font-serif",
            isDark ? "text-white" : "text-slate-900"
          )}>Action Centre</h2>
          <p className={cn(
            "text-sm",
            isDark ? "text-zinc-400" : "text-slate-500"
          )}>
            Priority items requiring your attention and recent updates.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={cn(
            isDark
              ? "border-zinc-700 bg-zinc-800 text-zinc-400"
              : "border-slate-200 bg-slate-50 text-slate-600"
          )}>
            {tasksTotal} open task{tasksTotal === 1 ? '' : 's'}
          </Badge>
          {urgentTasks.length > 0 && (
            <Badge variant="outline" className={cn(
              isDark
                ? "border-rose-700 bg-rose-900/30 text-rose-400"
                : "border-rose-200 bg-rose-50 text-rose-700"
            )}>
              {urgentTasks.length} high priority
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        {/* Task Queue */}
        <Card className="glass-panel flex flex-col border-0">
          <CardHeader className={cn(
            "border-b p-5",
            isDark ? "border-white/10" : "border-slate-100/50"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className={cn(
                  "text-base font-semibold",
                  isDark ? "text-white" : "text-slate-900"
                )}>Outstanding Tasks</CardTitle>
                <CardDescription className={cn(
                  "mt-1 text-sm",
                  isDark ? "text-zinc-400" : "text-slate-500"
                )}>
                  Pending actions for onboarding and compliance.
                </CardDescription>
              </div>
              {outstandingTasks.length > 0 && (
                <Link href="/versotech_main/tasks">
                  <Button variant="ghost" size="sm" className={cn(
                    "text-xs",
                    isDark ? "hover:bg-white/10" : "hover:bg-slate-100/50"
                  )}>
                    View all
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-5">
            {outstandingTasks.length === 0 ? (
              <div className={cn(
                "flex h-full flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center",
                isDark
                  ? "border-zinc-700 bg-zinc-800/30"
                  : "border-slate-200 bg-slate-50/30"
              )}>
                <div className={cn(
                  "mb-3 rounded-full p-3",
                  isDark ? "bg-emerald-900/30" : "bg-emerald-50"
                )}>
                  <CheckSquare className={cn(
                    "h-6 w-6",
                    isDark ? "text-emerald-400" : "text-emerald-600"
                  )} />
                </div>
                <p className={cn(
                  "text-sm font-medium",
                  isDark ? "text-white" : "text-slate-900"
                )}>All caught up!</p>
                <p className={cn(
                  "mt-1 text-xs",
                  isDark ? "text-zinc-500" : "text-slate-500"
                )}>
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
                          ? isDark
                            ? 'border-rose-700 bg-rose-900/20 hover:border-rose-600'
                            : 'border-rose-200 bg-rose-50/30 hover:border-rose-300'
                          : isDark
                            ? 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 hover:border-amber-700 hover:shadow-sm'
                            : 'border-slate-200 bg-white/50 hover:bg-white hover:border-amber-200 hover:shadow-sm'
                      )}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            "font-semibold",
                            isDark ? "text-white" : "text-slate-900"
                          )}>{task.title}</p>
                          {isOverdue && (
                            <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">Overdue</Badge>
                          )}
                        </div>
                        <div className={cn(
                          "flex flex-wrap items-center gap-2 text-xs",
                          isDark ? "text-zinc-400" : "text-slate-500"
                        )}>
                          <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium', getPriorityStyles(task.priority, isDark))}>
                            {task.priority === 'high' && <AlertTriangle className="h-3 w-3" />}
                            {task.priority}
                          </span>
                          <Separator orientation="vertical" className={cn(
                            "h-3",
                            isDark && "bg-zinc-700"
                          )} />
                          <span className="inline-flex items-center gap-1">
                            <CalendarClock className={cn(
                              "h-3.5 w-3.5",
                              isDark ? "text-zinc-500" : "text-slate-400"
                            )} />
                            {dueCopy}
                          </span>
                        </div>
                      </div>

                      <Link href={`/versotech_main/tasks?id=${task.id}`}>
                        <Button size="sm" className={cn(
                          "gap-1 shadow-sm transition-all",
                          isOverdue
                            ? "bg-rose-600 hover:bg-rose-700"
                            : isDark
                              ? "bg-white text-black hover:bg-zinc-200 group-hover:bg-amber-500"
                              : "bg-slate-900 hover:bg-slate-800 group-hover:bg-amber-900"
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
          <CardHeader className={cn(
            "border-b p-5",
            isDark ? "border-white/10" : "border-slate-100/50"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className={cn(
                  "text-base font-semibold",
                  isDark ? "text-white" : "text-slate-900"
                )}>Recent Updates</CardTitle>
                <CardDescription className={cn(
                  "mt-1 text-sm",
                  isDark ? "text-zinc-400" : "text-slate-500"
                )}>
                  Portfolio activity stream.
                </CardDescription>
              </div>
              <Link href="/versotech_main/inbox">
                <Button variant="ghost" size="sm" className={cn(
                  "h-8 w-8 p-0",
                  isDark ? "hover:bg-white/10" : "hover:bg-slate-100/50"
                )}>
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-5">
            {recentActivity.length === 0 ? (
              <div className={cn(
                "flex h-full flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center",
                isDark
                  ? "border-zinc-700 bg-zinc-800/30"
                  : "border-slate-200 bg-slate-50/30"
              )}>
                <Clock className={cn(
                  "mb-3 h-8 w-8",
                  isDark ? "text-zinc-600" : "text-slate-300"
                )} />
                <p className={cn(
                  "text-xs",
                  isDark ? "text-zinc-500" : "text-slate-500"
                )}>No recent activity to report.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity) => {
                  const meta = getActivityMeta(activity, isDark)
                  const ActivityIcon: IconType = meta.icon
                  const createdAt = new Date(activity.created_at)
                  const timestamp = createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

                  return (
                    <div key={activity.id} className="flex gap-3 group">
                      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full border shadow-sm transition-transform group-hover:scale-110', meta.tone)}>
                        <ActivityIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn(
                            "text-sm font-medium line-clamp-2 transition-colors group-hover:text-amber-600",
                            isDark ? "text-white" : "text-slate-900"
                          )}>
                            {activity.title || 'Update'}
                          </p>
                          <span className={cn(
                            "shrink-0 text-[10px]",
                            isDark ? "text-zinc-500" : "text-slate-400"
                          )}>{timestamp}</span>
                        </div>
                        {activity.description && (
                          <p className={cn(
                            "text-xs line-clamp-1",
                            isDark ? "text-zinc-400" : "text-slate-500"
                          )}>{activity.description}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
          {recentActivity.length > 0 && (
            <CardFooter className={cn(
              "border-t p-3",
              isDark ? "border-white/10" : "border-slate-100/50"
            )}>
              <Link href="/versotech_main/inbox" className="w-full">
                <Button variant="ghost" size="sm" className={cn(
                  "w-full justify-between text-xs",
                  isDark
                    ? "text-zinc-400 hover:text-white hover:bg-white/10"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
                )}>
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
              href: '/versotech_main/opportunities',
              label: 'Holdings',
              description: 'Portfolio & NAV',
              icon: Target,
              color: 'text-indigo-600'
            },
            {
              href: '/versotech_main/tasks',
              label: 'Tasks',
              description: 'Action items',
              icon: CheckSquare,
              color: 'text-blue-600'
            },
            {
              href: '/versotech_main/documents',
              label: 'Documents',
              description: 'Statements',
              icon: FileText,
              color: 'text-emerald-600'
            },
            {
              href: '/versotech_main/tasks',
              label: 'Calendar',
              description: 'Deadlines',
              icon: CalendarDays,
              color: 'text-amber-600'
            },
            {
              href: '/versotech_main/inbox',
              label: 'Support',
              description: 'Contact team',
              icon: MessageSquare,
              color: 'text-purple-600'
            }
          ].map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.label}
                href={action.href}
                className={cn(
                  "glass-card group flex flex-col gap-3 rounded-xl border-0 ring-1 p-4 hover:ring-amber-200/50",
                  isDark ? "ring-white/10" : "ring-slate-200/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "rounded-lg p-2 transition-colors group-hover:bg-amber-100",
                    isDark ? "bg-zinc-800 group-hover:bg-amber-900/50" : "bg-slate-50",
                    action.color
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className={cn(
                    "h-4 w-4 transition-colors group-hover:text-amber-600",
                    isDark ? "text-zinc-600" : "text-slate-300"
                  )} />
                </div>
                <div>
                  <p className={cn(
                    "font-semibold transition-colors group-hover:text-amber-600",
                    isDark ? "text-white" : "text-slate-900"
                  )}>{action.label}</p>
                  <p className={cn(
                    "text-xs",
                    isDark ? "text-zinc-400" : "text-slate-500"
                  )}>{action.description}</p>
                </div>
              </Link>
            )
          })}
        </CardContent>
      </Card>
    </section>
  )
}
