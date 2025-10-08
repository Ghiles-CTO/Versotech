'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Shield, 
  MessageSquare, 
  Target, 
  Users,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProcessCategoryCardProps {
  category: 'documents' | 'compliance' | 'communications' | 'data_processing' | 'multi_step'
  title: string
  description: string
  processCount: number
  gradient: string
  onClick: () => void
}

const iconMap = {
  documents: FileText,
  compliance: Shield,
  communications: MessageSquare,
  data_processing: Target,
  multi_step: Users
}

export function ProcessCategoryCard({
  category,
  title,
  description,
  processCount,
  gradient,
  onClick
}: ProcessCategoryCardProps) {
  const Icon = iconMap[category]

  return (
    <Card
      className={cn(
        "relative overflow-hidden cursor-pointer transition-all duration-300",
        "border-white/20 bg-zinc-900/80 backdrop-blur-sm",
        "hover:bg-zinc-800/80 hover:border-white/40 hover:shadow-lg hover:shadow-white/10",
        "group"
      )}
      onClick={onClick}
    >
      {/* Gradient overlay */}
      <div className={cn(
        "absolute inset-0 opacity-20 bg-gradient-to-br",
        gradient,
        "group-hover:opacity-30 transition-opacity"
      )} />

      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20 border border-white/30 group-hover:border-white/40 transition-colors">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-white group-hover:text-white transition-colors">
                {title}
              </CardTitle>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>
        <CardDescription className="mt-2 text-gray-300">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="relative">
        <div className="flex items-center justify-between">
          <Badge 
            variant="secondary" 
            className="bg-white/20 text-white border-white/30 hover:bg-white/30"
          >
            {processCount} {processCount === 1 ? 'Process' : 'Processes'}
          </Badge>
          <span className="text-xs text-gray-300 group-hover:text-white transition-colors">
            Click to view →
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

