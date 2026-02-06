'use client'

import { useState } from 'react'
import { ProcessCategoryCard } from './process-category-card'
import { ProcessDrawer } from './process-drawer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  getWorkflowsByCategory, 
  categoryMetadata, 
  WorkflowDefinition,
  processWorkflows 
} from '@/lib/workflows'
import { Zap, TrendingUp } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface ProcessCenterClientProps {
  profile: {
    display_name: string
    role: string
    title?: string | null
  }
}

export function ProcessCenterClient({ profile }: ProcessCenterClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition | null>(null)
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false)
  const [workflowDrawerOpen, setWorkflowDrawerOpen] = useState(false)

  const workflowsByCategory = getWorkflowsByCategory()

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
    setCategoryDrawerOpen(true)
  }

  const handleWorkflowClick = (workflow: WorkflowDefinition) => {
    setSelectedWorkflow(workflow)
    setCategoryDrawerOpen(false)
    setWorkflowDrawerOpen(true)
  }

  const handleCategoryDrawerClose = () => {
    setCategoryDrawerOpen(false)
    setSelectedCategory(null)
  }

  const handleWorkflowDrawerClose = () => {
    setWorkflowDrawerOpen(false)
    setSelectedWorkflow(null)
  }

  const getCategoryWorkflows = (category: string) => {
    return processWorkflows.filter(w => w.category === category)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-white/20 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Process Center</h1>
            <p className="text-lg text-gray-300 mt-1">
              Workflow automation for V E R S O operations
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-300">Staff: {profile.display_name}</p>
            <p className="text-xs text-gray-400">
              {profile.role.replace('staff_', '').toUpperCase()} 
              {profile.title && ` • ${profile.title}`}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-white/20 bg-zinc-900/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Zap className="h-4 w-4 text-white" />
              Total Processes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{processWorkflows.length}</div>
            <p className="text-xs text-gray-400 mt-1">Available workflows</p>
          </CardContent>
        </Card>

        <Card className="border-white/20 bg-zinc-900/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-white" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {Object.keys(categoryMetadata).length}
            </div>
            <p className="text-xs text-gray-400 mt-1">Process categories</p>
          </CardContent>
        </Card>

        <Card className="border-white/20 bg-zinc-900/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-300">Your Access</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-green-500/30 text-green-300 border-green-500/40">
              {profile.role.replace('staff_', '').toUpperCase()}
            </Badge>
            <p className="text-xs text-gray-400 mt-2">
              {processWorkflows.filter(w => !w.requiredRole || w.requiredRole === profile.role).length} accessible
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Cards Grid */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Process Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(categoryMetadata).map(([key, meta]) => (
            <ProcessCategoryCard
              key={key}
              category={key as any}
              title={meta.title}
              description={meta.description}
              processCount={workflowsByCategory[key as keyof typeof workflowsByCategory]?.length || 0}
              gradient={meta.gradient}
              onClick={() => handleCategoryClick(key)}
            />
          ))}
        </div>
      </div>

      {/* Getting Started Card */}
      <Card className="border-white/20 bg-gradient-to-br from-sky-500/20 to-blue-500/20">
        <CardHeader>
          <CardTitle className="text-white">Getting Started</CardTitle>
          <CardDescription className="text-gray-300">Learn how to use the Process Center</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-sky-300 mt-0.5">•</span>
              <span>Click on any category card to view available processes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-300 mt-0.5">•</span>
              <span>Select a process to configure and trigger workflows</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-300 mt-0.5">•</span>
              <span>View execution history and schedule recurring processes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-300 mt-0.5">•</span>
              <span>Processes connect to n8n webhooks for automation</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Category Drawer - Shows processes in selected category */}
      <Sheet open={categoryDrawerOpen} onOpenChange={(open) => !open && handleCategoryDrawerClose()}>
        <SheetContent className="w-full sm:max-w-lg bg-zinc-950 border-white/20">
          {selectedCategory && (
            <>
              <SheetHeader>
                <SheetTitle className="text-white text-xl">
                  {categoryMetadata[selectedCategory as keyof typeof categoryMetadata]?.title}
                </SheetTitle>
                <SheetDescription className="text-gray-300">
                  {categoryMetadata[selectedCategory as keyof typeof categoryMetadata]?.description}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-3">
                {getCategoryWorkflows(selectedCategory).map((workflow) => (
                  <Card
                    key={workflow.key}
                    className="cursor-pointer transition-all border-white/20 bg-zinc-900/80 hover:bg-zinc-800/80 hover:border-white/40"
                    onClick={() => handleWorkflowClick(workflow)}
                  >
                    <CardHeader>
                      <CardTitle className="text-white text-base flex items-center justify-between">
                        {workflow.title}
                        <Badge 
                          variant="outline" 
                          className={
                            workflow.triggerType === 'manual' 
                              ? 'border-sky-500/40 text-sky-300 bg-sky-500/20'
                              : workflow.triggerType === 'scheduled'
                              ? 'border-purple-500/40 text-purple-300 bg-purple-500/20'
                              : 'border-green-500/40 text-green-300 bg-green-500/20'
                          }
                        >
                          {workflow.triggerType === 'both' ? 'Manual/Scheduled' : workflow.triggerType}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-gray-400 text-sm">
                        {workflow.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Process Drawer - Shows selected workflow configuration */}
      <ProcessDrawer
        workflow={selectedWorkflow}
        open={workflowDrawerOpen}
        onClose={handleWorkflowDrawerClose}
      />
    </div>
  )
}

