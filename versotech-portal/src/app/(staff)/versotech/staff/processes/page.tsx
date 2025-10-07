import { AppLayout } from '@/components/layout/app-layout'
import { ProcessTrigger } from '@/components/staff/process-trigger'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Workflow } from 'lucide-react'
import { requireStaffAuth } from '@/lib/auth'
import { processWorkflows } from '@/lib/workflows'

export default async function ProcessesPage() {
  const profile = await requireStaffAuth()

  return (
    <AppLayout brand="versotech">
      <div className="p-6 space-y-6">
        
        {/* Header */}
        <div className="border-b border-gray-800 pb-6">
          <div className="flex items-center justify-between">
        <div>
              <h1 className="text-3xl font-bold text-foreground">Process Center</h1>
              <p className="text-lg text-muted-foreground mt-1">
                n8n workflow automation for VERSO Holdings operations
          </p>
        </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Staff: {profile.display_name}</p>
              <p className="text-xs text-muted-foreground">{profile.role} • {profile.title}</p>
              </div>
              </div>
        </div>

        {/* Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {processWorkflows.map((workflow) => (
            <ProcessTrigger
              key={workflow.key}
              workflowKey={workflow.key}
              title={workflow.title}
              description={workflow.description}
              iconName={workflow.icon}
              schema={workflow.inputSchema}
              requiredRole={workflow.requiredRole}
              requiredTitles={workflow.requiredTitles}
              category={workflow.category}
            />
          ))}
        </div>

        {/* Workflow Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              Active Workflows Status
            </CardTitle>
            <CardDescription>
              Real-time status of recent n8n workflow executions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Connect to your n8n instance to see real-time workflow status here.
              <br />
              Configure webhooks to receive completion notifications and track execution history.
            </div>
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  )
}