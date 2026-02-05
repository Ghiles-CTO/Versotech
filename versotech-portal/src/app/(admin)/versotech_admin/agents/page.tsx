import { redirect } from 'next/navigation'
import {
  Bot,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  UserCircle2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getCurrentUser } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'

type AgentRow = {
  id: string
  name: string
  role: string
  avatar_url: string | null
  email_identity: string | null
  is_active: boolean
  created_at: string
}

type TaskRow = {
  agent_id: string
  task_code: string
  task_name: string
  is_active: boolean
}

type BlacklistEntry = {
  id: string
  severity: 'warning' | 'blocked' | 'banned'
  reason: string | null
  full_name: string | null
  entity_name: string | null
  email: string | null
  phone: string | null
  tax_id: string | null
  status: 'active' | 'resolved' | 'false_positive'
  reported_at: string | null
  reported_by: string | null
  notes?: string | null
}

type BlacklistMatchEntry = {
  id: string
  severity: 'warning' | 'blocked' | 'banned'
  reason: string | null
  full_name: string | null
  entity_name: string | null
  email: string | null
  phone: string | null
  tax_id: string | null
}

type BlacklistMatch = {
  id: string
  blacklist_entry_id?: string | null
  match_type: string
  match_confidence: number | string
  matched_at: string
  compliance_blacklist?: BlacklistMatchEntry | BlacklistMatchEntry[] | null
}

const severityStyles: Record<BlacklistEntry['severity'], string> = {
  warning: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
  blocked: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
  banned: 'bg-red-500/10 text-red-700 dark:text-red-300',
}

const matchTypeLabels: Record<string, string> = {
  email_exact: 'Email match',
  phone_exact: 'Phone match',
  tax_id_exact: 'Tax ID match',
  name_exact: 'Name match',
  entity_name_exact: 'Entity match',
  name_fuzzy: 'Name similar',
  entity_name_fuzzy: 'Entity similar',
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatConfidence(value: number | string) {
  const numeric = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(numeric)) return null
  if (numeric >= 0.999) return 'Exact'
  return `~${numeric.toFixed(2)}`
}

function unwrapEntry(entry?: BlacklistMatchEntry | BlacklistMatchEntry[] | null) {
  if (!entry) return null
  return Array.isArray(entry) ? entry[0] : entry
}

function normalizeQuery(value: string) {
  return value.trim().toLowerCase()
}

function matchQuery(entry: BlacklistEntry, query: string) {
  if (!query) return true
  const haystack = [
    entry.full_name,
    entry.entity_name,
    entry.email,
    entry.phone,
    entry.tax_id,
    entry.reason,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(query)
}

export default async function AgentsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = (await Promise.resolve(searchParams)) ?? {}

  const getParam = (key: string) => {
    const value = resolvedSearchParams[key]
    return typeof value === 'string' ? value : ''
  }

  const mode = getParam('mode')
  const editId = getParam('edit')
  const selectedEntryId = getParam('entry')
  const errorMessage = getParam('error')
  const successMessage = getParam('success')

  const user = await getCurrentUser()
  if (!user) {
    redirect('/versotech_main/login')
  }

  const isAdmin = user.role === 'ceo' || user.permissions?.includes('super_admin')
  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              This page is available to the CEO compliance team only.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const supabase = createServiceClient()

  const [
    { data: agentsData, error: agentsError },
    { data: assignmentsData },
    { data: blacklistEntriesData },
    { data: blacklistMatchesData },
    { data: blacklistAllMatchesData },
    { data: selectedEntryMatchesData },
  ] = await Promise.all([
    supabase
      .from('ai_agents')
      .select('id, name, role, avatar_url, email_identity, is_active, created_at')
      .order('created_at', { ascending: true }),
    supabase
      .from('agent_task_assignments')
      .select('agent_id, task_code, task_name, is_active')
      .order('task_code', { ascending: true }),
    supabase
      .from('compliance_blacklist')
      .select('id, severity, status, reason, full_name, entity_name, email, phone, tax_id, reported_at, reported_by, notes')
      .order('reported_at', { ascending: false }),
    supabase
      .from('blacklist_matches')
      .select(
        'id, match_type, match_confidence, matched_at, compliance_blacklist:compliance_blacklist(id, severity, reason, full_name, entity_name, email, phone, tax_id)'
      )
      .order('matched_at', { ascending: false })
      .limit(20),
    supabase
      .from('blacklist_matches')
      .select('id, blacklist_entry_id, matched_at')
      .order('matched_at', { ascending: false })
      .limit(500),
    selectedEntryId
      ? supabase
          .from('blacklist_matches')
          .select('id, match_type, match_confidence, matched_at')
          .eq('blacklist_entry_id', selectedEntryId)
          .order('matched_at', { ascending: false })
          .limit(50)
      : Promise.resolve({ data: [] }),
  ])

  const agents: AgentRow[] = agentsData ?? []
  const assignments: TaskRow[] = assignmentsData ?? []
  const blacklistEntries: BlacklistEntry[] = blacklistEntriesData ?? []
  const blacklistMatches: BlacklistMatch[] = blacklistMatchesData ?? []
  const allBlacklistMatches = blacklistAllMatchesData ?? []
  const selectedEntryMatches = selectedEntryMatchesData ?? []

  const tasksByAgent = assignments.reduce<Record<string, TaskRow[]>>((acc, task) => {
    if (!acc[task.agent_id]) acc[task.agent_id] = []
    acc[task.agent_id].push(task)
    return acc
  }, {})

  type SeverityKey = 'warning' | 'blocked' | 'banned'
  type BlacklistCounts = { total: number } & Record<SeverityKey, number>

  const blacklistCounts = blacklistEntries.reduce<BlacklistCounts>(
    (acc, entry) => {
      acc.total += 1
      const severity = entry.severity as SeverityKey | undefined
      if (severity && severity in acc) {
        acc[severity] += 1
      }
      return acc
    },
    { total: 0, warning: 0, blocked: 0, banned: 0 }
  )

  const matchCounts = allBlacklistMatches.reduce<Record<string, { count: number; lastMatched?: string }>>(
    (acc, match) => {
      if (!match.blacklist_entry_id) return acc
      if (!acc[match.blacklist_entry_id]) {
        acc[match.blacklist_entry_id] = { count: 0 }
      }
      acc[match.blacklist_entry_id].count += 1
      if (!acc[match.blacklist_entry_id].lastMatched) {
        acc[match.blacklist_entry_id].lastMatched = match.matched_at
      }
      return acc
    },
    {}
  )

  const query = typeof resolvedSearchParams.query === 'string' ? normalizeQuery(resolvedSearchParams.query) : ''
  const severityFilter = typeof resolvedSearchParams.severity === 'string' ? resolvedSearchParams.severity : 'all'
  const statusFilter = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : 'all'
  const baseParams = new URLSearchParams()
  if (query) baseParams.set('query', query)
  if (severityFilter !== 'all') baseParams.set('severity', severityFilter)
  if (statusFilter !== 'all') baseParams.set('status', statusFilter)
  const baseQueryString = baseParams.toString()
  const baseHref = baseQueryString ? `/versotech_admin/agents?${baseQueryString}` : '/versotech_admin/agents'
  const modalHref = `${baseHref}${baseQueryString ? '&' : '?'}mode=new`

  const filteredEntries = blacklistEntries.filter((entry) => {
    if (severityFilter !== 'all' && entry.severity !== severityFilter) return false
    if (statusFilter !== 'all' && entry.status !== statusFilter) return false
    if (!matchQuery(entry, query)) return false
    return true
  })

  const editEntry = editId ? blacklistEntries.find((entry) => entry.id === editId) : null
  const entryToShowMatches = selectedEntryId
    ? blacklistEntries.find((entry) => entry.id === selectedEntryId)
    : null
  const showModal = mode === 'new' || Boolean(editEntry)

  const createBlacklistEntry = async (formData: FormData) => {
    'use server'
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      redirect('/versotech_main/login')
    }
    const isAllowed = currentUser.role === 'ceo' || currentUser.permissions?.includes('super_admin')
    if (!isAllowed) {
      redirect('/versotech_admin/agents?error=Not%20authorized')
    }

    const readText = (key: string) => {
      const value = formData.get(key)
      if (typeof value !== 'string') return null
      const trimmed = value.trim()
      return trimmed.length ? trimmed : null
    }

    const severity = (readText('severity') || 'warning') as BlacklistEntry['severity']
    const status = (readText('status') || 'active') as BlacklistEntry['status']

    const { error } = await createServiceClient()
      .from('compliance_blacklist')
      .insert({
        full_name: readText('full_name'),
        entity_name: readText('entity_name'),
        email: readText('email'),
        phone: readText('phone'),
        tax_id: readText('tax_id'),
        reason: readText('reason'),
        notes: readText('notes'),
        severity,
        status,
        reported_by: currentUser.id,
      })

    if (error) {
      redirect(`/versotech_admin/agents?error=${encodeURIComponent('Failed to create blacklist entry')}`)
    }

    redirect('/versotech_admin/agents?success=Blacklist%20entry%20created')
  }

  const updateBlacklistEntry = async (formData: FormData) => {
    'use server'
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      redirect('/versotech_main/login')
    }
    const isAllowed = currentUser.role === 'ceo' || currentUser.permissions?.includes('super_admin')
    if (!isAllowed) {
      redirect('/versotech_admin/agents?error=Not%20authorized')
    }

    const entryId = formData.get('entry_id')
    if (typeof entryId !== 'string' || !entryId) {
      redirect('/versotech_admin/agents?error=Invalid%20entry')
    }

    const readText = (key: string) => {
      const value = formData.get(key)
      if (typeof value !== 'string') return null
      const trimmed = value.trim()
      return trimmed.length ? trimmed : null
    }

    const severity = (readText('severity') || 'warning') as BlacklistEntry['severity']
    const status = (readText('status') || 'active') as BlacklistEntry['status']

    const { error } = await createServiceClient()
      .from('compliance_blacklist')
      .update({
        full_name: readText('full_name'),
        entity_name: readText('entity_name'),
        email: readText('email'),
        phone: readText('phone'),
        tax_id: readText('tax_id'),
        reason: readText('reason'),
        notes: readText('notes'),
        severity,
        status,
        reviewed_by: currentUser.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', entryId)

    if (error) {
      redirect(`/versotech_admin/agents?error=${encodeURIComponent('Failed to update blacklist entry')}`)
    }

    redirect('/versotech_admin/agents?success=Blacklist%20entry%20updated')
  }

  return (
    <div className="p-6 space-y-8">
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="blacklist-modal-title"
            className="w-full max-w-3xl rounded-xl bg-background shadow-xl"
          >
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <div>
                <p id="blacklist-modal-title" className="text-base font-semibold">
                  {editEntry ? 'Edit Blacklist Entry' : 'Add to Blacklist'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {editEntry
                    ? 'Update severity, status, or details.'
                    : 'Create a new blacklist entry for compliance review.'}
                </p>
              </div>
              <a
                href={baseHref}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Close
              </a>
            </div>
            <div className="px-6 py-5">
              <form action={editEntry ? updateBlacklistEntry : createBlacklistEntry} className="grid gap-3 md:grid-cols-2">
                {editEntry && <input type="hidden" name="entry_id" value={editEntry.id} />}
                <div>
                  <label className="text-xs text-muted-foreground">Full name</label>
                  <input
                    name="full_name"
                    defaultValue={editEntry?.full_name || ''}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Entity name</label>
                  <input
                    name="entity_name"
                    defaultValue={editEntry?.entity_name || ''}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Email</label>
                  <input
                    name="email"
                    defaultValue={editEntry?.email || ''}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Phone</label>
                  <input
                    name="phone"
                    defaultValue={editEntry?.phone || ''}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Tax ID</label>
                  <input
                    name="tax_id"
                    defaultValue={editEntry?.tax_id || ''}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Severity</label>
                  <select
                    name="severity"
                    defaultValue={editEntry?.severity || 'warning'}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="warning">Warning</option>
                    <option value="blocked">Blocked</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Status</label>
                  <select
                    name="status"
                    defaultValue={editEntry?.status || 'active'}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="resolved">Resolved</option>
                    <option value="false_positive">False Positive</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Reason</label>
                  <input
                    name="reason"
                    defaultValue={editEntry?.reason || ''}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-muted-foreground">Notes</label>
                  <textarea
                    name="notes"
                    defaultValue={editEntry?.notes || ''}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  >
                    {editEntry ? 'Save changes' : 'Create entry'}
                  </button>
                  <a
                    href={baseHref}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Compliance Agents</h1>
        <p className="text-muted-foreground">
          Operational view of compliance agents, task coverage, and blacklist alerts.
        </p>
      </div>

      {agentsError && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader>
            <CardTitle>Unable to load agents</CardTitle>
            <CardDescription>{agentsError.message}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Bot className="h-4 w-4" />
          <span>Compliance Team</span>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {agents.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No agents found</CardTitle>
                <CardDescription>
                  Add entries to the agent registry to populate this section.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            agents.map((agent) => {
              const tasks = tasksByAgent[agent.id] ?? []
              const initials = getInitials(agent.name || 'Agent')
              return (
                <Card key={agent.id} className="border-muted/60">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          {agent.avatar_url ? (
                            <img
                              src={agent.avatar_url}
                              alt={agent.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-muted-foreground">
                              {initials || <UserCircle2 className="h-6 w-6" />}
                            </span>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{agent.name}</CardTitle>
                          <CardDescription>{agent.role}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={agent.is_active ? 'default' : 'secondary'}>
                        {agent.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Email identity</span>
                        <span className="font-medium text-foreground">
                          {agent.email_identity || '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Tasks assigned</span>
                        <span className="font-medium text-foreground">{tasks.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Created</span>
                        <span className="font-medium text-foreground">
                          {formatDate(agent.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {tasks.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No tasks assigned yet.</p>
                      ) : (
                        tasks.map((task) => (
                          <div key={task.task_code} className="flex items-center gap-2 text-xs">
                            <Badge variant={task.is_active ? 'secondary' : 'outline'}>
                              {task.task_code}
                            </Badge>
                            <span className="text-muted-foreground">{task.task_name}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldAlert className="h-4 w-4" />
          <span>Blacklist Alerts</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Blacklist Overview</CardTitle>
              <CardDescription>
                Automatic screening is on. Matches are logged here (no auto-blocking).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active entries</span>
                <span className="font-semibold">{blacklistCounts.total}</span>
              </div>
              <div className="space-y-2 text-sm">
                {(['warning', 'blocked', 'banned'] as const).map((severity) => (
                  <div key={severity} className="flex items-center justify-between">
                    <span className={cn('px-2 py-0.5 rounded-md text-xs font-medium', severityStyles[severity])}>
                      {severity}
                    </span>
                    <span className="font-medium">{blacklistCounts[severity]}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                <span>Blocking is disabled. Alerts are for review.</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Matches</CardTitle>
              <CardDescription>Last 20 blacklist matches recorded.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {blacklistMatches.length === 0 ? (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  No matches logged yet.
                </div>
              ) : (
                blacklistMatches.map((match) => {
                  const entry = unwrapEntry(match.compliance_blacklist)
                  const severity = entry?.severity || 'warning'
                  const displayName =
                    entry?.full_name ||
                    entry?.entity_name ||
                    entry?.email ||
                    entry?.phone ||
                    entry?.tax_id ||
                    'Unknown'
                  const confidenceLabel = formatConfidence(match.match_confidence)
                  return (
                    <div key={match.id} className="rounded-lg border border-muted/60 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={cn('px-2 py-0.5 rounded-md text-xs font-medium', severityStyles[severity as BlacklistEntry['severity']])}>
                              {severity}
                            </span>
                            <span className="text-sm font-medium">{displayName}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {matchTypeLabels[match.match_type] || match.match_type}
                            {confidenceLabel ? ` • ${confidenceLabel}` : ''}
                          </p>
                          {entry?.reason && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Reason: {entry.reason}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(match.matched_at)}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Blacklist Entries</CardTitle>
            <CardDescription>
              Review active and resolved blacklist entries. Filters work across severity, status, and search.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(errorMessage || successMessage) && (
              <div
                className={cn(
                  'rounded-lg border px-4 py-3 text-sm',
                  errorMessage ? 'border-destructive/40 bg-destructive/5 text-destructive' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700'
                )}
              >
                {errorMessage || successMessage}
              </div>
            )}

            <form className="grid gap-3 lg:grid-cols-[1.2fr_0.6fr_0.6fr_auto]">
              <div>
                <label className="text-xs text-muted-foreground">Search</label>
                <input
                  type="text"
                  name="query"
                  defaultValue={query}
                  placeholder="Name, email, phone, tax id..."
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Severity</label>
                <select
                  name="severity"
                  defaultValue={severityFilter}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All</option>
                  <option value="warning">Warning</option>
                  <option value="blocked">Blocked</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Status</label>
                <select
                  name="status"
                  defaultValue={statusFilter}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="resolved">Resolved</option>
                  <option value="false_positive">False Positive</option>
                </select>
              </div>
              <div className="flex items-end">
                <div className="flex w-full gap-2">
                  <button
                    type="submit"
                    className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  >
                    Apply Filters
                  </button>
                  <a
                    href={modalHref}
                    className="w-full rounded-md border border-input px-4 py-2 text-center text-sm font-medium"
                  >
                    Add to Blacklist
                  </a>
                </div>
              </div>
            </form>

            {filteredEntries.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No blacklist entries match your filters.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEntries.map((entry) => {
                  const displayName =
                    entry.full_name ||
                    entry.entity_name ||
                    entry.email ||
                    entry.phone ||
                    entry.tax_id ||
                    'Unknown'
                  const matchInfo = matchCounts[entry.id]
                  return (
                    <div key={entry.id} className="rounded-lg border border-muted/60 p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn('px-2 py-0.5 rounded-md text-xs font-medium', severityStyles[entry.severity])}>
                              {entry.severity}
                            </span>
                            <Badge variant="outline" className="text-xs capitalize">
                              {entry.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm font-semibold">{displayName}</span>
                          </div>
                          {entry.reason && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Reason: {entry.reason}
                            </p>
                          )}
                          <div className="text-xs text-muted-foreground mt-2 space-y-1">
                            <div>Email: {entry.email || '—'}</div>
                            <div>Phone: {entry.phone || '—'}</div>
                            <div>Tax ID: {entry.tax_id || '—'}</div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>
                            Matches logged: <span className="font-medium text-foreground">{matchInfo?.count ?? 0}</span>
                          </div>
                          <div>Last match: {matchInfo?.lastMatched ? formatDate(matchInfo.lastMatched) : '—'}</div>
                          <div>Reported: {entry.reported_at ? formatDate(entry.reported_at) : '—'}</div>
                          <div className="flex flex-wrap gap-2 pt-2">
                            <a
                              href={`${baseHref}${baseQueryString ? '&' : '?'}edit=${entry.id}`}
                              className="rounded-md border border-input px-2 py-1 text-xs font-medium"
                            >
                              Edit
                            </a>
                            <a
                              href={`${baseHref}${baseQueryString ? '&' : '?'}entry=${entry.id}`}
                              className="rounded-md border border-input px-2 py-1 text-xs font-medium"
                            >
                              View matches
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {entryToShowMatches && (
              <div className="rounded-lg border border-muted/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">Match history</p>
                      <p className="text-xs text-muted-foreground">
                      {entryToShowMatches.full_name ||
                        entryToShowMatches.entity_name ||
                        entryToShowMatches.email ||
                        entryToShowMatches.phone ||
                        entryToShowMatches.tax_id ||
                        'Unknown'}
                    </p>
                  </div>
                  <a
                    href={baseHref}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </a>
                </div>
                <div className="mt-3 space-y-2">
                  {selectedEntryMatches.length === 0 ? (
                    <div className="text-xs text-muted-foreground">No matches logged for this entry.</div>
                  ) : (
                    selectedEntryMatches.map((match) => (
                      <div key={match.id} className="rounded-md border border-muted/60 p-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span>{matchTypeLabels[match.match_type] || match.match_type}</span>
                          <span className="text-muted-foreground">{formatDate(match.matched_at)}</span>
                        </div>
                        <div className="text-muted-foreground mt-1">
                          Confidence: {formatConfidence(match.match_confidence) || '—'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
