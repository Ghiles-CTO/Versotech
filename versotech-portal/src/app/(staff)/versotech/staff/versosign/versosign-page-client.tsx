'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSignature,
  ExternalLink,
  Users,
  Mail,
  Calendar,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react'
import { format } from 'date-fns'
import { SignatureCanvasWidget } from '@/components/signature/signature-canvas-widget'
import { InlinePdfViewer } from '@/components/signature/inline-pdf-viewer'
import type { SignatureGroup, ExpiredSignature } from './page'
import type { SignatureTask } from './page'

interface SignatureRequestPublicView {
  signing_token: string
  signer_name: string
  signer_email: string
  document_type: string
  unsigned_pdf_url?: string
  google_drive_url?: string
  token_expires_at: string
  status: string
}

interface VersoSignPageClientProps {
  userId: string
  signatureGroups: SignatureGroup[]
  stats: {
    pending: number
    in_progress: number
    completed_today: number
    overdue: number
    expired: number
  }
}

export function VersoSignPageClient({
  userId,
  signatureGroups,
  stats
}: VersoSignPageClientProps) {
  const router = useRouter()
  // Default to NDA tab if there are NDA tasks, otherwise countersignatures
  const hasNdaTasks = (signatureGroups.find(g => g.category === 'nda_signatures')?.tasks.length || 0) > 0
  const [selectedTab, setSelectedTab] = useState(hasNdaTasks ? 'nda_signatures' : 'countersignatures')
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null)
  const [signingMode, setSigningMode] = useState<{
    active: boolean
    task: SignatureTask | null
    signatureRequest: SignatureRequestPublicView | null
    token: string | null
  }>({ active: false, task: null, signatureRequest: null, token: null })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Extract token from signing URL
  // Supports both old format (/sign/TOKEN) and new format (?token=TOKEN)
  const extractTokenFromUrl = (url: string): string | null => {
    // Try new format first: ?token=TOKEN or &token=TOKEN
    const queryMatch = url.match(/[?&]token=([^&]+)/)
    if (queryMatch) return queryMatch[1]

    // Fall back to old format: /sign/TOKEN
    const pathMatch = url.match(/\/sign\/([^\/\?]+)/)
    return pathMatch ? pathMatch[1] : null
  }

  const handleSignDocument = async (task: SignatureTask) => {
    if (!task.instructions?.action_url) {
      setError('No signature URL available')
      return
    }

    const token = extractTokenFromUrl(task.instructions.action_url)
    if (!token) {
      setError('Invalid signature URL')
      return
    }

    setLoadingTaskId(task.id)
    setError(null)

    try {
      // Fetch signature request details
      const response = await fetch(`/api/signature/${token}`)
      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 410) {
          throw new Error('This signature request has expired. Please check the "Expired" tab or resend the signature request.')
        } else if (response.status === 400) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'This signature request is no longer valid.')
        } else if (response.status === 404) {
          throw new Error('Signature request not found. It may have been deleted or never created.')
        }
        throw new Error('Failed to fetch signature request')
      }

      const signatureRequest = await response.json()

      // Enter signing mode with token
      setSigningMode({
        active: true,
        task,
        signatureRequest,
        token
      })

      // Mark task as in progress
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: task.id,
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Error entering signing mode:', error)
      setError(error instanceof Error ? error.message : 'Failed to load signature request')
    } finally {
      setLoadingTaskId(null)
    }
  }

  const handleExitSigningMode = () => {
    setSigningMode({ active: false, task: null, signatureRequest: null, token: null })
    setError(null)
  }

  const handleSignatureSubmit = async (signatureDataUrl: string) => {
    if (!signingMode.signatureRequest || !signingMode.token) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/signature/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: signingMode.token,
          signature_data_url: signatureDataUrl
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit signature')
      }

      // Exit signing mode
      handleExitSigningMode()

      // Refresh the page to update task list
      router.refresh()
    } catch (error) {
      console.error('Error submitting signature:', error)
      setError(error instanceof Error ? error.message : 'Failed to submit signature')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Real-time task updates
  useEffect(() => {
    const supabase = createClient()

    const subscription = supabase
      .channel('versosign_tasks')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks',
          filter: `owner_user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Task updated:', payload)
          router.refresh()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tasks',
          filter: `owner_user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New task created:', payload)
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId, router])

  const handleManualFollowUp = async (task: SignatureTask) => {
    const message = `
Investor: ${task.metadata?.investor_name || 'Unknown'}
Email: ${task.instructions?.investor_email || 'Not available'}
Signature URL: ${task.instructions?.action_url || 'Not available'}

Action Required: ${task.instructions?.action_required || 'Send signature link to investor'}
    `

    // Copy to clipboard
    await navigator.clipboard.writeText(message)
    alert('Follow-up details copied to clipboard!')

    // Mark as in progress
    setLoadingTaskId(task.id)
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: task.id,
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
      })

      if (!response.ok) {
        console.error('Failed to update task status')
      }
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setLoadingTaskId(null)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />
      case 'overdue': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <AlertCircle className="h-4 w-4 text-yellow-600" />
    }
  }

  // INLINE SIGNING MODE
  if (signingMode.active && signingMode.task && signingMode.signatureRequest) {
    const pdfUrl = signingMode.signatureRequest.unsigned_pdf_url || signingMode.signatureRequest.google_drive_url

    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleExitSigningMode}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Button>
          <h1 className="text-2xl font-bold text-foreground mb-2">{signingMode.task.title}</h1>
          <p className="text-muted-foreground">{signingMode.task.description}</p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-900">Error</AlertTitle>
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pdfUrl && (
            <InlinePdfViewer
              pdfUrl={pdfUrl}
              documentName={signingMode.task.title}
            />
          )}
          <SignatureCanvasWidget
            onSignatureCapture={handleSignatureSubmit}
            signerName={signingMode.signatureRequest.signer_name}
            signerEmail={signingMode.signatureRequest.signer_email}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    )
  }

  // TASK LIST VIEW
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">VersoSign</h1>
        <p className="text-muted-foreground">
          Document signature management and countersigning
        </p>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-900">Error</AlertTitle>
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Signatures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            {stats.pending > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting action
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.in_progress}</div>
            {stats.in_progress > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Currently signing
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.completed_today}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Signed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.overdue}
            </div>
            {stats.overdue > 0 && (
              <p className="text-xs text-red-600 mt-1">
                Need immediate attention
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alert for Overdue Tasks */}
      {stats.overdue > 0 && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-900">Overdue Signatures</AlertTitle>
          <AlertDescription className="text-red-700">
            You have {stats.overdue} overdue signature{stats.overdue !== 1 ? 's' : ''} requiring immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs for different signature categories */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          {/* NDA Signatures Tab - only show if there are NDA tasks */}
          {(signatureGroups.find(g => g.category === 'nda_signatures')?.tasks.length || 0) > 0 && (
            <TabsTrigger value="nda_signatures">
              <FileSignature className="h-4 w-4 mr-2" />
              NDA Signing
              <Badge className="ml-2" variant="default">
                {signatureGroups.find(g => g.category === 'nda_signatures')?.tasks.length || 0}
              </Badge>
            </TabsTrigger>
          )}
          <TabsTrigger value="countersignatures">
            <FileSignature className="h-4 w-4 mr-2" />
            Countersignatures
            {(signatureGroups.find(g => g.category === 'countersignatures')?.tasks.length || 0) > 0 && (
              <Badge className="ml-2" variant="secondary">
                {signatureGroups.find(g => g.category === 'countersignatures')?.tasks.length || 0}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="follow_ups">
            <Users className="h-4 w-4 mr-2" />
            Manual Follow-ups
            {(signatureGroups.find(g => g.category === 'follow_ups')?.tasks.length || 0) > 0 && (
              <Badge className="ml-2" variant="secondary">
                {signatureGroups.find(g => g.category === 'follow_ups')?.tasks.length || 0}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="other">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Completed
          </TabsTrigger>
          <TabsTrigger value="expired">
            <AlertCircle className="h-4 w-4 mr-2" />
            Expired
            {stats.expired > 0 && (
              <Badge className="ml-2" variant="destructive">
                {stats.expired}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {signatureGroups.map(group => (
          <TabsContent key={group.category} value={group.category}>
            <Card>
              <CardHeader>
                <CardTitle>{group.title}</CardTitle>
                <CardDescription>{group.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Handle expired signatures tab */}
                {group.category === 'expired' ? (
                  ((group.expiredSignatures?.length || 0) === 0 && (group.tasks?.length || 0) === 0) ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No expired signatures
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Show expired tasks (tasks with expired signature requests) */}
                      {group.tasks?.map(task => (
                        <div
                          key={task.id}
                          className="border border-red-200 rounded-lg p-4 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <h4 className="font-semibold text-foreground">{task.title}</h4>
                                <Badge variant="destructive">Expired</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                {task.description || 'The signature request for this task has expired.'}
                              </p>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                {task.instructions?.investor_name && (
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {task.instructions.investor_name}
                                  </span>
                                )}
                                {task.instructions?.investor_email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {task.instructions.investor_email}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Created {format(new Date(task.created_at), 'MMM d, yyyy')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {/* Show expired signature requests */}
                      {group.expiredSignatures?.map(sig => (
                        <div
                          key={sig.id}
                          className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <h4 className="font-semibold">{sig.document_type.toUpperCase()}</h4>
                                <Badge variant="destructive">Expired</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                Request for {sig.signer_name} expired on {format(new Date(sig.token_expires_at), 'MMM d, yyyy')}
                              </p>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {sig.investor?.display_name || sig.investor?.legal_name || sig.signer_name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {sig.signer_email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Created {format(new Date(sig.created_at), 'MMM d, yyyy')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : group.tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No tasks in this category
                  </div>
                ) : (
                  <div className="space-y-4">
                    {group.tasks.map(task => (
                      <div
                        key={task.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(
                                task.due_at && new Date(task.due_at) < new Date() && task.status === 'pending'
                                  ? 'overdue'
                                  : task.status
                              )}
                              <h4 className="font-semibold">{task.title}</h4>
                              <Badge
                                variant="outline"
                                className={getPriorityColor(task.priority)}
                              >
                                {task.priority}
                              </Badge>
                              {/* Show signer role if available */}
                              {task.instructions?.signer_role && (
                                <Badge variant="secondary" className="text-xs">
                                  Signing as: {task.instructions.signer_role.toUpperCase()}
                                </Badge>
                              )}
                              {/* Indicate if waiting for prior signature */}
                              {task.instructions?.requires_prior_signature && (
                                <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                                  Awaiting prior signature
                                </Badge>
                              )}
                            </div>

                            {task.description && (
                              <p className="text-sm text-muted-foreground mb-3">
                                {task.description}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              {task.instructions?.investor_name && (
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {task.instructions.investor_name}
                                </span>
                              )}
                              {task.due_at && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Due {format(new Date(task.due_at), 'MMM d, yyyy')}
                                </span>
                              )}
                              {task.instructions?.investor_email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {task.instructions.investor_email}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {(task.status === 'pending' || task.status === 'in_progress') && (
                              <>
                                {(task.kind === 'countersignature' || task.kind === 'deal_nda_signature') && task.instructions?.action_url && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleSignDocument(task)}
                                    disabled={loadingTaskId === task.id}
                                  >
                                    <FileSignature className="h-4 w-4 mr-2" />
                                    {loadingTaskId === task.id ? 'Loading...' : (task.kind === 'deal_nda_signature' ? 'Sign NDA' : 'Sign Document')}
                                  </Button>
                                )}
                                {task.metadata?.issue === 'investor_no_user_account' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleManualFollowUp(task)}
                                    disabled={loadingTaskId === task.id}
                                  >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Copy Details
                                  </Button>
                                )}
                              </>
                            )}
                            {task.status === 'completed' && task.completed_at && (
                              <Badge variant="outline" className="text-green-600">
                                Completed {format(new Date(task.completed_at), 'MMM d')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}