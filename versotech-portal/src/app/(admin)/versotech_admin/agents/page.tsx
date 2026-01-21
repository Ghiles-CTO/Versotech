'use client'

import Link from 'next/link'
import {
  Bot,
  FileSearch,
  Target,
  AlertTriangle,
  FileBarChart,
  Mail,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface AgentCard {
  title: string
  description: string
  icon: LucideIcon
  status: 'planned' | 'in-development' | 'beta'
}

const agentCards: AgentCard[] = [
  {
    title: 'KYC Review Bot',
    description: 'Automatically verify identity documents and flag anomalies for review. Reduce manual review time by up to 80%.',
    icon: FileSearch,
    status: 'planned',
  },
  {
    title: 'Deal Matching',
    description: 'AI-powered matching of investors to deals based on preferences, investment history, and risk profile.',
    icon: Target,
    status: 'planned',
  },
  {
    title: 'Risk Alerts',
    description: 'Real-time monitoring of portfolio risk indicators with intelligent alerting and recommendation engine.',
    icon: AlertTriangle,
    status: 'planned',
  },
  {
    title: 'Report Generator',
    description: 'Generate customized investor reports, compliance documents, and analytics summaries on demand.',
    icon: FileBarChart,
    status: 'planned',
  },
]

const statusBadgeVariant: Record<AgentCard['status'], 'secondary' | 'outline' | 'default'> = {
  'planned': 'secondary',
  'in-development': 'outline',
  'beta': 'default',
}

const statusLabels: Record<AgentCard['status'], string> = {
  'planned': 'Planned',
  'in-development': 'In Development',
  'beta': 'Beta',
}

export default function AgentsPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center px-4 py-12">
      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
          <Bot className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">
          AI-Powered Automation
        </h1>
        <p className="text-lg text-muted-foreground">
          Coming Soon
        </p>
        <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
          We&apos;re building intelligent automation tools to streamline your operations,
          reduce manual work, and provide deeper insights into your platform.
        </p>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full mb-12">
        {agentCards.map((agent) => {
          const Icon = agent.icon
          return (
            <Card key={agent.title} className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{agent.title}</CardTitle>
                  </div>
                  <Badge variant={statusBadgeVariant[agent.status]}>
                    {statusLabels[agent.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {agent.description}
                </CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Contact Link */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-3">
          Have a feature request or want early access?
        </p>
        <Button variant="outline" asChild>
          <Link href="mailto:product@verso.holdings?subject=AI%20Agents%20Feature%20Request">
            <Mail className="h-4 w-4 mr-2" />
            Contact Product Team
          </Link>
        </Button>
      </div>
    </div>
  )
}
